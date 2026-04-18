-- +migrate Up

ALTER TABLE notifications ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- +migrate Down

ALTER TABLE notifications DROP COLUMN IF EXISTS is_deleted;
