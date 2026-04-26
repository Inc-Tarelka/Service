-- +migrate Up

ALTER TABLE publications
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_publications_is_deleted ON publications(is_deleted);

-- +migrate Down

DROP INDEX IF EXISTS idx_publications_is_deleted;

ALTER TABLE publications
    DROP COLUMN IF EXISTS is_deleted;
