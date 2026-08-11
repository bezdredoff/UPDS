# ANM-018A — Manual QA

ANM-018A должен выглядеть и работать так же, как ANM-018. Проверяем только возможные regression после перемещения ответственности между модулями.

## Быстрый проход на iPhone preview

1. Главное меню отображается как раньше; Continue работает.
2. Открыть VN: фон, staging, nameplate, две строки dialogue paging, LOG/Settings/CASE — без визуальных изменений.
3. Проверить длинную реплику: внутренние страницы и `…` работают; authored VN ID/read/save меняются только после последней внутренней страницы.
4. Открыть Settings из VN и вернуться обратно.
5. Открыть dossier из VN и вернуться обратно.
6. Дойти/перейти к Match-3: intro, цели, board 8×8, hint, tap/swipe/drag, invalid swap и motion работают как раньше.
7. Открыть Settings/Dossier из Match-3 и вернуться на активный уровень.
8. Проверить выход в главное меню из активного Match-3 и confirmation.
9. Проверить win → evidence transition → VN и появление новой улики.
10. Diagnostics: export save/playtest report и PWA status отображаются.
11. PWA update/offline поведение не изменилось; stable и `/preview/` не смешиваются.
12. Финальный экран, replay и возврат в меню работают.

Если любое поведение отличается от ANM-018, считать это regression: ANM-018A не должен вводить пользовательские изменения.
