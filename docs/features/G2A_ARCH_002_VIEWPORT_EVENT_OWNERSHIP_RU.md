# G2a-ARCH-002 — Single Viewport Event Ownership

Status: **accepted via PR #289**.

## Проблема

После G2a-ARCH-001 runtime geometry и CSS layout tokens уже принадлежат `ViewportRuntime`, но VN всё ещё имел второй browser-observer path:

- `VnController` самостоятельно слушал `window.resize`;
- отдельно слушал `orientationchange`;
- отдельно хранил `dialogueReflowWidth`;
- повторял тот же `< 2px` width threshold, который уже применяет `ViewportRuntime`;
- после собственного debounce запускал VN repagination.

Это оставляло два владельца решения «является ли browser viewport event реальным layout change». Исторически именно несколько независимых resize paths уже приводили к позднему rescale/repagination на мобильном Safari.

## Решение

`src/platform/ViewportRuntime.ts` теперь владеет не только sampling/tokens, но и production viewport event policy:

- только он подписывается на `resize` и `orientationchange`;
- height-only Safari resize отбрасывается в одном месте;
- accepted width/orientation refresh сначала обновляет canonical geometry/tokens;
- затем `ViewportRuntime` публикует resolved change подписчикам.

`VnController` больше не читает `window.innerWidth`, не держит собственный width snapshot и не подписывается на browser viewport events. Он подписывается на `subscribeViewportRuntime()` и владеет только feature reaction: отложенной in-place repagination текущего dialogue.

## Инварианты

- height-only browser-chrome changes не инициируют VN repagination;
- реальный width/orientation change всё ещё remeasure-ит текущий dialogue in place;
- reflow не вызывает полный `renderVN()`;
- paging IDs/save/story state не меняются;
- initial viewport geometry остаётся установленной до async services/PWA work;
- Golden Samples, Match-3 rules, art и PWA cache/update logic не меняются.

## Validation ownership

`tests/VnViewportStability.test.ts` защищает границу ответственности:

- `ViewportRuntime` — единственный production owner browser viewport listeners;
- VN использует runtime subscription и не содержит собственного width/event policy;
- существующие Mobile WebKit VN/localization journeys продолжают быть executable Browser Gate evidence.

Реальный iPhone QA KI-001/KI-003 остаётся отдельным release gate; этот refactor сам по себе не закрывает known issues.
