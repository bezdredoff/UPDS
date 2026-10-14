extends SceneTree

const MenuCopy = preload("res://scripts/menu_copy.gd")


func _initialize() -> void:
	call_deferred("_run_smoke")


func _run_smoke() -> void:
	var packed_scene: PackedScene = load("res://scenes/main_menu.tscn")
	assert(packed_scene != null, "Main menu scene could not be loaded")
	var menu: Control = packed_scene.instantiate()
	menu.session = preload("res://tests/memory_storage.gd").story_session()
	menu.preferences = preload("res://scripts/player_preferences.gd").new(
		"user://main_menu_smoke_%s.cfg" % Time.get_ticks_usec())
	root.add_child(menu)
	await process_frame

	var menu_width: float = minf(menu.size.x, 430.0)
	assert(absf(menu.get_node("Background").size.x - menu_width) < 1.0,
		"The menu art frame must follow the 430 px web phone width")
	assert(absf(menu.get_node("Content").size.x - (menu_width - 56.0)) < 1.0,
		"The menu content must retain the web page's 28 px side padding")
	assert(menu.get_node("Content/Hero").position.y / menu.get_node("Content").size.y < 0.45,
		"The character medallions must stay with the title block above the flexible spacer")
	assert(menu.get_node("Wash").texture.get_height() >= 1024,
		"The menu gradient must keep enough vertical resolution to avoid visible bands")

	var locale := MenuCopy.system_locale()
	assert(menu.get_node("Content/Eyebrow").text == MenuCopy.text("eyebrow", locale))
	assert(menu.get_node("Content/Title").text == MenuCopy.text("title", locale))
	assert(menu.get_node("Content/Accent").text == MenuCopy.text("accent", locale))
	assert(menu.get_node("Content/Actions/Continue").disabled, "Continue requires a save adapter")
	var continue_button: Button = menu.get_node("Content/Actions/Continue")
	assert(is_equal_approx(continue_button.modulate.a, 0.38),
		"Disabled Continue should use the source web opacity")
	assert(continue_button.get_theme_color("font_disabled_color") == continue_button.get_theme_color("font_color")
		and continue_button.get_theme_stylebox("disabled") == continue_button.get_theme_stylebox("normal"),
		"Disabled Continue should apply only the source opacity, without Godot's extra disabled tint")
	var new_game_button: Button = menu.get_node("Content/Actions/NewGame")
	var menu_button_font := new_game_button.get_theme_font("font") as SystemFont
	var secondary_button_font := continue_button.get_theme_font("font") as SystemFont
	assert(menu_button_font != null and menu_button_font.font_weight == 850
		and secondary_button_font != null and secondary_button_font.font_weight == 700,
		"Main menu buttons should match the source font weights")
	assert(menu.get_node("Background").texture != null, "Clubroom background is missing")
	for character in ["Miku", "Onoe", "Ayuki"]:
		var medallion: Control = menu.get_node("Content/Hero/" + character)
		assert((medallion.get_node("Portrait") as TextureRect).texture != null,
			"%s medallion is missing" % character)
		assert(medallion.get_node("Shadow") is Panel,
			"%s medallion is missing its source drop shadow" % character)

	var events: Array[String] = []
	menu.new_game_requested.connect(func() -> void: events.append("new_game"))
	menu.continue_requested.connect(func() -> void: events.append("continue"))
	menu.campaign_requested.connect(func() -> void: events.append("campaign"))
	menu.settings_requested.connect(func() -> void: events.append("settings"))
	menu.get_node("Content/Actions/NewGame").emit_signal("pressed")
	menu.get_node("Content/Actions/Continue").emit_signal("pressed")
	menu.get_node("Content/Actions/Campaign").emit_signal("pressed")
	menu._close_story()
	menu.get_node("Content/Actions/Settings").emit_signal("pressed")
	assert(events == ["new_game", "campaign", "settings"], "Unavailable Continue must not navigate")

	for supported_locale in ["en", "ru", "be"]:
		assert(not MenuCopy.text("new_game", supported_locale).is_empty())
		assert(not MenuCopy.text("settings", supported_locale).is_empty())

	print("UPDS Godot main menu smoke test passed (locale: %s)." % locale)
	quit()
