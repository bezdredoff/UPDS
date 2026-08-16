# ANM-029B3P — Belarusian VN Slot 15

Status: COMPLETE — R1 merged via PR #134 on 2026-08-15; post-merge CI and stable Pages are green.

## Цель

Перевести на белорусский graph-bounded VN slot 15 из ANM-027G source chain: погоню за Рэем, обнаружение действующего старого маршрута через заброшенную прачечную, вопрос согласия участников Second Skin, `CUE_016`, кадры Рины у корпуса и переход к проверке розовых лент, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 15 как:

- `VN_SCENE_31_E15_PRE`: `VN0687–VN0707` → `M3_15_ABANDONED_LAUNDRY_ROUTE`;
- `VN_SCENE_32_E15_POST`: `VN0708–VN0726`;
- title/location для scenes 31–32;
- story-choice внутри bounded range отсутствует;
- всего **124 message key**.

Следующая canonical граница — `VN0727` (`VN_SCENE_33_E16_PRE`); перевод этой и всех последующих сцен закрывает ANM-029B4.

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_016}` сохраняется дословно;
- закрепляются формы `Міку`, `Оноэ`, `Аюкі`, `Рэй`, `Рына`, `Second Skin`, `Asterion`;
- terminology продолжает уже локализованный M3_15 contract: `Стары сэрвісны маршрут`, `закінутая пральня`, `ключ-карта`, `сляды ніткі`, `Маршрут згоды`;
- `BG_CAMPUS_PATH / CHASE`, `CROWD REACTION`, `CAMPUS EDGE`, `BG_ABANDONED_LAUNDRY / INTERIOR`, `CAT DROP`, `CAT`, `INSERT: ANONYMOUS NOTE`, `TRANSITION TO MATCH-3`, `INSERT: OPEN SERVICE CABINET`, `DOSSIER`, `INSERT: YARD PHOTO STRIP`, `SFX: PHONE MESSAGE`, `MESSAGE`, `EPISODE CARD / FRONTIER` сохраняются как protected production labels;
- B3A–B3O остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- В bounded B3P scope runtime readiness отдельно не объявляется; final activation выполняет ANM-029B4 после полного zero-missing-key gate.

## QA

`BelarusianVnSlot15Localization.test.ts` проверяет exact 124/124 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges и `M3_15_ABANDONED_LAUNDRY_ROUTE`, next-slot boundary `VN0727`, reviewed abandoned-laundry/consent-route terminology, exact `CUE_016` payload, protected production labels и bounded terminology/payload contract; runtime activation проверяется global ANM-029B4 gate.
