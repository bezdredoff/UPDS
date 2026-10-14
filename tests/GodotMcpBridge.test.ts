import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('Godot MCP bridge setup', () => {
	it('enables the pinned bridge and runtime capture in the Godot project', () => {
		const project = read('godot/project.godot');
		const plugin = read('godot/addons/godot-mcp/plugin.cfg');
		const pluginScript = read('godot/addons/godot-mcp/plugin.gd');
		const bridge = read('godot/addons/godot-mcp/mcp_bridge.gd');
		const addonLicense = read('godot/addons/godot-mcp/LICENSE');
		const readme = read('godot/README.md');

		expect(project).toContain('enabled=PackedStringArray("res://addons/godot-mcp/plugin.cfg", "res://addons/playgama_bridge/plugin.cfg")');
		expect(project).toContain('McpRuntime="*res://addons/godot-mcp/mcp_runtime.gd"');
		expect(project).toContain('bridge_port=6510');
		expect(plugin).toContain('name="Godot MCP Bridge"');
		expect(pluginScript).toContain('const DEFAULT_BRIDGE_PORT := 6510');
		expect(pluginScript).toContain('const _AUTOLOAD_PATH := "res://addons/godot-mcp/mcp_runtime.gd"');
		expect(pluginScript).toContain('_register_autoload()');
		expect(pluginScript).toContain('var _registered_autoload := false');
		expect(pluginScript).toContain('if not _registered_autoload:');
		expect(pluginScript).not.toContain('_owns_autoload');
		expect(bridge).toContain('_server.listen(port, "127.0.0.1")');
		expect(addonLicense).toContain('MIT License');
		expect(readme).toContain('88fe614fbbd26f1d49cb3a5905fdd1a7bc3e35c7');
		expect(readme).toContain('`McpRuntime` capture autoload');
	});
});
