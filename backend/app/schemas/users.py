from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRead(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    name: str
    role: str
    company_id: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
