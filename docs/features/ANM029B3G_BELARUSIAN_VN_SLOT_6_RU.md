# ANM-029B3G — Belarusian VN Slot 6

Status: R1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский graph-bounded VN slot 6 из ANM-027G source chain, включая принадлежащий ему `apology-to-hinata` choice gate, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 6 как:

- `VN_SCENE_13_E6_PRE`: `VN0327–VN0347`;
- `VN_SCENE_14_E6_POST`: `VN0348–VN0369`;
- title/location для scenes 13–14;
- `apology-to-hinata` choice gate на checkpoint `VN0356` — prompt + A/B/C title/effect;
- всего **140 message keys**.

Следующий graph-bounded localization batch начинается с `VN0370` (`VN_SCENE_15_E7_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, choice gate IDs и story routing не меняются;
- `{CHOICE apology-to-hinata}`, `{ADD CUE_007; SET SUS_HINATA=cleared}` и `{AUTHORED FRONTIER: SLOT_07 / NEXT BATCH 7-9}` сохраняются дословно;
- закреплены формы `Міку`, `Оноэ`, `Аюкі`, `Хіната`, `Куросэ`;
- textile/laundry vocabulary продолжает предыдущие batches: `сэрвісная строчка`, `серабрыстая нітка`, `цэнтральная пральня`;
- `Asterion` и `Asterion Sports Lab` сохраняются как protected product/lab naming;
- technical staging labels (`ESTABLISHING / WORKSHOP`, `WORKSHOP INSERTS`, `INSERT: PRE-LAUNDRY PHOTOS`, `TRANSITION TO MATCH-3`, `INSERT: WARRANTY + SPOOL`, `CHOICE CHECKPOINT`, `DOSSIER`, `INSERT: ASTERION INVITE`, `AUTHORED FRONTIER`) сохраняются как production metadata;
- B3A–B3F остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot6Localization.test.ts` проверяет exact 140/140 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, `apology-to-hinata` checkpoint, next-slot boundary `VN0370`, representative textile/Asterion terminology, exact payloads и runtime-hidden status.
