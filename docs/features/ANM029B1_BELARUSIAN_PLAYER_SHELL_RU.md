# ANM-029B1 · Belarusian Player Shell

Build label: `ANM-029B1 R1 · Belarusian Player Shell`.

## Цель

Начать production-перевод `be` на замороженном полном каноне `0–21`, но сохранить пакет достаточно
маленьким для реальной лингвистической проверки.

B1 переводит только player-facing shell и **не включает Belarusian в runtime selector**. Это намеренно:
пока полный каталог не закрыт, русский fallback не должен маскировать отсутствующий перевод.

## Граница пакета

`src/localization/catalogs/be.ts` содержит ровно 61 ключ из prefix-групп:

- `localization.*`;
- `common.*`;
- `menu.*`;
- `settings.*`;
- `audio.*`;
- `pwa.*`.

Не входят в B1:

- Match-3 gameplay/campaign/reactions;
- Level Lab / Scene Studio / diagnostics;
- dossier и ending copy;
- `vn.*` полного сценария.

Эти поверхности идут отдельными reviewable пакетами ANM-029B.

## Readiness contract

`be` остаётся `translation-pending` / `runtimeSelectable: false` в
`LocalizationProduction.ts`; `Locale.ts` и `appCatalogs` по-прежнему содержат только `ru`/`en`.

Новый `BelarusianShellLocalization.test.ts` проверяет:

- exact bounded scope = 61 source keys;
- zero missing/extra/empty keys внутри scope;
- сохранение `{named.placeholders}`;
- отсутствие `be` в runtime catalogs/selectable locales;
- несколько опорных терминов (`Дэтэктывы класа U`, `Мова`, `Налады`).

`CatalogAudit.selectMessageCatalogByPrefixes()` — общий helper для следующих атомарных translation passes.

## Лингвистические решения B1

- product title: `Дэтэктывы класа U`;
- `visual novel` в player-facing tagline → `візуальная навела`;
- технические имена `Level Lab`, `Web Audio`, `SFX`, `match-3` сохраняются там, где они являются
  инструментом/технологическим ярлыком;
- `Haptics` в player-facing copy → `Тактыльны водгук`;
- `online/offline` → `анлайн/афлайн`.

Автоматический structural audit не считается лингвистическим approval. Перед финальным включением `be`
нужна отдельная вычитка всего каталога и мобильная проверка overflow.

## Следующий пакет

ANM-029B2 — Belarusian Match-3 Production: campaign/gameplay/objectives/level copy + отдельный F2 reaction
catalog. `be` после B2 всё ещё остаётся скрытым, потому что VN/ending каталоги будут незавершёнными.
