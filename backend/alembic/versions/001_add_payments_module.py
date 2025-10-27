"""Add payments module

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create payments table
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column(
            "payment_date",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "payment_method",
            sa.Enum("CASH", "TRANSFER", name="paymentmethod"),
            nullable=False,
        ),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["patient_id"],
            ["patients.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payments_id"), "payments", ["id"], unique=False)
    op.create_index(
        op.f("ix_payments_patient_id"), "payments", ["patient_id"], unique=False
    )
    op.create_index(
        op.f("ix_payments_payment_date"), "payments", ["payment_date"], unique=False
    )

    # Create payment_appointments association table
    op.create_table(
        "payment_appointments",
        sa.Column("payment_id", sa.Integer(), nullable=False),
        sa.Column("appointment_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["appointment_id"],
            ["appointments.id"],
        ),
        sa.ForeignKeyConstraint(
            ["payment_id"],
            ["payments.id"],
        ),
        sa.PrimaryKeyConstraint("payment_id", "appointment_id"),
    )

    # Add is_paid column to appointments table
    op.add_column("appointments", sa.Column("is_paid", sa.Boolean(), nullable=True))

    # Set default value for existing records
    op.execute("UPDATE appointments SET is_paid = false WHERE is_paid IS NULL")

    # Make the column non-nullable
    op.alter_column(
        "appointments", "is_paid", existing_type=sa.Boolean(), nullable=False
    )


def downgrade():
    # Remove is_paid column from appointments
    op.drop_column("appointments", "is_paid")

    # Drop payment_appointments association table
    op.drop_table("payment_appointments")

    # Drop payments table
    op.drop_index(op.f("ix_payments_payment_date"), table_name="payments")
    op.drop_index(op.f("ix_payments_patient_id"), table_name="payments")
    op.drop_index(op.f("ix_payments_id"), table_name="payments")
    op.drop_table("payments")

    # Drop enum type
    sa.Enum("CASH", "TRANSFER", name="paymentmethod").drop(op.get_bind())
