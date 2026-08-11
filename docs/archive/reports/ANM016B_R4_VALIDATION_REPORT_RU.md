# ANM-016B R4 — validation report

Build: `0.16.5-anm016b-r4`

Исправляет candidate-dependent height regression ANM-016B R3.

Проверки перед упаковкой:

- strict TypeScript source compile — PASS;
- collapsed viewport safety guard — PASS;
- visible `.dialogue-text` больше не мутируется fit predicate — PASS;
- off-screen auto-height measurement probe — present;
- stable dialogue grid text viewport — present;
- locale-aware measured paginator R3 — preserved;
- resize/orientation/fonts-ready reflow — preserved;
- ANM-016C R2 stage/dialogue seam — preserved;
- protected narrative/gameplay/assets/workflows — byte-exact относительно R3 baseline, кроме заявленного presentation scope;
- clean full Vitest локально недоступен из-за dependency installation timeout; authoritative gate — GitHub importer.
