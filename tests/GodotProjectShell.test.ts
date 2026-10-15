import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('Godot port project shell', () => {
	const project = read('godot/project.godot');
	const scene = read('godot/scenes/port_bootstrap.tscn');
	const script = read('godot/scripts/port_bootstrap.gd');
	const smoke = read('godot/tests/port_bootstrap_smoke.gd');
	const checkScript = read('godot/check.ps1');
	const readme = read('godot/README.md');
	const phoneFrame = read('godot/scripts/phone_frame.gd');
	const mainMenu = read('godot/scripts/main_menu.gd');
	const nestedScreens = [
		read('godot/scripts/vn_screen.gd'),
		read('godot/scripts/match3_campaign_screen.gd'),
		read('godot/scripts/match3_screen.gd'),
		read('godot/scripts/settings_screen.gd'),
	];

	it('pins a stable portrait project entry point and compatible renderer', () => {
		expect(project).toContain('config/features=PackedStringArray("4.7", "GL Compatibility")');
		expect(project).toContain('run/main_scene="res://scenes/main_menu.tscn"');
		expect(project).toContain('window/size/viewport_width=390');
		expect(project).toContain('window/size/viewport_height=844');
		expect(project).toContain('window/stretch/aspect="expand"');
		expect(project).toContain('renderer/rendering_method="gl_compatibility"');
	});

	it('keeps the bootstrap available as a non-gameplay smoke fixture', () => {
		expect(scene).toContain('path="res://scripts/port_bootstrap.gd"');
		expect(scene).toContain('UPDS · Godot port shell');
		expect(script).toContain('const PORT_STAGE := "project_shell"');
		expect(smoke).toContain('res://scenes/port_bootstrap.tscn');
		expect(checkScript).toContain('res://tests/port_bootstrap_smoke.gd');
		expect(readme).toContain('main menu is the entry point');
	});

	it('applies the phone-frame transform once and lets nested player screens inherit it', () => {
		expect(mainMenu).toContain('PhoneFrame.fit(self)');
		expect(phoneFrame).toContain('parent.has_meta(PHONE_FRAME_META)');
		expect(phoneFrame).toContain('control.set_meta(PHONE_FRAME_META, true)');
		for (const screen of nestedScreens) expect(screen).toContain('PhoneFrame.fit(self)');
	});
});
