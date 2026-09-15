# ANM-028B3 R1.2 — Guest / Witness Presentation Contract

Status: **production art integrated in R1.2 candidate; runtime/device visual QA required before merge**.

## Цель

Эпизодические свидетели существуют в VN как отдельный дешёвый presentation tier, не притворяясь
полноценными stage-персонажами и не раздувая строгий `upds-character-production-v2`.

ANM-027F фиксирует шесть guest packages: **Hinata, Gen, Aoi, Kubo, mother Kubo, Vincent**.
R1.2 переводит все шесть из временного asset-free состояния в production art, сохраняя существующий
runtime `guest-testimony-card` и весь narrative/staging contract.

## Machine-readable contract

Source of truth: `src/data/guestWitnesses.ts`, format **`upds-guest-witness-production-v1`**.

Каждый production guest package содержит ровно четыре runtime-изображения:

1. neutral bust / half-body master — `1024×1536` transparent PNG;
2. `serious` expression variant — `1024×1536` transparent PNG;
3. `smile` expression variant — `1024×1536` transparent PNG;
4. neutral medallion — `512×512` transparent PNG.

Canonical paths:

```text
public/assets/guests/<id>/neutral.png
public/assets/guests/<id>/expressions/serious.png
public/assets/guests/<id>/expressions/smile.png
public/assets/guests/<id>/medallion.png
```

Production expression routing остаётся bounded и character-package-local:

- `serious`: `serious`, `angry`, `stern`;
- `smile`: `smile`, `happy`, `warm`;
- любая другая direction использует neutral bust fallback.

Внешний production archive также содержит более широкий full-stage source set. Он **не является
runtime contract** и в репозиторий не импортируется: guest IDs не добавляются в
`src/data/characterProduction.ts`.

## Current production state

Все шесть macro-locked гостей имеют `status: production` и полный четырёхassetный package:

- `hinata` — first slot `5`;
- `gen` — `9`;
- `aoi` — `10`;
- `kubo` — `13`;
- `kubo-mother` — `14`;
- `vincent` — `16`.

Итого: **6 production packages / 24 runtime PNG / 0 planned fallback guests**.

Validator по-прежнему отклоняет:

- assets у `planned` guest;
- `production` без полного четырёхassetного package;
- дублированные/missing expression slots;
- production paths вне `./assets/guests/<id>/`;
- изменение locked guest set или `guest-testimony-card` runtime presentation.

## Runtime presentation

Shared renderer: `src/ui/guestWitnessMarkup.ts`.

Он всегда использует `guest-testimony-card` из `upds-scene-staging-v1`:

- слева — guest bust shell с production PNG;
- справа — testimony identity card;
- dialogue остаётся в обычном shared VN dialogue frame;
- direction-token match выбирает одну из двух expression variants;
- unmatched direction показывает neutral bust;
- initials placeholder остаётся только защитным fallback для будущего `planned` package и не должен
  появляться в shipped Story при текущем manifest.

`VnPresentation` не требует нового runtime lane: guest line по-прежнему не становится `CharacterKey`,
а resolved guest PNG автоматически входит в preload конкретной реплики.

## Scene Studio

`guest-testimony-card` использует тот же shared renderer. Hinata остаётся representative QA sample,
но теперь должна отображаться production-картинка из `./assets/guests/hinata/`, а не initials shell.

Это visual QA поверхности guest tier, а не разрешение превращать гостей в full-stage actors.

## Boundary с full-stage contract

R1.2 **не меняет**:

- `src/data/characterProduction.ts`;
- strict seven-asset full-stage rig;
- `CharacterKey` / `RuntimeExpression`;
- full-stage staging/proportion rules;
- `guest-testimony-card` scene preset.

Guest IDs запрещено добавлять в `upds-character-production-v2` только ради повторного использования
full-stage renderer.

## Automated acceptance

- exact six-key guest set и first-slot triggers совпадают с 027F;
- manifest validator возвращает zero issues;
- все 6 packages имеют `production` + ровно 4 canonical assets;
- runtime asset inventory включает все **24 guest PNG** и проверяет existence/image signature;
- speaker-token mapping остаётся детерминированным;
- shared renderer выдаёт `<img>` из `./assets/guests/<id>/`, а не initials placeholder;
- Scene Studio representative guest использует production art;
- существующие batch tests `7–9`, `10–12`, `13–15`, `16–18` ожидают production guest tier;
- GitHub `Quality gate` остаётся authoritative acceptance.

## Manual preview acceptance

Перед merge на `/preview/`:

1. открыть representative guest scenes для всех шести персонажей;
2. убедиться, что initials placeholders нигде не появляются;
3. проверить crop/scale/face readability внутри guest shell на iPhone portrait;
4. проверить отсутствие 404/decode flashing online и после повторной загрузки;
5. проверить хотя бы одну neutral fallback, одну `serious` и одну `smile` route;
6. подтвердить, что guest card/dialogue/header не перекрываются и не требуют per-character CSS fixes.

После device approval R0.3 можно считать закрытым, а guest art остаётся частью общего final asset/runtime
crawl ANM-033.
