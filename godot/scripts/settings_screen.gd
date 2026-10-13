extends PanelContainer

signal back_requested

const MenuCopy = preload("res://scripts/menu_copy.gd")

var preferences: RefCounted
var language: OptionButton
var title: Label
var language_label: Label
var help: Label
var back: Button
var error_label: Label


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
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(scroll)
	var content := VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 24)
	scroll.add_child(content)
	back = Button.new()
	back.name = "Back"
	back.custom_minimum_size.y = 49
	preload("res://scripts/menu_theme.gd").style_button(back)
	back.pressed.connect(func() -> void: back_requested.emit())
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
	error_label = Label.new()
	error_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	error_label.add_theme_color_override("font_color", Color("#ac3f59"))
	content.add_child(error_label)
	for label in [title, language_label, help]:
		label.add_theme_color_override("font_color", Color("#29243d"))
	preferences.locale_changed.connect(_refresh)
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


func _select_language(index: int) -> void:
	var error: Error = preferences.set_locale(language.get_item_metadata(index))
	error_label.text = "" if error == OK else MenuCopy.text("settings_save_error", preferences.locale)
	_refresh(preferences.locale)


func _unhandled_key_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		back_requested.emit()
