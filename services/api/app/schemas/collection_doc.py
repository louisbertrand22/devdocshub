from pydantic import BaseModel, Field
from uuid import UUID

class CollectionDocLink(BaseModel):
    doc_id: UUID = Field(...)
