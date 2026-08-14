# ANM-029A · Localization Production Foundation

Build label: `ANM-029A R1.1 · Localization Production Foundation`.

## Цель

Перевести localization foundation из режима «RU/EN vertical-slice support» в production-контракт
для полного authored canon `0–21`, не публикуя игроку языки с незавершённым переводом.

ANM-029A **не является массовым переводом** и не добавляет временные RU fallback-каталоги для
будущих языков. Он создаёт проверяемую границу, после которой каждый новый locale может входить
отдельным production pass и считаться готовым только после полного audit.

## Production locales

Полный release-target registry фиксируется в `src/localization/LocalizationProduction.ts`:

1. `ru` — Russian, source-complete;
2. `be` — Belarusian, translation-pending;
3. `en` — English, production-complete;
4. `zh-CN` — Simplified Chinese, translation-pending;
5. `ja` — Japanese, translation-pending;
6. `ko` — Korean, translation-pending;
7. `pt-BR` — Brazilian Portuguese, translation-pending.

`Locale.ts` по-прежнему описывает только **runtime-selectable** locales. В R1 это `ru` и `en`.
Pending locale нельзя добавить в selector простым созданием неполного каталога: сначала его статус
и completeness должны пройти production gate.

## Catalog readiness gate

`src/localization/CatalogAudit.ts` проверяет для target catalog относительно source catalog:

- полный набор stable keys;
- отсутствие лишних ключей;
- отсутствие пустых значений;
- идентичную сигнатуру `{named.placeholders}` в source и target.

Совпадение текста RU/target само по себе не считается доказательством перевода: имена, бренды и
технические маркеры могут законно совпадать. Linguistic QA остаётся отдельным human/content gate.

## Glossary

`src/localization/LocalizationGlossary.ts` фиксирует stable IDs, RU source, EN reference и правило
обработки (`translate`, `preserve`, `transliterate`) для ключевых терминов и имён: Class U,
Category U, Second Skin, Asterion, Seiran и основных персонажей.

Новый locale pass должен расширять эту дисциплину, а не локально переименовывать персонажей или
сюжетные термины внутри отдельных сцен.

## CJK readiness

CJK detection для `zh`, `ja`, `ko` теперь принадлежит localization production contract и
переиспользуется VN dialogue paging. Это убирает отдельную ad-hoc проверку locale из UI helper и
создаёт единый источник для будущего overflow/typography QA.

ANM-029A не утверждает, что CJK визуально прошёл QA: это возможно только после появления реального
перевода. Он лишь фиксирует корректную machine-readable классификацию и сохраняет уже существующий
CJK-aware dialogue segmentation.

## Behavior

Player-visible behavior R1 не меняется:

- selector показывает только `Русский` и `English`;
- сохранённый locale key/schema не меняется;
- RU остаётся default/fallback locale;
- gameplay, story graph, save schema и authored VN IDs не меняются.

## Automated QA

Добавлен `tests/LocalizationProductionContract.test.ts` и focused command
`npm run localization:audit`.

Gate проверяет:

- exact seven-locale production registry;
- runtime selector содержит только production-ready RU/EN;
- pending locales не могут быть runtime-selectable;
- CJK metadata/tag consistency;
- текущий EN catalog сохраняет полный RU key/placeholder contract;
- glossary IDs уникальны и содержат translator guidance.

## Next

После acceptance ANM-029A следующий атомарный pass — **ANM-029B Belarusian Production**.
Он должен добавить полный `be` catalog для всего канона/системных поверхностей, пройти этот audit
и только после этого сделать `be` runtime-selectable.
