# Nutrients Backend — REST API

## Таблицы базы данных

### Таблица users — пользователи системы

Хранит учётные записи пользователей. Поля: `id` (первичный ключ), `username` (уникальный логин, varchar 100), `password` (пароль, varchar 255), `role` (роль, varchar 50, по умолчанию `создатель`).

### Таблица nutrients — нутриенты

Хранит карточки нутриентов. Поля: `id` (первичный ключ), `name` (название, varchar 100), `dailyNorm` (дневная норма, float, nullable), `unit` (единица измерения, varchar 20, nullable), `description` (описание, text, nullable), `status` (статус: `черновик`, `опубликован`, `удален`, varchar 20, по умолчанию `черновик`), `imageKey` (ключ изображения в MinIO, varchar 255), `videoKey` (ключ видео в MinIO, varchar 255), `createdAt` (дата создания, timestamp), `formedAt` (дата публикации, timestamp, nullable), `creatorId` (внешний ключ на `users.id`, int).

Связь: `creatorId` → `users.id` (многие-к-одному, `onDelete: RESTRICT`).

### Таблица likes — лайки

Хранит лайки пользователей к нутриентам (связь многие-ко-многим). Поля: `id` (первичный ключ), `userId` (внешний ключ на `users.id`, int), `nutrientId` (внешний ключ на `nutrients.id`, int).

Связи: `userId` → `users.id` и `nutrientId` → `nutrients.id` (оба `onDelete: RESTRICT`).

Количество лайков не хранится в таблице `nutrients`. Оно вычисляется на лету через `SELECT COUNT(*) FROM likes WHERE "nutrientId" = $1`.

## Методы веб-сервиса

### Домен nutrients — нутриенты

#### 1. GET /api/nutrients

Получение списка опубликованных нутриентов с фильтрацией.

Query-параметры: `search` (поиск по названию, ILIKE), `minNorm` (минимальная дневная норма, число), `maxNorm` (максимальная дневная норма, число). Все параметры необязательные.

Возвращает массив объектов NutrientResponseDto. Каждый объект содержит: `id`, `name`, `description`, `dailyNorm`, `unit`, `imageKey` (signed URL из MinIO), `videoKey` (signed URL), `likesCount` (вычисляемое), `createdAt`, `formedAt`, `creatorId`.

#### 2. GET /api/nutrients/feed

Получение ленты опубликованных нутриентов (первая карточка).

Параметры не требуются.

Возвращает один объект NutrientResponseDto — первую опубликованную запись (сортировка по `id ASC`).

#### 3. GET /api/nutrients/draft

Получение черновика текущего пользователя (не более одного).

Параметры не требуются. ID не указывается — сервер сам определяет пользователя через `getCurrentCreatorId()`.

Возвращает объект NutrientResponseDto или `null`, если черновика нет.

#### 4. POST /api/nutrients

Создание нового черновика с загрузкой файлов.

Content-Type: `multipart/form-data`.

Поля формы: `name` (обязательное, минимум 3 символа), `description` (необязательное), `dailyNorm` (необязательное, число больше или равно 0), `unit` (необязательное), `image` (необязательный файл, jpg/jpeg/png/gif/webp), `video` (необязательный файл, mp4/webm/ogg).

Серверные поля (устанавливаются автоматически, клиент их не передаёт): `status = 'черновик'`, `creatorId = getCurrentCreatorId()`, `imageKey` и `videoKey` — ключи загруженных файлов.

Возвращает объект NutrientResponseDto. Если у пользователя уже есть черновик — ошибка `400 Bad Request`.

#### 5. PUT /api/nutrients/{id}/publish

Публикация черновика (смена статуса).

Параметры: `id` (обязательный, в URL). Тело запроса отсутствует.

Меняет `status` на `'опубликован'` и устанавливает `formedAt = new Date()`.

Возвращает объект NutrientResponseDto. Если черновик не найден — ошибка `404 Not Found`.

#### 6. DELETE /api/nutrients/{id}

Мягкое удаление нутриента.

Параметры: `id` (обязательный, в URL).

Меняет `status` на `'удален'` (SQL UPDATE, не DELETE). Запись остаётся в БД, но не отдаётся клиенту.

Возвращает `204 No Content`. Если запись не найдена или уже удалена — ошибка `404 Not Found`.

#### 7. POST /api/nutrients/{id}/like

Поставить или убрать лайк от текущего пользователя.

Параметры: `id` (обязательный, в URL). Тело запроса: `{ "value": 1 }` — поставить лайк, `{ "value": 0 }` — убрать.

Логика идемпотентна: повторный `value=1` не создаёт дубликат, повторный `value=0` не падает.

Возвращает `204 No Content`. Если нутриент не найден или не опубликован — ошибка `404 Not Found`. Если `value` не 0 и не 1 — ошибка `400 Bad Request`.

### Домен users — пользователи

#### 8. POST /api/users/register

Регистрация нового пользователя.

Content-Type: `application/json`. Тело: `{ "username": "ivan", "password": "secret123" }`.

Валидация: `username` — минимум 3 символа, `password` — минимум 6 символов.

Возвращает объект `{ id, username, role }`. Пароль не возвращается. Если логин занят — ошибка `409 Conflict`.

#### 9. POST /api/users/auth

Аутентификация пользователя (заглушка для ЛР4).

Content-Type: `application/json`. Тело: `{ "username": "ivan", "password": "secret123" }`.

Возвращает объект `{ id, username, role }` с HTTP-кодом `200 OK`. Если данные неверны — ошибка `401 Unauthorized`.

#### 10. POST /api/users/deauth

Деавторизация пользователя (заглушка для ЛР4).

Возвращает `204 No Content`.