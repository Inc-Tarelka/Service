# Настройка доступа к интернету

## ✅ Выполненные настройки

### Android (AndroidManifest.xml)

Добавлены разрешения:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

И настройка безопасности:
```xml
android:usesCleartextTraffic="false"
```

Это означает:
- ✅ Приложение может делать сетевые запросы
- ✅ Приложение может проверять состояние сети
- ✅ Разрешены только HTTPS соединения (более безопасно)

### iOS (Info.plist)

Добавлены настройки App Transport Security:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.thecatapi.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```

Это означает:
- ✅ Разрешены безопасные соединения к api.thecatapi.com
- ✅ Требуется минимум TLS 1.2
- ✅ Включая поддомены
- ✅ Блокируются небезопасные HTTP запросы

## Используемый API

**The Cat API**
- URL: `https://api.thecatapi.com/v1/images/search`
- Протокол: HTTPS (безопасный)
- TLS версия: 1.2+

## Библиотеки для работы с сетью

### Ktor Client 3.1.0
- Multiplatform HTTP клиент
- Поддержка всех платформ (Android, iOS, JVM, JS, Wasm)
- Автоматическая сериализация/десериализация JSON
- Логирование запросов

### Coil 3.0.4
- Multiplatform библиотека для загрузки изображений
- Интеграция с Ktor для сетевых запросов
- Кэширование изображений
- Поддержка Compose

## Проверка работоспособности

### Android
1. Соберите APK: `./gradlew assembleDebug`
2. Установите на устройство/эмулятор
3. Запустите приложение
4. Должны загрузиться изображения котов из Cat API

### iOS
1. Откройте Xcode: `open iosApp/iosApp.xcodeproj`
2. Запустите на симуляторе или устройстве
3. Должны загрузиться изображения котов из Cat API

## Отладка сетевых запросов

В Ktor Client включено логирование:
```kotlin
install(Logging) {
    logger = Logger.DEFAULT
    level = LogLevel.INFO
}
```

Вы увидите в логах:
- URL запросов
- Статус коды ответов
- Заголовки
- Тело запросов/ответов

### Android (Logcat)
Фильтруйте по тегу: `Ktor`

### iOS (Xcode Console)
Все логи Ktor будут видны в консоли

## Решение возможных проблем

### Android: "Unable to resolve host"
- Проверьте наличие `INTERNET` permission
- Проверьте подключение к интернету на устройстве
- Проверьте, что `usesCleartextTraffic="false"` (для HTTPS)

### iOS: "The resource could not be loaded"
- Проверьте настройки ATS в Info.plist
- Убедитесь, что домен правильно указан
- Проверьте, что используется HTTPS

### Coil: Изображения не загружаются
- Убедитесь, что `coil-network-ktor` подключен
- Проверьте URL изображений в логах
- Убедитесь, что изображения доступны по HTTPS

## Безопасность

### Текущие настройки безопасности:
- ✅ Только HTTPS соединения
- ✅ Минимум TLS 1.2
- ✅ Конкретный домен (api.thecatapi.com)
- ✅ API ключ передается через заголовки
- ❌ API ключ в коде (для production нужно переместить в BuildConfig/secrets)

### Рекомендации для production:
1. Переместите API ключ в безопасное хранилище
2. Используйте ProGuard/R8 для обфускации (Android)
3. Добавьте certificate pinning для дополнительной безопасности
4. Реализуйте retry политику с экспоненциальной задержкой

