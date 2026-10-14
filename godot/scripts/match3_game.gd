extends RefCounted

const Level = preload("res://data/locker_match3.json")
const SeededRandom = preload("res://scripts/seeded_random.gd")
const CASCADE_LIMIT := 24

var tiles: Array[String] = []
var moves_left := 0
var collected := 0
var state := "playing"
var _random: RefCounted

func _init() -> void:
	reset()

func reset() -> void:
	moves_left = int(Level.data.moves)
	collected = 0
	state = "playing"
	_random = SeededRandom.new(int(Level.data.seed))
	for attempt in range(100):
		tiles.clear()
		for _index in range(int(Level.data.rows) * int(Level.data.columns)):
			tiles.append("")
		_fill_initial_board()
		if find_matches().is_empty() and has_available_move():
			return
	assert(false, "Could not generate a playable M3_00 board")

func attempt_swap(first: int, second: int) -> Dictionary:
	if state != "playing":
		return {"valid": false, "reason": "finished"}
	if not _are_adjacent(first, second):
		return {"valid": false, "reason": "not-adjacent"}
	_swap_tiles(first, second)
	var matches := find_matches()
	if matches.is_empty():
		_swap_tiles(first, second)
		return {"valid": false, "reason": "no-match"}
	moves_left -= 1
	var cascade := 0
	while not matches.is_empty() and cascade < CASCADE_LIMIT:
		cascade += 1
		for index in matches:
			if tiles[index] == str(Level.data.objectiveTile):
				collected += 1
			tiles[index] = ""
		_settle_columns()
		matches = find_matches()
	if collected >= int(Level.data.target):
		state = "won"
	elif moves_left <= 0:
		state = "lost"
	elif not has_available_move():
		_reshuffle_playable_board()
	return {"valid": true, "reason": "", "won": state == "won", "lost": state == "lost", "cascades": cascade}

func find_matches() -> Array[int]:
	var result: Array[int] = []
	var included := {}
	var rows := int(Level.data.rows)
	var columns := int(Level.data.columns)
	for row in range(rows):
		var start := 0
		while start < columns:
			var index := row * columns + start
			var tile := tiles[index]
			var end := start + 1
			while not tile.is_empty() and end < columns and tiles[row * columns + end] == tile:
				end += 1
			if not tile.is_empty() and end - start >= 3:
				for column in range(start, end):
					included[row * columns + column] = true
			start = end
		for column in range(columns):
			var vertical := row * columns + column
			var vertical_tile := tiles[vertical]
			if vertical_tile.is_empty() or row + 2 >= rows:
				continue
			if tiles[vertical + columns] == vertical_tile and tiles[vertical + columns * 2] == vertical_tile:
				included[vertical] = true
				included[vertical + columns] = true
				included[vertical + columns * 2] = true
	for row in range(rows - 1):
		for column in range(columns - 1):
			var index := row * columns + column
			var tile := tiles[index]
			if tile.is_empty():
				continue
			if tiles[index + 1] == tile and tiles[index + columns] == tile and tiles[index + columns + 1] == tile:
				included[index] = true
				included[index + 1] = true
				included[index + columns] = true
				included[index + columns + 1] = true
	for index in included:
		result.append(int(index))
	result.sort()
	return result

func has_available_move() -> bool:
	var columns := int(Level.data.columns)
	for index in tiles.size():
		if index % columns < columns - 1 and _swap_creates_match(index, index + 1):
			return true
		if index + columns < tiles.size() and _swap_creates_match(index, index + columns):
			return true
	return false

func _fill_initial_board() -> void:
	var columns := int(Level.data.columns)
	for index in tiles.size():
		var candidates: Array = Level.data.activeTiles.duplicate()
		_shuffle(candidates)
		for candidate in candidates:
			var tile := str(candidate)
			tiles[index] = tile
			if not _cell_creates_initial_match(index, columns):
				break
			else:
				tiles[index] = ""
		if tiles[index].is_empty():
			tiles[index] = str(Level.data.activeTiles[_random.index(Level.data.activeTiles.size())])

func _settle_columns() -> void:
	var columns := int(Level.data.columns)
	var rows := int(Level.data.rows)
	for column in range(columns):
		var remaining: Array[String] = []
		for row in range(rows - 1, -1, -1):
			var tile := tiles[row * columns + column]
			if not tile.is_empty():
				remaining.append(tile)
		while remaining.size() < rows:
			remaining.append(_random_tile())
		for row in range(rows):
			tiles[row * columns + column] = remaining[rows - row - 1]

func _reshuffle_playable_board() -> void:
	var original := tiles.duplicate()
	for attempt in range(100):
		_shuffle(tiles)
		if find_matches().is_empty() and has_available_move():
			return
	tiles = original

func _swap_creates_match(first: int, second: int) -> bool:
	_swap_tiles(first, second)
	var found := not find_matches().is_empty()
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
	if first < 0 or second < 0 or first >= tiles.size() or second >= tiles.size() or first == second:
		return false
	var columns := int(Level.data.columns)
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

func _random_tile() -> String:
	return str(Level.data.activeTiles[_random.index(Level.data.activeTiles.size())])
