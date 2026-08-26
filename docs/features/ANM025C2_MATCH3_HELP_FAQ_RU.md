# ANM-025C2 — Match-3 Help / FAQ

## Почему

Human playtest pass показал, что после исправления pacing, feedback и objective HUD игроку всё ещё не хватает одного постоянного места, где можно быстро восстановить правила Match-3. Persistent coachmarks полезны при первом знакомстве с механикой, но после закрытия не служат справкой, а повторное объяснение через отдельные новые тексты быстро разъедется с tutorial contract.

C2 добавляет компактную player-facing справку прямо в Match-3 header и переиспользует существующие tutorial-тексты там, где правило уже описано канонически.

## Контракт C2

- кнопка `?` доступна и на level intro, и на активной Match-3 доске;
- справка реализована нативным `<details>`, без нового controller/save/telemetry state;
- открытие справки не расходует ход, не меняет board и не вызывает отдельный render;
- панель накладывается поверх игры и скроллится внутри телефонного viewport, а не сдвигает доску;
- доступны разделы: objectives, Hint, blockers, story objects/drop ingredients, special activation, special combinations и automatic reshuffle;
- blocker/story-object/special copy переиспользует существующие `match3.tutorial.*` keys;
- новые help-only строки поставляются как компактное runtime extension с точным RU/BE/EN parity и без fallback;
- никаких изменений balance, hint ranking, special rules, reshuffle algorithm, objectives, save schema или telemetry.

## Почему без нового Browser E2E

C2 намеренно не добавляет отдельный многосекундный Playwright journey. Интеракция основана на browser-native `<details>`, а риск feature находится в markup/CSS/localization contract. Быстрые Vitest gates фиксируют:

1. accessible disclosure + dialog-labelled panel;
2. наличие Help entry в intro и gameplay markup;
3. overlay positioning и внутренний mobile scroll без board layout state;
4. полный RU/BE/EN runtime parity новых строк.

Существующий Browser Gate остаётся обязательным regression gate всего приложения и должен подтвердить отсутствие побочных визуальных/interaction regression.

## Preview / iPhone QA

1. Открыть любой Match-3 intro и нажать `?`: справка должна открыться поверх экрана, не меняя карточки целей и layout.
2. Закрыть её повторным нажатием `?`, начать уровень и открыть снова на активной доске.
3. Прокрутить справку до `Нет доступных ходов`; board под панелью не должен смещаться или перерендериваться.
4. Проверить RU / BE / EN: заголовки и body не должны fallback-иться, выходить за панель или обрезаться по горизонтали.
5. На story run проверить, что Dossier + Help + Settings остаются доступны в header; на 320–340 px длинный title может ellipsis, но actions не должны выходить за viewport.
6. После закрытия Help сделать обычный ход и Hint: move cost, objective progress и hint behavior должны оставаться прежними.

## Следующий срез

C3 остаётся отдельным: contextual story-object guidance непосредственно в конкретных уровнях. C2 объясняет общие правила и не пытается угадывать, какой именно сюжетный объект сейчас вызывает затруднение.
