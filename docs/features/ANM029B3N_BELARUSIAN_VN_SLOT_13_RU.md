# ANM-029B3N — Belarusian VN Slot 13

Status: R1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский graph-bounded VN slot 13 из ANM-027G source chain: проверку закрытого списка участников Second Skin в клубе кэндо, показания Кохэя Кубо, `CUE_014` и квитанцию семейного ателье, которая показывает интерес Рины к серебристым швам ещё до публичных пропаж, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 13 как:

- `VN_SCENE_27_E13_PRE`: `VN0608–VN0627` → `M3_13_KENDO_PILOT_LIST`;
- `VN_SCENE_28_E13_POST`: `VN0628–VN0646`;
- title/location для scenes 27–28;
- story-choice внутри bounded range отсутствует;
- всего **121 message key**.

Следующий graph-bounded localization batch начинается с `VN0647` (`VN_SCENE_29_E14_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_014}` сохраняется дословно;
- закрепляются формы `Міку`, `Оноэ`, `Аюкі`, `Кубо`, `Кохэй Кубо`, `Рына Сіраісі`;
- terminology продолжает уже локализованный M3_13 contract: `кэндо`, `даспехі`, `сэрвісныя біркі`, `закрыты спіс пілота`, `Second Skin`, `серабрыстае шво`;
- `ESTABLISHING / COMBAT CLUB HALL`, `GUEST TESTIMONY / KUBO`, `PRE-MATCH SETUP`, `TRANSITION TO MATCH-3`, `INSERT: PILOT LIST`, `DOSSIER`, `INSERT: ATELIER RECEIPT`, `EPISODE CARD` сохраняются как protected production labels;
- B3A–B3M остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot13Localization.test.ts` проверяет exact 121/121 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges и `M3_13_KENDO_PILOT_LIST`, next-slot boundary `VN0647`, reviewed kendo/pilot-list/atelier terminology, exact `{ADD CUE_014}` payload и runtime-hidden status.
