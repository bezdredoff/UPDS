# ANM-016D — ручной QA

Проверить на iPhone `/preview/`:

1. **VN**: header тёмный; case/dossier, LOG, Settings, Menu хорошо различимы. Нижнего CONFIG больше нет. Gear открывает AUTO/text/audio config.
2. **Choice**: Settings и Menu доступны, header не перекрывает choice panel.
3. **Match intro**: Back / Dossier / Settings / Menu доступны и читаемы.
4. **Match board**: те же четыре действия; при Menu во время активной попытки появляется подтверждение; Cancel оставляет board на месте.
5. **Loss / Ending**: Settings + Menu видимы; Loss также имеет Back.
6. **Dossier / Scene select / Diagnostics**: sticky header содержит Back + Settings + Menu; при scroll header остаётся читаемым.
7. **Settings, открытые из контекста**: Back возвращает именно туда, откуда настройки были открыты.
8. **320×568**: header не ломает layout; title может ellipsis, но action icons не перекрываются.
9. **390×844 / 430×932**: нет светлой кнопки на почти таком же светлом header/background.
10. Повторно проверить VN R6: две строки, balanced paging и `…` не изменились.
11. Повторно проверить ANM-016C R2: персонажи заходят за dialogue card, nameplate остаётся поверх.
