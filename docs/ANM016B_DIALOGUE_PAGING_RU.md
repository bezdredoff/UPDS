# ANM-016B — Dialogue Text Fit & Adaptive Paging

## Контракт

Сценарий остаётся неизменным: `VNxxxx` — единственный стабильный narrative ID. Если реплика не помещается в доступный dialogue card, presentation layer временно делит её на внутренние страницы `1/N`, `2/N`.

Внутренние страницы не записываются как новые VN IDs и не меняют `CampaignSave` schema. `save.line` и `readLines` обновляются только после последней страницы authored-реплики.

## Адаптивный бюджет

`src/ui/vnDialoguePaging.ts` выбирает бюджет по реальному `window.innerWidth`, `window.innerHeight` и текущему text scale. Короткие экраны и large text получают меньший лимит слов/символов.

Разбиение выполняется по словам. Если рядом есть естественная граница предложения, paginator предпочитает её механическому разрезанию фразы.

## UX

- scroll внутри `.dialogue-text` больше не является штатным overflow-механизмом;
- длинная реплика перелистывается тем же тапом, что обычный VN advance;
- `VNxxxx · 1/2` показывает, что это та же authored line;
- progress dots отражают внутреннюю страницу;
- AUTO читает страницы последовательно;
- SKIP по-прежнему работает только с authored `readLines`.

## Не входит

Nameplate layering и header contrast остаются отдельными ANM-016C / ANM-016D.
