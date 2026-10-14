extends SceneTree

const Game = preload("res://scripts/match3_game.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const SeededRandom = preload("res://scripts/seeded_random.gd")
const Cases = preload("res://tests/fixtures/match3_parity_cases.json")


func _initialize() -> void:
	var bundle := CampaignData.load_bundle()
	assert(not bundle.has("error"), str(bundle.get("error", "campaign data failed to load")))
	assert(Cases.data.size() == 8, "Expected eight TypeScript gameplay oracle cases")
	for scenario: Dictionary in Cases.data:
		_run_scenario(bundle, scenario)
	print("UPDS Godot Match-3 runtime parity passed (%d TypeScript oracle scenarios)." % Cases.data.size())
	quit()


func _run_scenario(bundle: Dictionary, scenario: Dictionary) -> void:
	var level := CampaignData.get_level(bundle, str(scenario.levelId))
	assert(not level.is_empty(), "%s: level lookup failed" % str(scenario.name))
	var game: RefCounted = Game.new(level)
	game._random = SeededRandom.new(int(scenario.randomSeed))
	game.collected = 0
	game.collected_by_tile.clear()
	game.ingredients_dropped.clear()
	game.blockers_cleared = 0
	game.moves_left = int(level.moves)
	game.state = "playing"
	for index in scenario.initialBoard.size():
		var cell: Dictionary = scenario.initialBoard[index]
		game.tiles[index] = str(cell.tile)
		game.specials[index] = str(cell.special)
		game.blocker_layers[index] = int(cell.blockerLayers)
		game.ingredients[index] = str(cell.ingredient)
	if str(scenario.get("action", "")) == "reshuffle":
		assert(game._reshuffle_playable_board(), "Reshuffle did not produce a playable board")
		assert(not game._last_frames.is_empty() and str(game._last_frames.back().phase) == "reshuffle", "Reshuffle did not export its animation frame")
		assert(game.moves_left == int(scenario.expected.movesLeft), "Reshuffle changed moves-left")
		assert(game.state == str(scenario.expected.state), "Reshuffle changed game state")
		assert(game._find_resolution_match_groups().is_empty() and bool(scenario.expected.hasImmediateMatches) == false, "Reshuffle left immediate matches")
		assert(game.has_available_move() == bool(scenario.expected.hasAvailableMove), "Reshuffle playable-state mismatch")
		assert(_normalize(_board_snapshot(game)) == _normalize(scenario.expected.board), "%s final board mismatch" % str(scenario.name))
		return
	var actual_hint: Dictionary = game.get_hint_move()
	var expected_hint: Variant = scenario.expected.get("initialHint", scenario.get("hint", null))
	assert(_normalize(actual_hint) == _normalize(expected_hint), "%s initial hint mismatch: %s != %s" % [str(scenario.name), str(actual_hint), str(expected_hint)])
	var totals := {"cleared": 0, "cascades": 0, "blockersCleared": 0, "ingredientsDropped": 0, "reshuffled": false}
	if scenario.has("specialIndex"):
		var special_move: Dictionary = game.attempt_special_activation(int(scenario.specialIndex))
		assert(bool(special_move.valid), "%s: oracle special activation was rejected" % str(scenario.name))
		for key: String in ["cleared", "cascades", "blockersCleared", "ingredientsDropped"]: totals[key] += int(special_move.get(key, 0))
		totals.reshuffled = bool(special_move.get("reshuffled", false))
	else:
		for swap: Dictionary in scenario.swaps:
			var move: Dictionary = game.attempt_swap(int(swap.first), int(swap.second))
			assert(bool(move.valid), "%s: oracle swap was rejected" % str(scenario.name))
			for key: String in ["cleared", "cascades", "blockersCleared", "ingredientsDropped"]: totals[key] += int(move.get(key, 0))
			totals.reshuffled = bool(totals.reshuffled) or bool(move.get("reshuffled", false))
	var actual_result := {
		"valid": true,
		"won": game.state == "won",
		"lost": game.state == "lost",
		"reshuffled": bool(totals.reshuffled),
		"cleared": int(totals.cleared),
		"cascades": int(totals.cascades),
		"blockersCleared": int(totals.blockersCleared),
		"ingredientsDropped": int(totals.ingredientsDropped),
	}
	var actual_board := _board_snapshot(game)
	var actual_progress := {
		"collected": game.collected_by_tile,
		"blockersCleared": game.blockers_cleared,
		"ingredientsDropped": game.ingredients_dropped,
	}
	var expected: Dictionary = scenario.expected
	assert(game.state == str(expected.state), "%s state mismatch: %s != %s" % [str(scenario.name), game.state, str(expected.state)])
	assert(game.moves_left == int(expected.movesLeft), "%s moves-left mismatch" % str(scenario.name))
	assert(_normalize(actual_result) == _normalize(expected.result), "%s result mismatch: %s != %s" % [str(scenario.name), str(actual_result), str(expected.result)])
	assert(_normalize(actual_progress) == _normalize(expected.progress), "%s objective progress mismatch" % str(scenario.name))
	assert(_normalize(actual_board) == _normalize(expected.board), "%s final board mismatch" % str(scenario.name))


func _board_snapshot(game: RefCounted) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for index in game.tiles.size():
		result.append({"tile": game.tiles[index], "ingredient": game.ingredients[index], "blockerLayers": game.blocker_layers[index], "special": game.specials[index]})
	return result


func _normalize(value: Variant) -> Variant:
	if value is Dictionary:
		var result := {}
		for key: Variant in value:
			result[key] = _normalize(value[key])
		return result
	if value is Array:
		var result: Array = []
		for item: Variant in value:
			result.append(_normalize(item))
		return result
	if value is float and floor(value) == value:
		return int(value)
	return value
