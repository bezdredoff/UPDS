# ANM-029B3C — Belarusian VN Slot 2

Status: R1 COMPLETE / merged through PR #121.

## Цель

Перевести на белорусский следующий законченный runtime-слот canonical VN поверх hardened ANM-023E baseline, сохранив `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 2 как:

- `VN_SCENE_05_E2_PRE`: `VN0143–VN0166`;
- `VN_SCENE_06_E2_POST`: `VN0167–VN0191`;
- title/location для scenes 05–06;
- всего **151 message key**.

Следующий graph-bounded slot начинается с `VN0192` (`VN_SCENE_07_E3_PRE`). B3C не вводит запрет на будущие ключи и проверяет только собственный bounded selector.

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_003_MIXED_TARGETS}` сохраняется дословно;
- закреплены формы `Міку`, `Оноэ`, `Аюкі`, `Норыхіра`, `Кэнтаро`;
- consent vocabulary продолжает использовать `згода`;
- technical staging labels (`TRANSITION TO MATCH-3`, `DOSSIER`, `EPISODE CARD`, `ESTABLISHING / NIGHT`) сохраняются как production metadata;
- B3A/B3B остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот localization batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot2Localization.test.ts` проверяет exact 151/151 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, representative terminology, dossier payload и runtime-hidden status.
