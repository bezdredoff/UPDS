# ANM-028B1 R3 — Runtime Portrait Parity & Calibration

Status: R3 candidate / manual QA required. COMPLETE only after candidate PR CI, `/preview/`
iPhone QA and manual merge.

Baseline: `main` merge commit `c9c05f114cf3951efcc0c4ca9d36faf2c6bff6db`
(ANM-027E / PR #91). PR #92 contains superseded R1. PR #93 contains rejected R2: its CI passed,
but manual iPhone QA found small floating full-body actors. Neither PR is an accepted baseline.

## Почему понадобился R3

R2 правильно переиспользовал реальную четырёхрядную VN-оболочку, но не runtime-геометрию актёра.
Playable VN показывает персонажа как крупный crop (`height: 178%`, `bottom: -78%`) с нижней частью
под dialogue card. Scene Studio помещал полный `1024×1536` canvas в высоту stage и дополнительно
уменьшал его до `0.35–0.62×`. Поэтому preview не соответствовал игре: персонажи были слишком
маленькими и из-за прозрачного нижнего padding выглядели висящими в воздухе.

R3 сохраняет восемь preset IDs, реальный frame, viewport/background calibration и zero-new-art
contract, но выводит сценических актёров через тот же `.portrait` primitive, что playable VN.
Полный master-canvas разрешён только в отдельном lineup QA и не считается сценой.

## Machine-readable contracts

### Reusable staging

Canonical source: `src/data/sceneStaging.ts`, format `upds-scene-staging-v1`.

- coordinate space — normalized percent;
- общий safe frame — `4..96%`;
- slot фиксирует anchor, safe box, z-index и, где применимо, shot scale;
- actor safe box имеет семантику `face-critical-lane`: он защищает лицо/identity-critical область,
  а не заставляет весь прозрачный PNG помещаться без overlap;
- `canonicalCharacterScale` остаётся частью `upds-character-production-v2`;
- actor `shotScale` измеряется относительно принятой runtime camera и не может быть меньше `0.68`;
  он не может исправлять плохой character master;
- validator проверяет exact preset/slot set, finite coordinates, containment, non-overlap и budget.

### Studio calibration

Canonical QA source: `src/data/sceneStudioCalibration.ts`, format
`upds-scene-studio-calibration-v1`.

Он зеркалит ANM-024 portrait matrix:

- `320×568`;
- `375×667`;
- `390×844`;
- `393×852`;
- `430×932`.

Каждый preview использует representative non-zero safe area `47 / 0 / 34 / 0`. Для каждого из
пяти текущих background masters фиксируются:

- исходный master `1080×1920`;
- runtime `contain-over-fill` fit;
- scene index;
- estimated focal point;
- estimated horizon;
- estimated footline;
- estimated actor zone.

Все background measurements имеют status `estimated-needs-manual-approval`. Они являются
видимыми направляющими и не объявляют перспективу существующего арта утверждённой.

## Восемь пресетов

| Preset | Slots | Назначение | Shot scale |
|---|---:|---|---|
| `solo-close` | 1 actor | принятый runtime крупный план | `1.00` |
| `solo-medium` | 1 actor | базовый одиночный кадр | `0.90` |
| `two-shot-conflict` | 2 actors | спор / opposing face lanes | `0.84 / 0.84` |
| `two-shot-alliance` | 2 actors | близкий командный кадр | `0.80 / 0.80` |
| `trio-central-speaker` | 3 actors | центральный говорящий + supports | `0.78 / 0.72 / 0.72` |
| `trio-reaction` | 3 actors | асимметричная групповая реакция | `0.76 / 0.72 / 0.70` |
| `evidence-cutaway` | 1 native UI | локализуемая улика без hero art | n/a |
| `guest-testimony-card` | guest shell + native UI | граница будущего guest package | shell `0.62` |

Preset composition itself triggers zero new runtime art, background masters and hero clue close-ups.

## Shared runtime frame and portrait camera

`src/ui/vnFrameMarkup.ts` теперь является общим DOM contract для:

- playable `VnController`;
- read-only Scene Studio preview.

Он владеет production-классами и структурой:

- contain-over-fill background stack;
- header / dossier / history / settings;
- stage slot;
- dialogue shell, nameplate, authored emotion and paging;
- SKIP / AUTO / SAVE / LOAD controls.

`VnController` по-прежнему владеет runtime behavior, session, measurement и navigation. Studio
передаёт только stage/overlay markup и использует prefixed inert control IDs. Поэтому QA surface не
становится вторым игровым controller и не расходится с runtime chrome.

`src/ui/vnPortraitGeometry.ts` фиксирует принятую runtime camera `178 / -78` и выводит из неё
group-shot height/bottom так, чтобы верх master-canvas оставался на `0%`, а нижняя часть всегда
уходила под dialogue card. И playable VN, и scene-mode Studio используют класс `.portrait`.
Отдельный Studio full-body renderer удалён.

## Scene Studio R3

Studio позволяет:

- переключать восемь presets и пять background masters;
- выбирать любой portrait viewport из ANM-024 matrix;
- видеть реальную authored RU/EN реплику, emotion, text scale и fallback paging;
- включать/выключать OS safe area, master contain box, focal point, horizon, footline, actor zone и
  preset safe boxes;
- переключаться между runtime-cropped scene composition и full-master neutral lineup;
- видеть Miku/Onoe/Ayuki/Emi на одинаковом `1024×1536` canvas с фактическими alpha-height,
  bottom padding и center offset;
- видеть automatic errors, measurable warnings и manual art checks раздельно;
- копировать read-only `upds-scene-studio-qa-v1` JSON brief для AI/art handoff;
- проверить native evidence cutaway и asset-free guest shell.

Studio не пишет screenplay, saves, manifests, calibration approvals или production assets.

## Автоматические и ручные проверки

### Automatic errors

- staging/calibration schema drift;
- missing/extra viewport or background profile;
- invalid safe-area/background coordinates;
- slot containment/non-overlap/budget errors.

### Measurable warnings

R3 не меняет canonical character scale, но показывает bottom-pivot drift в lineup. На текущих assets neutral
Miku имеет `118 px` прозрачного отступа снизу против `26 px` у reference Onoe. Разница больше
допустимого QA threshold и видна как warning. Это кандидат на исправление master canvas, а не повод
добавлять scene-specific runtime scale.

### Manual gates

Только человек относительно approved external Golden Sample принимает:

- единый 2000s Hybrid style;
- анатомию и пропорции;
- взрослый visual age;
- palette/value grouping;
- light direction и интеграцию с фоном;
- перспективу, horizon, footline и actor zone.

Нейтральный master должен быть принят в lineup до генерации остальных expressions и Pose B.

## Явные границы

В 028B1 R3 не входят:

- автоматическая миграция authored VN lines на presets;
- изменение текущей single-active-speaker runtime presentation;
- свободный drag/scale как production source;
- background/actor/expression/Pose B authoring и production config export — 028B2;
- guest/witness schema, renderer и validator — 028B3;
- blink/breathing/speaking motion — ограниченный 028C proof;
- новые characters, backgrounds, CG или hero clue close-ups;
- встроенная image generation;
- изменение `upds-character-production-v2` и его семи full-stage assets.

## Automated coverage

- `tests/SceneStagingContract.test.ts` — eight-preset registry, face-lane semantics, runtime-camera
  derivation, resolver, viewport/calibration matrix, contain geometry и measurable lineup warning;
- `tests/SceneStudioFoundation.test.ts` — shared VN frame, real dialogue/chrome, multi-actor,
  lineup, viewport, evidence, guest boundary и QA report smoke;
- `tests/VnPresentation.test.ts` — playable VN и Studio используют общий frame contract;
- localization parity/audit включает новые controls;
- focused command: `npm run scene:audit`;
- authoritative gate: GitHub CI `npm run check`.

## Mobile acceptance

До merge проверить `/preview/` на iPhone portrait:

1. Scene Studio открывается из главного меню, скроллится и возвращается назад.
2. Default `390×844` frame показывает тот же header/dialogue/controls и тот же крупный
   bottom-anchored portrait crop, что playable VN; персонаж не виден целиком и не висит над полом.
3. Переключаются все пять viewport profiles; `320×568` включает compact layout, ничего критичное не
   обрезано safe area.
4. Все восемь presets и пять backgrounds переключаются без broken images/layout jump; two-shot и
   trio остаются крупными, лица читаемы, а нижняя часть перекрыта dialogue card.
5. Runtime использует contain-over-fill: голубой master box честно показывает blurred bands на
   более высоких viewport.
6. Dialogue, nameplate, paging dots, line ID и bottom controls реально перекрывают кадр так же, как
   в игре.
7. Только Lineup показывает четыре full-body neutral masters на общем canvas; warning Miku bottom
   pivot видим, но lineup не принимается за runtime composition.
8. Horizon/footline/actor-zone помечены как estimate и оцениваются отдельно для каждого фона.
9. Evidence остаётся native localized UI; guest — явным non-production shell без fake path.
10. RU/EN и normal/large text не ломают controls/dialogue.
11. JSON brief копируется и содержит viewport, background calibration, actors и diagnostics.
12. Playable VN regression: новая shared markup функция не изменила progression, AUTO/SKIP,
    history/settings/save/load behavior.

Только после green candidate CI, Files changed review, этой ручной проверки и merge roadmap может
считать ANM-028B1 закрытым. Следующим production focus после этого остаётся ANM-027F.
