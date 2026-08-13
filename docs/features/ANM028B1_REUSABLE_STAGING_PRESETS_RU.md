# ANM-028B1 — Reusable Staging Presets & Scene Budget Preview

Status: implemented candidate; COMPLETE after candidate PR CI, `/preview/` iPhone QA and manual merge.

Baseline: `main` merge commit `c9c05f114cf3951efcc0c4ca9d36faf2c6bff6db` (ANM-027E / PR #91).

## Зачем этот срез

До 028B1 `resolveVnStaging()` находил активного персонажа и ближайшего собеседника, но текущий
`VnController` отрисовывал только активного говорящего. Добавлять новые episode-specific CSS
условия или уникальные парные CG означало бы масштабировать one-off production вместо
переиспользования.

028B1 вводит отдельный machine-readable контракт композиции и read-only QA surface. Он позволяет
проверить повторяемые solo/two-shot/trio/evidence/guest layouts на существующих ассетах до массовой
сценарной и художественной продукции.

## Machine-readable contract

Canonical source: `src/data/sceneStaging.ts`, format `upds-scene-staging-v1`.

Coordinate space — normalized percent. Общий safe frame: `4..96%` по обеим осям. Каждый slot
фиксирует anchor, safe box и z-index; actor/guest shell дополнительно имеют shot scale.

Character production scale и scene shot scale не смешиваются:

- `canonicalCharacterScale` и `canonicalCharacterYPercent` приходят из
  `upds-character-production-v2`;
- `shotScale` принадлежит reusable scene preset;
- resolver возвращает оба значения отдельно и вычисляет `effectiveScale` только как наблюдаемую
  производную;
- Studio использует два вложенных transform-слоя: shot wrapper и canonical character wrapper.

Validator проверяет точный preset set/order, slot kinds, finite coordinates, safe-frame containment,
pairwise non-overlap, допустимый shot-scale и совпадение budget с фактическими slots.

## Восемь пресетов

| Preset | Slots | Назначение | Shot scale |
|---|---:|---|---|
| `solo-close` | 1 actor | эмоциональный крупный план | `1.08` |
| `solo-medium` | 1 actor | базовый одиночный кадр | `0.82` |
| `two-shot-conflict` | 2 actors | спор / opposing lanes | `0.54 / 0.54` |
| `two-shot-alliance` | 2 actors | близкий командный кадр | `0.49 / 0.49` |
| `trio-central-speaker` | 3 actors | центральный говорящий + supports | `0.40 / 0.35 / 0.35` |
| `trio-reaction` | 3 actors | асимметричная групповая реакция | `0.43 / 0.39 / 0.38` |
| `evidence-cutaway` | 1 native UI | локализуемая улика без hero art | n/a |
| `guest-testimony-card` | guest shell + native UI | граница будущего guest package | shell `0.62` |

Каждый preset имеет нулевые triggers для new runtime art, background masters и hero clue close-ups.
Это не означает, что вся игра обязана обходиться без новых ассетов; это означает, что сама
композиция не создаёт новый asset request.

## Scene Studio

`src/features/sceneStudio/SceneStudioController.ts` добавлен в главное меню как QA entry.

Studio позволяет:

- переключать восемь presets;
- проверять их на пяти уже существующих background masters;
- видеть несколько production actors в одном кадре на готовых expression frames;
- видеть global safe frame и отдельные non-overlap safe boxes;
- видеть budget для actor slots, guest shells, native UI и новых art/background/hero triggers;
- проверить native evidence cutaway;
- проверить guest/witness layout shell без фиктивного asset path.

Studio не пишет screenplay, save, manifest или production assets.

## Явные границы

В 028B1 не входят:

- автоматическая миграция authored VN lines на новые presets;
- изменение текущей single-active-speaker presentation в `VnController`;
- background/actor/expression/Pose B authoring controls и export — это 028B2;
- guest/witness asset schema, renderer и validator — это 028B3;
- blink/breathing/speaking motion — это ограниченный 028C proof;
- новые characters, backgrounds, CG или hero clue close-ups;
- изменение `upds-character-production-v2` и его семи обязательных full-stage assets.

`guest-testimony-card` намеренно использует DOM shell. Он не содержит и не генерирует
`./assets/characters/...` path для несуществующего guest character.

## Automated coverage

- `tests/SceneStagingContract.test.ts` — registry, validation, scale separation, exact actor
  assignment, zero-art budget и guest boundary;
- `tests/SceneStudioFoundation.test.ts` — menu/navigation integration, multi-actor preview,
  evidence UI и asset-free guest shell;
- localization parity/audit включает новый controller;
- focused command: `npm run scene:audit`;
- полный acceptance gate остаётся `npm run check` в GitHub CI.

## Mobile acceptance

До merge проверить `/preview/` минимум на iPhone portrait:

1. Scene Studio открывается из главного меню и возвращается назад.
2. Все восемь presets переключаются без пустого/сломавшегося кадра.
3. `two-shot-*` показывают двух персонажей, `trio-*` — трёх; safe boxes не пересекаются.
4. На `320×568` controls, preview и budget доступны через scroll, header не блокирует navigation.
5. Все пять backgrounds переключаются без layout jump.
6. Evidence cutaway читаем и не содержит baked localized text в asset.
7. Guest testimony показывает shell + card и не выглядит production-ready персонажем.
8. RU/EN labels не переполняют controls/cards.
9. Reduced Motion не скрывает информацию; Studio не добавляет motion.

Только после green candidate CI, Files changed review, этой проверки и ручного merge roadmap может
считать ANM-028B1 закрытым, а следующим production focus становится ANM-027F.

