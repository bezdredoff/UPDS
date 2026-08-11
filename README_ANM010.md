# ANM-010 — GitHub / Phone Pipeline

Инфраструктурная итерация поверх полностью игрового baseline ANM-009. Игровой канон, VN line IDs, save key, art direction и `base + face overlay` rig contract не менялись.

## Добавлено

- GitHub CI с единым required check `Quality gate` через `npm run check`;
- GitHub Pages stable deployment из `main`;
- mobile ZIP inbox через техническую ветку `incoming`;
- безопасный ZIP validator до исполнения кандидатского кода;
- candidate branch + PR только после успешной read-only validation;
- независимый PR CI с ручным approval перед merge;
- GitHub Pages preview: `/` = текущий `main`, `/preview/` = последний кандидат;
- автоматический reset `incoming` после импорта;
- PR checklist защищённых UPDS-контрактов;
- русская инструкция для iPhone workflow.

## Игровой baseline

Полностью сохранены функции ANM-009: 9 VN-сцен / 262 authored rows, три ветки `CHOICE_00`, четыре 8×8 match-3 уровня, четыре улики, dossier/Continue/retry, production rigs Мику/Оноэ/Аюки и четыре намеренные portrait placeholders.

## Проверка

```bash
npm install
npm run check
```

Подробная настройка GitHub: `docs/GITHUB_PHONE_PIPELINE_RU.md`.
