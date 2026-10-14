extends RefCounted

const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const SeededRandom = preload("res://scripts/seeded_random.gd")
const CASCADE_LIMIT := 24
const DEFAULT_LEVEL_ID := "M3_00_LOCKER_TUTORIAL"

var level_data: Dictionary
var tiles: Array[String] = []
var specials: Array[String] = []
var blocker_layers: Array[int] = []
var ingredients: Array[String] = []
var moves_left := 0
var collected := 0
var collected_by_tile: Dictionary = {}
var ingredients_dropped: Dictionary = {}
var blockers_cleared := 0
var _last_blockers_cleared := 0
var _last_ingredients_dropped := 0
var _last_cleared := 0
var _last_settle_dropped := 0
var state := "playing"
var _random: RefCounted
var _last_swap: Array[int] = []

func _init(configured_level: Dictionary = {}) -> void:
	if configured_level.is_empty():
		var bundle := CampaignData.load_bundle()
		level_data = CampaignData.get_level(bundle, DEFAULT_LEVEL_ID)
	else:
		level_data = configured_level.duplicate(true)
	assert(not level_data.is_empty(), "Match-3 level data is unavailable")
	reset()

func reset() -> void:
	moves_left = int(level_data.moves)
	collected = 0
	collected_by_tile.clear()
	ingredients_dropped.clear()
	blockers_cleared = 0
	_last_blockers_cleared = 0
	_last_ingredients_dropped = 0
	_last_cleared = 0
	_last_settle_dropped = 0
	state = "playing"
	_random = SeededRandom.new(int(level_data.seed))
	var cell_count := _rows() * _columns()
	tiles.resize(cell_count)
	specials.resize(cell_count)
	blocker_layers.resize(cell_count)
	ingredients.resize(cell_count)
	for index in cell_count:
		tiles[index] = ""
		specials[index] = ""
		blocker_layers[index] = 0
		ingredients[index] = ""
	for blocker: Dictionary in level_data.get("blockers", []):
		blocker_layers[int(blocker.index)] = int(blocker.layers)
	for ingredient: Dictionary in level_data.get("ingredients", []):
		ingredients[int(ingredient.index)] = str(ingredient.kind)
	_fill_initial_board()
	assert(find_matches().is_empty() and has_available_move(), "%s opening board must be playable" % str(level_data.id))
	_sync_primary_collect_count()

func objective_value(objective_index: int) -> int:
	var objectives: Array = level_data.get("objectives", [])
	if objective_index < 0 or objective_index >= objectives.size():
		return 0
	var objective: Dictionary = objectives[objective_index]
	match str(objective.get("kind", "")):
		"collect":
			return int(collected_by_tile.get(str(objective.tile), 0))
		"clearBlockers":
			return blockers_cleared
		"drop":
			return int(ingredients_dropped.get(str(objective.ingredient), 0))
		"dropGroup":
			var total := 0
			for ingredient: String in objective.ingredients:
				total += int(ingredients_dropped.get(ingredient, 0))
			return total
	return 0

func _objectives_complete() -> bool:
	var objectives: Array = level_data.get("objectives", [])
	for index in objectives.size():
		if objective_value(index) < int(objectives[index].target):
			return false
	return not objectives.is_empty()

func _sync_primary_collect_count() -> void:
	collected = 0
	for objective: Dictionary in level_data.get("objectives", []):
		if str(objective.get("kind", "")) == "collect":
			collected = int(collected_by_tile.get(str(objective.tile), 0))
			return

func attempt_swap(first: int, second: int) -> Dictionary:
	if state != "playing":
		return {"valid": false, "reason": "finished"}
	if first == second:
		return {"valid": false, "reason": "same-cell"}
	if not _are_adjacent(first, second):
		return {"valid": false, "reason": "not-adjacent"}
	if tiles[first].is_empty() or tiles[second].is_empty():
		return {"valid": false, "reason": "ingredient"}
	if _is_blocked(first) or _is_blocked(second):
		return {"valid": false, "reason": "blocked"}
	var same_tile := tiles[first] == tiles[second]
	_swap_tiles(first, second)
	var groups := find_match_groups()
	var activated: Array[int] = []
	if not specials[first].is_empty():
		activated.append(first)
	if not specials[second].is_empty():
		activated.append(second)
	var combo := _resolve_direct_combo(specials[first], specials[second])
	var creations: Array = [] if same_tile and activated.is_empty() else _find_player_special_creations(groups, first, second)
	if groups.is_empty() and activated.is_empty() and combo.is_empty() and creations.is_empty():
		_swap_tiles(first, second)
		return {"valid": false, "reason": "no-match"}
	moves_left -= 1
	_last_blockers_cleared = 0
	_last_ingredients_dropped = 0
	_last_cleared = 0
	_last_swap = [first, second]
	var cascade := _resolve(groups, activated, creations, combo, first, second)
	_last_swap.clear()
	_sync_primary_collect_count()
	if _objectives_complete():
		state = "won"
	elif moves_left <= 0:
		state = "lost"
	elif not has_available_move():
		_reshuffle_playable_board()
	return {"valid": true, "reason": "", "won": state == "won", "lost": state == "lost", "cascades": cascade, "cleared": _last_cleared, "blockersCleared": _last_blockers_cleared, "ingredientsDropped": _last_ingredients_dropped}

func find_matches() -> Array[int]:
	var result: Array[int] = []
	var included := {}
	for group in find_match_groups():
		for index in group.indices:
			included[index] = true
	for index in included:
		result.append(int(index))
	result.sort()
	return result

func find_match_groups() -> Array[Dictionary]:
	var groups: Array[Dictionary] = []
	var rows := _rows()
	var columns := _columns()
	for row in range(rows):
		var start := 0
		while start < columns:
			var index := row * columns + start
			var tile := _matchable_tile(index)
			var end := start + 1
			while not tile.is_empty() and end < columns and _matchable_tile(row * columns + end) == tile:
				end += 1
			if not tile.is_empty() and end - start >= 3:
				var indices: Array[int] = []
				for column in range(start, end):
					indices.append(row * columns + column)
				groups.append({"orientation": "row", "indices": indices})
			start = end
	for column in range(columns):
		var start := 0
		while start < rows:
			var index := start * columns + column
			var tile := _matchable_tile(index)
			var end := start + 1
			while not tile.is_empty() and end < rows and _matchable_tile(end * columns + column) == tile:
				end += 1
			if not tile.is_empty() and end - start >= 3:
				var indices: Array[int] = []
				for row in range(start, end):
					indices.append(row * columns + column)
				groups.append({"orientation": "column", "indices": indices})
			start = end
	for row in range(rows - 1):
		for column in range(columns - 1):
			var index := row * columns + column
			var tile := _matchable_tile(index)
			if tile.is_empty():
				continue
			if _matchable_tile(index + 1) == tile and _matchable_tile(index + columns) == tile and _matchable_tile(index + columns + 1) == tile:
				groups.append({"orientation": "square", "indices": [index, index + 1, index + columns, index + columns + 1]})
	return groups

func has_available_move() -> bool:
	var columns := _columns()
	for index in tiles.size():
		if index % columns < columns - 1 and _swap_creates_match(index, index + 1):
			return true
		if index + columns < tiles.size() and _swap_creates_match(index, index + columns):
			return true
	return false

func _fill_initial_board() -> void:
	var opening: Array = level_data.get("openingBoard", [])
	if opening.size() == tiles.size():
		for index in tiles.size():
			var cell: Dictionary = opening[index]
			tiles[index] = str(cell.get("tile", ""))
			specials[index] = str(cell.get("special", ""))
			blocker_layers[index] = int(cell.get("blockerLayers", blocker_layers[index]))
			ingredients[index] = str(cell.get("ingredient", ingredients[index]))
		return
	var seeded_opening: Array = level_data.get("seededOpeningBoard", [])
	if seeded_opening.size() == tiles.size():
		for index in tiles.size():
			tiles[index] = str(seeded_opening[index])
		return
	var columns := _columns()
	for index in tiles.size():
		if not _is_active(index) or not ingredients[index].is_empty():
			continue
		var candidates := _shuffled_tile_keys()
		for candidate in candidates:
			var tile := str(candidate)
			tiles[index] = tile
			if not _cell_creates_initial_match(index, columns):
				break
			else:
				tiles[index] = ""
		if tiles[index].is_empty():
			tiles[index] = _random_tile()

func _settle_columns() -> Array[int]:
	var rows := _rows()
	var columns := _columns()
	var origins: Array[int] = []
	for index in tiles.size(): origins.append(index if not tiles[index].is_empty() or not ingredients[index].is_empty() else -1)
	var dropped := _collect_bottom_ingredients(origins)
	_compact_columns(origins)
	dropped += _collect_bottom_ingredients(origins)
	if dropped > 0: _compact_columns(origins)
	_last_settle_dropped = dropped
	for index in tiles.size():
		if not _is_active(index) or _is_blocked(index): continue
		if tiles[index].is_empty() and ingredients[index].is_empty():
			tiles[index] = _random_tile()
			origins[index] = -1
	var motions: Array[Dictionary] = []
	for index in tiles.size():
		if tiles[index].is_empty() and ingredients[index].is_empty(): continue
		var origin := origins[index]
		if origin < 0:
			motions.append({"index": index, "spawn": true, "rows": maxi(1, int(index / columns) - _segment_top(index) + 1)})
		elif origin != index and int(index / columns) > int(origin / columns):
			motions.append({"index": index, "spawn": false, "rows": int(index / columns) - int(origin / columns)})
	motions.sort_custom(_anchor_precedes)
	var anchors: Array[int] = []
	for motion in motions:
		anchors.append(int(motion.index))
	return anchors

func _compact_columns(origins: Array[int]) -> void:
	var columns := _columns()
	var rows := _rows()
	for column in columns:
		var segment: Array[int] = []
		for row in rows + 1:
			var index := row * columns + column if row < rows else -1
			if row < rows and not _is_active(index):
				continue
			if row < rows and _is_blocked(index):
				_compact_segment(segment, origins)
				segment.clear()
				continue
			if row < rows: segment.append(index)
		_compact_segment(segment, origins)

func _compact_segment(indices: Array[int], origins: Array[int]) -> void:
	if indices.is_empty(): return
	var contents: Array[Dictionary] = []
	for offset in range(indices.size() - 1, -1, -1):
		var source := indices[offset]
		if not tiles[source].is_empty() or not ingredients[source].is_empty():
			contents.append({"tile": tiles[source], "special": specials[source], "ingredient": ingredients[source], "origin": origins[source]})
	for offset in range(indices.size() - 1, -1, -1):
		var target := indices[offset]
		var content_index := indices.size() - 1 - offset
		var item: Dictionary = contents[content_index] if content_index < contents.size() else {}
		tiles[target] = str(item.get("tile", ""))
		specials[target] = str(item.get("special", ""))
		ingredients[target] = str(item.get("ingredient", ""))
		origins[target] = int(item.get("origin", -1))

func _collect_bottom_ingredients(origins: Array[int]) -> int:
	var dropped := 0
	for column in _columns():
		var row := _rows() - 1
		while row >= 0 and not _is_active(row * _columns() + column): row -= 1
		if row < 0: continue
		var index := row * _columns() + column
		if ingredients[index].is_empty(): continue
		var kind := ingredients[index]
		ingredients_dropped[kind] = int(ingredients_dropped.get(kind, 0)) + 1
		ingredients[index] = ""
		tiles[index] = ""
		specials[index] = ""
		origins[index] = -1
		dropped += 1
	return dropped

func _segment_top(index: int) -> int:
	var column := index % _columns()
	var row := int(index / _columns())
	for candidate_row in range(row - 1, -1, -1):
		var candidate := candidate_row * _columns() + column
		if _is_active(candidate) and _is_blocked(candidate): return candidate_row + 1
	return 0

func _anchor_precedes(first: Dictionary, second: Dictionary) -> bool:
	if first.spawn != second.spawn:
		return bool(first.spawn)
	if first.rows != second.rows:
		return int(first.rows) > int(second.rows)
	return int(first.index) < int(second.index)

func _reshuffle_playable_board() -> void:
	var original_tiles := tiles.duplicate()
	var original_specials := specials.duplicate()
	var contents: Array[Dictionary] = []
	for index in tiles.size():
		contents.append({"tile": tiles[index], "special": specials[index]})
	for attempt in range(100):
		_shuffle(contents)
		for index in contents.size():
			tiles[index] = str(contents[index].tile)
			specials[index] = str(contents[index].special)
		if find_matches().is_empty() and has_available_move():
			return
	tiles = original_tiles
	specials = original_specials

func _swap_creates_match(first: int, second: int) -> bool:
	if not _are_adjacent(first, second) or tiles[first].is_empty() or tiles[second].is_empty() or _is_blocked(first) or _is_blocked(second):
		return false
	_swap_tiles(first, second)
	var found := not find_matches().is_empty() or not specials[first].is_empty() or not specials[second].is_empty()
	_swap_tiles(first, second)
	return found

func _cell_creates_initial_match(index: int, columns: int) -> bool:
	var row := int(index / columns)
	var column := index % columns
	var tile := tiles[index]
	var horizontal := column >= 2 and tiles[index - 1] == tile and tiles[index - 2] == tile
	var vertical := row >= 2 and tiles[index - columns] == tile and tiles[index - columns * 2] == tile
	var square := row >= 1 and column >= 1 and tiles[index - 1] == tile and tiles[index - columns] == tile and tiles[index - columns - 1] == tile
	return horizontal or vertical or square

func _are_adjacent(first: int, second: int) -> bool:
	if not _is_active(first) or not _is_active(second) or first == second:
		return false
	var columns := _columns()
	var first_row := int(first / columns)
	var second_row := int(second / columns)
	var first_column := first % columns
	var second_column := second % columns
	return abs(first_row - second_row) + abs(first_column - second_column) == 1

func _shuffle(values: Array) -> void:
	for index in range(values.size() - 1, 0, -1):
		var other: int = _random.index(index + 1)
		var previous: Variant = values[index]
		values[index] = values[other]
		values[other] = previous

func _swap_tiles(first: int, second: int) -> void:
	var previous := tiles[first]
	tiles[first] = tiles[second]
	tiles[second] = previous
	var previous_special := specials[first]
	specials[first] = specials[second]
	specials[second] = previous_special

func _resolve(groups: Array[Dictionary], activated: Array[int], creations: Array, combo: String, first: int, second: int) -> int:
	var cascade := 0
	var anchors: Array[int] = [first, second]
	while cascade < CASCADE_LIMIT and (not groups.is_empty() or not activated.is_empty() or (cascade == 0 and not creations.is_empty())):
		cascade += 1
		var by_index := {}
		if cascade == 1:
			for creation in creations:
				by_index[creation.index] = creation
		else:
			for creation in _find_automatic_special_creations(groups, anchors):
				by_index[creation.index] = creation
		var clear := {}
		for group in groups:
			for index in group.indices:
				clear[index] = true
		for index in activated:
			clear[index] = true
		for creation in by_index.values():
			for index in creation.get("consumed", []):
				clear[index] = true
		if cascade == 1 and not combo.is_empty():
			for index in _direct_combo_targets(combo, first, second):
				clear[index] = true
		_expand_special_clear(clear)
		for index in by_index:
			if not activated.has(int(index)):
				clear.erase(index)
		for index in clear:
			if index < 0 or index >= tiles.size() or tiles[index].is_empty() or _is_blocked(index):
				continue
			var tile := tiles[index]
			collected_by_tile[tile] = int(collected_by_tile.get(tile, 0)) + 1
			tiles[index] = ""
			specials[index] = ""
			_last_cleared += 1
		_last_blockers_cleared += _damage_blockers(clear)
		for index in by_index:
			if tiles[index].is_empty() or clear.has(index):
				continue
			specials[index] = str(by_index[index].kind)
		anchors = _settle_columns()
		_last_ingredients_dropped += _last_settle_dropped
		groups = find_match_groups()
		activated.clear()
	return cascade

func _find_player_special_creations(groups: Array[Dictionary], first: int, second: int) -> Array:
	var swapped: Array[int] = [first, second]
	var candidates: Array = []
	for group in groups:
		if group.orientation != "square" and group.indices.size() >= 5 and _contains_swapped(group.indices, swapped):
			candidates.append({"index": second if group.indices.has(second) else first, "kind": "insight"})
	if not candidates.is_empty():
		return _unique_creations(candidates)
	var row_groups: Array = groups.filter(func(group: Dictionary) -> bool: return group.orientation == "row")
	var column_groups: Array = groups.filter(func(group: Dictionary) -> bool: return group.orientation == "column")
	for row_group in row_groups:
		for column_group in column_groups:
			for index in row_group.indices:
				if column_group.indices.has(index) and _contains_swapped(row_group.indices + column_group.indices, swapped):
					candidates.append({"index": index, "kind": "evidence"})
	if not candidates.is_empty():
		return _unique_creations(candidates)
	for anchor in swapped:
		var row := int(anchor / _columns())
		var column := anchor % _columns()
		for top in [row - 1, row]:
			for left in [column - 1, column]:
				if top < 0 or left < 0 or top >= _rows() - 1 or left >= _columns() - 1:
					continue
				var square: Array[int] = [top * _columns() + left, top * _columns() + left + 1, (top + 1) * _columns() + left, (top + 1) * _columns() + left + 1]
				var tile := tiles[anchor]
				if square.all(func(index: int) -> bool: return tiles[index] == tile):
					candidates.append({"index": second if square.has(second) else anchor, "kind": "lead", "consumed": square})
	if not candidates.is_empty():
		return _unique_creations(candidates)
	for group in groups:
		if group.orientation != "square" and group.indices.size() == 4 and _contains_swapped(group.indices, swapped):
			candidates.append({"index": second if group.indices.has(second) else first, "kind": "flash-row" if group.orientation == "row" else "flash-column"})
	return _unique_creations(candidates)

func _find_automatic_special_creations(groups: Array[Dictionary], preferred: Array[int]) -> Array:
	var candidates: Array = []
	for group in groups:
		if group.orientation == "square" or group.indices.size() < 5:
			continue
		var anchor := _creation_anchor(group.indices, preferred)
		if anchor >= 0:
			candidates.append({"index": anchor, "kind": "insight"})
	if not candidates.is_empty():
		return _unique_creations(candidates)
	var row_groups: Array = groups.filter(func(group: Dictionary) -> bool: return group.orientation == "row")
	var column_groups: Array = groups.filter(func(group: Dictionary) -> bool: return group.orientation == "column")
	for row_group in row_groups:
		for column_group in column_groups:
			for index in row_group.indices:
				if column_group.indices.has(index) and specials[index].is_empty():
					candidates.append({"index": index, "kind": "evidence"})
	if not candidates.is_empty():
		return _unique_creations(candidates)
	for group in groups:
		if group.orientation == "square":
			var anchor := _creation_anchor(group.indices, preferred)
			if anchor >= 0:
				candidates.append({"index": anchor, "kind": "lead", "consumed": group.indices})
	if not candidates.is_empty():
		return _unique_creations(candidates)
	for group in groups:
		if group.orientation != "square" and group.indices.size() == 4:
			var anchor := _creation_anchor(group.indices, preferred)
			if anchor >= 0:
				candidates.append({"index": anchor, "kind": "flash-row" if group.orientation == "row" else "flash-column"})
	return _unique_creations(candidates)

func _unique_creations(candidates: Array) -> Array:
	var seen := {}
	var unique: Array = []
	for creation in candidates:
		var index := int(creation.index)
		if seen.has(index):
			continue
		seen[index] = true
		unique.append(creation)
	return unique

func _creation_anchor(indices: Array, preferred: Array[int]) -> int:
	for index in preferred:
		if indices.has(index) and specials[index].is_empty():
			return index
	var available: Array[int] = []
	for index in indices:
		if specials[index].is_empty():
			available.append(int(index))
	return available[int((available.size() - 1) / 2)] if not available.is_empty() else -1

func _contains_swapped(indices: Array, swapped: Array[int]) -> bool:
	return indices.has(swapped[0]) or indices.has(swapped[1])

func _expand_special_clear(clear: Dictionary) -> void:
	var queue: Array = clear.keys()
	var expanded := {}
	while not queue.is_empty():
		var index := int(queue.pop_front())
		if expanded.has(index):
			continue
		expanded[index] = true
		var kind := specials[index]
		if kind.is_empty():
			continue
		var targets: Array[int] = []
		var rows := _rows()
		var columns := _columns()
		var row := int(index / columns)
		var column := index % columns
		match kind:
			"flash-row":
				for col in range(columns):
					targets.append(row * columns + col)
			"flash-column":
				for target_row in range(rows):
					targets.append(target_row * columns + column)
			"evidence":
				for target_row in range(maxi(0, row - 1), mini(rows - 1, row + 1) + 1):
					for col in range(maxi(0, column - 1), mini(columns - 1, column + 1) + 1):
						targets.append(target_row * columns + col)
			"lead":
				targets = _lead_targets(index)
			"insight":
				var tile := tiles[index]
				if not tile.is_empty():
					for target in tiles.size():
						if tiles[target] == tile: targets.append(target)
		for target in targets:
			if not clear.has(target):
				clear[target] = true
				queue.append(target)

func _lead_targets(index: int) -> Array[int]:
	var columns := _columns()
	var row := int(index / columns)
	var column := index % columns
	var targets: Array[int] = [index]
	if row > 0: targets.append(index - columns)
	if row < _rows() - 1: targets.append(index + columns)
	if column > 0: targets.append(index - 1)
	if column < columns - 1: targets.append(index + 1)
	for objective: Dictionary in level_data.get("objectives", []):
		if str(objective.get("kind", "")) != "collect": continue
		var target_tile := str(objective.tile)
		if int(collected_by_tile.get(target_tile, 0)) >= int(objective.target): continue
		for candidate in tiles.size():
			if not targets.has(candidate) and tiles[candidate] == target_tile and not _is_blocked(candidate):
				targets.append(candidate)
				return targets
	for candidate in tiles.size():
		if not targets.has(candidate) and not tiles[candidate].is_empty():
			targets.append(candidate)
			break
	return targets

func _resolve_direct_combo(first: String, second: String) -> String:
	var first_flash := first == "flash-row" or first == "flash-column"
	var second_flash := second == "flash-row" or second == "flash-column"
	if first.is_empty() and second.is_empty():
		return ""
	if first == "insight" and second.is_empty() or second == "insight" and first.is_empty():
		return "insight-normal"
	if first == "insight" or second == "insight":
		return "insight-special"
	if first_flash and second_flash:
		return "flash-flash"
	if first_flash and second == "evidence" or first == "evidence" and second_flash:
		return "flash-evidence"
	if first == "evidence" and second == "evidence":
		return "evidence-evidence"
	if first == "lead" and second_flash or first_flash and second == "lead":
		return "lead-flash"
	if first == "lead" and second == "evidence" or first == "evidence" and second == "lead":
		return "lead-evidence"
	return "fallback"

func _direct_combo_targets(combo: String, first: int, second: int) -> Array[int]:
	var targets := {}
	var columns := _columns()
	var rows := _rows()
	var center_row := int(second / columns)
	var center_column := second % columns
	if combo == "insight-normal" or combo == "insight-special":
		var insight_index := first if specials[first] == "insight" else second
		var partner := second if insight_index == first else first
		var target_tile := tiles[partner]
		for index in tiles.size():
			if tiles[index] == target_tile:
				targets[index] = true
		targets[insight_index] = true
		if combo == "insight-special": targets[partner] = true
	elif combo == "flash-flash" or combo == "lead-flash":
		for col in columns:
			targets[center_row * columns + col] = true
		for row in rows:
			targets[row * columns + center_column] = true
		if combo == "lead-flash":
			for index in _lead_targets(second):
				targets[index] = true
	elif combo == "flash-evidence":
		for row in range(maxi(0, center_row - 1), mini(rows - 1, center_row + 1) + 1):
			for col in columns:
				targets[row * columns + col] = true
		for col in range(maxi(0, center_column - 1), mini(columns - 1, center_column + 1) + 1):
			for row in rows:
				targets[row * columns + col] = true
	elif combo == "evidence-evidence" or combo == "lead-evidence":
		for row in range(maxi(0, center_row - 2), mini(rows - 1, center_row + 2) + 1):
			for col in range(maxi(0, center_column - 2), mini(columns - 1, center_column + 2) + 1):
				targets[row * columns + col] = true
		if combo == "lead-evidence":
			for index in _lead_targets(second):
				targets[index] = true
	else:
		targets[first] = true
		targets[second] = true
	var result: Array[int] = []
	for index in targets:
		result.append(int(index))
	return result

func _random_tile() -> String:
	var active_tiles: Array = level_data.get("activeTiles", [])
	if active_tiles.is_empty(): return ""
	var weights: Dictionary = level_data.get("spawnWeights", {})
	if weights.is_empty(): return str(active_tiles[_random.index(active_tiles.size())])
	var total := 0.0
	for tile: String in active_tiles: total += float(weights.get(tile, 1.0))
	var roll: float = _random.next_float() * total
	for tile: String in active_tiles:
		roll -= float(weights.get(tile, 1.0))
		if roll < 0.0: return tile
	return str(active_tiles.back())

func _shuffled_tile_keys() -> Array:
	var remaining: Array = level_data.get("activeTiles", []).duplicate()
	var ordered: Array = []
	var weights: Dictionary = level_data.get("spawnWeights", {})
	if weights.is_empty():
		_shuffle(remaining)
		return remaining
	while not remaining.is_empty():
		var total := 0.0
		for tile: String in remaining: total += float(weights.get(tile, 1.0))
		var roll: float = _random.next_float() * total
		var selected := remaining.size() - 1
		for index in remaining.size():
			roll -= float(weights.get(str(remaining[index]), 1.0))
			if roll < 0.0:
				selected = index
				break
		ordered.append(remaining.pop_at(selected))
	return ordered

func _rows() -> int:
	return int(level_data.get("rows", 0))

func _columns() -> int:
	return int(level_data.get("columns", 0))

func _is_active(index: int) -> bool:
	if index < 0 or index >= tiles.size(): return false
	for hole: Variant in level_data.get("boardHoles", []):
		if int(hole) == index: return false
	return true

func _is_blocked(index: int) -> bool:
	return index >= 0 and index < blocker_layers.size() and blocker_layers[index] > 0 and str(level_data.get("blockerStyle", "solid")) != "overlay"

func _matchable_tile(index: int) -> String:
	if not _is_active(index) or _is_blocked(index): return ""
	return tiles[index]

func _damage_blockers(cleared: Dictionary) -> int:
	var damaged := {}
	for raw_index: Variant in cleared.keys():
		var index := int(raw_index)
		if index < 0 or index >= blocker_layers.size(): continue
		var row := int(index / _columns())
		var column := index % _columns()
		for neighbour in [index, index - 1, index + 1, index - _columns(), index + _columns()]:
			if neighbour < 0 or neighbour >= blocker_layers.size(): continue
			if absf(float(int(neighbour / _columns()) - row)) + absf(float(neighbour % _columns() - column)) > 1: continue
			if blocker_layers[neighbour] > 0: damaged[neighbour] = true
	var removed := 0
	for index: int in damaged:
		blocker_layers[index] -= 1
		if blocker_layers[index] == 0:
			blockers_cleared += 1
			removed += 1
	return removed
