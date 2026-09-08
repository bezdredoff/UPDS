# UPDS — Context for Bionic Agent

## 1. Project Overview
UPDS is a mobile-first visual novel × Match-3 game. 
- **Core Loop**: Story-driven narrative (VN) with integrated Match-3 gameplay.
- **Target Platform**: Mobile-first (Portrait-first, PWA/Web).
- **Status**: Production-ready for RU/BE/EN locales, 0–21 story, and 9 core characters.

## 2. Workspace & Architecture
- **Root**: выбранная папка текущего UPDS Code Project
- **Composition Root**: `src/ui/AnimeDetectiveApp.ts` (Wires feature controllers, navigation, and sessions).
- **Feature Ownership**:
    - **VN**: `src/features/vn/` (Progression, paging, staging).
    - **Match-3**: `src/features/match3/` (Presentation, session) and `src/engine/` (Rules/Lifecycle).
    - **Level Lab**: `src/features/levelLab/`.
    - **Scene Studio**: `src/features/sceneStudio/` (QA/Calibration).
    - **Data/Story**: `src/data/` (Story Graph, Manifests, Level definitions, Scene staging).
- **UI/Platform**: `src/ui/` (Shared components like VN frame, portrait geometry) and `src/platform/` (Runtime assets/PWA).

## 3. Coding & Production Rules
- **Contract Stability**: Never change stable `VN....` IDs, save schema keys (`seiran-detectives-anm009-v1`), or story/Match-3 routing.
- **Functional Separation**: Controllers orchestrate → pure/domain modules calculate → renderer renders → store persists.
- **No Sibling Imports**: Feature controllers must not instantiate each other; use navigation or composition root callbacks.
- **Production Budget**: No one-off assets; reuse established character/background families and Match-3 archetypes.
- **Rules of Authority**:
  - `src/data/storyGraph.ts`: Stable story IDs and transitions.
  - `src/data/levels.ts`: Production level definitions.
  - `src/data/characterProduction.ts`: Canonical character manifest.
- **Read-Only Artifacts**: Never treat `docs/archive/` or historical notes as current requirements.

## 4. Development Workflow
- **Checks**: `npm run check` (Lint, Typecheck, Vitest).
- **Audit Gates**: `npm run story:audit`, `character:audit`, `docs:audit`.
- **Local CI**: `pwsh -File scripts/bionic-local-ci.ps1` for local gate checks.
- **Branching**: Для каждой задачи создавай отдельную ветку от актуального origin/main с task-префиксом, например bionic/<task> или local-ai/<task>.
- **PRs**: Create Draft PRs; never merge manually to `main`.

## 5. Domain Documentation
- **Match-3**: `src/engine/`, `src/features/match3/`, `docs/RELEASE_BACKLOG_RU.md`.
- **VN / Story**: `src/features/vn/`, `src/data/storyGraph.ts`, `docs/content/CONTENT_PRODUCTION_STRATEGY_RU.md`.
- **Localization**: `src/localization/`, `docs/architecture/PROJECT_CONTRACTS_RU.md`.
- **Assets**: `src/data/characterProduction.ts`, `src/data/sceneStaging.ts`, `docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md`.

## 6. Constraints & Priorities
- **Release Target**: Portrait-first, RU/BE/EN, 0–21 story, 9 characters.
- **Production Status**: Only features in `ROADMAP_RU.md` as "COMPLETE" or "R0" are production-ready.
- **No New Slots**: Do not invent story/content slots beyond the canonical 0–21.
- **Rule of Least Change**: Use stable contracts; avoid redundant logic.
- **Visual Identity**: Maintain established adult-college-age Hybrid anime style (clean contours, cel shading).

## 7. Windows & WebKit Limitations
- **Local Checks**: `npm run check` и локальный Chromium E2E можно использовать как локальные проверки.
- **WebKit vs Browser Gate**: Локальный Playwright WebKit на Windows не является эквивалентом GitHub Browser Gate.
- **Snapshot Constraints**: WebKit golden snapshots в репозитории рассчитаны на Linux CI; нельзя создавать или коммитить новые `*-win32.png`.
- **Authority**: Для WebKit и visual regression окончательным источником считается GitHub Browser Gate.
- **Failure Handling**: При локальном падении WebKit на Windows сначала проверить test-results и не обновлять snapshots автоматически.
