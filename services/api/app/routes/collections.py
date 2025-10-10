from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Collection(BaseModel):
    id: int
    name: str
    description: str = ""

FAKE_COLLECTIONS = [Collection(id=1, name="Mes Favoris", description="Docs utiles")]

@router.get("/", response_model=List[Collection])
async def list_collections():
    return FAKE_COLLECTIONS

@router.post("/", response_model=Collection)
async def create_collection(collection: Collection):
    collection.id = len(FAKE_COLLECTIONS) + 1
    FAKE_COLLECTIONS.append(collection)
    return collection
