# ANM-029B4 — Belarusian Production Completion

Status: COMPLETE — R1.1 merged via PR #135 on 2026-08-16; full-catalog linguistic + CI + runtime QA accepted.

## Цель

Одним финальным production batch закрыть оставшийся белорусский scope после merged B3P: перевести canonical VN slots 16–21 со всеми тремя authored ending routes, закрыть ранее отложенные VN/system/tooling/dossier/ending surfaces, пройти полный source-key audit и только после этого сделать `be` runtime-selectable.

`ANM-029B3P_R1` уже merged через PR #134; B4 строится поверх этого exact main baseline и не повторяет slot 15 в delta.

## Scope каталога

На merged B3P baseline в `beCatalog` отсутствуют **999** ключей стабильного RU source catalog:

- **781 VN**:
  - slot 16: `VN0727–VN0765`, scenes 33–34, `CUE_017`, `trust-vincent`;
  - slot 17: `VN0766–VN0805`, scenes 35–36, `CUE_018`;
  - slot 18: `VN0806–VN0845`, scenes 37–38, `CUE_019`, `final-strategy`;
  - slot 19 / Ending B: `VN0846–VN0884`, scenes 39–40;
  - slot 20 / Ending A: `VN0885–VN0924`, scenes 41–42;
  - slot 21 / Ending C: `VN0925–VN0964`, scenes 43–44;
  - 29 remaining VN support keys: chrome/config/history/status plus the shared story-choice header;
- **100 Scene Studio** strings;
- **66 Level Lab** strings;
- **22 ending UI/outcome** strings;
- **15 character-name** strings;
- **15 dossier** strings.

После ANM-025G1 `beCatalog` сохраняет exact parity с `ruCatalog`: **3855 / 3855** base keys; 15 retired Level Lab blocker aliases удалены симметрично из всех release locales. Separate F2 reaction catalog остаётся exact **132 / 132**; runtime `appCatalogs.be` therefore имеет тот же полный key set, что RU/EN.

## Canonical routing

`storyGraph` не меняется. Финальная common route заканчивается `VN_SCENE_38_E18_POST` и branch gate `final-strategy` сохраняет маршруты:

- choice A → `VN_SCENE_39_E19_PRE` → `M3_19_PRIVATE_RETURN` → `ENDING_B_CASE_CLOSED`;
- choice B → `VN_SCENE_41_E20_PRE` → `M3_20_SERVER_CONSENT_LOGS` → gated `ENDING_A_FULL_TRUTH` с fallback в Ending B;
- choice C → `VN_SCENE_43_E21_PRE` → `M3_21_CONVENIENT_CASE` → `ENDING_C_PERFECT_SUSPECT`.

Все screenplay payload/directive строки сохраняются дословно, включая `{ADD CUE_016}`, `{ADD CUE_017}`, `{CHOICE trust-vincent}`, `{ADD CUE_018}`, `{ADD CUE_019}` и `{CHOICE final-strategy}`.

## Runtime readiness

Accepted runtime state after the full-catalog gate:

- `be` → `status: production-complete`;
- `be` → `runtimeSelectable: true`;
- `supportedLocales` → `['ru', 'be', 'en']`;
- `appCatalogs` получает полный Belarusian base + reaction catalog;
- `resolveLocale('be-BY')` корректно сводится к `be`;
- CJK/Portuguese targets остаются translation-pending и не попадают в selector.

## Linguistic / technical contracts

- RU остаётся authoritative source, EN — semantic reference;
- имена и терминология продолжают уже утверждённые формы: `Міку`, `Оноэ`, `Аюкі`, `Рына`, `Хіната`, `Вінсент`, `Куросэ`, `Second Skin`, `Asterion`, `Маршрут згоды`, `Закрыты спіс пілота`;
- production labels, IDs, English protocol names, telemetry identifiers, JSON/tooling terminology и placeholders не переводятся там, где они являются частью технического контракта;
- named placeholders сохраняются exact;
- в пользовательском белорусском каталоге не допускаются русские-only кириллические буквы `И/и`, `Щ/щ`, `Ъ/ъ`;
- source IDs, story graph, Match-3 definitions и gameplay balance не меняются.

## QA

`BelarusianCompletionLocalization.test.ts` добавляет global readiness gate:

1. exact `3855 / 3855` base-key parity;
2. zero missing / extra / empty / placeholder drift;
3. exact `132 / 132` reaction parity;
4. runtime app-catalog key parity RU/BE/EN — no missing-key fallback;
5. `production-complete` + selector integration;
6. exact preservation of all screenplay directives;
7. final route/ending boundaries;
8. Russian-only Cyrillic guard for translated catalog text.

Все ранее созданные bounded Belarusian tests остаются регрессией и обновляются на production-complete runtime status.

## После merge

Другие production-locales (`zh-CN`, `ja`, `ko`, `pt-BR`) не стартуют автоматически. ANM-029H выполняет согласованный backlog/roadmap reset и оставляет их на product-level pause до отдельного решения о возобновлении.
