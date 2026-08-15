# ANM-029B3L — Belarusian VN Slot 11

Status: COMPLETE — R1 merged via PR #130 on 2026-08-15.

## Цель

Перевести на белорусский graph-bounded VN slot 11 из ANM-027G source chain: физический маршрут контейнеров Asterion через служебный двор и перегрузочный пункт, доказательство непрерывной transfer chain, `photo-permission` для фотографий Кэнтаро и переход к слабому беспроводному сигналу, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 11 как:

- `VN_SCENE_23_E11_PRE`: `VN0528–VN0547`;
- `VN_SCENE_24_E11_POST`: `VN0548–VN0567`;
- title/location для scenes 23–24;
- story-choice `photo-permission` на `VN0560`: prompt + A/B/C title/effect;
- всего **131 message key**.

Следующий graph-bounded localization batch начинается с `VN0568` (`VN_SCENE_25_E12_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, choice ID и story routing не меняются;
- `{ADD CUE_012}` и `{CHOICE photo-permission}` сохраняются дословно;
- закрепляются формы `Кэнтаро`, `Міку`, `Оноэ`, `Аюкі`;
- terminology продолжает уже локализованный M3_11 contract: `ланцужок перадачы`, `пломба`, `маніфест`, `перагрузачны пункт`, `лабараторны контур`, `сэрвісныя біркі`;
- `Asterion`, `native evidence composition`, `CG` и production staging labels (`ESTABLISHING / SERVICE YARD`, `INSERT: WARNING LABEL`, `BG_ASTERION_TRANSFER_POINT / CONTINUOUS`, `PRE-MATCH SETUP`, `TRANSITION TO MATCH-3`, `INSERT: TRANSFER CHAIN`, `HERO EVIDENCE / ASTERION TRANSFER CHAIN`, `DOSSIER`, `CHOICE CHECKPOINT`, `EPISODE CARD`) сохраняются как protected data/metadata;
- choice сохраняет три различимых policy outcomes: explicit permission/credit, anonymized copies, sealed originals;
- B3A–B3K остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot11Localization.test.ts` проверяет exact 131/131 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, `photo-permission`, next-slot boundary `VN0568`, reviewed Asterion transfer-chain terminology, exact `{ADD CUE_012}` payload и runtime-hidden status.

## Merge result

R1 прошёл importer/CI и был merged в `main` через PR #130; post-merge CI и stable Pages зелёные.
