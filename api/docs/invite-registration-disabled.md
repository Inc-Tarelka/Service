# Отключение регистрации по пригласительным ссылкам

Дата: 2026-05-22

## Что изменено

Регистрация стала открытой для всех пользователей без обязательной пригласительной ссылки (senderId). Структура БД не менялась, инвайт-логика оставлена в коде и может быть включена обратно.

Изменения в коде:

- `internal/service/auth.go`
  - В `PreRegister` удалена проверка/списание инвайта и заполнение `InvitedByUserID`.
  - `senderId` игнорируется при регистрации.
- `internal/model/dto.go`
  - `senderId` сделан необязательным в `RegisterRequest` и `PreRegisterRequest`.
  - Обновлены комментарии для `senderId` и `InviteLinkResponse`.
- `internal/handler/auth.go`
  - Удалён маппинг invite-ошибок (`invite_required`, `invalid_sender_id`, `invite_limit_reached`).
- `internal/handler/handler.go`
  - Эндпоинт `/createInviteLink` временно отключён (роут закомментирован).
  - Комментарий в `CreateInviteLink` помечает временное отключение.

## Как вернуть регистрацию по ссылке

1. **Включить проверку инвайта в `PreRegister`:**
   - В `internal/service/auth.go` вернуть вызов `validateInviteAndIncrement`.
   - Заполнять `InvitedByUserID` значением `inviterID`.

2. **Снова сделать `senderId` обязательным:**
   - В `internal/model/dto.go` вернуть `binding:"required"` в `PreRegisterRequest.SenderID`.
   - При необходимости сделать `senderId` обязательным в `RegisterRequest`.

3. **Вернуть invite-ошибки в обработчики:**
   - В `internal/handler/auth.go` вернуть маппинг строковых ошибок `invite_required`, `invite_not_configured`, `invalid_sender_id`, `invite_limit_reached`.

4. **Включить эндпоинт `/createInviteLink`:**
   - В `internal/handler/handler.go` раскомментировать `protected.GET("/createInviteLink", h.CreateInviteLink)`.

5. **Проверить конфигурацию:**
   - Убедиться, что `inviteSecret` задан в конфиге/секретах, иначе генерация инвайтов будет возвращать `invite_not_configured`.

## Примечания

- Миграции БД не требуются — поля и таблицы инвайтов остаются на месте.
- Логика генерации senderId и ограничения по лимитам сохранена в `AuthService`.
