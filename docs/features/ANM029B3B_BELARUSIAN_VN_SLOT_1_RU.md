# ANM-029B3B — Belarusian VN Slot 1

Status: R1.1 candidate / linguistic + CI QA. R1 translation and its bounded localization test passed in GitHub; the importer was rejected only by a stale transitional documentation assertion. R1.1 rebases the same reviewed 178-key translation onto the merged ANM-023E hardened baseline.

## Цель

Перевести на белорусский второй законченный runtime-слот canonical VN, сохранив `be` скрытым до полного завершения локали.

## Scope

Canonical `storyGraph` задаёт границы этого слота как:

- `VN_SCENE_03_E1_PRE`: `VN0085–VN0113`;
- `VN_SCENE_04_E1_POST`: `VN0114–VN0142`;
- title/location для scenes 03–04;
- всего **178 message keys**.

Важно: screenplay markdown визуально ставит заголовок следующей сцены перед `VN0142`, однако текущий production runtime graph относит `VN0142` к `VN_SCENE_04_E1_POST`, а `VN_SCENE_05_E2_PRE` начинает с `VN0143`. Localization production следует runtime graph как authoritative routing boundary и не меняет story routing в этом пакете.

## Контракты

- RU остаётся authoritative source, EN — semantic reference;
- line IDs, scene IDs, conditions и technical payloads не меняются;
- `PS-14`, Match-3 transition labels и `{ADD CUE_002_SERVICE_CART; SET SUS_KENTARO=cleared}` сохраняются как technical content;
- закреплены формы `Міку`, `Оноэ`, `Аюкі`, `Эмі`, `Кэнтаро`;
- B3A остаётся отдельным 302-key bounded contract; его тест проверяет собственный selector и не запрещает дальнейший рост `beCatalog`;
- `be` остаётся `translation-pending`, `runtimeSelectable: false`;
- `supportedLocales` и `appCatalogs` не расширяются.

## QA

`BelarusianVnSlot1Localization.test.ts` проверяет exact 178/178 coverage, zero missing/extra/empty/placeholder drift, canonical `storyGraph` ranges, representative terminology и неизменность dossier payload.
