# Documentation vs Code Consistency Audit — 2026-08-16

> Historical snapshot produced with GitHub Copilot on 2026-08-16. This file is audit evidence, not a current source of truth. Current contracts are defined by machine-readable data, tests, `docs/ROADMAP_RU.md`, and the active documentation hierarchy in `docs/README.md`.

## Summary

Automated static checks were run to compare repository documentation (`README.md` and `docs/**/*.md`) against repository contents. The focus was on explicit references in docs: file paths, npm scripts/commands, package metadata, and CI/pipeline files.

## What was checked

- `README.md` and `docs/README.md` were read and scanned for references.
- Markdown files were scanned for references to filenames and commands (`npm`, `dotnet`, `pip`, Docker, Makefile, etc.).
- `package.json` was inspected for scripts mentioned in README and docs.
- Key source files referenced from docs were verified to exist, including `src/appVersion.ts`, `src/data/characterProduction.ts`, `src/content/*`, `src/engine/*`, and `src/ui/*`.
- `.github/workflows/ci.yml` presence was checked.

## Findings at the time of the snapshot

- The scan reported 582 Markdown files, with the first 200 enumerated by the original audit tooling.
- `package.json` existed and contained the scripts referenced in README/docs, including `dev`, `check`, `story:audit`, `character:audit`, and `docs:audit`.
- `src/appVersion.ts` existed and imported `package.json.version` as `APP_VERSION` as described by the project docs.
- `src/data/characterProduction.ts` existed as the machine-readable character production manifest referenced by README/docs.
- Referenced content/story files under `src/content` and `src/content/story` were present.
- `.github/workflows/ci.yml` existed and was referenced in process documentation.
- No automated mismatches were reported for the key explicit references checked by this snapshot.

## Limitations

- This was a static presence/reference audit. It did not itself prove that build/test pipelines passed or that runtime behavior matched prose claims.
- Roadmap, policy, architecture intent, performance claims, and other conceptual statements still require test-backed or manual validation.
- This snapshot does not update itself and may become stale as the repository evolves.

## Current follow-up

The repository now exposes the existing targeted Vitest audit suites through `.github/workflows/audit-dispatch.yml`. Use those executable audits and normal UPDS CI as the authoritative repeatable validation path; keep this file only as historical evidence of the 2026-08-16 Copilot review.
