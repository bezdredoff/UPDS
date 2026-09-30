# ANM-030B1C2 / G0-PWA-002 — общий iOS rapid-tap scale guard

Дата обновления: **2026-09-30**
Статус: **implementation candidate; требуется real-iPhone retest**
Связанные release gate / issue: `G0`, `KI-004`

## Наблюдение

После успешной проверки G0-PWA-001 на установленной iPhone PWA пользователь подтвердил, что
быстрый повторный tap вызывал browser rescale на Match-3 и на level-intro перед ним. Первая
реализация G0-PWA-002 из PR #302 исправила Match-3, но real-iPhone retest 2026-09-12 показал,
что level-intro всё ещё рескейлится. Общая shell-policy не наследуется обычными intro descendants,
которые Safari может выбрать непосредственной целью быстрого tap.

2026-09-30 пользователь снова воспроизвёл zoom на тексте и хэдере расследования 3/22
«Мокрые показания», но не на фоне. Поэтому PR #302/#303 не являются полной device-приёмкой.
Shell-only policy и список отдельных кнопок не покрывали каждый вложенный tap/scroll target.

## Контракт исправления

- persistent `.viewport-shell` задаёт `touch-action: manipulation` для всей player surface;
- `:where(.viewport-shell *)` явно задаёт `touch-action: manipulation` всем descendants,
  включая текст, хэдеры, scroll hosts, SVG и native details/summary; нулевая specificity
  сохраняет feature-owned overrides. Не использовать `inherit`: native shadow slots могут
  разорвать цепочку (выявлено browser-аудитом панели help). Старое локальное intro-правило удалено;
- iOS double-tap smart zoom запрещён на menu, level intro, Match-3 и остальных экранах;
- пользовательский pinch zoom не запрещается: viewport meta не получает `maximum-scale=1` или
  `user-scalable=no`;
- Match-3 board и все его descendants сохраняют `touch-action: none` для production drag/swipe;
- Scene Studio draggable portrait и его descendants сохраняют свой `touch-action: none`;
- игровой double tap по special tile не фильтруется и продолжает активировать механику;
- VN time guard продолжает отдельно блокировать только дублирующий advance click.

Локальный VN-specific `touch-action: manipulation` удалён: теперь gesture policy имеет одного
владельца на общей persistent shell.

## Acceptance

1. Установить exact candidate build заново или дождаться подтверждённого PWA update.
2. В расследовании 3/22 «Мокрые показания» быстро тапнуть по тексту, заголовку, вложенным
   словам/иконкам хедера, intro, Start, HUD, help и обычным клеткам: viewport scale остаётся `1`.
3. Убедиться, что drag/swipe и tap-selection на board работают.
4. Создать special и подтвердить его intentional double-tap activation.
5. Проверить обычный pinch zoom вне board: accessibility zoom остаётся доступным.
6. Повторить на других расследованиях, menu/Campaign, settings, VN и overlays; отдельно
   убедиться, что длинный текст help/settings прокручивается одним пальцем.

## Автоматические проверки candidate

- Browser helper `e2e/helpers/gestures.ts` проверяет computed policy всех отрисованных descendants
  и отсутствие viewport-meta ограничений pinch zoom.
- `boot.pw.ts`: menu/settings/Campaign/Match-3; все 22 production board layouts через QA Level Lab,
  их help panels; отдельная проверка русского заголовка «Мокрые показания» на третьем уровне.
- Нативные touch taps по тексту/хэдеру с проверкой visualViewport scale, не synthetic mouse clicks.
- `persistence-localization-flow.pw.ts`: настоящий Story → intro путь, заголовок и текст intro.
- `vn-navigation.pw.ts`: VN, history overlay и choice descendants; существующие Match-3 tests
  проверяют drag/swipe и intentional special double tap.

Эмуляция на Windows не доказывает отсутствие iOS smart zoom на реальном телефоне.

Локальный результат 2026-09-30: `npm run check` — 147 файлов / 716 tests, lint и production
build PASS; targeted mobile WebKit — 4/4 PASS, включая sweep всех 22 уровней и Story → intro.
Chromium 22-level touch sweep PASS; VN/locale/persistence/board regression PASS. В первом
параллельном запуске существующий help-image test не дождался картинки; одиночный повтор PASS.
GitHub CI/Browser Gate ещё не запускались для этого candidate. Dependencies не изменялись;
security audit сообщает 2 moderate advisories, high-severity gate проходит.

`KI-004` остаётся открытым до этой проверки на реальном iPhone.
