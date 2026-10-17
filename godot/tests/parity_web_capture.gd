extends Node

const Memory = preload("res://tests/memory_storage.gd")
var menu: Control
var _callback: JavaScriptObject
var _build: Dictionary


func _ready() -> void:
	assert(OS.has_feature("web"), "This isolated capture fixture is for Web exports")
	_build = JSON.parse_string(FileAccess.get_file_as_string("res://tests/parity_capture_build.json"))
	var locale: String = JavaScriptBridge.eval("new URLSearchParams(location.search).get('locale') || 'ru'")
	_create_menu(locale)
	_callback = JavaScriptBridge.create_callback(_dispatch)
	JavaScriptBridge.get_interface("window").updsParityCall = _callback
	await get_tree().process_frame
	await get_tree().process_frame
	_publish("ready")


func _create_menu(locale: String) -> void:
	menu = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Memory.story_session()
	menu.match3_session = preload("res://scripts/match3_campaign_session.gd").new(
		preload("res://scripts/campaign_store.gd").new(Memory.new()))
	menu.preferences = preload("res://scripts/player_preferences.gd").new("user://parity_capture_preferences.cfg")
	menu.preferences.locale = locale
	add_child(menu)


func _dispatch(arguments: Array) -> void:
	var request: Dictionary = JSON.parse_string(str(arguments[0]))
	match str(request.action):
		"snapshot": pass
		"reset":
			var locale: String = menu.preferences.locale
			menu.queue_free()
			await get_tree().process_frame
			_create_menu(locale)
		"new_game": menu._begin_new_game()
		"campaign": menu._open_campaign()
		"settings": menu._open_settings()
		"line":
			menu.session.state.scene = int(request.scene)
			menu.session.state.line = int(request.line)
			menu.session.resume()
			menu._open_story()
		"advance": menu.story_screen._next()
		"locale": menu.preferences.set_locale(str(request.locale))
		"match3":
			menu.match3_session.save.completed = []
			var bundle := preload("res://scripts/match3_campaign_data.gd").load_bundle()
			for level: Dictionary in bundle.levels:
				if str(level.id) == str(request.level): break
				menu.match3_session.save.completed.append(str(level.id))
			menu._open_match3_level(str(request.level), true)
			menu.match3_screen._reduced_motion_override = true
		"press":
			var control := menu.get_node(str(request.path))
			assert(control is Button)
			control.emit_signal("pressed")
		_:
			assert(false, "Unknown parity fixture action: " + str(request.action))
	await get_tree().process_frame
	await get_tree().process_frame
	_publish(str(request.get("id", "action")))


func _publish(request_id: String) -> void:
	var records: Array = []
	_collect(menu, records)
	var result := {"id": request_id, "controls": records, "scene": menu.session.state.scene,
		"line": menu.session.state.line, "locale": menu.preferences.locale,
		"build": _build, "engine": Engine.get_version_info().string,
		"viewport": [get_viewport().get_visible_rect().size.x, get_viewport().get_visible_rect().size.y],
		"window": [get_window().size.x, get_window().size.y]}
	if is_instance_valid(menu.story_screen):
		result.dialogue = {"pages": menu.story_screen._dialogue_pages,
			"pageIndex": menu.story_screen._dialogue_page_index,
			"displayed": menu.story_screen.dialogue.text}
	JavaScriptBridge.eval("window.updsParityResult = " + JSON.stringify(result))


func _collect(node: Node, records: Array) -> void:
	if node is Control and node.is_visible_in_tree():
		var control := node as Control
		var rect := control.get_global_rect()
		var scale := Vector2(get_window().size) / get_viewport().get_visible_rect().size
		var record := {"path": str(menu.get_path_to(node)), "type": node.get_class(),
			"rect": [rect.position.x * scale.x, rect.position.y * scale.y, rect.size.x * scale.x, rect.size.y * scale.y],
			"minimum": [control.get_minimum_size().x, control.get_minimum_size().y],
			"oversampling": control.oversampling_with_scale}
		if node is Label or node is RichTextLabel or node is Button:
			record.text = node.get("text")
			record.font_size = control.get_theme_font_size("normal_font_size" if node is RichTextLabel else "font_size")
		records.append(record)
	for child in node.get_children(): _collect(child, records)
