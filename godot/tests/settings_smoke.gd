extends SceneTree

const PlayerPreferences = preload("res://scripts/player_preferences.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")


func _initialize() -> void:
	call_deferred("_run_smoke")


func _run_smoke() -> void:
	var path := "user://settings_smoke_%s.cfg" % Time.get_ticks_usec()
	var preferences := PlayerPreferences.new(path)
	assert(preferences.locale == MenuCopy.default_locale()
		and preferences.locale == "ru",
		"Fresh Godot profiles should use the same Russian default locale as the source web game")
	assert(preferences.set_locale("unsupported") == ERR_INVALID_PARAMETER)
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = preload("res://tests/memory_storage.gd").story_session()
	menu.preferences = preferences
	root.add_child(menu)
	menu.get_node("Content/Actions/Settings").emit_signal("pressed")
	var screen: PanelContainer = menu.get_node("SettingsScreen")
	assert(not menu.get_node("Content").visible)
	assert(screen.find_child("PanelHeader", true, false) != null
		and screen.find_child("LanguageRow", true, false) != null
		and screen.find_child("MusicVolumeCard", true, false) != null
		and screen.find_child("EffectsVolumeCard", true, false) != null
		and screen.find_child("AudioToggles", true, false) != null
		and screen.find_child("PwaOfflineCard", true, false) != null,
		"Settings should preserve the source header, grouped controls, and platform status card")
	var compact_language_row := screen.get_viewport_rect().size.x <= 520.0
	assert(screen.language.get_parent().name == "LanguageRowContent"
		and screen.language.get_parent().get_parent().name == "LanguageRow"
		and screen.language_row_content.columns == (1 if compact_language_row else 2)
		and is_equal_approx(screen.language.custom_minimum_size.x, 0.0 if compact_language_row else 128.0),
		"Language copy and selector should share the source responsive language row")
	assert(screen.audio_title.text == MenuCopy.text("audio_title", preferences.locale)
		and screen.audio_copy.text == MenuCopy.text("audio_copy", preferences.locale)
		and screen.music_value.text.ends_with("%") and screen.effects_value.text.ends_with("%"),
		"Settings should show localized section copy and live volume values")
	var audio_toggles: HBoxContainer = screen.find_child("AudioToggles", true, false)
	assert(audio_toggles.get_child(0).size_flags_horizontal == Control.SIZE_EXPAND_FILL
		and audio_toggles.get_child(1).size_flags_horizontal == Control.SIZE_EXPAND_FILL
		and screen.mobile_note_title.text == MenuCopy.text("mobile_contract_title", preferences.locale),
		"Settings should balance the source toggle cards and localize the mobile audio note")
	assert(screen.music_slider.get_parent().get_parent().name == "MusicVolumeCard"
		and screen.effects_slider.get_parent().get_parent().name == "EffectsVolumeCard",
		"Volume labels and sliders should share the same source-style cards")
	assert(screen.pwa_status.text == MenuCopy.text("pwa_hosted", preferences.locale)
		and (screen.pwa_meta.text.contains("Playgama") or screen.pwa_meta.text.contains("mock"))
		and screen.find_child("PwaCacheProgress", true, false) == null
		and not screen.pwa_install.visible and screen.pwa_check.disabled,
		"PWA card should identify the host and avoid claiming browser cache or unsupported actions")
	var install_heading: Label = screen.find_child("InstallHeading", true, false)
	var mobile_contract: PanelContainer = screen.find_child("MobileContract", true, false)
	var note_style := mobile_contract.get_theme_stylebox("panel") as StyleBoxFlat
	assert(install_heading.text == MenuCopy.text("install_heading", preferences.locale)
		and install_heading.get_index() < screen.find_child("PwaOfflineCard", true, false).get_index()
		and mobile_contract.get_parent().get_index() > screen.find_child("PwaOfflineCard", true, false).get_index()
		and screen.mobile_note_title.get_parent().get_parent() == mobile_contract
		and is_equal_approx(note_style.border_width_left, 3.0)
		and note_style.bg_color.is_equal_approx(Color("#fff7dc")),
		"Installation status should precede the source yellow mobile note and gold accent")
	for index in screen.language.item_count:
		screen.language.select(index)
		screen.language.item_selected.emit(index)
		var locale: String = screen.language.get_item_metadata(index)
		assert(preferences.locale == locale)
		assert(PlayerPreferences.new(path).locale == locale, "Language did not survive reload")
		assert(screen.title.text == MenuCopy.text("settings", locale))
		assert(menu.get_node("Content/Actions/NewGame").text == MenuCopy.text("new_game", locale))
		assert(screen.error_label.text.is_empty())
	screen.music_slider.value = 45
	assert(is_equal_approx(preferences.audio.musicVolume, 0.45), "Music slider should persist the adjusted level")
	screen.mute.button_pressed = not preferences.audio.muted
	screen.mute.toggled.emit(screen.mute.button_pressed)
	assert(preferences.audio.muted == screen.mute.button_pressed, "Mute toggle should persist its pressed state")
	screen.back.pressed.emit()
	assert(not menu.has_node("SettingsScreen"))
	assert(menu.get_node("Content").visible)
	assert(menu.get_node("Content/Actions/Settings").has_focus())
	menu.get_node("Content/Actions/Settings").emit_signal("pressed")
	assert(menu.get_node("SettingsScreen").language.selected == 2)
	menu.get_node("SettingsScreen")._unhandled_key_input(_escape_event())
	assert(not menu.has_node("SettingsScreen"))
	menu.queue_free()

	var invalid := ConfigFile.new()
	invalid.set_value("interface", "locale", 123)
	assert(invalid.save(path) == OK)
	assert(PlayerPreferences.new(path).locale == MenuCopy.default_locale())
	var failed := PlayerPreferences.new("user://missing_%s/settings.cfg" % Time.get_ticks_usec())
	var original: String = failed.locale
	assert(failed.set_locale("ru" if original != "ru" else "en") != OK)
	assert(failed.locale == original, "Failed writes must preserve the active language")
	DirAccess.remove_absolute(path)
	await process_frame
	print("UPDS Godot settings smoke test passed.")
	quit()


func _escape_event() -> InputEventKey:
	var event := InputEventKey.new()
	event.keycode = KEY_ESCAPE
	event.pressed = true
	return event
