# ANM-016D — Unified Header Navigation & Contrast

Version: `0.16.8-anm016d`

## Зачем

До ANM-016D разные режимы использовали разные header-паттерны: VN, choice, Match-3 и сервисные панели отличались по доступу к меню/настройкам и по контрасту. В VN одновременно существовали header-settings и нижний `CONFIG`, что создавало дублирование.

## Новый контракт

- один визуальный `.app-header` contract для постоянных интерактивных экранов;
- тёмно-синий почти непрозрачный фон header;
- белые иконки на отдельной тёмной кнопке с золотой границей;
- minimum touch target 42×42 px, 38×38 только в самом компактном viewport;
- `MENU` и `SETTINGS` доступны из VN, choice, Match-3 intro/board, loss result, ending и сервисных panel screens;
- `LOG` остаётся контекстным действием только VN;
- `DOSSIER` остаётся контекстным действием VN / Match-3;
- back остаётся контекстным там, где существует безопасный предыдущий экран;
- нижний VN `CONFIG` удалён как дубликат: header gear открывает существующий полный VN config overlay (AUTO speed, text size, audio);
- выход из активного Match-3 в главное меню требует подтверждения, чтобы случайный tap не потерял текущую попытку;
- main menu и короткий auto-advance evidence transition не получают лишний глобальный header; loss result и ending используют общий header, потому что пользователь может оставаться на них сколько угодно.

## Что не меняется

Narrative, VN IDs, save key/schema, character staging, dialogue paging, Match-3 rules/balance, assets и production rig contract не меняются.
