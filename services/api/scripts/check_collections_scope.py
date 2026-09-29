"""Les collections sont privées ; on peut y ajouter, lister et retirer ses docs.

Usage (API lancée) : docker compose exec -T api python - < services/api/scripts/check_collections_scope.py
Crée deux utilisateurs A et B, un doc et une collection de A, puis vérifie via HTTP
que B ne la voit ni ne la modifie, et que A peut y gérer ses docs. Nettoie tout à la fin.
"""
import sys
import uuid

import requests

import app.main  # noqa: F401
from app.db.session import SessionLocal
from app.models.collection import Collection
from app.models.doc import Doc
from app.models.user import User
from app.utils import security

API = "http://localhost:8000"


def main() -> int:
    suffix = uuid.uuid4().hex[:8]
    with SessionLocal() as db:
        a = User(username=f"a-{suffix}", email=f"check-a-{suffix}@test.dev", password_hash="x", role="user")
        b = User(username=f"b-{suffix}", email=f"check-b-{suffix}@test.dev", password_hash="x", role="user")
        doc = Doc(slug=f"check-{suffix}", title="Check", tech="check", content="")
        db.add_all([a, b, doc])
        db.commit()
        a_id, b_id, doc_id = a.id, b.id, str(doc.id)
        a_email, b_email = a.email, b.email
    ha = {"Authorization": f"Bearer {security.create_access_token(a_email, {'role': 'user'})}"}
    hb = {"Authorization": f"Bearer {security.create_access_token(b_email, {'role': 'user'})}"}
    failures = []

    def check(name, cond):
        print(("OK   " if cond else "FAIL ") + name)
        if not cond:
            failures.append(name)

    try:
        r = requests.post(f"{API}/collections/", headers=ha, json={"name": f"col-{suffix}", "description": ""})
        col_id = r.json()["id"]

        check("GET /collections/ ne montre pas celles des autres", col_id not in [c["id"] for c in requests.get(f"{API}/collections/", headers=hb).json()])
        check("GET /collections/count compte seulement les siennes", requests.get(f"{API}/collections/count", headers=hb).json() == 0)
        check("GET /collections/{id} d'un autre -> 404", requests.get(f"{API}/collections/{col_id}", headers=hb).status_code == 404)
        check("GET /collections/{id}/docs d'un autre -> 404", requests.get(f"{API}/collections/{col_id}/docs", headers=hb).status_code == 404)
        check("POST doc dans la collection d'un autre -> 404", requests.post(f"{API}/collections/{col_id}/docs", headers=hb, json={"doc_id": doc_id}).status_code == 404)

        check("A voit sa collection", requests.get(f"{API}/collections/{col_id}", headers=ha).status_code == 200)
        check("A ajoute un doc", requests.post(f"{API}/collections/{col_id}/docs", headers=ha, json={"doc_id": doc_id}).status_code == 201)
        docs = requests.get(f"{API}/collections/{col_id}/docs", headers=ha).json()
        check("A liste ses docs, avec la techno", [d["id"] for d in docs] == [doc_id] and docs[0].get("tech") == "check")
        check("A retire le doc", requests.delete(f"{API}/collections/{col_id}/docs/{doc_id}", headers=ha).status_code == 204)
        check("la collection est vide", requests.get(f"{API}/collections/{col_id}/docs", headers=ha).json() == [])
    finally:
        with SessionLocal() as db:
            db.execute(Collection.__table__.delete().where(Collection.owner_id.in_([a_id, b_id])))
            db.execute(Doc.__table__.delete().where(Doc.id == uuid.UUID(doc_id)))
            db.execute(User.__table__.delete().where(User.id.in_([a_id, b_id])))
            db.commit()
    print("OK" if not failures else f"FAIL {len(failures)} vérification(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
