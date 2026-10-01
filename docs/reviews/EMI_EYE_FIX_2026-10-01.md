# G4a-EMI — исправление зрачка и локальная интеграция

2026-10-01 пользователь исправил портрет Эми в GIMP и полный neutral frame,
из которого вырезан портрет; затем явно запросил интеграцию обоих PNG.
Статус: **review / runtime integrated locally**, не device accepted.

## Два заменённых ресурса

- `public/assets/characters/emi/rig/pose_a/frames/frame-neutral.png`:
  SHA-256 `c09c156dac510b68f88443fac05508ea08b5c390c4bbfe6fadfef00095cbd71c`.
- `public/assets/characters/emi/medallions/portrait_neutral_512.png`:
  SHA-256 `b3cf31f78e595e2a783ecb56cdee981aad701bb50e6e34f1a6b6b7a322176fbb`.

Исходные пользовательские PNG и XCF сохранены в `C:/git/UPDS-art-work/emi/`.
Большой PNG экспортирован пользователем в `ready/.../medallions/frame-neutral.png`;
при интеграции сопоставлен с правильным runtime path `rig/pose_a/frames/`.
Другие четыре эмоции Эми и Pose B не менялись; остальные персонажи не менялись.
Backup прежних двух PNG: `output/art-review/emi-integration-20261001/backup/`.

## Проверка экспорта

Первый экспорт был сдвинут на 8 px влево. Пользователь исправил сдвиг в GIMP;
проверенный финальный neutral имеет исходные alpha bounds `(272,28)-(751,1512)`,
canvas 1024×1536 RGBA, alpha-height 1484 px. Масштаб/pivot/eye-line не менялись.
Портрет сохранил 512×512 RGBA и исходные alpha bounds `(61,0)-(500,512)`.

Сравнение decoded pixels (игнорируя RGB полностью прозрачных pixels):

- Neutral: 772 видимых изменённых pixels, bbox `(507,208)-(622,318)` — область лица;
  282 изменения alpha внутри этой области. Видимые pixels вне этой области совпадают.
- Портрет: 502 изменённых pixels, bbox `(250,182)-(280,202)` — исправленный глаз;
  alpha совпадает полностью.

Отличия скрытого RGB в прозрачных pixels после экспорта GIMP не являются изменением
видимого тела/силуэта. Геометрия всех пяти эмоций проверяется character audit.
Digest нового пакета Эми:
`7db7b0728d619aa62d17b2d82000801446cb4c942a049ca2e77c73b7d5d5bca7`.
Digest всех 63 runtime assets:
`980d68f322f8d3e8767f95a73e92ba4b750ee974851c49b34d8fef064f1d37cd`.

## Gate и дальнейшие действия

Проверить character/assets/docs audit, lint/typecheck, сборку и GitHub Browser Gate.
При изменении строгого lineup digest использовать только проверенный Linux/WebKit
attachment; не заменять его Windows snapshot и не отключать сравнение.
После merge/deploy вручную проверить портрет и neutral в сцене, переключение эмоций.
G4a остаётся active. Исходный review JSON и оценки старых hash не переписываются.
Из остальных групп следующий ограниченный пакет — Мику: одинаковая alpha-чистка
во всех пяти эмоциях, Pose B и портрете; отдельно исправить surprised.
