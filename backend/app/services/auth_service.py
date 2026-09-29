from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.rbac import ROLE_CANDIDATE
from app.core.security import create_access_token, hash_password, utcnow, verify_password
from app.models.users import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthTokenResponse, LoginRequest, RegisterRequest
from app.schemas.users import UserRead
from app.services.audit_service import AuditService


def serialize_user(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        name=user.full_name,
        role=user.role.name,
        company_id=user.company_id,
        is_active=user.is_active,
        created_at=user.created_at,
    )


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    def _token_response(self, user: User) -> AuthTokenResponse:
        token, expires_at, _jti = create_access_token(
            subject=user.id,
            role=user.role.name,
            email=user.email,
        )
        expires_in = max(0, int((expires_at - utcnow()).total_seconds()))
        return AuthTokenResponse(
            access_token=token,
            expires_in=expires_in,
            user=serialize_user(user),
        )

    def register_candidate(
        self,
        payload: RegisterRequest,
        *,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> AuthTokenResponse:
        roles = self.users.ensure_default_roles()
        email = payload.email.lower()

        if self.users.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )

        try:
            user = self.users.create_user(
                email=email,
                full_name=payload.name.strip(),
                password_hash=hash_password(payload.password),
                role=roles[ROLE_CANDIDATE],
                phone=payload.phone.strip() if payload.phone else None,
            )
            self.users.create_candidate_profile(user=user)
            self.audit.log(
                action="auth.registered",
                entity_type="user",
                entity_id=user.id,
                actor_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                event_data={"role": ROLE_CANDIDATE},
            )
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            ) from exc

        self.db.refresh(user)
        return self._token_response(user)

    def login(
        self,
        payload: LoginRequest,
        *,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> AuthTokenResponse:
        user = self.users.get_by_email(payload.email.lower())

        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is not active.",
            )

        self.users.set_last_login(user, utcnow())
        self.audit.log(
            action="auth.login",
            entity_type="user",
            entity_id=user.id,
            actor_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.commit()
        self.db.refresh(user)
        return self._token_response(user)

    def logout(
        self,
        *,
        user: User,
        jti: str,
        expires_at: datetime,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        self.users.revoke_token(jti=jti, user_id=user.id, expires_at=expires_at)
        self.audit.log(
            action="auth.logout",
            entity_type="user",
            entity_id=user.id,
            actor_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.commit()
