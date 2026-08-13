# Project UPDS — «Детективы класса U»

Mobile-first visual novel × Match-3 about an adult college detective club.

## Current status and authority

Do not maintain an independent build number in this README:

- current production status and next work: [`docs/ROADMAP_RU.md`](docs/ROADMAP_RU.md);
- product/build identity: [`src/appVersion.ts`](src/appVersion.ts);
- protected product/runtime contracts: [`docs/architecture/PROJECT_CONTRACTS_RU.md`](docs/architecture/PROJECT_CONTRACTS_RU.md);
- machine-readable character production status: [`src/data/characterProduction.ts`](src/data/characterProduction.ts).

At the current repository baseline, ANM-025 Match-3 production, ANM-026 tooling and the
ANM-027 story import/runtime pipeline are complete for the authored vertical slice. The active
production phase is ANM-028 Character Production Pipeline 2.0; the roadmap remains the
authoritative feature-status source.

## Quick start

```bash
npm install
npm run dev
npm run check
```

Focused contract gates:

```bash
npm run story:audit
npm run character:audit
npm run docs:audit
```

GitHub CI running `npm run check` is the authoritative automated gate.

## Documentation

Start with [`docs/README.md`](docs/README.md). Key entry points:

- current architecture: [`docs/architecture/ARCHITECTURE_RU.md`](docs/architecture/ARCHITECTURE_RU.md);
- immutable contracts: [`docs/architecture/PROJECT_CONTRACTS_RU.md`](docs/architecture/PROJECT_CONTRACTS_RU.md);
- AI/developer workflow: [`docs/process/AI_DEVELOPMENT_RU.md`](docs/process/AI_DEVELOPMENT_RU.md);
- testing: [`docs/process/TESTING_RU.md`](docs/process/TESTING_RU.md);
- GitHub/iPhone delivery lanes: [`docs/process/GITHUB_PHONE_PIPELINE_RU.md`](docs/process/GITHUB_PHONE_PIPELINE_RU.md);
- character production: [`docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md`](docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md).

Feature notes document what a slice changed at that time. Historical releases, superseded notes
and validation snapshots under [`docs/archive/`](docs/archive/) are retained for traceability and
are not current implementation contracts.

## Protected-contract summary

Do not change without explicit product approval:

- canon, stable `VN....` line IDs and `CHOICE_00` A/B/C semantics;
- campaign save key `seiran-detectives-anm009-v1`;
- approved 2000s Hybrid anime direction and adult-character guardrail;
- the current precomposed 1024×1536 expression-frame character contract;
- GitHub stable `/` versus candidate `/preview/` isolation and manual merge gate.

The retired transparent face-overlay composition is not a production runtime contract and must
not be reintroduced.
