"""Add price to appointments

Revision ID: 002
Revises: 001
Create Date: 2024-01-15 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade():
    # Add price column to appointments table
    op.add_column(
        "appointments",
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=True),
    )


def downgrade():
    # Remove price column from appointments table
    op.drop_column("appointments", "price")
