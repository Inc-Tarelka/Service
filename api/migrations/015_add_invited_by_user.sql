-- +migrate Up
-- Add relation from invited user to inviter (sender)
ALTER TABLE tarelka_users
    ADD COLUMN IF NOT EXISTS invited_by_user_id BIGINT REFERENCES tarelka_users(id);

CREATE INDEX IF NOT EXISTS idx_tarelka_users_invited_by_user_id ON tarelka_users(invited_by_user_id);

-- +migrate Down
DROP INDEX IF EXISTS idx_tarelka_users_invited_by_user_id;
ALTER TABLE tarelka_users
    DROP COLUMN IF EXISTS invited_by_user_id;
