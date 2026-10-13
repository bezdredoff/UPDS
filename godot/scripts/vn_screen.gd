extends Control

signal menu_requested
signal settings_requested
signal continuation_requested(scene_id: String)

const Prologue = preload("res://data/prologue.json")
const Copy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")

var session: RefCounted
var preferences: RefCounted
var audio_runtime: Node
var stage: Control
var title: Label
var speaker: Label
var emotion: Label
var dialogue: RichTextLabel
var progress: Label
var warning: Label
var boundary: Label
var menu_button: Button
var settings_button: Button
var next_button: Button
var _boundary := false
var _last_advance := -1000


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var background := TextureRect.new()
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.texture = load("res://" + str(Prologue.data.background).trim_prefix("./"))
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	stage = Control.new()
	stage.name = "Stage"
	stage.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stage.anchor_top = 0.12
	stage.anchor_bottom = 0.60
	stage.clip_contents = true
	stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(stage)
	var header := HBoxContainer.new()
	header.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	header.offset_left = 12
	header.offset_right = -12
	header.offset_top = 12
	header.add_theme_constant_override("separation", 10)
	add_child(header)
	menu_button = _button(header)
	menu_button.pressed.connect(func() -> void: menu_requested.emit())
	title = _label(header, 17)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	settings_button = _button(header)
	settings_button.pressed.connect(func() -> void: settings_requested.emit())
	var panel := PanelContainer.new()
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	panel.anchor_top = 0.60
	panel.offset_left = 12
	panel.offset_right = -12
	panel.offset_bottom = -12
	var paper := StyleBoxFlat.new()
	paper.bg_color = Color("#fffdf8")
	paper.set_corner_radius_all(12)
	paper.content_margin_left = 16
	paper.content_margin_right = 16
	paper.content_margin_top = 12
	paper.content_margin_bottom = 12
	panel.add_theme_stylebox_override("panel", paper)
	add_child(panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 6)
	panel.add_child(content)
	speaker = _label(content, 18)
	emotion = _label(content, 12)
	dialogue = RichTextLabel.new()
	dialogue.name = "Dialogue"
	dialogue.add_theme_color_override("default_color", Color("#29243d"))
	dialogue.add_theme_font_size_override("normal_font_size", 19)
	dialogue.size_flags_vertical = Control.SIZE_EXPAND_FILL
	dialogue.selection_enabled = true
	dialogue.scroll_active = true
	content.add_child(dialogue)
	warning = _label(content, 13)
	warning.add_theme_color_override("font_color", Color("#ac3f59"))
	boundary = _label(content, 13)
	var footer := HBoxContainer.new()
	content.add_child(footer)
	progress = _label(footer, 13)
	progress.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	next_button = _button(footer)
	next_button.pressed.connect(_next)
	session.changed.connect(_refresh)
	preferences.locale_changed.connect(func(_locale: String) -> void: _refresh())
	_refresh()
	next_button.grab_focus()


func _refresh() -> void:
	var line: Dictionary = session.current_line()
	if line.is_empty():
		return
	var locale: String = preferences.locale
	var copy: Dictionary = line.localized[locale]
	title.text = Prologue.data.titles[locale]
	speaker.text = copy.speaker
	emotion.text = copy.emotion
	dialogue.text = copy.text
	dialogue.scroll_to_line(0)
	progress.text = "%d / %d" % [int(session.state.line) + 1, Prologue.data.lines.size()]
	menu_button.text = Copy.text("vn_menu", locale)
	settings_button.text = Copy.text("settings", locale)
	next_button.text = Copy.text("vn_next", locale)
	next_button.disabled = _boundary
	warning.text = "" if session.last_write_ok else Copy.text("story_save_error", locale)
	warning.visible = not session.last_write_ok
	boundary.text = Copy.text("prologue_boundary", locale)
	boundary.visible = _boundary
	for child in stage.get_children():
		stage.remove_child(child)
		child.queue_free()
	for actor in line.actors:
		var portrait := TextureRect.new()
		portrait.name = actor.character
		portrait.texture = load("res://" + str(actor.asset).trim_prefix("./"))
		portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
		portrait.z_index = int(actor.z)
		var height: float = float(actor.height) * float(actor.scale) / 100.0
		portrait.anchor_left = float(actor.x) / 100.0
		portrait.anchor_right = portrait.anchor_left
		portrait.anchor_top = (float(actor.top) + float(actor.y)) / 100.0
		portrait.anchor_bottom = portrait.anchor_top + height
		# Full precomposed master canvas is 1024x1536, centered on its lane.
		stage.add_child(portrait)
		portrait.resized.connect(func() -> void: _portrait_width(portrait))
		_portrait_width(portrait)


func _portrait_width(portrait: TextureRect) -> void:
	var width := portrait.size.y * 1024.0 / 1536.0
	portrait.offset_left = -width / 2.0
	portrait.offset_right = width / 2.0


func _next() -> void:
	if _boundary or Time.get_ticks_msec() - _last_advance < 120:
		return
	_last_advance = Time.get_ticks_msec()
	audio_runtime.play_effect("vnAdvance")
	if not session.advance():
		_boundary = true
		_refresh()
		continuation_requested.emit(Prologue.data.nextSceneId)
		menu_button.grab_focus()


func _label(parent: Node, font_size: int) -> Label:
	var label := Label.new()
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", Color("#29243d"))
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	parent.add_child(label)
	return label


func _button(parent: Node) -> Button:
	var button := Button.new()
	Style.style_button(button)
	parent.add_child(button)
	return button


func _unhandled_key_input(event: InputEvent) -> void:
	if not is_visible_in_tree() or event.is_echo():
		return
	if event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		menu_requested.emit()
	elif event.is_action_pressed("ui_accept"):
		get_viewport().set_input_as_handled()
		_next()
