# UPDS Godot port

This is a separate Godot project inside the repository. It is the native port target;
the existing Vite application remains the behavioral reference while gameplay is moved
in small, verifiable slices.

## Engine and display baseline

- Godot 4.7 stable, GDScript, Compatibility renderer.
- Portrait logical viewport: 480 × 854, scaled with `canvas_items`.
- `scenes/port_bootstrap.tscn` is an explicit development shell, not a playable game.

Open this directory as a project in Godot. The first gameplay slice should replace the
bootstrap status screen only when its interaction and content contract are ready to be
ported and compared with the web reference.

## Command-line validation

On Windows, run `.\godot\check.ps1 -GodotPath "C:\path\to\Godot_v4.x-stable_win64.exe"`.
The script imports the project, parses the bootstrap GDScript, and loads the scene in a
headless smoke test. The editor bridge is a separate optional setup for live scene
inspection and runtime interaction.
