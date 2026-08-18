# ANM-023G8E2 — iOS VN Viewport Stability

## Проблема

На мобильном Chromium/WebKit при переходе между страницами одного длинного VN-диалога интерфейс иногда визуально увеличивался и смещался. На ручном QA особенно воспроизводились белорусские `VN0156` и `VN0160`: страница `1/2` выглядела нормально, а переход на `2/2` мог увести header/footer за границы viewport.

Preview badge не является layout-участником: причина находится в VN paging/runtime path.

## Причина и исправление

До G8E2 переход на следующую страницу того же StoryLine увеличивал `dialoguePageIndex`, а затем вызывал полный `renderVN()`. Это полностью пересоздавало `.viewport-shell`, `.phone` и VN frame, хотя story line, stage, background и controls не менялись. В мобильном браузере такой rebuild совпадал с повторной browser text-sizing/layout оценкой.

G8E2 меняет этот boundary:

- отдельный `vnViewportStability.css` фиксирует browser text inflation на `html` через `-webkit-text-size-adjust: 100%` и `text-size-adjust: 100%`;
- pinch zoom пользователя не запрещается: viewport meta не получает `user-scalable=no` или `maximum-scale=1`;
- переход между страницами одного line обновляет только `.dialogue-text`, `.line-id` и `.dialogue-progress`;
- VN frame, header, stage, controls и `.phone` сохраняют DOM identity;
- fallback paginator в `nextLine()` использует локализованный текст, а не исходный русский `entry.text`;
- AUTO timer при ручном/автоматическом page advance безопасно пересоздаётся без полного VN render.

Полный `renderVN()` остаётся корректным fallback, если ожидаемые dialogue DOM nodes отсутствуют, и по-прежнему используется для настоящих line/scene/layout transitions.

## Browser regression

`e2e/tests/vn-navigation.pw.ts` теперь содержит Mobile WebKit critical journey для белорусской QA Scene Navigation `scene 5`:

1. переключает runtime locale на `be` через production Settings UI;
2. доходит до `VN0156`;
3. фиксирует DOM identity текущего production VN frame и геометрию `.phone`, `.vn-topbar`, `.vn-controls`, `innerWidth/innerHeight` и `visualViewport`;
4. выполняет `1 → 2` dialogue-page advance;
5. проверяет, что VN frame остался тем же DOM node и viewport/header/footer geometry не изменилась;
6. повторяет тот же контракт для `VN0160`.

`vn-navigation.pw.ts` входит в оба Browser Gate проекта, но широкий iOS regression corpus намеренно выполняется только в `webkit-mobile`: пограничные строки вроде `VN0156` могут быть `1/2` в Mobile WebKit и помещаться в одну страницу в Desktop Chromium из-за разных font/layout metrics. Chromium сохраняет общий production measured-paging smoke на `VN0001`, а cross-locale `ru/be/en` contract отдельно выполняется в обоих проектах.

## Scope

Изменяются только VN paging/presentation stability, один CSS browser-sizing guard, browser regression, unit contract и этот документ. Story canon, localization strings, save schema, Match-3, preview badge, safe-area tokens, assets и workflows не меняются.

## Следующий шаг

После ручной проверки G8E2 продолжаем ANM-023G8E3 — Match-3 Render Stability.


## Дополнительный global paging audit (R1.1)

После ручного отчёта по VN0156/VN0160 был отдельно проверен весь белорусский каталог (976 VN-линий) на production dialogue geometry. Результат подтверждает, что дефект не привязан к scene 5: сотни реплик являются многостраничными в мобильной геометрии, а точный набор зависит от browser/font metrics. Поэтому runtime fix остаётся общим для любого `dialoguePageIndex` внутри той же VN-линии.

Mobile WebKit regression corpus теперь охватывает раннюю, среднюю и позднюю часть истории: VN0001; VN0156/VN0158/VN0160; VN0340; VN0595; VN0732; VN0964. Это representative contract, а не hardcoded runtime whitelist: production code не содержит специальных VN ID.

## Localization paging regression (R1.2)

Viewport stability теперь проверяется не только на белорусском representative corpus. `e2e/tests/persistence-localization-flow.pw.ts`, который уже входит в Mobile WebKit critical lane, получает отдельный localization regression для `ru`, `be` и `en`.

Тест через production Settings UI последовательно выбирает каждый locale и открывает одну и ту же гарантированно многостраничную `VN0555` в QA Scene Navigation scene 24. Эта строка выбрана намеренно: все три локализации достаточно длинные, чтобы multi-page contract не зависел от пограничных различий browser/font metrics.

Для каждого locale проверяется:

- `html[lang]` реально переключился на выбранный язык;
- production dialogue сообщает `data-dialogue-pages > 1`;
- `1 → 2` не меняет StoryLine (`VN0555` остаётся текущей);
- production VN frame сохраняет DOM identity;
- `visualViewport.scale` не меняется.

Таким образом paging рассматривается как часть localization contract: перевод может менять длину и количество внутренних dialogue pages, но не должен менять физический viewport или пересоздавать VN shell.
