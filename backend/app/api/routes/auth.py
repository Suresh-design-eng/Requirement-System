from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_token_context, get_current_user
from app.db.session import get_db
from app.models.users import User
from app.schemas.auth import AuthTokenResponse, LoginRequest, RegisterRequest
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter()


def _client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.client.host if request.client else None


@router.post(
    "/register",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> AuthTokenResponse:
    return AuthService(db).register_candidate(
        payload,
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )


@router.post("/login", response_model=AuthTokenResponse)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> AuthTokenResponse:
    return AuthService(db).login(
        payload,
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    token_context: dict = Depends(get_current_token_context),
    db: Session = Depends(get_db),
) -> MessageResponse:
    AuthService(db).logout(
        user=current_user,
        jti=token_context["jti"],
        expires_at=token_context["expires_at"],
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    return MessageResponse(message="Signed out successfully.")
