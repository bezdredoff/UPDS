# ANM-028B2 R1.1 — Authored VN Shot Adoption

Status: **candidate / iPhone QA required**.  
Baseline: `main` commit `e0e41549332db939f94c4df104965cd2de0d542f` (ANM-027F R1 / PR #102).

## Зачем этот slice нужен перед ANM-027G

ANM-028B1 уже доказал правильную геометрию `solo/duo/trio` в Scene Studio, но playable VN всё ещё
показывал только активного говорящего и вычислял `left/right/center` эвристикой. ANM-027F теперь
фиксирует staging presets для будущих эпизодов, поэтому detailed screenplay нельзя начинать с
двумя различными постановочными системами.

ANM-028B2 R1 вводит один источник authored shot metadata для реальной VN и Studio, не пытаясь
одновременно переставить все 250+ существующих строк.

## Новый contract

`src/data/authoredVnShots.ts` задаёт `upds-authored-vn-shots-v1`.

Каждый authored shot привязан к **stable VN line ID** и содержит:

- background key;
- один из уже утверждённых `upds-scene-staging-v1` preset IDs;
- ordered actor assignments — порядок соответствует actor roles preset;
- expression для каждого актёра;
- явный `pose-a` / `pose-b`, если нужен Pose B.

B2 сознательно разрешает только actor-only presets. `guest-testimony-card` и guest assets остаются
границей **ANM-028B3** и не получают фиктивных character paths.

## Bounded runtime adoption

R1 переводит на authored resolver пять уже написанных Golden Sample строк ANM-003:

| Line | Preset | Цель |
| --- | --- | --- |
| `VN0008` | `trio-central-speaker` | первое вступление Мику в разговор троицы |
| `VN0013` | `trio-reaction` | реакция Мику на мгновенное голосование |
| `VN0026` | `two-shot-conflict` | серьёзный interviewer + смущённая Эми |
| `VN0034` | `two-shot-alliance` | эмпатичный разговор Мику и Эми |
| `VN0038` | `two-shot-alliance` | реальный authored Pose B Аюки с телефоном |

Все остальные строки продолжают использовать старый стабильный `resolveVnStaging()` fallback.
Так visual QA может сравнить две системы внутри одной и той же существующей главы без массовой
регрессии.

## Runtime parity

`src/ui/vnAuthoredShots.ts` использует **тот же** `resolveSceneStagingPreset()` что Scene Studio.
Playable VN поэтому получает те же:

- actor X/role/order;
- shot scale;
- focal-eye-line anchor для duo/trio;
- frame geometry и approved Emi runtime overrides;
- canonical character scale;
- Pose B paths.

Scene Studio line selector теперь также содержит B2 Golden Sample lines. При выборе authored line
Studio автоматически блокируется на её background/preset и `runtime` art source, поэтому QA видит
точно ту же постановочную декларацию, а не похожий вручную собранный sample.

## Runtime asset boundary

B2 не меняет `runtimeAssetCatalog` и не повышает статус Emi candidate frames. ANM-028D3A уже
использует D0–D3 через явный `upds-character-runtime-override-v1`, но их candidate metadata остаётся
`runtimeEligible: false`, а strict seven-asset replacement ещё не завершён. Поэтому эти PNG намеренно
остаются вне `RuntimeAssets` до отдельной атомарной promotion/integration фичи полного набора.

## Automated gate

Новые/расширенные тесты проверяют:

1. manifest валиден, line IDs существуют в canonical ANM-003 content;
2. говорящий production character всегда присутствует в authored shot;
3. actor count совпадает с preset actor slots;
4. trio/duo используют общий focal-eye-line resolver;
5. `VN0038` реально использует Pose B;
6. unlisted line возвращается к legacy staging;
7. Scene Studio authored-line preview использует runtime source и нужный preset;
8. B2 не добавляет incomplete Emi candidate family в `runtimeAssetCatalog`.

## iPhone QA

На `/preview/` пройти начало новой игры до выбора `CHOICE_00` и проверить пять B2 строк:

1. `VN0008` — Мику по центру, Оноэ/Аюки по бокам; лица не перекрываются и не упираются в верх;
2. `VN0013` — trio reaction сохраняет общую eye-line и читаемую Мику;
3. `VN0026` — Оноэ и Эми находятся одновременно в кадре; Эми использует старый embarrassed fallback;
4. `VN0034` — Мику/Эми читаются как спокойный two-shot;
5. `VN0038` — у Аюки действительно Pose B с телефоном, Эми остаётся вторым актёром;
6. между этими строками обычные single-speaker строки не должны изменить старое поведение;
7. открыть Scene Studio и выбрать одну из B2 line IDs — preset/background/runtime source должны
   автоматически соответствовать authored shot.

Особенно проверить iPhone portrait viewport: dialogue card по-прежнему закрывает нижнюю часть
мастеров, головы имеют запас сверху, duo/trio не превращаются обратно в маленьких персонажей в полный
рост.

## Что не входит

- guest/witness renderer и Hinata — **ANM-028B3**;
- массовая перестановка всех ANM-003 lines;
- screenplay `4–6` — **ANM-027G после B3**;
- новый character/background art;
- safe-motion расширение ANM-028C.
