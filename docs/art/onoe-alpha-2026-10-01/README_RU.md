# Оноэ — alpha-only очистка

Кандидат для пользовательской приёмки, не новая генерация. Промпты не использованы.
Основа — merged #317, SHA `dda9d1982b5d8241fb1136a2f6285ef72b8207bd`.

- `review.png`: увеличенное сравнение до/после у плеч.
- `all-seven-review.png`: семь результатов на белом, сером и тёмном фоне.
- `masks/`: белый сохраняет alpha, чёрный удаляет; RGB всегда неизменен.
- `qa.json`: исходные/output hashes и независимые pixel signatures.
- `source-surprised.png`: промежуточный утверждённый face repair #317,
  сохранён для проверки цепочки face repair → alpha cleanup.

Для повторения из корня репозитория с Node 24:
`node docs/art/onoe-alpha-2026-10-01/prepare.mjs`.
Нужен Git с исходным commit; script откажется использовать несовпадающий backup.
Результат появится в `output/art-review/onoe-alpha-v1/candidate/`,
исходники — в соседнем `backup/`. Runtime автоматически не перезаписывается.
`preview.ps1` выполняется через PowerShell 7 и строит увеличенное сравнение.
Пользовательские GIMP/XCF и остальные персонажи не меняются.

Проверка интегрированных PNG: `npm run character:audit`.
Отчёт: [границы и приёмка](../../reviews/ONOE_ALPHA_CLEANUP_2026-10-01.md).
