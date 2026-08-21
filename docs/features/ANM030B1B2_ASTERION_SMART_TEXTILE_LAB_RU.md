# ANM-030B1B2 — Asterion Smart-Textile Lab Production Background

Status: **R1.1 candidate**.

## Цель

Закрыть первый отсутствующий production master новой background family `lab-asterion`: Story slot
`7`, сцены `VN_SCENE_15_E7_PRE` и `VN_SCENE_16_E7_POST`, больше не должны показывать квартиру
Норихиро вместо лаборатории smart-textile инфраструктуры Asterion.

## Production asset

- runtime path: `./assets/backgrounds/BG_ASTERION_SMART_TEXTILE_LAB.webp`;
- physical path: `public/assets/backgrounds/BG_ASTERION_SMART_TEXTILE_LAB.webp`;
- master canvas: `1080×1920`, portrait WebP;
- environment-only, without characters, baked UI, readable text or localization content;
- visual direction: approved UPDS early-2000s anime VN family with grounded corporate-university
  technology, cool grey/cyan palette and active smart-textile testing equipment;
- composition keeps a clear central aisle, concentrates evidence-bearing detail in the upper/middle
  frame and leaves the lower dialogue-card region calm.

The user explicitly approved the generated visual candidate before repository integration. Runtime
`production` status records the approved anchor and routing; final candidate-preview composition on
the target phone remains the merge gate.

## Runtime and audit changes

- `backgroundAssets.asterionLab` now resolves to the dedicated production WebP;
- `lab-asterion` becomes an existing production master family;
- `transfer-point` and `server-room` intentionally remain unresolved sibling variants until their
  own visual candidates are derived from this golden master and approved;
- no controller, screenplay, save, localization, staging-preset or scene-index behavior changes;
- current background totals move from `6/24` production + `18` aliases to `7/24` production + `17`
  aliases;
- three master families remain missing: `laundry-service`, `campus-exterior` and
  `old-building-finale`.

## Acceptance

- production WebP is exactly `1080×1920` and present in the runtime distribution;
- slot 7 keeps its existing semantic background key and resolves the new path;
- Story macro/audit checks confirm that every declared runtime asset exists;
- active roadmap, release backlog and documentation index reflect the current `7/24` / `17` state;
- GitHub Quality gate passes;
- `/preview/` is checked on iPhone in both slot-7 VN scenes with real characters, header, dialogue
  card and controls before manual merge.
