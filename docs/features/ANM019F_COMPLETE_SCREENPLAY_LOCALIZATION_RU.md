# ANM-019F · Complete Screenplay Localization

Build: `0.19.6-anm019f`.

## Цель

Закрыть английскую локализацию playable vertical slice без русского screenplay fallback.

## Scope

- все 262 authored VN line IDs, включая VN0250 teaser и ветки A/B/C, имеют `speaker`, `emotion`, `text` в RU и EN;
- английские строки не содержат кириллического fallback-контента;
- стабильные VN IDs, branching, save state, character/expression/background routing не меняются;
- исправлены устаревшие английские VN0021–VN0022 так, чтобы они соответствовали актуальному screenplay;
- completeness contract проверяет весь screenplay и все три playable choice branches;
- Match-3 mechanics/feedback semantics не меняются.

## Manual QA

English → New Game → пройти весь vertical slice до Ending по одной ветке. Проверить VN, Match-3, Dossier и Ending на отсутствие русского текста. Отдельно через Scene Navigation проверить сцены после каждого Match-3. Русский режим должен сохранять authored screenplay.
