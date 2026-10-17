extends SceneTree


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = preload("res://tests/memory_storage.gd").story_session()
	menu.preferences = preload("res://scripts/player_preferences.gd").new("user://reflow_smoke_%d.cfg" % Time.get_ticks_usec())
	menu.preferences.locale = "ru"
	root.add_child(menu)
	menu.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	menu.size = Vector2(430, 854)
	menu._begin_new_game()
	await create_timer(0.15).timeout
	var screen: Control = menu.story_screen
	var original_pages: Array = screen._dialogue_pages.duplicate()
	var line_id: String = menu.session.current_line().id
	var text: String = menu.session.current_line().localized.ru.text
	screen._dialogue_page_index = screen._dialogue_pages.size() - 1
	var original_index: int = screen._dialogue_page_index
	menu.size = Vector2(320, 568)
	await create_timer(0.2).timeout
	assert(screen._dialogue_pages == screen._paginate_dialogue(text), "Resize retained the previous page layout")
	assert(screen._dialogue_pages != original_pages, "Resize fixture must exercise a different measured page layout")
	assert(screen._dialogue_page_index == mini(original_index, screen._dialogue_pages.size() - 1),
		"Resize must preserve the current page when possible")
	assert(menu.session.current_line().id == line_id, "Reflow must not advance the story")
	screen._dialogue_page_index = screen._dialogue_pages.size() - 1
	menu.size = Vector2(430, 854)
	await create_timer(0.2).timeout
	assert(screen._dialogue_pages == original_pages, "Returning to the original width must restore its page layout")
	assert(screen._dialogue_page_index < screen._dialogue_pages.size(), "Reflow failed to clamp a removed final page")
	screen._select_text_scale("large", false)
	assert(is_equal_approx(screen.dialogue.custom_minimum_size.y, 19.0 * 2.92 + 19.0),
		"Large text must also resize its CSS-sized dialogue viewport")
	screen._queue_dialogue_reflow()
	menu.remove_child(screen)
	await create_timer(0.2).timeout
	screen.queue_free()
	menu.queue_free()
	await process_frame
	print("UPDS VN dialogue reflow smoke test passed.")
	quit()
