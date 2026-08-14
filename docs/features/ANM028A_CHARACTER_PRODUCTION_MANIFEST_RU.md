# ANM-028A — Character Production Manifest & Validator Foundation

## Цель

Перед производством Kentaro/Norihiro/Mayu убрать расхождение между реальным precomposed-frame runtime и устаревшей документацией ANM-021.

## Что добавлено

- canonical `upds-character-production-v2` в `src/data/characterProduction.ts`;
- единый production/planned status для семи текущих персонажей;
- обязательный runtime set: 5 Pose A expressions + Pose B + medallion;
- общий 1024×1536 pose canvas и bottom-center pivot;
- explicit adult-character guardrail;
- `precomposed-static` animation policy; blink/speaking остаются deferred;
- pure manifest validator;
- `npm run character:audit`;
- asset-level regression test с чтением PNG IHDR без внешней image dependency;
- `characterRigs.ts` теперь строит production rigs/staging/placeholders из того же manifest, чтобы docs/tooling/runtime не расходились молча.

## Baseline status

Production:
- Miku
- Onoe
- Ayuki
- Emi

`production` здесь означает наличие полного runtime set и routing, а не автоматическое
художественное одобрение. R4 добавляет отдельный `visualApproval`: Miku/Onoe/Ayuki — `approved`,
Emi — `rebuild-required` после lineup QA.

Planned:
- Kentaro
- Norihiro
- Mayu

Planned characters не получают фальшивые asset paths. До production integration они продолжают отображаться placeholder-ами.

## Medallion resolution

Существующий baseline неоднороден: Miku/Onoe/Ayuki используют 256×256, Emi — 512×512. Это не
runtime-size bug: UI определяет отображаемый размер независимо. Однако R3 manual QA отдельно
отклонил сам Emi master по стилю/full-body framing; допустимый размер medallion не является visual
approval.

## Пропорциональный рост

R2 добавляет explicit proportion gate. Одинаковый 1024×1536 canvas сохраняет общую virtual camera, но персонажи не должны становиться одинакового роста.

Runtime-integrated neutral alpha-height baseline:
- Miku — 1375 px;
- Onoe — 1484 px (reference);
- Ayuki — 1462 px;
- Emi — 1444 px.

Manifest хранит alpha-bounds и visual height каждого production master. CI декодирует реальные RGBA PNG, сверяет neutral bounds и проверяет, что expression frames не меняют высоту больше чем на 1 px.

R4 также хранит `neutralEyeLineYPx` (`Miku 196`, `Onoe 158`, `Ayuki 242`, `Emi 397`) и отдельный
visual-approval status. Eye landmark нужен для focal-eye-line camera и не компенсирует неверный
master. Существующий Emi alpha-height считается технической метрикой временного fallback, а не
утверждённым full-body baseline.

Kentaro/Norihiro/Mayu получают `proportionApproval: required-before-production`: сначала standalone master + lineup QA, затем фиксация target/bounds в manifest, и только после этого expressions/assets могут считаться production.

Runtime scale не используется как способ «починить» неправильный рост: canonical height кодируется в master canvas.

## Что намеренно вне 028A

- новая генерация персонажей;
- Character/Scene Studio UI;
- breathing/blink/speaking animation;
- multi-character staging redesign;
- новые poses beyond one required Pose B;
- изменение VN layout или visible behavior.

## Следующие slices

- 028B — Character/Scene Studio 2.0: background, shot, actor positions, expression/Pose B/staging preview + shared-baseline lineup/proportion ruler;
- 028C — Safe Character Motion: lightweight breathing/blink/speaking только после replacement/delta proof без overlay artifacts;
- 028D0 — один новый Emi neutral full-body master и lineup/scene QA до генерации остального set;
- 028D — после Emi normalization: Kentaro → Norihiro → Mayu production integration через manifest gate.
