# ANM-030B0G — Character Production Closeout

Status: **R1 documentation closeout**. Docs-only alignment after the merged full-cast integration, legacy cleanup, full-cast browser visual gate and compatibility-seam cleanup. No runtime asset, gameplay, story, save, localization, staging or browser behavior changes.

## Цель

Зафиксировать фактическое завершение production migration для девяти full-stage персонажей и убрать из активных документов архитектуру, которая уже удалена из runtime/source tree.

Machine-readable authority remains:

- `src/data/characterProduction.ts` (`upds-character-production-v2`);
- `src/data/characterRigs.ts`;
- `src/data/characterRuntimeOverrides.ts` for browser-local Scene Studio experiments/calibration only;
- `src/content/art/ANM030A.asset-gap-audit.json` as a derived production-gap matrix;
- `docs/art/CHARACTER_USAGE_MANIFEST.json` as the documentation mirror.

## Закрытое состояние full-stage cast

Текущий production contract содержит ровно девять recurring/core characters:

`miku`, `onoe`, `ayuki`, `emi`, `kentaro`, `norihiro`, `mayu`, `rina`, `kurose`.

Для каждого персонажа runtime использует ровно семь canonical assets:

- пять precomposed Pose A expression frames: `neutral`, `smile`, `serious`, `surprised`, `embarrassed`;
- один Pose B;
- один square medallion.

Итого: **9/9 production-ready**, **63/63 canonical runtime assets**, **0 mixed**, **0 planned full-stage**, **0 outstanding full-stage assets**.

Все Pose A/Pose B masters сохраняют общий 1024×1536 canvas, bottom-centre pivot и authored relative height. Все девять current rigs имеют `visualApproval: approved`.

## Что было закрыто последовательностью B0B–B0F

- **ANM-030B0B / PR #186** — full-cast integration в canonical production manifest/runtime;
- **ANM-030B0C / PR #187** — exact archive adoption для Miku/Onoe/Ayuki/Emi и SHA-256 lock всех 63 runtime character assets;
- **ANM-030B0D / PR #188** — удаление live Emi D0–D3 candidate module/assets и redundant historical tests;
- **ANM-030B0E / PR #189** — Mobile WebKit full-cast Scene Studio lineup visual gate для всех девяти production characters;
- **ANM-030B0F / PR #190** — удаление retired full-stage planned/placeholder API и empty built-in/static runtime override seam.

После B0F production expression resolution имеет только два слоя:

`canonical production rig → optional browser-local Scene Studio override`.

Отдельного static transition override, placeholder resolver или candidate runtime resolver больше нет.

## Что намеренно сохранено

### Browser-local Character Override Lab

`src/data/characterRuntimeOverrides.ts` остаётся активным инструментальным слоем для:

- browser-local ZIP asset experiments;
- automatic alpha-bound measurement;
- default и slot-aware Scale/X/Y/eye-line/bottom calibration;
- Scene Studio Composition overrides;
- `upds-browser-local-character-export-v3` snapshot export.

Это removable local experiment layer. Он не меняет canonical production manifest и не является вторым runtime rig registry.

### Guest/witness planned tier

`src/data/guestWitnesses.ts` остаётся отдельным `upds-guest-witness-production-v1` контрактом. Planned guests asset-free и не имеют отношения к удалённому full-stage placeholder lane.

### Historical Emi D0–D3 provenance

ANM-028D0–D3/D3A feature docs и соответствующие prompt/provenance материалы сохраняются как история принятия решений и source-generation evidence. Они **не являются текущими machine-readable runtime sources**. Удалённый `src/data/characterCandidates.ts` не должен быть восстановлен только ради хранения provenance.

## Automated closure

Текущий character safety net включает:

- `CharacterProductionManifest.test.ts` — nine-character manifest, seven-asset package, PNG dimensions, alpha geometry and proportion contract;
- `CharacterArchiveAdoption.test.ts` — per-character и full-package SHA-256 lock 63 canonical assets;
- `ExpressionFrameContract.test.ts` — five precomposed expression frames and no retired face-overlay runtime;
- `CharacterRuntimeOverrides.test.ts` — browser-local override/calibration behavior only;
- Mobile WebKit full-cast lineup gate — exactly nine runtime production actors, loaded images, approved status and deterministic reviewed screenshot digest.

Asset-heavy alpha scanning has a scoped 15-second Vitest budget; global test timeout remains unchanged.

## Remaining ANM-030 art gaps

Character production closure **не означает**, что весь visual production завершён. После B0G machine-readable audit продолжает считать открытыми:

- 19 runtime-used background semantic aliases без dedicated production variants;
- 6 guest packages / 24 guest assets;
- 6 dedicated hero clue close-ups;
- one shared Match-3 production-art gap: 5 special/bonus visuals.

Full-stage cast больше не входит в этот список.

## Следующий production milestone

Наиболее дешёвый осмысленный vertical milestone — закрыть original slots `0–3`. После завершения full-stage cast у этого участка остаётся один dedicated story-art gap: hero clue **`conductive-seam`** для slot 3. Его production integration следует вести отдельным bounded ANM-030B slice, не возвращаясь к character pipeline.

## Closeout rule

После merge B0G:

- не создавать новый full-stage planned/placeholder runtime lane;
- не восстанавливать `characterCandidates.ts` или built-in static runtime overrides;
- pre-production character work хранить в external/offline art workflow, feature provenance или planning audit до готовности полного approved package;
- новые full-stage characters входят в `upds-character-production-v2` только с полным seven-asset production set и lineup approval;
- character-track возобновлять только по новой реальной product/art необходимости, а не ради cleanup уже закрытой миграции.
