# ANM-030B1B4 — Campus Service Yard Production Background

Status: **R1.1 candidate**.

## Цель

Закрыть production master background family `campus-exterior`: Story slot `11`, сцена
`VN_SCENE_23_E11_PRE`, больше не должна показывать клубную комнату вместо служебного двора
университетского комплекса, откуда контейнеры уходят в логистическую цепочку Asterion.

## Production asset

- runtime path: `./assets/backgrounds/BG_CAMPUS_SERVICE_YARD.webp`;
- physical path: `public/assets/backgrounds/BG_CAMPUS_SERVICE_YARD.webp`;
- master canvas: `1080×1920`, portrait WebP;
- environment-only, without characters, baked UI, readable text or localization content;
- visual direction: approved UPDS early-2000s anime VN family, grounded university back-of-house
  architecture, laundry carts, sealed textile containers and a restrained cyan logistics accent;
- composition keeps the laundry door, container route and service gate readable in the upper/middle
  frame while leaving the lower dialogue-card region calm.

The user explicitly approved the generated visual candidate before repository integration. Runtime
`production` status records the approved anchor and routing; final candidate-preview composition on
the target phone remains the merge gate.

## Runtime and audit changes

- `backgroundAssets.serviceYard` now resolves to the dedicated production WebP;
- `campus-exterior` becomes an existing production master family;
- `campus-path` intentionally remains an unresolved sibling variant until its own reference-derived
  candidate is approved;
- contract-only unused `campus-street` remains planned and is not produced prematurely;
- no controller, screenplay, save, localization, staging-preset or scene-index behavior changes;
- current background totals move from `8/24` production + `16` aliases to `9/24` production + `15`
  aliases;
- one master family remains missing: `old-building-finale`.

## Acceptance

- production WebP is exactly `1080×1920` and present in the runtime distribution;
- slot 11 keeps its existing `serviceYard` semantic background key and resolves the new path;
- slot 11 keeps `transfer-point` and its Hero Clue as separate unresolved visual work;
- Story macro/audit checks confirm that every declared runtime asset exists;
- active roadmap, release backlog and documentation index reflect the current `9/24` / `15` state;
- GitHub Quality gate passes;
- `/preview/` is checked on iPhone in `VN_SCENE_23_E11_PRE`, especially authored shot `VN0535`,
  with real characters, header, dialogue card and controls before manual merge.
