# ANM-029B3E — Belarusian VN Slot 4

Status: R1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский первый graph-bounded VN-слот ANM-027G source chain после закрытого ANM-003 vertical slice, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 4 как:

- `VN_SCENE_09_E4_PRE`: `VN0251–VN0270`;
- `VN_SCENE_10_E4_POST`: `VN0271–VN0288`;
- title/location для scenes 09–10;
- story choice gate `meeting-tone` на `VN0262`: prompt + A/B/C title/effect;
- всего **125 message keys**.

Следующий graph-bounded localization batch начинается с `VN0289` (`VN_SCENE_11_E5_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, choice gate IDs и story routing не меняются;
- `{CHOICE meeting-tone}` и `{ADD CUE_005}` сохраняются дословно;
- `meeting-tone` переводится как часть того же runtime slot, а не откладывается в отдельный несвязанный batch;
- закреплены формы `Міку`, `Оноэ`, `Аюкі`, `Маю`, `Сэйран`;
- privacy vocabulary сохраняет смысл закрытой встречи и запрета выноса имён/списков за пределы комнаты;
- evidence/investigation vocabulary остаётся согласованным с предыдущими BE batches;
- technical staging labels (`ESTABLISHING / DAY`, `CHOICE CHECKPOINT`, `INSERT: LAUNDRY CALENDAR`, `TRANSITION TO MATCH-3`, `DOSSIER`, `SFX: MESSAGE`, `EPISODE CARD`) сохраняются как production metadata;
- B3A–B3D остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot4Localization.test.ts` проверяет exact 125/125 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, `meeting-tone` checkpoint/options, representative privacy/evidence terminology, exact technical payloads и runtime-hidden status.
