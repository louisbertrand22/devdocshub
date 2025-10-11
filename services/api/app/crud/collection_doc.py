from uuid import UUID
from app.models.collection import get_collection
from app.models.doc import get_doc_by_id
from app.db.session import SessionLocal
from app.models.collection import Collection
from app.models.doc import Doc

def add_doc_to_collection(collection_id: UUID, doc_id: UUID):
    with SessionLocal() as db:                      # <-- crée & ferme proprement
        col = db.get(Collection, collection_id)     # <-- récupère dans la MÊME session
        doc = db.get(Doc, doc_id)

        if not col or not doc:
            return None

        _ = col.docs

        if doc not in col.docs:
            col.docs.append(doc)
            db.commit()
            db.refresh(col)  # encore attaché grâce à expire_on_commit=False

        return col

def remove_doc_from_collection(collection_id: UUID, doc_id: UUID):
    with SessionLocal() as db:
        col = db.get(Collection, collection_id)
        doc = db.get(Doc, doc_id)

        if not col or not doc:
            return

        _ = col.docs

        if doc in col.docs:
            col.docs.remove(doc)
            db.commit()
            db.refresh(col)

def list_docs_in_collection(collection_id: UUID, page: int = 1, size: int = 20):
    with SessionLocal() as db:
        col = db.get(Collection, collection_id)
        if not col:
            return None

        _ = col.docs

        start = (page - 1) * size
        end = start + size
        return col.docs[start:end]