# PG-003AO — визуальный и поведенческий паритет Godot-порта

**Статус:** active. Начальный layout-срез находится в текущей рабочей ветке и не означает принятия общего паритета.

## Цель

Перенести в Godot законченную игру так, чтобы существующие игровые экраны, состояния, art assets, типографика, цвета, компоновка, переходы и анимации выглядели и вели себя как исходный web runtime. Новые игровые механики и художественные системы не добавляются.

Проверка сравнивает одинаковые RU/BE/EN состояния при одной ширине и высоте viewport, одинаковом содержимом и явно заданном времени после действия. Статический screenshot подтверждает только визуальное состояние в конкретный момент. Отдельно проверяются интерактивные последовательности и временные эффекты.

## Критерии приёмки

- Главное меню, VN, choice, dossier/history, campaign, Match-3 intro/board/result, evidence и endings сопоставлены по тем же screen states.
- Сохраняются композиция и допустимые safe areas, пропорции/обрезка фонов и персонажей, размеры текста, переносы, цвета, рамки, иконки и состояния кнопок.
- Реализовано поведение существующих контролов: VN advance/paging, skip/auto/history/dossier/save/load, выборы, Match-3 drag/tap/swap/reject/clear/cascade/hint/special, campaign progression, settings, retry/evidence/ending routes.
- Перенесены все уже существующие эффекты движения и обратной связи, включая персонажный idle, VN page/choice/clue feedback и Match-3 swap, reject, clear, settle/spawn, reshuffle, hint и blocker feedback.
- Сравнение animation samples выполняется в одинаковые моменты и проверяет reduced-motion preference там, где она поддерживается исходной игрой.
- Godot native/Web smoke подтверждают интерактивность, screenshot reviews подтверждают внешний вид; одно не заменяет другое.

## Последовательность

1. Общая phone-frame геометрия и главное меню.
2. VN art staging, header/dialogue/control chrome, все reading controls, page transitions, idle и choice/dossier/history feedback.
3. Campaign hub, level intro, Match-3 HUD/board geometry, tile/blocker/special states и все board animations.
4. Shared dialogs, settings, save/load/error states, evidence transitions и endings.
5. Сквозная матрица одинаковых web/Godot screenshots и input sequences; исправить различия до внешней Playgama visual review.

## Начальный layout-срез

- Зафиксирована единая максимальная ширина player-facing screens `430 px`, соответствующая `.phone` в исходном CSS. VN, Match-3, campaign и settings применяют общую resize-aware рамку.
- Главное меню сохраняет 28 px боковые поля внутри phone frame; медальоны стоят после заголовка вместо нижнего края свободного spacer. Для wash использована вертикальная текстура 1024 px, чтобы устранить banding при масштабе до высоты экрана.
- Меню использует системный sans-serif fallback stack и Georgia-compatible serif для заголовка.
- В VN приведены к общему phone frame верхняя панель, карточка реплики и имя/эмоция персонажа. Короткая stage-полоса больше не обрезает 1024×1536 master frames: персонажи продолжаются под dialogue layer. Перенесено уже существующее 2.8-секундное idle-breathe движение.
- Smoke tests проверяют ширину phone frame, ширину menu content, положение медальонов, разрешение wash, VN frame width, открытый actor overflow и движение портрета.

## Оставшиеся известные различия

Это начало, не завершённый порт стилей. В VN ещё отсутствует production-панель нижних reading controls и исходная paging/auto/skip/history/dossier/save/load семантика; Match-3 клетки пока не анимируются при swap/clear/fall, а отдельные campaign/result/evidence/dialog screens ещё требуют сравнения и выравнивания. Источник поведения и внешнего вида — текущая исходная web-игра, а не прежние Godot screenshots.
