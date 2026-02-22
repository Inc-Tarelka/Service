-- +migrate Up
ALTER TABLE tarelka_users
    ADD COLUMN IF NOT EXISTS conversation INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS conversation_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_tarelka_users_conversation ON tarelka_users(conversation);

-- +migrate Down
DROP INDEX IF EXISTS idx_tarelka_users_conversation;
ALTER TABLE tarelka_users
    DROP COLUMN IF EXISTS conversation_updated_at,
    DROP COLUMN IF EXISTS conversation;
