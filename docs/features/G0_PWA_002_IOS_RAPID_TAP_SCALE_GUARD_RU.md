# ANM-030B1C2 / G0-PWA-002 — общий iOS rapid-tap scale guard

Дата: **2026-09-12**
Статус: **implementation candidate; требуется real-iPhone retest**
Связанные release gate / issue: `G0`, `KI-004`

## Наблюдение

После успешной проверки G0-PWA-001 на установленной iPhone PWA пользователь подтвердил, что
быстрый повторный tap вызывал browser rescale на Match-3 и на level-intro перед ним. Первая
реализация G0-PWA-002 из PR #302 исправила Match-3, но real-iPhone retest 2026-09-12 показал,
что level-intro всё ещё рескейлится. Общая shell-policy не наследуется обычными intro descendants,
которые Safari может выбрать непосредственной целью быстрого tap.

## Контракт исправления

- persistent `.viewport-shell` задаёт `touch-action: manipulation` для всей player surface;
- `.level-intro` и все его descendants получают явный `touch-action: manipulation`, чтобы
  computed policy не зависела от наследования общей оболочки;
- iOS double-tap smart zoom запрещён на menu, level intro, Match-3 и остальных экранах;
- пользовательский pinch zoom не запрещается: viewport meta не получает `maximum-scale=1` или
  `user-scalable=no`;
- Match-3 board сохраняет более строгий `touch-action: none` для production drag/swipe;
- игровой double tap по special tile не фильтруется и продолжает активировать механику;
- VN time guard продолжает отдельно блокировать только дублирующий advance click.

Локальный VN-specific `touch-action: manipulation` удалён: теперь gesture policy имеет одного
владельца на общей persistent shell.

## Acceptance

1. Установить exact candidate build заново или дождаться подтверждённого PWA update.
2. Быстро тапнуть по level-intro, Start, Match-3 HUD и обычным клеткам: viewport scale остаётся `1`.
3. Убедиться, что drag/swipe и tap-selection на board работают.
4. Создать special и подтвердить его intentional double-tap activation.
5. Проверить обычный pinch zoom вне board: accessibility zoom остаётся доступным.

`KI-004` остаётся открытым до этой проверки на реальном iPhone.
