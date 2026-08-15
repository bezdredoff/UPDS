# ANM-029B3H — Belarusian VN Slot 7

Status: R1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский graph-bounded VN slot 7 из ANM-027G source chain: знакомство с лабораторией Asterion, техническую проверку серебристой нити и выход на незарегистрированную партию, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 7 как:

- `VN_SCENE_15_E7_PRE`: `VN0370–VN0390`;
- `VN_SCENE_16_E7_POST`: `VN0391–VN0409`;
- title/location для scenes 15–16;
- story-choice gate внутри этого slot отсутствует;
- всего **124 message keys**.

Следующий graph-bounded localization batch начинается с `VN0410` (`VN_SCENE_17_E8_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_008}` сохраняется дословно;
- закреплены формы `Міку`, `Оноэ`, `Аюкі`, `Куросэ`, `Рэйдзі Куросэ`;
- предыдущая textile/laundry terminology продолжается без дрейфа: `сэрвісная строчка`, `серабрыстая нітка`, `цэнтральная пральня`;
- `Asterion`, `Asterion Sports Lab` и `Second Skin` сохраняются как protected naming;
- production staging labels (`ESTABLISHING / ASTERION LAB`, `INSERT: SAMPLE BENCH`, `TRANSITION TO MATCH-3`, `INSERT: ANALYZER RESULT`, `INSERT: SERIAL CODE`, `DOSSIER`, `EPISODE CARD`) сохраняются как metadata;
- B3A–B3G остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot7Localization.test.ts` проверяет exact 124/124 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, next-slot boundary `VN0410`, representative Asterion/thread/laundry terminology, exact `{ADD CUE_008}` payload и runtime-hidden status.
