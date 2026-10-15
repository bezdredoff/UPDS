extends PanelContainer

signal back_requested

const MenuCopy = preload("res://scripts/menu_copy.gd")
const PhoneFrame = preload("res://scripts/phone_frame.gd")
const UiFonts = preload("res://scripts/ui_fonts.gd")

var preferences: RefCounted
var audio_runtime: Node
var language: OptionButton
var title: Label
var language_label: Label
var help: Label
var back: Button
var error_label: Label
var audio_title: Label
var audio_copy: Label
var music_label: Label
var music_value: Label
var effects_label: Label
var effects_value: Label
var music_slider: HSlider
var effects_slider: HSlider
var mute: Button
var haptics: Button
var mute_switch: Label
var haptics_switch: Label
var mute_help: Label
var haptics_help: Label
var mobile_note_title: Label
var mobile_note_copy: Label
var capability: Label
var preview_music: Button
var preview_effects: Button


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	PhoneFrame.fit(self)
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color("#fffaf2"), Color("#f0e7e5")])
	gradient.offsets = PackedFloat32Array([0.0, 1.0])
	var gradient_texture := GradientTexture2D.new()
	gradient_texture.gradient = gradient
	gradient_texture.width = 1
	gradient_texture.height = 256
	gradient_texture.fill_from = Vector2.ZERO
	gradient_texture.fill_to = Vector2(0, 1)
	var background := StyleBoxTexture.new()
	background.texture = gradient_texture
	background.content_margin_top = 0
	background.content_margin_bottom = 30
	add_theme_stylebox_override("panel", background)
	var scroll := ScrollContainer.new()
	scroll.name = "Scroll"
	scroll.follow_focus = true
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(scroll)
	var content := VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 8)
	scroll.add_child(content)
	_build_header(content)
	var body := MarginContainer.new()
	body.name = "Body"
	body.add_theme_constant_override("margin_left", 20)
	body.add_theme_constant_override("margin_right", 20)
	body.add_theme_constant_override("margin_top", 8)
	content.add_child(body)
	var body_content := VBoxContainer.new()
	body_content.add_theme_constant_override("separation", 8)
	body.add_child(body_content)
	content = body_content
	var language_heading := _section_heading(content)
	language_heading.text = MenuCopy.text("language", preferences.locale)
	language_label = _label(content, 700, 14)
	var language_card := _card(content, "LanguageCard", 14, 12)
	language_card.add_theme_constant_override("separation", 8)
	var language_content := VBoxContainer.new()
	language_content.add_theme_constant_override("separation", 8)
	language_card.add_child(language_content)
	help = _label(language_content, 400, 11)
	help.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	language = OptionButton.new()
	language.name = "Language"
	language.custom_minimum_size.y = 42
	_style_select(language)
	language.add_item("Русский")
	language.set_item_metadata(0, "ru")
	language.add_item("Беларуская")
	language.set_item_metadata(1, "be")
	language.add_item("English")
	language.set_item_metadata(2, "en")
	language.item_selected.connect(_select_language)
	language_content.add_child(language)
	var audio_heading := _section_heading(content)
	audio_heading.text = ""
	audio_title = audio_heading
	audio_copy = _label(content, 400, 13)
	audio_copy.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	var audio_group := VBoxContainer.new()
	audio_group.name = "AudioSettings"
	audio_group.add_theme_constant_override("separation", 10)
	content.add_child(audio_group)
	var music_card := _card(audio_group, "MusicVolumeCard", 11, 12)
	_build_volume_row(music_card, "musicVolume", true)
	var effects_card := _card(audio_group, "EffectsVolumeCard", 11, 12)
	_build_volume_row(effects_card, "effectsVolume", false)
	var toggles := HBoxContainer.new()
	toggles.name = "AudioToggles"
	toggles.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	toggles.add_theme_constant_override("separation", 8)
	audio_group.add_child(toggles)
	var mute_card := _card(toggles, "MuteCard", 10, 9)
	var mute_row := HBoxContainer.new()
	mute_row.add_theme_constant_override("separation", 4)
	mute_card.add_child(mute_row)
	var mute_copy := VBoxContainer.new()
	mute_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	mute_copy.add_theme_constant_override("separation", 2)
	mute_row.add_child(mute_copy)
	mute = _toggle(mute_copy, "muted")
	mute_help = _label(mute_copy, 400, 9)
	mute_help.name = "MuteHelp"
	mute_switch = _switch_chip(mute_row)
	mute_switch.name = "MuteSwitch"
	var haptics_card := _card(toggles, "HapticsCard", 10, 9)
	var haptics_row := HBoxContainer.new()
	haptics_row.add_theme_constant_override("separation", 4)
	haptics_card.add_child(haptics_row)
	var haptics_copy := VBoxContainer.new()
	haptics_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	haptics_copy.add_theme_constant_override("separation", 2)
	haptics_row.add_child(haptics_copy)
	haptics = _toggle(haptics_copy, "hapticsEnabled")
	haptics_help = _label(haptics_copy, 400, 9)
	haptics_help.name = "HapticsCapability"
	haptics_help.text = MenuCopy.text("haptics_short", preferences.locale)
	haptics_switch = _switch_chip(haptics_row)
	haptics_switch.name = "HapticsSwitch"
	var previews := HBoxContainer.new()
	previews.name = "AudioPreviewActions"
	previews.add_theme_constant_override("separation", 8)
	audio_group.add_child(previews)
	preview_music = _preview_button(previews, "PreviewMusic", "preview_music")
	preview_effects = _preview_button(previews, "PreviewEffects", "preview_effects")
	capability = _label(content, 400, 9)
	capability.name = "AudioCapability"
	capability.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	var mobile_note := _card(content, "MobileContract", 7, 12)
	var mobile_note_content := VBoxContainer.new()
	mobile_note_content.add_theme_constant_override("separation", 4)
	mobile_note.add_child(mobile_note_content)
	mobile_note_title = _label(mobile_note_content, 800, 11)
	mobile_note_title.name = "MobileContractTitle"
	mobile_note_copy = _label(mobile_note_content, 400, 10)
	mobile_note_copy.name = "MobileContractCopy"
	mobile_note_copy.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	error_label = _label(content, 700, 12)
	error_label.add_theme_color_override("font_color", Color("#ac3f59"))
	preferences.locale_changed.connect(_refresh)
	preferences.audio_changed.connect(_refresh_audio)
	_refresh(preferences.locale)
	back.grab_focus()


func _build_header(content: VBoxContainer) -> void:
	var header := PanelContainer.new()
	header.name = "PanelHeader"
	header.custom_minimum_size.y = 58
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#17304d")
	style.border_color = Color("#d3b068")
	style.border_width_bottom = 2
	style.set_corner_radius_all(14)
	style.shadow_color = Color("#0b142b59")
	style.shadow_size = 7
	style.shadow_offset = Vector2(0, 4)
	style.content_margin_left = 8
	style.content_margin_right = 8
	header.add_theme_stylebox_override("panel", style)
	content.add_child(header)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 7)
	header.add_child(row)
	back = Button.new()
	back.name = "Back"
	back.custom_minimum_size = Vector2(44, 44)
	back.text = "←"
	back.add_theme_font_size_override("font_size", 22)
	back.add_theme_font_override("font", UiFonts.serif(700))
	back.add_theme_color_override("font_color", Color("#fffaf0"))
	var back_style := StyleBoxFlat.new()
	back_style.bg_color = Color("#ffffff0a")
	back_style.border_color = Color("#c7ad75")
	back_style.set_border_width_all(1)
	back_style.set_corner_radius_all(9)
	back.add_theme_stylebox_override("normal", back_style)
	back.add_theme_stylebox_override("hover", back_style)
	back.add_theme_stylebox_override("pressed", back_style)
	back.pressed.connect(func() -> void:
		audio_runtime.play_effect()
		back_requested.emit())
	row.add_child(back)
	var title_box := VBoxContainer.new()
	title_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_box.alignment = BoxContainer.ALIGNMENT_CENTER
	title_box.add_theme_constant_override("separation", 0)
	row.add_child(title_box)
	var eyebrow := _label(title_box, 900, 7)
	eyebrow.name = "Eyebrow"
	eyebrow.add_theme_color_override("font_color", Color("#f0d69b"))
	eyebrow.text = "CONFIG · SYSTEM"
	title = _label(title_box, 800, 11)
	title.name = "Title"
	title.add_theme_font_override("font", UiFonts.serif(800))
	title.add_theme_color_override("font_color", Color("#fffaf0"))


func _section_heading(parent: Control) -> Label:
	var heading := _label(parent, 800, 31)
	heading.add_theme_font_override("font", UiFonts.serif(800))
	heading.add_theme_color_override("font_color", Color("#29243d"))
	heading.add_theme_constant_override("outline_size", 0)
	heading.custom_minimum_size.y = 42
	return heading


func _label(parent: Control, weight: int, font_size: int) -> Label:
	var label := Label.new()
	label.add_theme_font_override("font", UiFonts.sans(weight))
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", Color("#494453"))
	parent.add_child(label)
	return label


func _card(parent: Control, node_name: String, radius: int, inset: int) -> PanelContainer:
	var card := PanelContainer.new()
	card.name = node_name
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#fffdf7")
	style.border_color = Color("#d8cfd6")
	style.set_border_width_all(1)
	style.set_corner_radius_all(radius)
	style.content_margin_left = inset
	style.content_margin_right = inset
	style.content_margin_top = inset
	style.content_margin_bottom = inset
	card.add_theme_stylebox_override("panel", style)
	parent.add_child(card)
	return card


func _build_volume_row(card: PanelContainer, key: String, is_music: bool) -> void:
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 8)
	card.add_child(column)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	column.add_child(row)
	var name_label := _label(row, 700, 12)
	name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	if is_music:
		music_label = name_label
	else:
		effects_label = name_label
	var value_label := _label(row, 900, 11)
	value_label.add_theme_color_override("font_color", Color("#4caaa1"))
	if is_music:
		music_value = value_label
	else:
		effects_value = value_label
	var slider := HSlider.new()
	slider.name = key
	slider.custom_minimum_size.y = 20
	slider.max_value = 100
	slider.step = 1
	var track := StyleBoxFlat.new()
	track.bg_color = Color("#3c3c3c")
	track.set_corner_radius_all(5)
	track.content_margin_top = 2
	track.content_margin_bottom = 2
	slider.add_theme_stylebox_override("slider", track)
	var grabber := StyleBoxFlat.new()
	grabber.bg_color = Color("#36a89d")
	grabber.set_corner_radius_all(999)
	grabber.content_margin_left = 7
	grabber.content_margin_right = 7
	grabber.content_margin_top = 7
	grabber.content_margin_bottom = 7
	var active_track := track.duplicate() as StyleBoxFlat
	active_track.bg_color = Color("#36a89d")
	slider.add_theme_stylebox_override("grabber_area", active_track)
	slider.add_theme_stylebox_override("grabber_area_highlight", active_track)
	slider.add_theme_stylebox_override("grabber", grabber)
	slider.add_theme_stylebox_override("grabber_highlight", grabber)
	slider.value_changed.connect(func(value: float) -> void: _update_audio({key: value / 100.0}))
	column.add_child(slider)
	if is_music:
		music_slider = slider
	else:
		effects_slider = slider


func _toggle(parent: Control, key: String) -> Button:
	var button := Button.new()
	button.name = key
	button.toggle_mode = true
	button.custom_minimum_size.y = 22
	button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	button.add_theme_font_override("font", UiFonts.sans(700))
	button.add_theme_font_size_override("font_size", 11)
	button.add_theme_color_override("font_color", Color("#29243d"))
	button.add_theme_color_override("font_hover_color", Color("#29243d"))
	button.add_theme_color_override("font_pressed_color", Color("#29243d"))
	button.add_theme_color_override("font_focus_color", Color("#29243d"))
	var flat := StyleBoxFlat.new()
	flat.bg_color = Color.TRANSPARENT
	flat.content_margin_left = 0
	flat.content_margin_right = 0
	flat.content_margin_top = 0
	flat.content_margin_bottom = 0
	button.add_theme_stylebox_override("normal", flat)
	button.add_theme_stylebox_override("hover", flat)
	button.add_theme_stylebox_override("pressed", flat)
	button.toggled.connect(func(value: bool) -> void: _update_audio({key: value}))
	parent.add_child(button)
	return button


func _switch_chip(parent: Control) -> Label:
	var chip := _label(parent, 900, 8)
	chip.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	chip.custom_minimum_size.x = 34
	return chip


func _preview_button(parent: Control, node_name: String, key: String) -> Button:
	var button := Button.new()
	button.name = node_name
	button.custom_minimum_size.y = 44
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_font_override("font", UiFonts.sans(800))
	button.add_theme_font_size_override("font_size", 10)
	button.add_theme_color_override("font_color", Color("#29243d"))
	var style := StyleBoxFlat.new()
	style.bg_color = Color.WHITE
	style.border_color = Color("#cfc3cb")
	style.set_border_width_all(1)
	style.set_corner_radius_all(9)
	button.add_theme_stylebox_override("normal", style)
	button.add_theme_stylebox_override("hover", style)
	button.add_theme_stylebox_override("pressed", style)
	button.pressed.connect(audio_runtime.preview_music if key == "preview_music" else audio_runtime.preview_effects)
	parent.add_child(button)
	return button


func _style_select(button: OptionButton) -> void:
	button.add_theme_font_override("font", UiFonts.sans(400))
	button.add_theme_color_override("font_color", Color("#494453"))
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#fffdf7")
	style.border_color = Color("#d8cfd6")
	style.set_border_width_all(1)
	style.set_corner_radius_all(10)
	style.content_margin_left = 12
	button.add_theme_stylebox_override("normal", style)
	button.add_theme_stylebox_override("hover", style)
	button.add_theme_stylebox_override("pressed", style)


func _refresh(locale: String) -> void:
	title.text = MenuCopy.text("settings", locale)
	language_label.text = MenuCopy.text("language", locale)
	back.tooltip_text = MenuCopy.text("back", locale)
	help.text = MenuCopy.text("language_help", locale)
	language.tooltip_text = MenuCopy.text("language", locale)
	for index in language.item_count:
		if language.get_item_metadata(index) == locale:
			language.select(index)
	audio_title.text = MenuCopy.text("audio_title", locale)
	audio_copy.text = MenuCopy.text("audio_copy", locale)
	capability.text = "%s: %s · %s" % [MenuCopy.text("web_audio", locale), MenuCopy.text("available", locale), MenuCopy.text("haptics_available" if audio_runtime.haptics_supported else "haptics_unavailable", locale)]
	mute.text = MenuCopy.text("mute", locale)
	haptics.text = MenuCopy.text("haptics", locale)
	mute_help.text = MenuCopy.text("toggle_on" if preferences.audio.muted else "toggle_off", locale)
	mute_switch.text = MenuCopy.text("vn_on" if preferences.audio.muted else "vn_off", locale)
	haptics_help.text = MenuCopy.text("haptics_short", locale)
	haptics_switch.text = MenuCopy.text("vn_on" if preferences.audio.hapticsEnabled else "vn_off", locale)
	mobile_note_title.text = MenuCopy.text("mobile_contract_title", locale)
	mobile_note_copy.text = MenuCopy.text("mobile_contract_copy", locale)
	preview_music.text = MenuCopy.text("preview_music", locale)
	preview_effects.text = MenuCopy.text("preview_effects", locale)
	_refresh_audio(locale)


func _select_language(index: int) -> void:
	var error: Error = preferences.set_locale(language.get_item_metadata(index))
	error_label.text = "" if error == OK else MenuCopy.text("settings_save_error", preferences.locale)
	_refresh(preferences.locale)


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
	music_label.text = MenuCopy.text("music", selected_locale)
	music_value.text = "%d%%" % music_slider.value
	effects_label.text = MenuCopy.text("effects", selected_locale)
	effects_value.text = "%d%%" % effects_slider.value
	music_slider.tooltip_text = "%s · %s" % [music_label.text, music_value.text]
	effects_slider.tooltip_text = "%s · %s" % [effects_label.text, effects_value.text]
	mute_help.text = MenuCopy.text("toggle_on" if settings.muted else "toggle_off", selected_locale)
	mute_switch.text = MenuCopy.text("vn_on" if settings.muted else "vn_off", selected_locale)
	haptics_help.text = MenuCopy.text("haptics_short", selected_locale)
	haptics_switch.text = MenuCopy.text("vn_on" if settings.hapticsEnabled else "vn_off", selected_locale)


func _unhandled_key_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		back_requested.emit()
