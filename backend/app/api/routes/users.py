from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_roles
from app.core.rbac import ROLE_ADMIN
from app.db.session import get_db
from app.models.users import User
from app.repositories.user_repository import UserRepository
from app.schemas.users import UserRead
from app.services.auth_service import serialize_user

router = APIRouter()


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)) -> UserRead:
    return serialize_user(current_user)


@router.get("", response_model=list[UserRead])
def list_users(
    _admin: User = Depends(require_roles(ROLE_ADMIN)),
    db: Session = Depends(get_db),
) -> list[UserRead]:
    return [serialize_user(user) for user in UserRepository(db).list_users()]
