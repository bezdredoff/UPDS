# ChatGPT preflight перед mobile ZIP

Перед выдачей ZIP будущая фича сначала проверяется в GitHub CI на технической ветке `preflight/chatgpt`.

Рабочий цикл:

`main → ChatGPT implementation → preflight/chatgpt → GitHub Quality gate → ZIP → incoming → candidate PR + preview → iPhone QA → ручной merge`

Основные правила:

- preflight содержит тот же feature diff, который затем попадает в ZIP;
- ZIP собирается только после зелёного Quality gate;
- mobile importer, candidate PR, независимый PR CI, preview и ручной merge остаются обязательными;
- preflight не является заменой review и не используется для автоматического merge;
- изменения GitHub pipeline по-прежнему выполняются отдельными maintenance PR.

`.github/workflows/ci.yml` запускает обычный read-only Quality gate для push в `preflight/**`.
