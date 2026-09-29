from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.utils.auth_dep import require_roles, get_current_user
from app.crud.collection_doc import (
    add_doc_to_collection,
    remove_doc_from_collection,
    list_docs_in_collection,
)
from app.schemas.doc import DocMini
from app.schemas.collection_doc import CollectionDocLink
from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
    CollectionOut,
    CollectionWithDocs,
)
from app.models.collection import (
    Collection,
    list_collections,
    get_collection,
    create_collection,
    update_collection,
    delete_collection,
)

router = APIRouter(
)

# --- Endpoints statiques AVANT les dynamiques ---

@router.get(
    "/count",
    response_model=int,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def count_collections(current_user: dict = Depends(get_current_user)):
    """Nombre de collections de l'utilisateur connecté (les collections sont privées)."""
    return len(list(list_collections(owner_id=current_user["id"], size=None)))

@router.get(
    "/count/mine",
    response_model=int,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def count_my_collections(current_user: dict = Depends(get_current_user)):
    """
    Renvoie le nombre de collections de l'utilisateur connecté.
    """
    return len(list(list_collections(owner_id=current_user["id"], size=None)))

# --- Listing / création ---

@router.get(
    "/",
    response_model=List[CollectionOut],
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def get_all_collections(
    q: Optional[str] = Query(None, description="Recherche plein texte"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    only_mine: bool = Query(True, description="Ignoré : on ne liste que ses propres collections"),
    current_user: dict = Depends(get_current_user),
):
    rows = list_collections(owner_id=current_user["id"], q=q, page=page, size=size)
    return rows


@router.post(
    "/",
    response_model=CollectionOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def create_new_collection(
    collection: CollectionCreate,
    current_user: dict = Depends(get_current_user),
):
    db_collection = create_collection(owner_id=current_user["id"], collection=collection)
    return db_collection

# --- Helpers ---

def _own_collection(collection_id: UUID, current_user: dict) -> Collection:
    """La collection si elle appartient à l'utilisateur (ou s'il est admin), sinon 404 :
    on ne confirme pas l'existence des collections des autres."""
    collection = get_collection(collection_id)
    is_admin = current_user.get("role", "user") == "admin"
    if not collection or (collection.owner_id != current_user["id"] and not is_admin):
        raise HTTPException(status_code=404, detail="Collection introuvable")
    return collection

# --- CRUD par id ---

@router.get(
    "/{collection_id:uuid}",
    response_model=CollectionOut,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def get_collection_by_id(collection_id: UUID, current_user: dict = Depends(get_current_user)):
    return _own_collection(collection_id, current_user)


@router.put(
    "/{collection_id:uuid}",
    response_model=CollectionOut,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def update_collection_by_id(
    collection_id: UUID,
    collection: CollectionUpdate,
    current_user: dict = Depends(get_current_user),
):
    _own_collection(collection_id, current_user)
    updated_collection = update_collection(collection_id, collection)
    return updated_collection


@router.delete(
    "/{collection_id:uuid}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def delete_collection_by_id(
    collection_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    _own_collection(collection_id, current_user)
    success = delete_collection(collection_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete collection")
    return

# --- Liaison documents ---

@router.post(
    "/{collection_id:uuid}/docs",
    response_model=CollectionWithDocs,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def link_doc(
    collection_id: UUID,
    payload: CollectionDocLink,
    current_user: dict = Depends(get_current_user),
):
    _own_collection(collection_id, current_user)

    col = add_doc_to_collection(collection_id, payload.doc_id)
    if not col:
        raise HTTPException(status_code=404, detail="Collection ou Doc introuvable")
    return col


@router.delete(
    "/{collection_id:uuid}/docs/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def unlink_doc(
    collection_id: UUID,
    doc_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    _own_collection(collection_id, current_user)

    remove_doc_from_collection(collection_id, doc_id)
    return


@router.get(
    "/{collection_id:uuid}/docs",
    response_model=List[DocMini],
    dependencies=[Depends(require_roles("user", "maintainer", "admin"))],
)
def list_collection_docs(collection_id: UUID, current_user: dict = Depends(get_current_user)):
    _own_collection(collection_id, current_user)
    docs = list_docs_in_collection(collection_id)
    if docs is None:
        raise HTTPException(status_code=404, detail="Collection introuvable")
    return docs
