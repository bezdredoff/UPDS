extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")
const Session = preload("res://scripts/story_session.gd")
const Store = preload("res://scripts/campaign_store.gd")
const Format = preload("res://scripts/save_format.gd")
const Copy = preload("res://scripts/menu_copy.gd")
const Prologue = preload("res://data/prologue.json")
const LockerScene = preload("res://data/locker_scene.json")


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var preferences_path := "user://vn_smoke_%s.cfg" % Time.get_ticks_usec()
	var session := Memory.story_session()
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = session
	menu.preferences = preload("res://scripts/player_preferences.gd").new(preferences_path)
	root.add_child(menu)
	await process_frame
	assert(menu.get_node("Content/Actions/Continue").disabled)
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	var screen: Control = menu.get_node("StoryScreen")
	assert(not menu.get_node("Content").visible)
	assert(session.current_line().id == "VN0001")
	menu.audio_runtime.activate()
	assert(menu.audio_runtime.music.playing)
	assert(menu.audio_runtime.music.stream.get_length() > 12.6 and menu.audio_runtime.music.stream.get_length() < 12.7)
	assert(screen.stage.get_child_count() == 1)
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.dialogue.text == Prologue.data.lines[0].localized[locale].text)
		assert(screen.speaker.text == Prologue.data.lines[0].localized[locale].speaker)
	screen.next_button.pressed.emit()
	screen.next_button.pressed.emit()
	assert(session.current_line().id == "VN0002", "Rapid taps skipped a line")
	assert(session.state.readLines == ["VN0001"])
	screen.settings_button.pressed.emit()
	assert(not screen.visible and menu.has_node("SettingsScreen"))
	menu.get_node("SettingsScreen").back.pressed.emit()
	assert(screen.visible and screen.settings_button.has_focus())
	assert(not menu.get_node("Content").visible)
	screen.menu_button.pressed.emit()
	assert(not menu.has_node("StoryScreen") and menu.get_node("Content").visible)
	assert(menu.audio_runtime.music.stream.get_length() > 11.1 and menu.audio_runtime.music.stream.get_length() < 11.2)
	assert(not menu.get_node("Content/Actions/Continue").disabled)
	var restored := Session.new(session.store)
	restored.reload()
	assert(restored.current_line().id == "VN0002")
	menu.get_node("Content/Actions/Continue").pressed.emit()
	screen = menu.get_node("StoryScreen")
	assert(screen.dialogue.text == Prologue.data.lines[1].localized.en.text)
	while session.current_line().id != "VN0008":
		assert(session.advance())
	assert(screen.stage.get_child_count() == 3, "Authored trio shot was lost")
	for portrait in screen.stage.get_children():
		assert(portrait.texture != null)
	while session.current_line().id != "VN0020":
		assert(session.advance())
	assert(session.advance())
	assert(session.current_line().id == "VN0022")
	assert(session.state.readLines.has("VN0021"), "Hidden direction was not consumed")
	assert(screen.speaker.text == Prologue.data.lines[21].localized.en.speaker)
	await create_timer(0.15).timeout
	screen.next_button.pressed.emit()
	assert(session.state.scene == 1 and session.current_line().id == "VN0023", "Prologue did not enter scene 1")
	var reached_levels: Array[String] = []
	screen.match3_requested.connect(func(level_id: String) -> void: reached_levels.append(level_id))
	while session.current_line().id != "VN0040":
		assert(session.advance())
	assert(screen.choice_box.visible and screen.choice_prompt.text == "Where do we start?")
	screen.choice_buttons[1].pressed.emit()
	assert(session.state.choice == "B" and session.current_line().id == "VN0041B")
	assert(session.state.readLines.has("VN0040"), "Choice checkpoint was not consumed")
	while session.current_line().id != "VN0057":
		assert(session.advance())
	assert(screen.background_rect.texture.resource_path.ends_with("BG_LOCKER_ATHLETICS_DAY.webp"))
	assert(screen.boundary.visible and screen.next_button.disabled)
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL"], "First Match-3 gate was not requested")
	assert(session.state.scene == 1 and session.state.line == LockerScene.data.variants.B.size() - 1, "Advanced into an unavailable scene")
	assert(session.state.readLines.has("VN0041B") and not session.state.readLines.has("VN0041A"))
	screen.menu_button.pressed.emit()
	var raw: String = session.store.storage.get_item(Format.CONTRACT.data.storyKey)
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	assert(menu.confirmation.visible)
	assert(session.store.storage.get_item(Format.CONTRACT.data.storyKey) == raw)
	menu.confirmation.hide()
	menu.confirmation.canceled.emit()
	assert(session.state.scene == 1 and session.current_line().id == "VN0057")
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	menu.confirmation.hide()
	menu.confirmation.confirmed.emit()
	assert(session.current_line().id == "VN0001" and session.state.scene == 0 and session.state.readLines.is_empty())
	# An unsuccessful write keeps in-memory progress and tells the player.
	session.store.storage.fail_write = true
	assert(session.advance())
	assert(menu.get_node("StoryScreen").warning.visible)
	menu.get_node("StoryScreen").menu_button.pressed.emit()
	assert(not menu.get_node("Content/Actions/Continue").disabled and menu.status.visible)
	menu.get_node("Content/Actions/Continue").pressed.emit()
	assert(session.current_line().id == "VN0002")
	menu.queue_free()
	await process_frame
	DirAccess.remove_absolute(preferences_path)
	_unsupported_save()
	_future_save()
	_choice_routes()
	var hidden_session := Memory.story_session()
	assert(hidden_session.store.save_story({"scene": 0, "line": 20}))
	hidden_session.reload()
	assert(hidden_session.resume() and hidden_session.current_line().id == "VN0022")
	assert(hidden_session.state.readLines.has("VN0021"))
	await process_frame
	print("UPDS Godot VN prologue smoke test passed.")
	quit()


func _unsupported_save() -> void:
	var memory := Memory.new()
	var store := Store.new(memory)
	assert(store.save_story({"scene": 12, "line": 3, "completed": [1]}))
	var raw: String = memory.get_item(Format.CONTRACT.data.storyKey)
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Session.new(store)
	root.add_child(menu)
	assert(menu.get_node("Content/Actions/Continue").disabled and menu.status.visible)
	menu.get_node("Content/Actions/Continue").pressed.emit()
	assert(not menu.has_node("StoryScreen"))
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	assert(menu.confirmation.visible and memory.get_item(Format.CONTRACT.data.storyKey) == raw)
	menu.confirmation.hide()
	menu.queue_free()


func _future_save() -> void:
	var memory := Memory.new()
	var raw := '{"schemaVersion":99,"scene":12,"line":3}'
	assert(memory.set_item(Format.CONTRACT.data.storyKey, raw))
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Session.new(Store.new(memory))
	root.add_child(menu)
	assert(menu.get_node("Content/Actions/Continue").disabled and menu.status.visible)
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	assert(menu.confirmation.visible)
	assert(memory.get_item(Format.CONTRACT.data.storyKey) == raw)
	menu.confirmation.hide()
	menu.queue_free()


func _choice_routes() -> void:
	for option in ["A", "B", "C"]:
		var session := Memory.story_session()
		session.state.scene = 1
		session.state.choice = "A"
		session.state.line = LockerScene.data.variants.A.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0040")
		assert(session.choose(option), "CHOICE_00 option %s was rejected" % option)
		assert(session.current_line().id == "VN0041" + option)
		assert(session.state.choice == option and session.state.readLines == ["VN0040"])
		session.reload()
		assert(session.current_line().id == "VN0041" + option, "CHOICE_00 option %s did not resume" % option)
