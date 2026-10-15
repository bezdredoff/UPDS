extends Control

signal back_requested
signal level_requested(level_id: String)
signal settings_requested

const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")
const PhoneFrame = preload("res://scripts/phone_frame.gd")

var preferences: RefCounted
var session: RefCounted
var bundle: Dictionary
var cards: VBoxContainer
var summary_panel: PanelContainer
var campaign_scroll: ScrollContainer
var title: Label
var eyebrow: Label
var summary: Label
var progress: Label
var complete: Label
var back_button: Button
var settings_button: Button


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	PhoneFrame.fit(self)
	bundle = CampaignData.load_bundle()
	var background := TextureRect.new()
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.texture = load("res://assets/backgrounds/BG_CLUBROOM_DAY.webp")
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	background.modulate.a = 0.24
	var wash := TextureRect.new()
	wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var campaign_gradient := Gradient.new()
	campaign_gradient.set_color(0, Color("#fffaf2dc"))
	campaign_gradient.add_point(0.62, Color("#eee4e8f4"))
	campaign_gradient.set_color(1, Color("#d9d7e1f8"))
	var gradient_texture := GradientTexture2D.new()
	gradient_texture.gradient = campaign_gradient
	gradient_texture.width = 1
	gradient_texture.height = 512
	gradient_texture.fill_from = Vector2(0.5, 0)
	gradient_texture.fill_to = Vector2(0.5, 1)
	wash.texture = gradient_texture
	wash.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	wash.stretch_mode = TextureRect.STRETCH_SCALE
	wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(wash)
	var header_panel := PanelContainer.new()
	header_panel.anchor_right = 1
	# The shared web header's 44 px controls plus 7 px vertical padding and
	# 2 px border occupy 60 px at the reference viewport.
	header_panel.offset_bottom = 60
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color("#17304df8")
	header_style.border_color = Color("#d3b068")
	header_style.border_width_bottom = 2
	header_style.shadow_color = Color("#0b142b59")
	header_style.shadow_size = 8
	header_style.shadow_offset = Vector2(0, 4)
	header_style.content_margin_left = 9
	header_style.content_margin_right = 9
	header_style.content_margin_top = 7
	header_style.content_margin_bottom = 7
	header_panel.add_theme_stylebox_override("panel", header_style)
	add_child(header_panel)
	var nav := HBoxContainer.new()
	nav.add_theme_constant_override("separation", 7)
	header_panel.add_child(nav)
	back_button = _header_icon_button(nav, "back", MenuCopy.text("back", preferences.locale))
	back_button.add_theme_stylebox_override("normal", _header_button_style(Color("#283750")))
	back_button.pressed.connect(func() -> void: back_requested.emit())
	var heading := VBoxContainer.new()
	heading.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	heading.alignment = BoxContainer.ALIGNMENT_CENTER
	nav.add_child(heading)
	eyebrow = _label(heading, 7, Color("#f0d69b"))
	eyebrow.add_theme_font_size_override("font_size", 7)
	title = _label(heading, 11, Color("#fffaf0"))
	title.add_theme_font_override("font", _serif_font(800))
	settings_button = _header_icon_button(nav, "settings", MenuCopy.text("settings", preferences.locale))
	settings_button.pressed.connect(func() -> void: settings_requested.emit())
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.offset_top = 60
	for side in ["left", "right"]:
		margin.add_theme_constant_override("margin_" + side, 14)
	margin.add_theme_constant_override("margin_top", 14)
	margin.add_theme_constant_override("margin_bottom", 22)
	add_child(margin)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 12)
	margin.add_child(content)
	summary_panel = PanelContainer.new()
	var summary_style := StyleBoxFlat.new()
	summary_style.bg_color = Color("#fff9e9e8")
	summary_style.border_color = Color("#cdbf9f")
	summary_style.set_border_width_all(1)
	summary_style.set_corner_radius_all(12)
	summary_style.content_margin_left = 14
	summary_style.content_margin_right = 14
	summary_style.content_margin_top = 14
	summary_style.content_margin_bottom = 14
	summary_style.shadow_color = Color("#1b203624")
	summary_style.shadow_size = 12
	summary_style.shadow_offset = Vector2(0, 5)
	summary_panel.add_theme_stylebox_override("panel", summary_style)
	content.add_child(summary_panel)
	var summary_content := VBoxContainer.new()
	summary_content.add_theme_constant_override("separation", 6)
	summary_panel.add_child(summary_content)
	summary = _label(summary_content, 11, Color("#675d68"))
	summary.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	progress = _label(summary_content, 12, Color("#29243d"))
	progress.add_theme_font_override("font", _serif_font(800))
	complete = _label(summary_content, 8, Color("#32716d"))
	complete.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	campaign_scroll = ScrollContainer.new()
	campaign_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	campaign_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	# The source browser hides its platform scrollbar and gives the full content
	# width to cards. Godot's visible scrollbar otherwise steals 8 px at 430 px.
	campaign_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	content.add_child(campaign_scroll)
	cards = VBoxContainer.new()
	cards.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cards.add_theme_constant_override("separation", 9)
	campaign_scroll.add_child(cards)
	preferences.locale_changed.connect(func(_locale: String) -> void: refresh_screen())
	refresh_screen()


func refresh_screen() -> void:
	if bundle.is_empty() or session == null or preferences == null:
		return
	session.reload()
	var locale: String = preferences.locale
	var copy: Dictionary = bundle.campaignLocalized.get(locale, bundle.campaignLocalized.en)
	eyebrow.text = str(copy.eyebrow)
	title.text = str(copy.title)
	summary.text = str(copy.summary)
	back_button.tooltip_text = str(copy.back)
	settings_button.tooltip_text = MenuCopy.text("settings", locale)
	var levels: Array = bundle.levels
	var completed: Array = session.save.completed
	progress.text = _format(str(copy.progress), {"completed": completed.size(), "total": levels.size()})
	var campaign_complete := completed.size() == levels.size()
	complete.text = str(copy.complete) if campaign_complete else ""
	# Empty Labels still contribute a line-height to their VBoxContainer. The
	# web view omits this status until all levels are complete.
	complete.visible = campaign_complete
	for child in cards.get_children():
		cards.remove_child(child)
		child.queue_free()
	for index in levels.size():
		var level: Dictionary = levels[index]
		var level_id := str(level.id)
		var unlocked := index == 0 or completed.has(str(levels[index - 1].id))
		var done := completed.has(level_id)
		var presentation: Dictionary = bundle.levelPresentations[level_id].localized.get(locale, bundle.levelPresentations[level_id].localized.en)
		var card := PanelContainer.new()
		var panel := StyleBoxFlat.new()
		panel.bg_color = Color("#f7fbf0ef") if done else Color("#f3f0f3") if not unlocked else Color("#fffdf8ef")
		panel.border_color = Color("#9db5a0") if done else Color("#b8b1bc") if not unlocked else Color("#d7cad1")
		panel.set_border_width_all(1)
		panel.set_corner_radius_all(12)
		panel.content_margin_left = 11
		panel.content_margin_right = 11
		panel.content_margin_top = 11
		panel.content_margin_bottom = 11
		panel.shadow_color = Color("#1b203619")
		panel.shadow_size = 8
		panel.shadow_offset = Vector2(0, 4)
		card.add_theme_stylebox_override("panel", panel)
		cards.add_child(card)
		var card_content := VBoxContainer.new()
		card_content.add_theme_constant_override("separation", 7)
		card.add_child(card_content)
		var card_heading := HBoxContainer.new()
		card_heading.add_theme_constant_override("separation", 8)
		card_content.add_child(card_heading)
		var short_id := _label(card_heading, 8, Color("#d96279"))
		short_id.text = str(level.shortId) if unlocked else "—"
		short_id.add_theme_font_size_override("font_size", 8)
		var heading := _label(card_heading, 16, Color("#29243d"))
		heading.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		heading.text = str(presentation.title) if unlocked else str(copy.locked)
		heading.add_theme_font_size_override("font_size", 16)
		heading.add_theme_font_override("font", _serif_font(800))
		var detail := _label(card_content, 10, Color("#675d68"))
		detail.text = str(presentation.storyAction) if unlocked else ""
		detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		# The source campaign copy uses 10px/1.35; tighten Godot's taller default
		# multiline line boxes so two-line descriptions don't stretch the cards.
		detail.add_theme_constant_override("line_spacing", -1)
		var attempts := int(session.save.attempts.get(level_id, 0))
		var status := str(copy.locked) if not unlocked else str(copy.completed) if done else str(copy.available)
		var meta := HFlowContainer.new()
		meta.add_theme_constant_override("h_separation", 5)
		meta.add_theme_constant_override("v_separation", 5)
		card_content.add_child(meta)
		_add_meta_chip(meta, status, not unlocked)
		_add_meta_chip(meta, _format(str(copy.attempts), {"count": attempts}), not unlocked)
		if session.save.bestMovesLeft.has(level_id):
			_add_meta_chip(meta, _format(str(copy.best), {"moves": int(session.save.bestMovesLeft[level_id])}), false)
		var play := _button(card_content)
		play.text = str(copy.replay) if done else str(copy.play)
		play.disabled = not unlocked
		play.custom_minimum_size.y = 44
		play.add_theme_font_size_override("font_size", 10)
		var play_style := _campaign_button_style()
		play.add_theme_stylebox_override("normal", play_style)
		if not unlocked:
			play_style.bg_color = Color("#e4dfe4")
			play_style.border_color = Color("#c2bac3")
			play.add_theme_stylebox_override("normal", play_style)
		elif not done:
			play_style.bg_color = Color("#d96279")
			play_style.border_color = Color("#d96279")
			play.add_theme_color_override("font_color", Color.WHITE)
			play.add_theme_color_override("font_hover_color", Color.WHITE)
			play.add_theme_color_override("font_pressed_color", Color.WHITE)
			play.add_theme_stylebox_override("normal", play_style)
		var play_hover := play_style.duplicate() as StyleBoxFlat
		play_hover.bg_color = Color("#f1e8e8")
		play.add_theme_stylebox_override("hover", play_hover)
		play.pressed.connect(func() -> void:
			if unlocked:
				level_requested.emit(level_id)
		)


func _format(template: String, values: Dictionary) -> String:
	var result := template
	for key in values:
		result = result.replace("{" + str(key) + "}", str(values[key]))
	return result


func _label(parent: Node, font_size: int, color: Color) -> Label:
	var label := Label.new()
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	parent.add_child(label)
	return label


func _add_meta_chip(parent: Node, value: String, is_locked: bool) -> void:
	var chip_panel := PanelContainer.new()
	var chip_style := StyleBoxFlat.new()
	chip_style.bg_color = Color("#ded9df") if is_locked else Color("#eee7e5")
	chip_style.set_corner_radius_all(999)
	chip_style.content_margin_left = 6
	chip_style.content_margin_right = 6
	chip_style.content_margin_top = 3
	chip_style.content_margin_bottom = 3
	chip_panel.add_theme_stylebox_override("panel", chip_style)
	parent.add_child(chip_panel)
	var chip_label := Label.new()
	chip_label.text = value
	chip_label.add_theme_font_size_override("font_size", 7)
	chip_label.add_theme_color_override("font_color", Color("#4f4955") if is_locked else Color("#675d68"))
	chip_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	chip_panel.add_child(chip_label)


func _button(parent: Node) -> Button:
	var button := Button.new()
	button.name = "Play"
	Style.style_button(button)
	parent.add_child(button)
	return button


func _serif_font(weight: int) -> SystemFont:
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Georgia", "serif"])
	font.font_weight = weight
	return font


func _header_icon_button(parent: Node, icon_name: String, tooltip: String) -> Button:
	var button := Button.new()
	button.custom_minimum_size = Vector2(44, 44)
	button.tooltip_text = tooltip
	button.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	button.add_theme_stylebox_override("normal", _header_button_style(Color("#0b2038")))
	button.add_theme_stylebox_override("hover", _header_button_style(Color("#294a69")))
	var icon := TextureRect.new()
	icon.texture = load("res://assets/ui/icon_%s.svg" % icon_name)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.custom_minimum_size = Vector2(21, 21)
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	button.add_child(icon)
	parent.add_child(button)
	return button


func _header_button_style(color: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = Color("#e3ca84")
	style.set_border_width_all(1)
	style.set_corner_radius_all(10)
	style.shadow_color = Color("#050b1c61")
	style.shadow_size = 4
	style.shadow_offset = Vector2(0, 2)
	return style


func _campaign_button_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#fffdf8")
	style.border_color = Color("#cbbd9f")
	style.set_border_width_all(1)
	style.set_corner_radius_all(9)
	style.content_margin_left = 10
	style.content_margin_right = 10
	return style
