# ANM-030B1B1 — Student Council Auditorium Production Background

Status: **R1.1 candidate**.

## Цель

Закрыть первый заметно неверный background fallback раннего маршрута: Story slot `4`, сцены
`VN_SCENE_09_E4_PRE` и `VN_SCENE_10_E4_POST`, больше не должны показывать маленькую комнату
детективного клуба вместо официальной аудитории студсовета.

## Production asset

- runtime path: `./assets/backgrounds/BG_STUDENT_COUNCIL_AUDITORIUM_DAY.webp`;
- physical path: `public/assets/backgrounds/BG_STUDENT_COUNCIL_AUDITORIUM_DAY.webp`;
- master canvas: `1080×1920`, portrait WebP;
- environment-only, without characters, baked UI, readable text or localization content;
- visual direction: approved UPDS early-2000s anime VN family, using `BG_CLUBROOM_DAY.webp` only as
  the style/quality reference rather than as the room layout;
- composition keeps the lower dialogue-card region simple and preserves left/center/right actor
  lanes for the existing reusable staging presets.

The user explicitly approved the generated visual candidate before repository integration. Runtime
`production` status records the approved asset and routing; final candidate-preview composition on
the target phone remains the merge gate.

## Runtime and audit changes

- `backgroundAssets.studentCouncilAuditorium` now resolves to the dedicated production WebP;
- no controller, screenplay, save, localization, staging-preset or scene-index behavior changes;
- `upds-asset-gap-audit-v1` records the family and slot-4 entries as `production`;
- current background totals move from `5/24` production + `19` aliases to `6/24` production + `18`
  aliases;
- `basketballLocker` and `textileWorkshop` intentionally remain semantic fallbacks until their own
  approved production slices.

## Acceptance

- production WebP is exactly `1080×1920` and present in the runtime distribution;
- slots/scenes keep their existing semantic background key and resolve the new path;
- Story macro/audit checks confirm that every declared runtime asset exists;
- active roadmap, release backlog and documentation index reflect the current `6/24` / `18` state;
- GitHub Quality gate passes;
- `/preview/` is checked on iPhone in both slot-4 VN scenes with real characters, header, dialogue
  card and controls before manual merge.

