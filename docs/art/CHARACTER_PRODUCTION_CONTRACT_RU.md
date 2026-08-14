# UPDS — Character Production Contract 2.0

## Source of truth

Machine-readable source of truth: `src/data/characterProduction.ts` (`upds-character-production-v2`).
`docs/art/CHARACTER_USAGE_MANIFEST.json` — человекочитаемое зеркало для production planning и обязано совпадать с canonical manifest через CI.

Новые персонажи должны совпадать с утверждённым `2000s Hybrid` и текущим одобренным сравнительным
набором Miku/Onoe/Ayuki. Emi технически интегрирована, но после R3 lineup QA имеет
`visualApproval: rebuild-required` и не является style/full-body reference:
чистый контур, простые формы, почти плоский cel shading, минимум бликов/градиентов/мелких деталей,
взрослые college-age пропорции и отсутствие современного glossy-gacha рендера.
Все персонажи, входящие в production manifest, явно маркируются как взрослые; для новых персонажей с известным возрастом возраст должен быть 18+.

## Scope boundary

Этот строгий контракт относится только к полноценным stage-персонажам, которых VN может ставить в
solo/two-shot/trio сцену как самостоятельные full-body assets. Product budget и правила выбора
stage/guest/extras зафиксированы в `docs/content/CONTENT_PRODUCTION_STRATEGY_RU.md`.

Планируемый guest/witness package (один bust/half-body master, две эмоции и neutral medallion) —
отдельный presentation/asset class. До появления его schema, renderer и validator такие персонажи
не добавляются в `upds-character-production-v2`, а отсутствующие full-stage assets не заменяются
фиктивными paths.

## Runtime asset set

Production runtime использует только готовые precomposed изображения. Layered face overlays не являются production runtime contract и не должны возвращаться.

Каждый production-персонаж получает ровно семь обязательных runtime assets:

1. `frame-neutral.png`
2. `frame-smile.png`
3. `frame-serious.png`
4. `frame-surprised.png`
5. `frame-embarrassed.png`
6. один утверждённый Pose B PNG
7. один neutral medallion PNG

Пять Pose A expression frames и Pose B:
- 1024×1536 RGBA PNG;
- общий pivot `(0.5, 1.0)`;
- одинаковый virtual camera contract;
- expression switch не меняет body/camera/scale/y.

Medallion — квадратный PNG. Допустимый production source сейчас 256×256 или 512×512; UI-size задаётся layout, а не intrinsic resolution.

## Canonical character height / proportions

Общий canvas **не означает одинаковый рост**. Рост и пропорции персонажа должны быть художественно зашиты в его master внутри общего 1024×1536 canvas; production runtime не должен выравнивать разных персонажей случайным CSS zoom.

Canonical measurements для Pose A: высота непрозрачного subject alpha-bounds и вручную
зафиксированная `neutralEyeLineYPx` в `frame-neutral.png` до runtime staging. Для Scene Studio
каждый выбранный expression дополнительно имеет `frameGeometry[expression]`: фактические alpha
bounds этого PNG и его `eyeLineYPx`. Neutral geometry обязана совпадать с canonical neutral полями.

Текущий runtime-integrated visual-height baseline:
- Miku: 1375 px;
- Onoe: 1484 px — reference 100%;
- Ayuki: 1462 px;
- Emi: 1444 px.

Относительно Onoe это примерно:
- Miku 92.7%;
- Ayuki 98.5%;
- Emi 97.3%.

Эти значения не объявляются физическим ростом в сантиметрах и сами по себе не доказывают полный
силуэт или visual approval. Emi показывает известный false positive: alpha-height `1444 px`
измеряет голову до обрезанного нижнего края, хотя фигура заканчивается на бёдрах. Если позже
story/art bible задаст рост в сантиметрах, итоговая экранная пропорция всё равно должна пройти общий
lineup QA.

Правила:
- production `staging.scale` по умолчанию равен `1`;
- нельзя исправлять неправильно нарисованный рост персонажа runtime zoom-ом;
- все пять expression frames сохраняют canonical visual height с допуском 1 px;
- новый персонаж не может перейти из `planned` в `production`, пока neutral master не утверждён в side-by-side lineup с production cast и его canonical alpha-bounds/visual height не внесены в manifest;
- runtime `production` и manual `visualApproval` — разные оси: `rebuild-required` asset остаётся
  fallback для совместимости, но не может быть источником стиля или базой новых expressions;
- каждый `frameGeometry[expression].eyeLineYPx` должен проходить через глаза соответствующего
  precomposed кадра и используется только для композиционной камеры/guide, а не для изменения
  canonical роста;
- 028B Character/Scene Studio должен иметь lineup/proportion preview с общей baseline/camera.

Vertical offset (`yPercent`) служит staging-композиции и не меняет канонический рост персонажа.

## Expression fidelity

`neutral`, `smile`, `serious`, `surprised`, `embarrassed` должны читаться как разные authored эмоции.
В пределах одной Pose A внешний силуэт, тело, одежда, волосы, свет и alpha-края должны оставаться стабильными; менять следует только необходимую для выражения область.

Цель — отсутствие halo/flicker и скачков масштаба при смене expression frame.

Стандартная taxonomy закрыта этими пятью выражениями. Новый обязательный expression name нельзя
добавлять ради одного эпизода. Отдельный climax frame возможен только после явного budget approval и
не становится скрытым восьмым обязательным asset.

## Offline expression production

Утверждённый neutral full-body master является неподвижной основой. Для каждой эмоции разрешено
редактировать одну ограниченную face ROI, сохранить production layers/mask и выполнить
offline-композит на неизменённый master. До экспорта следует проверить неизменность pixels за
пределами разрешённого region, canvas 1024×1536 и alpha-height с допуском 1 px.

Production layers и face parts не являются runtime assets. Runtime получает только готовые
precomposed RGBA frames и никогда не собирает лицо overlay-слоями.

## Animation policy

Текущий production mode: `precomposed-static`.

`blink` и `speaking` НЕ входят в обязательный runtime expression set и имеют статус `deferred`.
Их можно вернуть только отдельным ANM-028 slice через replacement/delta-mask или иной подход, который доказанно:
- не рисует второе лицо поверх authored frame;
- не создаёт double-mouth/double-eyes;
- не меняет силуэт и scale;
- сохраняет исходную authored emotion;
- корректно работает с reduced motion.

До такого proof старые `face-*`, `base-neutral`, `speaking` и `blink` файлы могут существовать в репозитории как legacy baggage, но runtime и production manifest не имеют права на них ссылаться.

## Production status

На baseline ANM-028D0 R1:
- runtime production: Miku, Onoe, Ayuki, Emi;
- visual approved: Miku, Onoe, Ayuki;
- visual rebuild required: Emi;
- Studio-only neutral candidate: Emi `anm028d0-r1`, `manual-qa`, `runtimeEligible: false`;
- planned: Kentaro, Norihiro, Mayu.

`planned` означает «asset set ещё не произведён». Для planned-персонажа запрещено объявлять несуществующие runtime asset paths ради прохождения интерфейса. Placeholder остаётся допустим до отдельного production integration slice.

## Candidate isolation

Новый neutral до ручного approval хранится вне runtime rig в
`public/assets/characters/<character>/candidates/<slice>/` и описывается отдельным
`upds-character-candidate-v1`. Candidate не добавляется в `RuntimeAssets`, семь обязательных runtime
paths или `upds-character-production-v2`. Studio обязан явно показывать выбранный `artSource`,
использовать точные candidate alpha bounds/eye line и сохранять доступ к прежнему runtime fallback
для A/B. Только отдельный approved integration slice может перенести master в canonical rig.

ANM-028D0 Emi R1: `330,80,737,1508`, height `1428 px`, bottom padding `28 px`, eye line `244 px`,
status `manual-qa`. Эти числа являются candidate QA metadata, а не молчаливой заменой текущих Emi
runtime proportions.

## VN staging / virtual camera

Все production frames используют общий VN camera viewport.

Runtime contract:
- `.portrait-frame` и `.portrait-static`: один contain/bottom camera box;
- `characterStaging` — единственная допустимая точка character-specific scale/y correction;
- production default: `scale: 1`, `yPercent: 0`;
- рост и пропорции в первую очередь закладываются в согласованный 1024×1536 master canvas;
- нельзя подгонять отдельные expression frames или сцены случайным CSS zoom.

Будущий Character/Scene Studio должен редактировать/показывать эти же staging metadata, а не создавать параллельную систему координат.

## Production gate

Перед переводом персонажа из `planned` в `production` CI должен подтвердить:
- полный 7-asset set;
- пять уникальных expression paths;
- существование всех runtime assets;
- 1024×1536 для frames/Pose B;
- exact alpha bounds и eye-line metadata для каждого из пяти Pose A expression PNG;
- квадратный medallion 256 или 512;
- asset root `./assets/characters/<character>/`;
- explicit adult guardrail;
- отсутствие runtime-ссылок на legacy face-overlay animation.

Visual approval остаётся ручным gate: автоматическая проверка не может доказать совпадение стиля, анатомию или художественную уникальность эмоций.
