# ANM-028B1 R4.1 — Multi-Actor Eye-Line & Frame-Accurate Guides

Status: **COMPLETE**. R4.1 passed candidate CI and iPhone visual QA, then merged through PR #96 as
`c224df25c35c610eb6f83e675f8d95f48b92a3c8`.

Implementation baseline was `ec0a7247160c256049a5b18c8b5657f0ecd7b7de`
(R3 / PR #94). PR #92 contains superseded R1; PR #93 contains rejected R2. R3 was merged as a
diagnostic baseline, but subsequent iPhone QA rejected its trio framing and invalidated Emi as a
visual style/full-body reference. R4 / PR #95 corrected trio framing, but its visual QA found two
remaining contract defects: both duo presets still used the old top-lock, and actor guides described
authored slot estimates rather than the selected character PNG.

## Почему понадобился R4.1

R2 правильно переиспользовал реальную четырёхрядную VN-оболочку, но не runtime-геометрию актёра.
Playable VN показывает персонажа как крупный crop (`height: 178%`, `bottom: -78%`) с нижней частью
под dialogue card. Scene Studio помещал полный `1024×1536` canvas в высоту stage и дополнительно
уменьшал его до `0.35–0.62×`. Поэтому preview не соответствовал игре: персонажи были слишком
маленькими и из-за прозрачного нижнего padding выглядели висящими в воздухе.

R3 исправил отдельный Studio full-body renderer, но выводил все уменьшенные group shots с
фиксированным верхом master-canvas. В trio `0.70–0.78×` это снова показывало почти полный рост,
прижимало головы к верхнему краю и не связывало лица с видимой focal-point меткой. Диалоговый блок
только скрывал нижний край и маскировал floating symptom. Тест `height + bottom = 100` закреплял
именно эту ошибку.

R4 доказал рабочую focal-eye-line модель на trio, но оставил duo на `runtime-top`. Из-за этого два
персонажа кадрировались по другой вертикальной логике, хотя имеют те же требования к общей линии
глаз и headroom. Кроме того, preset safe box и подпись на условном `Y=28%` визуально выдавались за
геометрию персонажа, а eye marker всегда использовал neutral metadata даже для выбранного
`serious/smile/surprised/embarrassed` кадра.

R4.1 сохраняет восемь preset IDs, реальный frame, viewport/background calibration и zero-new-art
contract. Solo сохраняют принятую runtime-top камеру; каждый duo/trio actor использует
`background-focal-eye-line`. `upds-character-production-v2` теперь хранит alpha bounds и eye line
для каждого из пяти expression frames. Studio рисует отдельные guides из трёх честно обозначенных
coordinate spaces: background calibration, preset face lane и selected-frame image geometry.
Полный master-canvas разрешён только в lineup QA.

## Machine-readable contracts

### Reusable staging

Canonical source: `src/data/sceneStaging.ts`, format `upds-scene-staging-v1`.

- coordinate space — normalized percent;
- общий safe frame — `4..96%`;
- slot фиксирует anchor, safe box, z-index и, где применимо, shot scale; actor `anchorYPercent`
  выводится из центра face lane и не используется как поддельный image landmark;
- actor safe box имеет семантику `face-critical-lane`: он защищает лицо/identity-critical область,
  а не заставляет весь прозрачный PNG помещаться без overlap;
- `canonicalCharacterScale` остаётся частью `upds-character-production-v2`;
- actor `shotScale` измеряется относительно принятой runtime camera и не может быть меньше `0.68`;
  он не может исправлять плохой character master;
- solo actors используют `runtime-top`; каждый actor в duo/trio обязан использовать
  `background-focal-eye-line`;
- validator проверяет exact preset/slot set, camera-anchor mode, finite coordinates, containment,
  non-overlap и budget.

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

Character guides имеют отдельный источник: `proportion.frameGeometry[expression]` в
`src/data/characterProduction.ts`. `SELECTED FRAME ALPHA` обязан совпадать с ненулевой alpha-областью
показанного Pose A PNG, а `EYES` — с его eye-line landmark. Face lane остаётся композиционным
допуском preset, а не границей силуэта. Pose B использует явно маркированный neutral fallback до
028B2 authoring/measurement и не может считаться frame-accurate без отдельного landmark.

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

`src/ui/vnPortraitGeometry.ts` фиксирует принятую runtime camera `178 / -78` для solo и
отдельно выводит eye-line camera для duo/trio. Pure resolver рассчитывает initial top/bottom,
resolved eye-line и head-top; `SceneStudioController` после layout использует реальные DOM bounds
stage/focal marker и уточняет `--portrait-top` без free-form authoring offsets. Все scene actors
остаются `.portrait`; отдельного Studio full-body renderer нет.

## Scene Studio R4.1

Studio позволяет:

- переключать восемь presets и пять background masters;
- выбирать любой portrait viewport из ANM-024 matrix;
- видеть реальную authored RU/EN реплику, emotion, text scale и fallback paging;
- включать/выключать OS safe area, master contain box, focal point/общую focal eye-line, horizon,
  footline, actor zone, preset face lanes, selected-frame alpha bounds и expression eye lines;
- переключаться между runtime-cropped scene composition и full-master neutral lineup;
- видеть Miku/Onoe/Ayuki/Emi на одинаковом `1024×1536` canvas с фактическими alpha-height,
  bottom padding, center offset, neutral eye-line и отдельным visual-approval status;
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

R4.1 не меняет canonical character scale, но показывает bottom-pivot drift в lineup. На текущих assets neutral
Miku имеет `117 px` прозрачного отступа снизу против `24 px` у reference Onoe. Разница больше
допустимого QA threshold и видна как warning. Это кандидат на исправление master canvas, а не повод
добавлять scene-specific runtime scale.

Emi формально имеет `1024×1536` RGBA canvas и полный runtime set, но её neutral silhouette шириной
`635 px` заканчивается на нижней границе canvas и обрезан на бёдрах; Miku/Onoe/Ayuki имеют
полнофигурные силуэты шириной `488/556/526 px`. Ручной R3 QA также отклонил стиль и effective
detail. Поэтому Emi остаётся runtime fallback, но имеет `visualApproval: rebuild-required` и не
может использоваться как Golden Sample. Следующий visual slice — один новый neutral master.

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

В 028B1 R4.1 не входят:

- автоматическая миграция authored VN lines на presets;
- изменение текущей single-active-speaker runtime presentation;
- свободный drag/scale как production source;
- background/actor/expression/Pose B authoring и production config export — 028B2;
- guest/witness schema, renderer и validator — 028B3;
- blink/breathing/speaking motion — ограниченный 028C proof;
- новые characters, backgrounds, CG или hero clue close-ups;
- встроенная image generation;
- замена PNG assets; R4.1 меняет только metadata guide geometry/visual approval, а новый Emi neutral
  master производится отдельным ANM-028D0 candidate.

## Automated coverage

- `tests/SceneStagingContract.test.ts` — eight-preset registry, face-lane semantics, runtime-top и
  focal-eye-line camera derivation, duo/trio headroom, selected-frame geometry resolver,
  viewport/calibration matrix, contain
  geometry и measurable lineup warnings;
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
   bottom-anchored solo portrait crop, что playable VN; персонаж не виден целиком и не висит над полом.
3. Переключаются все пять viewport profiles; `320×568` включает compact layout, ничего критичное не
   обрезано safe area.
4. Все восемь presets и пять backgrounds переключаются без broken images/layout jump; two-shot и
   trio остаются крупными, лица читаемы, а нижняя часть перекрыта dialogue card.
5. В обоих duo и обоих trio presets жёлтые `EYES` guides проходят через глаза каждого показанного
   expression PNG и совпадают с общей `FOCAL EYE-LINE`; головы имеют заметный headroom и не касаются
   верха.
6. Голубой `SELECTED FRAME ALPHA` box касается фактических крайних непрозрачных пикселей выбранного
   кадра; зелёный `FACE SAFE LANE` остаётся отдельным композиционным допуском и содержит лицо.
7. Runtime использует contain-over-fill: голубой master box честно показывает blurred bands на
   более высоких viewport.
8. Dialogue, nameplate, paging dots, line ID и bottom controls реально перекрывают кадр так же, как
   в игре.
9. Lineup честно помечает Emi `rebuild-required`; текущий обрезанный asset не считается full-body
   или style-approved несмотря на технический runtime status.
10. Horizon/footline/actor-zone помечены как estimate и оцениваются отдельно для каждого фона.
11. Evidence остаётся native localized UI; guest — явным non-production shell без fake path.
12. RU/EN и normal/large text не ломают controls/dialogue.
13. JSON brief копируется и содержит viewport, background calibration, actors, selected-frame
    alpha/eye-line metadata,
    visual approval и diagnostics.
14. Playable VN regression: новая shared markup функция не изменила progression, AUTO/SKIP,
    history/settings/save/load behavior.

Green candidate CI, Files changed review, iPhone QA and merge are complete; ANM-028B1 is closed.
ANM-028D0 neutral, ANM-028D1 smile и ANM-028D2 serious прошли visual QA. Текущий visual slice — ANM-028D3 surprised multi-ROI;
после поштучного завершения Emi set production focus возвращается к ANM-027F.
