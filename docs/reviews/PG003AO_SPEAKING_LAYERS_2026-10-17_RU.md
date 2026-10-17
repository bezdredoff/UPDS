# PG-003AO: слои говорящих персонажей

Общий статус **active**. Source CSS поднимает authored actor slot говорящего персонажа на один слой. Экспорт Godot сохранял только базовый zIndex, поэтому в VN0389 Onoe и Miku имели одинаковый native z=3, хотя source требует соответственно 4 и 3.

Все четыре пути экспорта authored shots теперь учитывают production `characterForSpeaker(line.speaker)`. PNG, тексты, story IDs и save schema не меняются. Native smoke проверяет фактические z_index обоих TextureRect и сохранение диалоговой карточки над говорящим персонажем.

## Прямые измерения

- [До исправления](speaking-layers-2026-10-17/before.json): source Onoe=4/Miku=3, native 3/3.
- [Матрица](speaking-layers-2026-10-17/matrix.json): **261/261 states** — все 29 многоперсонажных строк × RU/BE/EN × 320×568/390×844/480×854. Для каждого участника сверены actual DOM/native z, стабильный порядок отрисовки, asset и rect. Ошибок runtime/HTTP нет; максимальная rect delta 0.013774px.
- VN0389 RU 320×568: [Godot до](speaking-layers-2026-10-17/VN0389-before.png), [Godot после](speaking-layers-2026-10-17/VN0389-godot.png), [source](speaking-layers-2026-10-17/VN0389-web.png). Пары просмотрены; различия фона, шрифтов и paper/controls сохраняются. Whole-frame pixel parity не заявляется.
- Source digest изолированного Web export: `60d41ff103659ef1e6eb36c4462fd45953eda988137247e1a18e4896dbc6e462`; base `a80a1d8b2ef503c853998a69dbcf64ac84ca4c43` плюс этот срез.
- Полный npm check: **173 files / 849 tests**, audit/lint/build проходят. Полный Godot check, включая actual renderer layer smoke, проходит.

Воспроизведение после isolated export и preview server: `node e2e/tools/godot-core-portraits.mjs --chrome <chrome.exe> --web <source-url> --godot <capture-url>/godot --output <outside-repo-dir> --layers`.

Матрица использует reduced motion для устойчивого сравнения слоёв. Idle trajectory/preference evidence предыдущего среза остаётся отдельным. Backdrop/shadow compositing, typography/pagination, остальные screen/state/motion/device проверки остаются открытыми.
