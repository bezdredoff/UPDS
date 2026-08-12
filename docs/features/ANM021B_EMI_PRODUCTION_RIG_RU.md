# ANM-021B — Emi Production Rig

Build: `0.21.1-anm021b`.

## Цель

Заменить placeholder Эми Такахаси полноценным production character rig и одновременно сделать ANM-021A art contract частью постоянной документации репозитория.

## Runtime

Эми переведена из `PlaceholderKey` в `CharacterKey`.

Runtime pack:
- `rig/pose_a/base-neutral.png` — 1024×1536 RGBA;
- `face-smile.png`;
- `face-serious.png`;
- `face-surprised.png`;
- `face-embarrassed.png`;
- `face-speaking.png`;
- `face-blink.png` — все 512×512 RGBA;
- `poses/pose_b_guarded_athlete.png` — 1024×1536 RGBA;
- `medallions/portrait_neutral_256.png` — 256×256 RGBA.

`RuntimeAssets` автоматически подхватывает новый rig через `characterRigs`, поэтому отдельный список preload-ассетов не создаётся.

## Сюжетный контракт

Эми остаётся внешним interviewee и сохраняет правую VN lane напротив команды. Screenplay, VN IDs, choice semantics и authored emotion routing не меняются.

## Art direction

Эми — взрослая 19-летняя студентка и легкоатлетка. Образ должен передавать спортивность, открытость и способность отстаивать границы, не превращая первую пострадавшую в беспомощный или сексуализированный объект.

## Документация

ANM-021B добавляет в `docs/art/`:
- постоянный Character Production Contract;
- character briefs;
- machine-readable usage manifest.

Они являются source of truth для ANM-021C–E.

## Acceptance

- Emi больше не placeholder;
- speaker `ЭМИ` разрешается в production rig;
- Kentaro/Norihiro/Mayu остаются placeholders;
- полный 9-file asset contract присутствует;
- размеры PNG соответствуют contract;
- runtime asset catalog включает Emi;
- staging остаётся external/right;
- existing gameplay/localization/save contracts не меняются.
