# ANM-022H1 — Delta ZIP end-to-end validation

## Назначение

Этот файл является намеренно минимальным первым production-кандидатом для проверки
`upds-delta-v1` после включения Delta ZIP Import Foundation.

Сам кандидат не меняет runtime, gameplay, balance, save data, localization или art.
Его единственная функциональная цель — пройти полный реальный маршрут:

`PATCH.zip → incoming → apply to exact main → npm run check → candidate branch → PR → preview`.

## Base

- delta format: `upds-delta-v1`
- base main SHA: `8b97a23a47ef26624d435dc07a4a586f7d4b909c`
- feature: `ANM-022H1-E2E-VALIDATION`

## Acceptance

Перед merge этого PR должны быть подтверждены:

- importer распознал архив как `delta`;
- exact `baseSha` принят без stale-base ошибки;
- delta применился поверх текущего `main`;
- candidate прошёл полный `npm run check`;
- создан candidate branch и PR;
- GitHub Pages `/preview/` открылся;
- stable root остался текущим `main`;
- changed-files list содержит только этот validation report;
- после merge обычные `main` CI и stable Pages остаются зелёными.

Если любой из пунктов не выполнен, PR не мержить: он является диагностическим кандидатом.

## После успешного merge

ANM-022H1 считается подтверждённым end-to-end на реальном mobile ZIP path.
Следующий обычный code/data delta-кандидат можно использовать для ANM-022F Interaction Guidance.
