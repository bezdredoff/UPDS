# ANM-025F4 — Match-3 Cascade & Bark UX Hardening

Статус: candidate hotfix после ручного iPhone QA ANM-025E4B R7.

## Наблюдения

Ручная проверка выявила три независимых дефекта presentation/rules слоя:

1. квадрат `2×2` из одинаковых фишек, появившийся не прямым swap игрока, а после gravity/refill/cascade, мог оставаться на поле;
2. временная reaction-реплика после таймера полностью удалялась, оставляя пустой зарезервированный bark-slot;
3. Match-3 bark renderer знал только Мику/Оноэ/Аюки и для остальных имён показывал медальон Мику, хотя у production-персонажей уже есть собственные medallion assets.

## Исправление 2×2

Новый automatic-resolution matcher объединяет обычные line-match группы с квадратами `2×2` (`orientation: square`), не меняя player-swap/hint matcher.

- если квадрат непосредственно создал player swap, существующий `findPlayerSpecialCreations()` по-прежнему создаёт `Lead`, потребляет четыре клетки и сохраняет anchor специальной фишки;
- если такой квадрат появился после settle/refill/cascade, player-authored creation отсутствует, поэтому resolver очищает все четыре клетки как обычную cascade-match;
- стартовая генерация/reshuffle также больше не оставляет готовый `2×2` на стабильном поле, потому что `hasImmediateMatches()` использует automatic-resolution matcher;
- objective-aware hint остаётся на прежнем player-swap matcher, поэтому исправление не меняет E3 balance guardrail через новый класс подсказок.

Новые specials, objective rules, move budgets и spawn weights не добавляются.

## Idle bark вместо пустоты

После окончания временной reaction-карточки renderer больше не переводит `matchBark` в `null`.

После fade-out остаётся обычная bark-card:

- тот же последний speaker;
- тот же medallion;
- текст `…`;
- без reaction metadata/animation.

Таким образом карточка визуально читается как пауза персонажа, а зарезервированное пространство не выглядит как сломанный пустой блок.

## Production medallions

Match-3 bark теперь ищет speaker среди всех `productionCharacterKeys`, а не только первых трёх детективов. Это сразу исправляет Норихиро и одновременно покрывает Эми, Кэнтаро, Маю, Рину и Куросэ.

Guest/witness speakers, для которых production rig пока отсутствует, не расширяются этим hotfix: их финальная presentation остаётся отдельной release-backlog задачей.

## Acceptance

- unit: `2×2` входит в automatic-resolution match groups, но не меняет line-only player hint groups;
- unit: cascade resolver очищает generated `2×2` без создания `Lead`;
- unit: direct player `2×2` всё ещё создаёт `Lead`;
- unit: Norihiro bark использует `medallionAsset('norihiro')`, не Miku;
- browser: reaction заканчивается idle-карточкой `…` с тем же portrait и без изменения Match-3 board geometry;
- authoritative gate: `npm run check` + Browser Gate в GitHub candidate PR.

## R2 — CI contract sync

R1 functional tests and balance guards passed in the importer, but the legacy render-stability contract still searched for the previous Playwright test title (`reaction bark appears and dismisses...`). R2 updates that contract to the new idle-last-speaker scenario. Runtime behavior is unchanged from R1.
