"""Ajouter un doc à une collection renvoie une collection sérialisable (avec ses docs).

Usage (dans le conteneur) : python -m scripts.check_collection_link
Reproduit le 500 de POST /collections/{id}/docs : DetachedInstanceError sur `docs`.
"""
import sys
import uuid

import app.main  # noqa: F401
from app.crud.collection_doc import add_doc_to_collection
from app.db.session import SessionLocal
from app.models.collection import Collection
from app.models.doc import Doc
from app.models.user import User
from app.schemas.collection import CollectionWithDocs


def main() -> int:
    suffix = uuid.uuid4().hex[:8]
    with SessionLocal() as db:
        owner = db.query(User).first()
        if owner is None:
            print("SKIP aucun utilisateur en base")
            return 0
        col = Collection(name=f"check-{suffix}", description="", owner_id=owner.id)
        doc = Doc(slug=f"check-{suffix}", title="Check", tech="check", content="")
        db.add_all([col, doc])
        db.commit()
        col_id, doc_id = col.id, doc.id
    try:
        result = add_doc_to_collection(col_id, doc_id)
        out = CollectionWithDocs.model_validate(result)  # ce que fait FastAPI pour la réponse
        ok = [d.id for d in out.docs] == [doc_id]
        print("OK" if ok else f"FAIL docs={out.docs}")
        return 0 if ok else 1
    except Exception as e:  # noqa: BLE001
        print(f"FAIL {type(e).__name__}: {e}")
        return 1
    finally:
        with SessionLocal() as db:
            db.execute(Collection.__table__.delete().where(Collection.id == col_id))
            db.execute(Doc.__table__.delete().where(Doc.id == doc_id))
            db.commit()


if __name__ == "__main__":
    sys.exit(main())
