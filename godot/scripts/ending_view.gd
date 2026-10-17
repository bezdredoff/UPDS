extends Control

signal menu_requested
signal replay_requested
signal settings_requested
signal scroll_changed(value: float)

const TextBlock = preload("res://scripts/css_text_block.gd")
const Fonts = preload("res://scripts/ui_fonts.gd")
const Style = preload("res://scripts/menu_theme.gd")
var panel: PanelContainer
var eyebrow: TextBlock
var heading: TextBlock
var body: TextBlock
var summary: TextBlock
var menu_button: Button
var replay_button: Button
var settings_button: Button
var clue: TextureRect
var _content: Control
var _summary_paper: Panel
var _header: Panel
var _header_wash: ColorRect
var _case: TextBlock
var _title: TextBlock
var _settings_pressed := false
var _keyboard := false
var _scroll := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	z_index = 25
	_header = Panel.new()
	_header.name = "EndingHeader"
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color.TRANSPARENT
	_header.add_theme_stylebox_override("panel", header_style)
	_header.z_index = 5
	add_child(_header)
	_header_wash = ColorRect.new()
	_header_wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_header_wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var wash_material := ShaderMaterial.new()
	wash_material.shader = preload("res://shaders/ending_header.gdshader")
	_header_wash.material = wash_material
	_header.add_child(_header_wash)
	_case = _block(_header, "Case", Fonts.sans(950), 7, 10.0, Color("#f0d69b"))
	_case.centred = false
	_case.tracking = 0.77
	_case.css_font = "950 7px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
	_title = _block(_header, "Title", Fonts.serif(800), 11, 12.640625, Color("#fffaf0"))
	_title.centred = false
	_title.css_font = "800 11px Georgia, serif"
	settings_button = Button.new()
	settings_button.name = "Settings"
	Style.style_button(settings_button)
	settings_button.custom_minimum_size = Vector2(44, 44)
	var button_style := StyleBoxFlat.new()
	button_style.bg_color = Color("#0b2038")
	button_style.border_color = Color("#e3ca84")
	button_style.set_border_width_all(1)
	button_style.set_corner_radius_all(10)
	settings_button.add_theme_stylebox_override("normal", button_style)
	var hover := button_style.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#294a69")
	hover.border_color = Color("#ffe9ac")
	settings_button.add_theme_stylebox_override("hover", hover)
	settings_button.add_theme_stylebox_override("pressed", hover)
	_header.add_child(settings_button)
	var icon := TextureRect.new()
	icon.texture = preload("res://assets/ui/icon_settings.svg")
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	icon.offset_left = 11
	icon.offset_top = 11
	icon.offset_right = -11
	icon.offset_bottom = -11
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	icon.modulate.a = 0.98
	settings_button.add_child(icon)
	settings_button.pressed.connect(func() -> void: settings_requested.emit())
	settings_button.button_down.connect(func() -> void: _settings_pressed = true; _layout())
	settings_button.button_up.connect(func() -> void: _settings_pressed = false; _layout())
	panel = PanelContainer.new()
	panel.name = "EndingPanel"
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var paper := StyleBoxFlat.new()
	paper.bg_color = Color("#fffaf2f2")
	paper.set_corner_radius_all(14)
	paper.shadow_color = Color("#0a0c18a3")
	paper.shadow_size = 30
	paper.shadow_offset = Vector2(0, 20)
	panel.add_theme_stylebox_override("panel", paper)
	panel.z_index = 2
	add_child(panel)
	_content = Control.new()
	_content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(_content)
	clue = TextureRect.new()
	clue.name = "Clue"
	clue.mouse_filter = Control.MOUSE_FILTER_IGNORE
	clue.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	clue.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	preload("res://scripts/art_rendering.gd").configure(clue)
	_content.add_child(clue)
	eyebrow = _block(_content, "Eyebrow", Fonts.sans(900), 10, 14.0, Color("#d96279"))
	eyebrow.tracking = 1.7
	eyebrow.css_font = "900 10px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
	heading = _block(_content, "Heading", Fonts.serif(800), 38, 38.75, Color("#1f2340"))
	heading.css_font = "800 38px Georgia, serif"
	heading.shadow_colour = Color.WHITE
	heading.shadow_offset = Vector2(0, 2)
	body = _block(_content, "Copy", Fonts.serif(), 16, 23.1875, Color("#5f5866"))
	body.css_font = "400 16px Georgia, serif"
	_summary_paper = Panel.new()
	_summary_paper.name = "SummaryPaper"
	_summary_paper.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var summary_style := StyleBoxFlat.new()
	summary_style.bg_color = Color.WHITE
	summary_style.set_corner_radius_all(8)
	_summary_paper.add_theme_stylebox_override("panel", summary_style)
	_content.add_child(_summary_paper)
	summary = _block(_summary_paper, "Summary", Fonts.sans(), 13, 20.140625, Color("#29243d"))
	summary.bold_font = Fonts.sans(700)
	summary.css_font = "400 13px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
	summary.css_bold_font = "700 13px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
	menu_button = _button("Menu", true)
	replay_button = _button("Replay", false)
	menu_button.pressed.connect(func() -> void: menu_requested.emit())
	replay_button.pressed.connect(func() -> void: replay_requested.emit())
	resized.connect(_layout)
	for button in [settings_button, menu_button, replay_button]:
		button.focus_entered.connect(_reveal_focus.bind(button))
	_refresh_focus()


func update_content(copy: Dictionary, outcome: Dictionary, state: Dictionary, data: Dictionary, locale: String) -> void:
	_scroll = 0.0
	var ending: Dictionary = copy.outcomes[outcome.endingId]
	var strategy := str(state.storyChoices.get("final-strategy", "A"))
	var metrics: Dictionary = outcome.metrics
	_case.set_text(str(copy.case))
	_title.set_text(str(copy.chapterComplete))
	settings_button.tooltip_text = preload("res://scripts/menu_copy.gd").text("settings", locale)
	eyebrow.set_text(str(ending.eyebrow))
	heading.set_text(str(ending.heading))
	body.set_text(str(ending[outcome.copyKey]))
	body.font_size = 15 if OS.has_feature("web") and locale != "en" else 16
	summary.set_segments([
		{"text": str(copy.finalStrategy) + ": "}, {"text": str(copy.strategyTitles[strategy]), "bold": true},
		{"text": "\n" + str(copy.metrics) + ": "}, {"text": "%d / %d / %d" % [metrics.evidence, metrics.teamTrust, metrics.sourceTrust], "bold": true},
		{"text": "\n" + str(copy.cluesFound) + ": "}, {"text": "%d/%d" % [state.clues.size(), data.totalClues], "bold": true},
	])
	var clue_id: String = str(state.clues.back()) if not state.clues.is_empty() else str(data.defaultClueId)
	clue.texture = load("res://" + str(data.clueAssets[clue_id]).trim_prefix("./"))
	menu_button.text = str(copy.mainMenu)
	replay_button.text = str(copy.replay)
	_layout()


func _layout() -> void:
	if not is_instance_valid(panel): return
	var narrow := size.x <= 340
	var pad_x := 6.0 if narrow else 9.0
	var pad_y := 5.0 if narrow else 7.0
	_header.size = Vector2(size.x, 56 if narrow else 60)
	_header_wash.material.set_shader_parameter("header_height", _header.size.y)
	settings_button.position = Vector2(size.x - pad_x - 44, pad_y + (1 if _settings_pressed else 0))
	settings_button.size = Vector2(44, 44)
	var title_width := size.x - pad_x * 2 - 47 - (4 if narrow else 7)
	_case.position = Vector2(pad_x + 3, pad_y + 10.171875)
	_case.flow(title_width)
	_title.position = Vector2(pad_x + 3, pad_y + 21.171875)
	_title.flow(title_width)
	var width := maxf(1, size.x - 44)
	var inner := maxf(1, width - 48)
	clue.position = Vector2((width - 128) * 0.5, 19)
	clue.size = Vector2(128, 128)
	var y := 152.0
	eyebrow.position = Vector2(24, y)
	y += eyebrow.flow(inner) + 14
	heading.position = Vector2(24, y)
	y += heading.flow(inner) + 16
	body.position = Vector2(24, y)
	y += body.flow(inner) + 16
	_summary_paper.position = Vector2(24, y)
	summary.position = Vector2(13, 13)
	var summary_height: float = summary.flow(maxf(1, inner - 26)) + 26
	_summary_paper.size = Vector2(inner, summary_height)
	y += summary_height + 24
	menu_button.position = Vector2(24, y)
	menu_button.size = Vector2(inner, 49)
	y += 57
	replay_button.position = Vector2(24, y)
	replay_button.size = Vector2(inner, 49)
	y += 49 + 27
	var maximum := maxf(0, roundf((size.y + y) * 0.5) - size.y)
	_scroll = clampf(_scroll, 0, maximum)
	_header.position = Vector2(0, -_scroll)
	panel.position = Vector2(22, (size.y - y) * 0.5 - _scroll)
	panel.size = Vector2(width, y)
	scroll_changed.emit(_scroll)
	var icon: Control = settings_button.get_child(0)
	var inset := 12.5 if narrow else 11.5
	icon.offset_left = inset
	icon.offset_top = inset
	icon.offset_right = -inset
	icon.offset_bottom = -inset


func _block(parent: Node, node_name: String, face: Font, points: int, leading: float, tint: Color) -> TextBlock:
	var block := TextBlock.new()
	block.name = node_name
	block.font = face
	block.bold_font = face
	block.font_size = points
	block.line_height = leading
	block.colour = tint
	block.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(block)
	return block


func _button(node_name: String, primary: bool) -> Button:
	var button := Button.new()
	button.name = node_name
	Style.style_button(button, primary)
	if primary:
		for state in ["normal", "hover", "pressed"]:
			var surface := button.get_theme_stylebox(state).duplicate() as StyleBoxFlat
			surface.shadow_color = Color("#a93a5450")
			surface.shadow_size = 11
			surface.shadow_offset = Vector2(0, 8)
			button.add_theme_stylebox_override(state, surface)
	button.add_theme_font_override("font", Fonts.sans(850 if primary else 700))
	_content.add_child(button)
	return button


func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		_keyboard = true
	elif (event is InputEventMouseButton or event is InputEventScreenTouch) and event.pressed:
		_keyboard = false
	else:
		return
	_refresh_focus()


func _refresh_focus() -> void:
	for button in [settings_button, menu_button, replay_button]:
		var focus := StyleBoxFlat.new()
		focus.bg_color = Color.TRANSPARENT
		if _keyboard:
			focus.border_color = Color("#6fd8cf") if button == settings_button else Color.WHITE
			focus.set_border_width_all(3)
			focus.set_corner_radius_all(14)
			focus.set_expand_margin_all(5)
		button.add_theme_stylebox_override("focus", focus)


func _reveal_focus(button: Button) -> void:
	if not _keyboard or not is_visible_in_tree(): return
	var point := get_global_transform().affine_inverse() * button.get_global_position()
	var top: float = point.y
	var bottom: float = top + button.size.y
	if top >= 0 and bottom <= size.y: return
	if bottom <= 0 or top >= size.y:
		_scroll = roundf(top + _scroll + button.size.y * 0.5 - size.y * 0.5)
	elif top < 0:
		_scroll = roundf(top + _scroll)
	else:
		_scroll = roundf(bottom + _scroll - size.y)
	_layout()


func reset_scroll() -> void:
	_scroll = 0
	_layout()


func _unhandled_key_input(event: InputEvent) -> void:
	if not is_visible_in_tree() or get_viewport().gui_get_focus_owner() != null: return
	# Godot needs an initial GUI focus owner; the source begins with body focus.
	# Seed it only when the player actually starts keyboard navigation.
	if event.is_action_pressed("ui_focus_prev", false, true):
		replay_button.grab_focus()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("ui_focus_next", false, true):
		settings_button.grab_focus()
		get_viewport().set_input_as_handled()
