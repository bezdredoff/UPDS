# ANM-016E — Manual QA

1. VN: header показывает CASE, LOG и Settings; отдельной Menu-кнопки нет.
2. VN → Settings: CONFIG открывается; внизу есть `Главное меню`; Close возвращает в ту же реплику.
3. VN CONFIG → Главное меню: открывается menu; Continue возвращает на сохранённую VN-позицию.
4. Match-3: header показывает Back, Dossier и Settings; отдельной Menu-кнопки нет.
5. Match-3 → Settings → Back: возвращает в ту же активную попытку.
6. Match-3 → Settings → Главное меню → Cancel: остаёмся в Settings/игровом контексте, попытка не теряется.
7. Match-3 → Settings → Главное меню → Confirm: открывается главное меню, текущая попытка сбрасывается.
8. Dossier из VN и из Match-3: Back возвращает в исходный контекст; Settings открываются без отдельной Menu-кнопки в header.
9. Choice / Match intro / Loss / QA panels: header остаётся компактным и не переполняется на 320×568.
10. Ending: header без Menu-кнопки, но основная CTA `В главное меню` остаётся доступной.
