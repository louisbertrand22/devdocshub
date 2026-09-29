"""initial schema

Le schéma tel que le créait `Base.metadata.create_all` avant Alembic. Une base créée
ainsi est « tamponnée » à cette révision au démarrage, sans être modifiée (voir app/db/init_db.py).

Revision ID: 0001
Revises:
Create Date: 2026-09-30
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('docs',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('slug', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('tech', sa.String(), nullable=False),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_docs_id'), 'docs', ['id'], unique=False)
    op.create_table('users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password_hash', sa.String(), nullable=False),
    sa.Column('role', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_table('collections',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('owner_id', sa.UUID(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('notes',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('doc_id', sa.UUID(), nullable=True),
    sa.Column('user_id', sa.UUID(), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('is_pinned', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['doc_id'], ['docs.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notes_id'), 'notes', ['id'], unique=False)
    op.create_table('collection_docs',
    sa.Column('collection_id', sa.UUID(), nullable=False),
    sa.Column('doc_id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['collection_id'], ['collections.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['doc_id'], ['docs.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('collection_id', 'doc_id')
    )


def downgrade() -> None:
    op.drop_table('collection_docs')
    op.drop_index(op.f('ix_notes_id'), table_name='notes')
    op.drop_table('notes')
    op.drop_table('collections')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_docs_id'), table_name='docs')
    op.drop_table('docs')
