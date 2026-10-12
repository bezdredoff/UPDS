# UPDS local development

This is the UPDS game repository (TypeScript, Vite, Vitest), not ComfyUI and not an AI application to build.

Work in this checkout: `C:\git\UPDS-local-ai`. The sibling checkout `C:\git\UPDS` contains other work; do not modify it. Do not require a particular local branch name. For a new task, use a clean task branch based on current `origin/main`; continue an existing branch only when the user asks to continue that work. Before switching branches, inspect status and preserve unrelated edits and untracked files. Never reset, clean, overwrite, or stash untracked user files without preserving them.

At the start of a task inspect Git status. Read `README.md`, then the relevant sections of `docs/process/AI_DEVELOPMENT_RU.md` and `docs/architecture/PROJECT_CONTRACTS_RU.md`. Current priorities are in `docs/RELEASE_BACKLOG_RU.md` and `docs/ROADMAP_RU.md`. Read narrowly; archived documents are historical.

For release work, also read `docs/UPDS_RELEASE_MANIFEST_RU.md`, `docs/release-status.json` and `docs/known-issues.json`. Choose the task ID before editing and update its status/evidence in the same PR or ZIP candidate. Do not mark a task `accepted` from CI alone; semantic acceptance needs explicit evidence. ChatGPT includes the update in the ZIP sent through `incoming`; Codex includes it in the direct branch/PR.

Use your actual file-search/read/edit tools. Never claim to have read, changed, or tested something without a successful tool result. If a tool fails, report the exact limitation. Do not propose installing Ollama, models, packages or another agent as a substitute for using this repository.

This is a Windows checkout. Use the available native shell/command tool for Git, npm, and project scripts; use file tools for source edits. Do not use Python subprocess/os.system for project commands. A Git warning about `/tmp` or line-ending conversion is not a failed command when its exit code is 0.

The assistant runs outside the game. Do not add an LLM/API client, model dependencies, or retrieval infrastructure to UPDS unless the user explicitly asks for an in-game AI feature. Report pre-existing untracked files as pre-existing, not as files you created. Do not mark a check successful when the underlying tool returned an error.

Implement one bounded user task at a time. Preserve unrelated edits, stable VN IDs, Story 0–21, the three endings, save keys/schema, RU/BE/EN locale keys/placeholders, approved art and production contracts. Keep feature logic out of the composition root. Follow existing project conventions.

Checks from this folder:
- `npm.cmd run check:fast` — lint and TypeScript.
- `npm.cmd exec -- vitest run tests/<RelevantTest>.test.ts` — focused tests.
- `npm.cmd run build` — production build when appropriate.
- For the local CI-equivalent gate, run `pwsh -File scripts/bionic-local-ci.ps1` through Bionic's native Git Bash/PowerShell shell; it uses the existing dependency tree and runs `npm.cmd run check`. Pass `-InstallDependencies` only when the dependency tree is intentionally isolated from the shared junction. Then run the relevant E2E command if its dependencies are already present. Wait for each command and report its exit code and complete relevant output. Do not use the Python/WASM sandbox for commands that spawn processes.
- When the user asks to prepare, create, or send a PR, that request authorizes pushing the task branch, creating the PR, and running the required GitHub checks for that PR. Do not ask for the same authorization again later in the same task. Review the changed-file list, confirm `git status --short --branch`, run `git diff --check`, publish the branch, create the PR, and wait for its required CI checks. Report the PR URL, final check state, and any failed step. Never claim CI passed from a local check.
- A PR request does not authorize merging or deploying; do those only when the user explicitly asks. If the user has not asked to publish a PR, keep the work reviewable locally and do not push or create one.
- Use repository scripts when they match the current workflow; do not require a legacy Bionic GitHub CI script or manually dispatched Browser Gate unless the current project workflow calls for it. GitHub Actions cannot run for an unpushed local branch. Inspect the current workflow files and PR checks instead of relying on historical trigger descriptions.

Installed dependencies are shared through a node_modules junction. Do not install, upgrade, delete, or edit dependencies. Do not modify CI, pipeline scripts, generated art, snapshots or visual approvals for a routine task. Do not commit, push, merge, deploy, reset, clean or discard changes unless the user asks for that action. When publishing is requested, commits/push/PR creation and the checks needed to prepare the PR are part of that authorization; merging and deployment remain separate actions.

## Windows & WebKit Limitations
- `npm run check` и локальный Chromium E2E можно использовать как локальные проверки.
- Локальный Playwright WebKit на Windows не является эквивалентом GitHub Browser Gate.
- WebKit golden snapshots в репозитории рассчитаны на Linux CI; нельзя создавать или коммитить новые `*-win32.png`.
- Для WebKit и visual regression окончательным источником считается GitHub Browser Gate.
- При локальном падении WebKit на Windows сначала проверить test-results и не обновлять snapshots автоматически.

Answer in Russian. Finish with the changed files, actual checks/results, and any remaining limitation. For read-only requests, make no file changes.
