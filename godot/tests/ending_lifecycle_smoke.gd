extends SceneTree

func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var memory = preload("res://tests/memory_storage.gd")
	var menu = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = memory.story_session()
	menu.match3_session = preload("res://scripts/match3_campaign_session.gd").new(
		preload("res://scripts/campaign_store.gd").new(memory.new()))
	var preferences_path := "user://ending_lifecycle_%d.cfg" % Time.get_ticks_usec()
	menu.preferences = preload("res://scripts/player_preferences.gd").new(preferences_path)
	menu.session.state.scene = 40
	menu.session.state.line = preload("res://data/post_private_return_scene.json").data.lines.size()
	assert(menu.session.resume(), "Continue must accept a saved ending boundary")
	root.add_child(menu)
	menu._open_story()
	await create_timer(0.1).timeout
	menu.audio_runtime.activate()
	assert(menu.audio_runtime._scene == "ending")
	assert(absf(menu.audio_runtime.music.stream.get_length() - 16.0 * 60.0 / 68.0) < 0.001)
	var screen = menu.story_screen
	assert(screen.ending_panel.visible and not screen.nameplate.visible)
	assert(not screen.background_rect.visible and not screen.get_node("Vignette").visible)
	assert(screen.background_fill._profile == Vector4(3, 0.45, 1, 1.03))
	assert(screen._ending_view.clue.texture.resource_path == "res://assets/match3/goal_receipt.png")
	menu.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	menu.size = Vector2(320, 568)
	await create_timer(0.1).timeout
	var view = screen._ending_view
	get_root().gui_release_focus()
	var tab := InputEventKey.new()
	tab.keycode = KEY_TAB
	tab.pressed = true
	Input.parse_input_event(tab)
	await process_frame
	assert(get_root().gui_get_focus_owner() == view.settings_button,
		"The first physical Tab must start at ending settings from body focus")
	view._keyboard = true
	view.menu_button.grab_focus()
	assert(view._scroll > 0 and view._header.position.y == -view._scroll)
	assert(view.menu_button.get_global_rect().end.y <= view.size.y + 0.5)
	view.replay_button.grab_focus()
	assert(view.replay_button.get_global_rect().end.y <= view.size.y + 0.5)
	view.settings_button.grab_focus()
	assert(is_zero_approx(view._scroll), "Focus must reveal the ending header after overflowing card actions")
	var saved: Dictionary = menu.session.state.duplicate(true)
	var pointer := InputEventMouseButton.new()
	pointer.button_index = MOUSE_BUTTON_LEFT
	pointer.position = root.get_final_transform() * view.settings_button.get_global_rect().get_center()
	pointer.global_position = pointer.position
	var motion := InputEventMouseMotion.new()
	motion.position = pointer.position
	motion.global_position = pointer.position
	Input.parse_input_event(motion)
	await process_frame
	pointer.pressed = true
	Input.parse_input_event(pointer)
	var release := pointer.duplicate() as InputEventMouseButton
	release.pressed = false
	Input.parse_input_event(release)
	await process_frame
	assert(is_instance_valid(menu.settings_screen) and not screen.visible)
	assert(is_instance_valid(menu.settings_screen.main_menu_button))
	menu.preferences.set_locale("be")
	menu._close_settings()
	await process_frame
	assert(screen.visible and menu.session.state == saved)
	assert(menu.audio_runtime._scene == "ending")
	assert(screen.ending_heading.text == preload("res://data/ending_outcomes.json").data.copy.be.outcomes.ENDING_B_CASE_CLOSED.heading)
	assert(get_root().gui_get_focus_owner() == null, "Ending settings return must match the freshly rendered source body focus")
	screen.ending_replay_button.emit_signal("pressed")
	await create_timer(0.1).timeout
	assert(menu.session.current_line().id == "VN0001" and menu.session.state.clues.is_empty())
	assert(menu.audio_runtime._scene == "vn")
	assert(menu.session.state.storyChoices.is_empty() and not screen.ending_panel.visible)
	assert(not screen._ending_view.visible and screen.page_progress.visible)
	assert(screen.background_rect.visible and screen.get_node("Vignette").visible)
	assert(screen.background_fill._profile == Vector4(16, 0.7, 0.82, 1.08))
	assert(is_zero_approx(screen.background_fill.position.y))
	menu.session.state.scene = 44
	menu.session.state.line = preload("res://data/post_convenient_case_scene.json").data.lines.size()
	menu.session.state.storyChoices = {"final-strategy": "C"}
	assert(menu.session.resume())
	await process_frame
	screen.ending_menu_button.emit_signal("pressed")
	await process_frame
	assert(not is_instance_valid(menu.story_screen) and menu.get_node("Content").visible)
	assert(menu.audio_runtime._scene == "menu")
	assert(menu.session.ending_result().endingId == "ENDING_C_PERFECT_SUSPECT")
	assert(not menu.get_node("Content/Actions/Continue").disabled)
	menu._open_story()
	await process_frame
	assert(menu.story_screen.ending_panel.visible)
	assert(menu.story_screen.ending_heading.text == preload("res://data/ending_outcomes.json").data.copy.be.outcomes.ENDING_C_PERFECT_SUSPECT.heading)
	menu.story_screen._ending_view.settings_button.emit_signal("pressed")
	await process_frame
	assert(menu.settings_screen.navigation_title.text == preload("res://data/ending_outcomes.json").data.copy.be.settingsNavigation.title)
	menu.settings_screen.main_menu_button.emit_signal("pressed")
	await process_frame
	assert(not is_instance_valid(menu.story_screen) and menu.get_node("Content").visible)
	assert(menu.audio_runtime._scene == "menu")
	assert(menu.session.ending_result().endingId == "ENDING_C_PERFECT_SUSPECT")
	menu.queue_free()
	await process_frame
	if FileAccess.file_exists(preferences_path): DirAccess.remove_absolute(preferences_path)
	print("UPDS Godot ending lifecycle smoke passed.")
	quit()
