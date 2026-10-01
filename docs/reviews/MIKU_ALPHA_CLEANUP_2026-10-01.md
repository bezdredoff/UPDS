# G4a-MIKU-ALPHA — согласованная очистка Мику

Дата: 2026-10-01. Статус: review; интегрировано локально, подготовлено к отдельному PR.
Публикация запрошена пользователем. PR строится поверх исправленного G4a-EMI
(#315), чтобы сохранять последовательность: сначала Эми, затем Мику.
После merge #315 базу нового PR следует переключить на main.
Пользователь просмотрел результат на белом, сером и тёмном фоне и явно
подтвердил: «ок. мне нравится. давай использовать их».

## Принятый пакет

Источник: `C:/git/UPDS-art-work/miku/mask-cleanup-v1/candidate/`.
Маски, проверка `qa.json`, инструкции и preview сохранены рядом; архив:
`C:/git/UPDS-art-work/miku/MIKU_ALPHA_CLEANUP_V1.zip`.
Исторический candidate manifest не переписывается при интеграции.

Заменены только семь существующих runtime PNG в `public/assets/characters/miku/`:

- `rig/pose_a/frames/frame-neutral.png`
- `rig/pose_a/frames/frame-smile.png`
- `rig/pose_a/frames/frame-serious.png`
- `rig/pose_a/frames/frame-surprised.png`
- `rig/pose_a/frames/frame-embarrassed.png`
- `poses/pose_b_pointing_sketchbook.png`
- `medallions/portrait_neutral_256.png`

До копирования SHA256 всех исходников и кандидатов сверены с `qa.json`;
после копирования подтверждено совпадение всех семи runtime файлов с кандидатом.
Старые runtime PNG сохранены в
`output/art-review/miku-alpha-integration-20261001/backup/public/assets/characters/miku/`.
Пользовательские GIMP/XCF, ready и originals не изменены.

## Границы правки

Детерминированные маски меняют только alpha, без генерации и перерисовки.
У каждого PNG все декодированные RGB сохранены, включая скрытые прозрачные пиксели.
Нет изменений alpha вне масок и на тёплых участках кожи. Одна общая маска применена
к пяти Pose A frames; это не утверждение об идентичности исходной alpha разных эмоций.

| Группа | Размер | Alpha bounds (right/bottom exclusive) | Изменённые alpha-пиксели на PNG |
| --- | --- | --- | --- |
| Pose A, пять эмоций | 1024×1536 | 279,47 → 744,1415 | 2664 |
| Pose B | 1024×1536 | 257,47 → 766,1414 | 2164 |
| Портрет | 256×256 | 0,0 → 224,256 | 813 |

Bounds, camera, pivot, scale и eye-line не менялись; runtime manifest не требует правки.
Медальон использует существующий путь, новые UI/слои не добавляются.

Miku seven-asset digest:
`e83a0a7024c68e8ccc4f7d02a58ef02011f8665e973dea160343db2cffd68e7c`.
Локальный 63-asset digest (включая ранее интегрированные Mayu v7 и Emi eye fix):
`ddd90726a16eaed903a5cfd314b30f653327d9713ee2b28e8b3aae2ed1b9477b`.
Остальные восемь character digests не меняются этой правкой.

## Проверки и оставшаяся работа

Локальные проверки выполнены успешно 2026-10-01:

- `character:audit`: 6 тестов, включая геометрию и все package digests.
- `assets:audit`: 63 основных character assets, 24 guest PNG; path/decode errors 0.
- `docs:audit`: 11 тестов.
- `check:fast`: lint и TypeScript без ошибок.
- Полный Vitest: 148 файлов, 726 тестов пройдены.
- Production build успешно; прежнее предупреждение bundle >500 kB остаётся.
- Проверка whitespace затронутых tracked текстовых файлов без ошибок.

GitHub CI этого пакета ещё ожидается. Не менять Linux WebKit visual baseline без
просмотра соответствующего CI attachment.

### Публикация и проверенные Linux эталоны

Создан зависимый PR #316, base `local-ai/emi-eye-fix` (#315).
Quality gate run 36865569827 passed. В Browser Gate 36865572790 Chromium passed;
WebKit: 31 passed, два устаревших эталона — trio VN0008 и общий lineup.
Скачаны и визуально просмотрены actual/diff trio и full-cast-lineup из Linux CI.
Trio diff показывает согласованную очистку возле шеи Мику и небольшие различия
растрирования текста; композиция, остальные персонажи и UI layout сохранены.
Обе попытки trio совпадают по SHA256:
`51b15bd3afece04adfe651a5694c8f77f7d7f5c901966fd2485395a97839f4db`.
В качестве нового Linux snapshot скопирован именно проверенный CI actual PNG,
не Windows snapshot. Обе попытки lineup дали SHA256
`871780933cb460a3be6ca9785c70577f7d2ba4250cf5eedd3173fdde561cb6f5`;
он становится новым fullCastLineupDigest. Assertion и maxDiffPixelRatio не меняются.
После исправления требуется повторный Browser Gate; не считать первоначальный run успешным.

Пользователь принял очистку, а не новое выражение лица: `surprised` сохраняет
старую эмоцию и остаётся отдельным замечанием ревью. G4a и KI-005 не закрываются;
исторический JSON ревью не переписывается. Нужен финальный просмотр всех пяти
эмоций, Pose B и медальона в игре на светлом/тёмном фоне и телефоне.
