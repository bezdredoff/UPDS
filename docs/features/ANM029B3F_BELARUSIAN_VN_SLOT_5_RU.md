# ANM-029B3F — Belarusian VN Slot 5

Status: R1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский graph-bounded VN slot 5 из ANM-027G source chain, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 5 как:

- `VN_SCENE_11_E5_PRE`: `VN0289–VN0308`;
- `VN_SCENE_12_E5_POST`: `VN0309–VN0326`;
- title/location для scenes 11–12;
- всего **118 message keys**.

В slot 5 нет story choice gate. Следующий gate `apology-to-hinata` находится на `VN0356` внутри slot 6 и намеренно не входит в этот batch. Следующий graph-bounded localization batch начинается с `VN0327` (`VN_SCENE_13_E6_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, choice gate IDs и story routing не меняются;
- `{ADD CUE_006}` сохраняется дословно;
- закреплены формы `Міку`, `Оноэ`, `Аюкі`, `Хіната`, полное имя `Ціхару Хіната`;
- service/laundry vocabulary согласована с Match-3: `сэрвісная строчка`, `сэрвісная бірка`, `журнал рамонту`, `цэнтральная пральня`;
- technical staging labels (`ESTABLISHING / LOCKER ROOM`, `INSERT: TOWEL OVER CHART`, `TRANSITION TO MATCH-3`, `INSERT: REPAIR LOG`, `DOSSIER`, `EPISODE CARD`) сохраняются как production metadata;
- B3A–B3E остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot5Localization.test.ts` проверяет exact 118/118 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, отсутствие захвата следующего choice gate, representative service-route terminology, exact `{ADD CUE_006}` и runtime-hidden status.
