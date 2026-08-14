# ANM-028B3 R1.1 — Guest / Witness Presentation Contract

## Цель

Закрыть production blocker перед ANM-027G `4–6`: эпизодические свидетели должны существовать в VN
как отдельный дешёвый presentation tier, не притворяясь полноценными stage-персонажами и не
раздувая строгий `upds-character-production-v2`.

ANM-027F уже зафиксировал шесть таких пакетов: **Hinata, Gen, Aoi, Kubo, mother Kubo, Vincent**.
Первый реальный consumer — Hinata в slots `5–6`.

## Machine-readable contract

Source of truth: `src/data/guestWitnesses.ts`, format **`upds-guest-witness-production-v1`**.

Каждый production guest package содержит ровно четыре изображения:

1. neutral bust / half-body master — `1024×1536` transparent PNG;
2. expression variant A — `1024×1536` transparent PNG;
3. expression variant B — `1024×1536` transparent PNG;
4. neutral medallion — `512×512` transparent PNG.

Expression variants являются character-specific: контракт хранит их IDs и direction tokens, поэтому
Хинате не требуется искусственно использовать тот же пятиэмоциональный enum, что и full-stage rig.
Neutral bust остаётся fallback, если direction не соответствует двум expression variants.

## Planned state

В R1 все шесть пакетов имеют `status: planned` и `assets: null`.

Это намеренно:

- character-art generation сейчас находится во внешнем Stable Diffusion workflow;
- никакие фиктивные image paths не создаются;
- production art можно добавить позже изменением только guest manifest/assets;
- story/runtime API уже стабилен и не потребует переделки при появлении PNG.

Validator отклоняет:

- assets у `planned` guest;
- `production` без полного четырёхassetного package;
- дублированные/missing expression slots;
- production paths вне `./assets/guests/<id>/`;
- попытку изменить locked guest set или `guest-testimony-card` runtime presentation.

## Runtime presentation

Shared renderer: `src/ui/guestWitnessMarkup.ts`.

Он всегда использует `guest-testimony-card` из `upds-scene-staging-v1`:

- слева — guest bust shell;
- справа — testimony identity card;
- dialogue остаётся в обычном shared VN dialogue frame;
- `planned` guest показывает initials/name placeholder без `<img>`;
- `production` guest выбирает neutral bust или одну из двух expression variants по direction tokens.

`VnController` сначала проверяет обычный full-stage character/placeholder и только затем guest token.
Guest line не попадает в `resolveVnStaging()` и не становится `CharacterKey`.
Preload добавляет guest image только когда manifest реально переведён в `production`.

## Scene Studio

`guest-testimony-card` теперь использует тот же shared B3 renderer, что и будущий playable runtime.
R1 показывает **Hinata** как первый macro-triggered sample:

- `data-guest-witness="hinata"`;
- `data-guest-status="planned"`;
- real preset safe boxes;
- asset-free initials/name placeholder;
- no `/characters/guest/` or fake full-stage asset path.

Это визуальный QA layout, а не approval будущего Stable Diffusion character art.

## Boundary с full-stage contract

B3 **не меняет**:

- `src/data/characterProduction.ts`;
- strict seven-asset full-stage rig;
- `CharacterKey` / `RuntimeExpression`;
- Emi D3A transition;
- `RuntimeAssets` (пока guest packages asset-free).

Guest IDs запрещено добавлять в `upds-character-production-v2` только ради того, чтобы существующий
full-stage renderer их принял.

## Acceptance

Automated:

- exact six-key guest set и first-slot triggers совпадают с 027F;
- manifest validator возвращает zero issues;
- all current packages planned + asset-free;
- speaker-token mapping детерминирован;
- shared renderer выдаёт `guest-testimony-card` без fake image path;
- Scene Studio использует shared B3 renderer для Hinata;
- TypeScript/build/test suite зелёные.

Manual iPhone preview:

1. открыть Scene Studio;
2. выбрать `guest-testimony-card`;
3. убедиться, что слева виден компактный placeholder Хинаты, справа identity/testimony card;
4. оба блока находятся внутри направляющих и не залезают под dialogue/header;
5. placeholder явно выглядит как временный QA shell, а не как попытка финального character art.

После merge ANM-028B3 следующий production task — **ANM-027G batch `4–6`**.
