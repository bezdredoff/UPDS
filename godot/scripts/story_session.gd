extends RefCounted

signal changed
signal save_failed

const Store = preload("res://scripts/campaign_store.gd")
const Format = preload("res://scripts/save_format.gd")
const Prologue = preload("res://data/prologue.json")
const LockerScene = preload("res://data/locker_scene.json")

var store: RefCounted
var state: Dictionary = Format.fresh_story()
var last_write_ok := true
var load_report := {"status": "fresh", "detail": "not-loaded"}


func _init(adapter: RefCounted = null) -> void:
	store = adapter if adapter != null else Store.new()


func reload() -> void:
	state = store.load_story()
	load_report = store.last_load_report.duplicate()
	last_write_ok = true
	changed.emit()


func has_progress() -> bool:
	return state.scene > 0 or state.line > 0 or not state.completed.is_empty()


func supports_position() -> bool:
	return state.scene == 0 and state.line >= 0 and state.line < Prologue.data.lines.size() \
		or state.scene == 1 and state.line >= 0 and state.line < _scene_lines().size()


func new_game() -> void:
	state = Format.fresh_story()
	load_report = {"status": "fresh", "detail": "new-game"}
	persist()
	changed.emit()


func resume() -> bool:
	if not supports_position():
		return false
	_skip_hidden()
	persist()
	changed.emit()
	return true


func current_line() -> Dictionary:
	return _scene_lines()[int(state.line)] if supports_position() else {}


func at_match3_gate() -> bool:
	return state.scene == 1 and supports_position() and current_line().id == "VN0057"


func scene_data() -> Dictionary:
	return Prologue.data if state.scene == 0 else LockerScene.data if state.scene == 1 else {}


func choose(option: String) -> bool:
	if state.scene != 1 or not supports_position() or current_line().id != "VN0040" or not ["A", "B", "C"].has(option):
		return false
	_mark_read()
	state.choice = option
	state.line = _scene_lines().find_custom(func(line: Dictionary) -> bool: return line.id == "VN0041" + option)
	if state.line < 0:
		return false
	persist()
	changed.emit()
	return true


func advance() -> bool:
	if not supports_position():
		return false
	if state.scene == 1 and current_line().id == "VN0040":
		return false
	_mark_read()
	var moved: bool = state.line + 1 < _scene_lines().size()
	if moved:
		state.line += 1
		_skip_hidden()
	elif state.scene == 0:
		state.scene = 1
		state.line = 0
		moved = true
	persist()
	changed.emit()
	return moved


func persist() -> void:
	last_write_ok = store.save_story(state)
	if not last_write_ok:
		save_failed.emit()


func _mark_read() -> void:
	var id: String = current_line().id
	if not state.readLines.has(id):
		state.readLines.append(id)


func _skip_hidden() -> void:
	while supports_position() and current_line().hidden and state.line + 1 < _scene_lines().size():
		_mark_read()
		state.line += 1
	if supports_position() and current_line().hidden and state.line == _scene_lines().size() - 1:
		_mark_read()


func _scene_lines() -> Array:
	if state.scene == 0:
		return Prologue.data.lines
	if state.scene == 1:
		return LockerScene.data.variants.get(state.choice, LockerScene.data.variants.A)
	return []
