# ANM-022H1 — Delta ZIP Import Foundation

## Goal

Ускорить мобильный ChatGPT → GitHub workflow для обычных code/data/docs изменений,
не ломая уже надёжный FULL_PROJECT ZIP pipeline.

Целевые пути:

1. `PATCH.zip → incoming → main + delta → candidate → full CI → preview → PR`
2. `FULL_PROJECT.zip → incoming → existing validation/import → candidate → full CI → preview → PR`
3. Direct GitHub plugin writes остаются экспериментальным future fast path.

## Delta archive contract

```text
FEATURE_PATCH.zip
├── patch-manifest.json
└── files/
    ├── src/...
    ├── tests/...
    └── docs/...
```

Manifest:

```json
{
  "format": "upds-delta-v1",
  "feature": "ANM-022F",
  "baseSha": "<exact main SHA used to build patch>",
  "files": ["src/...", "tests/..."],
  "delete": []
}
```

### v1 stale-base policy

`baseSha` должен ТОЧНО совпадать с SHA `main`, на который Action накладывает patch.

Это намеренно консервативно:
- никакого молчаливого rebase;
- никакого применения patch к неожиданно изменившемуся main;
- при stale patch ChatGPT пересобирает очень маленький PATCH.zip на свежем main.

Позже можно добавить безопасную ancestor/rebase policy как H2, если она реально понадобится.

## Security

Delta importer:
- запрещает absolute/`..`/backslash paths;
- разрешает только объявленные manifest entries;
- ограничивает entry count/uncompressed size;
- запрещает менять `.github/workflows/**`;
- запрещает менять validators/importer;
- сначала полностью валидирует архив, затем применяет изменения;
- deletions перечисляются отдельно.

## CI contract

После применения delta получаем ПОЛНЫЙ candidate project.
После этого используется тот же gate, что и сейчас:

`npm ci --ignore-scripts → npm run check → validated artifact → candidate branch/PR → preview`

Delta не ослабляет CI; он уменьшает только объём ручной передачи с телефона.

## Why setup cannot bootstrap itself

Текущий production importer специально отвергает ZIP, меняющий `.github/workflows`.
Это правильная защита.

Поэтому первый enablement delta path требует одноразового ручного setup PR / GitHub web-editor change:
- добавить `scripts/apply-delta-zip.py`;
- адаптировать `.github/workflows/import-zip.yml`;
- добавить tests/docs.

После этого обычные feature patches не требуют workflow edits.

## Acceptance

H1 считается готовым, когда:
- старый FULL_PROJECT ZIP по-прежнему проходит;
- минимальный PATCH.zip меняет 1 текстовый файл и создаёт candidate PR;
- PATCH.zip с stale baseSha отклоняется;
- PATCH.zip с protected path отклоняется;
- удаление заявленного обычного файла работает;
- candidate проходит полный `npm run check`;
- preview/PR/reporting одинаковы для full и delta modes.

## H2+

- per-PR preview URL;
- nicer stale-patch diagnostics;
- patch re-upload/update same candidate PR;
- plugin direct-write proof-of-concept when connector becomes stable;
- optional automatic patch builder tooling.
