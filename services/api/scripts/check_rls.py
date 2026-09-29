"""RLS est active sur toutes les tables : un rôle type Supabase `anon` ne lit rien, l'API lit tout.

Usage : docker compose exec -T api python - < services/api/scripts/check_rls.py
Crée un rôle temporaire sans privilège particulier (comme `anon`), lui donne SELECT,
vérifie qu'il ne voit aucune ligne, puis le supprime.
"""
import sys
import uuid

from sqlalchemy import text

import app.main  # noqa: F401
from app.db.base import Base
from app.db.init_db import init_db
from app.db.session import engine


def main() -> int:
    init_db()  # ce que fait l'API au démarrage
    tables = [t.name for t in Base.metadata.sorted_tables]
    role = f"check_anon_{uuid.uuid4().hex[:8]}"
    failures = []
    with engine.connect() as conn:
        off = conn.execute(
            text("select relname from pg_class where relname = any(:t) and relkind = 'r' and not relrowsecurity"),
            {"t": tables},
        ).scalars().all()
        print(("OK   " if not off else "FAIL ") + f"RLS active sur {len(tables)} tables" + (f" (manque : {off})" if off else ""))
        failures += off
        api_users = conn.execute(text("select count(*) from users")).scalar()
        try:
            conn.execute(text(f"create role {role} nologin"))
            for t in tables:
                conn.execute(text(f'grant select on "{t}" to {role}'))
            conn.execute(text(f"set role {role}"))
            seen = conn.execute(text("select count(*) from users")).scalar()
            conn.execute(text("reset role"))
            ok = api_users > 0 and seen == 0
            print(("OK   " if ok else "FAIL ") + f"users : l'API voit {api_users} ligne(s), un rôle anon en voit {seen}")
            if not ok:
                failures.append("anon")
        finally:
            conn.rollback()
    print("OK" if not failures else "FAIL")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
