# PG-001B — отвязать campaign sessions от browser RuntimeServices

Статус: реализация подготовительного шага; сохранения и runtime-поведение не меняются.

## Причина

`AppSession` и `Match3CampaignSession` принадлежат application-слою, но принимали целый
`RuntimeServices` объект из `src/platform/RuntimeServices.ts`, чтобы обращаться только к campaign
store и записывать ошибку при неудачном сохранении. Это создавало обратную зависимость от web
composition root и скрывало реальные требования сессий.

## Изменение

- `AppSession` теперь принимает `CampaignStore` и callback для сообщения об ошибке сохранения.
- `Match3CampaignSession` принимает свой `Match3CampaignStore` и такой же callback.
- `AnimeDetectiveApp` связывает callback с browser `ErrorLog` в composition root.
- Добавлены unit-тесты успешного сохранения и ошибки сохранения для обеих сессий.

## Эффект для переноса

Application sessions больше не импортируют `RuntimeServices` или browser platform. Godot composition
root сможет подключить существующие типизированные save stores к собственному обработчику ошибок,
сохраняя Story и Match-3 campaign flow независимо от web service container.

## Границы

Этот шаг не меняет save key/schema, порядок progression, campaign rules, error text или browser
composition. `RuntimeServices` остаётся контейнером web runtime для feature controllers, которым
нужны audio, telemetry, localization и browser presentation capabilities.
