# ANM-029B3O — Belarusian VN Slot 14

Status: R1 candidate / linguistic + CI QA.

## Цель

Перевести на белорусский graph-bounded VN slot 14 из ANM-027G source chain: проверку семейной книги заказов Кубо, доказательство того, что Рина искала серебристые швы до публичных пропаж, `CUE_015`, policy choice `family-ledger-permission` и переход к погоне за котом Рэем с вещественным доказательством, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 14 как:

- `VN_SCENE_29_E14_PRE`: `VN0647–VN0666` → `M3_14_KUBO_ATELIER_LEDGER`;
- `VN_SCENE_30_E14_POST`: `VN0667–VN0686`;
- title/location для scenes 29–30;
- story-choice `family-ledger-permission`: prompt + 3 title/effect pairs;
- всего **131 message key**.

Следующий graph-bounded localization batch начинается с `VN0687` (`VN_SCENE_31_E15_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_015}` и `{CHOICE family-ledger-permission}` сохраняются дословно;
- закрепляются формы `Міку`, `Оноэ`, `Аюкі`, `Кубо`, `Маці Кубо`, `Рына Сіраісі`, `Рэй`;
- terminology продолжает уже локализованный M3_14 contract: `сямейнае атэлье`, `кніга заказаў`, `квітанцыя`, `сэрвісныя біркі`, `серабрыстыя швы`, `Рына ведала загадзя`;
- `ESTABLISHING / TEXTILE WORKSHOP`, `INSERT: ORDER BOOK`, `TRANSITION TO MATCH-3`, `INSERT: RESTORED LEDGER`, `DOSSIER`, `CHOICE CHECKPOINT`, `INSERT: MARKED SAMPLE BAG`, `SFX: CAT LEAP`, `EPISODE CARD` сохраняются как protected production labels;
- B3A–B3N остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot14Localization.test.ts` проверяет exact 131/131 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges и `M3_14_KUBO_ATELIER_LEDGER`, next-slot boundary `VN0687`, reviewed atelier/ledger/privacy terminology, exact clue/choice payloads и runtime-hidden status.
