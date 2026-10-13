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
The Continue action remains unavailable until Godot save support is ported.
