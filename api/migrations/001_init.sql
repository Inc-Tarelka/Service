-- +migrate Up
-- Telegram пользователи (владельцы)
CREATE TABLE tg_users (
    telegram_id BIGINT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Типы аккаунтов
CREATE TYPE account_type AS ENUM ('PERSON', 'COMPANY');

-- Базовая таблица пользователей Tarelka
CREATE TABLE tarelka_users (
    id BIGSERIAL PRIMARY KEY,
    tg_user_id BIGINT NOT NULL REFERENCES tg_users(telegram_id) ON DELETE CASCADE,
    type account_type NOT NULL,
    login VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    logo_url TEXT,
    telegram_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tarelka_users_tg_user_id ON tarelka_users(tg_user_id);
CREATE INDEX idx_tarelka_users_login ON tarelka_users(login);
CREATE INDEX idx_tarelka_users_phone ON tarelka_users(phone) WHERE phone IS NOT NULL;

-- Дополнение для физлиц
CREATE TABLE tarelka_persons (
    tarelka_user_id BIGINT PRIMARY KEY REFERENCES tarelka_users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL
);

-- Дополнение для юрлиц
CREATE TABLE tarelka_companies (
    tarelka_user_id BIGINT PRIMARY KEY REFERENCES tarelka_users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL
);

-- Refresh токены
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    tarelka_user_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    revoked BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(tarelka_user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- +migrate Down
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS tarelka_companies;
DROP TABLE IF EXISTS tarelka_persons;
DROP TABLE IF EXISTS tarelka_users;
DROP TABLE IF EXISTS tg_users;
DROP TYPE IF EXISTS account_type;
