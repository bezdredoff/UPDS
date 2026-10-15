extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")
const Match3Session = preload("res://scripts/match3_campaign_session.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")
const UiFonts = preload("res://scripts/ui_fonts.gd")


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
	var menu_title_font: Font = menu.get_node("Content/Title").get_theme_font("normal_font")
	if OS.has_feature("web"):
		assert((menu_title_font as FontVariation).base_font == UiFonts.GEORGIA_LATIN
			and (menu_title_font as FontVariation).fallbacks == [UiFonts.SERIF_CYRILLIC],
			"Web main menu title should preserve the Georgia serif style with Latin/Cyrillic bundled faces")
	else:
		assert((menu_title_font as SystemFont).font_names.has("Georgia"),
			"Native main menu title should request the source Georgia family")
	menu._open_campaign()
	await process_frame
	var campaign: Control = menu.match3_campaign_screen
	assert(campaign.cards.get_child_count() == 22, "Campaign hub did not render all authored levels")
	assert(not campaign.complete.visible, "Empty campaign-complete status should not reserve a row before the campaign is complete")
	assert(campaign.summary_panel.size.y >= 78.0 and campaign.summary_panel.size.y <= 82.0,
		"Campaign summary height diverged from the source card at the 430 px phone width: " + str(campaign.summary_panel.size.y))
	assert(campaign.campaign_scroll.vertical_scroll_mode == ScrollContainer.SCROLL_MODE_SHOW_NEVER,
		"Campaign list should hide the platform scrollbar while remaining scrollable")
	assert(is_equal_approx(campaign.cards.size.x, campaign.campaign_scroll.size.x),
		"Campaign cards should use the full source content width without scrollbar reservation")
	var campaign_detail: Label = campaign.cards.get_child(0).get_child(0).get_child(1)
	assert(campaign_detail.get_theme_constant("line_spacing") == -1,
		"Campaign descriptions should use the source 1.35 line rhythm to avoid taller Godot cards")
	assert(campaign.back_button.custom_minimum_size == Vector2(44, 44), "Campaign back action should match the source header size")
	assert(campaign.settings_button.custom_minimum_size == Vector2(44, 44), "Campaign settings action should match the source header size")
	var back_icon := campaign.back_button.get_child(0) as TextureRect
	assert(back_icon != null and back_icon.size == Vector2(21, 21) and back_icon.position == Vector2(11.5, 11.5),
		"Campaign header icons should be centered inside their 44 px controls")
	var locked_content := campaign.cards.get_child(1).get_child(0) as VBoxContainer
	var locked_play := locked_content.get_child(3) as Button
	assert(locked_play.disabled and not locked_content.get_child(1).visible,
		"Locked campaign cards should hide the empty story-action row")
	assert(locked_play.get_theme_stylebox("disabled") == locked_play.get_theme_stylebox("normal")
		and locked_play.get_theme_color("font_disabled_color") == Color("#29243d", 0.55),
		"Locked campaign actions should keep the source's readable disabled style and opacity")
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
	if OS.has_feature("web"):
		var title_web_font := match3.title.get_theme_font("font") as FontVariation
		assert(title_web_font != null and title_web_font.base_font == UiFonts.GEORGIA_LATIN
			and title_web_font.fallbacks == [UiFonts.SERIF_CYRILLIC]
			and title_web_font.variation_embolden == 0.2,
			"Web Match-3 title should match the source Georgia serif weight 800")
	else:
		var title_native_font := match3.title.get_theme_font("font") as SystemFont
		assert(title_native_font != null and title_native_font.font_names.has("Georgia")
			and title_native_font.font_weight == 800,
			"Native Match-3 title should match the source Georgia serif weight 800")
	var comic_normal: Font = UiFonts.match3(500)
	var comic_bold: Font = UiFonts.match3(800)
	var objective_font: Font = match3.objective_heading.get_theme_font("font")
	var objective_count_font: Font = match3.objective.get_theme_font("font")
	var moves_font: Font = match3.moves.get_theme_font("font")
	var hint_font: Font = match3.hint_label.get_theme_font("font")
	var speaker_font: Font = match3.bark_speaker.get_theme_font("font")
	var bark_font: Font = match3.bark.get_theme_font("font")
	if OS.has_feature("web"):
		var comic_web_normal := comic_normal as FontVariation
		var comic_web_bold := comic_bold as FontVariation
		assert(comic_web_normal != null and comic_web_normal.base_font == UiFonts.COMIC_LATIN
			and comic_web_normal.fallbacks == [UiFonts.COMIC_CYRILLIC]
			and comic_web_bold != null and comic_web_bold.base_font == UiFonts.COMIC_BOLD_LATIN
			and comic_web_bold.fallbacks == [UiFonts.COMIC_BOLD_CYRILLIC]
			and comic_web_bold.variation_embolden == 0.2,
			"Web exports must render the bundled Comic Relief Latin/Cyrillic faces because SystemFont is unsupported there")
		assert((objective_font as FontVariation).base_font == UiFonts.COMIC_BOLD_LATIN
			and (objective_count_font as FontVariation).base_font == UiFonts.COMIC_BOLD_LATIN
			and (moves_font as FontVariation).base_font == UiFonts.COMIC_BOLD_LATIN
			and (hint_font as FontVariation).variation_embolden == 0.4
			and (speaker_font as FontVariation).variation_embolden == 0.3
			and (bark_font as FontVariation).base_font == UiFonts.COMIC_LATIN,
			"Web Match-3 roles should keep the source display weights and regular dialogue face")
	else:
		var comic_system_normal := comic_normal as SystemFont
		var comic_system_bold := comic_bold as SystemFont
		assert(comic_system_normal != null and comic_system_normal.font_names == PackedStringArray(["Comic Sans MS", "Trebuchet MS"])
			and comic_system_bold != null and comic_system_bold.font_names == comic_system_normal.font_names
			and comic_system_normal.font_weight == 500 and comic_system_bold.font_weight == 800,
			"Native Match-3 font provider should preserve the source system font stack and weight")
		assert((objective_font as SystemFont).font_weight == 800
			and (objective_count_font as SystemFont).font_weight == 800
			and (moves_font as SystemFont).font_weight == 800
			and (hint_font as SystemFont).font_weight == 900
			and (speaker_font as SystemFont).font_weight == 850
			and (bark_font as SystemFont).font_weight == 500,
			"Native Match-3 HUD, bark and hint should preserve source weights")
	assert(objective_font != null and objective_count_font != null and moves_font != null,
		"Match-3 objective and move HUD should use the bold display font")
	assert(hint_font != null and speaker_font != null,
		"Match-3 hint and bark speaker should use the bold display font")
	assert(bark_font != null,
		"Match-3 narrative bark should use the regular display font")
	var tutorial_body_font := match3.tutorial_body.get_theme_font("font") as FontVariation
	var tutorial_button_font := match3.tutorial_button.get_theme_font("font") as FontVariation
	assert(tutorial_body_font != null and tutorial_body_font.variation_opentype.get("wght", 0.0) == 700.0
		and tutorial_button_font != null and tutorial_button_font.variation_opentype.get("wght", 0.0) == 950.0,
		"Match-3 tutorial copy and action should retain the source Inter sans stack")
	if not OS.has_feature("web"):
		var bundled_fallback := (comic_normal as SystemFont).fallbacks[0] as FontVariation
		assert(bundled_fallback != null and bundled_fallback.fallbacks.size() == 1,
			"Native Match-3 font stack should include its bundled Latin/Cyrillic fallback when source fonts are absent")
	var feedback_font: Font = match3.match_feedback_label.get_theme_font("font")
	if OS.has_feature("web"):
		assert((feedback_font as FontVariation).base_font == UiFonts.GEORGIA_LATIN
			and (feedback_font as FontVariation).fallbacks == [UiFonts.SERIF_CYRILLIC],
			"Web Match-3 feedback should use bundled Georgia-metric Latin and a Cyrillic serif fallback")
	else:
		assert((feedback_font as SystemFont).font_names.has("Georgia"),
			"Native Match-3 feedback should preserve the source Georgia serif treatment")
	var expected_page_background := str(bundle.assets.backgrounds.get(str(match3.level_data.pageBackground), ""))
	assert(str(bundle.levels[0].pageBackground) != str(bundle.levels[1].pageBackground)
		and not expected_page_background.is_empty()
		and match3.background.texture.resource_path == "res://" + expected_page_background.trim_prefix("./"),
		"Match-3 screen should load the authored page background for the selected level instead of reusing the M3_00 locker image")
	var match_background_material := match3.background.material as ShaderMaterial
	assert(match3.background_base.color.is_equal_approx(Color("#d9d0b6"))
		and is_equal_approx(match3.background.modulate.a, 0.96)
		and match_background_material != null
		and is_equal_approx(match_background_material.get_shader_parameter("brightness"), 0.94)
		and is_equal_approx(match_background_material.get_shader_parameter("saturation"), 0.90),
		"Match-3 background should preserve UI A's warm base, 96% image opacity and brightness/saturation treatment without the retired dark wash")
	assert(match3.get_node_or_null("ColorRect") == null,
		"Match-3 screen should not add the retired 55% navy background wash")
	await process_frame
	assert(match3.active_tutorial == "clear-package" and match3.tutorial_panel.visible, "Level-start blocker tutorial was not selected in authored order")
	assert(match3.tutorial_overlay.z_index > 20 and match3.tutorial_overlay.z_index < 30,
		"Tutorial overlay should cover elevated Match-3 tile art while staying beneath evidence and result overlays")
	assert(is_equal_approx(match3.board_top_spacer.custom_minimum_size.y,
		clampf((match3.size.y - 568.0) * 0.19, 0.0, 48.0)),
		"Match-3 HUD-to-playfield gap did not update for the active viewport height")
	assert(match3.tutorial_title.text == "Снимайте слои пакета", "Campaign tutorial copy did not use the localized concept")
	var tutorial_card_rect: Rect2 = match3.tutorial_frame.get_global_rect()
	var tutorial_button_rect: Rect2 = match3.tutorial_button.get_global_rect()
	assert(tutorial_card_rect.size.y >= 240.0 and tutorial_card_rect.size.y <= 300.0,
		"Tutorial overlay frame should size itself around its localized copy rather than collapse or fill the viewport")
	assert(tutorial_card_rect.encloses(tutorial_button_rect), "Tutorial action should remain inside the framed card")
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
	var moves_before_reaction: int = match3.game.moves_left
	var displayed_moves_before_reaction: String = match3.moves.text
	var displayed_objective_before_reaction: String = match3.objective.text
	var first_cell_before_reaction: int = match3.board.get_child(0).get_instance_id()
	match3._reduced_motion_override = false
	match3.game.moves_left = int(match3.level_data.moves) - 1
	match3._present_narrative_reaction({"valid": true, "blockersCleared": 0, "specialsCreated": 0, "cascades": 1,
		"primaryFeedback": "match", "specialsCombined": false, "won": false, "lost": false})
	assert(match3.active_reaction.get("id") == "ingredient-context"
		and match3.bark_speaker.text == "АЮКИ"
		and match3.bark.text == "Маленькая чёрная карта, огромный шанс на драму.",
		"Match-3 reaction should replace the static bark with authored localized copy and speaker")
	assert(match3.moves.text == displayed_moves_before_reaction
		and match3.objective.text == displayed_objective_before_reaction
		and match3.board.get_child(0).get_instance_id() == first_cell_before_reaction,
		"Presenting a reaction during a move must not reveal final counters or redraw the board before move frames finish")
	assert(match3.bark_portrait.texture != null
		and match3.bark_portrait.texture.resource_path.ends_with("ayuki/medallions/portrait_neutral_256.png"),
		"Reaction bark should use the same authored circular portrait as the web UI")
	var portrait_frame_style := match3.bark_portrait_frame.get_theme_stylebox("panel") as StyleBoxFlat
	var portrait_mask := (match3.bark_portrait.material as ShaderMaterial).shader.code
	assert(match3.bark_portrait_frame.custom_minimum_size == Vector2(42, 42)
		and portrait_frame_style.get_border_width(SIDE_LEFT) == 2
		and portrait_frame_style.corner_radius_top_left == 999
		and portrait_frame_style.shadow_color.is_equal_approx(Color("#326349"))
		and portrait_mask.contains("smoothstep"),
		"Match-3 speaker portrait should keep its circular crop, paper border and green ring")
	assert(is_zero_approx(match3.bark_panel.modulate.a) and is_equal_approx(match3.bark_panel.position.y, 4.0),
		"Reaction bark should begin at the source 4px entrance offset and zero opacity")
	await create_timer(0.2).timeout
	assert(is_equal_approx(match3.bark_panel.modulate.a, 1.0) and is_zero_approx(match3.bark_panel.position.y),
		"Reaction bark should finish its 160ms ease-out entrance")
	var reaction_style := match3.bark_panel.get_theme_stylebox("panel") as StyleBoxFlat
	assert(reaction_style.border_width_left == 3 and reaction_style.border_width_top == 3
		and reaction_style.corner_radius_top_left == 8 and reaction_style.shadow_size == 14,
		"Standard reaction emphasis should preserve the web bark border and shadow")
	match3._dismiss_narrative_reaction("ingredient-context")
	await create_timer(0.22).timeout
	assert(match3.active_reaction.is_empty() and is_equal_approx(match3.bark_panel.modulate.a, 1.0)
		and is_zero_approx(match3.bark_panel.position.y),
		"Reaction bark should fade out and restore the static bark after its duration")
	match3.game.moves_left = moves_before_reaction
	match3._reduced_motion_override = null
	match3._refresh()
	var board_outline := match3.board_frame.get_parent() as PanelContainer
	var board_outline_style := board_outline.get_theme_stylebox("panel") as StyleBoxFlat
	var board_frame_style := match3.board_frame.get_theme_stylebox("panel") as StyleBoxFlat
	var board_inner_border := board_outline.get_node("BoardInnerBorder") as Panel
	var board_inner_border_style := board_inner_border.get_theme_stylebox("panel") as StyleBoxFlat
	assert(board_outline.name == "BoardNavyOutline" and is_zero_approx(board_outline_style.bg_color.a)
		and board_outline_style.content_margin_left == 0 and board_outline_style.shadow_size == 0,
		"UI A board should not keep the retired navy-and-gold outer ring")
	assert(board_frame_style.border_width_left == 3 and board_frame_style.border_width_top == 3
		and board_frame_style.corner_radius_top_left == 8 and board_frame_style.content_margin_left == 0
		and board_frame_style.bg_color.is_equal_approx(Color("#0713289e"))
		and match3.board_frame.material == null, "UI A board should use its flat navy surface and 3px paper edge")
	assert(board_inner_border.name == "BoardInnerBorder" and not board_inner_border.visible
		and board_inner_border_style.border_width_left == 0,
		"UI A board should not draw the retired inner gold line")
	assert(match3.board.get_theme_constant("h_separation") == 1
		and match3.board.get_theme_constant("v_separation") == 1,
		"UI A board should preserve its one-pixel cell gaps")
	assert(absf(match3.board_frame.size.x / match3.board_frame.size.y - float(match3.board.columns) / float(match3.game.level_data.rows)) < 0.01,
		"UI A board should preserve its authored columns-to-rows aspect ratio")
	assert(is_equal_approx(match3._board_hud_spacing(), 48.0),
		"Match-3 board should keep the calibrated 48px maximum HUD spacer on standard-height screens")
	var rendered_cell_index := -1
	for index in match3.game.tiles.size():
		if not match3.game.tiles[index].is_empty():
			rendered_cell_index = index
			break
	assert(rendered_cell_index >= 0, "Match-3 board has no rendered cell for presentation checks")
	var cell_background := match3.board.get_child(rendered_cell_index).get_node("CellBackground") as Panel
	var cell_background_style := cell_background.get_theme_stylebox("panel") as StyleBoxFlat
	assert(cell_background.offset_left == 1 and cell_background.offset_right == -1
		and cell_background.material == null and cell_background_style.bg_color.is_equal_approx(Color("#5a859926")),
		"Match-3 cells should use the source translucent blue-gray fill without a retired gradient shader")
	var cell_socket := match3.board.get_child(rendered_cell_index).get_node("CellSocket") as Panel
	var socket_style := cell_socket.get_theme_stylebox("panel") as StyleBoxFlat
	assert(cell_socket.offset_left == 1 and cell_socket.offset_top == 1
		and cell_socket.offset_right == -1 and cell_socket.offset_bottom == -1
		and is_zero_approx(socket_style.bg_color.a) and socket_style.get_border_width(SIDE_LEFT) == 0
		and cell_socket.material == null,
		"UI A tile socket should use its one-pixel inset and transparent fill")
	var normal_tile_index := 0
	match3.game.tiles[normal_tile_index] = "pantiesSportWhite"
	match3.game.blocker_layers[normal_tile_index] = 0
	match3._render_board()
	var normal_tile := match3.board.get_child(normal_tile_index).get_node("TileStack/Tile") as TextureRect
	var normal_tile_material := normal_tile.material as ShaderMaterial
	assert(normal_tile.offset_left == 2 and normal_tile.offset_top == 2
		and normal_tile.offset_right == -2 and normal_tile.offset_bottom == -2
		and normal_tile.scale.is_equal_approx(Vector2(1.08, 1.08))
		and normal_tile.z_index == 1
		and normal_tile_material != null
		and (normal_tile_material.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0, 2))
		and is_equal_approx(normal_tile_material.get_shader_parameter("saturation"), 1.05),
		"UI A tile artwork should preserve the source 2px inset, 1.08 scale, drop shadow and saturation")
	var first_tile_before_variant_check: String = match3.game.tiles[normal_tile_index]
	match3.game.tiles[normal_tile_index] = "camisole"
	match3._render_board()
	var camisole_tile := match3.board.get_child(normal_tile_index).get_node("TileStack/Tile") as TextureRect
	var camisole_shadow := camisole_tile.material as ShaderMaterial
	assert(camisole_shadow != null and is_equal_approx(camisole_shadow.get_shader_parameter("brightness"), 1.38)
		and is_equal_approx(camisole_shadow.get_shader_parameter("shadow_blur_px"), 1.0)
		and is_equal_approx(camisole_shadow.get_shader_parameter("saturation"), 1.0),
		"Camisole tile should preserve the source brightness variant and soft drop shadow")
	match3.game.tiles[normal_tile_index] = first_tile_before_variant_check
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
	assert(solid_stack.scale.is_equal_approx(Vector2(0.64, 0.64)) and solid_overlay.z_index == 4
		and is_equal_approx(solid_overlay.modulate.a, 0.84)
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
	assert(tutorial_style.content_margin_left == 26 and tutorial_style.content_margin_right == 26
		and match3.tutorial_body.get_theme_constant("line_spacing") == 0,
		"Tutorial text and button insets should preserve the source compact card rhythm")
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
		"UI A board cells should clip oversized tile art to their cell bounds")
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
	await create_timer(0.66).timeout
	assert(match3.input_locked, "No-match hold should continue after the 150ms return while the shake has already finished")
	await create_timer(0.2).timeout
	assert(not match3.input_locked, "No-match rejection should unlock after the source 700ms hold, without an extra shake wait")
	await create_timer(0.11).timeout
	assert(not match3.match_feedback_panel.visible, "No-match reject feedback did not finish its source fade after the return and hold")
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
	assert(hinted_style.border_color.to_html(false) == Color("#7ddfd8").to_html(false)
		and hinted_style.shadow_color.to_html(false) == Color("#7ddfd8").to_html(false)
		and hinted_style.shadow_size == 15,
		"Hinted cell should use the source turquoise outline and 15px glow")
	var hint_ring := hinted_cell.get_node_or_null("HintInnerRing") as Panel
	var hint_ring_style := hint_ring.get_theme_stylebox("panel") as StyleBoxFlat if hint_ring != null else null
	assert(hint_ring != null and hint_ring_style != null
		and hint_ring_style.border_color.to_html(false) == Color("#fff8d7").to_html(false)
		and hint_ring_style.get_border_width(SIDE_LEFT) == 2,
		"Hinted cell should preserve the source inner ivory glow ring")
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
	assert(ingredient_icon.anchor_right == 1.0 and ingredient_icon.anchor_bottom == 1.0
		and ingredient_icon.offset_left == 2.0 and ingredient_icon.z_index == 3,
		"Production ingredient artwork did not preserve its 2px inset and source z-layer")
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
	var preserved_cell_index: int = (settle_index + 1) % match3.game.tiles.size()
	var preserved_cell_id: int = match3.board.get_child(preserved_cell_index).get_instance_id()
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
	assert(match3.board.get_child(preserved_cell_index).get_instance_id() == preserved_cell_id,
		"A Match-3 frame rebuilt an unchanged cell and restarted its idle animation")
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
	match3._reduced_motion_override = true
	match3.selected_index = rejected_first
	match3.hinted_indices.clear()
	match3.hinted_indices.append(rejected_second)
	match3._render_board()
	var reduced_selected: Control = match3.board.get_child(rejected_first)
	var reduced_hinted: Control = match3.board.get_child(rejected_second)
	assert(is_equal_approx(reduced_selected.scale.x, 0.9) and is_equal_approx(reduced_selected.modulate.r, 1.18),
		"Reduced motion should apply selected-cell styling immediately without easing")
	await create_timer(0.2).timeout
	assert(reduced_hinted.scale.is_equal_approx(Vector2.ONE) and reduced_hinted.modulate.is_equal_approx(Color.WHITE),
		"Reduced motion should leave the hint highlight static instead of looping its pulse")
	match3.selected_index = -1
	match3.hinted_indices.clear()
	match3._render_board()
	await process_frame
	var reduced_source_home: Vector2 = (match3.board.get_child(rejected_first) as Control).position
	var reduced_target_home: Vector2 = (match3.board.get_child(rejected_second) as Control).position
	match3._play_move_frames({"valid": false, "reason": "no-match"}, rejected_first, rejected_second)
	await process_frame
	var reduced_source_stack: Control = match3.board.get_child(rejected_first).get_node("TileStack")
	var reduced_target_stack: Control = match3.board.get_child(rejected_second).get_node("TileStack")
	assert(match3.input_locked, "Reduced-motion rejection should preserve the source 700ms input hold")
	assert(match3.match_feedback_panel.visible and is_equal_approx(match3.match_feedback_panel.scale.x, 1.0)
		and is_equal_approx(match3.match_feedback_panel.modulate.a, 1.0),
		"Reduced-motion rejection feedback should appear immediately without its scale or fade transition")
	assert(is_zero_approx(reduced_source_stack.offset_left) and is_zero_approx(reduced_target_stack.offset_left),
		"Reduced motion should skip rejected-swap stack travel")
	assert((match3.board.get_child(rejected_first) as Control).position == reduced_source_home
		and (match3.board.get_child(rejected_second) as Control).position == reduced_target_home,
		"Reduced motion should skip rejected-swap cell shake: %s/%s != %s/%s" % [
			(match3.board.get_child(rejected_first) as Control).position,
			(match3.board.get_child(rejected_second) as Control).position,
			reduced_source_home, reduced_target_home,
		])
	await create_timer(0.72).timeout
	assert(not match3.input_locked and not match3.match_feedback_panel.visible,
		"Reduced-motion rejection should keep the source hold, then clear feedback without a fade")
	match3._reduced_motion_override = null
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
	assert(resting_special.z_index == 2 and resting_direction.z_index == 3
		and is_equal_approx(resting_special_material.get_shader_parameter("shadow_blur_px"), 2.0)
		and (resting_special_material.get_shader_parameter("shadow_color") as Color).to_html(false) == Color("#181426b8").to_html(false)
		and (resting_special_material.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0, 1))
		and is_zero_approx(resting_special_material.get_shader_parameter("glow_strength")),
		"Resting specials should match the source dark 1px/2px shadow and z-layer")
	assert(resting_direction.get_child(0).get_theme_font_size("font_size") == 13,
		"Directional special marker should preserve the source 13px glyph size")
	match3.game.specials = saved_specials
	var oversized_specials: Array[String] = saved_specials.duplicate()
	oversized_specials[special_index] = "insight"
	match3.game.specials = oversized_specials
	match3._render_board()
	var oversized_special: TextureRect = match3.board.get_child(special_index).get_node("TileStack/Special")
	var bleed: float = match3._board_cell_size() * 0.14
	assert(is_equal_approx(oversized_special.offset_left, -bleed)
		and is_equal_approx(oversized_special.offset_top, -bleed)
		and is_equal_approx(oversized_special.offset_right, bleed)
		and is_equal_approx(oversized_special.offset_bottom, bleed),
		"Insight and lead silhouettes should extend by 14% of the responsive cell size, matching CSS")
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
		and is_equal_approx(special_shadow.get_shader_parameter("shadow_blur_px"), 2.0)
		and (special_shadow.get_shader_parameter("shadow_color") as Color).to_html(false) == Color("#181426b8").to_html(false)
		and (special_shadow.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0, 1))
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
	for level in bundle.levels:
		campaign.session.complete_level(str(level.id), 0)
	campaign.refresh_screen()
	assert(campaign.complete.visible and not campaign.complete.text.is_empty(),
		"Full-campaign completion status should appear when all levels are complete")
	campaign.back_button.pressed.emit()
	await process_frame
	assert(menu.match3_campaign_screen == null and menu.get_node("Content").visible, "Campaign back did not restore the main menu")
	menu.queue_free()
	await process_frame
	print("UPDS Godot Match-3 campaign screen smoke test passed (sequential unlock and level routing).")
	quit()
