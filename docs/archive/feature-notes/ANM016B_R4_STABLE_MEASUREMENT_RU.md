# ANM-016B R4 — стабильное render-measured paging

## Инвариант

Visible `.dialogue-text` — только viewport вывода. Он никогда не используется как изменяемый measurement probe.

Runtime делает следующее:

1. После render получает фактические `clientWidth/clientHeight` текстового viewport.
2. Проверяет sanity geometry: достаточная ширина и хотя бы примерно две строки высоты.
3. Создаёт невидимый fixed-position probe с auto-height.
4. Копирует в probe computed font/line-height/letter-spacing/wrapping/hyphenation/padding и `lang`.
5. Paginator вызывает `fits(candidate)` на probe.
6. Probe удаляется после расчёта страниц.
7. При resize/orientation/font-ready страницы пересчитываются.

Если layout ещё нестабилен, measured paginator не запускается: используется deterministic fallback. Это предотвращает деградацию до страниц по 1–2 grapheme.
