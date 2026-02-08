BEGIN;

-- Tags dictionaries
INSERT INTO publication_tags (name) VALUES
    ('Сценарий'),
    ('Режиссура'),
    ('Операторская работа'),
    ('Монтаж'),
    ('Продюсирование')
ON CONFLICT (name) DO NOTHING;

INSERT INTO need_tags (name) VALUES
    ('Камера'),
    ('Освещение'),
    ('Звук'),
    ('Локации'),
    ('Костюмы')
ON CONFLICT (name) DO NOTHING;

-- Telegram owners
INSERT INTO tg_users (telegram_id) VALUES
    (1000000001), (1000000002), (1000000003), (1000000004), (1000000005),
    (1000000006), (1000000007), (1000000008), (1000000009), (1000000010),
    (1000000011), (1000000012)
ON CONFLICT (telegram_id) DO NOTHING;

-- PERSON users
WITH u AS (
    INSERT INTO tarelka_users (tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, wallpaper_url, bio, education, find_work)
    VALUES
        (1000000001, 'PERSON', 'writer_ivan', '+79990000001', 'seed_hash', 'https://example.com/u/writer_ivan/logo.jpg', 'https://t.me/writer_ivan', 'https://example.com/u/writer_ivan/wall.jpg', 'Сценарист для кино и ТВ.', 'ВГИК', 'LOOKING'),
        (1000000002, 'PERSON', 'director_anna', '+79990000002', 'seed_hash', 'https://example.com/u/director_anna/logo.jpg', 'https://t.me/director_anna', 'https://example.com/u/director_anna/wall.jpg', 'Режиссёр игровых и документальных фильмов.', 'ВГИК', 'OPEN_TO_OFFERS'),
        (1000000003, 'PERSON', 'dop_sergey', '+79990000003', 'seed_hash', 'https://example.com/u/dop_sergey/logo.jpg', 'https://t.me/dop_sergey', 'https://example.com/u/dop_sergey/wall.jpg', 'Оператор-постановщик.', 'МГУКИ', 'LOOKING'),
        (1000000004, 'PERSON', 'editor_maria', '+79990000004', 'seed_hash', 'https://example.com/u/editor_maria/logo.jpg', 'https://t.me/editor_maria', 'https://example.com/u/editor_maria/wall.jpg', 'Монтажёр, постпродакшн.', 'Школа кино', 'NOT_LOOKING'),
        (1000000005, 'PERSON', 'sound_alex', '+79990000005', 'seed_hash', 'https://example.com/u/sound_alex/logo.jpg', 'https://t.me/sound_alex', 'https://example.com/u/sound_alex/wall.jpg', 'Звукорежиссёр.', 'СПбГУКиТ', 'OPEN_TO_OFFERS'),
        (1000000006, 'PERSON', 'light_olga', '+79990000006', 'seed_hash', 'https://example.com/u/light_olga/logo.jpg', 'https://t.me/light_olga', 'https://example.com/u/light_olga/wall.jpg', 'Гафер, постановка света.', 'Киношкола', 'LOOKING'),
        (1000000007, 'PERSON', 'location_roman', '+79990000007', 'seed_hash', 'https://example.com/u/location_roman/logo.jpg', 'https://t.me/location_roman', 'https://example.com/u/location_roman/wall.jpg', 'Локационный менеджер.', 'МосГУ', 'LOOKING'),
        (1000000008, 'PERSON', 'costume_ekaterina', '+79990000008', 'seed_hash', 'https://example.com/u/costume_ekaterina/logo.jpg', 'https://t.me/costume_ekaterina', 'https://example.com/u/costume_ekaterina/wall.jpg', 'Художник по костюмам.', 'СПбГУ', 'OPEN_TO_OFFERS')
    ON CONFLICT (username) DO NOTHING
    RETURNING id, username
)
INSERT INTO tarelka_persons (tarelka_user_id, name, surname)
SELECT id,
       CASE username
           WHEN 'writer_ivan' THEN 'Иван'
           WHEN 'director_anna' THEN 'Анна'
           WHEN 'dop_sergey' THEN 'Сергей'
           WHEN 'editor_maria' THEN 'Мария'
           WHEN 'sound_alex' THEN 'Алексей'
           WHEN 'light_olga' THEN 'Ольга'
           WHEN 'location_roman' THEN 'Роман'
           WHEN 'costume_ekaterina' THEN 'Екатерина'
       END AS name,
       CASE username
           WHEN 'writer_ivan' THEN 'Петров'
           WHEN 'director_anna' THEN 'Иванова'
           WHEN 'dop_sergey' THEN 'Сидоров'
           WHEN 'editor_maria' THEN 'Орлова'
           WHEN 'sound_alex' THEN 'Алексеев'
           WHEN 'light_olga' THEN 'Светлова'
           WHEN 'location_roman' THEN 'Романов'
           WHEN 'costume_ekaterina' THEN 'Костина'
       END AS surname
FROM u
ON CONFLICT (tarelka_user_id) DO NOTHING;

-- COMPANY users
WITH c AS (
    INSERT INTO tarelka_users (tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, wallpaper_url, bio, education, find_work)
    VALUES
        (1000000009,  'COMPANY', 'prod_house_moscow', '+79990000009', 'seed_hash', 'https://example.com/u/prod_house_moscow/logo.jpg', 'https://t.me/prod_house_moscow', 'https://example.com/u/prod_house_moscow/wall.jpg', 'Продакшн-студия (Москва).', NULL, NULL),
        (1000000010, 'COMPANY', 'film_school_spb',   '+79990000010', 'seed_hash', 'https://example.com/u/film_school_spb/logo.jpg',   'https://t.me/film_school_spb',   'https://example.com/u/film_school_spb/wall.jpg',   'Киношкола и площадка.', NULL, NULL),
        (1000000011, 'COMPANY', 'equipment_rental',  '+79990000011', 'seed_hash', 'https://example.com/u/equipment_rental/logo.jpg',  'https://t.me/equipment_rental',  'https://example.com/u/equipment_rental/wall.jpg',  'Прокат кинооборудования.', NULL, NULL),
        (1000000012, 'COMPANY', 'post_house',        '+79990000012', 'seed_hash', 'https://example.com/u/post_house/logo.jpg',        'https://t.me/post_house',        'https://example.com/u/post_house/wall.jpg',        'Постпродакшн студия.', NULL, NULL)
    ON CONFLICT (username) DO NOTHING
    RETURNING id, username
)
INSERT INTO tarelka_companies (tarelka_user_id, company_name)
SELECT id,
       CASE username
         WHEN 'prod_house_moscow' THEN 'Продакшн Москва'
         WHEN 'film_school_spb' THEN 'Киношкола СПб'
         WHEN 'equipment_rental' THEN 'Прокат оборудования'
         WHEN 'post_house' THEN 'Постпродакшн Хаус'
       END AS company_name
FROM c
ON CONFLICT (tarelka_user_id) DO NOTHING;

-- Relations: specializations, directions, cities
INSERT INTO user_specializations (tarelka_user_id, specialization_id)
SELECT u.id, spec_id
FROM tarelka_users u
JOIN (VALUES
    ('writer_ivan', 1),
    ('director_anna', 7),
    ('dop_sergey', 1),
    ('editor_maria', 6),
    ('sound_alex', 10),
    ('light_olga', 4),
    ('location_roman', 9),
    ('costume_ekaterina', 6),
    ('prod_house_moscow', 7),
    ('post_house', 6)
) AS vs(username, spec_id) ON vs.username = u.username
ON CONFLICT DO NOTHING;

INSERT INTO user_directions (tarelka_user_id, direction_id)
SELECT u.id, dir_id
FROM tarelka_users u
JOIN (VALUES
    ('writer_ivan', 5),
    ('director_anna', 5),
    ('dop_sergey', 5),
    ('editor_maria', 5),
    ('sound_alex', 5),
    ('light_olga', 5),
    ('location_roman', 5),
    ('costume_ekaterina', 5),
    ('prod_house_moscow', 5),
    ('post_house', 5)
) AS vd(username, dir_id) ON vd.username = u.username
ON CONFLICT DO NOTHING;

INSERT INTO user_cities (tarelka_user_id, city_id)
SELECT u.id, city_id
FROM tarelka_users u
JOIN (VALUES
    ('writer_ivan', 1), -- Москва
    ('director_anna', 2), -- СПб
    ('dop_sergey', 1),
    ('editor_maria', 2),
    ('sound_alex', 1),
    ('light_olga', 2),
    ('location_roman', 1),
    ('costume_ekaterina', 2),
    ('prod_house_moscow', 1),
    ('film_school_spb', 2),
    ('equipment_rental', 1),
    ('post_house', 2)
) AS vc(username, city_id) ON vc.username = u.username
ON CONFLICT DO NOTHING;

-- Publications
INSERT INTO publications (author_id, name, description, type, city_id)
SELECT u.id,
       p.name,
       p.description,
       p.type::publication_type_enum,
       p.city_id
FROM tarelka_users u
JOIN (VALUES
    ('writer_ivan',        'Короткометражка "Город ночью"', 'Авторский проект — сценарий и поиск команды.', 'PROJECT', 1),
    ('director_anna',      'Докфильм "Пульс города"',       'Документальный фильм — нужен оператор и звук.', 'PROJECT', 2),
    ('dop_sergey',         'Операторские услуги',            'Съемка на RED/Arri, опыт 7 лет.', 'SERVICE', 1),
    ('editor_maria',       'Монтаж и цветокор',              'Постпродакшн для клипов и короткого метра.', 'SERVICE', 2),
    ('sound_alex',         'Звук на площадке',               'Запись диалогов/атмосфер, микс.', 'SERVICE', 1),
    ('light_olga',         'Свет для съемки',                'Гафер, световые схемы под ключ.', 'SERVICE', 2),
    ('location_roman',     'Локации Москвы',                 'Подбор и согласование площадок.', 'SERVICE', 1),
    ('costume_ekaterina',  'Костюмы под проект',             'Разработка образов для фильма.', 'SERVICE', 2),
    ('prod_house_moscow',  'Продакшн под ключ',              'Производство рекламных роликов.', 'SERVICE', 1),
    ('film_school_spb',    'Студенческий проект',            'Нужны специалисты для учебной постановки.', 'PROJECT', 2),
    ('equipment_rental',   'Прокат камеры и света',          'RED Komodo, Arri SkyPanel и др.', 'SERVICE', 1),
    ('post_house',         'Постпродакшн услуги',            'Монтаж, VFX, саунд-дизайн.', 'SERVICE', 2)
) AS p(username, name, description, type, city_id) ON p.username = u.username
ON CONFLICT DO NOTHING;

-- Publication images
INSERT INTO publication_images (publication_id, url, position)
SELECT pub.id, CONCAT('https://example.com/p/', REPLACE(LOWER(pub.name), ' ', '_'), '/img1.jpg'), 1
FROM publications pub
WHERE pub.name IN (
  'Короткометражка "Город ночью"', 'Докфильм "Пульс города"', 'Операторские услуги', 'Монтаж и цветокор',
  'Звук на площадке', 'Свет для съемки', 'Локации Москвы', 'Костюмы под проект',
  'Продакшн под ключ', 'Студенческий проект', 'Прокат камеры и света', 'Постпродакшн услуги'
);

INSERT INTO publication_images (publication_id, url, position)
SELECT pub.id, CONCAT('https://example.com/p/', REPLACE(LOWER(pub.name), ' ', '_'), '/img2.jpg'), 2
FROM publications pub
WHERE pub.name IN (
  'Короткометражка "Город ночью"', 'Докфильм "Пульс города"', 'Операторские услуги', 'Монтаж и цветокор',
  'Звук на площадке', 'Свет для съемки', 'Локации Москвы', 'Костюмы под проект',
  'Продакшн под ключ', 'Студенческий проект', 'Прокат камеры и света', 'Постпродакшн услуги'
);

-- Publication tag links
WITH t AS (
    SELECT id, name FROM publication_tags WHERE name IN ('Сценарий','Режиссура','Операторская работа','Монтаж','Продюсирование')
)
INSERT INTO publication_tag_links (publication_id, tag_id)
SELECT pub.id, t.id
FROM publications pub
JOIN (
    SELECT 'Короткометражка "Город ночью"' AS pub_name, 'Сценарий' AS tag UNION ALL
    SELECT 'Короткометражка "Город ночью"', 'Режиссура' UNION ALL
    SELECT 'Докфильм "Пульс города"', 'Режиссура' UNION ALL
    SELECT 'Докфильм "Пульс города"', 'Операторская работа' UNION ALL
    SELECT 'Операторские услуги', 'Операторская работа' UNION ALL
    SELECT 'Монтаж и цветокор', 'Монтаж' UNION ALL
    SELECT 'Звук на площадке', 'Продюсирование' UNION ALL
    SELECT 'Свет для съемки', 'Продюсирование' UNION ALL
    SELECT 'Локации Москвы', 'Продюсирование' UNION ALL
    SELECT 'Костюмы под проект', 'Продюсирование' UNION ALL
    SELECT 'Продакшн под ключ', 'Продюсирование' UNION ALL
    SELECT 'Студенческий проект', 'Сценарий' UNION ALL
    SELECT 'Студенческий проект', 'Режиссура' UNION ALL
    SELECT 'Прокат камеры и света', 'Операторская работа' UNION ALL
    SELECT 'Постпродакшн услуги', 'Монтаж'
) m ON m.pub_name = pub.name
JOIN t ON t.name = m.tag
ON CONFLICT DO NOTHING;

-- Co-authors
INSERT INTO publication_co_authors (publication_id, user_id)
SELECT p.id, u.id
FROM publications p
JOIN tarelka_users u ON u.username IN ('dop_sergey','editor_maria','sound_alex')
WHERE p.name IN ('Докфильм "Пульс города"','Короткометражка "Город ночью"')
ON CONFLICT DO NOTHING;

-- Needs (~30)
WITH pubs AS (
    SELECT id, name FROM publications
    WHERE name IN (
      'Короткометражка "Город ночью"', 'Докфильм "Пульс города"', 'Операторские услуги', 'Монтаж и цветокор',
      'Звук на площадке', 'Свет для съемки', 'Локации Москвы', 'Костюмы под проект',
      'Продакшн под ключ', 'Студенческий проект', 'Прокат камеры и света', 'Постпродакшн услуги'
    )
), nt AS (
    SELECT id, name FROM need_tags WHERE name IN ('Камера','Освещение','Звук','Локации','Костюмы')
)
INSERT INTO needs (publication_id, name, description, budget, deadline_start, deadline_end, city_id)
SELECT p.id,
       n.name,
       n.description,
       n.budget,
       n.deadline_start,
       n.deadline_end,
       n.city_id
FROM pubs p
JOIN (
    SELECT 'Короткометражка "Город ночью"' AS pub_name, 'Нужен оператор' AS name, 'Съёмка ночных сцен, опыт с низким освещением.' AS description, 150000 AS budget, NOW() + INTERVAL '7 days' AS deadline_start, NOW() + INTERVAL '21 days' AS deadline_end, 1 AS city_id UNION ALL
    SELECT 'Короткометражка "Город ночью"', 'Нужен художник по костюмам', 'Образы для городских персонажей.', 80000, NOW() + INTERVAL '10 days', NOW() + INTERVAL '30 days', 1 UNION ALL
    SELECT 'Докфильм "Пульс города"', 'Нужен звукорежиссёр', 'Запись синхронного звука на улицах.', 120000, NOW() + INTERVAL '5 days', NOW() + INTERVAL '25 days', 2 UNION ALL
    SELECT 'Докфильм "Пульс города"', 'Нужен локационный менеджер', 'Подбор реальных локаций, согласования.', 100000, NOW() + INTERVAL '3 days', NOW() + INTERVAL '20 days', 2 UNION ALL
    SELECT 'Операторские услуги', 'Съёмочная группа (камера+свет)', 'Комплект команды для рекламной съёмки.', 300000, NOW() + INTERVAL '14 days', NOW() + INTERVAL '45 days', 1 UNION ALL
    SELECT 'Монтаж и цветокор', 'Цветокор для клипа', 'Нужен колорист, ACES.', 90000, NOW() + INTERVAL '2 days', NOW() + INTERVAL '15 days', 2 UNION ALL
    SELECT 'Монтаж и цветокор', 'VFX специалист', 'Несколько шотов на замену неба.', 110000, NOW() + INTERVAL '10 days', NOW() + INTERVAL '35 days', 2 UNION ALL
    SELECT 'Звук на площадке', 'Бум-оператор', 'Съёмка диалогов в интерьере.', 60000, NOW() + INTERVAL '1 days', NOW() + INTERVAL '10 days', 1 UNION ALL
    SELECT 'Звук на площадке', 'Фоли', 'Постозвучание некоторых сцен.', 70000, NOW() + INTERVAL '12 days', NOW() + INTERVAL '40 days', 1 UNION ALL
    SELECT 'Свет для съемки', 'Световая команда', 'Построение световой схемы под плейсы.', 160000, NOW() + INTERVAL '6 days', NOW() + INTERVAL '18 days', 2 UNION ALL
    SELECT 'Свет для съемки', 'Генератор', 'Аренда генератора на выездную съёмку.', 50000, NOW() + INTERVAL '8 days', NOW() + INTERVAL '14 days', 2 UNION ALL
    SELECT 'Локации Москвы', 'Локации: крыши', 'Подбор высоких точек с видом.', 40000, NOW() + INTERVAL '4 days', NOW() + INTERVAL '12 days', 1 UNION ALL
    SELECT 'Локации Москвы', 'Локации: индустриальные', 'Цеха/заводы, оформление.', 60000, NOW() + INTERVAL '9 days', NOW() + INTERVAL '20 days', 1 UNION ALL
    SELECT 'Костюмы под проект', 'Пошив образов', 'Нужны три образа 60-х.', 130000, NOW() + INTERVAL '20 days', NOW() + INTERVAL '60 days', 2 UNION ALL
    SELECT 'Костюмы под проект', 'Реквизит', 'Аксессуары для костюмов.', 30000, NOW() + INTERVAL '5 days', NOW() + INTERVAL '25 days', 2 UNION ALL
    SELECT 'Продакшн под ключ', 'Комплект актёров', 'Кастинг для рекламного ролика.', 200000, NOW() + INTERVAL '7 days', NOW() + INTERVAL '28 days', 1 UNION ALL
    SELECT 'Продакшн под ключ', 'Локации: студия', 'Аренда студии на 2 дня.', 150000, NOW() + INTERVAL '15 days', NOW() + INTERVAL '35 days', 1 UNION ALL
    SELECT 'Студенческий проект', 'Оператор на учебную постановку', 'Съёмка на бюджетную камеру.', 30000, NOW() + INTERVAL '3 days', NOW() + INTERVAL '7 days', 2 UNION ALL
    SELECT 'Студенческий проект', 'Монтаж', 'Сборка учебного фильма.', 20000, NOW() + INTERVAL '8 days', NOW() + INTERVAL '16 days', 2 UNION ALL
    SELECT 'Студенческий проект', 'Звук', 'Запись голоса/атмосфер.', 15000, NOW() + INTERVAL '2 days', NOW() + INTERVAL '10 days', 2 UNION ALL
    SELECT 'Прокат камеры и света', 'Аренда RED Komodo', 'Камера на 3 дня.', 45000, NOW() + INTERVAL '5 days', NOW() + INTERVAL '10 days', 1 UNION ALL
    SELECT 'Прокат камеры и света', 'Аренда SkyPanel', '2 панели на смену.', 30000, NOW() + INTERVAL '4 days', NOW() + INTERVAL '9 days', 1 UNION ALL
    SELECT 'Постпродакшн услуги', 'Саунд-дизайн', 'Создание звуковых эффектов.', 120000, NOW() + INTERVAL '12 days', NOW() + INTERVAL '30 days', 2 UNION ALL
    SELECT 'Постпродакшн услуги', 'DCP подготовка', 'Экспорт для фестиваля.', 80000, NOW() + INTERVAL '10 days', NOW() + INTERVAL '25 days', 2 UNION ALL
    SELECT 'Постпродакшн услуги', 'Сведение', 'Финальный микс.', 100000, NOW() + INTERVAL '20 days', NOW() + INTERVAL '40 days', 2 UNION ALL
    SELECT 'Операторские услуги', '1st AC', 'Фокус-пуллер на смену.', 40000, NOW() + INTERVAL '2 days', NOW() + INTERVAL '12 days', 1 UNION ALL
    SELECT 'Свет для съемки', 'Grip', 'Грип-оборудование на смену.', 50000, NOW() + INTERVAL '1 days', NOW() + INTERVAL '7 days', 2 UNION ALL
    SELECT 'Звук на площадке', 'Lav микрофоны', 'Петлички на 2 дня.', 20000, NOW() + INTERVAL '6 days', NOW() + INTERVAL '12 days', 1
) AS n(pub_name, name, description, budget, deadline_start, deadline_end, city_id) ON n.pub_name = p.name
ON CONFLICT DO NOTHING;

-- Need tag links
WITH nt AS (
    SELECT id, name FROM need_tags WHERE name IN ('Камера','Освещение','Звук','Локации','Костюмы')
)
INSERT INTO need_tag_links (need_id, tag_id)
SELECT n.id, nt.id
FROM needs n
JOIN nt ON (
    (n.name ILIKE '%оператор%' AND nt.name = 'Камера') OR
    (n.name ILIKE '%камера%' AND nt.name = 'Камера') OR
    (n.name ILIKE '%свет%' AND nt.name = 'Освещение') OR
    (n.name ILIKE '%генератор%' AND nt.name = 'Освещение') OR
    (n.name ILIKE '%звук%' AND nt.name = 'Звук') OR
    (n.name ILIKE '%lav%' AND nt.name = 'Звук') OR
    (n.name ILIKE '%студия%' AND nt.name = 'Локации') OR
    (n.name ILIKE '%локац%' AND nt.name = 'Локации') OR
    (n.name ILIKE '%костюм%' AND nt.name = 'Костюмы') OR
    (n.name ILIKE '%образ%' AND nt.name = 'Костюмы')
)
ON CONFLICT DO NOTHING;

COMMIT;
