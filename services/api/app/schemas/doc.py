from pydantic import Field, BaseModel
from uuid import UUID

class DocCreate(BaseModel):
    slug: str = Field(..., min_length=2, max_length=200)
    title: str = Field(..., min_length=2, max_length=300)
    tech: str = Field(..., min_length=1, max_length=100)
    content: str = ""

class DocOut(BaseModel):
    id: UUID
    slug: str
    title: str
    tech: str
    content: str

    model_config = {"from_attributes": True}

class DocMini(BaseModel):
    id: UUID
    slug: str
    title: str
    model_config = {"from_attributes": True}