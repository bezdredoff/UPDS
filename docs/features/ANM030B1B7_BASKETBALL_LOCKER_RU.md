# ANM-030B1B7 — Basketball Locker Production Background

Status: **R1 candidate / visual QA required**.

## Цель

Заменить очевидный semantic fallback эпизода 5 `basketball-locker`, который до этого показывал общий
`BG_LOCKER_ATHLETICS_DAY.webp`, на отдельный production-ready фон баскетбольной раздевалки без
изменения screenplay, scene IDs, staging, save или Match-3 mechanics.

## Production asset

- runtime path: `./assets/backgrounds/BG_BASKETBALL_LOCKER.webp`;
- physical path: `public/assets/backgrounds/BG_BASKETBALL_LOCKER.webp`;
- master canvas: `1080×1920`, portrait WebP;
- source: утверждённый пользователем 1080×1920 PNG, переданный напрямую для интеграции;
- production WebP size: `89,182` bytes;
- SHA-256: `ccec67f61c34058eed79e44a4d5bacafb5c3f5003a9ebcc5fe8e181fb4ad06f8`.

Фон показывает отдельную баскетбольную раздевалку с высокими зелёными шкафчиками, длинными
скамьями, спортивными сумками, стойкой с мячами, доской и естественным дневным освещением. В кадре
нет персонажей, baked UI или обязательного читаемого текста; нижняя зона остаётся достаточно
спокойной для VN dialogue card.

## Runtime

`backgroundAssets.basketballLocker` теперь разрешается в dedicated
`BG_BASKETBALL_LOCKER.webp`, а `lockerAthletics` продолжает использовать исходный
`BG_LOCKER_ATHLETICS_DAY.webp`. Таким образом новый фон не заменяет и не переопределяет
легкоатлетическую раздевалку.

Обе canonical сцены эпизода 5 сохраняют существующий semantic key:

- `VN_SCENE_11_E5_PRE` — «Заслон для вора»;
- `VN_SCENE_12_E5_POST` — «Сервисная строчка».

## Scope / release impact

Это controlled variant внутри уже существующей `sports-locker` family, а не новая family/master
архитектура. Изменение закрывает один visibly-wrong background fallback в shipped Story и уменьшает
реальный remaining semantic-background backlog на один вариант.

Никакие guest assets, Hero Clue, extras, localization strings, story facts, level configs или
character production contracts не меняются.

## Automated acceptance

- dedicated runtime mapping не равен `lockerAthletics` fallback;
- физический WebP существует и имеет RIFF/WEBP container;
- размер изображения ровно `1080×1920`;
- обе E5 VN scenes продолжают использовать `basketballLocker` semantic key;
- GitHub Quality gate и Browser Gate проходят.

## Manual iPhone QA

В `/preview/` открыть E5 через QA Scene Navigation (`?qa=1`) и проверить обе сцены:

1. фон визуально читается именно как баскетбольная раздевалка;
2. персонажи не конфликтуют со шкафчиками/скамьями и сохраняют правильный focal eye-line;
3. нижняя dialogue card не закрывает критическую сценическую информацию;
4. фон не выглядит чрезмерно увеличенным/обрезанным на portrait viewport;
5. переход E4 → E5 → Match-3 → E5 post не возвращает athletics-locker fallback.
