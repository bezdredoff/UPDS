extends RefCounted

signal locale_changed(locale: String)

const MenuCopy = preload("res://scripts/menu_copy.gd")
const DEFAULT_PATH := "user://player_preferences.cfg"

var locale: String
var _path: String


func _init(path: String = DEFAULT_PATH) -> void:
	_path = path
	locale = MenuCopy.system_locale()
	var config := ConfigFile.new()
	if config.load(_path) == OK:
		var saved: Variant = config.get_value("interface", "locale", "")
		if saved is String and MenuCopy.COPY.has(saved):
			locale = saved


func set_locale(value: String) -> Error:
	if not MenuCopy.COPY.has(value):
		return ERR_INVALID_PARAMETER
	if value == locale:
		return OK
	var config := ConfigFile.new()
	config.set_value("interface", "locale", value)
	var error := config.save(_path)
	if error != OK:
		return error
	locale = value
	locale_changed.emit(locale)
	return OK
