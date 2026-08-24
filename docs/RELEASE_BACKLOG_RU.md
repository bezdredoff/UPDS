# UPDS — Release Backlog

Status: **active release-planning source**, ANM-030B0H + ANM-030B0I + ANM-030B1B1–B1B8.

Этот документ отвечает только на два вопроса:

1. что ещё реально нужно сделать до первого релиза;
2. какие накопившиеся идеи полезны, но не должны автоматически становиться обязательной работой.

Историю уже завершённых фич хранит `ROADMAP_RU.md`, feature docs и Git. Machine-readable art status остаётся в `src/content/art/ANM030A.asset-gap-audit.json`.

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

- **R0 — release blocker:** без этого base release не считаем production-ready.
- **R1 — release-worthy:** желательно закрыть до релиза, но можно сознательно cut, если текущая реализация уже качественно достаточна.
- **R2 — post-release / optional:** не задерживает base release.
- **DROP / evidence-only:** не строить без новой доказанной потребности.

## R0 — реальные release blockers

### R0.1 Production player surface — COMPLETE

ANM-030B0I / PR #193 закрыл этот пункт:

- normal player URL больше не показывает `Scene Navigation`, `Level Lab`, `Scene Studio` и `Save Diagnostics`;
- те же production-parity QA tools доступны через явный `?qa=1`;
- Match-3 Campaign остаётся player-facing mode;
- Browser Gate продолжает использовать те же runtime controllers, отдельный QA build не создавался.

Повторно открывать этот пункт только при regression, которая снова выводит internal tooling игроку.

### R0.2 Background semantic closure

После ANM-030B1B7 / PR #201–202 состояние production backgrounds: **`14/24` dedicated production variants и `10` runtime aliases**. Все восемь background families имеют production master. Dedicated art уже закрывает auditorium, smart-textile lab, lost-found warehouse, service yard, abandoned laundry, textile workshop, combat-club hall, old archive и basketball locker; новый basketball asset успешно прошёл iPhone visual QA в обеих E5-сценах.

Оставшиеся aliases по-прежнему **не** являются требованием произвести десять картинок ради счётчика. Но их теперь полезно ранжировать по реальному player impact: общая экспозиция, степень semantic mismatch и сюжетная важность.

| Rank | Variant | Current fallback | Exposure | Оценка |
| ---: | --- | --- | --- | --- |
| **1** | `maintenance-room` | athletics locker | 2 common-route VN scenes, slot 9 | **NEXT** — высокая экспозиция и явно другое помещение |
| **2** | `old-gym-night` | pool locker evening | 2 common-route VN scenes, slot 12 | очень заметный mismatch помещения и ночного тона |
| **3** | `gymnastics-costume` | athletics locker | 2 common-route VN scenes, slot 16 | другой спорт/функция помещения; заметно в общей ветке |
| **4** | `asterion-transfer-point` | Norihiro apartment | slot 11, common route, отдельная post-scene + transition | экстремальный semantic mismatch; Asterion family master уже есть |
| **5** | `campus-path` | clubroom day | slot 15, common route | exterior заменён интерьером — очевидный mismatch |
| **6** | `service-tunnel` | pool locker evening | ending A, slot 20 | экстремальный mismatch, но только одна ending route |
| **7** | `server-room` | Norihiro apartment | ending A, slot 20 | экстремальный mismatch в кульминации, но branch-specific |
| **8** | `disciplinary-assembly` | clubroom day | endings A/C, slots 20–21 | две ending scenes; место близко по school-family, но недостаточно формально |
| **9** | `anonymous-return-counter` | athletics locker | ending B, slot 19 | явный mismatch, но одна branch-specific сцена |
| **10** | `clubroom-night` | clubroom day | common slot 18 | правильная локация; отличается в основном time-of-day/light, поэтому самый безопасный fallback |

Обязательный outcome:

- не создавать новые family masters ради покрытия: anchor-фаза завершена для всех восьми families;
- производство оставшихся фонов можно продолжать в **ChatGPT Work**, используя уже утверждённые UPDS backgrounds как style references; ComfyUI остаётся альтернативой, но больше не является prerequisite;
- сначала закрывать rank 1–5 common-route / visibly-wrong variants, затем ending-specific 6–9; `clubroom-night` делать последним и только если простой controlled lighting variant не даёт достаточного качества;
- для уже существующих families делать controlled sibling variants, которые реально нужны, чтобы сцена не выглядела как другая локация/время суток;
- release gate формулируется как **zero visibly wrong semantic background fallbacks in shipped Story**, а не «19/19 уникальных variant PNG»;
- contract-only unused variants `central-laundry` и `campus-street` не производить до реального использования.

**Следующий рекомендуемый background slice: `maintenance-room`.** После него — `old-gym-night` и `gymnastics-costume`; затем повторно оценить common-route story crawl перед производством ending-only variants.

### R0.3 Guest / witness presentation closure

Шесть story guests (`hinata`, `gen`, `aoi`, `kubo`, `kubo-mother`, `vincent`) сейчас asset-free. Shared renderer при отсутствии art показывает initials placeholder. Для законченной narrative game буквенные placeholders у именованных свидетелей неприемлемы.

Release outcome:

- ни один shipped guest scene не показывает placeholder initials как финальный art;
- предпочтительный bounded solution — уже существующий lean guest package: bust/half-body master + 2 expression variants + medallion;
- если для конкретного гостя product-approved stylized testimony presentation выглядит намеренно и лучше полного bust, это допустимый более дешёвый replacement, но он должен выглядеть как конечный дизайн, а не fallback;
- гостей не повышать до full-stage seven-asset rigs без новой драматической необходимости.

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

Все family masters уже существуют; после B1B7 закрыто `14/24` runtime semantic variants. Дальнейшие variants можно производить в ChatGPT Work небольшими approved waves, сохраняя утверждённые UPDS backgrounds как style references. Не закрывать оставшийся счётчик `10 aliases` ради самого счётчика: приоритет задаёт таблица R0.2 и реальный visual QA.

### R1.4 Extras visual archetypes — conditional

Macro содержит 7 semantic extras roles и budget ≤4 reusable adult archetypes. Делать их только там, где реальная playable scene выглядит незаконченной без extra art. **Не производить семь уникальных персонажей.**

### R1.5 Match-3 special/bonus visual pack — conditional polish

`flash-row`, `flash-column`, `evidence`, `lead`, `insight` уже функциональны через SVG/runtime overlays; audit прямо фиксирует `blockingMatch3ArtGaps = 0`.

Пять production PNG имеют смысл, если финальный board QA показывает, что SVG выглядят слишком prototype-like или плохо читаются рядом с остальным art. Иначе это safe cut.

Historical planning label `ANM-030B0A2 [P1] — ART-BLOCKED` остаётся traceable, но больше не означает release blocker.

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

1. **Background semantic closure — active:** `maintenance-room` → `old-gym-night` → `gymnastics-costume` → `asterion-transfer-point` → `campus-path`; интегрировать небольшими binary-safe waves с iPhone preview. После common-route пятёрки повторно оценить необходимость ending-only variants.
2. **Guest/witness closure — active/parallel:** production presentation для `hinata`, `gen`, `aoi`, `kubo`, `kubo-mother`, `vincent` небольшими reviewable waves.
3. **Ending background cleanup — conditional but likely:** `service-tunnel`, `server-room`, `disciplinary-assembly`, `anonymous-return-counter`; `clubroom-night` последним как самый мягкий mismatch.
4. **ANM-033 Release Candidate Hardening:** full Story/22-level human regression, three endings, RU/BE/EN, asset crawl, PWA/update/offline/save, iOS + Android, public-release packaging/rights, performance/accessibility sanity.
5. Исправить только найденные release defects и собрать RC.
6. Hero inserts, landscape, extra locales, safe motion, song pipeline и DLC остаются после base release, пока данные не изменят приоритет.

## Stop rule

Новая идея **не попадает в R0 только потому, что она когда-то была записана в roadmap**. Для повышения до release blocker нужен хотя бы один из сигналов:

- без неё ломается progression/content comprehension;
- игрок видит очевидный placeholder/wrong asset;
- есть crash/data-loss/offline/update/accessibility-critical defect;
- есть подтверждённый device/localization regression;
- release platform требует capability;
- human playtest показывает повторяемую существенную проблему.

Если такого сигнала нет, задача остаётся R1/R2 либо удаляется.
