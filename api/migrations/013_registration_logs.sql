-- +migrate Up
CREATE TABLE IF NOT EXISTS registration_logs (
    id BIGSERIAL PRIMARY KEY,
    tarelka_user_id BIGINT REFERENCES tarelka_users(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    event VARCHAR(64) NOT NULL,
    action_flag VARCHAR(32) NOT NULL,
    conversation_stage INT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_logs_user_id ON registration_logs(tarelka_user_id);
CREATE INDEX IF NOT EXISTS idx_registration_logs_phone ON registration_logs(phone);
CREATE INDEX IF NOT EXISTS idx_registration_logs_event ON registration_logs(event);
CREATE INDEX IF NOT EXISTS idx_registration_logs_created_at ON registration_logs(created_at);

-- +migrate Down
DROP TABLE IF EXISTS registration_logs;
