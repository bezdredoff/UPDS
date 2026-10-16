extends SceneTree

const MenuCopy = preload("res://scripts/menu_copy.gd")
const CONTRACT = preload("res://data/save_contract.json")
const UiFonts = preload("res://scripts/ui_fonts.gd")


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
	assert(int(ProjectSettings.get_setting("display/window/size/viewport_width")) == 390
		and int(ProjectSettings.get_setting("display/window/size/viewport_height")) == 844,
		"Main menu project base must match the 390x844 mobile web shell")
	var menu_content: Control = menu.get_node("Content")
	var hero: Control = menu.get_node("Content/Hero")
	var actions: Control = menu.get_node("Content/Actions")
	var default_font := menu.theme.default_font as FontVariation
	assert(default_font != null and default_font.base_font == UiFonts.INTER_LATIN,
		"Main menu and inherited screens should use the bundled Inter interface face")
	assert((menu.get_node("Content/Title").get_theme_font("normal_font") as SystemFont).font_names.has("Georgia"),
		"Native main menu title should retain the source Georgia font stack")
	var hero_top: float = menu_content.position.y + hero.position.y
	var actions_top: float = menu_content.position.y + actions.position.y
	assert(hero_top > 180.0 and hero_top < 250.0,
		"At 390x844, title and tagline should keep the character medallions in the upper third")
	assert(actions_top > 520.0 and actions_top < 600.0,
		"At 390x844, menu actions should stay near the lower source-menu position")
	assert(menu.get_node("Content/Footer").text == "v" + str(CONTRACT.data.appVersion),
		"The menu footer should show the shared product version")

	var menu_width: float = minf(menu.size.x, 430.0)
	assert(absf(menu.get_node("Background").size.x - menu_width) < 1.0,
		"The menu art frame must follow the 430 px web phone width")
	assert(absf(menu.get_node("Content").size.x - (menu_width - 56.0)) < 1.0,
		"The menu content must retain the web page's 28 px side padding")
	assert(menu.get_node("Content/Hero").position.y / menu.get_node("Content").size.y < 0.45,
		"The character medallions must stay with the title block above the flexible spacer")
	assert(menu.get_node("Wash").texture.get_height() >= 1024,
		"The menu gradient must keep enough vertical resolution to avoid visible bands")
	assert(menu.get_node("Wash").stretch_mode == TextureRect.STRETCH_SCALE,
		"The menu wash must fill the phone frame height rather than tile at texture resolution")

	var locale := MenuCopy.default_locale()
	assert(menu.get_node("Content/Eyebrow").text == MenuCopy.text("eyebrow", locale))
	var menu_title := menu.get_node("Content/Title") as RichTextLabel
	assert(menu_title.text.contains(MenuCopy.text("title", locale)))
	assert(menu_title.text.contains(MenuCopy.text("accent", locale)))
	assert(menu.get_node("Content/Tagline/Copy").get_theme_font_size("font_size") == 15
		and is_equal_approx(menu.get_node("Content/Tagline").custom_minimum_size.y, 20.0),
		"Playgama Web tagline should preserve its calibrated width and fixed layout slot")
	assert(menu.get_node("Content/Actions/Continue").disabled, "Continue requires a save adapter")
	var continue_button: Button = menu.get_node("Content/Actions/Continue")
	assert(is_equal_approx(continue_button.modulate.a, 0.38),
		"Disabled Continue should use the source web opacity")
	assert(continue_button.get_theme_color("font_disabled_color") == continue_button.get_theme_color("font_color")
		and continue_button.get_theme_stylebox("disabled") == continue_button.get_theme_stylebox("normal"),
		"Disabled Continue should apply only the source opacity, without Godot's extra disabled tint")
	var new_game_button: Button = menu.get_node("Content/Actions/NewGame")
	var menu_button_font := new_game_button.get_theme_font("font") as FontVariation
	var secondary_button_font := continue_button.get_theme_font("font") as FontVariation
	assert(menu_button_font != null and menu_button_font.variation_opentype.get("weight", 0.0) == 850.0
		and secondary_button_font != null and secondary_button_font.variation_opentype.get("weight", 0.0) == 700.0
		and menu_button_font.base_font == preload("res://assets/fonts/Inter-latin.woff2"),
		"Main menu buttons should match the source font weights")
	var eyebrow_font := menu.get_node("Content/Eyebrow").get_theme_font("font") as FontVariation
	assert(eyebrow_font != null and eyebrow_font.spacing_glyph == 2
		and menu.get_node("Content/Eyebrow").get_theme_font_size("font_size") == 9,
		"Main menu eyebrow should match source tracking and visible height with the bundled font metrics")
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

	menu.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	menu.size = Vector2(390, 664)
	menu._layout_menu()
	assert(is_equal_approx(menu.get_node("Content").offset_top, 26.0),
		"Compact menu should use the source's 26 px top inset")
	assert(menu.get_node("Content").get_theme_constant("separation") == 6,
		"Compact menu should avoid adding excess vertical gaps beneath its short-screen title")
	assert(menu_title.get_theme_font_size("normal_font_size") == 38,
		"Compact menu title should match the source's 38 px heading")
	var compact_tagline: Label = menu.get_node("Content/Tagline/Copy")
	assert(is_equal_approx(menu.get_node("Content/Hero").custom_minimum_size.y, 66.0)
		and is_equal_approx(compact_tagline.offset_top, -6.0)
		and is_equal_approx(compact_tagline.offset_bottom, -6.0),
		"Compact menu should raise only the tagline glyphs while preserving hero flow")
	assert(is_equal_approx(menu.get_node("Content").anchor_bottom, 1.0 - 24.0 / 664.0),
		"Compact menu should preserve the source's 24 px bottom inset")
	menu.size = Vector2(390, 854)
	menu._layout_menu()
	assert(is_equal_approx(menu.get_node("Content").offset_top, 42.0)
		and menu_title.get_theme_font_size("normal_font_size") == 44
		and menu_title.get_theme_constant("line_separation") == -20
		and is_equal_approx(menu.get_node("Content/Hero").custom_minimum_size.y, 78.0),
		"Tall menu should restore the source's regular inset, heading and medallion sizes")
	menu.size = Vector2(320, 568)
	menu._layout_menu()
	assert(is_equal_approx(menu.get_node("Background").size.x, 320.0)
		and is_equal_approx(menu.get_node("Content").size.x, 284.0),
		"Narrow menu should fill a 320 px frame and preserve the source's 18 px inset")
	assert(is_equal_approx(menu.get_node("Content/Tagline/Copy").offset_top, 0.0)
		and is_equal_approx(menu.get_node("Content/Tagline/Copy").offset_bottom, 0.0)
		and is_equal_approx(menu.get_node("Content").offset_top, 18.0)
		and menu_title.get_theme_font_size("normal_font_size") == 34
		and not menu_title.fit_content
		and is_equal_approx(menu_title.custom_minimum_size.y, 74.0)
		and is_equal_approx(menu.get_node("Content/TitleSpacer").custom_minimum_size.y, 4.0)
		and menu_title.get_theme_constant("line_separation") == -12
		and is_equal_approx(menu.get_node("Content/Hero").custom_minimum_size.y, 56.0)
		and is_equal_approx(menu.get_node("Content/HeroSpacer").custom_minimum_size.y, 2.0)
		and menu.get_node("Content/Tagline/Copy").get_theme_font_size("font_size") == 12
		and menu.get_node("Content/Tagline/Copy").autowrap_mode == TextServer.AUTOWRAP_OFF
		and is_equal_approx(menu.get_node("Content/FooterSpacer").custom_minimum_size.y, 17.0)
		and is_equal_approx(menu.get_node("Content/Actions/NewGame").custom_minimum_size.y, 44.0),
		"Narrow menu should use the source's compact heading and medallion sizes")
	assert(is_equal_approx(menu.get_node("Content").anchor_bottom, 1.0 - 12.0 / 568.0),
		"Narrow menu should keep the source's 12 px bottom inset")

	print("UPDS Godot main menu smoke test passed (locale: %s)." % locale)
	quit()
