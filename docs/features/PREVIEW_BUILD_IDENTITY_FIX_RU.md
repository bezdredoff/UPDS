# Preview build identity fix

Причина: stable и candidate builds внутри одного mobile-import workflow раньше получали одинаковый `BUILD_ID`, потому что Vite брал общий `GITHUB_SHA` upload-коммита `incoming`. Дополнительно preview service worker версионировался через долгоживущий `APP_VERSION`, что ослабляло cache invalidation между кандидатами.

Исправление:
- build identity = GitHub job + run + source SHA (или явный `VITE_BUILD_ID` override);
- preview service worker version/cache namespace = `BUILD_ID`;
- preview fetch path использует cache reload while online;
- `/preview/` показывает постоянный QA badge `PREVIEW · <build-id>`;
- stable root badge не показывает.

Проверка после merge: повторный ZIP import должен дать отличимые stable/preview build IDs и свежий candidate preview.
