extends SceneTree

const PlayerPreferences = preload("res://scripts/player_preferences.gd")
const Synthesis = preload("res://scripts/audio_synthesis.gd")


func _initialize() -> void:
	call_deferred("_run_smoke")


func _run_smoke() -> void:
	var path := "user://audio_smoke_%s.cfg" % Time.get_ticks_usec()
	var preferences := PlayerPreferences.new(path)
	assert(preferences.audio == PlayerPreferences.DEFAULT_AUDIO)
	assert(preferences.set_locale("be") == OK)
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = preload("res://tests/memory_storage.gd").story_session()
	menu.preferences = preferences
	root.add_child(menu)
	menu.get_node("Content/Actions/Settings").emit_signal("pressed")
	var screen: PanelContainer = menu.get_node("SettingsScreen")
	assert(screen.music_slider.value == 32 and screen.effects_slider.value == 72)
	assert(screen.music_slider.has_theme_icon_override("grabber"),
		"Volume sliders must provide a real texture grabber, not an ignored StyleBox")
	menu.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	for locale in ["ru", "be", "en"]:
		preferences.set_locale(locale)
		for width in [320, 390, 430]:
			menu.size = Vector2(width, 844)
			await process_frame
			await process_frame
			await process_frame
			assert(screen.get_combined_minimum_size().x <= width,
				"Settings content forces horizontal overflow for %s at %d" % [locale, width])
			assert(screen.size.x <= width,
				"Settings root expands beyond the phone for %s at %d" % [locale, width])
		assert(screen.eyebrow.text == ("НАЛАДЫ · СІСТЭМА" if locale == "be" else "CONFIG · SYSTEM"))
	preferences.set_locale("be")
	menu.size = Vector2(390, 844)
	_card_pointer(screen.mute_card, Vector2(4, 4), true)
	assert(not preferences.audio.muted, "Card must toggle on release, not pointer down")
	_card_pointer(screen.mute_card, Vector2(4, 4), false)
	assert(preferences.audio.muted and screen.mute.has_focus(), "Card edge click must toggle and focus its keyboard control")
	assert((screen.mute_card.get_theme_stylebox("panel") as StyleBoxFlat).bg_color == Color("#eef9f6"))
	screen.mute.button_pressed = false
	_card_pointer(screen.mute_card, Vector2(4, 4), true)
	_card_pointer(screen.mute_card, Vector2(-4, -4), false)
	assert(not preferences.audio.muted, "Dragging outside a card must cancel the toggle")
	var original_card_position: Vector2 = screen.mute_card.position
	_card_pointer(screen.mute_card, Vector2(4, 4), true)
	screen.mute_card.position.y -= 20
	_card_pointer(screen.mute_card, Vector2(4, 4), false)
	assert(not preferences.audio.muted, "Scrolling a card under the pointer must cancel the toggle")
	screen.mute_card.position = original_card_position
	var key := InputEventKey.new()
	key.keycode = KEY_SPACE
	key.pressed = true
	Input.parse_input_event(key)
	await process_frame
	key = key.duplicate()
	key.pressed = false
	Input.parse_input_event(key)
	await process_frame
	assert(preferences.audio.muted, "Space after an edge click must activate the focused toggle")
	screen.mute.button_pressed = false
	_card_pointer(screen.haptics_card, Vector2(4, 4), true)
	_card_pointer(screen.haptics_card, Vector2(4, 4), false)
	assert(not preferences.audio.hapticsEnabled, "Haptics card edge must toggle the saved preference")
	screen.haptics.button_pressed = true
	screen.music_slider.value = 61
	screen.effects_slider.value = 27
	screen.haptics.button_pressed = false
	assert(is_equal_approx(preferences.audio.musicVolume, 0.61))
	assert(is_equal_approx(preferences.audio.effectsVolume, 0.27))
	assert(not preferences.audio.hapticsEnabled)
	var restored := PlayerPreferences.new(path)
	assert(restored.audio == preferences.audio and restored.locale == "be")
	assert(preferences.set_locale("en") == OK)
	assert(PlayerPreferences.new(path).audio == restored.audio, "Locale writes erased audio settings")

	screen.preview_music.pressed.emit()
	var runtime: Node = menu.audio_runtime
	assert(runtime.music.playing)
	assert(runtime.music.stream.loop_mode == AudioStreamWAV.LOOP_FORWARD)
	assert(is_equal_approx(db_to_linear(runtime.music.volume_db), 0.61 * 0.52))
	assert(runtime.music.stream.get_length() > 11.0 and runtime.music.stream.get_length() < 11.2)
	assert(_has_sound(runtime.music.stream), "Music PCM is silent")
	screen.preview_effects.pressed.emit()
	assert(runtime.effects.playing and _has_sound(runtime.effects.stream))
	assert(is_equal_approx(db_to_linear(runtime.effects.volume_db), 0.27))
	screen.mute.button_pressed = true
	assert(not runtime.music.playing and not runtime.effects.playing)
	screen.preview_music.pressed.emit()
	screen.preview_effects.pressed.emit()
	assert(not runtime.music.playing and not runtime.effects.playing, "Preview bypassed mute")
	screen.mute.button_pressed = false
	assert(runtime.music.playing)
	screen.music_slider.value = 0
	screen.effects_slider.value = 0
	screen.preview_effects.pressed.emit()
	assert(not runtime.music.playing and not runtime.effects.playing)
	screen.music_slider.value = 40
	runtime._notification(Node.NOTIFICATION_APPLICATION_FOCUS_OUT)
	assert(not runtime.music.playing)
	runtime._notification(Node.NOTIFICATION_APPLICATION_FOCUS_IN)
	assert(runtime.music.playing)
	screen.back.pressed.emit()
	assert(runtime.music.playing, "Closing settings interrupted menu music")
	menu.get_node("Content/Actions/Settings").emit_signal("pressed")
	assert(menu.get_node("SettingsScreen").music_slider.value == 40)

	var bad := PlayerPreferences.normalize_audio({"muted": 1, "musicVolume": NAN, "effectsVolume": 5, "hapticsEnabled": "false"})
	assert(bad.muted == false and bad.musicVolume == 0 and bad.effectsVolume == 1 and bad.hapticsEnabled == true)
	assert(PlayerPreferences.normalize_audio({"musicVolume": -1}).musicVolume == 0)
	assert(preferences.update_audio({"unknown": 1}) == ERR_INVALID_PARAMETER)
	var broken := ConfigFile.new()
	broken.set_value("audio", "musicVolume", "bad")
	broken.set_value("audio", "muted", 1)
	assert(broken.save(path) == OK)
	assert(PlayerPreferences.new(path).audio == PlayerPreferences.DEFAULT_AUDIO)
	var failed := PlayerPreferences.new("user://missing_audio_%s/settings.cfg" % Time.get_ticks_usec())
	var original: Dictionary = failed.audio
	assert(failed.update_audio({"muted": true}) != OK)
	assert(failed.audio == original)
	var failed_screen: PanelContainer = menu.get_node("SettingsScreen")
	failed_screen.preferences = failed
	failed_screen.music_slider.value = 90
	assert(failed_screen.music_slider.value == 32 and not failed_screen.error_label.text.is_empty())
	menu.queue_free()
	await process_frame
	DirAccess.remove_absolute(path)
	print("UPDS Godot audio smoke test passed.")
	quit()


func _has_sound(stream: AudioStreamWAV) -> bool:
	for offset in range(0, stream.data.size(), 2):
		if absi(stream.data.decode_s16(offset)) > 10:
			return true
	return false


func _card_pointer(card: Control, position: Vector2, pressed: bool) -> void:
	var event := InputEventMouseButton.new()
	event.button_index = MOUSE_BUTTON_LEFT
	event.position = position
	event.pressed = pressed
	card.gui_input.emit(event)
