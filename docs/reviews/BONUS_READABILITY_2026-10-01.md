# G4a-BONUS-READABILITY — три бонуса Match-3

Статус: изображения явно утверждены пользователем и интегрированы локально
2026-10-01. Публикация запрошена; merge/deploy и финальная телефонная проверка
ещё не подтверждены. G4a/KI-005 остаются открыты.
База: merged Рина #319, `4223b6eec0007f531451feb5aad73eeaf8036815`.

## Решение и границы

Пользователь принял evidence v1; две камеры со стрелками v1 отклонил.
Разряды v2 заменены после обсуждения: предметы должны нормально заполнять
квадрат, а не вытягиваться по направлению эффекта. Итоговая пара v3 —
фонарик flash-row и компактная сигнальная ракета flash-column — явно принята;
пользователь запросил замену в игре, затем отдельную публикацию на GitHub.

Заменены только `public/assets/match3/specials/flash-row.png`,
`flash-column.png`, `evidence.png`: v3/v3/v1 соответственно, 256×256 RGBA.
Lead/insight, SVG fallback, IDs, названия, правила создания/активации неизменны.
Один renderer обслуживает поле и Help; добавлены отдельные неинтерактивные
aria-hidden метки ↔/↕. Три новых значка используют 100% клетки вместо 128%,
без поворота и вытягивания. Масштаб остальных двух бонусов не меняется.

## Воспроизводимость и проверка

Навык imagegen: built-in image_gen, не ComfyUI. Evidence — reference edit;
два предмета v3 — новые изображения без references. Пропорции и alpha
сохранены при механическом экспорте до 256×256.
Принятые hashes, prompts, preview и mobile WebKit screenshot:
`docs/art/bonus-readability-2026-10-01/`.
Локальные masters/экспорт и исходные runtime backups:
`output/art-review/bonuses-v1/`, `output/art-review/bonuses-v3/`;
рабочая копия `C:/git/UPDS-art-work/bonuses/readability-v3/`.
Эти локальные authoring-каталоги не являются обязательной runtime-зависимостью.

`tests/Match3BonusReadability.test.ts`: 6 проверок hashes всех пяти PNG,
прозрачности, размера, сохранения lead/insight и общих board/Help markers.
Существующие hash baselines трёх заменённых PNG обновлены по явной приёмке.
Local gate: 152 files / 758 tests, lint, TypeScript и production build passed.
Browser checks passed: Chromium и mobile WebKit, 4/4 — загрузка всех пяти PNG,
две метки в границах Help, отсутствие сдвига поля и создание/активация flash-row.
Mobile WebKit screenshot визуально просмотрен. Это не реальный телефон.
SVG fallback и все механики проверяются существующими контрактами без изменения правил.

## Перед merge и финальной приёмкой

Дождаться GitHub Quality и Browser Gate. После merge проверить обновлённую
PWA на телефоне: поле, Help, активации row/column/evidence и читаемость меток.
Не закрывать G4a/KI-005 только по изображению, генерации или автоматическим тестам.
