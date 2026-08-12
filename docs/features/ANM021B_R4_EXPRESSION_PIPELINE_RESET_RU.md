# ANM-021B R4 — Character Expression Pipeline Reset

Build: `0.21.1-anm021b-r4`.

## Решение

R2/R3 не проходят visual QA и не должны мержиться.

R4 меняет production/runtime contract:
- Miku/Onoe/Ayuki используют precomposed full-frame expression frames;
- layered face overlays больше не рендерятся VN runtime;
- automatic speaking/blink отключены;
- expression frames меняют только внутреннюю область мимики;
- внешний силуэт головы, волосы, шея, воротник, тело и alpha остаются neutral master;
- Emi R2/R3 art удалён и Эми возвращена в placeholder до новой stylistically approved генерации.

## Почему

Наблюдались:
- почти неразличимые эмоции Аюки;
- два рта у Оноэ во время speaking;
- нестабильные expressions Эми;
- halo/flicker по границе головы у нескольких персонажей.

Все четыре дефекта происходят или усиливаются при compositing второго face image поверх base.

## Follow-up

ANM-021B остаётся незакрытой до production redraw Эми.
Следующий art candidate должен сначала предложить и утвердить только Emi neutral master в 2000s Hybrid,
а уже после утверждения производить четыре expression frames, Pose B и medallion.
