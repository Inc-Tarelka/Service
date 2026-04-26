-- +migrate Up

-- Table for custom masters
CREATE TABLE IF NOT EXISTS masters (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Per-user master binding: either to "masters" table or to another tarelka user
ALTER TABLE tarelka_users
    ADD COLUMN IF NOT EXISTS master_id BIGINT,
    ADD COLUMN IF NOT EXISTS is_master_from_table BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional index to speed up lookups by master
CREATE INDEX IF NOT EXISTS idx_tarelka_users_master_id ON tarelka_users(master_id);

-- +migrate Down

DROP INDEX IF EXISTS idx_tarelka_users_master_id;
ALTER TABLE tarelka_users
    DROP COLUMN IF EXISTS is_master_from_table,
    DROP COLUMN IF EXISTS master_id;

DROP TABLE IF EXISTS masters;
