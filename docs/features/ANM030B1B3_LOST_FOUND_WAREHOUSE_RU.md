# ANM-030B1B3 — Lost-Found Warehouse Production Background

Status: **R1.1 candidate**.

## Цель

Закрыть production master background family `laundry-service`: Story slot `8`, сцены
`VN_SCENE_17_E8_PRE` и `VN_SCENE_18_E8_POST`, больше не должны показывать спортивную
раздевалку вместо тесного склада университетского бюро находок.

## Production asset

- runtime path: `./assets/backgrounds/BG_LOST_FOUND_WAREHOUSE.webp`;
- physical path: `public/assets/backgrounds/BG_LOST_FOUND_WAREHOUSE.webp`;
- master canvas: `1080×1920`, portrait WebP;
- environment-only, without characters, baked UI, readable text or localization content;
- visual direction: approved UPDS early-2000s anime VN family, warm fluorescent utility lighting,
  dense shelves, numbered-but-unreadable storage tags, recovered clothing and closed evidence boxes;
- composition preserves a readable central aisle and keeps the lower dialogue-card region relatively
  calm while the upper and middle frame carry the location identity.

The user explicitly approved the generated visual candidate before repository integration. Runtime
`production` status records the approved anchor and routing; final candidate-preview composition on
the target phone remains the merge gate.

## Runtime and audit changes

- `backgroundAssets.lostFoundWarehouse` now resolves to the dedicated production WebP;
- `laundry-service` becomes an existing production master family;
- `maintenance-room` and `anonymous-return-counter` intentionally remain unresolved sibling variants
  until their own visual candidates are derived and approved;
- contract-only unused `central-laundry` remains planned and is not produced prematurely;
- no controller, screenplay, save, localization, staging-preset or scene-index behavior changes;
- current background totals move from `7/24` production + `17` aliases to `8/24` production + `16`
  aliases;
- two master families remain missing: `campus-exterior` and `old-building-finale`.

## Acceptance

- production WebP is exactly `1080×1920` and present in the runtime distribution;
- slot 8 keeps its existing semantic background key and resolves the new path;
- Story macro/audit checks confirm that every declared runtime asset exists;
- active roadmap, release backlog and documentation index reflect the current `8/24` / `16` state;
- GitHub Quality gate passes;
- `/preview/` is checked on iPhone in both slot-8 VN scenes with real characters, header, dialogue
  card and controls before manual merge.
