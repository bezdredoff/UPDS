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
	var board_outline := match3.board_frame.get_parent() as PanelContainer
	var board_outline_style := board_outline.get_theme_stylebox("panel") as StyleBoxFlat
	var board_frame_style := match3.board_frame.get_theme_stylebox("panel") as StyleBoxFlat
	var board_inner_border := board_outline.get_node("BoardInnerBorder") as Panel
	var board_inner_border_style := board_inner_border.get_theme_stylebox("panel") as StyleBoxFlat
	var board_surface_material := match3.board_frame.material as ShaderMaterial
	assert(board_outline.name == "BoardNavyOutline" and board_outline_style.bg_color.is_equal_approx(Color("#102744"))
		and board_outline_style.content_margin_left == 3 and board_outline_style.shadow_color.is_equal_approx(Color("#d5b269"))
		and board_outline_style.shadow_size == 2,
		"Production board should have its 3px navy outline and 2px gold ring")
	assert(board_frame_style.border_width_left == 0 and board_frame_style.corner_radius_top_left == 8
		and board_frame_style.content_margin_left == 10 and board_frame_style.shadow_offset == Vector2(0, 9)
		and board_frame_style.shadow_size == 20, "Production board frame style mismatch")
	assert(board_surface_material != null and board_surface_material.shader.code.contains("stripe_phase")
		and board_surface_material.shader.code.contains("14.0") and board_surface_material.shader.code.contains("7.0"),
		"Production board surface should preserve its paper edge, striped gradient and source colors")
	assert(board_inner_border.name == "BoardInnerBorder" and board_inner_border_style.border_width_left == 1
		and board_inner_border_style.corner_radius_top_left == 3,
		"Production board should preserve its one-pixel inner gold line")
	assert(match3.board.get_theme_constant("h_separation") == 4
		and match3.board.get_theme_constant("v_separation") == 4,
		"Production board should preserve its four-pixel cell gaps")
	var cell_background := match3.board.get_child(0).get_node("CellBackground") as Panel
	var cell_background_material := cell_background.material as ShaderMaterial
	assert(cell_background_material != null and cell_background_material.shader.code.contains("gradient_axis")
		and cell_background.offset_left == 1 and cell_background.offset_right == -1,
		"Match-3 cells should render the source diagonal gradient and inset edge treatment beneath tile art")
	assert((cell_background_material.get_shader_parameter("color_start") as Color).is_equal_approx(Color("#493552"))
		and (cell_background_material.get_shader_parameter("color_end") as Color).is_equal_approx(Color("#2a3c59"))
		and is_equal_approx(cell_background_material.get_shader_parameter("gradient_end_stop"), 0.72),
		"The first production board cell should use its plum-to-navy 145-degree gradient")
	var alternate_cell_material := (match3.board.get_child(1).get_node("CellBackground") as Panel).material as ShaderMaterial
	assert((alternate_cell_material.get_shader_parameter("color_start") as Color).is_equal_approx(Color("#3d3352"))
		and (alternate_cell_material.get_shader_parameter("color_end") as Color).is_equal_approx(Color("#243b58")),
		"Even production board cells should use the alternate plum-to-navy gradient")
	var cell_socket := match3.board.get_child(0).get_node("CellSocket") as Panel
	var socket_style := cell_socket.get_theme_stylebox("panel") as StyleBoxFlat
	assert(cell_socket.offset_left == 3 and cell_socket.offset_top == 3
		and cell_socket.offset_right == -3 and cell_socket.offset_bottom == -3
		and socket_style.bg_color == Color.WHITE
		and socket_style.get_border_width(SIDE_LEFT) == 0 and socket_style.get_corner_radius(CORNER_TOP_LEFT) == 2
		and cell_socket.material is ShaderMaterial
		and (cell_socket.material as ShaderMaterial).shader.code.contains("0.45, 0.32")
		and (cell_socket.material as ShaderMaterial).shader.code.contains("0.0862745"),
		"Production tile socket should match its 3px inset, radial highlight and two-pixel corners")
	var normal_tile := match3.board.get_child(0).get_node("TileStack/Tile") as TextureRect
	var normal_tile_material := normal_tile.material as ShaderMaterial
	assert(normal_tile.offset_left == 0 and normal_tile.offset_top == 0
		and normal_tile.scale.is_equal_approx(Vector2(1.04, 1.04))
		and (normal_tile_material.get_shader_parameter("shadow_color") as Color).is_equal_approx(Color("#071224b8"))
		and (normal_tile_material.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0, 2))
		and is_equal_approx(normal_tile_material.get_shader_parameter("saturation"), 1.05),
		"Production tile artwork should fill its cell and preserve its 1.04 scale, drop shadow and saturation")
	var first_tile_before_variant_check: String = match3.game.tiles[0]
	match3.game.tiles[0] = "camisole"
	match3._render_board()
	var camisole_tile := match3.board.get_child(0).get_node("TileStack/Tile") as TextureRect
	var camisole_shadow := camisole_tile.material as ShaderMaterial
	assert(camisole_shadow != null and is_equal_approx(camisole_shadow.get_shader_parameter("brightness"), 1.38)
		and is_equal_approx(camisole_shadow.get_shader_parameter("shadow_blur_px"), 1.0)
		and is_equal_approx(camisole_shadow.get_shader_parameter("saturation"), 1.0),
		"Camisole tile should preserve the source brightness variant and soft drop shadow")
	match3.game.tiles[0] = first_tile_before_variant_check
	match3._render_board()
	var visual_blocker_index := -1
	for index in match3.game.tiles.size():
		if not match3.game.tiles[index].is_empty() and match3.game.blocker_layers[index] == 0:
			visual_blocker_index = index
			break
	assert(visual_blocker_index >= 0, "Match-3 board has no free tile for blocker presentation checks")
	var saved_blocker_style: String = str(match3.level_data.blockerStyle)
	var saved_blocker_layers: int = match3.game.blocker_layers[visual_blocker_index]
	match3.level_data.blockerStyle = "solid"
	match3.game.blocker_layers[visual_blocker_index] = 2
	match3._render_board()
	var solid_blocker_cell: Control = match3.board.get_child(visual_blocker_index)
	var solid_stack: Control = solid_blocker_cell.get_node("TileStack")
	var solid_overlay: TextureRect = solid_blocker_cell.get_node("Blocker")
	assert(solid_stack.scale.is_equal_approx(Vector2(0.64, 0.64)) and is_equal_approx(solid_overlay.modulate.a, 0.84)
		and solid_overlay.material == null,
		"Solid bag blocker should shrink the retained tile stack and preserve the two-layer opacity")
	match3.game.blocker_layers[visual_blocker_index] = 1
	match3._render_board()
	var worn_solid_overlay: TextureRect = (match3.board.get_child(visual_blocker_index) as Control).get_node("Blocker")
	assert(is_equal_approx(worn_solid_overlay.modulate.a, 0.68), "One-layer solid blocker should use the worn source opacity")
	match3.level_data.blockerStyle = "locked"
	match3.game.blocker_layers[visual_blocker_index] = 2
	match3._render_board()
	var locked_blocker_cell: Control = match3.board.get_child(visual_blocker_index)
	var locked_stack: Control = locked_blocker_cell.get_node("TileStack")
	var locked_overlay: TextureRect = locked_blocker_cell.get_node("Blocker")
	assert(is_equal_approx(locked_stack.modulate.a, 0.84) and is_equal_approx(locked_overlay.modulate.a, 1.0)
		and locked_blocker_cell.has_node("LockedBlockerOutline"),
		"Locked blocker should retain readable tile art and its pale inset cell outline")
	match3.level_data.blockerStyle = "overlay"
	match3.game.blocker_layers[visual_blocker_index] = 1
	match3._render_board()
	var foam_blocker_cell: Control = match3.board.get_child(visual_blocker_index)
	var foam_stack: Control = foam_blocker_cell.get_node("TileStack")
	var foam_overlay: TextureRect = foam_blocker_cell.get_node("Blocker")
	var foam_material := foam_overlay.material as ShaderMaterial
	assert(foam_stack.scale.is_equal_approx(Vector2.ONE) and is_equal_approx(foam_overlay.modulate.a, 0.72)
		and foam_material != null and is_equal_approx(foam_material.get_shader_parameter("contrast"), 1.04)
		and is_equal_approx(foam_material.get_shader_parameter("saturation"), 0.9)
		and is_equal_approx((foam_material.get_shader_parameter("shadow_color") as Color).a, Color("#0713269e").a),
		"Foam overlay should preserve the readable tile and source contrast, saturation, opacity and shadow")
	match3.level_data.blockerStyle = saved_blocker_style
	match3.game.blocker_layers[visual_blocker_index] = saved_blocker_layers
	match3._render_board()
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
	var drag_source := -1
	for index in match3.game.tiles.size():
		if not match3.game.tiles[index].is_empty() and match3.game.blocker_layers[index] == 0 and match3._drag_neighbour(index, "right") >= 0:
			drag_source = index
			break
	assert(drag_source >= 0, "Match-3 screen has no movable source cell for drag preview")
	assert((match3.board.get_child(drag_source) as Control).clip_contents,
		"Production board cells should clip oversized tile art to their rounded cell bounds")
	match3._begin_tile_drag(drag_source, Vector2.ZERO)
	match3._update_tile_drag(Vector2(match3.drag_start_cell_size * 0.08, 0.0))
	assert(not (match3.board.get_child(drag_source) as Control).clip_contents,
		"Dragging should temporarily show the source tile outside its cell like the web drag-source state")
	var drag_source_stack: Control = match3.board.get_child(drag_source).get_node("TileStack")
	var drag_target_stack: Control = match3.board.get_child(match3._drag_neighbour(drag_source, "right")).get_node("TileStack")
	assert(match3.drag_target_index == match3._drag_neighbour(drag_source, "right"), "Drag preview did not react the adjacent cell at the source threshold")
	assert(drag_source_stack.offset_left > 0.0 and drag_target_stack.offset_left < 0.0, "Drag preview did not move the source and neighboring tile stacks")
	match3._clear_drag_preview()
	assert((match3.board.get_child(drag_source) as Control).clip_contents,
		"Ending a drag preview did not restore the production cell clipping")
	var distant_cell := -1
	var board_columns := int(match3.level_data.columns)
	for candidate in match3.game.tiles.size():
		if candidate == drag_source or match3.game.tiles[candidate].is_empty() or not match3.game._is_active(candidate): continue
		var row_distance := absi(candidate / board_columns - drag_source / board_columns)
		var column_distance := absi(candidate % board_columns - drag_source % board_columns)
		if row_distance + column_distance > 1:
			distant_cell = candidate
			break
	assert(distant_cell >= 0, "Match-3 board has no distant cell for non-adjacent input")
	match3.selected_index = drag_source
	match3._select_cell(distant_cell)
	await process_frame
	assert(match3.selected_index == distant_cell and match3.input_locked, "Non-adjacent tap should select the second cell while holding rejection feedback")
	await create_timer(0.15).timeout
	var selected_cell: Control = match3.board.get_child(distant_cell)
	assert(absf(selected_cell.scale.x - 0.9) < 0.01 and selected_cell.z_index == 5,
		"Selected cell should use the source 0.9 scale and raised stacking order")
	assert(absf(selected_cell.modulate.r - 1.18) < 0.01 and absf(selected_cell.modulate.g - 1.18) < 0.01
		and absf(selected_cell.modulate.b - 1.18) < 0.01,
		"Selected cell should brighten the whole cell neutrally like CSS brightness(1.18)")
	assert(match3.bark.text == MenuCopy.text("match3_bark_not_adjacent", "ru"), "Non-adjacent tap did not show the source bark")
	assert(match3.match_feedback_panel.visible, "Non-adjacent tap did not show the reject feedback pill")
	await create_timer(0.82).timeout
	assert(not match3.input_locked and not match3.match_feedback_panel.visible and match3.last_feedback.is_empty(), "Non-adjacent feedback did not clear after the source hold duration")
	match3.selected_index = -1
	match3._render_board()
	var rejection_target: int = match3._drag_neighbour(drag_source, "right")
	match3.last_feedback = "no-match"
	match3._play_move_frames({"valid": false, "reason": "no-match"}, drag_source, rejection_target)
	await create_timer(0.05).timeout
	var moving_rejected_stack: Control = match3.board.get_child(drag_source).get_node("TileStack")
	assert(absf(moving_rejected_stack.offset_left) > 1.0, "No-match swap did not move the stack outward")
	assert(not match3.match_feedback_panel.visible, "No-match reject feedback appeared before the outward swap finished")
	await create_timer(0.12).timeout
	assert(match3.match_feedback_panel.visible and match3.match_feedback_kind == "reject", "No-match feedback should appear after the outward swap animation")
	await create_timer(1.2).timeout
	assert(not match3.match_feedback_panel.visible and not match3.input_locked, "No-match reject feedback did not clear after the return and hold")
	match3._show_match_feedback("reject", 1, "no_match")
	assert(match3.match_feedback_panel.visible and is_equal_approx(match3.match_feedback_panel.scale.x, 0.86) and is_zero_approx(match3.match_feedback_panel.modulate.a), "Feedback entry should start from the source scale and opacity")
	assert(match3.match_feedback_panel.pivot_offset == match3.match_feedback_panel.size * 0.5, "Feedback pill should scale from its center")
	await create_timer(0.05).timeout
	assert(match3.match_feedback_panel.modulate.a > 0.0 and match3.match_feedback_panel.modulate.a < 1.0 and match3.match_feedback_panel.scale.x > 0.86, "Feedback entry did not follow the 100 ms CSS transition")
	await create_timer(0.06).timeout
	assert(is_equal_approx(match3.match_feedback_panel.scale.x, 1.0) and is_equal_approx(match3.match_feedback_panel.modulate.a, 1.0), "Feedback entry did not reach its source end state")
	match3._show_match_feedback("special")
	assert(is_equal_approx(match3.match_feedback_panel.scale.x, 1.0), "Changing a visible feedback message restarted the pill entrance")
	match3._clear_match_feedback()
	await create_timer(0.05).timeout
	assert(match3.match_feedback_panel.visible and match3.match_feedback_panel.modulate.a < 1.0, "Feedback exit should remain visible during its fade")
	await create_timer(0.06).timeout
	assert(not match3.match_feedback_panel.visible, "Feedback exit did not hide the pill after the 100 ms CSS transition")
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
	var ingredient_material := ingredient_icon.material as ShaderMaterial
	assert(ingredient_icon.anchor_right == 1.0 and ingredient_icon.anchor_bottom == 1.0 and ingredient_icon.offset_left == 2.0, "Production ingredient artwork did not preserve its 2px inset")
	assert(ingredient_material != null and is_equal_approx(ingredient_material.get_shader_parameter("glow_white_radius_px"), 7.0)
		and (ingredient_material.get_shader_parameter("glow_white") as Color).is_equal_approx(Color("#fff2a0"))
		and is_zero_approx((ingredient_material.get_shader_parameter("glow_gold") as Color).a)
		and is_zero_approx((ingredient_material.get_shader_parameter("glow_aqua") as Color).a),
		"Ingredient idle glow did not use the source yellow 7px drop shadow")
	await create_timer(0.71).timeout
	assert(ingredient_icon.offset_top < 2.0 and ingredient_icon.offset_bottom < -4.5
		and ingredient_icon.scale.is_equal_approx(Vector2.ONE)
		and float(ingredient_material.get_shader_parameter("glow_strength")) > 0.9,
		"Ingredient idle did not reach the source 2px lift and yellow drop shadow")
	await create_timer(0.72).timeout
	assert(absf(ingredient_icon.offset_top - 3.0) < 0.25 and absf(ingredient_icon.offset_bottom + 3.0) < 0.25
		and float(ingredient_material.get_shader_parameter("glow_strength")) < 0.05,
		"Ingredient idle did not return to its source resting position and no-glow state")
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
	var css_ease_curve := Callable(match3, "_css_cubic_bezier").bind(0.25, 0.1, 0.25, 1.0)
	assert(absf(float(css_ease_curve.call(0.5)) - 0.8024) < 0.01, "CSS ease curve did not sample to its source midpoint")
	match3._shake_rejected_cells([rejected_first, rejected_second])
	await create_timer(0.04).timeout
	assert(rejected_cell.position.x < rejected_home_x - 2.0,
		"Rejected swap should reach the source -5px shake keyframe first")
	await create_timer(0.06).timeout
	assert(rejected_cell.position.x > rejected_home_x + 2.0,
		"Rejected swap should cross toward the source +5px shake keyframe second")
	await create_timer(0.06).timeout
	assert(rejected_cell.position.x < rejected_home_x - 1.0,
		"Rejected swap should return through the source -3px shake keyframe third")
	await create_timer(0.055).timeout
	assert(absf(rejected_cell.position.x - rejected_home_x) < 1.0,
		"Rejected swap should finish the source 220ms shake at its home position")
	await create_timer(0.25).timeout
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
	var resting_source_z: int = (match3.board.get_child(special_index) as Control).z_index
	var resting_target_z: int = (match3.board.get_child(impact_target) as Control).z_index
	var saved_specials: Array[String] = match3.game.specials
	match3.game.specials = special_frame_specials.duplicate()
	match3._render_board()
	var resting_special: TextureRect = match3.board.get_child(special_index).get_node("TileStack/Special")
	var resting_direction: PanelContainer = match3.board.get_child(special_index).get_node("TileStack/SpecialDirectionMarker")
	var resting_special_material := resting_special.material as ShaderMaterial
	assert(is_equal_approx(resting_special.rotation_degrees, 0.0),
		"Directional special art should keep its authored CSS orientation")
	assert(is_equal_approx(resting_special_material.get_shader_parameter("glow_gold_radius_px"), 7.0)
		and is_equal_approx((resting_special_material.get_shader_parameter("glow_white") as Color).a, 0.0)
		and is_equal_approx((resting_special_material.get_shader_parameter("glow_aqua") as Color).a, 0.0),
		"Resting special artwork should keep only its source seven-pixel gold glow")
	assert(resting_direction.get_child(0).get_theme_font_size("font_size") == 13,
		"Directional special marker should preserve the source 13px glyph size")
	match3.game.specials = saved_specials
	match3._render_board()
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
	assert(special_cell.pivot_offset == special_cell.custom_minimum_size * 0.5, "Board cell scale effects should pivot around the center like CSS transforms")
	var source_outline: Panel = special_cell.get_node("SpecialImpactSourceOutline")
	assert(is_equal_approx(source_outline.modulate.a, 1.0) and special_cell.z_index == 6,
		"Activated special outline should remain visible above neighboring cells throughout its impact")
	assert(special_cell.get_node_or_null("SpecialImpactFlash") != null, "Special clear did not create its visual impact flash")
	assert(special_cell.get_node_or_null("SpecialImpactSourceOutline") != null, "Activated special did not receive its source outline")
	assert(special_cell.get_node_or_null("SpecialImpactBeam") != null, "Line special did not create its directional beam")
	var target_cell: Control = match3.board.get_child(impact_target)
	assert(target_cell.get_node_or_null("SpecialImpactTargetOutline") != null and target_cell.z_index == 3,
		"Affected clear target did not rise above the board with its target outline")
	assert(target_cell.get_node_or_null("SpecialImpactFlash") != null, "Affected clear target did not receive its impact flash")
	var target_flash := target_cell.get_node("SpecialImpactFlash") as ColorRect
	var target_flash_shader := (target_flash.material as ShaderMaterial).shader
	assert(target_flash_shader.code.contains("0.35") and target_flash_shader.code.contains("0.58")
		and target_flash_shader.code.contains("0.76") and target_flash_shader.code.contains("0.302")
		and target_flash_shader.code.contains("0.161"),
		"Special impact flash did not preserve the CSS radial gradient stops and opacity")
	var special_stack: Control = special_cell.get_node("TileStack")
	assert(special_stack.pivot_offset == special_cell.custom_minimum_size * 0.5, "Tile-stack scale effects should pivot around the source cell center")
	var special_icon: TextureRect = special_stack.get_node("Special")
	var special_shadow := special_icon.material as ShaderMaterial
	var direction_marker: PanelContainer = special_stack.get_node("SpecialDirectionMarker")
	assert(is_equal_approx(special_icon.rotation_degrees, -8.0), "Flash Row activation did not start from the source impact keyframe")
	assert(direction_marker.get_child(0).text == "↔" and special_shadow != null
		and is_equal_approx(special_shadow.get_shader_parameter("shadow_blur_px"), 0.0)
		and is_equal_approx((special_shadow.get_shader_parameter("shadow_color") as Color).a, 0.0)
		and is_equal_approx(special_shadow.get_shader_parameter("glow_strength"), 1.0)
		and (special_shadow.get_shader_parameter("glow_gold") as Color).to_html(false) == Color("#fff0a8").to_html(false)
		and is_equal_approx(special_shadow.get_shader_parameter("glow_white_radius_px"), 5.0)
		and is_equal_approx((special_shadow.get_shader_parameter("glow_white") as Color).a, 1.0)
		and is_equal_approx(special_shadow.get_shader_parameter("glow_gold_radius_px"), 10.0)
		and (special_shadow.get_shader_parameter("glow_aqua") as Color).to_html(false) == Color("#6ce2d3").to_html(false)
		and is_equal_approx(special_shadow.get_shader_parameter("glow_aqua_radius_px"), 14.0),
		"Flash Row activation should add the source white, gold and aqua glow radii")
	await create_timer(0.3).timeout
	assert(is_equal_approx(special_icon.rotation_degrees, 0.0), "Flash Row activation did not return to neutral rotation")
	assert(special_cell.z_index == resting_source_z and target_cell.z_index == resting_target_z,
		"Special impact did not restore the cells' original stacking order after 280ms")
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
	await create_timer(0.18).timeout
	assert(reshuffled_stack.scale.x > 1.0 and absf(reshuffled_stack.scale.x - 1.04) < 0.05, "Reshuffle animation missed the 65% CSS keyframe")
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
