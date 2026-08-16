# ANM-029H — Production Planning Reset

Status: COMPLETE — R1 merged via PR #136. Planning-only reset. No gameplay, story, localization catalog, balance, save-schema or visual-art behavior changes.

## Почему reset нужен сейчас

Belarusian production завершён через ANM-029B4 R1.1 / PR #135: `be` имеет exact `3870/3870` base-key parity, `132/132` Match-3 reactions, zero runtime fallback и входит в `supportedLocales = ['ru', 'be', 'en']`. Остальные зарегистрированные production locales (`zh-CN`, `ja`, `ko`, `pt-BR`) не стартуют автоматически.

Одновременно repository уже содержит достаточно систем, контента и production tooling, чтобы следующий крупный рост стоимости разработки пришёл не от отсутствующих фич, а от сложности сопровождения. Поэтому перед массовым ANM-030 art/content rollout вводится короткий technical simplification track.

## Решение по очереди production

Новый immediate production order:

1. **ANM-029H — Production Planning Reset** — закрыть stale lifecycle/status assumptions и зафиксировать следующий технический трек.
2. **ANM-023F1 — Biome Expansion & Repository Hygiene [P0]**.
3. **ANM-023F2 — Test Suite Simplification [P0]**.
4. **ANM-023F3 — Runtime / Controller Simplification [P0/P1]**.
5. **ANM-023F4 — Performance & Payload Pass [P1]**.
6. **ANM-030A — Full Game Asset Gap Audit [P0]**.
7. **ANM-030B+ — budgeted production art/content integration**.
8. Landscape, music and release hardening remain later roadmap tracks.

ANM-030A may be prepared in parallel because it is predominantly data/docs analysis, but high-volume runtime asset integration should wait until at least F1/F2 and the first bounded F3 cuts are stable.

## ANM-023F baseline

The reset records the current repository shape so later refactors are measured against a real baseline rather than aesthetics:

- `110` Vitest files under `tests/`;
- Biome currently uses `preset: none`; production lint enables unused import/variable/parameter checks plus debugger/duplicate-object-key checks, while tests receive only the focused-test guard in the npm script;
- `format:check` exists but is not part of `npm run check`;
- current large runtime/controller hotspots include approximately:
  - `src/features/match3/Match3Controller.ts` — 52.6 KB;
  - `src/engine/Match3Game.ts` — 42.2 KB;
  - `src/features/sceneStudio/SceneStudioController.ts` — 41.4 KB;
  - `src/features/vn/VnController.ts` — 30.6 KB;
  - `src/features/levelLab/LevelLabController.ts` — 24.0 KB;
- locale source payload is also material: RU ≈344.8 KB, BE ≈343.9 KB, EN ≈251.1 KB plus ≈58.2 KB reactions before bundling/minification.

These are prioritization signals, not size limits. A file is split only when the cut reduces coupling, reading scope or test cost.

## F1 — Biome Expansion & Repository Hygiene

Goal: make Biome a high-signal automated quality gate instead of a formatter plus a few isolated rules.

Rules:

- do **not** blindly enable every Biome rule or a broad preset and then suppress hundreds of diagnostics;
- first capture diagnostics, then enable high-value correctness/suspicious/complexity/performance rules that fit this codebase;
- use safe auto-fixes and import organization where deterministic;
- apply meaningful linting to tests as well as `src`;
- integrate formatting verification into the authoritative CI gate if the resulting diff/noise is acceptable;
- use overrides for generated/data-heavy catalogs or test patterns only when a rule is demonstrably low-value there;
- remove repository debris such as tracked `__pycache__` and prevent recurrence through ignore/hygiene rules.

Success means more real defects are caught automatically with low suppression/noise.

## F2 — Test Suite Simplification

Goal: preserve or improve contract coverage while reducing repeated setup, duplicated assertions and lifecycle-wording brittleness.

Priorities:

- inventory what unique contract each test protects before deleting or merging it;
- consolidate repeated localization coverage/placeholder/runtime-readiness checks into parameterized/shared helpers where practical;
- keep bounded tests only where they protect a genuinely unique story boundary, payload, choice or regression;
- prefer durable product invariants over exact historical roadmap prose;
- centralize common test setup/utilities;
- do not optimize for minimum test-file count.

The target is **less test code and lower maintenance cost without weaker behavioral protection**.

## F3 — Runtime / Controller Simplification

Goal: reduce the amount of code an AI or developer must read and modify for one feature.

Default ownership rule:

`controller orchestrates → pure/domain modules calculate → renderer renders → store persists`.

Start from measured hotspots, especially Match-3, VN, Scene Studio and Level Lab. Each extraction is a bounded behavior-preserving cut with existing CI coverage; no architecture rewrite or framework migration is implied. `AnimeDetectiveApp.ts` is already a small composition root and is not the primary target.

## F4 — Performance & Payload Pass

Goal: optimize only after measurement.

Measure at minimum:

- initial JS/CSS bundle sizes;
- startup/load path on mobile PWA;
- locale payload contribution and whether lazy locale loading gives a material benefit;
- preload image set and memory/load behavior across repeated VN/Match-3 transitions.

Potential lazy locale loading is a hypothesis, not an approved implementation until bundle data supports it.

## Guardrails

- GitHub CI remains the authoritative automated gate.
- Mobile ZIP → candidate PR → preview → manual iPhone QA remains the default lane for runtime/visual changes.
- Small docs/tests/non-visual technical changes may use the documented direct connector PR lane.
- F1/F2 should not intentionally change runtime behavior.
- F3/F4 changes that can affect runtime require mobile regression QA.
- Do not reduce the approved 22-slot story scope or production art scope to make refactoring easier.

## Exit condition for H

H is complete when authoritative roadmap/architecture/index documentation agree that:

- Belarusian production is complete;
- additional locales are paused;
- ANM-023F1 is the next implementation step;
- ANM-030 begins with asset-gap audit and high-volume integration follows the simplification track;
- stale candidate language from B4 and old ANM-027G QA is no longer presented as current state.
