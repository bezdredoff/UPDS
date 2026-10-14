import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('Godot main menu slice', () => {
	const project = read('godot/project.godot');
	const scene = read('godot/scenes/main_menu.tscn');
	const script = read('godot/scripts/main_menu.gd');
	const copy = read('godot/scripts/menu_copy.gd');
	const smoke = read('godot/tests/main_menu_smoke.gd');
	const checkScript = read('godot/check.ps1');

	it('uses the ported main menu as the project entry point and includes its art', () => {
		expect(project).toContain('run/main_scene="res://scenes/main_menu.tscn"');
		expect(scene).toContain('res://assets/backgrounds/BG_CLUBROOM_DAY.webp');
		expect(scene).toContain('res://assets/characters/miku/portrait_neutral_256.png');
		expect(scene).toContain('res://assets/characters/onoe/portrait_neutral_256.png');
		expect(scene).toContain('res://assets/characters/ayuki/portrait_neutral_256.png');
		expect(scene.match(/theme_override_styles\/panel = SubResource\("StyleBoxFlat_medallion_shadow"\)/g)).toHaveLength(3);
	});

	it('keeps copy in supported locales and exposes navigation as signals', () => {
		for (const locale of ['en', 'ru', 'be']) expect(copy).toContain(`"${locale}": {`);
		for (const signal of ['new_game_requested', 'continue_requested', 'campaign_requested', 'settings_requested']) {
			expect(script).toContain(`signal ${signal}`);
		}
		expect(script).toContain('continue_button.disabled = not session.has_progress() or not session.supports_position()');
		expect(script).toContain('continue_button.modulate = Color(1, 1, 1, 0.38) if continue_button.disabled else Color.WHITE');
		expect(script).toContain('button.add_theme_stylebox_override("disabled", button.get_theme_stylebox("normal"))');
		expect(script).toContain('font.font_weight = 850 if primary else 700');
		expect(smoke).toContain('Disabled Continue should use the source web opacity');
		expect(smoke).toContain('UPDS Godot main menu smoke test passed (locale: %s).');
		expect(checkScript).toContain('res://tests/main_menu_smoke.gd');
	});
});
