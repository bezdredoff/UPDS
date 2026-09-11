# G2a-ARCH-009 — Retire test-only app compatibility seams

Status: **accepted via PR #297**.

## Проблема

После декомпозиции UI `AnimeDetectiveApp` остался composition root, но продолжал публиковать методы, нужные только старым unit/smoke harnesses:

- прямые feature render/start wrappers;
- `nextLine()` как прокси к VN controller;
- mutable getter/setter `save` как обход `AppSession`.

Production runtime эти методы не использовал. Из-за них публичный API composition root скрывал реальные ownership boundaries и позволял тестам обходить `AppNavigation`, feature controllers и sessions.

## Реализация

- `AnimeDetectiveApp` оставляет публичным только lifecycle entry point `mount()`;
- UI smoke tests вызывают `VnController`, `Match3Controller`, `SettingsController`, `DiagnosticsController` и `MainMenuController` напрямую;
- Level Lab, Scene Studio и Match-3 Campaign tests используют их собственные controllers;
- story и campaign state проверяются через `AppSession` и `Match3CampaignSession`;
- repository hygiene test запрещает возвращать удалённые feature/state seams в production app API.

Test wiring остаётся внутри tests. Production не получает новый harness, controller locator или скрытый state-mutation API.

## Сохранённые границы

- `AnimeDetectiveApp` по-прежнему единолично создаёт feature controllers и связывает их через `AppNavigation`/узкие callbacks;
- реальные menu/QA navigation paths и `?qa=1` не меняются;
- controller behavior, player markup, saves, telemetry, gameplay и PWA lifecycle не меняются;
- Browser Gate продолжает использовать production DOM actions без direct app API.

## Не входит в slice

- изменение controller visibility или production navigation contract;
- новый test runtime либо второй composition root;
- изменение save schema, VN progression или Match-3 rules;
- repository debris cleanup не входил в ARCH-009 и впоследствии принят в ARCH-010 / PR #298;
- закрытие KI-001/KI-003 без real-iPhone evidence.
