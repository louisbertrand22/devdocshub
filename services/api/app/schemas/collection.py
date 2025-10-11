from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class CollectionBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = ""

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None

class CollectionOut(CollectionBase):
    id: UUID
    owner_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
