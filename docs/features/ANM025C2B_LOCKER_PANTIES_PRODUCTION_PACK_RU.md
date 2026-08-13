# ANM-025C2B — Locker Panties Production Pack

## Цель

Первый production art cut поверх Active Tile Set Contract: перевести `M3_00` на состав, где бельё действительно доминирует в Match-3 и визуально разные трусики являются разными match identities.

## Состав M3_00

Ровно шесть активных типов:

1. `pantiesSportWhite` — белые спортивные трусики с тёмно-синей окантовкой;
2. `pantiesLacePink` — розовые bikini/slip с кружевом и бантом;
3. `pantiesHighWaistBlack` — чёрные high-waist с кружевными боковыми панелями;
4. `pantiesBoyshortBlue` — голубые boyshorts с белой спортивной полосой;
5. `sportsBra` — существующий бирюзовый спортивный топ;
6. `laundryTag` — существующая золотая бирка.

Четыре panties-типа занимают четыре из шести match slots. Они матчатся только с идентичным `Match3TileId`.

## Production image contract

Все четыре новых изображения:

- 256×256 RGBA PNG;
- прозрачный фон;
- видимый предмет центрирован по alpha silhouette;
- слабый low-alpha generation halo удалён;
- для чёрного high-waist добавлена плоская нейтральная контрастная окантовка, чтобы силуэт не терялся на тёмной board surface;
- силуэт не растягивается до искусственно одинаковой формы;
- визуальный размер нормализован под маленькую Match-3 клетку;
- различие строится одновременно на форме, цвете и деталях.

Это важнее абсолютного равенства bounding box: bikini остаются тоньше, high-waist выше, boyshorts шире.

## Gameplay boundary

ANM-025C2B не добавляет spawn weights и не меняет special-combo rules. Каждый из шести активных типов пока имеет одинаковую вероятность выбора при refill. Level Lab / balance pass позже сможет управлять весами отдельно.

Текущие collect goals M3_00 используют конкретные IDs `pantiesSportWhite` и `pantiesLacePink`, а не широкую категорию `panties`.
