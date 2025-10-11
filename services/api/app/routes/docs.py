from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from typing import List
from app.models.doc import get_all_docs, get_doc_by_id, add_doc, get_doc_by_slug, Doc
from uuid import UUID
from app.schemas.doc import DocCreate, DocOut

from app.utils.auth_dep import require_roles

router = APIRouter()

def serialize(doc: Doc) -> DocOut:
    return DocOut(
        id=str(doc.id),
        slug=doc.slug,
        title=doc.title,
        tech=doc.tech,
        content=doc.content or "",
    )


@router.get("/all", dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def list_docs():
    alldocs = get_all_docs()
    return alldocs

@router.get("/", response_model=List[DocOut], dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
def list_docs(
    q: Optional[str] = Query(None, description="Recherche plein texte sur titre/contenu"),
    tech: Optional[str] = Query(None, description="Filtrer par technologie"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    items = get_all_docs(q=q, tech=tech, page=page, size=size)
    return [serialize(d) for d in items]

@router.get("/doc/{doc_id}", dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
async def get_doc(doc_id: UUID):
    doc = get_doc_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")
    return doc

@router.get("/{slug}", response_model=DocOut, dependencies=[Depends(require_roles("user", "maintainer", "admin"))])
def get_doc(slug: str):
    doc = get_doc_by_slug(slug)
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")
    return serialize(doc)

@router.post("/add", response_model=DocOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_roles("maintainer", "admin"))])
def create_doc(payload: DocCreate):
    new_doc = add_doc(
        slug=payload.slug,
        title=payload.title,
        tech=payload.tech,
        content=payload.content
    )
    return serialize(new_doc)
