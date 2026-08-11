# ANM-019A · Localization Core

Build: `0.19.0-anm019a`.

## Цель

Заложить behavior-neutral foundation для локализации UPDS до миграции пользовательских строк отдельных feature controllers.

## Scope

- `src/localization/Locale.ts` — поддерживаемые locale, `ru` как source/fallback locale, нормализация browser-style locale tags;
- `LocalizationService` — lookup, per-key fallback, именованные параметры, подписка на смену locale;
- `LocaleSettingsStore` — независимое от campaign/audio сохранение выбранного locale;
- `catalogs/ru.ts` и `catalogs/en.ts` — стартовые каталоги инфраструктурных строк;
- `RuntimeServices` создаёт один shared localization service и сохраняет смену locale;
- unit tests фиксируют fallback, interpolation, persistence и notification contract.

## Не входит в ANM-019A

- selector языка в UI;
- перенос строк menu/settings/diagnostics/PWA;
- перенос VN screenplay, scene metadata и choice text;
- перенос Match-3 HUD/objectives;
- полный английский перевод;
- изменения save schema, VN IDs, Match-3 rules, telemetry schema или layout.

## Архитектурный контракт

Feature controllers получают локализацию через существующий `RuntimeServices`; они не создают собственные сервисы или каталоги. Русский остаётся source/fallback locale, пока конкретный feature не мигрирован. Missing key отображается как `[key]`, чтобы ошибки локализации были заметны в preview/QA, а не маскировались пустой строкой.

## Следующие атомарные пакеты

1. ANM-019B — System UI localization: menu/settings/diagnostics/PWA + language selector.
2. ANM-019C — VN metadata/choices/chrome localization без изменения screenplay IDs.
3. ANM-019D — screenplay locale source split + render/paging validation.
4. ANM-019E — Match-3/dossier/ending strings + localization completeness checks.
