# ANM-030B1C / G0-PWA-001 — iOS layout viewport repair

Дата: **2026-09-11**
Статус: **device accepted 2026-09-11; repository PR #301 in review**
Связанные release gate / issues: `G0`, `KI-001`, `KI-003`

## Evidence

Отдельная лаборатория [`bezdredoff/ios-pwa-viewport-lab`](https://github.com/bezdredoff/ios-pwa-viewport-lab)
на build `995b78b277e2` воспроизвела production-факторы по одному на установленной PWA:

| Variant | Изменение | Geometry после settle | Результат |
| --- | --- | --- | --- |
| `00-baseline` | flow baseline | `inner/visual/dvh 402×812`, `screen 402×874` | полный нижний control |
| `30-fixed-inset` | `position: fixed; inset: 0; height: auto` | shell/game/control bottom `812` | полный нижний control |
| `32-runtime-default` | shell height = `max(innerHeight, screen.height)` | layout viewport `812`, shell `874` | нижние `62px` и кнопка обрезаны |
| `33-upds-runtime-translucent` | добавлен `black-translucent` | safe-area после 2 RAF `62/34`, layout `812`, shell `874` | обрезка плюс нижняя полоса body |

В 32 footer занимает `779..874`, а видимый viewport заканчивается на `812`: видны `33px`,
нижние `62px` недоступны. Это точное причинное evidence против использования `screen.height`
как CSS layout boundary. В 33 status-bar mode дополнительно воспроизводит отдельную полосу.

## Candidate contract

- `screen.height` остаётся только диагностическим physical-device evidence.
- `ViewportRuntime.layoutHeight` и frozen VN row tokens используют initial
  `visualViewport.height ?? innerHeight`.
- `.viewport-shell` привязан к fixed containing block через `inset: 0; height: auto`; shell не
  складывает `100dvh` с top safe area и не получает `screen.height` в CSS variable.
- Installed PWA использует status-bar style `default`; safe-area применяется внутри интерактивных
  top/bottom surfaces.
- Существующая policy сохраняется: height-only события не перестраивают игру; width/orientation
  обновляют frozen snapshot.

## Device acceptance

Пользователь подтвердил 2026-09-11 на том же fresh-installed iPhone candidate из PR #301:

- нижняя полоса исчезла;
- VN полностью помещается в layout viewport;
- результат сохраняется online и offline.

На этом evidence `KI-001` и `KI-003` закрыты. Возвращать physical screen sizing,
`black-translucent` или root-color camouflage запрещено. Representative Android и повторная
offline/update проверка финального payload остаются общими RC gates, а не причинами держать эти
два воспроизведённых iPhone-дефекта открытыми.
