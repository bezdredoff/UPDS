# ANM-019B · Localized System UI

Build: `0.19.1-anm019b`.

## Цель

Доказать localization foundation ANM-019A на маленьком, полностью проверяемом вертикальном срезе: пользователь может переключить `ru/en` и сразу увидеть реальную смену языка интерфейса.

## Scope

- Settings содержит selector `Русский / English`;
- locale переключается немедленно и сохраняется через существующий `LocaleSettingsStore`;
- локализованы Main Menu и Settings;
- локализованы shared Audio/PWA controls, используемые Settings;
- Settings header получает локализованные accessibility labels;
- при смене locale обновляется `document.documentElement.lang`;
- `ru/en` каталоги имеют одинаковый набор ключей для этого slice;
- smoke/unit tests проверяют английский rendering и catalog parity.

## Намеренно не входит

- VN screenplay, speaker names, choices и VN chrome;
- Match-3 HUD/objectives;
- Diagnostics/scene-select content;
- dossier/ending;
- изменение campaign save, VN IDs, telemetry schema, gameplay rules или art.

## QA на preview

1. Открыть Settings из главного меню.
2. Переключить `Русский → English` — Settings должен перерисоваться сразу.
3. Вернуться назад — Main Menu должен быть английским.
4. Обновить страницу — English должен сохраниться.
5. Переключить обратно на Русский и повторить reload.
6. Открыть VN/Match-3: они пока остаются на исходном русском, что является ожидаемой границей ANM-019B.

## Следующий пакет

ANM-019C переносит VN metadata/choices/chrome на stable localization keys, не меняя authored screenplay IDs.
