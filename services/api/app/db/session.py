# services/api/app/db/session.py
import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./devdocshub.db")


def behind_transaction_pooler(url: str, pool_mode: str | None) -> bool:
    """Pooler en mode transaction (Supabase port 6543, PgBouncer) : explicite via
    DATABASE_POOL_MODE=transaction, ou déduit du port 6543 si la variable est absente."""
    if pool_mode:
        return pool_mode.strip().lower() == "transaction"
    return make_url(url).port == 6543


engine_kwargs: dict = {"pool_pre_ping": True, "echo": False}
if DATABASE_URL.startswith("sqlite"):
    # For SQLite thread safety in dev
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif behind_transaction_pooler(DATABASE_URL, os.getenv("DATABASE_POOL_MODE")):
    # Le pooler répartit les transactions sur des connexions serveur partagées :
    # pas de requêtes préparées côté serveur (psycopg les crée après 5 exécutions),
    # et pas de second pool côté SQLAlchemy, le pooler en est déjà un.
    engine_kwargs["connect_args"] = {"prepare_threshold": None}
    engine_kwargs["poolclass"] = NullPool
    engine_kwargs["pool_pre_ping"] = False

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

def get_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
