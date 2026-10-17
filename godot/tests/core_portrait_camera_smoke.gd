extends SceneTree

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = preload("res://tests/memory_storage.gd").story_session()
	menu.preferences = preload("res://scripts/player_preferences.gd").new("user://core_camera_%d.cfg" % Time.get_ticks_usec())
	root.add_child(menu)
	menu.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	menu.size = Vector2(390, 844)
	menu._begin_new_game()
	await create_timer(0.15).timeout
	var screen: Control = menu.story_screen
	assert(screen.background_fill.get_node("CoverRaster").size == Vector2i(390, 844))
	var backdrop_generation: int = screen.background_fill.render_generation
	screen._refresh()
	await process_frame
	assert(screen.background_fill.render_generation == backdrop_generation, "Same-background story refresh must use the cache")
	var portrait: TextureRect = screen.stage.get_child(0)
	var tween: Tween = portrait.get_meta("idle_tween")
	tween.stop()
	tween.custom_step(1.4)
	tween.pause()
	assert(is_equal_approx(portrait.size.y / screen.stage.size.y, 1.2816))
	assert(absf(portrait.offset_top + portrait.size.y * 0.0035) < 0.001, "Idle peak must follow the source .35% displacement")
	menu.size = Vector2(320, 844)
	await create_timer(0.15).timeout
	tween.custom_step(0.000001)
	assert(is_equal_approx(portrait.size.y / screen.stage.size.y, 1.68), "Core portraits must use the compact CSS override")
	assert(screen.background_fill.get_node("CoverRaster").size == Vector2i(320, 844))
	assert(screen.background_rect.material.get_shader_parameter("canvas_size") == Vector2(320, 844))
	assert(absf(portrait.offset_top + portrait.size.y * 0.0035) < 0.001, "Resize must not retain the previous idle amplitude")
	menu.size = Vector2(390, 844)
	await create_timer(0.15).timeout
	tween.custom_step(0.000001)
	assert(is_equal_approx(portrait.size.y / screen.stage.size.y, 1.2816))
	assert(absf(portrait.offset_top + portrait.size.y * 0.0035) < 0.001)
	assert(menu.session.current_line().id == "VN0001")
	assert(screen.get_node("Vignette").visible)
	assert(screen.background_rect.material != null and screen.background_rect.modulate == Color.WHITE)
	menu.session.state.scene = 15
	menu.session.state.line = 19
	assert(menu.session.resume())
	screen._refresh()
	await process_frame
	await process_frame
	var onoe := screen.stage.get_node("onoe") as TextureRect
	var miku := screen.stage.get_node("miku") as TextureRect
	assert(onoe.z_index == 4 and miku.z_index == 3, "Speaking Onoe must paint above Miku in VN0389")
	assert(screen.stage.z_index + onoe.z_index < screen.dialogue_panel.z_index,
		"Speaking-slot lift must stay inside the source stage stacking context")
	menu.queue_free()
	await process_frame
	print("UPDS core portrait camera smoke test passed.")
	quit()
