extends PanelContainer

signal back_requested

const MenuCopy = preload("res://scripts/menu_copy.gd")

var preferences: RefCounted
var audio_runtime: Node
var language: OptionButton
var title: Label
var language_label: Label
var help: Label
var back: Button
var error_label: Label
var audio_title: Label
var music_label: Label
var effects_label: Label
var music_slider: HSlider
var effects_slider: HSlider
var mute: CheckButton
var haptics: CheckButton
var capability: Label
var preview_music: Button
var preview_effects: Button


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var background := StyleBoxFlat.new()
	background.bg_color = Color("#fffdf8")
	background.content_margin_left = 24
	background.content_margin_right = 24
	background.content_margin_top = 32
	background.content_margin_bottom = 24
	add_theme_stylebox_override("panel", background)
	var scroll := ScrollContainer.new()
	scroll.name = "Scroll"
	scroll.follow_focus = true
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(scroll)
	var content := VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 16)
	scroll.add_child(content)
	back = Button.new()
	back.name = "Back"
	back.custom_minimum_size.y = 49
	preload("res://scripts/menu_theme.gd").style_button(back)
	back.pressed.connect(func() -> void:
		audio_runtime.play_effect()
		back_requested.emit())
	content.add_child(back)
	title = Label.new()
	title.add_theme_font_size_override("font_size", 28)
	content.add_child(title)
	language_label = Label.new()
	content.add_child(language_label)
	language = OptionButton.new()
	language.name = "Language"
	language.custom_minimum_size.y = 49
	preload("res://scripts/menu_theme.gd").style_button(language)
	language.add_item("Русский")
	language.set_item_metadata(0, "ru")
	language.add_item("Беларуская")
	language.set_item_metadata(1, "be")
	language.add_item("English")
	language.set_item_metadata(2, "en")
	language.item_selected.connect(_select_language)
	content.add_child(language)
	help = Label.new()
	help.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	content.add_child(help)
	audio_title = _label(content)
	audio_title.add_theme_font_size_override("font_size", 22)
	music_label = _label(content)
	music_slider = _slider(content, "musicVolume")
	effects_label = _label(content)
	effects_slider = _slider(content, "effectsVolume")
	mute = _toggle(content, "muted")
	haptics = _toggle(content, "hapticsEnabled")
	capability = _label(content)
	capability.add_theme_font_size_override("font_size", 13)
	preview_music = Button.new()
	preload("res://scripts/menu_theme.gd").style_button(preview_music)
	preview_music.pressed.connect(audio_runtime.preview_music)
	content.add_child(preview_music)
	preview_effects = Button.new()
	preload("res://scripts/menu_theme.gd").style_button(preview_effects)
	preview_effects.pressed.connect(audio_runtime.preview_effects)
	content.add_child(preview_effects)
	error_label = Label.new()
	error_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	error_label.add_theme_color_override("font_color", Color("#ac3f59"))
	content.add_child(error_label)
	for label in [title, language_label, help]:
		label.add_theme_color_override("font_color", Color("#29243d"))
	preferences.locale_changed.connect(_refresh)
	preferences.audio_changed.connect(_refresh_audio)
	_refresh(preferences.locale)
	back.grab_focus()


func _refresh(locale: String) -> void:
	title.text = MenuCopy.text("settings", locale)
	language_label.text = MenuCopy.text("language", locale)
	back.text = MenuCopy.text("back", locale)
	help.text = MenuCopy.text("language_help", locale)
	language.tooltip_text = MenuCopy.text("language", locale)
	for index in language.item_count:
		if language.get_item_metadata(index) == locale:
			language.select(index)
	audio_title.text = MenuCopy.text("audio_title", locale)
	mute.text = MenuCopy.text("mute", locale)
	haptics.text = MenuCopy.text("haptics", locale)
	capability.text = MenuCopy.text("haptics_available" if audio_runtime.haptics_supported else "haptics_unavailable", locale)
	preview_music.text = MenuCopy.text("preview_music", locale)
	preview_effects.text = MenuCopy.text("preview_effects", locale)
	_refresh_audio(locale)


func _select_language(index: int) -> void:
	var error: Error = preferences.set_locale(language.get_item_metadata(index))
	error_label.text = "" if error == OK else MenuCopy.text("settings_save_error", preferences.locale)
	_refresh(preferences.locale)


func _label(content: VBoxContainer) -> Label:
	var label := Label.new()
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_color_override("font_color", Color("#29243d"))
	content.add_child(label)
	return label


func _slider(content: VBoxContainer, key: String) -> HSlider:
	var slider := HSlider.new()
	slider.name = key
	slider.max_value = 100
	slider.step = 1
	slider.custom_minimum_size.y = 49
	slider.value_changed.connect(func(value: float) -> void: _update_audio({key: value / 100.0}))
	content.add_child(slider)
	return slider


func _toggle(content: VBoxContainer, key: String) -> CheckButton:
	var button := CheckButton.new()
	button.name = key
	preload("res://scripts/menu_theme.gd").style_button(button)
	button.toggled.connect(func(value: bool) -> void: _update_audio({key: value}))
	content.add_child(button)
	return button


func _update_audio(patch: Dictionary) -> void:
	var error: Error = preferences.update_audio(patch)
	error_label.text = "" if error == OK else MenuCopy.text("settings_save_error", preferences.locale)
	_refresh_audio()


func _refresh_audio(locale: String = "") -> void:
	var selected_locale: String = preferences.locale if locale.is_empty() else locale
	var settings: Dictionary = preferences.audio
	music_slider.set_value_no_signal(roundf(settings.musicVolume * 100))
	effects_slider.set_value_no_signal(roundf(settings.effectsVolume * 100))
	mute.set_pressed_no_signal(settings.muted)
	haptics.set_pressed_no_signal(settings.hapticsEnabled)
	music_label.text = "%s · %d%%" % [MenuCopy.text("music", selected_locale), music_slider.value]
	effects_label.text = "%s · %d%%" % [MenuCopy.text("effects", selected_locale), effects_slider.value]
	music_slider.tooltip_text = music_label.text
	effects_slider.tooltip_text = effects_label.text


func _unhandled_key_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		back_requested.emit()
