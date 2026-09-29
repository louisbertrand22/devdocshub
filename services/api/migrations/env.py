from logging.config import fileConfig

from alembic import context
from sqlalchemy import text

from app.db.base import Base
from app.db.session import DATABASE_URL, engine
# Tous les modèles doivent être importés pour que Base.metadata soit complet
from app.models import collection, doc, note, user  # noqa: F401

config = context.config
if config.config_file_name is not None and config.attributes.get("configure_logger", True):
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata

# Verrou pris pendant la migration : deux instances de l'API qui démarrent en même temps
# ne migrent pas en parallèle. Verrou de transaction, compatible avec un pooler en mode transaction.
MIGRATION_LOCK_ID = 727_001


def run_migrations_offline() -> None:
    """`alembic upgrade head --sql` : produit le SQL sans se connecter (à coller dans un éditeur SQL)."""
    context.configure(url=DATABASE_URL, target_metadata=target_metadata, literal_binds=True, compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    # Même engine que l'API : mêmes réglages de pooler (voir app/db/session.py)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            if connection.dialect.name == "postgresql":
                connection.execute(text("SELECT pg_advisory_xact_lock(:id)"), {"id": MIGRATION_LOCK_ID})
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
