# ANM-015 — Audio & Haptics QA

## Контракт

Audio не является условием gameplay. Если браузер не поддерживает Web Audio, игра должна продолжать работать полностью без звука. Если Vibration API недоступен, haptics silently degrade to no vibration.

AudioContext создаётся/возобновляется только после первого `pointerdown` или `keydown`, чтобы соответствовать mobile autoplay policies.

Настройки хранятся под отдельным ключом `seiran-detectives-audio-v1` и не меняют campaign save key/schema.

## Ручной критический путь на iPhone

1. Открыть fresh `/preview/`. До первого касания ошибок быть не должно.
2. Коснуться `Настройки`. После первого gesture должна начать работать menu music, если Safari разрешает Web Audio.
3. Проверить Music 0–100%, SFX 0–100%, Mute и их сохранение после reload.
4. Нажать `Проверить музыку` и `Проверить SFX`.
5. Открыть VN: тема должна переключиться на более спокойный VN loop.
6. В VN открыть `CONFIG`: те же audio settings должны отражать сохранённые значения.
7. Проверить лёгкий cue при переходе реплики, Choice и открытии dossier.
8. Запустить Match-3: музыка должна переключиться на match theme.
9. Проверить cues: Hint, valid swap, invalid swap, ordinary match, cascade/special и win/loss.
10. После победы проверить clue cue и возврат к VN music.
11. Свернуть Safari на несколько секунд и вернуться: музыка не должна наслаиваться или играть несколькими копиями.
12. Включить Mute, повторить background/foreground и проверить, что музыка не возобновляется поверх mute.
13. Если браузер сообщает Haptics `fallback без вибрации`, это PASS; Vibration API не является обязательным для iPhone Safari.
14. Экспортировать diagnostics и проверить наличие блока `audio`.

## Accessibility

- Mute и Music/SFX volume независимы.
- Haptics имеют отдельный toggle.
- `prefers-reduced-motion` сокращает visual timing, но не убирает важные sound cues.
- отсутствие AudioContext/Vibration API не вызывает player-facing error и не блокирует input.
