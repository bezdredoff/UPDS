# G2a-ARCH-006 — Button / CSS Cascade Contract

Status: **in review**

## Проблема

До ARCH-006 shared `.primary` задавал основные цвета через `!important`. Match-3 intro и locked Campaign затем были вынуждены отвечать собственными counter-`!important`, чтобы вернуть feature-specific presentation. В результате корректный вид primary action был скрытым контрактом между specificity, import order и набором `!important`.

## Новый контракт

Shared primary action теперь принадлежит именно кнопке внутри player shell:

```css
.phone button.primary { ... }
```

Это даёт shared modifier достаточную specificity, чтобы обычные context/base rules вроде `.menu-actions button` не могли случайно превратить primary action обратно в generic white button только из-за позиции в файле.

Feature variants должны быть семантически контекстнее shared modifier:

- Match-3 intro: `.level-intro .level-card > button.primary`;
- Match-3 tutorial: `.match-tutorial-overlay .match-tutorial-card button.primary`;
- locked Campaign: `.match3-campaign-screen .campaign-level-card.locked button:disabled`.

Все эти visual overrides работают без `!important`. Значения не должны зависеть от того, импортирован feature stylesheet до или после shared stylesheet: контекстный selector сам выражает ownership.

## Что изменено

- generic `.primary` selector заменён на app-scoped `.phone button.primary`;
- primary border/background/color/font declarations больше не используют `!important`;
- Match-3 intro primary и hover получили явный feature context и потеряли counter-`!important`;
- Match-3 tutorial primary также имеет явный feature context;
- locked Campaign disabled action больше не использует counter-`!important`;
- source contracts обновлены под specificity ownership, а существующий browser Campaign contract продолжает проверять реальный computed state.

## Что намеренно не менялось

- HTML/TS markup и сам класс `primary`;
- gameplay, баланс, save schema, viewport geometry и safe-area logic;
- Golden Samples;
- `!important` внутри `prefers-reduced-motion` и utility `.visually-hidden`: это намеренные enforcement rules, не button cascade;
- отдельный `display:flex !important` в Level Lab также не входит в этот bounded slice.

## Regression contract

После ARCH-006:

1. shared player primary style не должен возвращаться к generic `.primary !important`;
2. Match-3/Campaign visual variants не должны добавлять button-related counter-`!important`;
3. Menu/Ending/PWA primary actions сохраняют shared coral presentation несмотря на более поздние generic button rules;
4. Match-3 intro/tutorial сохраняют зелёный case-board primary presentation;
5. locked Campaign action остаётся явно disabled/readable;
6. CSS import order может сохраняться для организации bundle, но не является механизмом разрешения этих visual conflicts.

## Следующий шаг

После принятия ARCH-006 следующий bounded architecture slice — **G2a-ARCH-007 Platform identity single source**: один resolver для display mode и один resolver для stable/preview/local runtime lane.
