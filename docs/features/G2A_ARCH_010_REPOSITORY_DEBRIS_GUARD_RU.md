# G2a-ARCH-010 — Repository debris guard

Status: **in review**.

## Проблема

В repository root был закоммичен случайный локальный output:

`CUsersbezdr.lmstudioscratchpadskmcheck_output.txt`

Имя содержит Windows-path prefix с private-use заменой двоеточия и склеенный путь к LM Studio scratchpad. Существующий hygiene contract запрещал несколько исторических report names, `.bak`, Python cache и `.DS_Store`, но не распознавал этот класс redirected output.

## Реализация

- accidental scratch output удалён;
- `RepositoryHygiene.test.ts` проверяет только файлы непосредственно в repository root;
- запрещены Windows absolute-path redirects с обычным или типичными Unicode colon substitutes;
- запрещены явные scratch/scratchpad artifacts;
- запрещены явные `check`, `test`, `qa` и `diagnostic(s)` output/result/report/dump filenames;
- positive/negative fixtures фиксируют границу правила.

Guard намеренно не сканирует содержимое файлов и не запрещает общие слова во вложенных docs/assets. `README.md`, `ROOT_CAUSE_NOTES.md`, package metadata и `vitest.match3-audit.config.ts` остаются допустимыми root files.

## Не входит в slice

- общий rename/reorganization repository root;
- удаление legitimate docs, configs или assets;
- изменение CI workflows, dependencies или generated visual baselines;
- runtime, gameplay, save, PWA или viewport изменения;
- дальнейший автоматический G2a refactor после ARCH-010.
