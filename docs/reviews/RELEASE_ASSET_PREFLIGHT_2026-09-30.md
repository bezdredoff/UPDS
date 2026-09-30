# Первичный release asset/runtime audit

Baseline: `524c14d7be2e7caef405ab7842cc689aff31cedc` (PR #308), 30.09.2026.

После закрытия гостевой подачи начата техническая часть финального asset/runtime crawl.
Команда: `npm exec -- vitest run tests/RuntimeAssetInventory.test.ts tests/RuntimeAssets.test.ts tests/GuestWitnessPresentation.test.ts tests/CharacterProductionManifest.test.ts tests/LocalizationProductionContract.test.ts`.

Результат: 5 файлов / 19 тестов passed. Runtime inventory: 23 production background files,
0 aliases, 9 full-stage characters / 63 assets, 6 guests / 24 PNG, 0 planned guest fallbacks,
5 Match-3 bonus PNG и 5 SVG fallbacks. Path/signature issues и guest-contract errors: 0.
Full-stage frame geometry сверена с PNG; все файлы offline-каталога существуют; RU/BE/EN
production localization contract проходит автоматическую проверку.

Это технический preflight, не полная визуальная приёмка, не браузерное декодирование каждого файла
и не доказательство cold-offline работы на телефоне.

Следующие release gates:

1. G4a — остаточный integrated art review персонажей, улик и бонусов; backgrounds и guest presentation уже приняты.
2. G5a — финальная RU/BE/EN вычитка и mobile overflow/paging; русский editorial pass уже интегрирован PR #304, остальные проверки не закрыты по этому факту.
3. G5b — ручной playtest 22 Match-3 levels, special combinations, retry/progression и баланс.
4. G5 — Story common route и три финала, фактический asset/decode crawl, save/continue/reload.
5. G0/G5c — pending level-intro rapid-tap, install/update/offline/recovery на iPhone и Android.
6. G6 — RC, credits/rights, release metadata и rollback после предыдущих gates.

Следующее исправление определяется воспроизводимым дефектом этих проверок; новый сюжет,
ассеты и architecture cleanup автоматически не добавляются.
