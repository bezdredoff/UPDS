# G2a-ARCH-003 — Persistent AppShell

Status: **accepted via PR #290**.

## Проблема

До этого `AppShell.render()` на каждом screen render заново записывал весь `#app.innerHTML`, вместе с `.viewport-shell` и `.phone.game-viewport`.

Это означало, что глобальная physical geometry DOM-граница уничтожалась и создавалась заново при обычной навигации и при VN render, хотя её размеры и ownership уже принадлежат `ViewportRuntime` и не должны зависеть от feature lifecycle.

## Решение

`AppShell` теперь разделяет два lifecycle:

- persistent shell: `.viewport-shell` + `.phone.game-viewport`;
- replaceable screen: `.app-screen-host[data-screen-host="primary"]`.

Первый production render монтирует shell один раз. Следующие `render(content)` очищают disposable timers, удаляют transient direct children из `.phone.game-viewport` и заменяют только `screen-host.innerHTML`.

Transient cleanup сохраняет прежнюю семантику полного render: VN overlays и старый PWA banner не переживают screen boundary. Существующий `afterRender` после замены screen content заново синхронизирует актуальный PWA update banner.

Для старых lightweight unit/QA fakes, которые не предоставляют реальный DOM `querySelector`, оставлен bounded fallback к прежнему one-shot markup. Production HTMLElement всегда использует persistent path.

## Regression contract

`ViewportShell.test.ts` теперь проверяет:

- два последовательных `AppShell.render()` монтируют physical shell только один раз;
- `screenHost` сохраняет object identity;
- первый screen действительно заменяется вторым;
- transient sibling удаляется на screen boundary;
- `afterRender` вызывается после каждого screen render;
- существующие standalone physical-height и browser/standalone geometry contracts остаются без изменений.

## Не входит в slice

- изменение viewport height/token формул;
- изменение resize/orientation event policy;
- перенос VN overlays на отдельный feature overlay API;
- standalone CSS consolidation;
- compact/container-query migration;
- Match-3/VN gameplay или presentation changes.

На момент этого architecture slice KI-001/KI-003 оставались открыты; позднее их закрыла реальная
проверка установленной PWA G0-PWA-001 на iPhone 2026-09-11.
