# Бабушкина дача — Android-оболочка для RuStore

Приложение — WebView с игрой из `rustore/index.html` (копируется в assets при сборке).
Сборка: GitHub Actions → «Android build (RuStore)» → Artifacts.
Подпись берётся из секретов репозитория: KEYSTORE_BASE64, KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD.
Рекламный мост: `MainActivity.AdsBridge` (пока заглушка, ADS_ENABLED = false).
