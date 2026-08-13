# ANM-025D4 — Special Combo Tutorial

## Цель

Добавить обучающий concept для прямого соединения двух специальных фишек, не превращая tutorial в текстовую энциклопедию всей special-combination matrix.

## Контракт

- concept: `combine-specials`;
- доступен на всех текущих Match-3 уровнях после `activate-special`;
- reveal trigger: `special-combo-ready`;
- trigger динамический: активен только пока на текущем поле реально существуют две соседние special tiles;
- completion trigger: `special-combined`;
- completion засчитывается только после успешного swap двух специальных фишек;
- если опытный игрок выполнит такой swap до coachmark, concept сразу считается освоенным;
- если соседняя пара исчезла до действия, tutorial откладывается до следующей реальной возможности;
- direct double-tap activation не завершает combo tutorial.

## Почему trigger не sticky

`special-created` из D3 можно хранить как событие попытки: после первого создания игрок уже видел саму механику special. Наличие же пары specials — временное состояние доски. Sticky `combo-ready` мог бы показать окно позже, когда подходящей пары уже нет. Поэтому D4 вычисляет этот reveal из текущего board state при каждом tutorial transition.

## Что не меняется

- `Match3Game.ts`;
- Narrative Special Combination Matrix ANM-022E;
- special taxonomy;
- move cost и balance;
- save schema/key;
- правила direct activation из D3.

## QA

1. Создать две соседние specials.
2. Убедиться, что после освоения `activate-special` появляется combo coachmark.
3. Убрать/потратить пару без combo и убедиться, что окно не возвращается без новой соседней пары.
4. Создать новую соседнюю пару и swap specials друг с другом.
5. Убедиться, что `combine-specials` сохраняется как completed и больше не показывается.
