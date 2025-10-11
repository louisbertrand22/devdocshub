
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

# --------------------------
# Schémas Pydantic
# --------------------------
class UserOut(BaseModel):
    id: UUID
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}