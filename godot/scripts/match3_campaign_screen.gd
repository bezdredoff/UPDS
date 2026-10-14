extends Control

signal back_requested
signal level_requested(level_id: String)

const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")

var preferences: RefCounted
var session: RefCounted
var bundle: Dictionary
var cards: VBoxContainer
var title: Label
var eyebrow: Label
var summary: Label
var progress: Label
var complete: Label
var back_button: Button


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bundle = CampaignData.load_bundle()
	var background := TextureRect.new()
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.texture = load("res://assets/backgrounds/BG_CLUBROOM_DAY.webp")
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	var wash := ColorRect.new()
	wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	wash.color = Color(0.08, 0.11, 0.17, 0.76)
	wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(wash)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_" + side, 12)
	add_child(margin)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 8)
	margin.add_child(content)
	var header := HBoxContainer.new()
	content.add_child(header)
	back_button = _button(header)
	back_button.pressed.connect(func() -> void: back_requested.emit())
	var heading := VBoxContainer.new()
	heading.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(heading)
	eyebrow = _label(heading, 11, Color("#ffe0a1"))
	title = _label(heading, 20, Color.WHITE)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var spacer := Control.new()
	spacer.custom_minimum_size.x = 72
	header.add_child(spacer)
	summary = _label(content, 13, Color.WHITE)
	summary.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	progress = _label(content, 14, Color("#ffe0a1"))
	complete = _label(content, 12, Color("#aaf0c5"))
	complete.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	content.add_child(scroll)
	cards = VBoxContainer.new()
	cards.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cards.add_theme_constant_override("separation", 7)
	scroll.add_child(cards)
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
	back_button.text = str(copy.back)
	var levels: Array = bundle.levels
	var completed: Array = session.save.completed
	progress.text = _format(str(copy.progress), {"completed": completed.size(), "total": levels.size()})
	complete.text = str(copy.complete) if completed.size() == levels.size() else ""
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
		panel.bg_color = Color(0.99, 0.98, 0.94, 0.96) if unlocked else Color(0.75, 0.74, 0.72, 0.84)
		panel.set_corner_radius_all(9)
		panel.content_margin_left = 10
		panel.content_margin_right = 10
		panel.content_margin_top = 7
		panel.content_margin_bottom = 7
		card.add_theme_stylebox_override("panel", panel)
		cards.add_child(card)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		card.add_child(row)
		var description := VBoxContainer.new()
		description.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(description)
		var heading := _label(description, 14, Color("#a24762") if unlocked else Color("#5e5a64"))
		heading.text = "%s · %s" % [str(level.shortId) if unlocked else "—", str(presentation.title) if unlocked else str(copy.locked)]
		var detail := _label(description, 11, Color("#29243d"))
		detail.text = str(presentation.storyAction) if unlocked else str(copy.locked)
		detail.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		var attempts := int(session.save.attempts.get(level_id, 0))
		var status := str(copy.locked) if not unlocked else str(copy.completed) if done else str(copy.available)
		var meta := _label(description, 10, Color("#5e5a64"))
		meta.text = "%s · %s" % [status, _format(str(copy.attempts), {"count": attempts})]
		if session.save.bestMovesLeft.has(level_id):
			meta.text += " · " + _format(str(copy.best), {"moves": int(session.save.bestMovesLeft[level_id])})
		var play := _button(row)
		play.text = str(copy.replay) if done else str(copy.play)
		play.disabled = not unlocked
		play.pressed.connect(func() -> void:
			if unlocked:
				level_requested.emit(level_id)
		)


func _format(template: String, values: Dictionary) -> String:
	var result := template
	for key in values:
		result = result.replace("{" + str(key) + "}", str(values[key]))
	return result


func _label(parent: Node, size: int, color: Color) -> Label:
	var label := Label.new()
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	parent.add_child(label)
	return label


func _button(parent: Node) -> Button:
	var button := Button.new()
	Style.style_button(button)
	parent.add_child(button)
	return button
