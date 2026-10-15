extends SceneTree

const Game = preload("res://scripts/match3_game.gd")
const Session = preload("res://scripts/match3_campaign_session.gd")
const Store = preload("res://scripts/campaign_store.gd")
const Memory = preload("res://tests/memory_storage.gd")
const Level = preload("res://data/locker_match3.json")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const SeededRandom = preload("res://scripts/seeded_random.gd")
const ChromiumBoards = preload("res://tests/fixtures/chromium_match3_start_boards.json")


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var bundle := CampaignData.load_bundle()
	assert(not bundle.has("error"), str(bundle.get("error", "campaign data failed to load")))
	for level: Dictionary in bundle.levels:
		var campaign_game: RefCounted = Game.new(level)
		assert(campaign_game.tiles.size() == int(level.rows) * int(level.columns), "%s board dimensions mismatch" % str(level.id))
		assert(campaign_game.tiles == level.openingBoard.map(func(cell: Dictionary) -> String: return str(cell.tile)), "%s opening board differs from exported source" % str(level.id))
		assert(campaign_game.blocker_layers == level.openingBoard.map(func(cell: Dictionary) -> int: return int(cell.blockerLayers)), "%s blockers differ from exported source" % str(level.id))
		assert(campaign_game.ingredients == level.openingBoard.map(func(cell: Dictionary) -> String: return str(cell.ingredient)), "%s ingredients differ from exported source" % str(level.id))
		assert(campaign_game.find_matches().is_empty() and campaign_game.has_available_move(), "%s opening board is not playable" % str(level.id))
	var random: RefCounted = SeededRandom.new(9001)
	var expected := [0.8673377186059952, 0.42265214351937175, 0.5292259221896529, 0.40202159946784377, 0.07498880056664348]
	for value in expected:
		assert(absf(random.next_float() - value) < 0.000000000001, "Version-1 seeded random stream changed")
	var game: RefCounted = Game.new()
	assert(game.tiles.size() == 63)
	assert(game.tiles == Level.data.seededOpeningBoard, "Godot opening board differs from the canonical web seed layout")
	var attempt_level: Dictionary = Level.data.duplicate(true)
	attempt_level.seed = int(Level.data.seed) + 101
	attempt_level.erase("seededOpeningBoard")
	var attempt_game: RefCounted = Game.new(attempt_level)
	assert(attempt_game.tiles == ChromiumBoards.data.seed9102,
		"Godot first campaign attempt differs from the Chromium-seeded source board")
	assert(game.moves_left == 24 and game.collected == 0)
	var columns := int(Level.data.columns)
	assert(game.find_matches().is_empty(), "Initial board has an immediate match")
	assert(game.has_available_move(), "Initial board has no legal swap")
	var invalid_pair := []
	for index in game.tiles.size():
		for candidate in [index + 1, index + columns]:
			if candidate >= game.tiles.size() or (candidate == index + 1 and index % columns == columns - 1): continue
			if not game._swap_creates_match(index, candidate):
				invalid_pair = [index, candidate]
				break
		if not invalid_pair.is_empty(): break
	var rejected_move: Dictionary = game.attempt_swap(int(invalid_pair[0]), int(invalid_pair[1]))
	assert(not rejected_move.valid and rejected_move.frames.size() == 1 and rejected_move.frames[0].phase == "swap", "Rejected move did not export its swap animation frame")
	game.reset()
	var invalid_special_activation: Dictionary = game.attempt_special_activation(0)
	assert(not invalid_special_activation.valid and invalid_special_activation.reason == "no-special", "Cell without a special was activated")
	assert(game.moves_left == 24, "Invalid special activation consumed a move")
	var starting_board: Array = game.tiles.duplicate()
	assert(not game.attempt_swap(0, 48).valid, "Non-adjacent swap was accepted")
	assert(game.moves_left == 24, "Invalid swap consumed a move")
	var first := -1
	var second := -1
	for index in game.tiles.size():
		for candidate in [index + 1, index + columns]:
			if candidate >= game.tiles.size() or (candidate == index + 1 and index % columns == columns - 1):
				continue
			if game._swap_creates_match(index, candidate):
				first = index
				second = candidate
				break
		if first >= 0:
			break
	var accepted_move: Dictionary = game.attempt_swap(first, second)
	assert(first >= 0 and accepted_move.valid, "A legal swap did not resolve")
	assert(accepted_move.frames.size() >= 3 and accepted_move.frames[0].phase == "swap", "Accepted move omitted its swap frame")
	assert(accepted_move.frames[1].phase == "clear" and accepted_move.frames[2].phase == "settle", "Accepted move omitted clear/settle animation phases")
	assert(accepted_move.frames[1].cleared.size() > 0 and accepted_move.frames[2].motions is Array, "Clear or fall/spawn animation data is missing")
	assert(game.moves_left == 23 and game.find_matches().is_empty(), "Move resolution did not settle the board")
	game.reset()
	assert(game.tiles == starting_board, "Same seed did not produce a repeatable initial board")
	assert(game.specials.size() == game.tiles.size() and game.specials.all(func(kind: String) -> bool: return kind.is_empty()), "New board contains stale specials")
	game.tiles.clear()
	game.specials.clear()
	for index in range(63):
		game.tiles.append(str(Level.data.activeTiles[index % Level.data.activeTiles.size()]))
		game.specials.append("")
	for column in range(4): game.tiles[column] = "flash-source"
	var line_groups: Array[Dictionary] = game.find_match_groups()
	assert(game._find_player_special_creations(line_groups, 2, 3)[0].kind == "flash-row", "Horizontal four-match did not create Flash Row")
	_fill_pattern(game)
	for column in range(4): game.tiles[column] = "automatic-source"
	for column in range(4): game.tiles[8 * columns + column] = "automatic-source"
	var automatic_groups: Array[Dictionary] = game.find_match_groups()
	var preferred_anchor: Array[int] = [57]
	var automatic: Array = game._find_automatic_special_creations(automatic_groups, preferred_anchor)
	assert(automatic.size() == 2 and automatic[0].index == 1 and automatic[1].index == 57 and automatic[1].kind == "flash-row", "Automatic cascades did not preserve all special anchors")
	_fill_pattern(game)
	for row in range(4): game.tiles[row * columns] = "column-source"
	var column_groups: Array[Dictionary] = game.find_match_groups()
	assert(game._find_player_special_creations(column_groups, 14, 21)[0].kind == "flash-column", "Vertical four-match did not create Flash Column")
	_fill_pattern(game)
	for column in range(1, 6): game.tiles[4 * columns + column] = "insight-source"
	var insight_groups: Array[Dictionary] = game.find_match_groups()
	assert(game._find_player_special_creations(insight_groups, 30, 31)[0].kind == "insight", "Five-match did not create Insight")
	_fill_pattern(game)
	game.tiles[2 * columns + 2] = "evidence-source"
	game.tiles[2 * columns + 3] = "evidence-source"
	game.tiles[2 * columns + 4] = "evidence-source"
	game.tiles[columns + 3] = "evidence-source"
	game.tiles[3 * columns + 3] = "evidence-source"
	var evidence_groups: Array[Dictionary] = game.find_match_groups()
	assert(game._find_player_special_creations(evidence_groups, 17, 18)[0].kind == "evidence", "T match did not create Evidence")
	_fill_pattern(game)
	game.tiles[0] = "lead-source"
	game.tiles[1] = "lead-source"
	game.tiles[columns] = "lead-source"
	game.tiles[columns + 1] = "lead-source"
	var lead_groups: Array[Dictionary] = game.find_match_groups()
	assert(game._find_player_special_creations(lead_groups, 1, columns + 1)[0].kind == "lead", "2x2 match did not create Lead")
	game.specials[31] = "flash-row"
	var clear_targets := {31: true}
	game._expand_special_clear(clear_targets)
	for column in range(columns): assert(clear_targets.has(28 + column), "Flash Row did not clear its full row")
	game.specials.fill("")
	game.specials[31] = "flash-column"
	clear_targets = {31: true}
	game._expand_special_clear(clear_targets)
	for row in range(int(Level.data.rows)): assert(clear_targets.has(row * columns + 3), "Flash Column did not clear its full column")
	game.specials.fill("")
	game.specials[31] = "evidence"
	clear_targets = {31: true}
	game._expand_special_clear(clear_targets)
	assert(clear_targets.size() == 9, "Evidence did not clear a 3x3 area")
	game.specials.fill("")
	game.specials[31] = "lead"
	clear_targets = {31: true}
	game._expand_special_clear(clear_targets)
	assert(clear_targets.has(31) and clear_targets.has(24) and clear_targets.has(38) and clear_targets.has(30) and clear_targets.has(32), "Lead did not clear its local cross")
	assert(clear_targets.size() > 5, "Lead did not select one useful remote target")
	game.specials.fill("")
	game.specials[31] = "insight"
	var insight_tile := str(game.tiles[31])
	clear_targets = {31: true}
	game._expand_special_clear(clear_targets)
	assert(clear_targets.size() == game.tiles.filter(func(tile: String) -> bool: return tile == insight_tile).size(), "Insight did not clear all matching base tiles")
	assert(game._resolve_direct_combo("flash-row", "flash-column") == "flash-flash", "Flash combo classification changed")
	assert(game._direct_combo_targets("flash-flash", 24, 25).size() == int(Level.data.rows) + columns - 1, "Flash combo did not clear a cross")
	game.reset()
	game.specials[0] = "lead"
	var falling_tile := str(game.tiles[0])
	game.tiles[4 * columns] = ""
	game.specials[4 * columns] = ""
	game._settle_columns()
	assert(game.tiles[columns] == falling_tile and game.specials[columns] == "lead", "Settling detached a special from its base tile")
	game.reset()
	game.specials[24] = "flash-row"
	game.specials[25] = "flash-column"
	var combo_objective_count := 0
	for index in game._direct_combo_targets("flash-flash", 24, 25):
		if game.tiles[index] == str(Level.data.objectiveTile):
			combo_objective_count += 1
	var combo_move: Dictionary = game.attempt_swap(24, 25)
	assert(combo_move.valid and game.moves_left == 23 and combo_move.specialsCombined, "Direct special combo did not resolve as one tagged move")
	assert(game.collected >= combo_objective_count, "Direct special combo missed objective tiles in its clear cross")
	game.reset()
	game.tiles[0] = str(Level.data.objectiveTile)
	game.specials[0] = "flash-row"
	var special_swap: Dictionary = game.attempt_swap(0, 1)
	assert(special_swap.valid and game.moves_left == 23, "Swapping a special did not activate it as a move")
	assert(game.specials.size() == game.tiles.size(), "Special state became detached from tiles")
	game.reset()
	var first_tile := str(Level.data.activeTiles[0])
	var second_tile := str(Level.data.activeTiles[1])
	game.tiles.clear()
	game.specials.clear()
	for row in range(int(Level.data.rows)):
		for column in range(columns):
			game.tiles.append(first_tile if (row + column) % 2 == 0 else second_tile)
			game.specials.append("")
	game.tiles[0] = first_tile
	game.tiles[1] = first_tile
	game.tiles[2] = first_tile
	game.tiles[3] = second_tile
	game.tiles[4] = first_tile
	var creation_move: Dictionary = game.attempt_swap(3, 4)
	assert(creation_move.valid and int(creation_move.specialsCreated) > 0, "A valid four-tile match did not export its special creation event")
	game.tiles.clear()
	game.specials.clear()
	var other_tiles: Array = Level.data.activeTiles.filter(func(tile: Variant) -> bool: return str(tile) != str(Level.data.objectiveTile))
	for row in range(int(Level.data.rows)):
		for column in range(columns):
			game.tiles.append(str(Level.data.activeTiles[(row * 2 + column) % Level.data.activeTiles.size()]))
			game.specials.append("")
	game.tiles[0] = str(Level.data.objectiveTile)
	game.tiles[1] = str(Level.data.objectiveTile)
	game.tiles[2] = str(other_tiles[0])
	game.tiles[3] = str(Level.data.objectiveTile)
	game.collected = 9
	game.collected_by_tile["pantiesSportWhite"] = 9
	game.moves_left = 1
	var win: Dictionary = game.attempt_swap(2, 3)
	assert(win.valid and game.state == "won" and game.collected >= int(Level.data.target))
	assert(game.moves_left == 0, "Final move was not counted on a win")
	game.reset()
	assert(game.state == "playing" and game.moves_left == 24 and game.collected == 0)

	var memory := Memory.new()
	var session: RefCounted = Session.new(Store.new(memory))
	session.start_level(str(Level.data.id))
	assert(session.save.attempts.get(Level.data.id) == 1)
	session.complete_level(str(Level.data.id), 8)
	session.start_level(str(Level.data.id))
	session.complete_level(str(Level.data.id), 4)
	var restored: RefCounted = Session.new(Store.new(memory))
	assert(restored.save.completed == [Level.data.id])
	assert(restored.save.attempts.get(Level.data.id) == 2)
	assert(restored.save.bestMovesLeft.get(Level.data.id) == 8, "Replay overwrote a better result")

	print("UPDS Godot Match-3 model smoke test passed.")
	quit()


func _fill_pattern(game: RefCounted) -> void:
	game.tiles.clear()
	game.specials.clear()
	for index in 63:
		game.tiles.append(str(Level.data.activeTiles[index % Level.data.activeTiles.size()]))
		game.specials.append("")
