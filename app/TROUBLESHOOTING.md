# Troubleshooting - Возможные проблемы и решения

## ✅ Добавленное логирование

### Уровни логирования:
- 🚀 - Инициализация
- 🔧 - Настройка зависимостей  
- 🎯 - Создание ViewModel
- 📊 - Состояние UI
- 💼 - UseCase операции
- 🗄️ - Repository операции
- 🐱 - API запросы
- ✅ - Успешные операции
- ❌ - Ошибки
- ⚠️ - Предупреждения
- 🔄 - Обновление данных
- ➕ - Загрузка дополнительных данных
- ⏸️ - Пропуск операции

### Логи по слоям:

#### 1. FeedScreen
```
🚀 FeedScreen: Initializing...
🔧 FeedScreen: Dependencies created
🎯 FeedScreen: Creating ViewModel
📊 FeedScreen State: isLoading=true, images=0, error=null
```

#### 2. FeedViewModel
```
📱 FeedViewModel: Loading images...
✅ FeedViewModel: Successfully loaded 10 images
```

#### 3. GetImagesUseCase
```
💼 GetImagesUseCase: Requesting 10 images...
✅ GetImagesUseCase: Successfully got 10 images
```

#### 4. FeedRepository
```
🗄️ FeedRepository: Fetching 10 images from API...
✅ FeedRepository: Got 10 images from API
```

#### 5. CatApi
```
🐱 CatApi: Requesting 10 images from Cat API...
🐱 CatApi: Response status: 200 OK
🐱 CatApi: Successfully loaded 10 images
🐱 Image: id=abc123, url=https://...
```

## 🔍 Возможные проблемы

### 1. Пустой экран / Ничего не показывается

#### Причина А: Ошибка сети
**Симптомы:**
```
❌ CatApi Error: Unable to resolve host
```

**Решение:**
- Проверьте разрешения в AndroidManifest.xml:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  ```
- Проверьте подключение к интернету
- Проверьте, что API работает: https://api.thecatapi.com/v1/images/search

#### Причина Б: API возвращает пустой список
**Симптомы:**
```
⚠️ FeedRepository: API returned empty list
✅ FeedRepository: Got 0 images from API
```

**Решение:**
- Проверьте API ключ в `KtorClient.kt`
- Проверьте лимиты API (может быть превышена квота)
- Попробуйте другой endpoint

#### Причина В: Ошибка сериализации JSON
**Симптомы:**
```
❌ CatApi Error: kotlinx.serialization.SerializationException
```

**Решение:**
- Проверьте модель `CatImage.kt` - все поля должны совпадать с API
- Добавьте `ignoreUnknownKeys = true` в JSON конфигурацию

#### Причина Г: ViewModel не инициализируется
**Симптомы:**
```
🚀 FeedScreen: Initializing...
🔧 FeedScreen: Dependencies created
(нет строки "🎯 FeedScreen: Creating ViewModel")
```

**Решение:**
- Проверьте зависимость `androidx.lifecycle.viewmodel.compose`
- Убедитесь, что все зависимости для ViewModel доступны

### 2. Бесконечная загрузка

#### Причина А: Зависание на запросе
**Симптомы:**
```
📱 FeedViewModel: Loading images...
🐱 CatApi: Requesting 10 images from Cat API...
(дальше ничего)
```

**Решение:**
- Проверьте таймауты в `KtorClient.kt` (сейчас 30 секунд)
- Проверьте, что сервер отвечает
- Добавьте обработку timeout исключений

#### Причина Б: Запрос завершился, но состояние не обновляется
**Симптомы:**
```
✅ FeedViewModel: Successfully loaded 10 images
📊 FeedScreen State: isLoading=true, images=0, error=null
```

**Решение:**
- Проверьте, что StateFlow правильно обновляется
- Убедитесь, что collectAsState() подписывается на изменения

### 3. Изображения не загружаются (показывается placeholder)

#### Причина А: Coil не настроен
**Решение:**
- Проверьте зависимости:
  ```kotlin
  implementation(libs.coil.compose)
  implementation(libs.coil.network.ktor)
  ```

#### Причина Б: Неправильные URL
**Симптомы в логах:**
```
🐱 Image: id=abc, url=null
```

**Решение:**
- API может вернуть некорректные URL
- Добавьте проверку на null в `CatImageItem.kt`

#### Причина В: HTTPS/CORS проблемы на iOS
**Решение:**
- Проверьте `Info.plist` - NSAppTransportSecurity настроен
- Убедитесь, что домен `api.thecatapi.com` разрешен

### 4. Ошибки при pull-to-refresh

#### Причина: API Material3 изменился
**Решение:**
- Используем `PullToRefreshBox` вместо старого API
- Убедитесь, что Material3 версия >= 1.2.0

### 5. Приложение крашится при старте

#### Причина А: Отсутствует зависимость
**Проверьте:**
- Все модули подключены в `settings.gradle.kts`
- Все зависимости в `build.gradle.kts`

#### Причина Б: Multiplatform конфликты
**Симптомы:**
```
KMP Dependencies Resolution Failure
```

**Решение:**
- Используйте `kotlinx-coroutines-core` в commonMain
- Используйте `kotlinx-coroutinesSwing` только в jvmMain

## 🛠️ Отладка

### Включение детального логирования Ktor

В `KtorClient.kt` измените:
```kotlin
install(Logging) {
    logger = Logger.DEFAULT
    level = LogLevel.ALL  // вместо INFO
}
```

### Проверка состояния через логи

После каждого изменения состояния должна появляться строка:
```
📊 FeedScreen State: isLoading=false, images=10, error=null
```

### Тестирование API вручную

```bash
curl -H "x-api-key: live_Z1ERXzBu5DjtK73hYSUSAffNgM2AVc519LfEPsnAIe7HjFJuwCr1pZXhQHbjDwjQ" \
  "https://api.thecatapi.com/v1/images/search?limit=10"
```

## 📝 Чек-лист перед запуском

- [ ] `INTERNET` permission добавлен в AndroidManifest.xml
- [ ] Info.plist настроен для iOS
- [ ] Все модули подключены в settings.gradle.kts
- [ ] Зависимости Ktor и Coil добавлены
- [ ] API ключ указан в KtorClient.kt
- [ ] Интернет соединение работает
- [ ] Логи включены (println не удален в release сборке)

## 🔄 Полный flow запроса

Правильная последовательность логов при успешной загрузке:

```
🚀 FeedScreen: Initializing...
🔧 FeedScreen: Dependencies created
🎯 FeedScreen: Creating ViewModel
📊 FeedScreen State: isLoading=true, images=0, error=null
📱 FeedViewModel: Loading images...
💼 GetImagesUseCase: Requesting 10 images...
🗄️ FeedRepository: Fetching 10 images from API...
🐱 CatApi: Requesting 10 images from Cat API...
🐱 CatApi: Response status: 200 OK
🐱 CatApi: Successfully loaded 10 images
🐱 Image: id=abc, url=https://...
✅ FeedRepository: Got 10 images from API
✅ GetImagesUseCase: Successfully got 10 images
✅ FeedViewModel: Successfully loaded 10 images
📊 FeedScreen State: isLoading=false, images=10, error=null
```

Если какой-то из этих логов пропущен - проблема на этом уровне!

