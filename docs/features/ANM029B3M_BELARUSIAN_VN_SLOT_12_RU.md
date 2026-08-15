# ANM-029B3M — Belarusian VN Slot 12

Status: COMPLETE — R1 merged via PR #131 on 2026-08-15.

## Цель

Перевести на белорусский graph-bounded VN slot 12 из ANM-027G source chain: ночную проверку слуха о ПанцуИтэре, обнаружение активной микрометки `Second Skin`, `publish-tag` policy choice и первую проверяемую связь с Куросэ, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 12 как:

- `VN_SCENE_25_E12_PRE`: `VN0568–VN0588` → `M3_12_SECOND_SKIN_SIGNAL`;
- `VN_SCENE_26_E12_POST`: `VN0589–VN0607`;
- title/location для scenes 25–26;
- story-choice `publish-tag` на `VN0601`: prompt + A/B/C title/effect;
- всего **131 message key**.

Следующий graph-bounded localization batch начинается с `VN0608` (`VN_SCENE_27_E13_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, choice ID и story routing не меняются;
- `{ADD CUE_013}` и `{CHOICE publish-tag}` сохраняются дословно;
- закрепляются формы `Міку`, `Оноэ`, `Аюкі`, `Куросэ`, `ПанцуІтэр`;
- terminology продолжает уже локализованный M3_12 contract: `мікраметка`, `сэрвісная бірка`, `радыёперашкоды`, `сігнальныя вузлы`, `Second Skin`, `знешняя экіпіроўка`;
- `Lucky Seven`, `Bluetooth`, `Second Skin`, `native hero evidence`, `CG`, `ID` и production staging labels сохраняются как protected data/metadata;
- choice сохраняет три различимых policy outcomes: полная публикация, сохранение метки в тайне, техническое опровержение без раскрытия protocol ID;
- B3A–B3L остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot12Localization.test.ts` проверяет exact 131/131 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges и Match-3 route, `publish-tag`, next-slot boundary `VN0608`, reviewed Second Skin terminology, exact `{ADD CUE_013}` / `{CHOICE publish-tag}` payloads и runtime-hidden status.

## Merge result

R1 прошёл importer/CI и был merged в `main` через PR #131; post-merge CI и stable Pages зелёные.
