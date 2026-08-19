# ANM-028E0 — Character Visual Override Lab

## Зачем

Во время длительного перебора визуала героев основной friction был не в самой замене PNG,
а в полном production-процессе вокруг неё:

- новая ветка или новый ZIP только ради картинок;
- обязательный CI даже для чисто локального визуального просмотра;
- ручная замена ассетов в репозитории и риск случайно закоммитить временные файлы;
- необходимость править runtime manifest/geometry, хотя на этапе отбора нужно просто быстро увидеть,
  как новый арт выглядит в VN, Scene Studio, QA navigation и Match-3 shell.

ANM-028E0 решает это через **browser-local override lab**: подмена остаётся только в текущем
браузере/вкладке и не меняет production baseline.

## Что входит

### 1. Browser-local ZIP import в Scene Studio

Scene Studio получает новый блок **Local character overrides**:

- загрузка `.zip`;
- reset локальных подмен;
- статус загрузки и список активных override-ассетов;
- список warnings по несовместимым файлам.

Ожидается ZIP, содержащий прямые production replacement paths вроде:

- `public/assets/characters/<hero>/rig/pose_a/frames/*.png`
- `public/assets/characters/<hero>/poses/*.png`
- `public/assets/characters/<hero>/medallions/*.png`

## 2. Автоматическое измерение geometry

Для Pose A и Pose B браузер:

- декодирует PNG;
- измеряет alpha bounds;
- автоматически строит временную runtime geometry;
- сохраняет eye-line через смещение от approved production reference.

Это значит, что для локального QA не нужно каждый раз вручную редактировать
`characterProduction`/`characterRuntimeOverrides`, если задача — просто посмотреть
новый вариант в реальной сцене.

## 3. Override scope

Локальные overrides перекрывают runtime assets во всём приложении в рамках текущей browser session:

- VN portrait frames;
- authored VN shots;
- Scene Studio;
- Pose B usage;
- medallions в menu / Match-3 shell.

Production files, manifests, CI и Git history при этом не меняются.

## 4. Reset model

Подмены:

- не пишутся в репозиторий;
- не влияют на production preview;
- очищаются через explicit reset в Scene Studio;
- рассматриваются как временный browser-only instrumentation layer.

## Технический контракт

Runtime получает дополнительный mutable слой поверх существующих approved overrides:

1. **browser-local override**
2. **approved runtime override** (`ANM-028D3A`)
3. **base production asset**

Такой priority order позволяет:

- не ломать уже принятые runtime replacement rules;
- быстро временно перекрывать их новым локальным визуалом;
- безопасно возвращаться к approved baseline одним reset.

## Почему это лучше отдельной ветки без тестов

Отключённая test-ветка действительно ускоряет цикл, но создаёт сразу несколько рисков:

- временные правки легко смешиваются с production работой;
- сложно понять, какие картинки были «локальным экспериментом», а какие уже должны идти в PR;
- случайный merge может протащить неутверждённый арт;
- всё равно остаётся необходимость физически заменять файлы в дереве проекта.

ANM-028E0 оставляет быстрый цикл, но изолирует его от production baseline.

## Рекомендованный workflow

1. Открыть **Scene Studio**.
2. Загрузить ZIP с replacement PNG.
3. Проверить solo / duo / trio / authored shots / lineup.
4. При необходимости выйти в QA-navigation или основной runtime — локальные подмены уже активны.
5. После выбора победившего варианта:
   - либо сбросить override,
   - либо отдельно оформить production import как normal PR / ZIP candidate.

## Browser Gate compatibility note

PR QA для R1.2 выявил не связанную с Visual Lab нестабильность Mobile WebKit: после G8E1 локальный `build.json` update probe может выдавать тот же WebKit access-control diagnostic, который G7A уже узко игнорировал для `sw.js`. R1.3 расширяет существующий localhost-only browser-health exception на `build.json`; Chromium и production network-error handling не меняются.

## Result

Feature gives a fast, low-risk visual iteration loop for character art while preserving the existing
mobile ZIP → GitHub CI → preview → merge workflow as the only authoritative production path.
