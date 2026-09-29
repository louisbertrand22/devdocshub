from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from app.db.session import engine

ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"
# Révision qui décrit le schéma créé par l'ancien `create_all`
BASELINE = "0001"


def alembic_config() -> Config:
    cfg = Config(str(ALEMBIC_INI))
    cfg.attributes["configure_logger"] = False  # garder la config de logs d'uvicorn
    return cfg


def run_migrations() -> None:
    """Amène la base à la dernière révision.

    Une base créée avant Alembic (tables présentes, pas de table `alembic_version`) est d'abord
    tamponnée à la révision de base, sans être modifiée, puis reçoit les migrations suivantes.
    """
    cfg = alembic_config()
    with engine.connect() as conn:
        insp = inspect(conn)
        legacy = insp.has_table("users") and not insp.has_table("alembic_version")
    if legacy:
        command.stamp(cfg, BASELINE)
    command.upgrade(cfg, "head")


def init_db():
    run_migrations()
