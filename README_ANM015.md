# ANM-015 — Audio & Haptics Foundation

Версия: `0.15.0-anm015`.

ANM-015 добавляет полноценный pre-release audio layer без изменения сюжета, match-3 правил, баланса, save key или production-rig контрактов.

## Что добавлено

- `AudioManager` поверх Web Audio API с активацией только после первого user gesture;
- отдельные Music / SFX gain channels;
- persisted Music volume, SFX volume, Mute и Haptics settings;
- отдельный key `seiran-detectives-audio-v1`, не связанный с campaign save;
- четыре оригинальные процедурные темы: menu, VN, match-3 и ending;
- 14 procedural SFX cues: UI, VN advance, choice, dossier, hint, swap, invalid swap, match, cascade, special, reshuffle, clue, win и lose;
- автоматическое переключение музыкального контекста между VN и match-3;
- suspend/resume при background/foreground вкладки;
- optional vibration/haptic patterns с безопасным fallback там, где Vibration API недоступен;
- player-facing настройки из главного меню и внутри VN CONFIG;
- audio/haptics состояние включено в diagnostics export;
- Reduced Motion не требует длинных визуальных пауз, но важный аудио-feedback сохраняется.

## Что намеренно не входит

- финальный саундтрек и записанные production SFX;
- voice-over;
- зависимость gameplay от аудио или haptics;
- внешний audio CDN/streaming.

Текущие темы и cues — оригинальный procedural foundation, который обеспечивает end-to-end функциональность и может быть заменён production audio assets отдельной итерацией без переписывания UI/state contract.

## Защищённые контракты

Не менялись: канон, screenplay, стабильные VN line IDs, `CHOICE_00`, основной save key `seiran-detectives-anm009-v1`, level data/move budgets, character rigs и GitHub phone pipeline.
