-- +migrate Up

ALTER TABLE tarelka_users
  ADD COLUMN telegram_chat_id BIGINT;

CREATE INDEX idx_tarelka_users_telegram_chat_id
  ON tarelka_users(telegram_chat_id);

-- +migrate Down

DROP INDEX IF EXISTS idx_tarelka_users_telegram_chat_id;
ALTER TABLE tarelka_users
  DROP COLUMN telegram_chat_id;
