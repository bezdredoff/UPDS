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
			and _has_weighted_cyrillic_serif(menu_title_font, 800),
			"Web main menu title should preserve the Georgia serif style and weight in both Latin and Cyrillic")
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
			and _has_weighted_cyrillic_serif(title_web_font, 800)
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
			and (moves_font as FontVariation).fallbacks == [UiFonts.COMIC_BOLD_CYRILLIC]
			and (moves_font as FontVariation).variation_embolden == 0.2
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
			and (moves_font as SystemFont).font_names == PackedStringArray(["Comic Sans MS", "Trebuchet MS"])
			and (moves_font as SystemFont).font_weight == 800
			and (hint_font as SystemFont).font_weight == 900
			and (speaker_font as SystemFont).font_weight == 850
			and (bark_font as SystemFont).font_weight == 500,
			"Native Match-3 HUD, bark and hint should preserve source weights")
	var expected_moves_font_size := 13 if match3.get_viewport_rect().size.x <= 430.0 else 14
	assert(objective_font != null and objective_count_font != null and moves_font != null
		and match3.moves.get_theme_font_size("font_size") == expected_moves_font_size
		and match3.moves.get_theme_color("font_color") == Color("#214936"),
		"Match-3 move counter should match the source Comic Sans stack, responsive size and dark green color")
	assert(match3._move_counter_font_size_for_width(320.0) == 13
		and match3._move_counter_font_size_for_width(430.0) == 13
		and match3._move_counter_font_size_for_width(431.0) == 14
		and match3._move_counter_font_size_for_width(480.0) == 14,
		"Move counter responsive font size should follow the source 430px viewport breakpoint")
	assert(match3.objective_heading.text == "ЦЕЛЬ" and match3.moves_heading.text == "ХОДЫ"
		and match3.hint_label.text == "ПОДСКАЗКА",
		"Match-3 Russian HUD labels should preserve the source wording and uppercase presentation")
	var mobile_hud_profile: Dictionary = match3._match3_hud_profile_for_width(390.0)
	var desktop_hud_profile: Dictionary = match3._match3_hud_profile_for_width(480.0)
	assert(mobile_hud_profile == {"goal_width": 224, "moves_width": 70, "hud_height": 50,
		"goal_icon_size": 22, "heading_size": 9, "count_size": 13}
		and desktop_hud_profile == {"goal_width": 234, "moves_width": 72, "hud_height": 52,
		"goal_icon_size": 24, "heading_size": 10, "count_size": 14},
		"Match-3 HUD width and typography profiles should follow the source 430px breakpoint")
	var viewport_width := match3.get_viewport_rect().size.x
	var active_hud_profile: Dictionary = match3._match3_hud_profile_for_width(viewport_width)
	assert(is_equal_approx(match3.objective_panel.size.x, active_hud_profile.goal_width)
		and is_equal_approx(match3.stage_panel.size.x, active_hud_profile.moves_width)
		and is_equal_approx(match3.objective_panel.size.y, active_hud_profile.hud_height)
		and is_equal_approx(match3.stage_panel.size.y, active_hud_profile.hud_height)
		and is_equal_approx(match3.objective_icon.custom_minimum_size.x, active_hud_profile.goal_icon_size),
		"Live Match-3 HUD geometry should use the active source viewport profile")
	var objective_card_style := match3.objective_panel.get_theme_stylebox("panel") as StyleBoxFlat
	var moves_card_style := match3.stage_panel.get_theme_stylebox("panel") as StyleBoxFlat
	var objective_gradient := match3.objective_panel.get_node("HudPaperGradient") as TextureRect
	var hud_gradient_texture := objective_gradient.texture as GradientTexture2D
	assert(objective_card_style.bg_color == Color(0, 0, 0, 0)
		and objective_card_style.border_color == Color("#f7ebc8")
		and objective_card_style.get_border_width(SIDE_LEFT) == 3
		and objective_card_style.get_corner_radius(CORNER_TOP_LEFT) == 8
		and objective_card_style.shadow_size == 0
		and objective_card_style.content_margin_left == 6
		and objective_card_style.content_margin_top == 3
		and moves_card_style.bg_color == objective_card_style.bg_color
		and hud_gradient_texture != null
		and hud_gradient_texture.gradient.colors == PackedColorArray([Color("#fff7df"), Color("#f7ebc8")])
		and hud_gradient_texture.fill_from == Vector2.ZERO
		and hud_gradient_texture.fill_to == Vector2(0.0, 1.0),
		"Match-3 HUD cards should preserve the source vertical paper gradient, paper border, 8px radius, compact inset and no shadow")
	assert(hint_font != null and speaker_font != null,
		"Match-3 hint and bark speaker should use the bold display font")
	assert(bark_font != null,
		"Match-3 narrative bark should use the regular display font")
	var tutorial_body_font := match3.tutorial_body.get_theme_font("font") as FontVariation
	var tutorial_button_font := match3.tutorial_button.get_theme_font("font") as FontVariation
	assert(tutorial_body_font != null and tutorial_body_font.variation_opentype.get("weight", 0.0) == 700.0
		and tutorial_button_font != null and tutorial_button_font.variation_opentype.get("weight", 0.0) == 950.0,
		"Match-3 tutorial copy and action should retain the source Inter sans stack")
	if not OS.has_feature("web"):
		var bundled_fallback := (comic_normal as SystemFont).fallbacks[0] as FontVariation
		assert(bundled_fallback != null and bundled_fallback.fallbacks.size() == 1,
			"Native Match-3 font stack should include its bundled Latin/Cyrillic fallback when source fonts are absent")
	var feedback_font: Font = match3.match_feedback_label.get_theme_font("font")
	if OS.has_feature("web"):
		assert((feedback_font as FontVariation).base_font == UiFonts.GEORGIA_LATIN
			and _has_weighted_cyrillic_serif(feedback_font, 800),
			"Web Match-3 feedback should use Georgia-metric serif weights for Latin and Cyrillic")
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
	var tutorial_shade := match3.tutorial_overlay.find_child("TutorialShade", true, false) as ColorRect
	var tutorial_backdrop := tutorial_shade.material as ShaderMaterial
	assert(tutorial_backdrop != null
		and tutorial_backdrop.shader.code.contains("hint_screen_texture")
		and tutorial_backdrop.shader.code.contains("SCREEN_PIXEL_SIZE * blur_radius_px")
		and tutorial_backdrop.shader.code.contains("SCREEN_UV).rgb * 0.25")
		and tutorial_backdrop.shader.code.contains("SCREEN_UV + vec2(blur.x, 0.0)).rgb * 0.125")
		and is_equal_approx(tutorial_backdrop.get_shader_parameter("blur_radius_px"), 1.0)
		and (tutorial_backdrop.get_shader_parameter("tint") as Color).is_equal_approx(Color("#0714279e")),
		"Tutorial backdrop should apply the source's 1px blur and exact navy tint")
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
	match3._dismiss_tutorial()
	var initial_bark: String = match3.bark.text
	var initial_speaker: String = match3.bark_speaker.text
	match3._reduced_motion_override = false
	match3.game.moves_left = int(match3.level_data.moves) - 1
	match3._present_narrative_reaction({"valid": true, "blockersCleared": 0, "specialsCreated": 0, "cascades": 1,
		"primaryFeedback": "match", "specialsCombined": false, "won": false, "lost": false})
	assert(match3.active_reaction.get("pending", false)
		and match3.bark.text == initial_bark and match3.bark_speaker.text == initial_speaker,
		"Match-3 should reserve narrative feedback while keeping the current bark visible through board animation")
	match3._present_pending_narrative_reaction("ingredient-context")
	assert(match3.active_reaction.get("id") == "ingredient-context"
		and match3.bark_speaker.text == "АЮКИ"
		and match3.bark.text == "Маленькая чёрная карта, огромный шанс на драму.",
		"Match-3 should present the queued narrative bark after the board animation completes")
	match3._dismiss_narrative_reaction("ingredient-context")
	await create_timer(0.22).timeout
	var moves_before_reaction: int = match3.game.moves_left
	var displayed_moves_before_reaction: String = match3.moves.text
	var displayed_objective_before_reaction: String = match3.objective.text
	var first_cell_before_reaction: int = match3.board.get_child(0).get_instance_id()
	match3._reduced_motion_override = false
	match3.game.moves_left = int(match3.level_data.moves) - 1
	match3.active_reaction.clear()
	match3.triggered_reactions.erase("ingredient-context")
	match3._present_narrative_reaction({"valid": true, "blockersCleared": 0, "specialsCreated": 0, "cascades": 1,
		"primaryFeedback": "match", "specialsCombined": false, "won": false, "lost": false})
	assert(match3.active_reaction.get("pending", false)
		and match3.bark.text == initial_bark and match3.bark_speaker.text == initial_speaker,
		"Match-3 reaction should remain pending instead of replacing the bark before playback")
	assert(match3.moves.text == displayed_moves_before_reaction
		and match3.objective.text == displayed_objective_before_reaction
		and match3.board.get_child(0).get_instance_id() == first_cell_before_reaction,
		"Presenting a reaction during a move must not reveal final counters or redraw the board before move frames finish")
	match3._present_pending_narrative_reaction("ingredient-context")
	assert(match3.active_reaction.get("id") == "ingredient-context"
		and match3.bark_speaker.text == "АЮКИ"
		and match3.bark.text == "Маленькая чёрная карта, огромный шанс на драму."
		and match3.bark_portrait.texture != null
		and match3.bark_portrait.texture.resource_path.ends_with("ayuki/medallions/portrait_neutral_256.png"),
		"Reaction bark should use the same authored circular portrait as the web UI")
	match3._fit_bark_layout(390.0)
	var portrait_frame_style := match3.bark_portrait_frame.get_theme_stylebox("panel") as StyleBoxFlat
	var portrait_mask := (match3.bark_portrait.material as ShaderMaterial).shader.code
	assert(match3.bark_portrait_frame.custom_minimum_size == Vector2(42, 42)
		and match3.bark_portrait_column.custom_minimum_size == Vector2(44, 42)
		and portrait_frame_style.get_border_width(SIDE_LEFT) == 2
		and portrait_frame_style.corner_radius_top_left == 999
		and portrait_frame_style.shadow_color.is_equal_approx(Color("#326349"))
		and portrait_mask.contains("smoothstep"),
		"Match-3 speaker portrait should keep its circular crop, paper border and green ring")
	assert(is_zero_approx(match3.bark_panel.modulate.a) and is_equal_approx(match3.bark_panel.position.y, 5.0),
		"Reaction bark should begin 4px below its calibrated static tray position and at zero opacity")
	await create_timer(0.2).timeout
	assert(is_equal_approx(match3.bark_panel.modulate.a, 1.0) and is_equal_approx(match3.bark_panel.position.y, 1.0),
		"Reaction bark should finish its 160ms ease-out entrance")
	var reaction_style := match3.bark_panel.get_theme_stylebox("panel") as StyleBoxFlat
	assert(reaction_style.border_width_left == 3 and reaction_style.border_width_top == 3
		and reaction_style.border_color == Color("#f7ebc8")
		and reaction_style.corner_radius_top_left == 8 and reaction_style.shadow_size == 0,
		"Narrative reactions should keep the source dialogue tray's paper outline without a second bark spine")
	var bark_base: StyleBoxFlat = match3.bark_base_style
	assert(bark_base.bg_color == Color(0, 0, 0, 0)
		and bark_base.border_color == Color("#f7ebc8")
		and bark_base.border_width_left == 3
		and bark_base.border_width_top == 3
		and bark_base.corner_radius_top_left == 8
		and bark_base.shadow_size == 0
		and bark_base.content_margin_left == 7 and bark_base.content_margin_right == 9
		and bark_base.content_margin_top == 4 and bark_base.content_margin_bottom == 4,
		"Match-3 dialogue tray should match the source paper frame and content padding")
	var bark_gradient := match3.bark_panel.get_node("HudPaperGradient") as TextureRect
	assert(bark_gradient != null and (bark_gradient.texture as GradientTexture2D).gradient.colors
		== PackedColorArray([Color("#fff7df"), Color("#f7ebc8")]),
		"Match-3 dialogue tray should use the source vertical paper gradient")
	match3._fit_bark_layout(390.0)
	assert(match3.bark_slot.custom_minimum_size.y == 60.0
		and match3.bark_panel.custom_minimum_size.y == 60.0
		and match3.bark_portrait_column.custom_minimum_size == Vector2(44, 42)
		and match3.hint_button.custom_minimum_size == Vector2(96, 44)
		and match3.hint_button.custom_maximum_size == Vector2(96, 44)
		and match3.hint_button.size_flags_vertical == Control.SIZE_SHRINK_CENTER
		and match3.hint_icon.custom_minimum_size == Vector2(21, 21)
		and match3.hint_icon.size_flags_vertical == Control.SIZE_SHRINK_CENTER
		and match3.bark.get_theme_font_size("font_size") == 9,
		"Compact dialogue tray should match the source portrait, hint and copy dimensions")
	match3.bark.text = "Сначала категории. Потом выводы."
	await process_frame
	assert(match3.bark.get_line_count() == 1,
		"The source M3_00 bark should remain on one line at the 390px phone width")
	match3._fit_bark_layout(480.0)
	assert(match3.bark_slot.custom_minimum_size.y == 62.0
		and match3.bark_portrait_column.custom_minimum_size == Vector2(46, 44)
		and match3.hint_button.custom_minimum_size == Vector2(100, 44)
		and match3.hint_button.custom_maximum_size == Vector2(100, 44)
		and match3.bark.get_theme_font_size("font_size") == 10,
		"Wide dialogue tray should match the source portrait, hint and copy dimensions")
	match3._fit_bark_layout(390.0)
	match3._refresh()
	match3.game.moves_left = moves_before_reaction
	match3._refresh()
	var disabled_hint_style := match3.hint_button.get_theme_stylebox("disabled") as StyleBoxFlat
	var normal_hint_style := match3.hint_button.get_theme_stylebox("normal") as StyleBoxFlat
	assert(disabled_hint_style != null and normal_hint_style != null
		and disabled_hint_style.bg_color == Color.TRANSPARENT
		and disabled_hint_style.get_border_width(SIDE_LEFT) == 0
		and normal_hint_style.bg_color == Color.TRANSPARENT
		and normal_hint_style.get_border_width(SIDE_LEFT) == 0,
		"Disabled Match-3 hint should stay transparent like the source icon-and-label action")
	match3._dismiss_narrative_reaction("ingredient-context")
	await create_timer(0.22).timeout
	assert(match3.active_reaction.is_empty() and is_equal_approx(match3.bark_panel.modulate.a, 1.0)
		and is_equal_approx(match3.bark_panel.position.y, 1.0)
		and is_equal_approx(match3.bark_panel.size.x, match3.bark_slot.size.x),
		"Reaction bark should restore the static tray position and stay within the responsive slot")
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
	var wide_board_geometry: Dictionary = match3.source_board_geometry(Vector2(474, 844), Vector2(430, 844), 7, 9)
	assert(is_equal_approx(wide_board_geometry.playfield_top, 213.0)
		and is_equal_approx(wide_board_geometry.playfield_height, 514.5)
		and absf(wide_board_geometry.board_size.x - 400.16) < 0.1
		and absf(wide_board_geometry.board_top - 161.28) < 0.1,
		"Godot board geometry should match the source 474x844 flex-playfield capture")
	var narrow_board_geometry: Dictionary = match3.source_board_geometry(Vector2(390, 844), Vector2(390, 844), 7, 9)
	assert(is_equal_approx(narrow_board_geometry.playfield_top, 211.0)
		and absf(narrow_board_geometry.board_size.x - 366.0) < 0.1
		and absf(narrow_board_geometry.board_top - 211.1) < 0.1,
		"Godot board geometry should match the source 390x844 responsive capture")
	var compact_board_geometry: Dictionary = match3.source_board_geometry(Vector2(320, 568), Vector2(320, 568), 7, 9)
	assert(is_equal_approx(compact_board_geometry.playfield_top, 199.0)
		and absf(compact_board_geometry.board_size.x - 197.94) < 0.1
		and absf(compact_board_geometry.board_top - 170.39) < 0.1,
		"Godot board geometry should match the source 320x568 compact capture")
	var board_geometry_cases := [
		{"viewport": Vector2(390, 844), "frame": Vector2(390, 844), "width": 366.0, "top": 211.1},
		{"viewport": Vector2(480, 854), "frame": Vector2(430, 854), "width": 406.0, "top": 163.09},
		{"viewport": Vector2(474, 760), "frame": Vector2(430, 760), "width": 341.05, "top": 160.03},
		{"viewport": Vector2(320, 568), "frame": Vector2(320, 568), "width": 197.94, "top": 170.39},
	]
	for geometry_case in board_geometry_cases:
		var viewport: Vector2 = geometry_case.viewport
		var frame: Vector2 = geometry_case.frame
		var geometry: Dictionary = match3.source_board_geometry(viewport, frame, 7, 9)
		assert(absf(geometry.board_size.x - float(geometry_case.width)) < 0.1
			and absf(geometry.board_top - float(geometry_case.top)) < 0.1,
			"Godot board bounds diverged from the source CSS capture at %s: %s" % [viewport, geometry])
	var live_board_geometry: Dictionary = match3._source_board_geometry()
	var expected_board_origin: float = float(live_board_geometry.board_top) - (match3.board_center.get_global_position().y
		- match3.get_global_position().y) - (match3.board_center.size.y - live_board_geometry.board_size.y) * 0.5
	assert(absf(match3.board_positioner.get_node("BoardNavyOutline").position.y - expected_board_origin) < 0.1,
		"Godot board should use the source flex anchor and one-row upward visual offset")
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
		and normal_tile.scale.is_equal_approx(Vector2(1.04, 1.04))
		and normal_tile.z_index == 1
		and normal_tile_material != null
		and (normal_tile_material.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0, 2))
		and is_equal_approx(normal_tile_material.get_shader_parameter("saturation"), 1.05),
		"UI A tile artwork should preserve the source 2px inset, 1.04 scale, drop shadow and saturation")
	var first_tile_before_variant_check: String = match3.game.tiles[normal_tile_index]
	match3.game.tiles[normal_tile_index] = "camisole"
	match3._render_board()
	var camisole_tile := match3.board.get_child(normal_tile_index).get_node("TileStack/Tile") as TextureRect
	var camisole_shadow := camisole_tile.material as ShaderMaterial
	assert(camisole_shadow != null and is_equal_approx(camisole_shadow.get_shader_parameter("brightness"), 1.0)
		and is_equal_approx(camisole_shadow.get_shader_parameter("shadow_blur_px"), 1.0)
		and is_equal_approx(camisole_shadow.get_shader_parameter("saturation"), 1.05)
		and (camisole_shadow.get_shader_parameter("shadow_color") as Color).is_equal_approx(Color("#071224b8"))
		and (camisole_shadow.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0, 2)),
		"Camisole tile should match the same production shadow and saturation as the active UI A CSS")
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
		and solid_overlay.material == null
		and not solid_blocker_cell.has_node("BlockerLayerBadge"),
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
	assert(match3.hint_button.custom_minimum_size == Vector2(96, 44), "Hint control should preserve the source compact tool tray size")
	var tutorial_style := match3.tutorial_panel.get_theme_stylebox("panel") as StyleBoxFlat
	var tutorial_badge_style := match3.tutorial_badge.get_theme_stylebox("panel") as StyleBoxFlat
	assert(is_equal_approx(match3.tutorial_panel.custom_maximum_size.x, 350.0), "Tutorial card width should match the source 350px maximum")
	assert(is_equal_approx(match3.tutorial_title.custom_maximum_size.x, -1.0),
		"Other tutorial headings should keep their source full-width layout")
	assert(match3.tutorial_title.get_theme_constant("outline_size") == 1
		and match3.tutorial_title.get_theme_color("font_outline_color") == Color("#102744"),
		"Tutorial headings should retain the source's heavy navy serif treatment")
	var saved_tutorial: String = match3.active_tutorial
	match3.active_tutorial = "basic-swap"
	match3._refresh()
	assert(match3.tutorial_title.get_theme_constant("line_spacing") == -8
		and match3.tutorial_body.get_theme_constant("line_spacing") == 2
		and match3.tutorial_title_body_gap.custom_minimum_size.y == 2.0
		and match3.tutorial_button_gap.custom_minimum_size.y == 14.0,
		"Tutorial title/body leading and paragraph-to-action spacing should match the source CSS rhythm")
	match3.active_tutorial = saved_tutorial
	match3._refresh()
	assert(tutorial_style.border_width_top == 3 and tutorial_style.border_width_left == 8, "Tutorial card border should match the source gold frame and green spine")
	assert(tutorial_style.content_margin_left == 28 and tutorial_style.content_margin_right == 23,
		"Tutorial copy and button insets should match the source asymmetric card padding")
	assert(match3.tutorial_badge.custom_minimum_size == Vector2(83, 18)
		and match3.tutorial_badge.position == Vector2(-12, -27)
		and tutorial_badge_style.corner_radius_bottom_left == 4
		and tutorial_badge_style.corner_radius_bottom_right == 4
		and tutorial_badge_style.content_margin_left == 12
		and tutorial_badge_style.content_margin_right == 12
		and match3.tutorial_eyebrow.get_theme_color("font_color") == Color("#fff3cf"),
		"Tutorial case tab should match the source min-width, placement, rounding, padding and ink")
	var tutorial_panel_rect: Rect2 = match3.tutorial_panel.get_global_rect()
	var tutorial_badge_rect: Rect2 = match3.tutorial_badge.get_global_rect()
	var tutorial_body_rect: Rect2 = match3.tutorial_body.get_global_rect()
	var tutorial_action_rect: Rect2 = match3.tutorial_button.get_global_rect()
	assert(is_equal_approx(tutorial_badge_rect.position.x, tutorial_panel_rect.position.x + 16.0)
		and is_equal_approx(tutorial_badge_rect.position.y, tutorial_panel_rect.position.y + 3.0)
		and is_equal_approx(tutorial_badge_rect.size.x, 83.0)
		and is_equal_approx(tutorial_badge_rect.size.y, 21.0)
		and is_equal_approx(tutorial_body_rect.position.x, tutorial_panel_rect.position.x + 28.0)
		and is_equal_approx(tutorial_action_rect.position.x, tutorial_panel_rect.position.x + 28.0)
		and is_equal_approx(tutorial_action_rect.end.x, tutorial_panel_rect.end.x - 23.0)
		and is_equal_approx(tutorial_action_rect.size.y, 48.0),
		"Tutorial badge, body copy and action bounds should match the source card geometry")
	assert(tutorial_style.bg_color.to_html(false) == Color("#fff7df").to_html(false), "Tutorial card paper color should match the source palette")
	assert(match3.tutorial_frame.custom_minimum_size.x == 356.0 and (match3.tutorial_frame.get_theme_stylebox("panel") as StyleBoxFlat).bg_color.to_html(false) == Color("#102744").to_html(false), "Tutorial card should have the source 3px navy outline")
	var tutorial_button_style := match3.tutorial_button.get_theme_stylebox("normal") as StyleBoxFlat
	assert(tutorial_button_style.border_width_top == 2 and tutorial_button_style.bg_color.to_html(false) == Color("#2f6549").to_html(false), "Tutorial action button should match the source green and 2px gold border")
	var original_screen_width := match3.size.x
	match3.size.x = 320.0
	match3._fit_tutorial_card()
	assert(match3.tutorial_panel.custom_minimum_size.x == 292.0 and match3.tutorial_frame.custom_minimum_size.x == 298.0
		and is_equal_approx(match3.tutorial_title.custom_maximum_size.x, -1.0)
		and tutorial_style.content_margin_left == 24 and tutorial_style.content_margin_right == 19
		and tutorial_style.content_margin_top == 24 and tutorial_style.content_margin_bottom == 14
		and match3.tutorial_title.get_theme_font_size("font_size") == 20
		and match3.tutorial_body.get_theme_font_size("font_size") == 11,
		"Compact tutorial card should match the source 14px overlay inset, padding and font sizes")
	match3.size.x = original_screen_width
	match3._fit_tutorial_card()
	assert(match3._tutorial_title_for_display("Собирайте одинаковые предметы", "basic-swap", "ru")
		== "Собирайте\nодинаковые предметы"
		and match3._tutorial_title_for_display("Match identical items", "basic-swap", "en") == "Match identical items"
		and match3._tutorial_title_for_display("Снимайте слои пакета", "clear-package", "ru") == "Снимайте слои пакета",
		"Tutorial title should preserve the source Russian basic-swap line break without changing other locale copy")
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
	var drag_source_cell: Control = match3.board.get_child(drag_source)
	var hover_cell_style := drag_source_cell.get_theme_stylebox("hover") as StyleBoxFlat
	var resting_cell_style := drag_source_cell.get_theme_stylebox("normal") as StyleBoxFlat
	assert(hover_cell_style.bg_color.is_equal_approx(resting_cell_style.bg_color),
		"Match-3 cell hover should preserve the source board surface instead of painting a solid blue tile behind moving art")
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
	var swap_target: int = match3._drag_neighbour(drag_source, "right")
	var swap_source_cell: Control = match3.board.get_child(drag_source)
	var swap_target_cell: Control = match3.board.get_child(swap_target)
	match3._animate_swap(drag_source, swap_target, false)
	await create_timer(0.055).timeout
	assert(swap_source_cell.z_index == 8 and swap_target_cell.z_index == 8
		and not swap_source_cell.clip_contents and not swap_target_cell.clip_contents,
		"Swap should raise both full cells above the grid and allow tile art to travel across cell edges")
	await create_timer(0.12).timeout
	assert(swap_source_cell.z_index == 0 and swap_target_cell.z_index == 0
		and swap_source_cell.clip_contents and swap_target_cell.clip_contents,
		"Completed swap should restore the original cell stacking and clipping")
	match3._animate_swap(drag_source, swap_target, true)
	await create_timer(0.18).timeout
	assert(swap_source_cell.z_index == 0 and swap_target_cell.z_index == 0
		and swap_source_cell.clip_contents and swap_target_cell.clip_contents
		and absf((swap_source_cell.get_node("TileStack") as Control).offset_left) > 1.0,
		"Held successful swap should restore cell layering while retaining the swapped stack offset")
	match3._return_rejected_swap(drag_source, swap_target)
	await create_timer(0.18).timeout
	assert(swap_source_cell.z_index == 0 and swap_target_cell.z_index == 0
		and swap_source_cell.clip_contents and swap_target_cell.clip_contents
		and is_zero_approx((swap_source_cell.get_node("TileStack") as Control).offset_left),
		"Rejected swap return should restore the original cell layers and stack position")
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
	var help_board_before: Array = match3.game.tiles.duplicate()
	var help_moves_before: int = match3.game.moves_left
	match3.help_button.pressed.emit()
	await process_frame
	assert(is_instance_valid(match3.help_overlay) and match3.help_overlay.visible, "Match-3 help action did not open the in-game reference sheet")
	var help_card: Panel = match3.help_overlay.get_node("HelpCard") as Panel
	var help_scroll: ScrollContainer = match3.help_overlay.get_node("HelpCard/HelpScroll") as ScrollContainer
	var help_content: VBoxContainer = match3.help_overlay.get_node("HelpCard/HelpScroll/HelpContent") as VBoxContainer
	assert(help_card.size.x <= 350.0 and help_card.size.x >= 300.0 and help_card.position.y == 68.0,
		"Match-3 help card should use the source centered 350px sheet and top offset; got %s at %s (root %s)" % [help_card.size, help_card.position, match3.help_overlay.size])
	assert(help_scroll.position.x == 28.0 and help_scroll.size.x == 292.0
		and help_scroll.get_v_scroll_bar().modulate.a == 0.0,
		"Match-3 help content should match the web inset and reserved scrollbar gutter without a persistent thumb")
	var blocker_visual := help_content.get_node("Blocker_package/Line/Visual") as Panel
	assert(blocker_visual.custom_minimum_size == Vector2(50, 50)
		and blocker_visual.size_flags_vertical == Control.SIZE_SHRINK_CENTER,
		"Match-3 help blocker art should keep the web row's square visual dimensions")
	var row_direction := help_content.get_node("Special_flash-row/Line/Visual/DirectionMarker") as PanelContainer
	assert(row_direction != null and (row_direction.get_child(0) as Label).text == "↔",
		"Match-3 help row special should show the source-style direction badge")
	match3.help_overlay.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	match3.help_overlay.size = Vector2(320, 568)
	match3.help_overlay._fit()
	assert(match3.help_overlay.compact and is_equal_approx(help_card.size.x, 298.0)
		and is_equal_approx(help_card.size.y, 568.0 * 0.78)
		and help_card.position == Vector2(11, 62),
		"Match-3 help should follow the 320x568 source compact dimensions; got compact=%s card=%s at %s" % [match3.help_overlay.compact, help_card.size, help_card.position])
	assert(help_scroll.position.x == 24.0 and help_scroll.size.x == 246.0,
		"Compact Match-3 help content should preserve the web inset and scrollbar gutter")
	match3.help_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	match3.help_overlay.call_deferred("_fit")
	await process_frame
	assert(not match3.help_overlay.compact and help_card.size.x == 350.0 and help_card.position.y == 68.0,
		"Match-3 help did not restore the standard sheet profile after returning to the phone viewport")
	assert(help_content.has_node("Blocker_package") and help_content.has_node("Blocker_foam")
		and help_content.has_node("Blocker_lock-chain") and help_content.has_node("Special_flash-row")
		and help_content.has_node("Special_flash-column") and help_content.has_node("Special_evidence")
		and help_content.has_node("Special_lead") and help_content.has_node("Special_insight")
		and help_content.get_child_count() >= 24,
		"Match-3 help sheet omitted a blocker, special tile, or gameplay topic")
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		var help_copy: Dictionary = match3.help_overlay.copy
		assert(help_copy.title == match3.campaign_bundle.helpLocalized[locale].title
			and help_copy.blockers.package.body == match3.campaign_bundle.helpLocalized[locale].blockers.package.body,
			"Match-3 help copy did not update to %s" % locale)
	assert(match3.game.tiles == help_board_before and match3.game.moves_left == help_moves_before,
		"Opening or localizing Match-3 help changed gameplay state")
	assert(menu.preferences.set_locale("ru") == OK)
	match3.help_button.pressed.emit()
	await process_frame
	assert(not match3.help_overlay.visible, "Match-3 help trigger did not close the reference sheet")
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
		"motions": [{"index": settle_index, "rows": 2, "spawn": false}],
	})
	var fall_cell: Control = match3.board.get_child(settle_index)
	var fall_stack: Control = fall_cell.get_node("TileStack")
	var fall_started_usec := Time.get_ticks_usec()
	assert(is_equal_approx(fall_stack.offset_top, -fall_cell.size.y * 2.0)
		and fall_stack.scale.is_equal_approx(Vector2(0.98, 0.98)),
		"Fall animation did not match its source start transform")
	await _assert_settle_sample(match3, fall_cell, fall_stack, fall_started_usec, false, 0.115)
	await _assert_settle_sample(match3, fall_cell, fall_stack, fall_started_usec, false, 0.23)
	await _assert_settle_sample(match3, fall_cell, fall_stack, fall_started_usec, false, 0.285)
	await create_timer(0.04).timeout
	assert(is_zero_approx(fall_stack.offset_top) and is_zero_approx(fall_stack.offset_bottom)
		and fall_stack.scale.is_equal_approx(Vector2.ONE),
		"Fall animation did not match its source end transform")
	match3._render_board()
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
	var spawn_started_usec := Time.get_ticks_usec()
	assert(is_equal_approx(settle_stack.offset_top, -settle_cell.size.y * 2.0) and is_equal_approx(settle_stack.offset_bottom, -settle_cell.size.y * 2.0), "Spawn offset mismatch top=%s bottom=%s size=%s" % [settle_stack.offset_top, settle_stack.offset_bottom, settle_cell.size])
	assert(settle_stack.scale.is_equal_approx(Vector2(0.86, 0.86)) and is_equal_approx(settle_stack.modulate.a, 0.05), "Spawn animation did not match its source start scale and opacity")
	await _assert_settle_sample(match3, settle_cell, settle_stack, spawn_started_usec, true, 0.115)
	await _assert_settle_sample(match3, settle_cell, settle_stack, spawn_started_usec, true, 0.218)
	await _assert_settle_sample(match3, settle_cell, settle_stack, spawn_started_usec, true, 0.25)
	assert(settle_stack.offset_top > 0.0 and settle_stack.offset_top < settle_cell.size.y * 0.08, "Spawn animation missed the source 3% overshoot")
	await _assert_settle_sample(match3, settle_cell, settle_stack, spawn_started_usec, true, 0.29)
	var spawn_elapsed := float(Time.get_ticks_usec() - spawn_started_usec) / 1000000.0
	await create_timer(maxf(0.0, float(match3.SETTLE_MOTION_SECONDS) + 0.03 - spawn_elapsed)).timeout
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
	assert(ingredient_material != null
		and (ingredient_material.get_shader_parameter("shadow_color") as Color).is_equal_approx(Color("#00000088"))
		and (ingredient_material.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0.0, 2.0))
		and is_equal_approx(ingredient_material.get_shader_parameter("shadow_blur_px"), 2.0)
		and is_zero_approx(ingredient_material.get_shader_parameter("glow_strength"))
		and is_zero_approx((ingredient_material.get_shader_parameter("glow_gold") as Color).a)
		and is_zero_approx((ingredient_material.get_shader_parameter("glow_aqua") as Color).a),
		"Ingredient idle did not start with the source dark 2px drop shadow")
	await create_timer(0.69).timeout
	var peak_ingredient_shadow: Color = ingredient_material.get_shader_parameter("shadow_color")
	assert(absf(ingredient_icon.offset_top) < 0.25 and absf(ingredient_icon.offset_bottom + 4.0) < 0.25
		and ingredient_icon.scale.is_equal_approx(Vector2.ONE)
		and absf((ingredient_material.get_shader_parameter("shadow_offset_px") as Vector2).y) < 0.25
		and float(ingredient_material.get_shader_parameter("shadow_blur_px")) > 6.7
		and peak_ingredient_shadow.r > 0.98 and peak_ingredient_shadow.g > 0.9 and peak_ingredient_shadow.b > 0.55
		and is_zero_approx(ingredient_material.get_shader_parameter("glow_strength")),
		"Ingredient idle should preserve its size, lift 2px and interpolate to the source gold 7px shadow")
	await create_timer(0.71).timeout
	var resting_ingredient_shadow: Color = ingredient_material.get_shader_parameter("shadow_color")
	var resting_shadow_offset: Vector2 = ingredient_material.get_shader_parameter("shadow_offset_px")
	var resting_shadow_blur: float = ingredient_material.get_shader_parameter("shadow_blur_px")
	var source_shadow_color := Color("#00000088")
	assert(absf(ingredient_icon.offset_top - 2.0) < 0.25 and absf(ingredient_icon.offset_bottom + 2.0) < 0.25
		and absf(resting_shadow_offset.y - 2.0) < 0.1
		and absf(resting_shadow_blur - 2.0) < 0.1
		and absf(resting_ingredient_shadow.r - source_shadow_color.r) < 0.03
		and absf(resting_ingredient_shadow.g - source_shadow_color.g) < 0.03
		and absf(resting_ingredient_shadow.b - source_shadow_color.b) < 0.03
		and absf(resting_ingredient_shadow.a - source_shadow_color.a) < 0.03,
		"Ingredient idle should return to its source geometry and dark 2px shadow (got top=%.2f bottom=%.2f offset=%s blur=%.2f color=%s)" % [ingredient_icon.offset_top, ingredient_icon.offset_bottom, resting_shadow_offset, resting_shadow_blur, resting_ingredient_shadow])
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
	var clearing_tweens: Array[Tween] = match3.get_tree().get_processed_tweens()
	assert(not clearing_tweens.is_empty(), "Clear action did not create a runtime tween")
	var clearing_tween: Tween = clearing_tweens.back()
	await _assert_clear_sample(match3, clearing_stack, clearing_tween, 0.064)
	await _assert_clear_sample(match3, clearing_stack, clearing_tween, 0.09)
	await _assert_clear_sample(match3, clearing_stack, clearing_tween, 0.224)
	while clearing_tween.is_running():
		await match3.get_tree().process_frame
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
	assert(is_equal_approx(match3._special_impact_peak_duration(true), 0.1064)
		and is_equal_approx(match3._special_impact_return_duration(true), 0.1736),
		"Activated specials should reach their 1.11 CSS peak at 38% of the 280ms impact")
	assert(is_equal_approx(match3._special_impact_peak_duration(false), 0.1176)
		and is_equal_approx(match3._special_impact_return_duration(false), 0.1624),
		"Affected targets should reach their 1.055 CSS peak at 42% of the 280ms impact")
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
	var special_cell: Control = match3.board.get_child(special_index)
	var special_stack: Control = special_cell.get_node("TileStack")
	var special_icon: TextureRect = special_stack.get_node("Special")
	assert(is_equal_approx(special_icon.rotation_degrees, -8.0), "Flash Row activation did not start from the source impact keyframe")
	var glow_texture_image: Image = special_icon.texture.get_image()
	var glow_texture_bounds := glow_texture_image.get_used_rect()
	assert(is_equal_approx(special_icon.offset_left, -42.0) and is_equal_approx(special_icon.offset_top, -42.0)
		and is_equal_approx(special_icon.offset_right, 42.0) and is_equal_approx(special_icon.offset_bottom, 42.0)
		and special_icon.texture.get_width() > 512 and glow_texture_bounds.position.x > 200
		and glow_texture_bounds.position.y > 200,
		"Special impact texture must extend its transparent quad far enough to render the full CSS blur outside the icon")
	await process_frame
	var feedback_center := match3.match_feedback_panel.get_parent() as Control
	var feedback_global: Rect2 = match3.match_feedback_panel.get_global_rect()
	var expected_feedback_center := Vector2(
		match3.board_frame.get_global_rect().get_center().x,
		match3.board_frame.get_global_position().y + match3.board_frame.size.y * 0.48,
	)
	assert(feedback_center.get_parent() == match3.board_frame
		and is_equal_approx(feedback_global.get_center().x, expected_feedback_center.x)
		and is_equal_approx(feedback_global.get_center().y, expected_feedback_center.y),
		"Match feedback should use the CSS 48 percent board point (got %s, expected %s)" % [
			feedback_global.get_center(), expected_feedback_center,
		])
	var feedback_style := match3.match_feedback_panel.get_theme_stylebox("panel") as StyleBoxFlat
	assert(feedback_style.bg_color == Color("#c07f35ef"), "Special feedback did not use the source amber treatment")
	assert(special_cell.pivot_offset == special_cell.custom_minimum_size * 0.5, "Board cell scale effects should pivot around the center like CSS transforms")
	var source_outline: Panel = special_cell.get_node("SpecialImpactSourceOutline")
	assert(is_equal_approx(source_outline.modulate.a, 1.0) and special_cell.z_index == 6,
		"Activated special outline should remain visible above neighboring cells throughout its impact")
	assert(special_cell.get_node_or_null("SpecialImpactFlash") != null, "Special clear did not create its visual impact flash")
	assert(special_cell.get_node_or_null("SpecialImpactSourceOutline") != null, "Activated special did not receive its source outline")
	assert(special_cell.get_node_or_null("SpecialImpactBeam") != null, "Line special did not create its directional beam")
	var impact_beam := special_cell.get_node("SpecialImpactBeam") as ColorRect
	var impact_flash := special_cell.get_node("SpecialImpactFlash") as ColorRect
	assert(impact_beam.z_index == 7 and impact_flash.z_index == 8,
		"Line-special beam should render below the CSS z-index 8 cell flash")
	var impact_beam_material := impact_beam.material as ShaderMaterial
	var beam_core_size := special_cell.size.y * 0.12
	var expected_beam_core_fraction := beam_core_size / (beam_core_size + 10.0)
	assert((impact_beam_material.get_shader_parameter("beam_gold") as Color).is_equal_approx(Color("#fff5bdde"))
		and (impact_beam_material.get_shader_parameter("beam_aqua") as Color).is_equal_approx(Color("#6ce2d3f2"))
		and (impact_beam_material.get_shader_parameter("beam_stops") as Vector3).is_equal_approx(Vector3(0.2, 0.5, 0.8))
		and absf(float(impact_beam_material.get_shader_parameter("beam_core_fraction")) - expected_beam_core_fraction) < 0.001
		and is_equal_approx(impact_beam_material.get_shader_parameter("beam_blur_step_px"), 2.8867513)
		and is_equal_approx(impact_beam.offset_top, -5.0) and is_equal_approx(impact_beam.offset_bottom, 5.0)
		and impact_beam_material.shader.code.contains("beam_gold.a * clamp(point / beam_stops.x")
		and impact_beam_material.shader.code.contains("mix(beam_gold, beam_aqua")
		and impact_beam_material.shader.code.contains("mix(beam_aqua, beam_gold")
		and impact_beam_material.shader.code.contains("for (int cross_index = -6; cross_index <= 6; cross_index++)")
		and impact_beam_material.shader.code.contains("return 0.2255859375"),
		"Line special beam did not preserve CSS colors, gradient stops and the calibrated aqua drop shadow")
	assert(special_stack.pivot_offset == special_cell.custom_minimum_size * 0.5, "Tile-stack scale effects should pivot around the source cell center")
	var special_shadow := special_icon.material as ShaderMaterial
	var direction_marker: PanelContainer = special_stack.get_node("SpecialDirectionMarker")
	assert(direction_marker.get_child(0).text == "↔" and special_shadow != null
		and is_equal_approx(special_shadow.get_shader_parameter("shadow_blur_px"), 2.0)
		and is_zero_approx((special_shadow.get_shader_parameter("shadow_color") as Color).a)
		and (special_shadow.get_shader_parameter("shadow_offset_px") as Vector2).is_zero_approx()
		and is_equal_approx(special_shadow.get_shader_parameter("glow_strength"), 1.3)
		and (special_shadow.get_shader_parameter("glow_gold") as Color).to_html(false) == Color("#fff0a8").to_html(false)
		and is_equal_approx(special_shadow.get_shader_parameter("glow_white_radius_px"), 5.0)
		and is_equal_approx((special_shadow.get_shader_parameter("glow_white") as Color).a, 1.0)
		and is_equal_approx(special_shadow.get_shader_parameter("glow_gold_radius_px"), 10.0)
		and (special_shadow.get_shader_parameter("glow_aqua") as Color).to_html(false) == Color("#6ce2d3").to_html(false)
		and is_equal_approx(special_shadow.get_shader_parameter("glow_aqua_radius_px"), 14.0),
		"Flash Row activation should add the source white, gold and aqua glow radii")
	var glow_shader_code: String = special_shadow.shader.code
	assert(glow_shader_code.contains("background_rgb * (1.0 - shadow_alpha)")
		and not glow_shader_code.contains("background_rgb * background_alpha")
		and not glow_shader_code.contains("background_rgb *= COLOR.rgb")
		and glow_shader_code.contains("for (int y = -6; y <= 6; y++)")
		and glow_shader_code.contains("float(y) * 0.5")
		and glow_shader_code.contains("float total_weight = 0.0"),
		"Special-icon glow must preserve premultiplied RGB and use a normalized blur kernel without clipping")
	var row_target_cell: Control = match3.board.get_child(impact_target)
	var row_impact_wait_frames := 0
	while (absf(special_icon.rotation_degrees) > 0.1 or special_cell.z_index != resting_source_z
		or row_target_cell.z_index != resting_target_z) and row_impact_wait_frames < 60:
		await process_frame
		row_impact_wait_frames += 1
	assert(is_equal_approx(special_icon.rotation_degrees, 0.0), "Flash Row activation did not return to neutral rotation")
	assert(special_cell.z_index == resting_source_z and row_target_cell.z_index == resting_target_z,
		"Special impact did not restore the cells' original stacking order after 280ms")
	var column_frame_specials: Array[String] = match3.game.specials.duplicate()
	column_frame_specials[special_index] = "flash-column"
	match3._render_frame({
		"phase": "clear",
		"tiles": match3.game.tiles.duplicate(),
		"specials": column_frame_specials,
		"blockers": match3.game.blocker_layers.duplicate(),
		"ingredients": match3.game.ingredients.duplicate(),
		"cleared": [special_index, impact_target],
		"cascade": 1,
		"feedback": "special",
	})
	var column_cell: Control = match3.board.get_child(special_index)
	var column_beam := column_cell.get_node("SpecialImpactBeam") as ColorRect
	var column_beam_material := column_beam.material as ShaderMaterial
	assert(column_beam_material.get_shader_parameter("vertical_gradient")
		and is_equal_approx(column_beam_material.get_shader_parameter("beam_blur_step_px"), 3.25)
		and is_equal_approx(column_beam.scale.x, 0.25) and is_equal_approx(column_beam.scale.y, 1.0)
		and is_equal_approx(column_beam.offset_left, -5.0) and is_equal_approx(column_beam.offset_right, 5.0),
		"Flash Column should begin compressed across its width, matching CSS after the 90-degree rotation")
	await process_frame
	assert(column_beam.scale.x > 0.25 and column_beam.scale.y > 0.99 and column_beam.scale.y < 1.01,
		"Flash Column impact should expand across the beam width while preserving its longitudinal scale")
	var peak_wait_frames := 0
	while column_beam.scale.x < 1.12 and peak_wait_frames < 30:
		await process_frame
		peak_wait_frames += 1
	assert(column_beam.scale.x > 1.12 and column_beam.scale.x <= 1.17
		and column_beam.scale.y > 0.99 and column_beam.scale.y < 1.01 and column_beam.modulate.a > 0.9,
		"Flash Column should reach the CSS 1.15 width peak while keeping its length unchanged")
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
	var beam_removal_wait_frames := 0
	while column_cell.get_node_or_null("SpecialImpactBeam") != null and beam_removal_wait_frames < 60:
		await process_frame
		beam_removal_wait_frames += 1
	assert(column_cell.get_node_or_null("SpecialImpactBeam") == null,
		"Flash Column beam should finish its 280ms CSS impact and be removed")
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


func _assert_clear_sample(match3: Control, tile_stack: Control, tween: Tween,
		target_seconds: float) -> void:
	while tween.is_running() and tween.get_total_elapsed_time() < target_seconds:
		await match3.get_tree().process_frame
	var elapsed := tween.get_total_elapsed_time()
	var duration := float(match3.CLEAR_MOTION_SECONDS)
	var peak_seconds := duration * 0.48
	var progress: float
	var start_scale: float
	var end_scale: float
	var start_brightness: float
	var end_brightness: float
	var expected_opacity: float
	if elapsed <= peak_seconds:
		progress = clampf(elapsed / peak_seconds, 0.0, 1.0)
		start_scale = 1.0
		end_scale = 1.1
		start_brightness = 1.0
		end_brightness = 1.55
		expected_opacity = 1.0
	else:
		progress = clampf((elapsed - peak_seconds) / (duration - peak_seconds), 0.0, 1.0)
		start_scale = 1.1
		end_scale = 0.18
		start_brightness = 1.55
		end_brightness = 1.8
		expected_opacity = 1.0 - match3._css_cubic_bezier(progress, 0.2, 0.72, 0.18, 1.0)
	var eased: float = match3._css_cubic_bezier(progress, 0.2, 0.72, 0.18, 1.0)
	var expected_scale := lerpf(start_scale, end_scale, eased)
	var expected_brightness := lerpf(start_brightness, end_brightness, eased)
	var scale_tolerance := 0.04 if absf(elapsed - peak_seconds) < 0.01 else 0.025
	assert(absf(tile_stack.scale.x - expected_scale) < scale_tolerance
		and absf(tile_stack.modulate.r - expected_brightness) < 0.06
		and absf(tile_stack.modulate.a - expected_opacity) < 0.06,
		"Clear animation differs from CSS at %.1fms: scale %.4f/%.4f brightness %.4f/%.4f opacity %.3f/%.3f" % [
			elapsed * 1000.0, tile_stack.scale.x, expected_scale,
			tile_stack.modulate.r, expected_brightness, tile_stack.modulate.a, expected_opacity,
		])
	print("UPDS Godot clear sample %.1fms: scale %.4f/%.4f brightness %.4f/%.4f opacity %.3f/%.3f" % [
		elapsed * 1000.0, tile_stack.scale.x, expected_scale,
		tile_stack.modulate.r, expected_brightness, tile_stack.modulate.a, expected_opacity,
	])


func _assert_settle_sample(match3: Control, cell: Control, tile_stack: Control,
		started_usec: int, is_spawn: bool, target_seconds: float) -> void:
	var elapsed := float(Time.get_ticks_usec() - started_usec) / 1000000.0
	await create_timer(maxf(0.0, target_seconds - elapsed)).timeout
	elapsed = float(Time.get_ticks_usec() - started_usec) / 1000000.0
	var duration := float(match3.SETTLE_MOTION_SECONDS)
	var progress := clampf(elapsed / duration, 0.0, 1.0)
	var keyframe := 0.78 if is_spawn else 0.72
	var start_y := -2.0 * cell.size.y
	var overshoot_y := cell.size.y * 0.03
	var start_scale := 0.86 if is_spawn else 0.98
	var peak_scale := 1.02 if is_spawn else 1.015
	var expected_y: float
	var expected_scale: float
	if progress <= keyframe:
		var segment := progress / keyframe
		var eased: float = match3._css_cubic_bezier(segment, 0.18, 0.82, 0.28, 1.0)
		expected_y = lerpf(start_y, overshoot_y, eased)
		expected_scale = lerpf(start_scale, peak_scale, eased)
	else:
		var segment := (progress - keyframe) / (1.0 - keyframe)
		var eased: float = match3._css_cubic_bezier(segment, 0.18, 0.82, 0.28, 1.0)
		expected_y = lerpf(overshoot_y, 0.0, eased)
		expected_scale = lerpf(peak_scale, 1.0, eased)
	var expected_alpha := 1.0
	if is_spawn and progress < 0.68:
		var opacity_progress: float = match3._css_cubic_bezier(progress / 0.68, 0.18, 0.82, 0.28, 1.0)
		expected_alpha = lerpf(0.05, 1.0, opacity_progress)
	assert(absf(tile_stack.offset_top - expected_y) < 5.0
		and absf(tile_stack.offset_bottom - expected_y) < 5.0
		and absf(tile_stack.scale.x - expected_scale) < 0.04
		and absf(tile_stack.modulate.a - expected_alpha) < 0.08,
		"%s tween differs from source CSS at %.1fms: y %.2f/%.2f scale %.4f/%.4f alpha %.3f/%.3f" % [
			"Spawn" if is_spawn else "Fall", elapsed * 1000.0,
			tile_stack.offset_top, expected_y, tile_stack.scale.x, expected_scale,
			tile_stack.modulate.a, expected_alpha,
		])


func _has_weighted_cyrillic_serif(font: Font, weight: int) -> bool:
	if not font is FontVariation or font.fallbacks.size() != 1: return false
	var cyrillic := font.fallbacks[0] as FontVariation
	if cyrillic == null or cyrillic.base_font != UiFonts.SERIF_CYRILLIC: return false
	var expected_weight := mini(weight, 700)
	var expected_embolden := float(weight - 700) / 500.0 if weight > 700 else 0.0
	return (
		is_equal_approx(cyrillic.variation_opentype.get("weight", 0.0), float(expected_weight))
		and is_equal_approx(cyrillic.variation_embolden, expected_embolden)
	)
