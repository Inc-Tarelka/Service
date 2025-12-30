# Дока на фронте

---

## Архитектура проекта

Проект написан в соответствии с методологией Feature sliced design

Ссылка на документацию - [feature sliced design](https://feature-sliced.github.io/documentation/ru/docs/get-started/overview)

---

## Скрипты

- `npm run dev` - Запуск frontend проекта на vite
- `npm run build` - Сборка проекта
- `npm run serv` - использовать в dev, создает url для работы внутри TG mini app (botFather)

---

### Работа с данными

Взаимодействие с данными осуществляется с помощью mobx.

Запросы на сервер отправляются с помощью [Mobx-utils](https://github.com/mobxjs/mobx-utils)

## Для SSR используется подход с [root-store mobx](https://mobx-cookbook.github.io/react-integration)

## Сущности (entities)

---

## CI pipeline и pre commit хуки

В ci прогоняется сборка проекта, линтинг.

В прекоммит хуках проверяем проект линтерами, конфиг в /.husky

---

## Фичи (features)
