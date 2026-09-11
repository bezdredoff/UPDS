# G2a-ARCH-005B — retirement root-canvas camouflage

Status: **accepted via PR #293**.

## Проблема

Исторический iOS PWA workaround пытался скрыть предполагаемый compositor gap не исправлением geometry, а подбором цвета root canvas под текущий экран. Для этого `style.css` содержал `--upds-system-canvas-color` и набор standalone `:root:has(...)` mappings для Menu, VN, Choice, Match-3, Result, Panels и Campaign. Поздний `standaloneEdgeToEdge.css` затем принудительно возвращал root/body к фиксированному тёмному цвету, чтобы реальная полоса снова была заметна.

В итоге существовала связка «workaround + anti-workaround»: код поддерживал screen-specific camouflage, который более поздний слой специально нейтрализовал.

## Новый контракт

- `:root` имеет один фиксированный baseline canvas `#171a2f`.
- `body` сохраняет обычный desktop/browser radial background и не получает отдельного standalone canvas override.
- `--upds-system-canvas-color` удалён из production CSS.
- standalone screen-specific `:root:has(...)` mappings удалены.
- `standaloneEdgeToEdge.css` больше не содержит compatibility containment для старого bridge.
- Player surface обязан закрывать физический viewport через `ViewportRuntime + viewport.css`; цвет root не является способом ремонта geometry.
- Feature safe-area presentation остаётся в `standaloneEdgeToEdge.css`: VN controls, Match-3 bottom inset/tooltray/help/landscape presentation не меняются.

## Regression contract

`tests/StandaloneEdgeToEdge.test.ts` запрещает повторное появление:

- `--upds-system-canvas-color` в `style.css`;
- standalone screen-specific `:root:has(...)` mappings;
- compatibility root/body containment в `standaloneEdgeToEdge.css`.

При этом тест продолжает проверять accepted physical-height ownership и feature safe-area rules.

## Scope guard

Этот slice не меняет:

- `ViewportRuntime` geometry/event formulas;
- safe-area token discovery;
- VN dialogue/control sizing;
- Match-3 gameplay, balance или board geometry;
- story/save schema;
- Golden Samples.

После ARCH-005B историческое diagnostic observation в `ViewportDebug` ещё существовало отдельно; его объединение с общим viewport evidence collector впоследствии принято в ARCH-008 / PR #296.

## Real-device status

KI-001/KI-003 не закрываются этим refactor. Они остаются открыты до отдельной проверки установленной PWA на реальном iPhone online/offline. Если физическая полоса появляется снова, теперь она не должна быть замаскирована цветом текущего screen — это и есть желаемая диагностическая семантика.
