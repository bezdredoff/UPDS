# ANM-030B1B5 — Abandoned Laundry Production Background

Status: **R1.1 candidate**.

## Цель

Закрыть последний отсутствующий production master background family `old-building-finale`:
Story slot `15`, сцены `VN_SCENE_31_E15_PRE` и `VN_SCENE_32_E15_POST`, больше не должны
показывать раздевалку бассейна вместо закрытого старого корпуса прачечной, который всё ещё
используется как тайный служебный маршрут.

## Production asset

- runtime path: `./assets/backgrounds/BG_ABANDONED_LAUNDRY.webp`;
- physical path: `public/assets/backgrounds/BG_ABANDONED_LAUNDRY.webp`;
- master canvas: `1080×1920`, portrait WebP;
- environment-only, without characters, baked UI, readable text or localization content;
- visual direction: approved UPDS early-2000s anime VN family, dormant institutional laundry with
  aging machines, exposed pipes, a closed service cabinet and a structurally sound secret route;
- fresh trolley tracks, recent transparent service packaging and silver-thread fragments distinguish
  current use from the dusty closed building;
- composition keeps the machinery, route and cabinet readable in the upper/middle frame while
  leaving the lower dialogue-card region calm.

The user explicitly approved the generated visual candidate before repository integration. Runtime
`production` status records the approved anchor and routing; final candidate-preview composition on
the target phone remains the merge gate.

## Runtime and audit changes

- `backgroundAssets.abandonedLaundry` now resolves to the dedicated production WebP;
- `old-building-finale` becomes an existing production master family;
- `old-archive` and `service-tunnel` intentionally remain unresolved sibling variants until their
  own reference-derived candidates are approved;
- all eight background families now have production masters;
- no controller, screenplay, save, localization, staging-preset or scene-index behavior changes;
- current background totals move from `9/24` production + `15` aliases to `10/24` production + `14`
  aliases;
- zero master families remain missing; remaining background work is controlled semantic variants.

## Acceptance

- production WebP is exactly `1080×1920` and present in the runtime distribution;
- slot 15 keeps its existing `abandonedLaundry` semantic background key and resolves the new path;
- slot 15 keeps `campus-path` as separate unresolved visual work;
- Story macro/audit checks confirm that every declared runtime asset exists;
- active roadmap, release backlog and documentation index reflect the current `10/24` / `14` state
  and completed master-family coverage;
- GitHub Quality gate passes;
- `/preview/` is checked on iPhone in `VN_SCENE_31_E15_PRE` after `VN0697` and in
  `VN_SCENE_32_E15_POST`, especially authored shot `VN0721`, before manual merge.
