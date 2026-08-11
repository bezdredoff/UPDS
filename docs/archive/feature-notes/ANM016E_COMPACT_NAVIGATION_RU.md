# ANM-016E · Compact Context Navigation

## Цель

Сделать уже унифицированный ANM-016D header визуально спокойнее: убрать редкое глобальное действие `Главное меню` из постоянной панели и оставить там только контекстно важные действия.

## Контракт

- VN: `CASE` + `LOG` + `Settings`.
- Match-3: `Back` + `Dossier` + `Settings`.
- Choice / intro / loss / utility: `Back`, когда он нужен, плюс `Settings`.
- Dossier / QA panels: `Back` + `Settings`.
- Прямой `Menu` не рендерится в persistent headers.
- Глобальный переход `Главное меню` находится внутри Settings/CONFIG.
- Settings всегда возвращают на экран, откуда были открыты.
- Если существует активная Match-3 попытка, выход из Settings в главное меню требует подтверждения и затем очищает попытку.
- В VN CONFIG выход в меню не требует дополнительного confirmation: текущая authored VN-позиция уже сохранена обычным campaign save.
- Финальный экран сохраняет прямую CTA `В главное меню`, потому что это действие завершения главы, а не постоянная навигация.

## Не меняется

Narrative, VN IDs, save key/schema, Match-3 rules/balance, production assets, staging, dialogue paging, nameplate seam, audio/haptics и GitHub pipeline.
