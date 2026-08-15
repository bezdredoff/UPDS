# ANM-029B3J — Belarusian VN Slot 9

Status: COMPLETE — R1 merged via PR #128 on 2026-08-15.

## Цель

Перевести на белорусский graph-bounded VN slot 9 из ANM-027G source chain: расследование универсального ключа, восстановление ночной передачи тележки и контейнеров Asterion, а также выбор `protect-gen-source`, сохранив hardened tooling baseline и `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы slot 9 как:

- `VN_SCENE_19_E9_PRE`: `VN0449–VN0469`;
- `VN_SCENE_20_E9_POST`: `VN0470–VN0488`;
- title/location для scenes 19–20;
- story-choice `protect-gen-source` на `VN0480`: prompt + A/B/C title/effect;
- всего **131 message key**.

Следующий graph-bounded localization batch начинается с `VN0489` (`VN_SCENE_21_E10_PRE`).

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, choice ID и story routing не меняются;
- `{CHOICE protect-gen-source}` и `{ADD CUE_010}` сохраняются дословно;
- закрепляются формы `Гэн`, `Гэн Ісіда`, `Рына`, `Міку`, `Оноэ`, `Аюкі`, `Куросэ`;
- terminology продолжает уже локализованный M3_09 contract: `ўніверсальны ключ`, `журнал ключоў`, `транспартная накладная`, `сэрвісны прэфікс`, `начныя кантэйнеры`;
- `Asterion`, timestamp `00:43` и production staging labels (`ESTABLISHING / MAINTENANCE ROOM`, `INSERT: CATEGORY U FORM`, `TRANSITION TO MATCH-3`, `INSERT: KEY LOG + HANDOFF SLIP`, `INSERT: ASTERION PREFIX`, `CHOICE CHECKPOINT`, `DOSSIER`, `EPISODE CARD / FRONTIER`) сохраняются как protected data/metadata;
- choice B сохраняет смысл source protection и `Давер крыніц +1`;
- B3A–B3I остаются отдельными bounded contracts и не блокируют дальнейший рост `beCatalog`;
- `package.json.version` остаётся единственным источником `APP_VERSION`; этот batch меняет только `BUILD_LABEL`;
- Biome gate и hardened `npm run check` не ослабляются;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot9Localization.test.ts` проверяет exact 131/131 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, `protect-gen-source`, next-slot boundary `VN0489`, representative maintenance-key/Asterion terminology, exact technical payloads и runtime-hidden status.


## Merge result

PR #128 merged B3J into `main`; post-merge CI and stable Pages deploy passed. Later Belarusian batches may extend `beCatalog` without changing this bounded 131-key contract.
