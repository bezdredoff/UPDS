# Приложение: служебные QA-инструменты

| Ключ | Русский текст |
|---|---|
| levelLab.eyebrow | MATCH-3 · QA TOOL |
| levelLab.title | Level Lab |
| levelLab.heading | Лаборатория уровня |
| levelLab.copy | Воспроизводимый запуск текущего production-конфига. Выберите уровень и seed, проверьте стартовую доску и запустите именно эту раскладку. |
| levelLab.level | Уровень |
| levelLab.seed | Seed |
| levelLab.previewSeed | Обновить превью |
| levelLab.defaultSeed | Seed уровня |
| levelLab.valid | CONFIG VALID |
| levelLab.invalid | CONFIG INVALID |
| levelLab.validDetail | Текущий LevelDefinition проходит production-валидатор. |
| levelLab.moves | Ходы |
| levelLab.blockers | Преграды |
| levelLab.layers | слоёв |
| levelLab.ingredients | Ingredients |
| levelLab.objectives | Objectives |
| levelLab.initialBoard | СТАРТОВАЯ ДОСКА |
| levelLab.boardAria | Стартовая доска {level}, seed {seed} |
| levelLab.activeTiles | АКТИВНЫЕ MATCH-TYPES |
| levelLab.context | NARRATIVE / PRESENTATION CONTEXT |
| levelLab.playSeed | Играть seed {seed} |
| levelLab.noSaveSideEffects | Level Lab не меняет сюжетный прогресс, улики, attempts или tutorial state. |
| levelLab.backToLab | Назад в Level Lab |
| levelLab.runLabel | LEVEL LAB RUN |
| levelLab.resultEyebrow | REPRODUCIBLE RUN |
| levelLab.resultWin | Seed пройден |
| levelLab.resultLoss | Seed не пройден |
| levelLab.resultDetail | Seed {seed} · осталось ходов: {movesLeft}. Можно сразу повторить ту же доску. |
| levelLab.retrySameSeed | Повторить тот же seed |
| levelLab.blocker.locked | Замок |
| levelLab.blocker.solid | Преграда |
| levelLab.blocker.overlay | Накладка |
| levelLab.editorEyebrow | DRAFT CONFIG |
| levelLab.editorTitle | Редактирование уровня |
| levelLab.draftOnly | не пишет в production |
| levelLab.blockerType | Стиль преграды |
| levelLab.tileWeights | Активные фишки и spawn weights |
| levelLab.blockerPlacements | Blocker placements · JSON |
| levelLab.ingredientPlacements | Ingredient placements · JSON |
| levelLab.objectiveEditor | Objectives · JSON |
| levelLab.validatePreview | Проверить и применить draft |
| levelLab.resetDraft | Сбросить draft |
| levelLab.previewBlocked | Превью заблокировано: исправьте ошибки draft-конфига. |
| levelLab.exportEyebrow | VALIDATED EXPORT |
| levelLab.copyJson | Копировать JSON |
| levelLab.playDraft | Играть draft · seed {seed} |
| levelLab.boardHoles | Board holes · JSON индексы |
| levelLab.initialTiles | Фиксированные стартовые фишки · JSON |
| levelLab.boardShape | Форма доски |
| levelLab.activeCells | активных клеток |
| levelLab.holes | holes |
| sceneStudio.eyebrow | ANM-028D3 R1 · EMI SURPRISED QA |
| sceneStudio.title | Scene Studio |
| sceneStudio.heading | Runtime-кадр и калибровка |
| sceneStudio.copy | Сравнивайте старый runtime, утверждённые neutral/smile/serious Эми и новый surprised R1 в общем lineup и реальной VN-оболочке. Surprised-кандидат меняет только три малых face ROI, сохраняет точную геометрию master и не изменяет production manifest. |
| sceneStudio.mode | Режим QA |
| sceneStudio.mode.scene | Композиция |
| sceneStudio.mode.lineup | Общий lineup |
| sceneStudio.artSource | Источник арта |
| sceneStudio.artSource.runtime | Runtime fallback |
| sceneStudio.artSource.anm028d0-r1 | Эми neutral R1 · утверждён |
| sceneStudio.artSource.anm028d1-r1 | Эми smile R1 · утверждён |
| sceneStudio.artSource.anm028d2-r1 | Эми serious R1 · утверждён |
| sceneStudio.artSource.anm028d3-r1 | Эми surprised R1 · кандидат |
| sceneStudio.viewport | Viewport |
| sceneStudio.preset | Композиция |
| sceneStudio.background | Фон |
| sceneStudio.line | Реальная реплика |
| sceneStudio.textScale | Размер текста |
| sceneStudio.textScale.normal | Обычный |
| sceneStudio.textScale.large | Крупный |
| sceneStudio.guides.show | Показать направляющие |
| sceneStudio.guides.hide | Скрыть направляющие |
| sceneStudio.previous | ← Предыдущая |
| sceneStudio.next | Следующая → |
| sceneStudio.previewAria | Предпросмотр композиции Scene Studio |
| sceneStudio.previewLabel | RUNTIME COORDINATES |
| sceneStudio.validation.valid | КОНТРАКТ ВАЛИДЕН |
| sceneStudio.validation.invalid | КОНТРАКТ НАРУШЕН |
| sceneStudio.validation.review | НУЖЕН РУЧНОЙ ART REVIEW |
| sceneStudio.validation.counts | Ошибки: {errors} · предупреждения: {warnings} · ручные проверки: {manual} |
| sceneStudio.validation.detail | {count}/8 пресетов проходят safe-area, non-overlap и zero-new-art проверки. |
| sceneStudio.severity.error | Ошибка |
| sceneStudio.severity.warning | Внимание |
| sceneStudio.severity.manual | Вручную |
| sceneStudio.guide.fit | MASTER CONTAIN |
| sceneStudio.guide.actorZone | ACTOR ZONE · ESTIMATE |
| sceneStudio.guide.horizon | HORIZON · ESTIMATE |
| sceneStudio.guide.footline | FOOTLINE · ESTIMATE |
| sceneStudio.guide.focal | FOCAL |
| sceneStudio.guide.focalEyeLine | FOCAL EYE-LINE |
| sceneStudio.guide.frameAlpha | SELECTED FRAME ALPHA |
| sceneStudio.guide.eyes | EYES |
| sceneStudio.guide.safeArea | OS SAFE AREA |
| sceneStudio.role.primary | главная роль |
| sceneStudio.role.secondary | вторая роль |
| sceneStudio.role.tertiary | третья роль |
| sceneStudio.slot.actor | FACE SAFE LANE |
| sceneStudio.slot.native-evidence | NATIVE UI SAFE BOX |
| sceneStudio.slot.guest-shell | GUEST SHELL SAFE BOX |
| sceneStudio.slot.testimony-card | TESTIMONY SAFE BOX |
| sceneStudio.guestShell.label | 028B3 · БЕЗ ASSET PATH |
| sceneStudio.guestShell.title | Гость / свидетель |
| sceneStudio.evidence.label | УЛИКА · NATIVE UI |
| sceneStudio.evidence.title | Проводящая нить |
| sceneStudio.evidence.body | Ключевые данные собираются интерфейсом и локализуются как текст. Отдельный hero close-up не требуется. |
| sceneStudio.evidence.metricWidth | диаметр |
| sceneStudio.evidence.metricMaterial | состав |
| sceneStudio.testimony.label | ПОКАЗАНИЯ · NATIVE UI |
| sceneStudio.testimony.title | Карточка свидетеля |
| sceneStudio.testimony.body | ANM-028B3 активен: Хината использует отдельный asset-free guest package. Production bust позже заменит оболочку без превращения в full-stage персонажа. |
| sceneStudio.testimony.status | PLANNED · ASSET-FREE |
| sceneStudio.testimony.emotion | СЕРЬЁЗНО |
| sceneStudio.lineup.eyebrow | CANONICAL MASTER QA |
| sceneStudio.lineup.title | Измерения нейтрального lineup |
| sceneStudio.lineup.metric | {ratio}% от Оноэ · нижний alpha-отступ {bottom}px · центр {center}px |
| sceneStudio.lineup.note | Одинаковый 1024×1536 canvas показывает реальные относительные размеры. Runtime scale не должен компенсировать неправильный master. Стиль, анатомия, взрослый визуальный возраст, палитра и свет принимаются вручную относительно Golden Sample. |
| sceneStudio.budget.eyebrow | SCENE BUDGET |
| sceneStudio.budget.title | Триггеры производства |
| sceneStudio.budget.actorSlots | Stage actors |
| sceneStudio.budget.guestShells | Guest shells |
| sceneStudio.budget.nativeUiSlots | Native UI |
| sceneStudio.budget.newArt | Новый runtime art |
| sceneStudio.budget.newBackgrounds | Новые background masters |
| sceneStudio.budget.heroCloseups | Hero close-ups |
| sceneStudio.budget.note | Preset budget остаётся zero-new-art для authored scenes. Эми R1 подключена только как Studio-кандидат и не считается runtime asset до ручного approval. |
| sceneStudio.report.eyebrow | AI / ART HANDOFF |
| sceneStudio.report.title | Структурированный QA-бриф |
| sceneStudio.report.copy | Скопировать JSON-бриф |
| sceneStudio.report.note | Бриф фиксирует выбранный runtime/candidate источник, точную геометрию, фон, актёров и открытые проверки. Он read-only и не изменяет screenplay, manifests или production assets. |
| sceneStudio.background.clubroom | Клуб · день |
| sceneStudio.background.lockerAthletics | Раздевалка · день |
| sceneStudio.background.kentaroApartment | Квартира Кэнтаро · вечер |
| sceneStudio.background.poolLocker | Бассейн · вечер |
| sceneStudio.background.norihiroApartment | Квартира Норихиро · ночь |
| sceneStudio.preset.solo-close.title | Крупный план |
| sceneStudio.preset.solo-close.summary | Один эмоциональный центр; preset-scale увеличивает кадр, не меняя канонический масштаб master-canvas персонажа. |
| sceneStudio.preset.solo-medium.title | Средний соло |
| sceneStudio.preset.solo-medium.summary | Базовый одиночный кадр для объяснения, реакции и повторного использования одной expression frame. |
| sceneStudio.preset.two-shot-conflict.title | Конфликтный диалог |
| sceneStudio.preset.two-shot-conflict.summary | Два крупных портрета делят отдельные безопасные зоны лица; нижняя часть намеренно уходит под dialogue card. |
| sceneStudio.preset.two-shot-alliance.title | Союз в одном кадре |
| sceneStudio.preset.two-shot-alliance.summary | Две более близкие роли создают ощущение команды без отдельного парного CG. |
| sceneStudio.preset.trio-central-speaker.title | Центральный говорящий |
| sceneStudio.preset.trio-central-speaker.summary | Главный говорящий расположен по центру; лица двух поддержек остаются читаемыми в собственных safe lanes. |
| sceneStudio.preset.trio-reaction.title | Реакция трио |
| sceneStudio.preset.trio-reaction.summary | Асимметричная реакция трёх персонажей создаёт вариативность сочетанием готовых expressions. |
| sceneStudio.preset.evidence-cutaway.title | Перебивка уликой |
| sceneStudio.preset.evidence-cutaway.summary | Информация подаётся локализуемым native UI; hero clue art остаётся нулевым по умолчанию. |
| sceneStudio.preset.guest-testimony-card.title | Карточка показаний |
| sceneStudio.preset.guest-testimony-card.summary | Предпросмотр границы guest/witness без фиктивных manifest paths; production renderer отложен до 028B3. |
