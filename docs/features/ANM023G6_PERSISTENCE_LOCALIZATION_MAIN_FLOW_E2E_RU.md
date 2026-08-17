# ANM-023G6 — Persistence / Localization / Main-Flow Journeys

Статус поставки: **R1 candidate**.

## Цель

Закрыть последние функциональные browser-контракты перед включением Browser Gate:

1. campaign save переживает reload;
2. locale меняется через production Settings и переживает reload;
3. короткий настоящий player-flow проходит из Main Menu через VN/choice в первый story Match-3;
4. story win-route к post-Match-3 VN остаётся защищён production contract без test-only completion API.

## 1. Campaign persistence

Journey:

`Main Menu → New Game → VN0002 → browser reload → Main Menu → Continue → VN0002`.

Почему VN0002, а не VN0001: fresh save на `scene=0,line=0` сам по себе ещё не делает Continue активным. Переход на VN0002 фиксирует `line > 0`, после чего Main Menu должен обнаружить сохранение.

Проверяется реальная цепочка:

`VnController.nextLine() → AppSession.persist() → CampaignStore.save() → localStorage`

после reload:

`MainMenuController.render() → AppSession.reload() → CampaignStore.load() → #continue → openScene(saved scene,line)`.

Browser test не вызывает `localStorage.setItem()`.

## 2. Localization persistence

Journey:

`Main Menu (RU) → Settings → select EN → immediate rerender → Main Menu → reload → EN`.

Проверяется:

- `[data-language-select]` действительно меняет locale;
- `<html lang>` становится `en`;
- Main Menu label реально меняется;
- после reload остаётся тот же label;
- Settings после reload показывает `en`.

Это проходит production цепочку `LocalizationService.activateLocale → subscriber → LocaleSettingsStore.save`, а boot восстанавливает locale через `localeSettings.load()`.

## 3. Short main-flow

Journey начинается только через player-facing `#new`:

`New Game`
→ Scene 0
→ Scene 1
→ `VN0040`
→ `CHOICE_00`
→ option B
→ `VN0041B`
→ `VN0057`
→ production `M3_00_LOCKER_TUTORIAL` intro
→ Start
→ production `.match-screen`.

После старта browser reload делает Main Menu, а `Continue` должен снова привести к `M3_00` intro, потому что pre-Match-3 scene уже сохранена на end boundary.

Так проверяется cross-system routing и persistence boundary без QA scene jump.

## Почему G6 не решает M3_00 автоматически

Полное browser-автопрохождение первого уровня через objective hints потребовало бы до 24 игровых ходов и зависело бы от текущего баланса/reshuffle/tutorial sequencing.

Добавлять `completeLevel()` browser hook нельзя: он перестал бы проверять production path.

Поэтому G6 делает две вещи:

- browser реально доказывает VN → Match-3 boundary;
- root Vitest contract фиксирует существующий production win route:
  `M3_00_LOCKER_TUTORIAL → storyWinSceneIndexForLevelId → VN_SCENE_02_E0_POST → VN0058`.

Pixel/browser evidence полного win-перехода можно добавить позже только если появится стабильный production deterministic scenario, а не test-only shortcut.

## CI boundary

Как и G1–G5, executable Playwright пока не входит в `npm run check`.

Root CI запускает `BrowserPersistenceLocalizationFlowContract.test.ts`, который защищает:

- реальные save/load owners;
- locale persistence owners;
- production selectors;
- New Game → CHOICE_00 → M3_00 routing;
- M3_00 → VN0058 win route;
- отсутствие browser-only runtime APIs и прямой save mutation.

Следующий шаг — **ANM-023G7 Visual Regression & Browser Gate CI**.
