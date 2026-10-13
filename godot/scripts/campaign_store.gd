extends RefCounted

const Format = preload("res://scripts/save_format.gd")
const Storage = preload("res://scripts/save_storage.gd")
const CONTRACT = Format.CONTRACT

var storage: RefCounted
var last_load_report := {"status": "fresh", "detail": "not-loaded"}


func _init(adapter: RefCounted = null) -> void:
	storage = adapter if adapter != null else Storage.new()


func load_story() -> Dictionary:
	var raw: Variant = storage.get_item(CONTRACT.data.storyKey)
	if storage.last_error != OK:
		last_load_report = {"status": "fresh", "detail": "storage-read-failed"}
		return Format.fresh_story()
	if raw == null or raw == "":
		last_load_report = {"status": "fresh", "detail": "no-save"}
		return Format.fresh_story()
	var json := Format.parse_json(raw)
	if not json.ok:
		return _recover(raw, "invalid-json", true)
	if not json.value is Dictionary:
		return _recover(raw, "save-root-not-object", true)
	var decoded: Variant = Format.decode_story(json.value)
	if decoded == null:
		return _recover(raw, "unsupported-schema", false)
	last_load_report = {"status": "loaded", "detail": "legacy-save" if decoded.schemaVersion == 0 else "schema-%d" % decoded.schemaVersion}
	return decoded.state


func save_story(state: Variant) -> bool:
	return _write(CONTRACT.data.storyKey, Format.encode_story(state, _timestamp()))


func save_manual(state: Variant) -> bool:
	return _write(CONTRACT.data.manualKey, Format.encode_story(state, _timestamp()))


func load_manual() -> Variant:
	var raw: Variant = storage.get_item(CONTRACT.data.manualKey)
	if raw == null or storage.last_error != OK:
		return null
	var json := Format.parse_json(raw)
	if not json.ok:
		return null
	var decoded: Variant = Format.decode_story(json.value)
	return decoded.state if decoded != null else null


func reset_story() -> bool:
	return storage.remove_item(CONTRACT.data.storyKey)


func load_match3() -> Dictionary:
	var raw: Variant = storage.get_item(CONTRACT.data.match3Key)
	if raw == null or storage.last_error != OK:
		return Format.fresh_match3()
	var json := Format.parse_json(raw)
	if not json.ok:
		return Format.fresh_match3()
	var decoded: Variant = Format.decode_match3(json.value)
	return decoded if decoded != null else Format.fresh_match3()


func save_match3(state: Variant) -> bool:
	return _write(CONTRACT.data.match3Key, Format.encode_match3(state, _timestamp()))


func reset_match3() -> bool:
	return storage.remove_item(CONTRACT.data.match3Key)


func export_story(state: Variant) -> String:
	return JSON.stringify(Format.json_safe(Format.export_story(state, _timestamp())), "", true, true)


func import_story(raw: String) -> Dictionary:
	var json := Format.parse_json(raw)
	if not json.ok:
		return {"ok": false, "error": "invalid-json"}
	var candidate: Variant = Format.decode_story(json.value)
	if candidate == null:
		return {"ok": false, "error": "unsupported-schema"}
	var current: Variant = storage.get_item(CONTRACT.data.storyKey)
	if storage.last_error != OK:
		return {"ok": false, "error": "storage-read-failed"}
	if current != null and current != "" and not _backup(current, "before-import"):
		return {"ok": false, "error": "recovery-write-failed"}
	if not save_story(candidate.state):
		return {"ok": false, "error": "storage-write-failed"}
	last_load_report = {"status": "loaded", "detail": "imported-schema-%d" % candidate.schemaVersion}
	return {"ok": true, "state": candidate.state, "schemaVersion": candidate.schemaVersion}


func get_recovery_backup() -> Variant:
	var raw: Variant = storage.get_item(CONTRACT.data.recoveryKey)
	if raw == null or storage.last_error != OK:
		return null
	var json := Format.parse_json(raw)
	return json.value if json.ok else null


func _recover(raw: String, reason: String, replace_corrupt: bool) -> Dictionary:
	last_load_report = {"status": "recovered-corrupt", "detail": reason}
	# Do not overwrite recoverable data if the backup itself cannot be persisted.
	if _backup(raw, reason) and replace_corrupt:
		save_story(Format.fresh_story())
	return Format.fresh_story()


func _backup(raw: String, reason: String) -> bool:
	return _write(CONTRACT.data.recoveryKey, {"capturedAt": _timestamp(), "reason": reason, "saveKey": CONTRACT.data.storyKey, "raw": raw})


func _write(key: String, value: Dictionary) -> bool:
	return storage.set_item(key, JSON.stringify(Format.json_safe(value), "", true, true))


static func _timestamp() -> String:
	return Time.get_datetime_string_from_system(true) + ".000Z"
