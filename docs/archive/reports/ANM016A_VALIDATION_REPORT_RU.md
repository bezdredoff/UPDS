# ANM-016A · Validation report

Версия: `0.16.1-anm016a`

## Scope

Только **VN Character Staging & Anchoring**. Новые изображения не создавались и не добавлялись.

## Реализовано

- production portraits больше не центрируются как full-body;
- sprite увеличен до close-up framing и нижняя часть уходит за границу stage;
- left/right/center staging определяется из speaker + ближайшего собеседника;
- Мику ↔ Оноэ: стабильные противоположные lanes;
- Мику ↔ Аюки: стабильные противоположные lanes;
- Оноэ ↔ Аюки: стабильные противоположные lanes;
- внешний собеседник располагается напротив команды;
- мысли Мику используют center close-up;
- Pose B использует тот же framing;
- placeholders временно используют те же staging lanes.

## Автоматические / статические проверки

- `tsc -p tsconfig.json`: PASS;
- standalone VN staging executable smoke: PASS;
- full screenplay staging audit для веток A/B/C: PASS;
  - branch A: 208 staged lines — left 91 / right 104 / center 13;
  - branch B: 208 staged lines — left 91 / right 104 / center 13;
  - branch C: 209 staged lines — left 90 / right 106 / center 13;
- ANM-016A static presentation contract: PASS;
- `public/assets/**` против ANM-016 R2: BYTE-EXACT PASS;
- `.github/workflows/*` и `scripts/validate-upload-zip.py`: BYTE-EXACT PASS;
- `narrative.ts`, `levels.ts`, `characterRigs.ts`, `Match3Game.ts`, `CampaignStore.ts`, screenplay: BYTE-EXACT PASS.

## Ограничение локальной проверки

Clean `npm ci` в sandbox не завершился из-за недоступности npm registry/cache. Поэтому полный `npm run check` локально не объявляется PASS. GitHub importer остаётся authoritative clean `npm ci -> npm run check` gate перед candidate PR.

## Ручной QA preview

1. Мику → Оноэ → Мику: Мику слева, Оноэ справа.
2. Мику ↔ Аюки: разные стороны.
3. Оноэ ↔ Аюки: разные стороны.
4. Эми / Кэнтаро / Норихиро / Маю: справа напротив детектива слева.
5. Мику (мысли): центр.
6. Pose B: тот же close-up framing.
7. Голова/торс видны, нижняя часть тела намеренно за границей stage.
8. На коротком iPhone viewport персонаж не превращается обратно в full-body.

## Не входит в ANM-016A

- adaptive dialogue paging / text fit — ANM-016B;
- nameplate layering — ANM-016C;
- header contrast — ANM-016D;
- новые portraits;
- Match-3 changes.
