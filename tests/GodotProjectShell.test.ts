import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('Godot port project shell', () => {
	const project = read('godot/project.godot');
	const scene = read('godot/scenes/port_bootstrap.tscn');
	const script = read('godot/scripts/port_bootstrap.gd');
	const readme = read('godot/README.md');

	it('pins a stable portrait project entry point and compatible renderer', () => {
		expect(project).toContain('config/features=PackedStringArray("4.7", "GL Compatibility")');
		expect(project).toContain('run/main_scene="res://scenes/port_bootstrap.tscn"');
		expect(project).toContain('window/size/viewport_width=480');
		expect(project).toContain('window/size/viewport_height=854');
		expect(project).toContain('renderer/rendering_method="gl_compatibility"');
	});

	it('keeps the first scene explicitly identified as a non-gameplay bootstrap', () => {
		expect(scene).toContain('path="res://scripts/port_bootstrap.gd"');
		expect(scene).toContain('UPDS · Godot port shell');
		expect(script).toContain('const PORT_STAGE := "project_shell"');
		expect(readme).toContain('not a playable game');
	});
});
