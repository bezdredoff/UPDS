import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('Godot Playgama Bridge setup', () => {
	it('pins the SDK, registers it before platform consumers and avoids automatic ad preload', () => {
		const project = read('godot/project.godot');
		const exportPreset = read('godot/export_presets.cfg');
		const plugin = read('godot/addons/playgama_bridge/plugin.cfg');
		const config = JSON.parse(read('godot/addons/playgama_bridge/template/playgama-bridge-config.json')) as {
			advertisement: { interstitial: { preloadOnStart: boolean }; rewarded: { preloadOnStart: boolean } };
		};

		expect(plugin).toContain('version="2.3.0"');
		expect(project).toContain('Bridge="*res://addons/playgama_bridge/bridge.gd"');
		expect(project.indexOf('Bridge="*res://addons/playgama_bridge/bridge.gd"')).toBeLessThan(
			project.indexOf('PlaygamaRuntime="*res://scripts/playgama_runtime.gd"'),
		);
		expect(project).toContain('res://addons/playgama_bridge/plugin.cfg');
		expect(exportPreset).toContain('name="Playgama Web"');
		expect(exportPreset).toContain('html/custom_html_shell="res://addons/playgama_bridge/template/index.html"');
		expect(config.advertisement.interstitial.preloadOnStart).toBe(false);
		expect(config.advertisement.rewarded.preloadOnStart).toBe(false);
	});
});
