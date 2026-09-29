from sqlalchemy import text

from app.db.base import Base
from app.db.session import engine
from app.models.user import User  # noqa: F401


def enable_row_level_security():
    """Active RLS, sans aucune policy, sur toutes nos tables PostgreSQL.

    Sur Supabase, le schéma `public` est exposé par l'API REST (rôles `anon`, `authenticated`) :
    sans RLS, n'importe qui avec la clé anon lirait `users` et ses hash de mots de passe.
    Le propriétaire des tables (le rôle avec lequel l'API se connecte) n'est pas soumis à RLS,
    l'API continue donc de tout voir ; les autres rôles ne voient plus rien.
    """
    if engine.dialect.name != "postgresql":
        return
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            conn.execute(text(f'ALTER TABLE "{table.name}" ENABLE ROW LEVEL SECURITY'))


def init_db():
    Base.metadata.create_all(bind=engine)
    enable_row_level_security()
