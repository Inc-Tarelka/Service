-- +migrate Up
-- Справочник специализаций
CREATE TABLE specializations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Справочник направлений
CREATE TABLE directions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Справочник городов
CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Связь пользователь ↔ специализация
CREATE TABLE user_specializations (
    tarelka_user_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    specialization_id BIGINT NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
    PRIMARY KEY (tarelka_user_id, specialization_id)
);

-- Связь пользователь ↔ направление
CREATE TABLE user_directions (
    tarelka_user_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    direction_id BIGINT NOT NULL REFERENCES directions(id) ON DELETE CASCADE,
    PRIMARY KEY (tarelka_user_id, direction_id)
);

-- Связь пользователь ↔ город
CREATE TABLE user_cities (
    tarelka_user_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    city_id BIGINT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    PRIMARY KEY (tarelka_user_id, city_id)
);

CREATE INDEX idx_user_specializations_user ON user_specializations(tarelka_user_id);
CREATE INDEX idx_user_directions_user ON user_directions(tarelka_user_id);
CREATE INDEX idx_user_cities_user ON user_cities(tarelka_user_id);

-- +migrate Down
DROP TABLE IF EXISTS user_cities;
DROP TABLE IF EXISTS user_directions;
DROP TABLE IF EXISTS user_specializations;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS directions;
DROP TABLE IF EXISTS specializations;
