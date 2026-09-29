from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import validate_password_strength
from app.schemas.users import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    email: EmailStr
    password: str = Field(min_length=12, max_length=256)
    phone: str | None = Field(default=None, max_length=40)

    @field_validator("password")
    @classmethod
    def password_is_strong(cls, value: str) -> str:
        errors = validate_password_strength(value)
        if errors:
            raise ValueError(" ".join(errors))

        return value


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
