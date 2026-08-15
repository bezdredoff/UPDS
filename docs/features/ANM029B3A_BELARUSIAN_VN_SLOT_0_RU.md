# ANM-029B3A — Belarusian VN Slot 0

Status: R1.1 candidate / linguistic + CI QA; R1 was rejected only by stale product-version/documentation traceability assertions.

## Цель

Перевести на белорусский первый законченный сюжетный слот canonical screenplay, не включая `be` в runtime до завершения всей локали.

## Scope

- `VN0001–VN0084`, включая варианты `VN0041A–VN0046A`, `VN0041B–VN0046B`, `VN0041C–VN0047C`;
- `vn.choice.*` для `CHOICE_00`;
- title/location для `VN_SCENE_00_PROLOGUE`, `VN_SCENE_01_E0_PRE`, `VN_SCENE_02_E0_POST`;
- всего 302 message keys.

Slot 1 начинается с `VN0085` и намеренно не входит в этот пакет.

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, branch IDs и placeholders/variable payloads не меняются;
- `U`, `Undergarment.`, внутренние variable/dossier payloads сохраняются там, где они являются частью сюжетного/технического контракта;
- имена фиксируются как `Міку`, `Оноэ`, `Аюкі`, `Эмі`, `Маю`, `Кэнтаро`;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot0Localization.test.ts` проверяет exact 302/302 coverage, empty/extra/missing/placeholder drift, representative terminology, неизменность branch payloads и отсутствие `VN0085` в `beCatalog`.
