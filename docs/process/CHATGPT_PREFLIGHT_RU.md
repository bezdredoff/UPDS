# ChatGPT preflight before mobile ZIP

Status: optional technical staging contract.

`preflight/chatgpt` runs the normal read-only GitHub Quality gate before a mobile candidate is
packaged. It catches technical errors early; it is not the production delivery branch.

## Flow

`exact main → preflight/chatgpt + intended diff → Quality gate → matching PATCH/FULL_PROJECT ZIP → incoming → candidate PR + /preview/ → independent PR CI → relevant iPhone QA → manual merge`

## Branch rules

- Reset/sync `preflight/chatgpt` to exact current `main` before every task.
- Do not stack a new task over an old preflight commit.
- Preflight must contain the same feature diff that will be packaged.
- A stale/different baseline invalidates the preflight result.
- Never merge `preflight/chatgpt` as the delivery branch.
- A green preflight does not replace importer validation, candidate PR CI, preview or manual merge.

`.github/workflows/ci.yml` runs the normal `npm run check` Quality gate for pushes to
`preflight/**`.

## When preflight is not required

A narrow docs/tests/non-visual maintenance change may use the documented direct connector
branch/draft-PR lane. That lane still requires GitHub Quality gate, changed-file review and manual
merge, but current workflows do not create `/preview/` for it.

Any visual/runtime, mobile-layout, PWA or asset change must use the mobile ZIP candidate path and its
preview regardless of whether preflight was green.

## Infrastructure

Workflow/importer/validator changes are separate maintenance PRs. An ordinary preflight or mobile
archive must not modify protected pipeline files.
