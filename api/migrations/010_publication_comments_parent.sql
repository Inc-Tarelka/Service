-- +migrate Up

ALTER TABLE publication_comments
    ADD COLUMN IF NOT EXISTS parent_comment_id BIGINT REFERENCES publication_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_publication_comments_parent ON publication_comments(parent_comment_id);

-- +migrate Down

DROP INDEX IF EXISTS idx_publication_comments_parent;
ALTER TABLE publication_comments
    DROP COLUMN IF EXISTS parent_comment_id;
