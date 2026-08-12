# ANM-024C — Shared Safe-Area Ownership

Статус: candidate.

## Цель

Перевести эффективную safe-area геометрию текущих экранов на единые токены из `src/viewport.css` без изменения существующих отступов и размеров.

## Контракт

Единственная точка чтения физических inset-значений:

- `--safe-area-top`
- `--safe-area-right`
- `--safe-area-bottom`
- `--safe-area-left`

Они читают `env(safe-area-inset-*)` в `viewport.css`.

Menu, shared header, VN controls/overlay/status, level intro, Match-3, result, panels, support/settings и PWA banner получают те же формулы через `var(--safe-area-*)`.

Preview badge также использует общие токены.

## Почему `style.css` пока сохраняет старые `env(...)`

`style.css` сейчас около 52 KB. Для 024C мы намеренно не делаем большой механический rewrite этого файла в одном feature cut.

Поскольку `viewport.css` импортируется после legacy presentation CSS, его правила являются эффективными runtime-значениями. Старые декларации остаются только fallback-слоем.

Физическое удаление legacy `env(...)` — ANM-024D после regression matrix на:

- 320×568;
- 375×667;
- 390×844;
- 393×852;
- 430×932;
- landscape low-height.

## Visual QA

Ожидаемая геометрия 024C — без изменений относительно 024B. Проверить:

1. preview badge остаётся внутри safe area;
2. header не уходит под Dynamic Island/notch;
3. VN controls и Match-3 не конфликтуют с home indicator;
4. panels и PWA banner сохраняют прежние отступы.
