from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.utils.auth_dep import require_roles, get_current_user
from app.models.user import get_user_by_email

from app.schemas.collection import CollectionCreate, CollectionUpdate, CollectionOut
from app.models.collection import list_collections, get_collection, create_collection, update_collection, delete_collection

router = APIRouter()

@router.get("/", response_model=List[CollectionOut],
            dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
def get_all_collections(
    q: Optional[str] = Query(None, description="Recherche plein texte"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    only_mine: bool = Query(False, description="Ne lister que mes collections"),
    current_user = Depends(get_current_user),
):
    owner_id = current_user.id if only_mine else None
    rows = list_collections(owner_id=owner_id, q=q, page=page, size=size)
    return rows

@router.post("/", response_model=CollectionOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
def create_new_collection(
    collection: CollectionCreate,
    current_user = Depends(get_current_user),
):
    user = get_user_by_email(current_user["email"])
    db_collection = create_collection(owner_id=user.id, collection=collection)
    return db_collection

@router.get("/{collection_id}", response_model=CollectionOut,
            dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
def get_collection_by_id(collection_id: UUID):
    db_collection = get_collection(collection_id)
    if not db_collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return db_collection

@router.put("/{collection_id}", response_model=CollectionOut,
            dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
def update_collection_by_id(
    collection_id: UUID,
    collection: CollectionUpdate,
    current_user = Depends(get_current_user),
):
    db_collection = get_collection(collection_id)
    if not db_collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    if db_collection.owner_id != current_user.id and "admin" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Not authorized to update this collection")
    updated_collection = update_collection(collection_id, collection)
    return updated_collection

@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT,
                dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
def delete_collection_by_id(
    collection_id: UUID,
    current_user = Depends(get_current_user),
):
    db_collection = get_collection(collection_id)
    if not db_collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    if db_collection.owner_id != current_user.id and "admin" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Not authorized to delete this collection")
    success = delete_collection(collection_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete collection")
    return