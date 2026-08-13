# UPDS — защищённые проектные контракты

Status: active protected contract aligned with ANM-027E and the ANM-028A R2 repository baseline.

Эти правила считаются стабильными до отдельного продуктового решения. Реализация, тест или
удобство production pipeline не могут молча переопределить их.

## Narrative and content

- Repository-authored runtime source сейчас: `src/content/ANM-003_Vertical_Slice_Screenplay.md`.
- Его import manifest: `src/content/story/ANM003.vertical-slice.story.json` (`upds-story-content-v1`).
- Runtime routing source: `src/data/storyGraph.ts` (`upds-story-graph-v1`).
- Audited data flow: `screenplay + manifest + storyGraph → canonicalStoryLines → VN runtime`.
- Стабильные `VN....` IDs не перенумеровываются и не переиспользуются.
- `CHOICE_00` сохраняет A/B/C variants и существующую checkpoint/resume semantics.
- Текущий playable vertical slice: 9 VN scenes, 4 story Match-3 routes и ending `ENDING_CASE_001`.
- Source содержит 262 authored lines; 261 назначена playable graph; `VN0250` остаётся explicit deferred teaser.
- Полный screenplay после текущего vertical slice в репозитории отсутствует. Его нельзя считать
  созданным, локализованным или art-locked до отдельного authored/imported content pass.
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
- one approved Pose B and one square medallion: seven required runtime assets per character;
- common canvas and pivot `(0.5, 1.0)`;
- relative height authored in the master canvas and validated through alpha bounds;
- `staging.scale = 1` is the production default; CSS zoom cannot repair incorrect authored height;
- explicit adult-character guardrail for every production/planned character.

Current production characters: Miku, Onoe, Ayuki, Emi.

Current planned/placeholders: Kentaro, Norihiro, Mayu. Planned characters must not claim fake asset
paths and require side-by-side lineup/proportion approval before promotion to production.

The seven-asset manifest applies only to full-stage characters. A future guest/witness bust package
is a separate presentation/asset class and must not enter `upds-character-production-v2` until its
own schema, renderer and validator exist. Offline face-ROI layers/compositing are allowed as source
material, but runtime still receives only finished precomposed frames.

The retired transparent face-overlay composition is not a runtime contract. `blink` and `speaking`
remain deferred until an ANM-028 replacement/delta approach proves that it preserves the authored
expression without double-face, halo, silhouette or scale defects.

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
- Current complete runtime foundation is RU/EN for the authored vertical slice and Match-3 content.
- Full production locales remain deferred until the full canonical source screenplay exists.
- Internal VN dialogue pages are presentation state and never become authored/save IDs.

## Mobile, viewport and accessibility

- Portrait phone remains the primary product layout.
- Architecture uses `physical screen → safe viewport → game viewport → scene coordinates` and must
  not reintroduce screen-specific safe-area padding inside feature controllers.
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
