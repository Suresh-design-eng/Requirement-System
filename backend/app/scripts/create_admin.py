"""Create exactly one initial administrator from explicit environment variables.

Run this command manually after migrations. It intentionally does not run during
web-service startup and public registration can never create an administrator.
"""

import os
import sys

from sqlalchemy import select

from app.core.rbac import ROLE_ADMIN
from app.core.security import hash_password, validate_password_strength
from app.db.session import SessionLocal
from app.models.users import User
from app.repositories.user_repository import UserRepository


def required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"{name} must be set for admin provisioning.")
    return value


def main() -> int:
    try:
        email = required("INITIAL_ADMIN_EMAIL").lower()
        name = required("INITIAL_ADMIN_NAME")
        password = required("INITIAL_ADMIN_PASSWORD")
        errors = validate_password_strength(password)
        if errors:
            raise ValueError(" ".join(errors))
    except ValueError as exc:
        print(f"Admin was not created: {exc}", file=sys.stderr)
        return 2

    session = SessionLocal()
    try:
        if session.scalar(select(User).where(User.email == email)):
            print("Admin was not created: a user with that email already exists.", file=sys.stderr)
            return 1
        repository = UserRepository(session)
        roles = repository.ensure_default_roles()
        repository.create_user(
            email=email,
            full_name=name,
            password_hash=hash_password(password),
            role=roles[ROLE_ADMIN],
        )
        session.commit()
        print(f"Initial administrator created for {email}.")
        return 0
    finally:
        session.close()


if __name__ == "__main__":
    raise SystemExit(main())
