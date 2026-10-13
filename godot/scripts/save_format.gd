extends RefCounted

const CONTRACT = preload("res://data/save_contract.json")
const JSON_GRAMMAR := """(?x)
\\A(?&value)\\z
(?(DEFINE)
 (?<ws>[\\x20\\t\\r\\n]*)
 (?<string>"(?:[^"\\\\\\x00-\\x1f]|\\\\(?:["\\\\/bfnrt]|u[0-9a-fA-F]{4}))*")
 (?<number>-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)
 (?<value>(?&ws)(?:(?&string)|(?&number)|true|false|null|(?&array)|(?&object))(?&ws))
 (?<array>\\[(?&ws)(?:(?&value)(?:,(?&value))*)?\\])
 (?<object>\\{(?&ws)(?:(?&string)(?&ws):(?&value)(?:,(?&ws)(?&string)(?&ws):(?&value))*)?\\})
)
"""


static func parse_json(text: String) -> Dictionary:
	# Godot's parser accepts trailing commas/control characters/lax numbers.
	# Validate the JSON grammar first to preserve the web JSON.parse boundary.
	var grammar := RegEx.create_from_string(JSON_GRAMMAR)
	if grammar.search(text) == null:
		return {"ok": false}
	var json := JSON.new()
	if json.parse(text) != OK:
		return {"ok": false}
	return {"ok": true, "value": json.data}


static func fresh_story() -> Dictionary:
	return {"scene": 0, "line": 0, "choice": "A", "clues": [], "completed": [],
		"attempts": {}, "readLines": [], "tutorialsCompleted": [], "storyChoices": {}}


static func fresh_match3() -> Dictionary:
	return {"completed": [], "attempts": {}, "bestMovesLeft": {}, "tutorialsCompleted": []}


static func normalize_story(value: Variant) -> Dictionary:
	if not value is Dictionary:
		return fresh_story()
	var result := fresh_story()
	var scene := _number(value.get("scene", NAN))
	var line := _number(value.get("line", NAN))
	if _integer(scene):
		result.scene = clampf(scene, 0, CONTRACT.data.storySceneIds.size() - 1)
	if _integer(line):
		result.line = maxf(0, line)
	if value.get("choice") in ["A", "B", "C"]:
		result.choice = value.choice
	result.clues = _valid_strings(value.get("clues"), CONTRACT.data.clueIds)
	for raw in _array(value.get("completed")):
		var index := _number(raw)
		if _integer(index) and index >= 0 and index < CONTRACT.data.levelIds.size() and not result.completed.has(index):
			result.completed.append(index)
	result.attempts = _counts(value.get("attempts"))
	var line_pattern := RegEx.create_from_string("^VN[0-9]{4}[ABC]?\\z")
	for id in _array(value.get("readLines")):
		if id is String and line_pattern.search(id) != null and not result.readLines.has(id):
			result.readLines.append(id)
	result.tutorialsCompleted = _valid_strings(value.get("tutorialsCompleted"), CONTRACT.data.tutorialConceptIds)
	var choices: Variant = value.get("storyChoices")
	if choices is Dictionary:
		for gate in choices:
			if CONTRACT.data.storyChoiceGateIds.has(gate) and choices[gate] in ["A", "B", "C"]:
				result.storyChoices[gate] = choices[gate]
	return result


static func normalize_match3(value: Variant) -> Dictionary:
	if not value is Dictionary:
		return fresh_match3()
	return {
		"completed": _valid_strings(value.get("completed"), CONTRACT.data.levelIds),
		"attempts": _counts(value.get("attempts"), true),
		"bestMovesLeft": _counts(value.get("bestMovesLeft"), true),
		"tutorialsCompleted": _valid_strings(value.get("tutorialsCompleted"), CONTRACT.data.tutorialConceptIds),
	}


static func decode_story(value: Variant) -> Variant:
	if not value is Dictionary:
		return null
	if value.get("format") == "upds-campaign-save":
		var schema := _number(value.get("schemaVersion", NAN))
		if value.get("saveKey") != CONTRACT.data.storyKey or not _schema(schema, CONTRACT.data.storySchema) or not value.get("state") is Dictionary:
			return null
		return {"state": normalize_story(value.state), "schemaVersion": schema}
	if value.has("saveKey") and value.saveKey != CONTRACT.data.storyKey:
		return null
	var recognized := false
	for field in fresh_story():
		recognized = recognized or value.has(field)
	var schema := _number(value.get("schemaVersion", 0))
	if not recognized or not _schema(schema, CONTRACT.data.storySchema):
		return null
	return {"state": normalize_story(value), "schemaVersion": schema}


static func decode_match3(value: Variant) -> Variant:
	if not value is Dictionary or not _schema(_number(value.get("schemaVersion", 0)), CONTRACT.data.match3Schema):
		return null
	return normalize_match3(value)


static func encode_story(state: Variant, saved_at: String) -> Dictionary:
	var result := normalize_story(state)
	result.merge({"schemaVersion": CONTRACT.data.storySchema, "savedAt": saved_at, "appVersion": CONTRACT.data.appVersion})
	return result


static func encode_match3(state: Variant, saved_at: String) -> Dictionary:
	var result := normalize_match3(state)
	result.merge({"schemaVersion": CONTRACT.data.match3Schema, "savedAt": saved_at})
	return result


static func export_story(state: Variant, exported_at: String) -> Dictionary:
	return {"format": "upds-campaign-save", "exportVersion": 1, "saveKey": CONTRACT.data.storyKey,
		"schemaVersion": CONTRACT.data.storySchema, "appVersion": CONTRACT.data.appVersion,
		"exportedAt": exported_at, "state": normalize_story(state)}


static func _schema(value: float, maximum: float) -> bool:
	return _integer(value) and value >= 0 and value <= maximum


static func _integer(value: float) -> bool:
	return is_finite(value) and floorf(value) == value


static func _array(value: Variant) -> Array:
	return value if value is Array else []


static func _valid_strings(value: Variant, allowed: Array) -> Array:
	var result := []
	for entry in _array(value):
		if entry is String and allowed.has(entry) and not result.has(entry):
			result.append(entry)
	return result


static func _counts(value: Variant, known_levels_only: bool = false) -> Dictionary:
	var result := {}
	if value is Dictionary:
		for key in value:
			if known_levels_only and not CONTRACT.data.levelIds.has(key):
				continue
			var count := _number(value[key])
			result[key] = maxf(0, floorf(count)) if not is_nan(count) else 0
	return result


# Match Number(...) coercion in the existing TypeScript save normalizers.
static func _number(value: Variant) -> float:
	if value == null:
		return 0.0
	if value is bool:
		return 1.0 if value else 0.0
	if value is int or value is float:
		return float(value)
	if value is Array:
		return _number(_js_string(value))
	if not value is String:
		return NAN
	var text: String = value
	# ECMAScript WhiteSpace/LineTerminator characters accepted by Number().
	var whitespace := "\u0009\u000a\u000b\u000c\u000d \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff"
	var begin := 0
	var end := text.length()
	while begin < end and whitespace.contains(text[begin]):
		begin += 1
	while end > begin and whitespace.contains(text[end - 1]):
		end -= 1
	text = text.substr(begin, end - begin)
	if text.is_empty():
		return 0.0
	if text in ["Infinity", "+Infinity", "-Infinity"]:
		return -INF if text == "-Infinity" else INF
	var decimal := RegEx.create_from_string("^[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?$")
	if decimal.search(text) != null:
		return text.to_float()
	var radix := RegEx.create_from_string("^0([xX][0-9a-fA-F]+|[bB][01]+|[oO][0-7]+)$")
	if radix.search(text) != null:
		var base := 16 if text[1].to_lower() == "x" else (2 if text[1].to_lower() == "b" else 8)
		var number := 0.0
		for character in text.substr(2).to_lower():
			number = number * base + "0123456789abcdef".find(character)
		return number
	return NAN


static func _js_string(value: Variant) -> String:
	if value == null:
		return ""
	if value is Array:
		var parts := PackedStringArray()
		for entry in value:
			parts.append(_js_string(entry))
		return ",".join(parts)
	if value is bool:
		return "true" if value else "false"
	if value is Dictionary:
		return "[object Object]"
	if value is float:
		return JSON.stringify(value, "", true, true)
	return str(value)


# JSON.stringify in the web build serializes non-finite numbers as null.
static func json_safe(value: Variant) -> Variant:
	if value is float and not is_finite(value):
		return null
	if value is Dictionary:
		var result := {}
		for key in value:
			result[key] = json_safe(value[key])
		return result
	if value is Array:
		var result := []
		for entry in value:
			result.append(json_safe(entry))
		return result
	return value
