"""Vérifie qu'aucune fonction des modèles ne garde une connexion du pool.

Usage (dans le conteneur) : python -m scripts.check_session_leak
Le ramasse-miettes est désactivé : une connexion ne doit jamais dépendre de lui
pour revenir au pool. Code de sortie 1 si une fonction laisse une connexion prise.
"""
import gc
import sys
import uuid

import app.main  # noqa: F401  (charge tous les modèles)
from app.db.session import engine
from app.models import collection, doc, note, user

UNKNOWN = uuid.uuid4()

CALLS = {
    "doc.get_all_docs": lambda: doc.get_all_docs(),
    "doc.get_all_docs(size=None)": lambda: doc.get_all_docs(size=None),
    "doc.get_count_docs": lambda: doc.get_count_docs(),
    "doc.get_doc_by_id": lambda: doc.get_doc_by_id(UNKNOWN),
    "collection.list_collections": lambda: collection.list_collections(),
    "collection.get_collection": lambda: collection.get_collection(UNKNOWN),
    "collection.get_count_collections": lambda: collection.get_count_collections(),
    "note.get_all_notes": lambda: note.get_all_notes(),
    "note.get_notes_by_doc": lambda: note.get_notes_by_doc(UNKNOWN),
    "note.get_note_by_id": lambda: note.get_note_by_id(UNKNOWN),
    "note.get_notes_by_user": lambda: note.get_notes_by_user(UNKNOWN),
    "note.get_my_notes": lambda: note.get_my_notes(UNKNOWN),
    "note.get_count_notes": lambda: note.get_count_notes(),
    "user.get_all_users": lambda: user.get_all_users(),
    "user.get_user_by_id": lambda: user.get_user_by_id(UNKNOWN),
    "user.get_user_by_email": lambda: user.get_user_by_email("nobody@example.com"),
    "user.get_user_with_details_by_email": lambda: user.get_user_with_details_by_email("nobody@example.com"),
}


def main() -> int:
    gc.disable()
    failures = 0
    for name, call in CALLS.items():
        result = call()  # le résultat reste vivant, comme pendant la sérialisation
        held = engine.pool.checkedout()
        status = "OK  " if held == 0 else "LEAK"
        print(f"{status} {name}: {held} connexion(s) encore prise(s)")
        failures += held != 0
        del result
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
