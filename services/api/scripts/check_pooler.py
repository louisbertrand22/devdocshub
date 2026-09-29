"""L'API fonctionne derrière un pooler en mode transaction (Supabase, port 6543).

Usage, avec un PgBouncer en mode transaction sans support des requêtes préparées :
  docker run -d --name ddh-pgbouncer --network devdocshub_default \\
    -e DATABASE_URL=postgres://devdoc:devdoc@db:5432/devdocs -e POOL_MODE=transaction \\
    -e AUTH_TYPE=scram-sha-256 -e MAX_PREPARED_STATEMENTS=0 edoburu/pgbouncer
  docker compose run --rm -T --no-deps \\
    -e DATABASE_URL=postgresql+psycopg://devdoc:devdoc@ddh-pgbouncer:5432/devdocs \\
    -e DATABASE_POOL_MODE=transaction api python - < services/api/scripts/check_pooler.py

psycopg prépare côté serveur une requête exécutée 5 fois sur une connexion. Derrière un pooler
en mode transaction, deux connexions clientes partagent les mêmes connexions serveur :
« prepared statement "_pg3_0" already exists ».
"""
import sys

from sqlalchemy import text

import app.main  # noqa: F401
from app.db.session import engine
from app.models import doc, user


def main() -> int:
    try:
        # Deux connexions de l'engine qui alternent, une transaction par requête
        with engine.connect() as c1, engine.connect() as c2:
            for i in range(12):
                for c in (c1, c2):
                    c.execute(text("select CAST(:x AS int)"), {"x": i})
                    c.commit()
        # Puis le vrai code de l'API, répété au-delà du seuil de préparation
        for _ in range(12):
            user.get_user_by_email("personne@test.dev")
            doc.get_all_docs(size=None)
    except Exception as e:  # noqa: BLE001
        print(f"FAIL {type(e).__name__}: {str(e).splitlines()[0]}")
        return 1
    print("OK via le pooler en mode transaction")
    return 0


if __name__ == "__main__":
    sys.exit(main())
