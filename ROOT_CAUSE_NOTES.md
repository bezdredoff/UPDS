# iOS viewport forensic audit — evidence before another fix

Baseline: `db6568ddb97bbd9773dafeff1d5cbc8585ae9c5c` (#260), fetched from GitHub main on 2026-09-09.
This change collects evidence. **None of the three real-device symptoms is proven fixed.**
The supplied 402×874 / 402×812 measurements are from an earlier diagnostic build, not a new measurement of #260.

## Ranked assessment

1. **Live CSS geometry remains after the JS freeze (strong mechanism, unproven observed transition).**
   Standalone shell still uses `100dvh + env(top)`. Header and controls still use live safe-area padding.
   Fixed dialogue/control tokens do not freeze the stage: it receives the grid remainder.
   A CSS-only height/inset change can resize portraits without any resize handler or render call.
   Browser shell is frozen, but header/controls safe areas and media conditions remain live there too.
2. **WebApp layout versus visible/composited coordinates (strong match to supplied measurements; paint cause unknown).**
   `black-translucent` + cover is a documented WebKit trouble area. Prior shell=phone=874 does not prove
   physical paint coverage, correct child bounds, or the page origin. Record child geometry and screen video together.
   Keep the status-bar metadata unchanged for baseline recording; compare fresh installations of artifact-only variants later.
3. **Grid minimum contributions / painting inside the controls (concrete layout constraints; no demonstrated overflow at 402×874).**
   Controls' pixel token is a minimum, not the actual row size. Buttons + border + safe-area padding may exceed it.
   The transparent bottom gradient should expose the background stack, but a clipped image, compositor surface,
   different gradient paint, or a canvas region outside DOM hit testing would look similar in a screenshot.
4. **Asynchronous PWA activity and DOM replacement (possible correlation; no direct PWA → full-VN-render path).**
   Banner updates rebuild an absolutely positioned sibling with backdrop blur. This can change paint/compositing;
   ordinary grid flow should remain unchanged. Observe it rather than assuming either outcome.
   Full shell replacement on navigation/line changes is real; delayed automatic advancement is possible when AUTO is enabled.
5. **Responsive rules / width-orientation settling (conditional).**
   #260 still rewrites tokens for rounded width deltas ≥2px or orientationchange after two rAFs, without proving
   that the new orientation has settled. CSS orientation is based on viewport aspect ratio. A portrait→landscape
   media switch can remove the runtime compact guard even without a physical device rotation.
6. **Fonts, intrinsic image sizes, text autosizing, locale (lower likelihood for a large stage-height jump).**
   No webfont imports/@font-face were found in src. Fonts are system fallbacks/Georgia; standalone awaits fonts.ready.
   Portrait wrappers have explicit aspect ratio and percentage height; their images are absolute and 100% sized,
   so decoding ordinarily changes pixels rather than grid sizing. Idle breathing translates Y by 0.35% over 2.8s;
   it does not animate scale. Record it, do not misclassify that motion as a viewport rescale.

Static code proves the mechanisms above, **not which one happened on the phone**. No single indisputable cause
explains A/B/C from the available evidence. Phase 2 instrumentation is required; Phase 4 waits for real traces.

## Dimension dependency map and winning declarations on current main

Source lines below refer to baseline #260. All elements use border-box (`style.css:28`).

| Layer / dimension | Winning source and condition | Dependencies / implications |
| --- | --- | --- |
| html | `style.css:29`: width/height/min-height 100%; `:30` overflow hidden | Initial containing block; does not own the fixed shell height |
| body | `style.css:29–35`: height 100%, min-height 100dvh, grid/center, overflow hidden | Still live dvh independently of JS snapshot; body canvas may differ from shell |
| #app | `style.css:29`: width/height/min-height 100% | Body-relative; replaced shell is fixed, not a normal-flow child sizing this root |
| .viewport-shell | `viewport.css:54`: fixed top/left/right 0, height var(--physical-viewport-height), grid/center, overflow hidden, isolation isolate | Browser token → startup usable px; standalone token → **live** calc(100dvh + safe top) |
| .phone default | `style.css:45`: width min(100vw,430px), height min(var(--upds-viewport-height),932px), relative, overflow hidden/isolate | Capped frame outside mobile overrides |
| .phone browser ≤430px | `style.css:1172`: width/height 100%, no max-height/shadow | Parent-relative; frozen shell height in browser |
| .phone standalone portrait ≤520px | `viewport.css:30–46`: .phone.game-viewport width/height 100%, max-width/max-height none | Both native media and data fallback selectors; fills shell |
| .phone low landscape | `style.css:1226`: width min(100%,760px), height 100% | Applies at landscape and max-height 500; standalone portrait override no longer applies |
| .vn-screen | `style.css:225`: height 100%, min-height 0, grid auto/minmax(0,1fr)/dialogue/auto, overflow hidden | Four normal-flow children; backgrounds/vignette/status out of flow |
| runtime dialogue row | `vnViewportStability.css:13`: --vn-dialogue-row → --upds-vn-dialogue-row | clamp(usable×.22,154,198) sampled by main before services.ready; overrides legacy compact 136px |
| .vn-topbar normal portrait >340px | `vnViewportStability.css:32`: min-height max(58px,48px+safe top), padding max(7px,safe top) 9px 7px | Auto row also must accommodate 44px header controls; minimum isn't final height |
| .stage | `style.css:299`: relative, min-height 0, overflow visible | Remaining grid height; can shrink to zero if other rows exhaust parent |
| .portrait normal portrait >340px | `vnViewportStability.css:61` + `style.css:300`: percentage height (default178%), bottom(default−78%), aspect-ratio2/3 | Rendered height ≈stage×1.78×character scale; authored slots provide different inherited camera percentages |
| authored shots | `style.css:351–367`, inline styles from vnAuthoredShots.ts | Parent-relative absolute actor slots, deterministic camera from sceneStaging.ts/vnPortraitGeometry.ts; no asynchronous runtime camera adjuster |
| .dialogue-shell / .dialogue | `vnViewportStability.css:67/73`: height100%, padding10/12/7 and32/20/25; `style.css:479` button height100% | Row sized by frozen token, padding stays inside border-box; .dialogue-text fixed em block |
| .vn-controls normal portrait >340px | `vnViewportStability.css:97`: minimum frozen token, padding6px 10px max(6px,safe bottom); `style.css:543` border-top1px, grid4 columns | Actual auto row can exceed token; button min-height50px + vertical padding + border |
| controls bottom paint standalone | `standaloneEdgeToEdge.css:27` | Beige until height−safe bottom; transparent below. Background stack should show behind it, not root color |
| background/art | `style.css:242–253`: stack absolute inset0; images100%; fill cover/blur/scale1.08, fit contain; vignette absolute | Not constrained to stage; intended to cover entire VN. Record stack and both image bounds and natural sizes |
| root/body paint | `standaloneEdgeToEdge.css:16/20`: #171a2f | Neutralizes #254 :has screen-color bridge; obsolete custom-property values remain computed but don't win background |
| update banner | `style.css:1409`: position absolute, bottom max(10px,safe bottom), z90, backdrop-filter blur | No normal-flow row; can occlude controls / affect compositor |

At the supplied 402×812 usable case, tokens would be dialogue=178.64px, controls-min=73.08px,
status=81.2px. If actual top/bottom insets were 62/34 and shell874, controls need **at least**
50+6+34+1=91px, exceeding the token. Header needs its children + padding/border (not just its min-height110px).
Stage = shell − actual header − 178.64 − actual controls. This is not intrinsically overconstrained at 874;
exact computed rows must be measured. A 20px stage change produces about35.6px portrait-height change at scale1.
These numbers explain sensitivity; they are not hardcoded in production or used as an iOS emulator.

## Cascade and complete search findings

Searched the entire src tree for the supplied viewport/height/resize/render/observer/style/scale/SW terms.
Main CSS import order is style → buildIdentity → viewport → vnViewportStability → Match-3 feature files →
standaloneEdgeToEdge; DiagnosticsController also imports diagnosticsPlaytestSummary.css via the module graph.
Feature Match-3 CSS uses remaining vh/dvh rules but its selectors do not control runtime VN rows.

Height queries in src include max-height650 (VN compact, shared header, menu/panels, banners, settings,
Match-3, campaign, Level Lab), max-height760 (Match-3), and landscape/max-height500 (phone/menu/board).
Widths include340,341(min guard),350,390,430,520 and Scene Studio/tool breakpoints. Runtime portrait guards
neutralize most legacy VN compact declarations, but the old `.vn-controls button img`18px and some
`.vn-case-pill` small/em/gap styling remain live at650. They don't establish a large height change because
buttons retain minimum50px/44px, but the query transition must be captured. Outside the guard (narrow width
or CSS landscape), old compact padding/fonts/portrait168% remain relevant.

Only main writes global viewport tokens. Scene Studio writes local camera/calibration variables on user actions
and post-render focal alignment inside its own view. It does not run against the player VN. Match-3 writes
local drag/swap transforms. dialogueMeasurement creates a fixed off-screen temporary text probe; pagination
uses current innerWidth/innerHeight for its fallback profile on renders, then measures the actual text block.
No pre-existing ResizeObserver/MutationObserver was found in runtime viewport/VN handling.

## All asynchronous and full-render triggers

* Bootstrap: early display mode → snapshot tokens → services.ready (async persisted BE/EN locale import + html.lang)
  → PWA start (unawaited) → standalone fonts.ready → app mount → menu shell render.
* Browser: width resize ≥2px schedules token write; orientationchange schedules two rAF token write.
  VN width/orientation listener debounces80ms then two rAFs and repaginates in place. Height-only resize doesn't call it.
* AssetPreloader: bounded detached Image load/error, health state; DOM image fallback replaces failed src.
  No runtime decode() call exists in player VN. The explicit decode() elsewhere is Studio import handling.
* Localization: services.ready resolves initial locale before mount; Settings changes locale and rerenders Settings.
  No localization subscription asynchronously calls VN render. Browser fallback font/layout can still settle.
* PWA: register/ready, updatefound/statechange/controllerchange, online/offline, CACHE_READY,
  build.json response and user install/update/dismiss actions emit snapshots. App subscription and AppShell.afterRender
  remove/reinsert the absolute banner; they do not call shell.render().
* `applyUpdate()` is the reload gateway: waiting-worker SKIP_WAITING then controllerchange or600ms fallback;
  without waiting worker it reloads immediately. Ordinary controllerchange does **not** reload.
* SW navigation is network-first with cached index fallback. Stable assets cache-first; preview assets network-first;
  build.json network-only. Activation cleans caches and claims clients; warmup fetches in groups of4. None swaps
  already loaded stylesheets or modules in the open document. Different builds across launches remain possible;
  export records build/worker identities and loaded resource URLs, without assuming cache provenance.
* AppShell.render replaces the entire shell/phone for every controller render: menu, Settings, Diagnostics/scene-select,
  Dossier, ending, Level Lab, Studio, campaign, Match-3 intro/start/results/evidence, VN/choice.
* VN full render: scene open/resume/load, next authored line, fallback if page DOM missing, AUTO toggle/timer,
  SKIP, close history/settings overlay, Dossier return, choice selection/scene progression. A page advance normally
  changes text/progress in place. Save status uses a timer and hidden/text changes only. Config overlay refresh stays in place.
* CSS animations/filters/transform, root/body :has recalculation, safe env values, media evaluation and OS compositing
  need no application render event. These are why eliminating resize listeners is insufficient evidence.

## History: no authenticated known-good bisect endpoint yet

Inspected diffs for #254–260 and compared R7 `900f8fb` with main. R7 versus main has **no diff** in index metadata,
manifest, AppShell, or shared VN frame. Standalone shell formula/portrait phone100% already match R7 in substance.
The historical R7 feature document labels itself “candidate; requires … installed-iPhone preview QA”, describes
R4 success, and claims R3 lvh=dvh. Supplied later telemetry instead has lvh874 versus dvh812. Device/build identity
is missing for the historical claim, so those documents cannot certify a known-good endpoint.
PR243 contains an automatic preview-link comment and no human review/test result. Need the user's dated build-specific
confirmation/recording before bisect can call R7 or an imported R4 archive “good”.

The exact R4 merge is `71465db4a7d54c3a6277bde597969bfd30850874` (#211, 2026-08-24 UTC):
it replaces standalone100lvh with dvh+top. R5 `574e45f3af448f4088dd367bbdbc49b47b1a53ae`
(#217, 2026-08-25 UTC) removes that extension and introduces the root-color bridge. PR211/217 also contain
only automatic preview comments, with no human device report. This identifies a concrete historical reversal,
but not a verified good→bad device bisect interval. R4→R7 retains the formula, adds the ≤520px phone fill override,
and imports later Match-3 styles; index/manifest metadata do not change across that comparison.

| Commit/PR | Actual strategy change | Evidential limit |
| --- | --- | --- |
| 71465db #211 R4 | standalone lvh → dvh+top | Exact candidate for historical success claim; no attributable device record in PR |
| 574e45f #217 R5 | remove extension, add per-screen root-color bridge | Concrete reversal; later R6 restores extension |
| 900f8fb #243 R7 | standalone dvh+top; portrait phone100% up to520px | Candidate docs, not attributable device proof |
| 177ab98 #253 | publish display mode before async services | Avoids late mode flip but cannot prove stable CSS metrics |
| f193f32 #254 | JS visual height, functional viewport, screen-color bridge | Reintroduced short shell strategy |
| 4332ea9 #255 | standalone innerHeight snapshot, ignore transient resizes | Does not measure CSS/compositor transitions |
| e1b685a #256 | standalone shell and phone100vh, browser listeners only | Prior phone874 measurement still had visible defect |
| a19d4a4 #257 | Diagnostics one-time live readings + refresh | Navigates away from VN and destroys evidence of its transition |
| f6c5fca #258 | inner standalone vh, transparent controls inset, font wait, resize suppressor | Multiple sizing layers; field failure |
| e921d2a #259 | browser svh, runtime compact guard, in-place width/orientation pagination | Tests cannot reproduce installed WebApp compositor |
| db6568d #260 | restore dvh+top; phone100%; browser/row px tokens; remove suppressor | Standalone shell and safe-area contributions still live |

## Upstream research (checked 2026-09-09)

* [WebKit254868](https://bugs.webkit.org/show_bug.cgi?id=254868): installed cover apps report shortened CSS/JS heights;
  still marked NEW; the reporter observed it in iOS18.3.1. Matches the class of mismatch, not proof of UPDS causation.
* [WebKit236445 comment9](https://bugs.webkit.org/show_bug.cgi?id=236445#c9): specifically reports black-translucent
  moving absolute bottom placement above physical bottom by a top-safe-area span. Strong reason for a controlled metadata experiment.
* [WebKit237961](https://bugs.webkit.org/show_bug.cgi?id=237961): standalone cover/fixed-root gaps and overscroll issues;
  shows why fixed positioning/full CSS height alone is not a reliable paint oracle.
* [WebKit301108](https://bugs.webkit.org/show_bug.cgi?id=301108): iOS26 viewport-fit/browser-chrome regression;
  later comment reports partial improvement. Cannot infer the user's OS behavior without version and actual trace.

## Diagnostic deliverable and next decision

`?viewportdebug=1` enables the recorder and lane-local persisted preference; `?viewportdebug=0` disables it.
Only opted-in pages select `viewport-debug.webmanifest`, whose start_url retains the flag for a fresh Home Screen install.
Production viewport CSS, normal manifest, status-bar style, Scene Studio geometry, and SW caching behavior are untouched.
See [capture protocol](docs/features/IOS_VIEWPORT_CAPTURE_RU.md).

Trace contains early HTML readings; before/after service readiness/mount; first-second rAF; timed samples through30s;
ongoing500ms samples; browser/media/font/image/PWA/SW events; DOM mutation records; node identities and rect deltas;
render stacks; computed styles/pseudos; real env probes; bottom hit-test candidates; and bounded first15s/recent buffers.
Images' native decode completion has no passive browser event: record load/resource/natural size, do not force decode()
or monkeypatch browser APIs and accidentally change its scheduling. Styles are deduplicated via `styleRef` → `styles[]`.
Capture duration and dropped counts expose measurement overhead/loss. The inline pre-module recorder has only basic
viewport data; full computed geometry starts at module bootstrap, once the DOM/CSS graph is available.

Interpret the first marked transition: compare shell → grid rows → stage → portrait; compare node IDs/stacks, inset
probes, CSS units/media, and PWA/build state. If DOM remains identical while video changes, investigate actual paint /
compositor via Safari remote inspector and the metadata variants. Hit-test stacks are candidates, not pixel ownership proof.
No invariant should assert “physical bottom = innerHeight+top” until the device proves it in that mode/version.
