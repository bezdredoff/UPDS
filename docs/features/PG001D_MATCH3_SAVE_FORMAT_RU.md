# PG-001D — отделить формат Match-3 campaign save от хранилища

Статус: подготовлено к проверке.

## Изменение

- Типы, значение по умолчанию, нормализация, schema validation и persisted envelope перенесены в `src/engine/Match3CampaignSaveFormat.ts`.
- `Match3CampaignStore` оставлен тонким адаптером чтения, записи и сброса через `KeyValueStorage`.
- Существующие импорты из `Match3CampaignStore` сохранены через re-export.
- Добавлены тесты кодирования и декодирования без storage adapter.

## Границы совместимости

Сохранены ключ `seiran-detectives-match3-campaign-v1`, schema version `1`, legacy save без schema
version, допустимые поля и безопасное восстановление пустого состояния для неподдерживаемых данных.
Изменений progression, попыток и лучших результатов нет.
