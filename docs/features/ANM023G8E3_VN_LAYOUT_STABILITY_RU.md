# ANM-023G8E3 — VN Browser Layout Stability

## Контекст

После #258 physical shell установленной PWA стал корректным, но ручной QA в обычном Safari снова показал поздний VN rescale. Полный аудит runtime-пути VN выявил, что viewport foundation и VN presentation имели независимые реакции на изменение высоты браузера.

## Найденные источники изменения размера

1. Browser viewport foundation обновляет `--upds-viewport-height` по `visualViewport.height` / `innerHeight` на `resize`.
2. `VnController.bindDialogueReflow()` отдельно реагировал на каждый `window.resize`, через 80 мс очищал paging и вызывал полный `renderVN()`.
3. Тот же controller запускал ещё один полный reflow после `document.fonts.ready`.
4. Внутренние VN размеры использовали `dvh`: dialogue row, controls и status offset.
5. Legacy compact breakpoint `@media (max-height: 650px), (max-width: 340px)` мог включаться только из-за изменения высоты Safari chrome и одновременно менять portrait scale, dialogue typography, header и controls.
6. Portrait высотой в процентах от flex-stage усиливает любое изменение stage height, поэтому небольшой viewport delta визуально выглядит как заметный rescale персонажа.

## Новый контракт

### Обычный мобильный browser / Safari

- VN physical presentation frame использует стабильный `100svh`, а не текущий `visualViewport.height`.
- `.viewport-shell` и `.phone.game-viewport` при активном VN имеют одинаковую стабильную browser height.
- dialogue row / controls / status используют `svh`.
- height-only `window.resize` игнорируется VN controller.
- реальное изменение ширины и `orientationchange` разрешают только measured dialogue reflow **in place**.
- viewport reflow не вызывает `renderVN()` и не пересоздаёт `.phone`, header, stage, portraits или controls.
- `document.fonts.ready` больше не является отдельным VN re-render trigger.
- на portrait шире 340px browser chrome не может случайно включить legacy compact VN composition через `max-height:650px`.

### Installed standalone PWA

ANM-024E остаётся владельцем geometry: standalone использует physical `100vh` и edge-to-edge safe-area policy. Поздний `standaloneEdgeToEdge.css` переопределяет browser VN sizing и поэтому не зависит от `svh`.

### Настоящие layout transitions

- новая StoryLine / scene — обычный `renderVN()`;
- пользователь меняет text size — обычный controlled render;
- dialogue page внутри одной StoryLine — in-place update;
- width/orientation reflow — in-place measured pagination;
- height-only Safari chrome transition — никакого VN reflow.

## Regression coverage

`tests/VnViewportStability.test.ts` закрепляет:

- stable browser `svh` contract;
- запрет height-driven normal portrait rescale;
- width/orientation-only VN reflow;
- отсутствие `renderVN()` и `document.fonts.ready` внутри viewport reflow path.

`e2e/tests/vn-browser-chrome-stability.pw.ts` входит в Mobile WebKit critical suite и имитирует browser chrome transition: root dynamic viewport height намеренно меняется, затем dispatch-ится `resize`. После этого обязаны остаться неизменными DOM identity VN frame и geometry shell/phone/stage/portrait/dialogue/controls.

## Manual QA

После merge проверить Safari и установленную PWA отдельно:

1. открыть VN и зафиксировать визуальный размер персонажа/dialogue/controls;
2. в Safari прокруткой/тапами заставить browser chrome скрыться и вернуться, подождать не менее 30 секунд;
3. VN не должен менять масштаб или пересоздаваться;
4. перейти между несколькими dialogue pages и StoryLines;
5. повторить online и airplane/offline;
6. повернуть portrait → landscape → portrait: настоящий orientation transition может пересчитать paging, но после возврата не должно оставаться stale geometry.
