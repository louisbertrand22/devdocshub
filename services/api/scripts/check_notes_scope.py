"""Les notes sont privées et `PUT /notes/{id}` respecte `is_pinned`.

Usage (API lancée) : docker compose exec -T api python - < services/api/scripts/check_notes_scope.py
Crée deux utilisateurs A et B, un doc, une note de A, puis vérifie via HTTP que B
ne la voit ni ne la modifie, et que A peut la désépingler. Nettoie tout à la fin.
"""
import sys
import uuid

import requests

import app.main  # noqa: F401
from app.db.session import SessionLocal
from app.models.doc import Doc
from app.models.note import Note
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
        a_id, b_id, doc_id = a.id, b.id, doc.id
        a_email, b_email = a.email, b.email
    ha = {"Authorization": f"Bearer {security.create_access_token(a_email, {'role': 'user'})}"}
    hb = {"Authorization": f"Bearer {security.create_access_token(b_email, {'role': 'user'})}"}
    failures = []

    def check(name, cond):
        print(("OK   " if cond else "FAIL ") + name)
        if not cond:
            failures.append(name)

    try:
        # B essaie de créer une note au nom de A : l'auteur doit rester B.
        r = requests.post(f"{API}/notes", headers=hb, json={"doc_id": str(doc_id), "user_id": str(a_id), "content": "de B"})
        check("POST ignore le user_id fourni", r.ok and r.json()["user_id"] == str(b_id))

        r = requests.post(f"{API}/notes", headers=ha, json={"doc_id": str(doc_id), "content": "de A", "is_pinned": True})
        check("POST sans user_id", r.ok)
        note_id = r.json()["id"] if r.ok else str(uuid.uuid4())

        ids_b = [n["id"] for n in requests.get(f"{API}/notes", headers=hb).json()]
        check("GET /notes ne montre pas les notes des autres", note_id not in ids_b and len(ids_b) == 1)
        check("GET /notes/count compte seulement les siennes", requests.get(f"{API}/notes/count", headers=hb).json() == 1)
        ids_b_doc = [n["id"] for n in requests.get(f"{API}/notes/doc/{doc_id}/notes", headers=hb).json()]
        check("GET /notes/doc/{id}/notes filtré", note_id not in ids_b_doc)
        check("GET /notes/{id} d'un autre -> 404", requests.get(f"{API}/notes/{note_id}", headers=hb).status_code == 404)
        r = requests.get(f"{API}/notes/mine", headers=hb, params={"uuid": str(a_id)})
        check("GET /notes/mine ignore le uuid fourni", note_id not in [n["id"] for n in r.json()])

        r = requests.put(f"{API}/notes/{note_id}", headers=hb, json={"content": "piraté"})
        check("PUT d'un autre -> 404", r.status_code == 404)
        r = requests.delete(f"{API}/notes/{note_id}", headers=hb, params={"user_id": str(a_id)})
        check("DELETE d'un autre -> 404", r.status_code == 404)

        r = requests.put(f"{API}/notes/{note_id}", headers=ha, json={"content": "modifiée", "is_pinned": False})
        check("PUT désépingle", r.ok and r.json()["is_pinned"] is False and r.json()["content"] == "modifiée")
        r = requests.put(f"{API}/notes/{note_id}", headers=ha, json={"content": "encore"})
        check("PUT sans is_pinned le conserve", r.ok and r.json()["is_pinned"] is False)

        r = requests.options(f"{API}/notes", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"})
        check("OPTIONS répond", r.status_code == 200)
        check("DELETE du propriétaire -> 204", requests.delete(f"{API}/notes/{note_id}", headers=ha).status_code == 204)
    finally:
        with SessionLocal() as db:
            db.execute(Note.__table__.delete().where(Note.doc_id == doc_id))
            db.execute(Doc.__table__.delete().where(Doc.id == doc_id))
            db.execute(User.__table__.delete().where(User.id.in_([a_id, b_id])))
            db.commit()
    print("OK" if not failures else f"FAIL {len(failures)} vérification(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
