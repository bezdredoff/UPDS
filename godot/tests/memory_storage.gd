extends RefCounted

var last_error: Error = OK
var values := {}
var fail_write := false


func get_item(key: String) -> Variant:
	last_error = OK
	return values.get(key)


func set_item(key: String, value: String) -> bool:
	last_error = ERR_FILE_CANT_WRITE if fail_write else OK
	if last_error == OK:
		values[key] = value
	return last_error == OK


func remove_item(key: String) -> bool:
	values.erase(key)
	last_error = OK
	return true


static func story_session() -> RefCounted:
	return preload("res://scripts/story_session.gd").new(preload("res://scripts/campaign_store.gd").new(new()))
