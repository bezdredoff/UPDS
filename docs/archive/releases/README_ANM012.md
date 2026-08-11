# ANM-012 · Mobile UX Foundation

Build: `0.12.0-anm012`.

Цель — сделать текущий ANM-011 vertical slice устойчивым для реального iPhone playtest до дальнейшего VN/Match-3 polish.

Ключевые изменения: responsive minimum viewport `320×568`, safe-area/compact layouts, board swipe через Pointer Events, scroll containment, tap compatibility, swap input lock, landscape recovery и regression tests.

Полный контракт и ручной QA: `docs/ANM012_MOBILE_UX_RU.md`.

Проверка:

```bash
npm ci
npm run check
```
