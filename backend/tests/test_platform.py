from fastapi.testclient import TestClient


def test_authenticated_candidate_can_load_persistent_platform_state(client: TestClient) -> None:
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Platform Candidate",
            "email": "platform@example.com",
            "password": "PlatformPass123!",
        },
    )
    assert registration.status_code == 201

    response = client.get(
        "/api/v1/platform/state",
        headers={"Authorization": f"Bearer {registration.json()['access_token']}"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["currentUser"]["email"] == "platform@example.com"
    assert payload["users"]
    assert payload["jobs"] == []
    assert payload["applications"] == []

    update = client.patch(
        "/api/v1/platform/users/me",
        headers={"Authorization": f"Bearer {registration.json()['access_token']}"},
        json={
            "location": "Chennai",
            "experience_years": 4,
            "skills": ["Python", "FastAPI"],
            "education": "B.Tech",
            "portfolio_url": "https://portfolio.example.com",
        },
    )
    assert update.status_code == 200
    assert update.json()["location"] == "Chennai"
    assert set(update.json()["skills"]) == {"Python", "FastAPI"}
    assert update.json()["education"] == "B.Tech"
