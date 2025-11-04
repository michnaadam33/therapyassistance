"""Replace notes with session_note_id in appointments

Revision ID: 003
Revises: 002
Create Date: 2024-01-15 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Usuń kolumnę notes z appointments
    op.drop_column("appointments", "notes")

    # Dodaj kolumnę session_note_id jako foreign key do session_notes
    op.add_column(
        "appointments", sa.Column("session_note_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        "fk_appointments_session_note_id",
        "appointments",
        "session_notes",
        ["session_note_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    # Usuń foreign key i kolumnę session_note_id
    op.drop_constraint(
        "fk_appointments_session_note_id", "appointments", type_="foreignkey"
    )
    op.drop_column("appointments", "session_note_id")

    # Przywróć kolumnę notes
    op.add_column("appointments", sa.Column("notes", sa.Text(), nullable=True))
