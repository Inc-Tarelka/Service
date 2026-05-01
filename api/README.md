# Tarelka API

Backend API для Telegram Mini App Tarelka.

## Структура проекта

```
tarelka-api/
├── cmd/
│   └── api/
│       └── main.go           # Точка входа приложения
├── internal/
│   ├── config/
│   │   └── config.go         # Конфигурация приложения
│   ├── model/
│   │   ├── user.go           # Модели пользователей
│   │   ├── reference.go      # Модели справочников
│   │   ├── token.go          # Модели токенов
│   │   └── dto.go            # DTO для API
│   ├── repository/
│   │   ├── repository.go     # Агрегатор репозиториев
│   │   ├── tg_user.go        # Репозиторий Telegram пользователей
│   │   ├── tarelka_user.go   # Репозиторий Tarelka пользователей
│   │   ├── reference.go      # Репозиторий справочников
│   │   └── token.go          # Репозиторий токенов
│   ├── service/
│   │   ├── service.go        # Агрегатор сервисов
│   │   ├── auth.go           # Сервис авторизации
│   │   ├── user.go           # Сервис пользователей
│   │   └── reference.go      # Сервис справочников
│   └── handler/
│       ├── handler.go        # Агрегатор хендлеров + роуты
│       ├── auth.go           # Хендлеры авторизации
│       ├── user.go           # Хендлеры пользователей
│       └── reference.go      # Хендлеры справочников
├── migrations/               # SQL миграции
├── docs/                     # Swagger документация
├── docker-compose.yml
├── Dockerfile
├── Makefile
└── go.mod
```

## Быстрый старт

### Предварительные требования

- Go 1.23+
- Docker и Docker Compose
- Make (опционально)

### Запуск с Docker

```bash
# Клонировать репозиторий
git clone https://github.com/Inc-Tarelka/api.git
cd api

# Создать .env файл
cp .env.example .env
# Отредактировать .env и добавить TELEGRAM_BOT_TOKEN

# Запустить всё через Docker Compose
docker-compose up -d

# Проверить логи
docker-compose logs -f
```

### Локальный запуск (для разработки)

```bash
# Запустить только PostgreSQL
docker-compose up -d postgres

# Установить зависимости
go mod download

# Применить миграции (см. раздел "Миграции")
# ...

# Запустить API
go run ./cmd/api
```

## API Endpoints

После запуска Swagger UI доступен по адресу: http://localhost:8080/swagger/index.html

### Auth (публичные)
- `POST /api/v1/auth/telegram/register` - Регистрация через Telegram
- `POST /api/v1/auth/login` - Авторизация по логину/паролю
- `POST /api/v1/auth/refresh` - Обновление токенов
- `POST /api/v1/auth/logout` - Выход (отзыв refresh token)

### References (публичные)
- `GET /api/v1/references/specializations` - Список специализаций
- `GET /api/v1/references/directions` - Список направлений
- `GET /api/v1/references/cities` - Список городов

### Users (требуют авторизации)
- `GET /api/v1/users/me` - Текущий пользователь
- `GET /api/v1/users/:id` - Получить пользователя по ID

---

## Миграции базы данных

### Автоматическое применение (при старте PostgreSQL)

При первом запуске Docker Compose миграции из папки `migrations/` автоматически применяются к базе данных (через механизм `/docker-entrypoint-initdb.d`).

**Важно:** Это работает только при первом запуске (когда volume `postgres_data` пустой).

### Ручное применение миграций

#### Вариант 1: Использование sql-migrate (рекомендуется)

```bash
# Установить sql-migrate
go install github.com/rubenv/sql-migrate/...@latest

# Применить все новые миграции
sql-migrate up -config=dbconfig.yml

# Откатить последнюю миграцию
sql-migrate down -config=dbconfig.yml

# Посмотреть статус миграций
sql-migrate status -config=dbconfig.yml
```

#### Вариант 2: Использование psql напрямую

```bash
# Подключиться к БД
psql "postgres://tarelka:tarelka@localhost:5432/tarelka?sslmode=disable"

# Применить миграции по порядку
\i migrations/001_init.sql
\i migrations/002_references.sql
\i migrations/003_seed_data.sql
```

Или одной командой:
```bash
psql "postgres://tarelka:tarelka@localhost:5432/tarelka" -f migrations/001_init.sql
psql "postgres://tarelka:tarelka@localhost:5432/tarelka" -f migrations/002_references.sql
psql "postgres://tarelka:tarelka@localhost:5432/tarelka" -f migrations/003_seed_data.sql
```

#### Вариант 3: Через Makefile

```bash
make migrate-up      # Применить миграции
make migrate-down    # Откатить последнюю миграцию
make migrate-status  # Посмотреть статус
```

### Создание новой миграции

1. Создайте новый файл в папке `migrations/` с именем в формате:
   ```
   NNN_description.sql
   ```
   Где `NNN` - порядковый номер (например, `004_add_avatars.sql`)

2. Структура файла миграции:
   ```sql
   -- +migrate Up
   -- Ваши SQL команды для применения миграции
   CREATE TABLE example (
       id BIGSERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL
   );

   -- +migrate Down
   -- Ваши SQL команды для отката миграции
   DROP TABLE IF EXISTS example;
   ```

3. Примените миграцию:
   ```bash
   sql-migrate up -config=dbconfig.yml
   ```

### Откат миграций

```bash
# Откатить последнюю миграцию
sql-migrate down -config=dbconfig.yml

# Откатить N миграций
sql-migrate down -config=dbconfig.yml -limit=N
```

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `ENVIRONMENT` | Режим работы (development/production) | development |
| `PORT` | Порт API сервера | 8080 |
| `DATABASE_URL` | URL подключения к PostgreSQL | - |
| `JWT_SECRET` | Секрет для подписи JWT токенов | - |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | - |
| `ACCESS_TOKEN_TTL` | Время жизни access token | 15m |
| `REFRESH_TOKEN_TTL` | Время жизни refresh token | 168h (7 дней) |

## Архитектура

### Слои приложения

```
Handler (HTTP) → Service (Business Logic) → Repository (Database)
     ↓                    ↓                        ↓
   model.DTO          model.*                  model.*
```

1. **Handler** - HTTP обработчики, валидация запросов, маршрутизация
2. **Service** - Бизнес-логика, авторизация, валидация данных
3. **Repository** - Доступ к данным (PostgreSQL через pgx)
4. **Model** - Структуры данных и DTO

### Auth Flow

1. **Регистрация через Telegram** (`POST /auth/telegram/register`):
   - Валидация `initData` (HMAC-SHA256 проверка подписи)
   - Проверка `auth_date` (не старше 5 минут)
   - Создание `tg_user` (если не существует)
   - Создание `tarelka_user` + subtype (person/company)
   - Создание связей со справочниками
   - Генерация access + refresh токенов

2. **Авторизация токенами**:
   - Access token: JWT (HS256), TTL 15 минут
   - Refresh token: UUID, хранится в БД, TTL 7 дней
   - При refresh старый токен отзывается (ротация)

3. **Защита эндпоинтов**:
   - Middleware проверяет заголовок `Authorization: Bearer <access_token>`
   - Извлекает `user_id` и `user_type` из JWT claims
   - Добавляет в контекст запроса

## Разработка

### Генерация Swagger документации

```bash
# Установить swag
go install github.com/swaggo/swag/cmd/swag@latest

# Сгенерировать документацию
swag init -g cmd/api/main.go -o docs
```

### Запуск тестов

```bash
go test -v ./...
```

### Полезные команды

```bash
make build        # Сборка бинарника
make run          # Локальный запуск
make docker-up    # Запуск Docker Compose
make docker-down  # Остановка Docker Compose
make swagger      # Генерация Swagger docs
make deps         # Установка Go зависимостей
make tools        # Установка инструментов (swag, sql-migrate)
```

## License

MIT

---

## Ручной деплой через GitHub Actions

Workflow: `.github/workflows/deploy.yml`

- `backend` ветка → тестовый сервер (текущий сценарий, `docker-compose.yml`)
- `main` ветка → production сервер `193.187.94.235` (`docker-compose.prod.yml`)

### Как запускать

1. Откройте **Actions** → **Deploy API to Server**.
2. Нажмите **Run workflow**.
3. Выберите ветку:
   - `backend` для тестового деплоя
   - `main` для production деплоя
4. `force_target` оставьте `auto` (или задайте вручную `test`/`prod`).

### Важно для production

- На `193.187.94.235` должен существовать файл `/root/api/.env.prod`.
- В `.env.prod` обязательно задать рабочий `DATABASE_URL` к внешней БД.
- Для домена используйте `API_HOST=tarelka-kino.ru` и `API_HOST_WWW=www.tarelka-kino.ru`.
- Workflow не хранит прод-секреты в репозитории: он переиспользует уже созданный на сервере `.env.prod`.
