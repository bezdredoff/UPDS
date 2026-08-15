# ANM-029B3K — Belarusian VN Slot 10

Status: R1.1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский graph-bounded VN slot 10 из ANM-027G source chain: клуб каратэ Аоі, контрольную выборку внешней экипировки, повтор серебристой нити и фотографическое подтверждение старого контейнера Asterion, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 10 как:

- `VN_SCENE_21_E10_PRE`: `VN0489–VN0508`;
- `VN_SCENE_22_E10_POST`: `VN0509–VN0527`;
- title/location для scenes 21–22;
- story-choice в этом bounded slot отсутствует;
- всего **121 message key**.

Следующий graph-bounded localization batch начинается с `VN0528` (`VN_SCENE_23_E11_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_011}` сохраняется дословно;
- закрепляются формы `Аоі`, `Аюкі`, `Міку`, `Оноэ`, `Кэнтаро`, `Гэн`;
- terminology продолжает уже локализованный M3_10 contract: `кантрольная выбарка`, `знешняя экіпіроўка`, `сэрвісныя біркі`, `напульснік`, `серабрыстая нітка`;
- `Asterion` и production staging labels (`ESTABLISHING / COMBAT CLUB HALL`, `INSERT: SERVICE TAGS`, `PRE-MATCH SETUP`, `TRANSITION TO MATCH-3`, `INSERT: SORTED GEAR`, `DOSSIER`, `INSERT: OLD PHOTO CONTAINER`, `EPISODE CARD`) сохраняются как protected data/metadata;
- B3A–B3J остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot10Localization.test.ts` проверяет exact 121/121 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, next-slot boundary `VN0528`, reviewed control-sample terminology, exact `{ADD CUE_011}` payload и runtime-hidden status.
