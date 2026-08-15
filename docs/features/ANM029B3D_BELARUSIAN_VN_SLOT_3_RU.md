# ANM-029B3D — Belarusian VN Slot 3

Status: R1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский последний graph-bounded VN-слот исходного ANM-003 vertical slice, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 3 как:

- `VN_SCENE_07_E3_PRE`: `VN0192–VN0216`;
- `VN_SCENE_08_E3_POST`: `VN0217–VN0250`;
- title/location для scenes 07–08;
- всего **181 message key**.

`VN0250` остаётся canonical bridge исходного vertical slice. Следующий graph-bounded localization batch начинается с `VN0251` (`VN_SCENE_09_E4_PRE`) в ANM-027G source chain.

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_004_SILVER_THREAD; SET SUS_NORIHIRO=cleared}` сохраняется дословно;
- закреплены формы `Міку`, `Оноэ`, `Аюкі`, `Норыхіра`, `Кэнтаро`;
- consent vocabulary продолжает использовать `згода`;
- evidence/investigation vocabulary остаётся согласованным с предыдущими BE batches;
- technical staging labels (`CLOSE UP`, `TRANSITION TO MATCH-3`, `DOSSIER`, `HERO INSERT`, `CHAPTER COMPLETE`, `OPTIONAL TEASER`) сохраняются как production metadata;
- B3A–B3C остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot3Localization.test.ts` проверяет exact 181/181 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, переход `VN0250 → VN0251`, representative terminology, dossier payload и runtime-hidden status.
