extends RefCounted

const Store = preload("res://scripts/campaign_store.gd")
const Format = preload("res://scripts/save_format.gd")

var store: RefCounted
var save: Dictionary = Format.fresh_match3()
var last_write_ok := true


func _init(adapter: RefCounted = null) -> void:
	store = adapter if adapter != null else Store.new()
	reload()


func reload() -> void:
	save = store.load_match3()
	last_write_ok = true


func start_level(level_id: String) -> void:
	save.attempts[level_id] = int(save.attempts.get(level_id, 0)) + 1
	persist()


func complete_level(level_id: String, moves_left: int) -> void:
	if not save.completed.has(level_id):
		save.completed.append(level_id)
	var previous: Variant = save.bestMovesLeft.get(level_id)
	if previous == null or moves_left > int(previous):
		save.bestMovesLeft[level_id] = moves_left
	persist()


func persist() -> void:
	last_write_ok = store.save_match3(save)
