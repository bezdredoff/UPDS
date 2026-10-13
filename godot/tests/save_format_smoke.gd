extends SceneTree

const Format = preload("res://scripts/save_format.gd")
const Fixtures = preload("res://tests/save_format_cases.json")


func _initialize() -> void:
	for fixture in Fixtures.data.cases:
		var actual: Variant
		match fixture.operation:
			"parse_json": actual = Format.parse_json(fixture.input)
			"normalize_story": actual = Format.normalize_story(fixture.input)
			"normalize_match3": actual = Format.normalize_match3(fixture.input)
			"decode_story": actual = Format.decode_story(fixture.input)
			"decode_match3": actual = Format.decode_match3(fixture.input)
			"encode_story": actual = Format.encode_story(fixture.input, Fixtures.data.timestamp)
			"encode_match3": actual = Format.encode_match3(fixture.input, Fixtures.data.timestamp)
			"export_story": actual = Format.export_story(fixture.input, Fixtures.data.timestamp)
		actual = JSON.parse_string(JSON.stringify(Format.json_safe(actual), "", true, true))
		assert(actual == fixture.expected, "%s mismatch: actual=%s expected=%s" % [fixture.name, JSON.stringify(actual), JSON.stringify(fixture.expected)])
	print("UPDS Godot save format parity passed (%d cases)." % Fixtures.data.cases.size())
	quit()
