from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.rbac import SYSTEM_ROLES
from app.models.auth_tokens import TokenRevocation
from app.models.candidates import Candidate
from app.models.roles import Role
from app.models.users import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def ensure_default_roles(self) -> dict[str, Role]:
        existing_roles = {
            role.name: role
            for role in self.db.scalars(select(Role).where(Role.name.in_(SYSTEM_ROLES))).all()
        }

        for role_name in SYSTEM_ROLES:
            if role_name not in existing_roles:
                role = Role(name=role_name, description=f"System role: {role_name}")
                self.db.add(role)
                self.db.flush()
                existing_roles[role_name] = role

        return existing_roles

    def get_by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email.lower()))

    def get_by_id(self, user_id: str) -> User | None:
        return self.db.get(User, user_id)

    def list_users(self) -> list[User]:
        statement = select(User).where(User.deleted_at.is_(None)).order_by(User.created_at.desc())
        return list(self.db.scalars(statement).all())

    def create_user(
        self,
        *,
        email: str,
        full_name: str,
        password_hash: str,
        role: Role,
        phone: str | None = None,
        company_id: str | None = None,
    ) -> User:
        user = User(
            email=email.lower(),
            full_name=full_name,
            password_hash=password_hash,
            phone=phone,
            role_id=role.id,
            company_id=company_id,
        )
        self.db.add(user)
        self.db.flush()
        return user

    def create_candidate_profile(self, *, user: User) -> Candidate:
        candidate = Candidate(
            user_id=user.id,
            company_id=user.company_id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
        )
        self.db.add(candidate)
        self.db.flush()
        return candidate

    def set_last_login(self, user: User, at: datetime) -> None:
        user.last_login_at = at
        self.db.add(user)

    def revoke_token(self, *, jti: str, user_id: str, expires_at: datetime) -> TokenRevocation:
        revocation = TokenRevocation(jti=jti, user_id=user_id, expires_at=expires_at)
        self.db.add(revocation)
        self.db.flush()
        return revocation

    def is_token_revoked(self, jti: str) -> bool:
        statement = select(TokenRevocation.id).where(TokenRevocation.jti == jti)
        return self.db.scalar(statement) is not None
