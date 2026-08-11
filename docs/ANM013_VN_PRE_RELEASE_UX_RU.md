# ANM-013 — VN Pre-release UX + Golden Sample Alignment

Версия: `0.13.0-anm013`.

## Визуальная опора

UI реализован нативно в HTML/CSS и сверялся с утверждённым `ANM-005_Golden_Sample_VN_2000s_Hybrid.png`: тёмно-индиговые top controls, CASE/LOG/MENU, кремовая диалоговая карточка с отдельной индиговой nameplate, крупный continue marker и нижний ряд SKIP/AUTO/SAVE/LOAD/CONFIG. Golden Sample не включён в runtime ZIP и не используется как готовый production asset.

Сохраняется единый контракт ANM-005: индиго/кремовый/коралловый/золото, серебристо-бирюзовый только для `Second Skin`, mobile-first 9:16 и существующие production персонажи `base + face overlay`.

## Функции

- `LOG` показывает уже прочитанные VN-реплики и текущую отображаемую строку.
- `SKIP` активен только для строки, которая уже была прочитана; он останавливается на первой непрочитанной строке и не перескакивает `CHOICE_00`.
- `AUTO` автоматически продвигает диалог; CONFIG меняет скорость AUTO в текущей сессии.
- CONFIG переключает обычный/крупный размер текста без изменения сценария.
- SAVE пишет отдельный ручной слот `${saveKey}:manual-v1`; LOAD восстанавливает его, не меняя основной campaign save key.
- Continue после выхода с уже показанного `VN0040` возвращает к `CHOICE_00`, а не заставляет повторно проходить checkpoint.
- Следующий фон и следующий production portrait получают приоритетный preload; глобальный preload остаётся fallback.
- Финальная runtime-сцена теперь включает `VN0246–VN0249`. `VN0250` остаётся authored optional teaser и в этой сборке не показывается.

## Защищённые контракты

- `src/content/ANM-003_Vertical_Slice_Screenplay.md` не изменён.
- Стабильные `VN...` IDs не изменены и не перенумерованы.
- `CHOICE_00` A/B/C не изменён.
- save key остаётся `seiran-detectives-anm009-v1`; schema остаётся v1, поэтому `/` и `/preview/` совместимы через общий localStorage.
- `src/data/levels.ts`, `src/engine/Match3Game.ts`, `src/data/characterRigs.ts` не меняют gameplay/art contracts.
- `.github/workflows/*` и `scripts/validate-upload-zip.py` должны побайтно совпадать с текущим `main`.

## Ручной QA на iPhone

1. `/preview/` → Новая игра → проверить CASE/LOG/MENU, cream dialogue card и нижний control rail.
2. На непрочитанной строке SKIP disabled; после возврата к уже прочитанной строке SKIP работает и останавливается на непрочитанной.
3. Включить AUTO, проверить продвижение; открыть CONFIG и проверить slow/normal/fast.
4. Проверить normal/large text на 390×844 и минимум 320×568.
5. Открыть LOG после нескольких реплик; порядок и line IDs должны соответствовать прочитанному.
6. На `VN0040` открыть choice, затем выйти в меню до выбора; Continue должен вернуть `CHOICE_00`.
7. SAVE → перейти на следующую строку → LOAD; позиция должна вернуться к ручному слоту, несмотря на обновившийся autosave.
8. Проверить dossier → обратно; VN controls остаются рабочими.
9. Через QA navigation открыть финальную сцену и дойти до `VN0246`, `VN0247`, `VN0248`, `VN0249`; после неё показывается chapter-complete ending. `VN0250` не должен появляться.
10. Проверить portrait animation и face overlay на Мику/Оноэ/Аюки; placeholders Эми/Маю/Кэнтаро/Норихиро остаются намеренными.
11. Включить iOS Reduced Motion и убедиться, что UI остаётся читаемым и не зависит от анимаций.
