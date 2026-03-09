-- +migrate Up

CREATE TYPE notification_type AS ENUM ('Collaboration', 'Response', 'Notice');

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    type notification_type NOT NULL,
    publication_id BIGINT REFERENCES publications(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creator_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    message TEXT,
    need_id BIGINT REFERENCES needs(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_notifications_receiver_type_created_at
    ON notifications(receiver_id, type, created_at DESC);

-- +migrate Down

DROP INDEX IF EXISTS idx_notifications_receiver_type_created_at;
DROP TABLE IF EXISTS notifications;
DROP TYPE IF EXISTS notification_type;
