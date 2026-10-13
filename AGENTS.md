# UPDS repository instructions

This repository contains the UPDS game: a TypeScript/Vite visual novel and Match-3 PWA.

## Choose the correct checkout

- Do not assume the current directory, clone, branch, IDE or shell is the project checkout. First inspect the current path, `git rev-parse --show-toplevel`, `git status --short --branch` and `git remote -v`.
- Identify the repository by its Git remote (HTTPS or SSH URL for `bezdredoff/UPDS`) and the user's task context. A folder named for UPDS or its art toolkit is not necessarily a Git checkout.
- Continue in the checkout/worktree for the active task or attached PR. For a new isolated task, fetch `origin/main` and use a clean task branch/worktree based on it. Do not start over from `main` when the user is continuing an existing branch or PR.
- There may be several UPDS clones. `C:\git\UPDS` is not categorically off-limits and `C:\git\UPDS-local-ai` is not always the right checkout. Never switch, reset, clean or overwrite a checkout containing user changes. Preserve tracked edits and untracked files; if isolation is needed, make a separate worktree rather than disturbing the user's checkout.
- If the starting directory is not a Git checkout, locate and verify candidate checkouts before editing. Do not treat the first failed path or tool lookup as proof that the project or capability is unavailable.

## Source of truth and product constraints

- GitHub `origin/main` is authoritative for merged code and current release state. Fetch it before reviewing or starting a separate task; a local branch name or dashboard copy does not establish currency.
- Read `README.md` and the relevant sections of `docs/process/AI_DEVELOPMENT_RU.md` and `docs/architecture/PROJECT_CONTRACTS_RU.md`. For release work, also inspect `docs/UPDS_RELEASE_MANIFEST_RU.md`, `docs/release-status.json`, `docs/known-issues.json`, `docs/RELEASE_BACKLOG_RU.md` and `docs/ROADMAP_RU.md`. Read narrowly; archived documents are historical.
- Select the release task ID before editing and update its status/evidence in the same PR. Do not mark semantic work accepted from CI alone; human, visual, content and device acceptance require direct evidence.
- Preserve stable VN IDs, Story 0–21 and its three endings, save keys/schema, RU/BE/EN catalog parity and placeholders, approved art, and production contracts. Keep feature logic out of the composition root.
- Check the exact app version/build and deployment before describing player-facing behavior or directing the user to a screen. Do not ask the user to use Diagnostics, settings, controls or features unless they exist in the specific build they have installed. Distinguish local candidates, open PRs, merged commits and deployed builds.

## Tools and verification

- Use the available native shell and file tools for repository work. Do not use Python subprocesses for project commands. Treat a Git line-ending warning as a warning, not a failed command, when the exit code is successful.
- Do not infer that browsers, network access or a site are unavailable from one failed tool call. Inspect available browser/app surfaces, try an appropriate fallback (including a local preview or direct request when suitable), and report only the specific capability that remains unavailable. For computer use, inspect available surfaces before selecting a browser.
- Use the repository's installed dependencies and scripts: `npm.cmd run check:fast`, `npm.cmd run test -- tests/<RelevantTest>.test.ts`, `npm.cmd run check`, `npm.cmd run build`, and `npm.cmd run version:check` as appropriate. Inspect `package.json` and the current workflow files instead of relying on old script or CI descriptions.
- Do not use `npm exec` to compensate for a missing local executable; it may fetch an unrelated version. Check whether the current checkout has the expected `node_modules` or a safe shared dependency link. Never run `npm ci` against a shared junction. If an isolated worktree lacks dependencies and they cannot safely be reused, rely on the repository's CI and report that local validation was skipped; do not change dependency versions just to make a check run.
- GitHub Quality Gate is authoritative for CI. Browser Gate is separate when configured; inspect actual PR checks and wait for required jobs. Local checks do not prove remote CI passed. For Windows WebKit/visual regressions, do not update Linux golden snapshots from a Windows run; use the configured GitHub Browser Gate.

## Branches, PRs and user data

- Standing user instruction (2026-10-13): after each implementation task, commit and push its focused branch, create a PR, and wait for every configured PR test/check on the latest head SHA. Diagnose failures, fix task-related problems, push corrections, and wait again until all checks pass. Do not stop at a local candidate or PR creation. This instruction authorizes that publication cycle for subsequent UPDS tasks without asking again. Report the PR URL, final head SHA and actual results; if an external blocker prevents completion, state the specific blocker and pending checks. Merging and deployment still require explicit user authorization.
- Inspect the changed-file list and Git status before committing or publishing. Stage explicit task files; never include unrelated user files, generated artifacts or untracked work by default.
- When the user asks to prepare, create or send a PR, that request authorizes commits, pushing the task branch, creating the PR and waiting for its required checks. Do not ask for that authorization again within the same task. Report the URL and actual check results.
- A PR request does not authorize merging or deploying. Do those only when the user explicitly asks.
- Never reset, clean, delete, overwrite or discard user changes. Do not modify dependencies, CI, pipeline scripts, generated art, snapshots or visual approvals unless they are part of the requested task.

Answer in Russian. Finish with changed files, actual checks/results and any remaining limitation. For read-only requests, make no file changes.
