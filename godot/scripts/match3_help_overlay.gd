extends Control

signal closed

const UiFonts = preload("res://scripts/ui_fonts.gd")

var copy: Dictionary = {}
var assets: Dictionary = {}
var card: Panel
var scroll: ScrollContainer
var content: VBoxContainer
var compact := false


func configure(help_copy: Dictionary, gameplay_assets: Dictionary) -> void:
	copy = help_copy
	assets = gameplay_assets
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	name = "Match3HelpOverlay"
	z_index = 40
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build()
	resized.connect(_fit)
	_fit()


func set_copy(help_copy: Dictionary) -> void:
	copy = help_copy
	if is_instance_valid(content):
		_populate_content()


func _build() -> void:
	var shade := ColorRect.new()
	shade.name = "Backdrop"
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shade.color = Color("#0714279e")
	shade.mouse_filter = Control.MOUSE_FILTER_STOP
	shade.gui_input.connect(_on_backdrop_input)
	add_child(shade)

	card = Panel.new()
	card.name = "HelpCard"
	card.mouse_filter = Control.MOUSE_FILTER_STOP
	var card_style := StyleBoxFlat.new()
	card_style.bg_color = Color("#fffaf0")
	card_style.border_color = Color("#d5b269")
	card_style.set_border_width_all(3)
	card_style.border_width_left = 8
	card_style.set_corner_radius_all(7)
	card_style.shadow_color = Color("#020914c7")
	card_style.shadow_size = 22
	card_style.shadow_offset = Vector2(0, 12)
	card.add_theme_stylebox_override("panel", card_style)
	add_child(card)

	var paper := TextureRect.new()
	paper.name = "PaperGradient"
	paper.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	paper.offset_left = 8
	paper.offset_top = 3
	paper.offset_right = -3
	paper.offset_bottom = -3
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color("#fffaf0"), Color("#f5e6c9")])
	var texture := GradientTexture2D.new()
	texture.gradient = gradient
	texture.fill_from = Vector2.ZERO
	texture.fill_to = Vector2(0, 1)
	texture.width = 2
	texture.height = 64
	paper.texture = texture
	paper.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	paper.stretch_mode = TextureRect.STRETCH_SCALE
	paper.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card.add_child(paper)

	var tab := PanelContainer.new()
	tab.name = "CaseTab"
	tab.position = Vector2(12, 0)
	tab.custom_minimum_size = Vector2(72, 18)
	var tab_style := StyleBoxFlat.new()
	tab_style.bg_color = Color("#326349")
	tab_style.corner_radius_bottom_left = 4
	tab_style.corner_radius_bottom_right = 4
	tab_style.content_margin_left = 8
	tab_style.content_margin_right = 8
	tab_style.content_margin_top = 2
	tab_style.content_margin_bottom = 2
	tab.add_theme_stylebox_override("panel", tab_style)
	card.add_child(tab)
	var tab_label := _label(str(copy.get("label", "HELP")), 9, Color("#fff3cf"), 900)
	tab_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tab.add_child(tab_label)

	scroll = ScrollContainer.new()
	scroll.name = "HelpScroll"
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.mouse_filter = Control.MOUSE_FILTER_STOP
	card.add_child(scroll)
	content = VBoxContainer.new()
	content.name = "HelpContent"
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 6)
	scroll.add_child(content)
	_populate_content()


func _populate_content() -> void:
	for child in content.get_children():
		content.remove_child(child)
		child.queue_free()
	var title := _label(str(copy.get("title", "")), 24, Color("#102744"), 850, true)
	title.add_theme_constant_override("outline_size", 0)
	title.add_theme_constant_override("line_spacing", -1)
	title.add_theme_constant_override("margin_top", 7)
	content.add_child(title)
	var intro := _label(str(copy.get("intro", "")), 12, Color("#5c513e"), 700)
	intro.add_theme_constant_override("line_spacing", 2)
	content.add_child(intro)
	_add_section_heading(str(copy.get("blockersTitle", "")), true)
	for key in ["package", "foam", "lock-chain"]:
		_add_help_row(str(copy.get("blockers", {}).get(key, {}).get("title", "")),
			str(copy.get("blockers", {}).get(key, {}).get("body", "")), _blocker_texture(key), false, key)
	_add_section_heading(str(copy.get("specialsTitle", "")), false)
	var specials_intro := _label(str(copy.get("specialsIntro", "")), 11, Color("#5c513e"), 650)
	content.add_child(specials_intro)
	for key in ["flash-row", "flash-column", "evidence", "lead", "insight"]:
		_add_help_row(str(copy.get("specials", {}).get(key, {}).get("title", "")),
			str(copy.get("specials", {}).get(key, {}).get("body", "")),
			_texture_from_asset(assets.get("specials", {}).get(key, "")), true, key)
	for topic in copy.get("topics", []):
		_add_topic(topic)
	var close_hint := _label(str(copy.get("closeHint", "")), 9, Color("#74664d"), 850)
	close_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	close_hint.add_theme_constant_override("margin_top", 12)
	content.add_child(close_hint)


func _add_section_heading(text: String, is_first: bool) -> void:
	var heading := _label(text, 12, Color("#244d39"), 950)
	heading.add_theme_constant_override("margin_top", 10)
	heading.add_theme_constant_override("margin_bottom", 5 if is_first else 3)
	content.add_child(heading)
	var divider := ColorRect.new()
	divider.custom_minimum_size.y = 1
	divider.color = Color("#c5ad76")
	divider.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_child(divider)


func _add_help_row(title_text: String, body_text: String, texture: Texture2D, is_special: bool, key: String) -> void:
	var row := PanelContainer.new()
	row.name = ("Special_" if is_special else "Blocker_") + key
	row.custom_minimum_size.y = 56 if not compact else 52
	var row_style := StyleBoxFlat.new()
	row_style.bg_color = Color("#fff8e6a8")
	row_style.border_color = Color("#c5ad76")
	row_style.set_border_width_all(1)
	row_style.set_corner_radius_all(6)
	row_style.content_margin_left = 4
	row_style.content_margin_right = 7
	row_style.content_margin_top = 4
	row_style.content_margin_bottom = 4
	row.add_theme_stylebox_override("panel", row_style)
	content.add_child(row)
	var line := HBoxContainer.new()
	line.add_theme_constant_override("separation", 9)
	row.add_child(line)
	var visual := Panel.new()
	visual.custom_minimum_size = Vector2(48, 48) if not compact else Vector2(44, 44)
	var visual_style := StyleBoxFlat.new()
	visual_style.bg_color = Color("#243b58")
	visual_style.border_color = Color("#d5b269")
	visual_style.set_border_width_all(1)
	visual_style.set_corner_radius_all(4)
	if key == "package": visual_style.bg_color = Color("#55766c")
	if is_special: visual_style.bg_color = Color("#302345")
	visual.add_theme_stylebox_override("panel", visual_style)
	line.add_child(visual)
	if texture != null:
		var icon := TextureRect.new()
		icon.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		icon.offset_left = 2
		icon.offset_top = 2
		icon.offset_right = -2
		icon.offset_bottom = -2
		icon.texture = texture
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
		visual.add_child(icon)
	if key == "flash-row" or key == "flash-column":
		var marker := Label.new()
		marker.text = "↔" if key == "flash-row" else "↕"
		marker.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
		marker.offset_left = -18
		marker.offset_top = -18
		marker.add_theme_font_size_override("font_size", 12)
		marker.add_theme_color_override("font_color", Color("#fff2c7"))
		marker.add_theme_font_override("font", UiFonts.match3(900))
		marker.mouse_filter = Control.MOUSE_FILTER_IGNORE
		visual.add_child(marker)
	var text_column := VBoxContainer.new()
	text_column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	text_column.alignment = BoxContainer.ALIGNMENT_CENTER
	text_column.add_theme_constant_override("separation", 2)
	line.add_child(text_column)
	var title := _label(title_text, 11 if not compact else 10, Color("#244d39"), 950)
	text_column.add_child(title)
	var body := _label(body_text, 10 if not compact else 9, Color("#5c513e"), 650)
	body.add_theme_constant_override("line_spacing", 1)
	text_column.add_child(body)


func _add_topic(topic: Dictionary) -> void:
	var divider := ColorRect.new()
	divider.custom_minimum_size.y = 1
	divider.color = Color("#c5ad76")
	divider.mouse_filter = Control.MOUSE_FILTER_IGNORE
	content.add_child(divider)
	var heading := _label(str(topic.get("title", "")), 12 if not compact else 11, Color("#244d39"), 950)
	heading.add_theme_constant_override("margin_top", 8)
	heading.add_theme_constant_override("margin_bottom", 3)
	content.add_child(heading)
	var body := _label(str(topic.get("body", "")), 11 if not compact else 10, Color("#5c513e"), 650)
	body.add_theme_constant_override("line_spacing", 1)
	content.add_child(body)


func _label(text: String, font_size: int, color: Color, weight: int, serif: bool = false) -> Label:
	var label := Label.new()
	label.text = text
	label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	label.add_theme_font_override("font", UiFonts.serif(weight) if serif else UiFonts.sans(weight))
	return label


func _blocker_texture(key: String) -> Texture2D:
	var blocker_assets: Dictionary = assets.get("blockers", {})
	var locked_assets: Dictionary = assets.get("lockedBlockers", {})
	var path := str(blocker_assets.get("solid", "")) if key == "package" else str(blocker_assets.get("overlay", "")) if key == "foam" else str(locked_assets.get("2", ""))
	return load("res://" + path.trim_prefix("./")) as Texture2D if not path.is_empty() else null


func _texture_from_asset(value: Variant) -> Texture2D:
	var path := str(value)
	return load("res://" + path.trim_prefix("./")) as Texture2D if not path.is_empty() else null


func _fit() -> void:
	if not is_instance_valid(card) or not is_instance_valid(scroll): return
	var next_compact := size.x <= 340.0
	var compact_changed := compact != next_compact
	compact = next_compact
	var side_margin := 11.0 if compact else 14.0
	var top := 62.0 if compact else 68.0
	var max_height := minf(size.y * (0.78 if compact else 0.76), 560.0 if compact else 650.0)
	var card_width := minf(350.0, maxf(0.0, size.x - side_margin * 2.0))
	card.position = Vector2((size.x - card_width) * 0.5, top)
	card.size = Vector2(card_width, maxf(0.0, size.y - top - 12.0))
	card.size.y = minf(card.size.y, max_height)
	scroll.position = Vector2(20 if not compact else 16, 30 if not compact else 24)
	scroll.size = Vector2(maxf(0.0, card.size.x - (40 if not compact else 32)), maxf(0.0, card.size.y - (48 if not compact else 38)))
	if compact_changed and is_instance_valid(content): _populate_content()


func _on_backdrop_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_close()
	elif event is InputEventScreenTouch and event.pressed:
		_close()


func _unhandled_input(event: InputEvent) -> void:
	if visible and event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE:
		_close()
		get_viewport().set_input_as_handled()


func _close() -> void:
	visible = false
	closed.emit()
