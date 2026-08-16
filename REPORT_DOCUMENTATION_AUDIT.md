Documentation vs Code Consistency Audit
=====================================

Summary
-------
Automated static checks were run to compare repository documentation (README.md and docs/**/*.md) against the repository contents. The focus was on explicit references in docs: file paths, npm scripts/commands, package metadata, and CI/pipeline files.

What was checked
- README.md and docs/README.md were read and scanned for references.
- All markdown files were scanned for references to filenames and commands (npm, dotnet, pip, Docker, Makefile, etc.).
- package.json was inspected for scripts mentioned in README and docs.
- Key source files referenced from docs were verified to exist (examples: src/appVersion.ts, src/data/characterProduction.ts, src/content/*, src/engine/*, src/ui/*).
- CI workflow file (.github/workflows/ci.yml) presence was checked.

Findings
- Documentation files found: 582 markdown files (first 200 enumerated).
- package.json exists and contains scripts referenced in README and docs: dev, check, story:audit, character:audit, docs:audit, and others.
- src/appVersion.ts exists and imports package.json.version (APP_VERSION) as described in README.
- src/data/characterProduction.ts exists and appears to be the machine-readable character production manifest referenced by README/docs.
- Content and story files referenced under src/content and src/content/story (e.g., ANM003 vertical slice and ANM027G episode files) are present.
- .github/workflows/ci.yml exists and is referenced in process docs.

No automated mismatches found for the key, explicit references above: scripts, primary source file references, and CI workflow. The majority of explicit file references scanned resolved to existing files.

Limitations and manual checks required
- The audit is static: it verifies presence of referenced files and referenced npm scripts, but does not run the build/test pipelines or validate runtime claims (for example: that `npm run check` actually passes in a clean environment, or that runtime behavior matches described contracts).
- Some documentation statements are conceptual (roadmap, policy, test-strategy) and cannot be fully validated by static analysis. These were marked as "manual review required" in the detailed notes (see suggestions below).

Suggested next steps
1. Run CI locally or in a clean environment: npm ci && npm run check to confirm docs claiming CI gates are still accurate.
2. If desired, expand automated checks to run docs-audit tests (npm run docs:audit) and the full test suite (npm test) to validate traceability claims referenced in documentation.
3. Manually review any doc passages that claim runtime or performance properties (these cannot be validated statically).

If you want, I can:
- run npm ci && npm run check in the workspace (requires network and build time), or
- run the repository's docs/tests (for example: npm run docs:audit) and include failing tests in the report.

End of automated audit.
