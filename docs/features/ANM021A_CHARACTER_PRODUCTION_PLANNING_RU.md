# ANM-021A — Production Character Planning

> Historical planning note. The 512×512 face-overlay details below document the original ANM-021A
> proposal and are retired by ANM-021B R4 and ANM-028A. Current production/runtime authority is
> `src/data/characterProduction.ts` plus `docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md`; do not use
> this note to reintroduce layered runtime faces or fake asset paths.

## Цель

Зафиксировать единый production-контракт для замены оставшихся VN placeholders: Emi, Kentaro, Norihiro, Mayu.

## Сюжетный аудит

ANM-003 подтверждает:
- Emi — первая пострадавшая, сцены 0–2; широкий диапазон: тревога, смущение, раздражение/границы, нейтральность, облегчение/доверие.
- Kentaro — сцены 3–4; защитная серьёзность, неловкость, растерянность, смягчение после оправдания.
- Norihiro — сцены 5–8; преимущественно спокойный/deadpan, деловая серьёзность, редкое смягчение и лёгкая реакция.
- Mayu — в текущем vertical slice только ветка `CHOICE_00/C`; нейтрально-деловая и вежливо-напряжённая, но полный дизайн должен учитывать её будущую роль студсовета.

## Production contract

Технический эталон — существующие rigs Miku/Onoe/Ayuki:
- Pose A: 1024×1536 RGBA, pivot `(0.5, 1.0)`;
- face overlays: 512×512, placement `left 25% / top 0% / width 50%`;
- expressions: smile, serious, surprised, embarrassed, speaking, blink + neutral base;
- Pose B: static 1024×1536;
- medallion: 256×256;
- 9 runtime PNG на героя.

Полный expression set сохраняется даже если текущий сценарий использует не все эмоции: `CharacterRig.faces` сейчас является полным Record, а speaking/blink нужны runtime-анимации.

## Art direction

Новые герои обязаны совпадать с утверждённым `2000s Hybrid`: чистый контур, простой cel shading, минимум глянца/эффектов, взрослые college-age пропорции. Нельзя использовать школьные/несовершеннолетние коды, эротическую камеру или делать ложных подозреваемых визуально «злодейскими».

## Порядок

- ANM-021B — Emi
- ANM-021C — Kentaro
- ANM-021D — Norihiro
- ANM-021E — Mayu

Интеграция выполняется по одному персонажу: art QA → runtime wiring → automated tests → iPhone preview → merge.

## Защищённые контракты

ANM-021A не меняет:
- screenplay / VN IDs;
- CHOICE_00;
- level definitions / Match-3;
- save key/schema;
- существующие production rigs;
- GitHub pipeline.

Следующие character PR также не должны менять эти области без отдельного scope.
