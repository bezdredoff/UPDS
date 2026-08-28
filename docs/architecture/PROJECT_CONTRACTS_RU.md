# UPDS — защищённые проектные контракты

Status: active protected contract aligned through completed ANM-027G `0–21`, ANM-029B4 Belarusian production and merged ANM-030B0F character runtime compatibility cleanup.

Эти правила считаются стабильными до отдельного продуктового решения. Реализация, тест или
удобство production pipeline не могут молча переопределить их.

## Narrative and content

- Canonical authored runtime sources сейчас инкрементальны: `src/content/ANM-003_Vertical_Slice_Screenplay.md` плюс последовательные ANM-027G screenplay sources для slots `4–21`.
- Каждый source имеет собственный `upds-story-content-v1` manifest в `src/content/story/`; вместе они покрывают canonical `0–21` runtime scope.
- Runtime routing source: `src/data/storyGraph.ts` (`upds-story-graph-v1`).
- Audited data flow: `screenplay sources + scoped manifests + storyGraph → per-source auditStoryContent → combined canonicalStoryLines → VN runtime`.
- Стабильные `VN....` IDs не перенумеровываются и не переиспользуются; `VN0250` является canonical bridge между ANM-003 и последовательными ANM-027G sources; границы `4–6 → 7–9 → 10–12 → 13–15 → 16–18 → 19–21` продолжаются без повторного использования IDs.
- `CHOICE_00` сохраняет A/B/C variants и checkpoint/resume semantics; новые post-slice gates используют `src/data/storyChoices.ts` и additive `CampaignSave.storyChoices` без смены save schema/key.
- Текущий playable authored scope: все slots `0–21`, 45 VN scenes и 22 story Match-3 routes; common scene 38 ветвится в три terminal ending routes `ENDING_A_FULL_TRUTH`, `ENDING_B_CASE_CLOSED`, `ENDING_C_PERFECT_SUSPECT`.
- Canonical sources содержат **976 authored lines**: 262 в ANM-003 (`VN0001–VN0250`, включая branch suffixes) и по 119 в каждом ANM-027G batch `4–6` … `19–21`, заканчиваясь `VN0964`; explicit deferred lines отсутствуют.
- Ending slots `19–21` authored и production-configured. `final-strategy` A/B/C маршрутизирует к Ending B / Ending A attempt / Ending C; Ending A требует `Evidence ≥ 7`, `Team Trust ≥ 2`, `Source Trust ≥ 2` и при недостатке требований явно завершается Ending B.
- Full-game scope сохраняет 22 planned content slots `0–21`: общую ветку `0–18` и три возможных
  финальных слота `19`/`20`/`21`. Production optimization не может молча удалить слот или финал.
- Canonical production-budget/authoring contract:
  `docs/content/CONTENT_PRODUCTION_STRATEGY_RU.md`. Он сокращает one-off assets через tiers/reuse,
  native evidence UI и общие Match-3 archetypes, а не через сокращение утверждённого сюжета.

Repository planning inputs: `docs/content/ANM-001_Story_Bible.md` v0.2 и
`docs/content/ANM-002_22_Episode_Plot.md` v0.1 от 10 августа 2026. Исторический `UPDS.pptx` от 21 октября 2016
сохраняет beat/level structure, но не переопределяет текущие adult/tone/mystery guardrails.
Отсутствующий документ нельзя реконструировать из памяти и выдавать за canonical repository source.

ANM-027E supersedes production-volume estimates ANM-002 §8 (expression/background/clue counts), но
не его narrative beats, clue chain или ending logic. Точная таблица расхождений находится в
`docs/content/CONTENT_PRODUCTION_STRATEGY_RU.md`.

## Save compatibility

Story campaign:

- key: `seiran-detectives-anm009-v1`;
- `SAVE_SCHEMA_VERSION = 2`;
- `CampaignSave.scene` пока остаётся legacy numeric index, связанный со stable story IDs через adapters;
- manual/recovery saves используют производные ключи и не заменяют основной key.

Player-facing Match-3 campaign использует отдельный key:

`seiran-detectives-match3-campaign-v1`.

Level Lab не имеет права менять Story или Match-3 campaign progression.

## Character art and runtime

Canonical machine-readable source: `src/data/characterProduction.ts`
(`upds-character-production-v2`). Documentation mirror:
`docs/art/CHARACTER_USAGE_MANIFEST.json`.

Production character contract:

- precomposed 1024×1536 expression frames;
- exactly five Pose A frames: `neutral`, `smile`, `serious`, `surprised`, `embarrassed`;
- one runtime-integrated Pose B and one square medallion: seven required runtime assets per character;
- common canvas and pivot `(0.5, 1.0)`;
- relative height authored in the master canvas and validated through alpha bounds;
- per-expression alpha bounds and eye-line landmark authored in master-canvas pixels for exact
  selected-frame guides and focal alignment; neutral fields remain the lineup/proportion baseline;
- `staging.scale = 1` is the production default; CSS zoom cannot repair incorrect authored height;
- explicit adult-character guardrail for every production character.

Current runtime-integrated and visually approved production characters: Miku, Onoe, Ayuki, Emi,
Kentaro, Norihiro, Mayu, Rina and Kurose. Every one uses the strict canonical seven-asset rig;
ANM-030B0B/B0C closes the full-stage art package at 63/63 canonical assets, while B0D/B0F remove the
retired candidate, placeholder and built-in static override runtime seams. B0E adds the Mobile WebKit
full-cast lineup visual gate.

Historical pre-integration Emi D0–D3 candidate files and metadata remain provenance in feature docs,
prompts and Git history only. They are not active machine-readable runtime sources. The retired
`src/data/characterCandidates.ts`, full-stage placeholder resolver and built-in/static transition
override must not be restored merely to preserve historical provenance. `src/data/characterRuntimeOverrides.ts`
continues to own browser-local Composition experiments/calibration without changing the canonical rig.

There is no planned full-stage runtime lane. Future pre-production character work stays outside
`upds-character-production-v2` until the complete seven-asset package exists, passes side-by-side
lineup/proportion approval and is ready for direct production integration. Planning documents or the
derived asset audit may track future needs without inventing fake runtime paths.

The seven-asset manifest applies only to full-stage characters. Episode guests use the separate
`src/data/guestWitnesses.ts` contract (`upds-guest-witness-production-v1`): neutral bust/half-body
master + two character-specific expression variants + neutral medallion, rendered only through
`guest-testimony-card`. Planned guests remain asset-free; production requires all four assets under
`./assets/guests/<id>/`. Guest IDs never enter `upds-character-production-v2`. Offline face-ROI
layers/compositing are allowed as source material, but runtime still receives only finished frames.

The retired transparent face-overlay composition is not a runtime contract. `blink` and `speaking`
remain deferred until an ANM-028 replacement/delta approach proves that it preserves the authored
expression without double-face, halo, silhouette or scale defects.

Reusable scene composition source: `src/data/sceneStaging.ts` (`upds-scene-staging-v1`). It owns
exactly eight normalized-percent presets: `solo-close`, `solo-medium`, `two-shot-conflict`,
`two-shot-alliance`, `trio-central-speaker`, `trio-reaction`, `evidence-cutaway` and
`guest-testimony-card`.

Scene Studio calibration source: `src/data/sceneStudioCalibration.ts`
(`upds-scene-studio-calibration-v1`). It mirrors the ANM-024 portrait viewport matrix, representative
non-zero safe-area insets, runtime `contain-over-fill` background masters and estimated
focal/horizon/footline/actor-zone metadata. Estimated background values never become approved art
without manual visual QA.

- every slot stays inside the shared `4..96%` safe frame; actor safe boxes are non-overlapping
  `face-critical-lane` regions, not full transparent PNG bounds. Intentional shoulder/lower-body
  overlap remains valid behind the dialogue card;
- full-stage `staging.scale` remains canonical character/proportion data; preset `shotScale` is a
  separate camera value derived from the playable `.portrait` baseline and cannot repair an
  incorrect master canvas;
- the preset budget itself creates zero new runtime art, background masters or hero clue close-ups;
- evidence/testimony cards are localized native UI;
- `guest-testimony-card` is owned by ANM-028B3: `upds-guest-witness-production-v1` supplies the
  separate schema/validator and `src/ui/guestWitnessMarkup.ts` supplies the shared renderer; current
  planned guests are asset-free and cannot create fake `upds-character-production-v2` paths;
- ANM-028B2 authored adoption source is `src/data/authoredVnShots.ts` (`upds-authored-vn-shots-v1`).
  It binds stable VN line IDs to background, preset, ordered actor assignments, expressions and optional Pose B.
  R1 is deliberately bounded to a Golden Sample set; unlisted lines retain the existing single-active-speaker
  `resolveVnStaging()` fallback. Authored actor-only shots must use the shared resolver; guest/native presets are
  not smuggled into B2; B3 owns guest/native presentation as a separate runtime path.
- `src/ui/vnFrameMarkup.ts` owns the shared four-row production DOM frame used by playable VN and
  read-only Studio. This sharing is presentation parity, not permission for Studio to own runtime
  behavior or for 028B1 to migrate authored lines.
- scene-mode Studio and playable VN both use `.portrait`; `src/ui/vnPortraitGeometry.ts` preserves
  the accepted `178% / -78%` runtime camera for solo staging. Every duo/trio actor must use
  `background-focal-eye-line`: the displayed expression frame's declared eye landmark is aligned to
  the actual rendered focal eye-line with explicit headroom. `SELECTED FRAME ALPHA` must use that
  same frame's measured alpha bounds; preset `FACE SAFE LANE` remains a distinct composition region.
  A Studio-only full-body renderer, fixed-top multi-actor crop, stale neutral-only expression guide or
  shot scale below `0.68` is a contract regression. Full canvas belongs only to lineup QA.
- automatic checks may measure canvas, alpha bounds, eye landmarks, derived eye-line/headroom,
  bottom pivot, containment and coordinates;
  style, anatomy, adult visual age, palette, lighting and background perspective remain explicit
  manual Golden Sample gates;
- character/background defects must be corrected in approved source masters/calibration. Per-scene
  runtime scale, free-form drag offsets or episode-specific CSS are not accepted repair systems;
- technical `production` status cannot be cited as visual approval; `visualApproval` is explicit,
  and `rebuild-required` assets cannot serve as Golden Samples;
- offline/new-character neutral-master lineup approval precedes completion/import of the remaining
  expression frames and Pose B; `upds-scene-studio-qa-v1` is a read-only handoff report and cannot
  write production contracts.

Visual direction remains the approved adult-college-age 2000s Hybrid anime style: clean contour,
simple forms, almost-flat cel shading and no generic modern glossy-gacha render.

## Match-3

- `src/engine/Match3Game.ts` owns rules, legality, objectives, hints, specials and deterministic results.
- Current story routes use stable level IDs, not array position as narrative identity.
- `src/data/levels.ts` owns production level definitions; Level Lab drafts are validated data, not
  hidden controller conditions.
- Story, Match-3 Campaign and Level Lab use the same rules/controller seams but keep progression
  side effects isolated by mode.
- Tutorial and narrative-reaction behavior is data-driven through stable semantic IDs.
- New objectives, blockers, special combinations or level routes require contract/tests before
  mass content rollout.

## Localization

- Stable IDs/keys, not Russian copy, drive save, routing, telemetry and control flow.
- Canonical production target set is exactly `ru`, `be`, `en`, `zh-CN`, `ja`, `ko`, `pt-BR`; `src/localization/LocalizationProduction.ts` owns readiness metadata.
- RU, BE and EN are production-complete/runtime-selectable. `zh-CN`, `ja`, `ko`, `pt-BR` remain translation-pending and must not appear in the player selector before their full catalog passes production audit.
- A production-ready target catalog must have source-key parity, no empty values and identical named-placeholder signatures; runtime fallback is not evidence of translation completeness.
- `src/localization/LocalizationGlossary.ts` is the terminology/name consistency contract for mass localization; one-off scene translations must not silently rename protected terms.
- CJK segmentation classification is shared localization metadata; actual CJK overflow/typography approval remains a visual/mobile QA gate.
- Internal VN dialogue pages are presentation state and never become authored/save IDs.

## Mobile, viewport and accessibility

- Portrait phone remains the primary product layout.
- Architecture uses `physical screen → safe viewport → game viewport → scene coordinates` and must
  not reintroduce screen-specific safe-area padding inside feature controllers.
- Installed iOS standalone extends the shared shell to the physical bottom with
  `calc(100dvh + var(--safe-area-top))`; normal browser tabs retain `100dvh`.
- A root-background/color bridge is not a valid substitute for physical full-bleed because it
  leaves the interactive player screen shorter than the device canvas.
- Minimum portrait regression viewport: `320×568`.
- Low-height landscape must remain non-broken, while full landscape parity is a later feature.
- Navigation touch target is approximately 44×44 px where applicable.
- Reduced-motion paths must not lose required information or interaction state.

## GitHub delivery

- stable Pages: repository root `/` built from `main`;
- mobile candidate preview: `/preview/` produced by the `incoming` import workflow;
- stable service worker must never intercept `/preview/*`;
- stable and preview caches use separate identities;
- GitHub `Quality gate` is authoritative; local npm is only preflight feedback;
- merge is always manual after changed-file review and relevant QA;
- no ordinary content/code archive may modify workflows or upload validators.

The supported delivery lanes and their exact limits are defined in
`docs/process/GITHUB_PHONE_PIPELINE_RU.md`.

## Change rule

If a feature requires changing any protected rule above:

1. document the product decision explicitly;
2. update the machine-readable contract and its authoritative test;
3. update this document and affected process/architecture docs in the same PR;
4. preserve compatibility or provide an explicit migration;
5. do not merge while active documents disagree.
