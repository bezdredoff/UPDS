# PG-003AO: ширина настроек и локализация

После исправления меню полная screen matrix выявила реальный дефект:
BE settings при `320×568` требовали 400 px и обрезались справа.
Непереносимый заголовок установки имел минимум 360 px плюс 40 px полей;
тексты переключателей и PWA-карточки также навязывали ширину родителям.

## Изменения

- Разрешён перенос section headings, toggle captions/help и hosted status.
  ScrollContainer больше не получает минимальную ширину, превышающую телефон.
- Language media query использует ширину окна, как production CSS, вместо
  растянутого логического Godot viewport.
- Белорусский eyebrow совпадает с каталогом: `НАЛАДЫ · СІСТЭМА`.
- Ручка HSlider задана через texture icon: прежний StyleBox override игнорировался
  движком. Сохранены диапазон, шаг, значения и обработчики сохранения/preview.

## Проверка и ограничения

`audio_smoke.gd` проверяет минимальную и фактическую ширину настроек для RU/BE/EN
при 320/390/430 px, локализованный eyebrow, реальный slider icon и существующие
контракты persist/reload, mute, preview, focus и ошибок сохранения.
`settings_smoke.gd` сверяет responsive columns с физической шириной окна.

Web capture runner дополнен `--enforce-settings`: проверяет ширину root и каждого
видимого дочернего контрола относительно source phone, включая элементы ниже
границы scroll viewport; сравнивает eyebrow и запрещает runtime/HTTP errors.

В [summary](settings-width-2026-10-17/summary.json) зафиксированы девять release-Web
пар: RU/BE/EN × 320×568, 390×844, 480×854. Для всех отсутствуют ошибки выполнения
и переполнение. Per-case JSON содержит digest исходников экспорта.

Это закрывает дефект ширины, а не весь settings parity: метрики шрифтов,
вертикальный ритм, narrow padding, toggle whole-card input, platform capabilities
и PWA lifecycle ещё требуют отдельных сравнений. Значения 32%/72% совпадают с
source defaults; прежняя обрезка скрывала правый край и значения на узком экране.
PG-003AO остаётся active.
