"""Les migrations Alembic créent le schéma, reprennent une base existante et collent aux modèles.

Usage : docker compose exec -T api python - < services/api/scripts/check_migrations.py
Crée des bases jetables sur le serveur de DATABASE_URL (droit CREATEDB requis), les supprime à la fin.
  1. base vide     : démarrage → dernière révision, RLS, aucune différence avec les modèles ;
  2. base héritée  : tables créées par l'ancien create_all + un utilisateur → tamponnée puis
                     migrée, utilisateur conservé ;
  3. idempotence   : deux démarrages de suite ;
  4. aller-retour  : downgrade jusqu'à base puis upgrade head ;
  5. concurrence   : deux démarrages simultanés sur une base vide (verrou de migration).
"""
import os
import subprocess
import sys
import uuid

import psycopg
from sqlalchemy.engine import make_url

BASE_URL = make_url(os.environ["DATABASE_URL"])
PREAMBLE = "import app.main  # noqa\nfrom app.db.init_db import init_db, alembic_config\nfrom alembic import command\n"
SNIPPETS = {
    "legacy_setup": """
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    db.add(User(username="ancien", email="ancien@test.dev", password_hash="x")); db.commit()
""",
    "boot_twice": "init_db()\ninit_db()\n",
    "verify": """
from sqlalchemy import text
from app.db.session import engine
with engine.connect() as c:
    version = c.execute(text("select version_num from alembic_version")).scalar()
    no_rls = c.execute(text("select count(*) from pg_class where relname in ('users','docs','notes','collections','collection_docs') and not relrowsecurity")).scalar()
    users = c.execute(text("select count(*) from users")).scalar()
command.check(alembic_config())  # lève si les modèles divergent de la base
print(f"{version} {no_rls} {users}")
""",
    "roundtrip": "cfg = alembic_config()\ncommand.downgrade(cfg, 'base')\ncommand.upgrade(cfg, 'head')\n",
}


def admin():
    return psycopg.connect(BASE_URL.set(drivername="postgresql").render_as_string(hide_password=False), autocommit=True)


def env_for(db: str) -> dict:
    return {**os.environ, "DATABASE_URL": BASE_URL.set(database=db).render_as_string(hide_password=False)}


def run(db: str, snippet: str) -> str:
    r = subprocess.run([sys.executable, "-c", PREAMBLE + SNIPPETS[snippet]], env=env_for(db), capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{snippet} : {(r.stderr.strip().splitlines() or ['?'])[-1]}")
    return r.stdout.strip().splitlines()[-1] if r.stdout.strip() else ""  # dernière ligne : le résultat


def main() -> int:
    suffix = uuid.uuid4().hex[:8]
    empty, legacy, parallel = f"mig_empty_{suffix}", f"mig_legacy_{suffix}", f"mig_parallel_{suffix}"
    failures = []

    def check(name, cond, extra=""):
        print(("OK   " if cond else "FAIL ") + name + (f"  — {extra}" if extra else ""))
        if not cond:
            failures.append(name)

    with admin() as conn:
        for db in (empty, legacy, parallel):
            conn.execute(f'CREATE DATABASE "{db}"')
    try:
        try:
            run(empty, "boot_twice")
            out = run(empty, "verify")
            check("base vide : révision 0002, RLS partout, modèles = base", out == "0002 0 0", out)
            run(empty, "roundtrip")
            out = run(empty, "verify")
            check("aller-retour downgrade/upgrade", out == "0002 0 0", out)
        except RuntimeError as e:
            check("base vide", False, str(e))
        try:
            run(legacy, "legacy_setup")
            run(legacy, "boot_twice")
            out = run(legacy, "verify")
            check("base héritée : tamponnée puis migrée, données conservées", out == "0002 0 1", out)
        except RuntimeError as e:
            check("base héritée", False, str(e))
        procs = [
            subprocess.Popen([sys.executable, "-c", PREAMBLE + "init_db()\n"], env=env_for(parallel), stderr=subprocess.PIPE, text=True)
            for _ in range(2)
        ]
        codes = [pr.wait() for pr in procs]
        errors = [(pr.stderr.read().strip().splitlines() or [""])[-1] for pr in procs if pr.returncode]
        try:
            out = run(parallel, "verify")
        except RuntimeError as e:
            out = str(e)
        check("deux démarrages simultanés sur base vide", codes == [0, 0] and out == "0002 0 0", "; ".join(errors) or out)
    finally:
        with admin() as conn:
            for db in (empty, legacy, parallel):
                conn.execute(f'DROP DATABASE IF EXISTS "{db}" WITH (FORCE)')
    print("OK" if not failures else f"FAIL {len(failures)} vérification(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
