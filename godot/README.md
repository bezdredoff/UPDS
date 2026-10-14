# UPDS Godot port

This is a separate Godot project inside the repository. It is the native port target;
the existing Vite application remains the behavioral reference while gameplay is moved
in small, verifiable slices.

## Engine and display baseline

- Godot 4.7 stable, GDScript, Compatibility renderer.
- Portrait logical viewport: 480 × 854, scaled with `canvas_items`.
- `scenes/main_menu.tscn` is the first ported screen. Its buttons expose navigation
  signals for the story, Match-3 campaign and settings slices as those are ported.
- `scenes/port_bootstrap.tscn` remains a minimal engine smoke-test fixture.
- The editor-only Godot MCP Bridge is pinned to upstream commit
  `88fe614fbbd26f1d49cb3a5905fdd1a7bc3e35c7` (MIT) and enabled for this project.

Open this directory as a project in Godot. The current main menu is the first vertical
slice; the bootstrap scene remains available for headless import and parser checks.

## Command-line validation

On Windows, run `.\godot\check.ps1 -GodotPath "C:\path\to\Godot_v4.x-stable_win64.exe"`.
The script imports the project, parses the bootstrap GDScript, and loads the scene in a
headless smoke test. The editor bridge listens on localhost port 6510 and is intended
for development, not exported builds. Keep this editor open while using Codex Godot
tools for live scene inspection and runtime interaction.

The main menu localizes to English, Russian or Belarusian. Settings opens a native
language selector; the choice is saved separately from campaign progress in
`user://player_preferences.cfg` and immediately updates the menu. Without a valid
saved choice the system locale is used. Back or Escape returns to the menu.
Settings also includes music/effects volume, mute, haptics preference and working
music/SFX previews. Defaults match the web game (32% music, 72% effects).
Menu music and preview effects are synthesized locally from the existing web
definitions; `tests/GodotAudioParity.test.ts` guards their source parity.
Mute and zero volume stop playback; focus loss stops audio until focus returns.
Haptics are enabled only on native Android/iOS; hardware verification is pending.
New Game opens the playable prologue (`VN0001–VN0022`) and continues into scene 1
(`VN0023–VN0057`) with RU/BE/EN copy, approved character art and backgrounds.
`CHOICE_00` A/B/C is persisted through the existing Story `choice` field. Continue
resumes positions in these two scenes; saves from later scenes remain intact and
unavailable until those scenes are ported. Scene 1 ends at an explicit request for
`M3_00_LOCKER_TUTORIAL`; the Match-3 runtime and post-win scene are subsequent
slices. Replacing existing progress through New Game requires confirmation.

## Native campaign persistence

`scripts/campaign_store.gd` supplies independent Story and Match-3 storage,
manual Story saves, recovery and Story export/import text. The native adapter
writes URI-encoded logical save keys under `user://campaign_saves` using a
temporary file and rename. Existing keys and schema versions are preserved.
Preferences remain in their separate config file; browser storage is not migrated
automatically. Story session persists on advance and retains in-memory progress
with a visible warning when writes fail.

`node scripts/export-godot-save-fixtures.cjs` regenerates the save contract and
web-derived parity vectors after relevant web source changes. Vitest guards the
snapshots; `godot/check.ps1` executes their native counterparts and filesystem
failure/recovery checks without touching player saves.

## Prologue source and preview

`node scripts/export-godot-prologue.cjs` refreshes the audited prologue and scene 1
content, locale/staging snapshots, original art copies and VN audio definitions.
Vitest guards their parity with the web source. The reader stops at the explicit
first Match-3 gate without advancing the save into an unported gameplay scene.

For isolated visual review, run `tests/vn_preview.tscn` in the editor: campaign
progress is in memory and player saves remain untouched. The native reader supports
Next, menu/settings return and keyboard controls; paging/history/auto and the
following scene/choice/Match-3 flow are subsequent slices.
