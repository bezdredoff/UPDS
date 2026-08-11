# UPDS — защищённые проектные контракты

Эти правила считаются стабильными до отдельного продуктового решения.

## Narrative

- Канон определяется Story Bible / episode plot / vertical-slice screenplay.
- Стабильные `VN....` IDs не перенумеровываются и не переиспользуются.
- `CHOICE_00` сохраняет ветвление A/B/C и существующую семантику checkpoint/resume.
- Playable vertical slice содержит 9 VN scenes и 4 Match-3 уровня.
- Финальная playable VN последовательность заканчивается на `VN0249`; authored `VN0250` остаётся optional teaser.

## Save compatibility

Основной save key неизменен:

`seiran-detectives-anm009-v1`

Новые subsystem settings/telemetry используют отдельные ключи и не должны молча менять campaign save schema/key.

## Art

- Approved direction: mobile-first 2000s anime / detective UI language.
- Production character rig: `base-neutral + face overlay`.
- Existing runtime rigs: Miku, Onoe, Ayuki.
- Missing production characters may use explicit placeholders until their art pass.
- Golden samples are references, not runtime assets.

## Mobile/runtime

- Portrait phone is the primary layout.
- Minimum regression viewport: `320×568`.
- Navigation touch target contract: approximately 44×44 px where applicable.
- VN authored lines may have presentation-only internal pages; internal pages never create new `VN` IDs.
- Match-3 keeps tap→tap, swipe and drag interaction.

## GitHub Pages lanes

- stable site: repository Pages root;
- candidate preview: `/preview/`;
- stable service worker must never intercept `/preview/*`;
- preview cache and stable cache use different namespaces.

## Change rule

If a feature requires changing one of these contracts, document the decision explicitly before changing code/tests. Do not let an implementation convenience silently redefine the contract.
