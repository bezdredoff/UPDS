extends RefCounted

signal changed
signal save_failed

const Store = preload("res://scripts/campaign_store.gd")
const Format = preload("res://scripts/save_format.gd")
const Prologue = preload("res://data/prologue.json")

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
	return state.scene == 0 and state.line >= 0 and state.line < Prologue.data.lines.size()


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
	return Prologue.data.lines[int(state.line)] if supports_position() else {}


func advance() -> bool:
	if not supports_position():
		return false
	_mark_read()
	var moved: bool = state.line + 1 < Prologue.data.lines.size()
	if moved:
		state.line += 1
		_skip_hidden()
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
	while supports_position() and current_line().hidden and state.line + 1 < Prologue.data.lines.size():
		_mark_read()
		state.line += 1
