"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "api_keys",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("provider", sa.String(32), nullable=False, unique=True),
        sa.Column("key_value", sa.Text, nullable=False),
        sa.Column("label", sa.String(128), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "conversations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(255), nullable=False, server_default="New Chat"),
        sa.Column("provider", sa.String(32), nullable=False),
        sa.Column("model", sa.String(128), nullable=False),
        sa.Column("system_prompt", sa.Text, nullable=True),
        sa.Column("use_memory", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "messages",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("conversation_id", UUID(as_uuid=True), sa.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("token_count", sa.Integer, nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_messages_conversation_id", "messages", ["conversation_id"])
    op.create_index("idx_messages_created_at", "messages", ["conversation_id", "created_at"])

    op.create_table(
        "memory_items",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("source_conversation_id", UUID(as_uuid=True), sa.ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("memory_items")
    op.drop_index("idx_messages_created_at", table_name="messages")
    op.drop_index("idx_messages_conversation_id", table_name="messages")
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("api_keys")
