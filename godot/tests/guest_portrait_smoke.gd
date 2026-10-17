extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = preload("res://tests/memory_storage.gd").story_session()
	menu.preferences = preload("res://scripts/player_preferences.gd").new("user://guest_smoke_%d.cfg" % Time.get_ticks_usec())
	root.add_child(menu)
	menu.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	menu.size = Vector2(390, 844)
	menu.session.state.scene = 11
	menu.session.state.line = 5
	assert(menu.session.resume())
	menu._open_story()
	await create_timer(0.15).timeout
	var screen: Control = menu.story_screen
	assert(menu.session.current_line().id == "VN0294")
	assert(screen.stage.get_child_count() == 1, "Hinata's portrait disappeared from VN0294")
	var portrait: TextureRect = screen.stage.get_child(0)
	assert(portrait.name == "hinata" and portrait.texture.resource_path == "res://assets/guests/hinata/neutral.png")
	assert(portrait.texture.get_image().has_mipmaps(), "Guest runtime textures must import mipmaps")
	assert(is_equal_approx(portrait.size.y / screen.stage.size.y, 1.78))
	var start_rect := portrait.get_global_rect()
	await create_timer(0.35).timeout
	assert(portrait.get_global_rect().is_equal_approx(start_rect), "Source guest witnesses have no idle-breathe animation")
	# A width-only resize must switch the CSS camera without replacing the scene.
	menu.size = Vector2(320, 844)
	await create_timer(0.15).timeout
	assert(is_equal_approx(portrait.size.y / screen.stage.size.y, 1.68))
	assert(screen.stage.offset_top == 56.0 and screen.get_node("HeaderBackground").offset_bottom == 56.0,
		"Compact VN header must reserve the source 56px, not the standard 60px")
	assert(absf(portrait.get_global_rect().get_center().x - screen.stage.get_global_rect().position.x - screen.stage.size.x * 0.71) < 0.1)
	menu.size = Vector2(390, 844)
	await create_timer(0.15).timeout
	assert(is_equal_approx(portrait.size.y / screen.stage.size.y, 1.78))
	assert(menu.session.current_line().id == "VN0294", "Responsive camera must not advance the story")
	menu.queue_free()
	await process_frame
	print("UPDS guest portrait smoke test passed.")
	quit()
