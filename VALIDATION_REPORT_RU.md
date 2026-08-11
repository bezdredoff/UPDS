# ANM-015 — Validation Report

Версия: `0.15.0-anm015`  
Фича: Audio & Haptics Foundation

## Scope

Добавлен изолированный audio/haptics layer поверх ANM-014:

- Web Audio activation только после первого user gesture;
- Music / SFX channels с независимой громкостью и mute;
- persisted audio settings (`seiran-detectives-audio-v1`);
- menu / VN / match / ending procedural music themes;
- 14 procedural SFX cues;
- optional haptics/Vibration API fallback;
- background/foreground suspend-resume;
- player-facing настройки в главном меню и VN CONFIG;
- audio state в diagnostics export.

## Реально выполненные проверки в этой сессии

- `tsc -p tsconfig.json` — PASS (global TypeScript 5.8.3, strict project contract).
- ANM-015 pure audio foundation executable smoke — PASS.
- WebAudio lifecycle smoke с fake AudioContext — PASS.
- Protected-file byte comparison against accepted ANM-014 ZIP — PASS.
- Protected GitHub workflow hashes match stored exact-main copies — PASS.
- Search for stale pinned `0.10–0.14` app-version literals in `src/tests/package*.json` — PASS (none).
- Final ZIP validator — PASS: 135 entries, 9,642,142 uncompressed bytes.

## `npm run check`

**NOT VERIFIED locally.** `npm ci --offline --ignore-scripts` не может завершиться в sandbox: npm cache не содержит `why-is-node-running@2.3.0.tgz` (`ENOTCACHED`). GitHub mobile importer остаётся authoritative clean runner и должен выполнить `npm ci --ignore-scripts` → `npm run check` до создания candidate branch.

После ANM-015 в архиве 12 test-файлов и 48 верхнеуровневых `it`/`it.each` блоков; authoritative число фактически выполненных тестов должен вернуть Vitest в GitHub Actions.

## Защищённые контракты

Byte-for-byte относительно ANM-014 не изменены:

- `.github/workflows/ci.yml`
- `.github/workflows/pages.yml`
- `.github/workflows/import-zip.yml`
- `scripts/validate-upload-zip.py`
- `src/data/narrative.ts`
- `src/data/levels.ts`
- `src/data/characterRigs.ts`
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`
- `src/engine/Match3Game.ts`
- `src/engine/CampaignStore.ts`

Основной save key остаётся `seiran-detectives-anm009-v1`. Audio preferences используют отдельный key `seiran-detectives-audio-v1`.

## Известные ограничения

1. Procedural themes/SFX являются функциональным pre-release foundation, а не финальным production soundtrack.
2. iPhone Safari обычно не предоставляет Vibration API; отсутствие haptics там является штатным fallback, а не ошибкой.
3. Нет voice-over.
4. Нет внешних audio assets; production audio можно будет заменить внутри сохранённого `AudioManager/AudioCue` contract.

## Ручной QA

См. `docs/ANM015_AUDIO_HAPTICS_RU.md`.
