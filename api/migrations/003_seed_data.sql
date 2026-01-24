-- +migrate Up
-- Начальные данные для справочников

-- Специализации
INSERT INTO specializations (name) VALUES
    ('Backend разработка'),
    ('Frontend разработка'),
    ('Mobile разработка'),
    ('DevOps'),
    ('Data Science'),
    ('UI/UX дизайн'),
    ('Product Management'),
    ('QA/Testing'),
    ('System Administration'),
    ('Security');

-- Направления
INSERT INTO directions (name) VALUES
    ('Финтех'),
    ('E-commerce'),
    ('Образование'),
    ('Здравоохранение'),
    ('Развлечения'),
    ('Социальные сети'),
    ('Логистика'),
    ('Недвижимость'),
    ('Путешествия'),
    ('Foodtech');

-- Города
INSERT INTO cities (name) VALUES
    ('Москва'),
    ('Санкт-Петербург'),
    ('Новосибирск'),
    ('Екатеринбург'),
    ('Казань'),
    ('Нижний Новгород'),
    ('Челябинск'),
    ('Самара'),
    ('Ростов-на-Дону'),
    ('Уфа'),
    ('Красноярск'),
    ('Воронеж'),
    ('Пермь'),
    ('Волгоград'),
    ('Краснодар');

-- +migrate Down
DELETE FROM cities;
DELETE FROM directions;
DELETE FROM specializations;
