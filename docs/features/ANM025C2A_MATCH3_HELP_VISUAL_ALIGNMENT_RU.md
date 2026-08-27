# ANM-025C2A — Match-3 Help Visual Alignment

## Причина

После merge C2 manual iPhone QA выявил две presentation-проблемы, которые не ловились текстовыми CSS-contract tests:

- широкая Help-панель была привязана `right: 0` к самой кнопке `?`, поэтому визуально росла влево и могла казаться смещённой/частично не помещаться;
- отдельная карточная стилизация Help отличалась от уже принятого Match-3 tutorial/card vocabulary.

## Контракт C2A

- Help остаётся тем же native `<details>` без controller/save/telemetry state;
- панель теперь `position: fixed` и центрируется по телефонному viewport через `left: 50%` + `translateX(-50%)`;
- ширина ограничена симметричными mobile gutters и не зависит от позиции header trigger;
- visual language повторяет `.match-tutorial-card`: gold frame, green left spine, paper gradient, navy outer ring/shadow и Georgia heading;
- при открытом Help появляется тот же затемнённый backdrop family, что и у Match-3 tutorial overlay;
- внутренние FAQ topics больше не выглядят как отдельный набор вложенных карточек: они разделены спокойными case-file separators;
- board geometry, тексты Help, localization, Match-3 engine, balance, hints, save и telemetry не меняются.

## Regression gate

Помимо быстрых Vitest CSS-contract assertions добавлен один короткий Playwright geometry test. Он открывает production Match-3 через Level Lab и проверяет, что:

1. Help видим;
2. центр панели совпадает с центром viewport;
3. весь bounding box остаётся внутри viewport;
4. bounding box доски до/после открытия Help не меняется.

Это намеренно узкий browser test, потому что именно реальная layout geometry была слепой зоной C2.

## iPhone QA перед merge

1. Открыть Help на intro и active board: панель должна выглядеть визуально по центру, с равными левым/правым полями.
2. Проверить narrow portrait viewport: ни frame, ни shadow не должны быть визуально обрезаны по горизонтали.
3. Сравнить Help с tutorial coachmark: они должны ощущаться частью одной UI-системы.
4. Прокрутить Help до конца; внутренний scroll не должен двигать board/HUD.
5. Закрыть Help повторным `?` и убедиться, что обычный Match-3 interaction не изменился.
