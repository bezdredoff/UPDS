extends Node

var _preferences_path: String

# Editor/MCP preview with isolated in-memory campaign state.
func _ready() -> void:
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.name = "Menu"
	menu.session = preload("res://tests/memory_storage.gd").story_session()
	_preferences_path = "user://vn_preview_%s.cfg" % Time.get_ticks_usec()
	menu.preferences = preload("res://scripts/player_preferences.gd").new(_preferences_path)
	menu.preferences.locale = "ru"
	add_child(menu)
	menu._begin_new_game()


func _exit_tree() -> void:
	if not _preferences_path.is_empty() and FileAccess.file_exists(_preferences_path):
		DirAccess.remove_absolute(_preferences_path)
