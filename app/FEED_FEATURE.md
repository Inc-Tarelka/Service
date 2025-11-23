# Feed Feature - MVI Architecture

## Обзор

Модуль `feature:feed` реализует ленту изображений котов с использованием MVI (Model-View-Intent) архитектуры и The Cat API.

## Структура проекта

### 1. core:network 
Модуль для работы с сетью на основе Ktor Client

#### Файлы:
- **KtorClient.kt** - Конфигурация Ktor клиента с:
  - Content Negotiation (JSON serialization)
  - Logging
  - DefaultRequest с API ключом
  - HttpTimeout настройки

- **model/CatImage.kt** - Data class для изображения кота:
```kotlin
@Serializable
data class CatImage(
    val id: String,
    val url: String,
    val width: Int,
    val height: Int
)
```

- **api/CatApi.kt** - API сервис для получения изображений:
```kotlin
suspend fun getImages(limit: Int = 10): List<CatImage>
```

### 2. feature:feed
Модуль с MVI архитектурой для отображения ленты

#### Data Layer (data/)
- **repository/FeedRepositoryImpl.kt** - Реализация репозитория:
  - Использует `CatApi` для получения данных
  - Обрабатывает ошибки и возвращает `Result<List<CatImage>>`

#### Domain Layer (domain/)
- **repository/FeedRepository.kt** - Интерфейс репозитория
- **usecase/GetImagesUseCase.kt** - Use Case для получения изображений:
  - Изолирует бизнес-логику от UI
  - Вызывает репозиторий

#### Presentation Layer (presentation/)

**MVI Components:**

1. **FeedEvent.kt** - Sealed interface для событий UI:
```kotlin
sealed interface FeedEvent {
    data object LoadImages : FeedEvent
    data object RefreshImages : FeedEvent
    data object LoadMore : FeedEvent
}
```

2. **FeedState.kt** - Data class состояния UI:
```kotlin
data class FeedState(
    val images: List<CatImage> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: String? = null
)
```

3. **FeedViewModel.kt** - ViewModel с логикой обработки событий:
   - Управляет состоянием через `StateFlow`
   - Обрабатывает события (`onEvent`)
   - Вызывает `GetImagesUseCase` для загрузки данных
   - Функции: `loadImages()`, `refreshImages()`, `loadMore()`

4. **FeedView.kt** - Composable для отображения UI:
   - Pull-to-refresh функциональность
   - Infinite scroll (автоматическая подгрузка при прокрутке)
   - Использует Coil для загрузки изображений
   - Error и Loading состояния
   - Lazy grid с картами изображений

5. **FeedScreen.kt** - Entry point экрана:
   - Создает зависимости (API, Repository, UseCase, ViewModel)
   - Связывает ViewModel и View
   - Передает state из ViewModel в View

## Используемые технологии

### Сеть
- **Ktor Client 3.1.0** - Multiplatform HTTP клиент
  - ktor-client-core
  - ktor-client-okhttp (Android/JVM)
  - ktor-client-darwin (iOS)
  - ktor-client-js (Web)
  - ktor-client-content-negotiation
  - ktor-serialization-kotlinx-json
  - ktor-client-logging

### Изображения
- **Coil 3.0.4** - Multiplatform библиотека для загрузки изображений
  - coil-compose
  - coil-network-ktor3

### API
- **The Cat API**: https://api.thecatapi.com/v1/images/search
- **API Key**: live_Z1ERXzBu5DjtK73hYSUSAffNgM2AVc519LfEPsnAIe7HjFJuwCr1pZXhQHbjDwjQ

## Архитектурные принципы

### MVI (Model-View-Intent)
1. **Model** (State) - Неизменяемое состояние UI (`FeedState`)
2. **View** - Composable функции, отображающие state (`FeedView`)
3. **Intent** (Event) - События от пользователя (`FeedEvent`)

### Clean Architecture
- **Presentation** → **Domain** → **Data**
- Зависимости направлены внутрь (от UI к Data)
- Domain слой не зависит от внешних фреймворков

### Однонаправленный поток данных
```
User Action → Event → ViewModel → UseCase → Repository → API
                ↓
            State Update
                ↓
              View
```

## Функциональность

1. **Загрузка изображений** - При запуске экрана загружается 10 изображений
2. **Pull-to-refresh** - Обновление ленты свайпом вниз
3. **Infinite scroll** - Автоматическая подгрузка при достижении конца списка
4. **Error handling** - Отображение ошибок с возможностью повторной загрузки
5. **Loading states** - Индикаторы загрузки для разных сценариев

## Интеграция

Модуль интегрирован в главное приложение через:
- `settings.gradle.kts` - добавлены модули `:core:network` и `:feature:feed`
- `composeApp/build.gradle.kts` - подключены зависимости
- `NavigationGraph.kt` - FeedScreen добавлен в навигацию

## Как использовать

```kotlin
@Composable
fun MyApp() {
    FeedScreen()
}
```

ViewModel и зависимости создаются автоматически внутри FeedScreen.

## Multiplatform Support

Проект поддерживает следующие платформы:
- ✅ Android
- ✅ iOS (iosArm64, iosSimulatorArm64)
- ✅ JVM (Desktop)
- ✅ JavaScript (Browser)
- ✅ WebAssembly (wasmJs)

Каждая платформа использует свою реализацию Ktor Client:
- Android/JVM: OkHttp
- iOS: Darwin
- JS/Wasm: JS engine

