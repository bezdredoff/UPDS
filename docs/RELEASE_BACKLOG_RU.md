# UPDS — Release Backlog

Status: **active release-planning source**, ANM-030B0H + ANM-030B0I + ANM-030B1B1–B1B8. G2a bounded architecture cleanup завершён.

Этот документ отвечает только на два вопроса:

1. что ещё реально нужно сделать до первого релиза;
2. какие накопившиеся идеи полезны, но не должны автоматически становиться обязательной работой.

Историю уже завершённых фич хранит `ROADMAP_RU.md`, feature docs и Git. Machine-readable art baseline остаётся в `src/content/art/ANM030A.asset-gap-audit.json`; live guest runtime state после ANM-028B3 R1.2 определяется `src/data/guestWitnesses.ts` и `tests/RuntimeAssetInventory.test.ts`.

Актуальная runtime-проверка B1 запускается через `npm run assets:audit`. После guest production-art integration inventory должен показывать: `23` semantic background keys, `23` production WebP, `0` aliases/fallbacks, `9` full-stage characters, `5` Match-3 bonus PNG, **`6` production guest packages / `24` guest PNG / `0` planned guest fallbacks**. Path/decode и guest-contract errors: `0`.

## Цель первого релиза

Текущий реалистичный base-release target:

- portrait-first **web/PWA**;
- полный authored Story scope `0–21` с тремя финальными routes `19–21`;
- отдельный player-facing Match-3 Campaign остаётся частью продукта;
- production locales: **RU / BE / EN**;
- девять full-stage персонажей в уже закрытом production contract;
- release build не показывает игроку internal QA/tooling surfaces;
- portrait release не ждёт landscape, дополнительных языков, character animation, hero-CG system или уникальных песен.

Если позже меняется платформа релиза (native stores/desktop и т. п.), это отдельное product decision и новый release delta, а не скрытое расширение текущего backlog.

## Приоритеты

### G4a — очередь после арт-ревью 2026-09-30

Все 150 изображений просмотрены: **117 approved / 33 rework / 13 blocker**.
G4a остаётся active до исправлений, повторной пользовательской приёмки и runtime-проверки.
Первым выполняется `G4a-MAYU`: дизайн v5b и основная поза v6 уже утверждены пользователем.
Семифайловый пакет v7 нормализован и 2026-10-01 интегрирован локально целиком.
Геометрия/eye-line и hash-baseline обновлены, старые PNG сохранены для отката.
Далее ручная проверка lineup, эмоций, Pose B и портрета в игре/на телефоне;
изменения отправляются отдельным GitHub PR; merge/deploy остаются отдельным шагом.
Остальные 26 замечаний не теряются:
эмоции/глаза Мику, Оноэ, Рины, Куросэ и Винсента; alpha Мику; волосы Оноэ;
зрачок Эми; простая Pose A Рины; читаемость трёх бонусов.
Точная очередь, границы и исходный JSON: [отчёт G4a](reviews/G4A_ART_REVIEW_2026-09-30.md).
117 approved сохраняются; закрытые G0 и G3 presentation не открываются заново.

- **R0 — release blocker:** без этого base release не считаем production-ready.
- **R1 — release-worthy:** желательно закрыть до релиза, но можно сознательно cut, если текущая реализация уже качественно достаточна.
- **R2 — post-release / optional:** не задерживает base release.
- **DROP / evidence-only:** не строить без новой доказанной потребности.

## G2a — bounded architecture / patch cleanup

Полный engineering plan: [`architecture/G2A_CLEANUP_PLAN_RU.md`](architecture/G2A_CLEANUP_PLAN_RU.md).

Цель этого track — не общий rewrite, а удаление доказанных duplicate owners и workaround layers перед RC. Глобальные runtime/layout задачи выполняются небольшими PR; art/guest production может идти параллельно.

| Task | Status | Outcome |
| --- | --- | --- |
| `G2a-ARCH-001` | **accepted · #288** | один `ViewportRuntime` владеет geometry и layout tokens |
| `G2a-ARCH-002` | **accepted · #289** | один владелец `resize/orientationchange`; VN только repagination subscriber |
| `G2a-ARCH-003` | **accepted · #290** | persistent `.viewport-shell/.phone` + persistent `app-screen-host` |
| `G2a-ARCH-004` | **accepted · #291** | единый `upds-game` compact/container layout вместо `650px OR 340px` presentation decision |
| `G2a-ARCH-005` | **accepted · #292/#293** | один standalone CSS activation signal + удалён root-canvas camouflage/compatibility containment |
| `G2a-ARCH-006` | **accepted · #294** | primary button cascade без visual counter-`!important`; feature variants выигрывают semantic specificity независимо от import order |
| `G2a-ARCH-007` | **accepted · #295** | один display-mode resolver и один stable/preview/local lane resolver |
| `G2a-ARCH-008` | **accepted · #296** | shared viewport evidence snapshot для Diagnostics/ViewportDebug |
| `G2a-ARCH-009` | **accepted · #297** | удалить test-only compatibility methods из composition root; tests используют controller/session boundaries |
| `G2a-ARCH-010` | **accepted · #298** | удалить случайный scratch output в root и усилить repository hygiene guard |

Legacy numeric Story save → stable `StorySceneId` намеренно **не входит** в этот cleanup: compatibility adapter пока защищает существующие saves и потребует отдельного save-schema решения. Локальные `clamp()` helpers и Scene Studio viewport simulation также не являются самостоятельными cleanup-задачами.

G2a закрыт после ARCH-010. Не продолжать этот refactor track без нового доказанного regression/ownership риска. PWA KI-001/KI-003 закрыты real-iPhone evidence G0-PWA-001; KI-004 и G0-PWA-002 закрыты пользовательской приёмкой R4 / PR #311 от 2026-09-30. G0 завершён.

## R0 — реальные release blockers

### R0.1 Production player surface — COMPLETE

ANM-030B0I / PR #193 закрыл этот пункт:

- normal player URL больше не показывает `Scene Navigation`, `Level Lab`, `Scene Studio` и `Save Diagnostics`;
- те же production-parity QA tools доступны через явный `?qa=1`;
- Match-3 Campaign остаётся player-facing mode;
- Browser Gate продолжает использовать те же runtime controllers, отдельный QA build не создавался.

Повторно открывать этот пункт только при regression, которая снова выводит internal tooling игроку.

### R0.2 Background semantic closure

После G4 состояние production backgrounds: **`23/23` dedicated production variants и `0` runtime aliases**. Все утверждённые common-route и ending masters интегрированы; `server-room` исключён из текущего scope как отдельная сцена и не входит в runtime catalog.

Aliases закрыты в G4. В backlog больше не добавляются задачи на генерацию `server-room`: отдельная
сцена исключена из scope, а серверный narrative context остаётся в `service-tunnel`.

| Status | Variant | Runtime result | Next action |
| ---: | --- | --- | --- | --- |
| **approved** | `maintenance-room`, `old-gym-night`, `gymnastics-costume`, `asterion-transfer-point`, `campus-path` | dedicated WebP | user-approved 2026-09-12 |
| **approved** | `clubroom-night`, `anonymous-return-counter`, `service-tunnel`, `disciplinary-assembly` | dedicated WebP | user-approved 2026-09-12 |
| **out of scope** | `server-room` | no runtime key; use service-tunnel context | do not generate |

Обязательный outcome:

- не создавать новые family masters ради покрытия: anchor-фаза завершена для всех восьми families;
- production default — ChatGPT Image; ComfyUI использовать как воспроизводимый test/fallback flow;
- visual QA выполняется после интеграции; новые варианты открывать только при доказанном semantic mismatch;
- для уже существующих families делать controlled sibling variants, которые реально нужны, чтобы сцена не выглядела как другая локация/время суток;
- release gate формулируется как **zero visibly wrong semantic background fallbacks in shipped Story**, а не «19/19 уникальных variant PNG»;
- contract-only unused variants `central-laundry` и `campus-street` не производить до реального использования.

Все `23/23` production backgrounds явно утверждены пользователем после локального Scene Studio review 2026-09-12. Повторять полный isolated background review не нужно; в G5 остаётся только integrated device spot-check common route и endings на композицию, читаемость персонажей и runtime-артефакты.

### R0.3 Guest / witness presentation closure — ACCEPTED / PR #308

ANM-028B3 R1.2 переводит все шесть story guests (`hinata`, `gen`, `aoi`, `kubo`, `kubo-mother`, `vincent`) в существующий lean production contract: neutral bust/half-body + `serious` + `smile` + medallion. Runtime manifest содержит **6 production packages / 24 PNG / 0 planned fallback guests**; full-stage source art из внешнего пакета в runtime не импортируется.

30.09.2026 пользователь подтвердил новую подачу после merge PR #308. Runtime использует общий
VN-портрет без прежней рамки и карточки. Эта приёмка закрывает отдельную guest-presentation задачу;
полная матрица всех гостей/языков/устройств остаётся частью финального release pass.

Зафиксированный release outcome:

- ни один shipped guest scene не показывает placeholder initials как финальный art;
- все guest paths проходят `assets:audit` на existence/image signature и остаются под `./assets/guests/<id>/`;
- representative iPhone preview подтверждает crop/scale/face readability общего VN-портрета гостя без per-character CSS fixes; G3-GUEST-UI-001 удаляет прежнюю рамку и карточку свидетеля;
- neutral fallback и обе expression routes работают без 404/decode flash;
- гостей не повышать до full-stage seven-asset rigs без новой драматической необходимости.

R0.3 закрыт. Следующая техническая проверка — общий asset/runtime crawl; отдельно создавать новый
guest-production milestone не нужно без воспроизводимого art/layout defect.

### R0.4 Full playable-content QA

Automated coverage уже сильная, но перед релизом всё равно нужен human release pass:

- пройти Story `0–18` и каждый из финалов `19`, `20`, `21`;
- вручную сыграть все 22 production Match-3 levels на реальном мобильном устройстве: difficulty spikes, unwinnable/soft-lock states, objective readability, retry/progression;
- закрыть уже отмеченный ручной QA direct special combinations на телефоне;
- проверить save/continue/reload на основных границах VN → Match-3 → VN → ending;
- bugs, найденные этим pass, становятся R0 fixes; отдельный большой `025E4` framework сам по себе не нужен.

### R0.5 Final asset/runtime crawl

После последней production-art интеграции:

- каждый shipped story slot должен загрузить background/character/guest/evidence assets без 404/decode errors;
- preload/offline graph не содержит несуществующих URL;
- production build не зависит от Scene Studio browser-local overrides;
- никаких candidate/placeholder/static full-stage seams не возвращается.

Автоматизированный QA-driven asset crawl — предпочтительный дешёвый способ сделать этот gate повторяемым.

### R0.6 PWA / mobile release regression

`G0-PWA-001` закрыт real-iPhone evidence от 2026-09-11. Изолированные варианты доказали:
`fixed; inset:0` помещается в `812px`, а `max(innerHeight, screen.height)` создаёт shell `874px` и
обрезает ровно `62px`; `black-translucent` дополнительно воспроизводит нижнюю полосу. Candidate
использует layout viewport, status-bar `default` и сохраняет safe-area внутри controls. Fresh-install
проверка PR #301 online/offline успешна: полоса исчезла, VN помещается; KI-001 и KI-003 закрыты.

`G0-PWA-002` активирован последующим real-iPhone observation: быстрые тапы вызывали iOS smart zoom
на Match-3 и level-intro, тогда как VN уже был защищён локально. PR #302 исправил Match-3, но
real-iPhone retest 2026-09-12 подтвердил остаточный rescale на level-intro. Follow-up явно задаёт
`touch-action: manipulation` всему intro subtree, не запрещает pinch zoom и не меняет
`touch-action: none`/intentional special double tap на board. Проверка 2026-09-30 выявила smart zoom
на тексте и хэдере расследования 3/22 «Мокрые показания», тогда как фон не увеличивается.
Новый candidate задаёт явную policy всем descendants общей оболочки, включая scroll hosts и
native details/summary; локальное intro-правило удалено. Эта R3 реализация ещё не закрыла KI-004.

После merge PR #310 пользователь сообщил, что zoom сохранился. Stable deploy PR #310
подтверждён, но актуальность cached phone build отдельно не подтверждена. R4 дополняет CSS
ограниченным passive-content touchend fallback; tests проверяют отмену browser default
и исключения для scroll/pinch/controls/board.

**G0 — ACCEPTED, 2026-09-30:** после импорта R4 и merge PR #311 (`5dbddae`) пользователь
повторно проверил исправление на телефоне, подтвердил «теперь всё работает как надо» и явно
разрешил закрыть G0. G0-PWA-001/002 приняты; KI-001/KI-003/KI-004 закрыты.
Приёмка этого дефекта не подменяет full-release offline/update/save/device gate G5c; KI-002 открыт.

Перед RC подтвердить существующие, а не строить новые, capabilities:

- fresh install, reload, offline start/recovery и update flow;
- save survives normal update path;
- iOS Safari/standalone PWA и хотя бы один representative Android Chromium device;
- portrait safe areas, keyboard-less gameplay viewport, home indicator/cutout;
- no critical memory/loading/render regressions после финального art payload.

Дополнительный PWA recovery E2E полезен, но release blocker — корректное поведение, а не число automation tests.

### R0.7 RU / BE / EN release-language QA

Дополнительные языки не нужны для base release. Для трёх активных языков нужны:

- финальная proofreading pass;
- zero missing/fallback keys;
- mobile overflow/paging check на release viewport cohort;
- character/clue terminology consistency.

### R0.8 Minimum accessibility / interaction gate

Не требуется превращать релиз в отдельный accessibility rewrite. Но критические player actions должны оставаться доступны и читаемы:

- usable touch targets;
- rapid taps не вызывают browser smart zoom на player, level-intro или Match-3;
- pinch zoom остаётся доступным вне board, а Match-3 drag и intentional special double tap работают;
- видимый keyboard focus там, где keyboard navigation поддерживается;
- meaningful labels для основных controls;
- контраст/читабельность текста;
- reduced-motion setting/OS preference не должен ломать progression, если motion используется.

Critical defects — R0 fixes; расширенная accessibility certification отдельно не планируется без platform requirement.

### R0.9 Public release package / rights sanity

Это не новый gameplay feature, но для публичного релиза нужен короткий product/legal packaging pass:

- финальные player-facing title/description/PWA manifest metadata и install icons соответствуют реально выпускаемой игре;
- есть понятные credits и проверено право использовать shipped art/audio/fonts/third-party material в выбранном способе распространения;
- локальная playtest telemetry не маскируется под внешнюю analytics: если позже появляется отправка данных на сервер/third party, privacy/consent становится отдельным обязательным release delta;
- content/age notice, privacy page, imprint/terms или rating добавляются ровно в объёме, который требует выбранная площадка/юрисдикция, а не как заранее придуманный framework;
- production URL/hosting и rollback/update owner определены до публичной ссылки.

Для закрытого/private playtest этот пункт можно упростить. Для публичного base release его нельзя заменять ещё одним art-polish milestone.

## R1 — желательно до релиза, но не ценой задержки продукта

### R1.1 Mobile locale × viewport automation

RU/BE/EN на существующих portrait sizes `320×568`, `375×667`, `390×844`, `393×852`, `430×932`. Проверять geometry/overflow/visibility, не плодить screenshot baselines.

Это хороший low-maintenance regression gate, особенно после финального art/localization pass.

### R1.2 PWA offline/recovery Browser Gate expansion

Добавлять только сценарии, которые защищают реальный release risk и не дублируют unit/controller coverage.

### R1.3 Controlled background variants

Все runtime family masters закрыты после G4. Новые варианты производить только при фактическом visual mismatch; production default — ChatGPT Image, а ComfyUI использовать как воспроизводимый test/fallback flow.

### R1.4 Extras visual archetypes — conditional

Macro содержит 7 semantic extras roles и budget ≤4 reusable adult archetypes. Делать их только там, где реальная playable scene выглядит незаконченной без extra art. **Не производить семь уникальных персонажей.**

### R1.5 Match-3 special/bonus visual pack — COMPLETE

`flash-row`, `flash-column`, `evidence`, `lead`, `insight` используют общий production pack из пяти transparent `256×256` PNG. R2 заменяет ими полноразмерный base tile, оставляя только маленький type marker; SVG сохранены как semantic runtime fallback, а Help показывает реальные изображения вместе с правилами создания и эффектом на RU/BE/EN. Qualifying cascade/refill matches теперь создают те же bonuses; story-object numeric tags удалены, invalid feedback держится `1600 ms`.

Audit фиксирует `productionReadyMatch3SpecialVisuals = 5`, `outstandingMatch3SpecialVisuals = 0` и `blockingMatch3ArtGaps = 0`.

Отдельный activation/combo VFX pass остаётся optional polish после playable board QA.

### R1.6 Audio quality decision, не song pipeline

В runtime уже есть четыре procedural WebAudio themes (`menu`, `vn`, `match`, `ending`) и SFX. Полный ANM-032 song/album pipeline не нужен для base release.

Перед RC достаточно одного product listen-through:

- если текущий звук воспринимается как приемлемый стилизованный soundtrack — оставить;
- если он явно выдаёт prototype, сделать небольшой bounded soundtrack replacement/pass;
- не создавать уникальную песню на каждый level/episode.

### R1.7 Quantitative Match-3 reporting — evidence-driven

Усиливать balance metrics/reporting только если финальные human playtests находят проблему, которую неудобно локализовать текущими deterministic tools.

## R2 — post-release / optional

### Hero clue close-ups / Hero Insert

Audit budgeted 6 hero close-ups, но runtime отдельного Hero Clue renderer **сейчас не существует**. `HERO INSERT` в screenplay — режиссёрская ремарка; `CUE_004` и похожие изображения — обычные clue/ingredient assets.

Решение после review:

- **не строить Hero Clue system для первого релиза**;
- native evidence + dialogue/dossier уже передают информацию;
- если позже visual pacing действительно требует акцента, делать минимальный reusable `insert → tap → continue`, а не gallery/zoom/collection subsystem;
- `conductive-seam` больше не является автоматически «следующей обязательной фичей».

Historical roadmap label `ANM-030B1A [P1] — NEXT PROPOSED VERTICAL-SLICE ART MILESTONE` считается superseded этой оценкой.

### ANM-028C Safe Character Motion

Breathing/blink/speaking motion — polish. Static expressive sprites приемлемы для base VN release. Возвращаться только после evidence из playtest/marketing capture, что статичность заметно снижает качество.

### ANM-031 Landscape Support

Portrait-first PWA может релизиться без landscape. Architecture не должна ломать landscape навсегда, но parity implementation — post-release.

### Additional locales

`zh-CN`, `ja`, `ko`, `pt-BR` остаются paused. Возвращаться по audience/market data или конкретному launch plan. Они не блокируют RU/BE/EN release.

### ANM-032 Music & Level Song Pipeline

Comedic songs, stems и album/export structure — content/marketing expansion, не core release requirement.

### ANM-023G8C2 Campaign completion browser E2E

`G8C2 Campaign completion/progression browser E2E is DEFERRED, not required for G8 completion.` Возвращаться только при конкретной regression/value case.

### Large-scale character animation

Не планировать до доказанной product value. Если motion понадобится, сначала bounded safe-motion experiment, а не animation production pipeline.

### DLC-001 Beach Episode

Post-launch expansion only. Не расходует base-release capacity.

## DROP / не делать без нового evidence

- Selenium/WebDriver как второй browser automation stack;
- 19 независимых background illustrations ради закрытия alias counter;
- `central-laundry` и `campus-street`, пока story их не использует;
- семь уникальных extras вместо ≤4 reusable archetypes;
- возврат planned/placeholder/candidate full-stage runtime lane;
- per-level Match-3 special-art packs;
- новая одноразовая Match-3 mechanic, не используемая минимум в четырёх уровнях;
- сложный Hero Clue gallery/zoom/collection subsystem;
- уникальная песня для каждого Match-3 level;
- дополнительные Golden Sample screenshots ради покрытия без нового regression signal;
- automation task только для увеличения test count;
- cleanup двух legacy/orphan clue binaries, пока нет конкретного repository/runtime вреда.

## Отдельные process checks, которые не являются player-release blockers

- при следующем естественно rejected/stale ZIP подтвердить live failure-cleanup path. Не создавать искусственный релизный milestone только ради этого;
- локальный ComfyUI/VNCCS/generator R&D не меняет production status до deliberate approved import.

## Рекомендуемая последовательность от текущего `main`

1. **G4a — исправления арт-ревью:** 33 rework / 13 blocker в исходном ревью; `G4a-MAYU` — семь assets v7 локально интегрированы 2026-10-01, далее ручная lineup/scene/device приёмка. Затем пройти остальные 26 замечаний (шесть blocker) по [отчёту](reviews/G4A_ART_REVIEW_2026-09-30.md), повторную приёмку и runtime-проверку. 117 approved не переделывать без нового дефекта; G3 shared presentation остаётся accepted, улыбка Винсента исправляется отдельно.
2. **G5a — финальная RU/BE/EN вычитка:** editorial pass RU интегрирован; остаются финальные языковые/paging/overflow проверки.
3. **G5b — human Match-3 playtest:** balance, design и variety всех 22 уровней.
4. **G5 — full playthrough и asset crawl:** Story `0–21`, три финала, progression и загруженная графика.
5. **G5c / ANM-033 — финальная release regression:** PWA/update/offline/save, iOS + Android, RU/BE/EN, accessibility/performance, public-release packaging/rights. KI-002 остаётся открытым здесь. Принятые G0 contracts повторно проверить на финальном payload, не открывая новый PWA refactor без дефекта.
6. **G6 — RC:** исправить только найденные release defects, затем packaging/deploy/rollback.
7. Hero inserts, landscape, extra locales, safe motion, song pipeline и DLC остаются после base release.

G0 и G3 закрыты явной пользовательской приёмкой 2026-09-30; G2a также закрыт. Они не являются следующими задачами.

G2a ARCH-001–010 accepted и не является следующим действием. Возвращаться к architecture cleanup можно только по новому доказанному regression/ownership риску.

## Stop rule

Новая идея **не попадает в R0 только потому, что она когда-то была записана в roadmap**. Для повышения до release blocker нужен хотя бы один из сигналов:

- без неё ломается progression/content comprehension;
- игрок видит очевидный placeholder/wrong asset;
- есть crash/data-loss/offline/update/accessibility-critical defect;
- есть подтверждённый device/localization regression;
- release platform требует capability;
- human playtest показывает повторяемую существенную проблему.

Если такого сигнала нет, задача остаётся R1/R2 либо удаляется.
