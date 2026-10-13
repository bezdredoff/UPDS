# PG-002B — ввести общий audio runtime contract

Статус: подготовлено к проверке.

## Изменение

- `src/contracts/AudioRuntime.ts` описывает используемые приложением audio settings, capability flags и команды.
- Web `AudioManager` явно реализует интерфейс; `RuntimeServices.audio` теперь публикуется как `AudioRuntime`, а не как конкретный browser manager.
- Контракт не включает `AudioContext`, `Window` или `Navigator` types.

## Эффект для порта

Feature controllers и общие settings controls уже обращаются к audio runtime через `RuntimeServices`.
Godot composition сможет предоставить собственную реализацию тех же команд/settings, сохранив
запрос cue, смену сцены, preview и отображение аудио-настроек.

Веб-адаптер по-прежнему отвечает за Web Audio, браузерную вибрацию, автоматическое возобновление
при смене visibility и расписание процедурной музыки. Игровые cues, настройки, ключ сохранения и
текущее поведение не меняются.
