# ANM-030B1B7 — Basketball Locker Production Background

Status: **visual QA required**.

## Цель

Заменить semantic fallback эпизода 5 `basketball-locker`, который показывал общий `BG_LOCKER_ATHLETICS_DAY.webp`, на отдельный production background без изменения screenplay, scene IDs, staging, save или Match-3 mechanics.

## Production asset

- runtime path: `./assets/backgrounds/BG_BASKETBALL_LOCKER.webp`;
- physical path: `public/assets/backgrounds/BG_BASKETBALL_LOCKER.webp`;
- canvas: `1080×1920`, portrait WebP;
- импортирован отдельно binary-safe ZIP PR #201;
- production WebP size: `89,182` bytes;
- SHA-256: `ccec67f61c34058eed79e44a4d5bacafb5c3f5003a9ebcc5fe8e181fb4ad06f8`.

Direct GitHub connector binary upload из superseded PR #200 был повреждён и намеренно не используется.

## Runtime

`backgroundAssets.basketballLocker` разрешается в dedicated `BG_BASKETBALL_LOCKER.webp`, а `lockerAthletics` продолжает использовать `BG_LOCKER_ATHLETICS_DAY.webp`.

Обе canonical сцены эпизода 5 сохраняют semantic key `basketballLocker`:

- `VN_SCENE_11_E5_PRE` — «Заслон для вора»;
- `VN_SCENE_12_E5_POST` — «Сервисная строчка».

## Automated acceptance

- runtime mapping отличается от athletics fallback;
- физический asset имеет `RIFF/WEBP` container;
- размер изображения `1080×1920`;
- SHA-256 совпадает с approved binary;
- обе E5 VN scenes остаются на `basketballLocker`;
- GitHub CI и Browser Gate проходят.

## Manual iPhone QA

Открыть Pages с `?qa=1`, затем `Scene Navigation`:

1. `VN_SCENE_11_E5_PRE — Заслон для вора`;
2. `VN_SCENE_12_E5_POST — Сервисная строчка`.

Проверить, что фон визуально читается именно как баскетбольная раздевалка, персонажи не конфликтуют со шкафчиками/скамьями, dialogue card не закрывает критические детали и athletics-locker fallback больше не появляется.
