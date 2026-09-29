from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenDecodeError(Exception):
  """Raised when an access token cannot be decoded or trusted."""


def utcnow() -> datetime:
  return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
  return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
  return pwd_context.verify(plain_password, password_hash)


def validate_password_strength(password: str) -> list[str]:
  errors: list[str] = []

  if len(password) < 12:
    errors.append("Use at least 12 characters.")
  if not any(character.islower() for character in password):
    errors.append("Add a lowercase letter.")
  if not any(character.isupper() for character in password):
    errors.append("Add an uppercase letter.")
  if not any(character.isdigit() for character in password):
    errors.append("Add a number.")
  if not any(not character.isalnum() for character in password):
    errors.append("Add a symbol.")

  return errors


def create_access_token(
  *,
  subject: str,
  role: str,
  email: str,
  expires_delta: timedelta | None = None,
) -> tuple[str, datetime, str]:
  expires_at = utcnow() + (
    expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
  )
  jti = str(uuid4())
  payload: dict[str, Any] = {
    "sub": subject,
    "role": role,
    "email": email,
    "jti": jti,
    "type": "access",
    "exp": expires_at,
    "iat": utcnow(),
  }
  encoded_token = jwt.encode(
    payload,
    settings.secret_key.get_secret_value(),
    algorithm=settings.jwt_algorithm,
  )

  return encoded_token, expires_at, jti


def decode_access_token(token: str) -> dict[str, Any]:
  try:
    payload = jwt.decode(
      token,
      settings.secret_key.get_secret_value(),
      algorithms=[settings.jwt_algorithm],
    )
  except JWTError as exc:
    raise TokenDecodeError("Invalid or expired access token.") from exc

  if payload.get("type") != "access" or not payload.get("sub") or not payload.get("jti"):
    raise TokenDecodeError("Invalid access token payload.")

  return payload
