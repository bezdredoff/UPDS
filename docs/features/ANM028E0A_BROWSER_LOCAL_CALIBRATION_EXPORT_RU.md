# ANM-028E0A — Browser-local calibration & JSON export

## Зачем

Первый Visual Override Lab уже ускорил замену PNG без веток и CI, но финальная доводка
всё ещё требовала ручной работы в production-контрактах:

- eye-line нужно было потом переносить отдельно;
- bottom pivot приходилось вспоминать по заметкам;
- масштаб героя и вертикальную посадку в кадре нельзя было быстро покрутить прямо в Studio;
- после удачного локального теста не было готового машиночитаемого слепка для production import.

ANM-028E0A закрывает этот пробел.

## Что добавлено

### 1. Manual calibration прямо в Scene Studio

Для каждого героя, у которого есть browser-local overrides, теперь доступны слайдеры:

- **Eye-line** — смещение landmark глаз по master canvas;
- **Bottom pivot** — смещение нижней точки видимого силуэта;
- **Scale** — production-compatible staging scale;
- **Frame Y** — production-compatible vertical staging offset.

Калибровка применяется сразу во всех runtime местах, где уже работает browser-local override:
VN, authored shots, Scene Studio, QA navigation, Match-3 shell и medallion usage.

### 2. Export JSON snapshot

Lab строит JSON-снимок с уже разрешёнными итоговыми значениями:

- итоговая geometry для Pose A / Pose B;
- staging scale и `yPercent`;
- production asset paths, которые подменялись локально;
- package label текущего ZIP (если он известен).

Это позволяет взять выигравший локальный вариант и уже потом спокойно перенести его
в production PR без повторной калибровки «на глаз».

### 3. Character-level reset

Можно сбросить тюнинг отдельно для конкретного героя, не трогая остальные локальные подмены.

## Что намеренно не меняется

- Никакие production manifests не пишутся автоматически.
- GitHub / CI workflow остаётся единственным authoritative путём для merge.
- JSON snapshot — это инструмент переноса решения, а не скрытая запись в репозиторий.

## Итого

Теперь lab покрывает уже не только быстрый просмотр новых PNG, но и полноценную
локальную доводку визуала с сохранением machine-readable результата для следующего
production шага.
