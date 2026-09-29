from collections.abc import Callable
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import TokenDecodeError, decode_access_token
from app.db.session import get_db
from app.models.users import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_token_payload(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict:
    try:
        payload = decode_access_token(token)
    except TokenDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if UserRepository(db).is_token_revoked(str(payload["jti"])):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This access token has been logged out.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_current_user(
    payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    user = UserRepository(db).get_by_id(str(payload["sub"]))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user was not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active or user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not active.",
        )

    return user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    def dependency(user: User = Depends(get_current_user)) -> User:
        role_name = user.role.name
        if role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return user

    return dependency


def get_current_token_context(
    payload: dict = Depends(get_token_payload),
) -> dict:
    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    return {
        "jti": str(payload["jti"]),
        "expires_at": expires_at,
    }
