# ANM-016B R4 — Stable render-measured dialogue viewport

Исправление regression ANM-016B R3, при котором на реальном мобильном layout measured paginator мог показывать по 1–2 символа на страницу.

## Причина

R3 менял `textContent` видимого `.dialogue-text` и одновременно сравнивал `scrollHeight` с `clientHeight` того же flex-item. Его высота зависела от текущего candidate текста, а safety subtraction делал даже одну строку «слишком высокой». Paginator доходил до grapheme fallback.

## Исправление

- `.dialogue` использует стабильную grid-схему `minmax(0, 1fr) + line-id`.
- `.dialogue-text` занимает фиксированный текстовый viewport независимо от candidate.
- Новый `dialogueMeasurement.ts` создаёт невидимый off-screen auto-height probe с той же шириной и computed typography.
- `fits(candidate)` измеряет probe, не мутируя visible viewport.
- Невалидная геометрия (`width < 120`, меньше ~2 строк высоты) не допускается к measured paginator — используется deterministic fallback до следующего reflow.
- Resize/orientation/font-ready reflow из R3 сохранён.
- Locale-aware sentence → word → grapheme segmentation из R3 сохранён.

Ни VN IDs, ни authored text, ни save semantics не меняются.
