# PG-002E — отделить таймеры и планирование кадров

Статус: подготовлено к проверке.

## Изменение

- `src/contracts/SchedulerRuntime.ts` описывает отложенные callbacks, отмену таймера и планирование
  следующего кадра без типов браузерного API.
- `BrowserScheduler` реализует контракт через `window.setTimeout`, `window.clearTimeout` и
  `window.requestAnimationFrame`; composition root публикует реализацию в `RuntimeServices`.
- `AppShell`, VN reflow и Match-3 feedback/hints используют scheduler через контракт.

## Границы

DOM обновления, viewport-события и анимационные правила остаются в текущем web UI. Контракт
изолирует только время запуска callback; Godot-порт сможет связать его с native timers/process
frames, а UI представить нативными сценами отдельно. Игровые интервалы и поведение не меняются.

## Проверка

Архитектурный тест запрещает прямые обращения к браузерным timer/frame API в AppShell и feature
controllers. Полный `npm.cmd run check` и version policy должны пройти до слияния.
