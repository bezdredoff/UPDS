# ANM-029B3I — Belarusian VN Slot 8

Status: COMPLETE — R1 merged via PR #127 on 2026-08-15.

## Цель

Перевести на белорусский graph-bounded VN slot 8 из ANM-027G source chain: расследование журнала склада находок, восстановление пропавших диапазонов и выход на маршрут универсального ключа, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 8 как:

- `VN_SCENE_17_E8_PRE`: `VN0410–VN0429`;
- `VN_SCENE_18_E8_POST`: `VN0430–VN0448`;
- title/location для scenes 17–18;
- story-choice gate внутри этого slot отсутствует;
- всего **121 message key**.

Следующий graph-bounded localization batch начинается с `VN0449` (`VN_SCENE_19_E9_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs и story routing не меняются;
- `{ADD CUE_009}` сохраняется дословно;
- закрепляются формы `Рына`, `Рына Сіраісі`, `Міку`, `Оноэ`, `Аюкі`, `Маю`;
- terminology продолжает уже локализованный Match-3 контракт M3_08/M3_09: `сэрвісныя коды`, `прапускі`, `цэнтральная пральня`, `ўніверсальны ключ`;
- `Asterion`, package/service identifiers (`L-1842`, `F-30`) и timestamp `00:43` сохраняются как protected data;
- production staging labels (`ESTABLISHING / LOST-AND-FOUND`, `PAN: SEALED PACKAGES`, `TRANSITION TO MATCH-3`, `INSERT: RESTORED LEDGER`, `INSERT: AFTER-MIDNIGHT SEAL`, `DOSSIER`, `EPISODE CARD`) сохраняются как metadata;
- B3A–B3H остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot8Localization.test.ts` проверяет exact 121/121 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, next-slot boundary `VN0449`, representative lost-and-found/service-key terminology, exact `{ADD CUE_009}` payload и runtime-hidden status.

## Merge result

PR #127 merged B3I into `main`; post-merge CI is authoritative for the completed slot. Later Belarusian batches may extend `beCatalog` without changing this bounded 121-key contract.
