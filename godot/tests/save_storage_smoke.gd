extends SceneTree

const Format = preload("res://scripts/save_format.gd")
const Storage = preload("res://scripts/save_storage.gd")
const Store = preload("res://scripts/campaign_store.gd")
const CONTRACT = Format.CONTRACT


class FailingStorage extends RefCounted:
	var last_error: Error = OK
	var values := {}
	var fail_key := ""
	var fail_read := false

	func get_item(key: String) -> Variant:
		last_error = ERR_FILE_CANT_READ if fail_read else OK
		return null if fail_read else values.get(key)

	func set_item(key: String, value: String) -> bool:
		last_error = ERR_FILE_CANT_WRITE if key == fail_key else OK
		if last_error == OK:
			values[key] = value
		return last_error == OK

	func remove_item(key: String) -> bool:
		last_error = ERR_FILE_CANT_WRITE if key == fail_key else OK
		if last_error == OK:
			values.erase(key)
		return last_error == OK


func _initialize() -> void:
	var directory := "user://save_smoke_%s" % Time.get_ticks_usec()
	var adapter := Storage.new(directory)
	var store := Store.new(adapter)
	assert(_same(store.load_story(), Format.fresh_story()))
	assert(store.last_load_report.detail == "no-save")
	assert(store.load_manual() == null)
	assert(_same(store.load_match3(), Format.fresh_match3()))
	var story := Format.normalize_story({"scene": 12, "line": 7, "choice": "B", "readLines": ["VN0250A"], "completed": [1], "storyChoices": {"meeting-tone": "C"}})
	var match3 := Format.normalize_match3({"completed": [CONTRACT.data.levelIds[0]], "attempts": {CONTRACT.data.levelIds[0]: 3}, "bestMovesLeft": {CONTRACT.data.levelIds[0]: 8}})
	assert(store.save_story(story) and store.save_match3(match3))
	var reopened := Store.new(Storage.new(directory))
	assert(_same(reopened.load_story(), story) and reopened.last_load_report.detail == "schema-2")
	assert(_same(reopened.load_match3(), match3))
	var raw: String = adapter.get_item(CONTRACT.data.storyKey)
	var persisted: Dictionary = JSON.parse_string(raw)
	assert(persisted.schemaVersion == 2 and persisted.appVersion == CONTRACT.data.appVersion)
	assert(persisted.savedAt.ends_with(".000Z"))
	assert(store.save_manual({"scene": 3}))
	assert(store.load_manual().scene == 3 and store.load_story().scene == 12)
	var exported := store.export_story(story)
	assert(Format.decode_story(JSON.parse_string(exported)) != null)
	assert(store.import_story(store.export_story({"scene": 20})).ok)
	assert(store.load_story().scene == 20)
	assert(store.get_recovery_backup().raw == raw and store.get_recovery_backup().reason == "before-import")
	assert(store.load_manual().scene == 3 and _same(store.load_match3(), match3))
	var before: String = adapter.get_item(CONTRACT.data.storyKey)
	assert(not store.import_story("{").ok and adapter.get_item(CONTRACT.data.storyKey) == before)
	assert(not store.import_story('{"scene":1,}').ok and adapter.get_item(CONTRACT.data.storyKey) == before)
	assert(not store.import_story('{"scene":1,"saveKey":"other-game"}').ok)
	assert(not store.import_story('{"scene":1,"schemaVersion":99}').ok)
	assert(adapter.get_item(CONTRACT.data.storyKey) == before)
	assert(adapter.set_item(CONTRACT.data.storyKey, '{"scene":2}'))
	assert(store.load_story().scene == 2 and store.last_load_report.detail == "legacy-save")
	var future := '{"scene":9,"schemaVersion":99}'
	assert(adapter.set_item(CONTRACT.data.storyKey, future))
	assert(_same(store.load_story(), Format.fresh_story()))
	assert(adapter.get_item(CONTRACT.data.storyKey) == future, "Future save was overwritten")
	assert(store.get_recovery_backup().raw == future)
	for corrupt in ["{", "false", "[]"]:
		assert(adapter.set_item(CONTRACT.data.storyKey, corrupt))
		assert(_same(store.load_story(), Format.fresh_story()))
		assert(store.last_load_report.status == "recovered-corrupt")
		assert(store.get_recovery_backup().raw == corrupt)
		assert(Format.decode_story(JSON.parse_string(adapter.get_item(CONTRACT.data.storyKey))) != null)
	assert(adapter.set_item(CONTRACT.data.manualKey, "{"))
	assert(store.load_manual() == null)
	assert(adapter.set_item(CONTRACT.data.match3Key, '{"schemaVersion":99}'))
	assert(_same(store.load_match3(), Format.fresh_match3()))
	assert(adapter.get_item(CONTRACT.data.match3Key) == '{"schemaVersion":99}')
	assert(store.save_match3(match3) and store.save_story(story))
	# An interrupted temporary file must not replace the last complete save.
	var temporary: String = adapter._path(CONTRACT.data.storyKey) + ".tmp"
	var file := FileAccess.open(temporary, FileAccess.WRITE)
	file.store_string("interrupted")
	file.close()
	assert(_same(store.load_story(), story))
	assert(store.save_story(story))
	assert(not FileAccess.file_exists(temporary))
	# Force a real filesystem write failure without touching the existing slot.
	assert(DirAccess.make_dir_absolute(temporary) == OK)
	assert(not store.save_story({"scene": 1}))
	assert(_same(store.load_story(), story))
	DirAccess.remove_absolute(temporary)
	assert(not adapter.set_item("../../outside", "bad"))
	assert(adapter.last_error == ERR_INVALID_PARAMETER)
	assert(not adapter.remove_item("player_preferences.cfg"))
	assert(store.reset_story() and store.load_story().scene == 0)
	assert(_same(store.load_match3(), match3), "Story reset changed Match-3")
	assert(store.reset_match3() and _same(store.load_match3(), Format.fresh_match3()))
	for key in [CONTRACT.data.storyKey, CONTRACT.data.match3Key, CONTRACT.data.manualKey, CONTRACT.data.recoveryKey]:
		assert(adapter.remove_item(key))
	assert(DirAccess.remove_absolute(directory) == OK)
	_failure_cases()
	print("UPDS Godot save storage smoke test passed.")
	quit()


func _failure_cases() -> void:
	var memory := FailingStorage.new()
	var store := Store.new(memory)
	memory.fail_read = true
	assert(_same(store.load_story(), Format.fresh_story()) and store.last_load_report.detail == "storage-read-failed")
	assert(not store.import_story('{"scene":1}').ok)
	memory.fail_read = false
	memory.values[CONTRACT.data.storyKey] = "{"
	memory.fail_key = CONTRACT.data.recoveryKey
	store.load_story()
	assert(memory.values[CONTRACT.data.storyKey] == "{", "Backup failure lost corrupt source")
	assert(not store.import_story('{"scene":1}').ok)
	assert(memory.values[CONTRACT.data.storyKey] == "{")
	memory.fail_key = CONTRACT.data.storyKey
	assert(not store.save_story({"scene":1}) and not store.import_story('{"scene":1}').ok)
	assert(not store.reset_story() and memory.values[CONTRACT.data.storyKey] == "{")
	memory.fail_key = CONTRACT.data.match3Key
	assert(not store.save_match3({}) and not store.reset_match3())
	memory.fail_key = CONTRACT.data.manualKey
	assert(not store.save_manual({}))


func _same(left: Variant, right: Variant) -> bool:
	return JSON.parse_string(JSON.stringify(left, "", true, true)) == JSON.parse_string(JSON.stringify(right, "", true, true))
