# G2a-TEST-005 — VN browser contract ownership

Status: **accepted via PR #286**.

## Цель

Уменьшить хрупкость `VnBrowserE2EContract.test.ts`: browser contract должен защищать внешний automation/journey boundary, а не точное написание production VN implementation.

## До изменения

Fast Vitest contract читал:

- `VnController.ts`;
- `vnFrameMarkup.ts`;
- `vnModalFocus.ts`;
- `RuntimeServices.ts`;
- `vnAuthoredShots.ts`;
- `AuthoredVnShots.test.ts`;
- плюс Playwright helper/spec/selectors.

Из-за этого безопасная перестановка production-кода, переименование локальной реализации или перенос установки focus management могли ломать root `npm run check`, даже если browser behavior оставался тем же.

## После изменения

`VnBrowserE2EContract.test.ts` читает только browser automation layer:

- `e2e/selectors.ts`;
- `e2e/helpers/vn.ts`;
- `e2e/tests/vn-navigation.pw.ts`;
- `e2e/playwright.config.ts`.

Он сохраняет четыре полезных границы:

1. QA Scene Navigation используется вместо hidden browser/runtime seam.
2. VN selector API остаётся явным и стабильным.
3. Browser journey содержит representative paging, authored staging и CHOICE_00 branching.
4. Modal focus проверяется реальными keyboard actions, а `vn-navigation.pw.ts` остаётся mobile-critical для WebKit.

## Где теперь живёт остальная защита

- Фактическая VN rendering/paging/staging/choice behavior — `vn-navigation.pw.ts` в Browser Gate.
- Authored shot semantics — dedicated authored-shot unit contract.
- Modal focus semantics — фактический keyboard browser journey.
- Controller construction/feature boundaries — `RepositoryHygiene.test.ts` и другие architecture contracts.

## Не меняется

- production runtime;
- `VnController`;
- VN markup/CSS;
- authored shots;
- focus implementation;
- selectors;
- Playwright journey;
- Golden Samples;
- PWA behavior.

Это test-ownership simplification, а не функциональное изменение VN.
