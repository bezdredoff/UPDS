# ANM-010E — Parallel Delta / Safe Rebase Hardening

Status: **maintenance candidate; requires GitHub Quality gate and manual merge**.

## Problem

`upds-delta-v1` intentionally required `patch-manifest.json.baseSha` to equal the exact current
`main` SHA. This prevented silent rebases, but it also made independent work unnecessarily fragile:
a merge touching unrelated files invalidated every ZIP prepared from the previous `main`.

A second race existed between read-only validation and candidate branch creation. The validator built
and checked a candidate against one `main`, while the later write-capable job checked out `main`
again. If `main` advanced between those jobs, the candidate branch no longer had to be based on the
commit that actually passed validation.

## Delta v2 contract

`upds-delta-v2` keeps `baseSha`, explicit `files` and `delete` lists and all existing path/protected
pipeline restrictions.

When `baseSha == current main`, application is unchanged.

When `baseSha` is stale, the importer may apply the patch to current `main` only when all of the
following hold:

1. `baseSha` exists in repository history;
2. `baseSha` is an ancestor of current `main`;
3. every path in `files[]` and `delete[]` is unchanged between `baseSha` and current `main`.

The touched-path comparison uses Git tree history (`git diff --quiet base current -- <path>`), so it
also catches:

- an existing replacement file changed on `main`;
- a path that was absent at `baseSha` but was created on `main`;
- a delete target changed or removed on `main`;
- file-mode/type changes visible to Git.

Any touched-path difference fails closed with the conflicting paths in the importer log. Unrelated
changes are retained from current `main`, then the delta replacement/deletion is applied in the same
sandbox and the normal full `npm run check` gate runs against that rebased candidate.

## Compatibility

- `upds-delta-v2` is the preferred format for newly generated code/docs/data patches.
- `upds-delta-v1` remains supported and keeps its original exact-SHA behavior. A stale v1 patch still
  fails and must be regenerated.
- `FULL_PROJECT.zip` remains unchanged for binary/art/recovery/whole-project delivery.
- mobile ZIPs still cannot modify `.github/workflows/**`, `scripts/validate-upload-zip.py` or
  `scripts/apply-delta-zip.py`.

Example v2 manifest:

```json
{
  "format": "upds-delta-v2",
  "baseSha": "<main SHA used while authoring>",
  "feature": "ANM-XXX feature name",
  "files": ["src/example.ts", "tests/example.test.ts"],
  "delete": []
}
```

## Validation-base pinning

The read-only job now publishes `validated_main_sha`, taken from the full-history `baseline` checkout.
The write-capable `open-pr` job checks out that exact SHA before replacing the working tree with the
validated source artifact and creating the candidate commit.

Therefore the candidate branch parent is exactly the `main` commit whose sandbox passed
`npm run check`, even if another PR merges before branch creation.

## Parallel PR behavior

Several candidate PRs may coexist.

- If PR A merges and a later ZIP prepared before A touches only unrelated paths, v2 imports cleanly
  on top of the new `main`.
- If both pieces of work touch the same path, the later stale ZIP fails with an explicit safe-rebase
  conflict rather than overwriting the merged change.
- Import workflow runs remain serialized through the existing `mobile-import` concurrency group.
- There is still only one public `/preview/` slot; the latest successful mobile import owns it.

This feature does not auto-merge, auto-approve or silently rewrite already-open PR branches after a
later merge. GitHub PR conflict/review rules and manual merge remain authoritative.

## Regression coverage

`DeltaZipSafeRebase.test.ts` creates real temporary Git repositories and verifies:

1. unrelated main change -> v2 safe rebase PASS;
2. changed replacement path -> FAIL;
3. create collision -> FAIL;
4. changed delete target -> FAIL;
5. stale v1 -> FAIL;
6. non-ancestor v2 base -> FAIL.

`GitHubPipeline.test.ts` additionally locks full-history baseline checkout, `validated_main_sha`
propagation and candidate branch creation from the exact validated commit.

No visual/runtime product surface changes in this maintenance atom, so iPhone visual QA is not a
merge gate.
