extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")
const Match3Session = preload("res://scripts/match3_campaign_session.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")


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
	assert(match3.active_tutorial == "clear-package" and match3.tutorial_panel.visible, "Level-start blocker tutorial was not selected in authored order")
	assert(match3.tutorial_title.text == "Снимайте слои пакета", "Campaign tutorial copy did not use the localized concept")
	match3.tutorial_button.pressed.emit()
	assert(not match3.tutorial_panel.visible and match3.active_tutorial == "clear-package", "Acknowledging a tutorial should dismiss its prompt without marking the mechanic complete")
	assert(match3.session.save.tutorialsCompleted.is_empty(), "Dismissing a blocker tutorial incorrectly completed it")
	match3._record_tutorial_move({"valid": true, "blockersCleared": 1})
	assert(match3.session.save.tutorialsCompleted == ["clear-package"] and match3.active_tutorial.is_empty(), "Clearing a blocker did not complete the campaign tutorial concept")
	match3._record_tutorial_move({"valid": true, "specialsCreated": 1})
	match3._refresh()
	assert(match3.active_tutorial == "activate-special" and match3.tutorial_panel.visible, "Creating a special did not reveal its next tutorial")
	match3.tutorial_button.pressed.emit()
	assert(match3.session.save.tutorialsCompleted == ["clear-package", "activate-special"], "Acknowledging the special-activation concept did not persist the campaign tutorial progress")
	match3._record_tutorial_move({"valid": true}, true)
	assert(match3.active_tutorial.is_empty(), "Completing the special activation did not advance the tutorial sequence")
	assert(match3.game.tiles.size() == int(bundle.levels[1].rows) * int(bundle.levels[1].columns), "Selected campaign board dimensions mismatch")
	assert(match3.back_button.custom_minimum_size == Vector2(44, 44), "Match-3 header back control should match the source button size")
	assert(match3.help_button.custom_minimum_size == Vector2(44, 44), "Match-3 help control should match the source button size")
	assert(match3.settings_button.custom_minimum_size == Vector2(44, 44), "Match-3 settings control should match the source button size")
	assert(match3.objective_icon.custom_minimum_size == Vector2(24, 24), "Objective art should use the compact source HUD size")
	assert(match3.hint_button.custom_minimum_size == Vector2(94, 48), "Hint control should preserve the source tool tray size")
	var tutorial_style := match3.tutorial_panel.get_theme_stylebox("panel") as StyleBoxFlat
	assert(is_equal_approx(match3.tutorial_panel.custom_maximum_size.x, 350.0), "Tutorial card width should match the source 350px maximum")
	assert(tutorial_style.border_width_top == 3 and tutorial_style.border_width_left == 8, "Tutorial card border should match the source gold frame and green spine")
	assert(tutorial_style.bg_color.to_html(false) == Color("#fff7df").to_html(false), "Tutorial card paper color should match the source palette")
	assert(match3.tutorial_frame.custom_minimum_size.x == 356.0 and (match3.tutorial_frame.get_theme_stylebox("panel") as StyleBoxFlat).bg_color.to_html(false) == Color("#102744").to_html(false), "Tutorial card should have the source 3px navy outline")
	var tutorial_button_style := match3.tutorial_button.get_theme_stylebox("normal") as StyleBoxFlat
	assert(tutorial_button_style.border_width_top == 2 and tutorial_button_style.bg_color.to_html(false) == Color("#2f6549").to_html(false), "Tutorial action button should match the source green and 2px gold border")
	var original_screen_width := match3.size.x
	match3.size.x = 320.0
	match3._fit_tutorial_card()
	assert(match3.tutorial_panel.custom_minimum_size.x == 292.0 and match3.tutorial_frame.custom_minimum_size.x == 298.0, "Tutorial card did not keep the source 14px responsive overlay inset")
	match3.size.x = original_screen_width
	match3._fit_tutorial_card()
	assert(match3.bottom_spacer.name == "MatchGuidance" and match3.guidance_labels[0].name == "InputGuidance", "Match-3 input guidance slot is missing")
	assert(match3.guidance_labels[0].text == MenuCopy.text("match3_input_hint", "ru"), "Match-3 input guidance did not use the selected locale")
	assert(match3.bottom_spacer.visible, "Match-3 guidance should be visible while the board is active")
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(match3.guidance_labels[0].text == MenuCopy.text("match3_input_hint", locale), "Match-3 input guidance did not update for %s" % locale)
	assert(menu.preferences.set_locale("ru") == OK)
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
	var settle_index := -1
	for index in match3.game.tiles.size():
		if not match3.game.tiles[index].is_empty() and match3.game.blocker_layers[index] == 0:
			settle_index = index
			break
	assert(settle_index >= 0, "Match-3 board has no open cell for the settle animation sample")
	match3._render_frame({
		"phase": "settle",
		"tiles": match3.game.tiles.duplicate(),
		"specials": match3.game.specials.duplicate(),
		"blockers": match3.game.blocker_layers.duplicate(),
		"ingredients": match3.game.ingredients.duplicate(),
		"motions": [{"index": settle_index, "rows": 2, "spawn": true}],
	})
	var settle_cell: Control = match3.board.get_child(settle_index)
	var settle_stack: Control = settle_cell.get_node("TileStack")
	assert(is_equal_approx(settle_stack.offset_top, -settle_cell.size.y * 2.0) and is_equal_approx(settle_stack.offset_bottom, -settle_cell.size.y * 2.0), "Spawn offset mismatch top=%s bottom=%s size=%s" % [settle_stack.offset_top, settle_stack.offset_bottom, settle_cell.size])
	assert(settle_stack.scale.is_equal_approx(Vector2(0.86, 0.86)) and is_equal_approx(settle_stack.modulate.a, 0.05), "Spawn animation did not match its source start scale and opacity")
	await create_timer(0.25).timeout
	assert(settle_stack.offset_top > 0.0 and settle_stack.offset_top < settle_cell.size.y * 0.08, "Spawn animation missed the source 3% overshoot")
	await create_timer(0.1).timeout
	assert(is_zero_approx(settle_stack.offset_top) and is_zero_approx(settle_stack.offset_bottom) and settle_stack.scale.is_equal_approx(Vector2.ONE) and is_equal_approx(settle_stack.modulate.a, 1.0), "Spawn animation did not settle to its source end state")
	match3._render_board()
	var ingredient_kinds: Array = bundle.assets.ingredients.keys()
	assert(not ingredient_kinds.is_empty(), "Campaign bundle has no Match-3 ingredient artwork")
	var visual_ingredients: Array[String] = match3.game.ingredients.duplicate()
	visual_ingredients[settle_index] = str(ingredient_kinds[0])
	match3._render_frame({
		"phase": "settle",
		"tiles": match3.game.tiles.duplicate(),
		"specials": match3.game.specials.duplicate(),
		"blockers": match3.game.blocker_layers.duplicate(),
		"ingredients": visual_ingredients,
		"motions": [],
	})
	var ingredient_cell: Control = match3.board.get_child(settle_index)
	var ingredient_icon: TextureRect = ingredient_cell.get_node("TileStack/Ingredient")
	var ingredient_glow: TextureRect = ingredient_cell.get_node("TileStack/IngredientGlow")
	assert(ingredient_icon.anchor_right == 1.0 and ingredient_icon.anchor_bottom == 1.0 and ingredient_icon.offset_left == 3.0, "Ingredient artwork did not fill the source cell with its 3px inset")
	await create_timer(0.71).timeout
	assert(ingredient_icon.offset_top < 2.0 and ingredient_glow.modulate.a > 0.2 and ingredient_glow.scale.x > 1.1, "Ingredient idle did not reach its source lift and gold glow")
	await create_timer(0.72).timeout
	assert(ingredient_icon.offset_top > 2.5 and ingredient_glow.modulate.a < 0.05 and ingredient_glow.scale.x < 1.02, "Ingredient idle did not return near its source resting state")
	match3._render_board()
	match3._render_frame({
		"phase": "clear",
		"tiles": match3.game.tiles.duplicate(),
		"specials": match3.game.specials.duplicate(),
		"blockers": match3.game.blocker_layers.duplicate(),
		"ingredients": match3.game.ingredients.duplicate(),
		"cleared": [settle_index],
		"cascade": 1,
		"feedback": "match",
	})
	var clearing_stack: Control = match3.board.get_child(settle_index).get_node("TileStack")
	await create_timer(0.12).timeout
	assert(clearing_stack.scale.x > 1.05 and clearing_stack.modulate.r > 1.4, "Clear animation missed its source 1.1 scale and brightness peak")
	await create_timer(0.19).timeout
	assert(clearing_stack.scale.is_equal_approx(Vector2(0.18, 0.18)) and clearing_stack.modulate.a < 0.01, "Clear animation missed its source shrink and fade end state")
	match3._render_board()
	var columns := int(match3.game.level_data.columns)
	var rejected_first := settle_index
	var rejected_second := settle_index + 1 if (settle_index + 1) % columns != 0 else settle_index - 1
	var rejected_cell: Control = match3.board.get_child(rejected_first)
	var rejected_home_x := rejected_cell.position.x
	match3._shake_rejected_cells([rejected_first, rejected_second])
	await create_timer(0.12).timeout
	assert(absf(rejected_cell.position.x - rejected_home_x) > 1.0, "Rejected swap did not shake the whole source cell")
	await create_timer(0.12).timeout
	assert(is_equal_approx(rejected_cell.position.x, rejected_home_x), "Rejected cell did not return to its source position")
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
	var impact_target := special_index + 1 if (special_index + 1) % columns != 0 else special_index - 1
	match3._render_frame({
		"phase": "clear",
		"tiles": match3.game.tiles.duplicate(),
		"specials": special_frame_specials,
		"blockers": match3.game.blocker_layers.duplicate(),
		"ingredients": match3.game.ingredients.duplicate(),
		"cleared": [special_index, impact_target],
		"cascade": 1,
		"feedback": "special",
	})
	assert(match3.match_feedback_panel.visible, "Special clear did not show the source feedback pill")
	assert(match3.match_feedback_label.text == "НАБЛЮДЕНИЕ!", "Special feedback did not use the Russian source copy")
	var feedback_style := match3.match_feedback_panel.get_theme_stylebox("panel") as StyleBoxFlat
	assert(feedback_style.bg_color == Color("#c07f35ef"), "Special feedback did not use the source amber treatment")
	var special_cell: Control = match3.board.get_child(special_index)
	assert(special_cell.get_node_or_null("SpecialImpactFlash") != null, "Special clear did not create its visual impact flash")
	assert(special_cell.get_node_or_null("SpecialImpactSourceOutline") != null, "Activated special did not receive its source outline")
	assert(special_cell.get_node_or_null("SpecialImpactBeam") != null, "Line special did not create its directional beam")
	var target_cell: Control = match3.board.get_child(impact_target)
	assert(target_cell.get_node_or_null("SpecialImpactTargetOutline") != null, "Affected clear target did not receive its target outline")
	assert(target_cell.get_node_or_null("SpecialImpactFlash") != null, "Affected clear target did not receive its impact flash")
	var special_stack: Control = special_cell.get_node("TileStack")
	var special_icon: TextureRect = special_stack.get_node("Special")
	var special_glow: TextureRect = special_stack.get_node("SpecialGlow")
	var direction_marker: PanelContainer = special_stack.get_node("SpecialDirectionMarker")
	assert(is_equal_approx(special_icon.rotation_degrees, -8.0), "Flash Row activation did not start from the source impact keyframe")
	assert(direction_marker.get_child(0).text == "↔" and special_glow.modulate.a < 1.0, "Flash Row missed its direction marker or translucent gold glow")
	await create_timer(0.3).timeout
	assert(is_equal_approx(special_icon.rotation_degrees, 0.0), "Flash Row activation did not return to neutral rotation")
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
	match3.game.state = "won"
	match3.session.complete_level(second_id, match3.game.moves_left)
	match3._refresh()
	await process_frame
	assert(match3.campaign_result_overlay.visible, "Campaign win did not open its dedicated result screen")
	assert(not match3.bottom_spacer.visible, "Match-3 guidance should be hidden after a win")
	assert(match3.campaign_result_next.visible and match3.campaign_result_heading.text == "Доска расследования решена", "Campaign win result omitted its next-level action or localized heading")
	assert(match3.campaign_result_heading.size.x >= 330 and match3.campaign_result_next.size.x >= 330, "Campaign result content did not stretch to the source phone-frame width")
	assert(match3.campaign_result_detail.text.contains(str(match3.game.moves_left)), "Campaign result omitted the remaining moves")
	assert(match3.session.save.completed.has(second_id), "Campaign win did not persist its completion")
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(match3.campaign_result_heading.text == MenuCopy.text("campaign_win_heading", locale), "Campaign result heading did not update for %s" % locale)
	assert(menu.preferences.set_locale("ru") == OK)
	match3.campaign_result_next.pressed.emit()
	await process_frame
	match3 = menu.match3_screen
	var third_id := str(bundle.levels[2].id)
	assert(match3 != null and match3.level_id == third_id, "Next Level did not start the following campaign board")
	match3.game.state = "lost"
	match3._refresh()
	assert(match3.campaign_result_overlay.visible and not match3.campaign_result_next.visible, "Campaign loss did not show the loss result state")
	assert(not match3.tutorial_overlay.visible, "Tutorial overlay remained visible over the loss result")
	assert(match3.campaign_result_heading.text == "Попробуйте уровень ещё раз", "Campaign loss heading was not localized")
	assert(not match3.bottom_spacer.visible, "Match-3 guidance should be hidden after a loss")
	var retries_before := int(match3.session.save.attempts.get(third_id, 0))
	match3.campaign_result_retry.pressed.emit()
	assert(match3.game.state == "playing" and not match3.campaign_result_overlay.visible, "Retry did not return to a fresh campaign board")
	assert(int(match3.session.save.attempts.get(third_id, 0)) == retries_before + 1, "Retry did not increment the campaign attempt")
	match3.game.state = "lost"
	match3._refresh()
	match3.campaign_result_hub.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and campaign.visible, "Returning from a level did not restore the campaign hub")
	campaign.back_button.pressed.emit()
	await process_frame
	assert(menu.match3_campaign_screen == null and menu.get_node("Content").visible, "Campaign back did not restore the main menu")
	menu.queue_free()
	await process_frame
	print("UPDS Godot Match-3 campaign screen smoke test passed (sequential unlock and level routing).")
	quit()
