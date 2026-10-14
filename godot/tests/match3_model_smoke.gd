extends SceneTree

const Game = preload("res://scripts/match3_game.gd")
const Session = preload("res://scripts/match3_campaign_session.gd")
const Store = preload("res://scripts/campaign_store.gd")
const Memory = preload("res://tests/memory_storage.gd")
const Level = preload("res://data/locker_match3.json")
const SeededRandom = preload("res://scripts/seeded_random.gd")


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var random: RefCounted = SeededRandom.new(9001)
	var expected := [0.8673377186059952, 0.42265214351937175, 0.5292259221896529, 0.40202159946784377, 0.07498880056664348]
	for value in expected:
		assert(absf(random.next_float() - value) < 0.000000000001, "Version-1 seeded random stream changed")
	var game: RefCounted = Game.new()
	assert(game.tiles.size() == 63)
	assert(game.moves_left == 24 and game.collected == 0)
	assert(game.find_matches().is_empty(), "Initial board has an immediate match")
	assert(game.has_available_move(), "Initial board has no legal swap")
	var starting_board: Array = game.tiles.duplicate()
	assert(not game.attempt_swap(0, 48).valid, "Non-adjacent swap was accepted")
	assert(game.moves_left == 24, "Invalid swap consumed a move")
	var first := -1
	var second := -1
	var columns := int(Level.data.columns)
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
	assert(first >= 0 and game.attempt_swap(first, second).valid, "A legal swap did not resolve")
	assert(game.moves_left == 23 and game.find_matches().is_empty(), "Move resolution did not settle the board")
	game.reset()
	assert(game.tiles == starting_board, "Same seed did not produce a repeatable initial board")
	game.tiles.clear()
	var other_tiles: Array = Level.data.activeTiles.filter(func(tile: Variant) -> bool: return str(tile) != str(Level.data.objectiveTile))
	for row in range(int(Level.data.rows)):
		for column in range(columns):
			game.tiles.append(str(Level.data.activeTiles[(row * 2 + column) % Level.data.activeTiles.size()]))
	game.tiles[0] = str(Level.data.objectiveTile)
	game.tiles[1] = str(Level.data.objectiveTile)
	game.tiles[2] = str(other_tiles[0])
	game.tiles[3] = str(Level.data.objectiveTile)
	game.collected = 9
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
