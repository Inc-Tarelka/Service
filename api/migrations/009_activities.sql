-- +migrate Up

CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    tarelka_user_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON activities(tarelka_user_id);
CREATE INDEX idx_activities_time ON activities(time);
CREATE INDEX idx_activities_type ON activities(type);

-- +migrate Down

DROP TABLE IF EXISTS activities;
