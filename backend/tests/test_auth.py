from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.rbac import ROLE_ADMIN
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository


def strong_password() -> str:
    return "HiringPass123!"


def register_candidate(client: TestClient, email: str = "candidate@example.com") -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Synthetic Candidate",
            "email": email,
            "password": strong_password(),
            "phone": "+1 555 010 0200",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_candidate_registration_hashes_password_and_returns_token(
    client: TestClient,
    db_session: Session,
) -> None:
    payload = register_candidate(client)

    assert payload["access_token"]
    assert payload["token_type"] == "bearer"
    assert payload["user"]["role"] == "candidate"
    assert "password" not in payload["user"]

    user = UserRepository(db_session).get_by_email("candidate@example.com")
    assert user is not None
    assert user.password_hash != strong_password()
    assert user.candidate_profile is not None


def test_duplicate_registration_is_rejected(client: TestClient) -> None:
    register_candidate(client)

    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate Candidate",
            "email": "candidate@example.com",
            "password": strong_password(),
        },
    )

    assert response.status_code == 409


def test_weak_password_is_rejected(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Weak Candidate",
            "email": "weak@example.com",
            "password": "password",
        },
    )

    assert response.status_code == 422


def test_login_and_current_user(client: TestClient) -> None:
    register_candidate(client)

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "candidate@example.com", "password": strong_password()},
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "candidate@example.com"


def test_invalid_login_is_unauthorized(client: TestClient) -> None:
    register_candidate(client)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "candidate@example.com", "password": "WrongPass123!"},
    )

    assert response.status_code == 401


def test_logout_revokes_token(client: TestClient) -> None:
    payload = register_candidate(client)
    token = payload["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    logout_response = client.post("/api/v1/auth/logout", headers=headers)
    assert logout_response.status_code == 200

    me_response = client.get("/api/v1/users/me", headers=headers)
    assert me_response.status_code == 401


def test_candidate_cannot_list_users(client: TestClient) -> None:
    payload = register_candidate(client)
    token = payload["access_token"]

    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


def test_admin_can_list_users(
    client: TestClient,
    db_session: Session,
) -> None:
    repository = UserRepository(db_session)
    roles = repository.ensure_default_roles()
    repository.create_user(
        email="admin@example.com",
        full_name="Synthetic Admin",
        password_hash=hash_password("AdminPass123!"),
        role=roles[ROLE_ADMIN],
    )
    db_session.commit()

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "AdminPass123!"},
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()[0]["email"] == "admin@example.com"
