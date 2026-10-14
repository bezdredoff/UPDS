extends RefCounted

const CAMPAIGN_PATH := "res://data/campaign_match3_levels.json"
const SUPPORTED_SCHEMA_VERSION := 1


static func load_bundle(path: String = CAMPAIGN_PATH) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {"error": "campaign data file is missing: %s" % path}
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
	if not parsed is Dictionary:
		return {"error": "campaign data root must be an object"}
	var errors := validate_bundle(parsed)
	if not errors.is_empty():
		return {"error": "; ".join(errors)}
	return parsed


static func get_level(bundle: Dictionary, level_id: String) -> Dictionary:
	for level: Dictionary in bundle.get("levels", []):
		if str(level.get("id", "")) == level_id:
			return level
	return {}


static func validate_bundle(bundle: Dictionary) -> PackedStringArray:
	var errors := PackedStringArray()
	if int(bundle.get("schemaVersion", -1)) != SUPPORTED_SCHEMA_VERSION:
		errors.append("unsupported campaign Match-3 schema version")
	var levels: Variant = bundle.get("levels", null)
	if not levels is Array or levels.is_empty():
		errors.append("campaign levels must be a non-empty array")
		return errors
	var seen_ids := {}
	for value: Variant in levels:
		if not value is Dictionary:
			errors.append("campaign level must be an object")
			continue
		var level: Dictionary = value
		var level_id := str(level.get("id", ""))
		var prefix := level_id if not level_id.is_empty() else "campaign level"
		if level_id.is_empty() or seen_ids.has(level_id):
			errors.append("%s: missing or duplicate level id" % prefix)
		seen_ids[level_id] = true
		var rows := int(level.get("rows", 0))
		var columns := int(level.get("columns", 0))
		var cell_count := rows * columns
		if rows < 3 or columns < 3 or cell_count <= 0:
			errors.append("%s: invalid board dimensions" % prefix)
			continue
		if int(level.get("moves", 0)) <= 0:
			errors.append("%s: moves must be positive" % prefix)
		var active_tiles: Variant = level.get("activeTiles", null)
		if not active_tiles is Array or active_tiles.is_empty():
			errors.append("%s: active tile list must be non-empty" % prefix)
		var holes := _index_set(level.get("boardHoles", []), cell_count, prefix, "board hole", errors)
		var opening: Variant = level.get("openingBoard", null)
		if not opening is Array or opening.size() != cell_count:
			errors.append("%s: opening board size does not match dimensions" % prefix)
			continue
		for index in cell_count:
			var cell: Variant = opening[index]
			if not cell is Dictionary:
				errors.append("%s: opening cell %d must be an object" % [prefix, index])
				continue
			if holes.has(index) and (not str(cell.get("tile", "")).is_empty() or not str(cell.get("ingredient", "")).is_empty()):
				errors.append("%s: board hole %d contains gameplay contents" % [prefix, index])
		var objectives: Variant = level.get("objectives", null)
		if not objectives is Array or objectives.is_empty():
			errors.append("%s: objectives must be a non-empty array" % prefix)
		var placements: Variant = level.get("blockers", null)
		if not placements is Array:
			errors.append("%s: blockers must be an array" % prefix)
		else:
			_index_set(placements.map(func(item: Variant) -> int: return int(item.get("index", -1)) if item is Dictionary else -1), cell_count, prefix, "blocker", errors)
		var ingredients: Variant = level.get("ingredients", null)
		if not ingredients is Array:
			errors.append("%s: ingredients must be an array" % prefix)
		else:
			_index_set(ingredients.map(func(item: Variant) -> int: return int(item.get("index", -1)) if item is Dictionary else -1), cell_count, prefix, "ingredient", errors)
	var assets: Variant = bundle.get("assets", null)
	if not assets is Dictionary:
		errors.append("campaign gameplay assets must be an object")
	return errors


static func _index_set(values: Variant, cell_count: int, prefix: String, label: String, errors: PackedStringArray) -> Dictionary:
	var result := {}
	if not values is Array:
		errors.append("%s: %s list must be an array" % [prefix, label])
		return result
	for raw_index: Variant in values:
		var index := int(raw_index.get("index", -1)) if raw_index is Dictionary else int(raw_index)
		if index < 0 or index >= cell_count:
			errors.append("%s: %s index outside board" % [prefix, label])
		elif result.has(index):
			errors.append("%s: duplicate %s index %d" % [prefix, label, index])
		else:
			result[index] = true
	return result
