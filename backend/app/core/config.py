from functools import lru_cache

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  app_name: str = "Recruitment and Hiring Management API"
  app_version: str = "0.1.0"
  environment: str = "local"
  api_v1_prefix: str = "/api/v1"

  database_url: str = Field(..., alias="DATABASE_URL")
  secret_key: SecretStr = Field(..., alias="SECRET_KEY")
  access_token_expire_minutes: int = Field(30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
  jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")

  cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    case_sensitive=False,
    extra="ignore",
    # CORS_ORIGINS is intentionally comma-separated (rather than JSON) so it is
    # practical to set in Render's environment-variable UI.
    enable_decoding=False,
  )

  @field_validator("cors_origins", mode="before")
  @classmethod
  def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
    if isinstance(value, str):
      return [origin.strip() for origin in value.split(",") if origin.strip()]

    return value


@lru_cache
def get_settings() -> Settings:
  return Settings()


settings = get_settings()
