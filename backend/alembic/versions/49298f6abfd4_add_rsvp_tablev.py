"""add rsvp tableV

Revision ID: 49298f6abfd4
Revises: b9a2bfbc6706
Create Date: 2025-07-15 11:19:23.896584

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '49298f6abfd4'
down_revision: Union[str, None] = 'b9a2bfbc6706'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Note: All tables and columns already created in initial migration
    # This migration is kept for Alembic version tracking
    op.alter_column('users', 'hashed_password', existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    # Note: All tables and columns are managed by initial migration
    op.alter_column('users', 'hashed_password', existing_type=sa.String(length=255), nullable=False)
