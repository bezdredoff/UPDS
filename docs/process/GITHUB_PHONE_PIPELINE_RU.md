# UPDS — GitHub / iPhone delivery pipeline

Status: active ANM-010 + ANM-022H1 delivery contract.

## Цель

Обычная итерация не требует компьютера и никогда не пишет прямо в `main`:

`candidate source → validation → PR → GitHub Quality gate → relevant QA → manual merge → stable Pages`.

GitHub CI — authoritative automated gate. Локальный npm или preflight полезен, но не является
production acceptance.

## Stable and preview Pages

- `/` — stable build текущего `main`;
- `/preview/` — единственный mobile-import candidate preview slot.

Stable service worker не перехватывает `/preview/*`; stable/preview используют разные build/cache
identities. После merge `pages.yml` публикует новый чистый `main`.

## Supported delivery lanes

| Lane | Use | Preview | Merge |
|---|---|---|---|
| `PATCH.zip` / `upds-delta-v1` | preferred code/docs/data delta from an exact `main` SHA | `/preview/` | manual |
| `FULL_PROJECT.zip` | binary/art payloads, recovery or complete replacement | `/preview/` | manual |
| direct connector branch/PR | narrow docs/tests/non-visual technical maintenance | no importer preview | manual |
| `preflight/chatgpt` | optional technical CI before packaging | none | never merge as delivery |

Visual/runtime and art changes use a mobile ZIP lane so the iPhone preview remains part of
acceptance. Direct connector PR is not a shortcut around visual QA.

## Lane A — Delta PATCH.zip

Preferred for ordinary source, data, tests and documentation changes.

Manifest format: `upds-delta-v1`.

Required properties:

- exact `baseSha` of current `main`;
- explicit changed/deleted paths;
- no path traversal, symlinks, `.git`, `node_modules` or `dist`;
- no protected pipeline files;
- deterministic application over the exact baseline.

A stale `baseSha` must fail. The importer does not auto-rebase or guess how to merge an old patch.
Regenerate the patch from the new `main` instead.

### Short archive names

The filename is an upload handle, not a prose feature description. Use:

- delta: `ANM-<feature>_R<revision>.zip`, for example `ANM-028B1_R4.1.zip` (decimal revisions are allowed);
- full-project fallback: `ANM-<feature>_R<revision>_FULL.zip`.

Do not repeat `UPDS`, the long feature title or `_PATCH` in the filename. Archive mode is detected
from contents; the complete title remains in `patch-manifest.json` and the generated PR. After a
failed/cached upload increment the revision and use a new short filename.

## Lane B — FULL_PROJECT.zip

Use when delta is impractical:

- production PNG/audio/binary payloads;
- large art integration;
- recovery from uncertain local state;
- deliberate whole-project replacement.

Archive rules:

- `package.json` at archive root;
- no `.git`, `node_modules`, `dist`, symlinks or traversal;
- protected workflow/validator files byte-identical to current `main`;
- use a new filename/revision after a failed or cached upload.

## Mobile upload/import flow

1. Resolve current `main` and build the appropriate ZIP.
2. In branch `incoming`, upload exactly one ZIP under `incoming/`.
3. `Import mobile ZIP candidate` performs a write-separated read-only validation:
   - validates archive safety/mode;
   - checks exact delta baseline when applicable;
   - applies the candidate in a sandbox;
   - runs `npm ci --ignore-scripts` and `npm run check`;
   - validates current `main` independently;
   - rejects protected pipeline modification.
4. Only after validation, the write-capable job:
   - creates/reuses a deterministic `candidate/*` branch;
   - creates/reuses a PR into `main`;
   - publishes stable `main` plus candidate `/preview/`;
   - posts the preview link;
   - resets `incoming` to a clean `[skip ci]` commit based on `main`.
5. Approve the independent PR workflow when GitHub requests it.
6. Wait for green **Quality gate**.
7. Review Files changed and verify protected contracts.
8. Run relevant iPhone QA on `/preview/`.
9. Merge manually.
10. Confirm the stable root after `pages.yml`.

No workflow in this path may auto-approve or auto-merge the candidate.

## Rejected and stale uploads

On validation failure:

- the import run remains failed/red;
- the rejected ZIP is removed from reachable `incoming` history;
- cleanup uses `[skip ci]` and must not trigger a noisy second zero-ZIP run;
- no candidate branch/PR is created from an unvalidated tree.

Use a new archive revision after fixing the source.

## Lane C — Direct connector branch/PR

Allowed only for a small, auditable docs/tests/non-visual technical change when connector routing is
stable.

Required flow:

1. read exact current `main` and confirm no competing PR;
2. create a new task-specific branch from that SHA;
3. create an intentional commit containing only the agreed scope;
4. open a draft PR into `main`;
5. run/approve GitHub Quality gate;
6. review changed files;
7. merge manually.

Current workflows do not publish `/preview/` for a plain direct PR. If the change needs visual,
runtime, PWA, mobile-layout or asset QA, stop and use a ZIP lane.

Direct connector work must not repurpose the reusable `preflight/chatgpt` branch and must not update
`main` directly.

## Optional ChatGPT preflight

`preflight/chatgpt` may run the normal read-only Quality gate before packaging a mobile ZIP.

Rules:

- reset/sync it to exact current `main` before each task;
- push only the intended feature diff;
- package the same diff only after green preflight;
- never treat the branch as a long-lived integration branch;
- never merge it as the production delivery;
- importer candidate PR, preview and independent PR CI remain the acceptance route.

See `CHATGPT_PREFLIGHT_RU.md`.

## One-time repository settings

- Pages source: GitHub Actions.
- `main` protected: PR required, **Quality gate** required, force-push/deletion blocked.
- Actions may create PRs but not auto-approve/merge.
- `incoming` remains resettable by the importer/pages workflows.
- `github-pages` environment allows only the workflow’s intended `main`/`incoming` sources.

## Rerun/recovery

`Import mobile ZIP candidate` supports `workflow_dispatch` for a ZIP already present at a selected
branch/commit. Candidate branch reuse is allowed only when its tree exactly matches the newly
validated tree. A closed/merged PR with the same head is not silently recreated.

`pages.yml` recovery dispatch remains `main`-only.

## Limits

- GitHub browser upload/validator ZIP limit: 25 MiB.
- Only one public `/preview/` slot exists at a time.
- Candidate preview is not permanent evidence; PR/commit/tests and explicit QA notes provide
  traceability.
- Art archives may require FULL_PROJECT even when code-only work normally uses delta.
- Infrastructure changes remain separate maintenance PRs.
