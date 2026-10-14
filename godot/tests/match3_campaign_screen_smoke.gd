extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")
const Match3Session = preload("res://scripts/match3_campaign_session.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var memory := Memory.new()
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Memory.story_session()
	menu.match3_session = Match3Session.new(preload("res://scripts/campaign_store.gd").new(memory))
	menu.preferences = preload("res://scripts/player_preferences.gd").new("user://campaign_screen_smoke_%s.cfg" % Time.get_ticks_usec())
	menu.preferences.set_locale("ru")
	root.add_child(menu)
	await process_frame
	menu._open_campaign()
	await process_frame
	var campaign: Control = menu.match3_campaign_screen
	assert(campaign.cards.get_child_count() == 22, "Campaign hub did not render all authored levels")
	assert(campaign.back_button.custom_minimum_size == Vector2(44, 44), "Campaign back action should match the source header size")
	assert(campaign.settings_button.custom_minimum_size == Vector2(44, 44), "Campaign settings action should match the source header size")
	assert(campaign.cards.get_child(1).get_child(0).get_child(3).disabled, "Second level should be locked initially")
	campaign.settings_button.pressed.emit()
	await process_frame
	assert(is_instance_valid(menu.settings_screen) and campaign.visible, "Campaign settings did not open over the campaign hub")
	menu.settings_screen.back_requested.emit()
	await process_frame
	assert(menu.settings_screen == null and campaign.visible, "Closing campaign settings did not return to the campaign hub")
	var bundle := CampaignData.load_bundle()
	var first_id := str(bundle.levels[0].id)
	var second_id := str(bundle.levels[1].id)
	menu._open_match3_level(second_id, true)
	assert(menu.match3_screen == null, "Locked level launched through the navigation boundary")
	menu.match3_session.complete_level(first_id, 5)
	campaign.refresh_screen()
	assert(not campaign.cards.get_child(1).get_child(0).get_child(3).disabled, "Completing first level did not unlock the second")
	campaign.cards.get_child(1).get_child(0).get_child(3).pressed.emit()
	await process_frame
	var match3: Control = menu.match3_screen
	assert(match3 != null and match3.campaign_mode, "Campaign level did not launch in standalone mode")
	assert(match3.level_id == second_id and match3.game.level_data.id == second_id, "Selected campaign level was not loaded")
	assert(match3.game.tiles.size() == int(bundle.levels[1].rows) * int(bundle.levels[1].columns), "Selected campaign board dimensions mismatch")
	assert(match3.back_button.custom_minimum_size == Vector2(44, 44), "Match-3 header back control should match the source button size")
	assert(match3.help_button.custom_minimum_size == Vector2(44, 44), "Match-3 help control should match the source button size")
	assert(match3.settings_button.custom_minimum_size == Vector2(44, 44), "Match-3 settings control should match the source button size")
	assert(match3.objective_icon.custom_minimum_size == Vector2(24, 24), "Objective art should use the compact source HUD size")
	assert(match3.hint_button.custom_minimum_size == Vector2(94, 48), "Hint control should preserve the source tool tray size")
	match3.help_button.pressed.emit()
	await process_frame
	assert(is_instance_valid(match3.help_dialog) and match3.help_dialog.visible, "Match-3 help action did not open its localized dialog")
	match3.help_dialog.confirmed.emit()
	await process_frame
	match3.settings_requested.emit()
	await process_frame
	assert(is_instance_valid(menu.settings_screen) and match3.visible, "Match-3 settings did not open over the board")
	menu.settings_screen.back_requested.emit()
	await process_frame
	assert(menu.settings_screen == null and match3.visible, "Closing settings did not return to the live Match-3 board")
	match3._show_hint()
	assert(match3.hinted_indices.size() == 2, "Hint action did not mark the two source cells")
	var hinted_cell: Control = match3.board.get_child(match3.hinted_indices[0])
	var hinted_style := hinted_cell.get_theme_stylebox("normal") as StyleBoxFlat
	assert(hinted_style.shadow_size == 12, "Hinted cell did not receive the source glow")
	await create_timer(0.42).timeout
	assert(hinted_cell.scale.x < 0.99 and hinted_cell.modulate.r > 1.0, "Hint pulse did not animate the cell and its brightness")
	match3.hinted_indices.clear()
	match3._render_board()
	match3.story_session = menu.session
	menu._open_story()
	await process_frame
	match3.dossier_requested.emit()
	await process_frame
	assert(not match3.visible and menu.story_screen.visible and is_instance_valid(menu.story_screen.overlay), "Match-3 dossier action did not open the story dossier")
	menu.story_screen._close_overlay()
	await process_frame
	assert(match3.visible and not menu.story_screen.visible, "Closing the dossier did not return to the live Match-3 board")
	var special_index := -1
	for index in match3.game.tiles.size():
		if not match3.game.tiles[index].is_empty() and match3.game.blocker_layers[index] == 0:
			special_index = index
			break
	assert(special_index >= 0, "Match-3 board has no open cell for the special impact sample")
	var special_frame_specials: Array[String] = match3.game.specials.duplicate()
	special_frame_specials[special_index] = "flash-row"
	match3._render_frame({
		"phase": "clear",
		"tiles": match3.game.tiles.duplicate(),
		"specials": special_frame_specials,
		"blockers": match3.game.blocker_layers.duplicate(),
		"ingredients": match3.game.ingredients.duplicate(),
		"cleared": [special_index],
		"cascade": 1,
		"feedback": "special",
	})
	assert(match3.match_feedback_panel.visible, "Special clear did not show the source feedback pill")
	assert(match3.match_feedback_label.text == "НАБЛЮДЕНИЕ!", "Special feedback did not use the Russian source copy")
	var feedback_style := match3.match_feedback_panel.get_theme_stylebox("panel") as StyleBoxFlat
	assert(feedback_style.bg_color == Color("#c07f35ef"), "Special feedback did not use the source amber treatment")
	var special_cell: Control = match3.board.get_child(special_index)
	assert(special_cell.get_node_or_null("SpecialImpactFlash") != null, "Special clear did not create its visual impact flash")
	assert(special_cell.get_node_or_null("SpecialImpactBeam") != null, "Line special did not create its directional beam")
	await create_timer(0.3).timeout
	match3._render_board()
	match3._render_frame({
		"phase": "reshuffle",
		"tiles": match3.game.tiles.duplicate(),
		"specials": match3.game.specials.duplicate(),
		"blockers": match3.game.blocker_layers.duplicate(),
		"ingredients": match3.game.ingredients.duplicate(),
		"cascade": 0,
		"feedback": "reshuffled",
	})
	assert(match3.match_feedback_label.text == "НЕТ ХОДОВ · ПОЛЕ ПЕРЕМЕШАНО", "Reshuffle feedback did not use the localized message")
	var reshuffled_stack: Control = match3.board.get_child(0).get_node("TileStack")
	assert(reshuffled_stack.scale.is_equal_approx(Vector2(0.82, 0.82)), "Reshuffle animation did not start at its source scale")
	await create_timer(0.5).timeout
	assert(reshuffled_stack.scale.is_equal_approx(Vector2.ONE), "Reshuffle animation did not return tiles to their resting scale")
	match3._render_board()
	assert(menu.session.state.completed.is_empty(), "Standalone Match-3 campaign changed VN completion")
	match3.story_requested.emit()
	await process_frame
	assert(menu.match3_screen == null and campaign.visible, "Returning from a level did not restore the campaign hub")
	campaign.back_button.pressed.emit()
	await process_frame
	assert(menu.match3_campaign_screen == null and menu.get_node("Content").visible, "Campaign back did not restore the main menu")
	menu.queue_free()
	await process_frame
	print("UPDS Godot Match-3 campaign screen smoke test passed (sequential unlock and level routing).")
	quit()
