# Preview build identity fix

Причина: stable и candidate builds внутри одного mobile-import workflow раньше получали одинаковый `BUILD_ID`, потому что Vite брал общий `GITHUB_SHA` upload-коммита `incoming`. Дополнительно preview service worker версионировался через долгоживущий `APP_VERSION`, что ослабляло cache invalidation между кандидатами.

Исправление:
- build identity = GitHub job + run + source SHA (или явный `VITE_BUILD_ID` override);
- preview service worker version/cache namespace = `BUILD_ID`;
- preview fetch path использует cache reload while online;
- `/preview/` показывает постоянный QA badge `PREVIEW · <build-id>`;
- stable root badge не показывает.

Проверка после merge: повторный ZIP import должен дать отличимые stable/preview build IDs и свежий candidate preview.

## Семантика версии после ANM-025B

Чтобы product version больше не выглядела как устаревший feature label:

- `APP_VERSION` — продуктовая dev-линия (`0.25.0-dev`) и не обязана меняться на каждой атомарной подфиче;
- `BUILD_LABEL` — человекочитаемый функциональный baseline (`ANM-025B · ...`);
- `BUILD_ID` — уникальная конкретная сборка (job + run + source SHA);
- `BUILD_TIMESTAMP` — время конкретной сборки;
- npm `package.json.version` — canonical product semver source; `APP_VERSION` импортируется из него. Это по-прежнему не feature/build identity и не заменяет `BUILD_LABEL`/`BUILD_ID`.

PWA cache invalidation по-прежнему использует `BUILD_ID`, а не `APP_VERSION`.
