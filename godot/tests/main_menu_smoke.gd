extends SceneTree

const MenuCopy = preload("res://scripts/menu_copy.gd")


func _initialize() -> void:
	call_deferred("_run_smoke")


func _run_smoke() -> void:
	var packed_scene: PackedScene = load("res://scenes/main_menu.tscn")
	assert(packed_scene != null, "Main menu scene could not be loaded")
	var menu: Control = packed_scene.instantiate()
	menu.preferences = preload("res://scripts/player_preferences.gd").new(
		"user://main_menu_smoke_%s.cfg" % Time.get_ticks_usec())
	root.add_child(menu)
	await process_frame

	var locale := MenuCopy.system_locale()
	assert(menu.get_node("Content/Eyebrow").text == MenuCopy.text("eyebrow", locale))
	assert(menu.get_node("Content/Title").text == MenuCopy.text("title", locale))
	assert(menu.get_node("Content/Accent").text == MenuCopy.text("accent", locale))
	assert(menu.get_node("Content/Actions/Continue").disabled, "Continue requires a save adapter")
	assert(menu.get_node("Background").texture != null, "Clubroom background is missing")
	assert(menu.get_node("Content/Hero/Miku").texture != null, "Miku medallion is missing")
	assert(menu.get_node("Content/Hero/Onoe").texture != null, "Onoe medallion is missing")
	assert(menu.get_node("Content/Hero/Ayuki").texture != null, "Ayuki medallion is missing")

	var events: Array[String] = []
	menu.new_game_requested.connect(func() -> void: events.append("new_game"))
	menu.continue_requested.connect(func() -> void: events.append("continue"))
	menu.campaign_requested.connect(func() -> void: events.append("campaign"))
	menu.settings_requested.connect(func() -> void: events.append("settings"))
	menu.get_node("Content/Actions/NewGame").emit_signal("pressed")
	menu.get_node("Content/Actions/Continue").emit_signal("pressed")
	menu.get_node("Content/Actions/Campaign").emit_signal("pressed")
	menu.get_node("Content/Actions/Settings").emit_signal("pressed")
	assert(events == ["new_game", "continue", "campaign", "settings"], "Menu navigation signals changed")

	for supported_locale in ["en", "ru", "be"]:
		assert(not MenuCopy.text("new_game", supported_locale).is_empty())
		assert(not MenuCopy.text("settings", supported_locale).is_empty())

	print("UPDS Godot main menu smoke test passed (locale: %s)." % locale)
	quit()
