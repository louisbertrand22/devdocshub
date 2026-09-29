"""enable row level security

RLS sans policy sur toutes les tables : l'API REST de Supabase (rôles anon, authenticated)
ne voit aucune ligne ; l'API, propriétaire des tables, n'est pas affectée.
Idempotent : sans effet sur une base où l'ancien init_db l'avait déjà activé.

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-30
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = ("users", "docs", "notes", "collections", "collection_docs")


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY')


def downgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" DISABLE ROW LEVEL SECURITY')
