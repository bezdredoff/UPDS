extends Control

signal menu_requested
signal settings_requested
signal match3_requested(level_id: String)

const Prologue = preload("res://data/prologue.json")
const LockerScene = preload("res://data/locker_scene.json")
const EndingOutcomes = preload("res://data/ending_outcomes.json")
const Copy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")
const PhoneFrame = preload("res://scripts/phone_frame.gd")

var session: RefCounted
var preferences: RefCounted
var audio_runtime: Node
var stage: Control
var nameplate: PanelContainer
var dialogue_panel: PanelContainer
var background_rect: TextureRect
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
var choice_box: VBoxContainer
var choice_prompt: Label
var choice_buttons: Array[Button] = []
var ending_panel: PanelContainer
var ending_eyebrow: Label
var ending_heading: Label
var ending_copy: Label
var ending_summary: Label
var ending_menu_button: Button
var ending_replay_button: Button
var _boundary := false
var _last_advance := -1000
var _gate_requested := false


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	PhoneFrame.fit(self)
	background_rect = TextureRect.new()
	background_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background_rect)
	stage = Control.new()
	stage.name = "Stage"
	stage.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stage.anchor_top = 0.12
	stage.anchor_bottom = 0.60
	# Authored character frames extend below the stage into the transparent dialogue overlay.
	stage.clip_contents = false
	stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(stage)
	var header_background := PanelContainer.new()
	header_background.name = "HeaderBackground"
	header_background.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	header_background.offset_bottom = 66
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color("#17304d")
	header_style.border_color = Color("#d3b068")
	header_style.border_width_bottom = 2
	header_background.add_theme_stylebox_override("panel", header_style)
	header_background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(header_background)
	var header := HBoxContainer.new()
	header.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	header.offset_left = 12
	header.offset_right = -12
	header.offset_top = 8
	header.add_theme_constant_override("separation", 10)
	add_child(header)
	menu_button = _button(header)
	menu_button.pressed.connect(func() -> void: menu_requested.emit())
	_style_header_button(menu_button)
	title = _label(header, 17)
	title.add_theme_color_override("font_color", Color("#fff9ea"))
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	settings_button = _button(header)
	settings_button.pressed.connect(func() -> void: settings_requested.emit())
	_style_header_button(settings_button)
	dialogue_panel = PanelContainer.new()
	dialogue_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dialogue_panel.anchor_top = 0.70
	dialogue_panel.offset_left = 12
	dialogue_panel.offset_right = -12
	dialogue_panel.offset_bottom = -12
	var paper := StyleBoxFlat.new()
	paper.bg_color = Color("#fff8e8f7")
	paper.border_color = Color("#d9bd83")
	paper.set_border_width_all(2)
	paper.set_corner_radius_all(18)
	paper.content_margin_left = 20
	paper.content_margin_right = 20
	paper.content_margin_top = 28
	paper.content_margin_bottom = 16
	dialogue_panel.add_theme_stylebox_override("panel", paper)
	add_child(dialogue_panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 6)
	dialogue_panel.add_child(content)
	nameplate = PanelContainer.new()
	nameplate.name = "Nameplate"
	nameplate.custom_minimum_size.x = 220.0
	nameplate.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	var nameplate_style := StyleBoxFlat.new()
	nameplate_style.bg_color = Color("#2a4b76")
	nameplate_style.border_color = Color("#f3e8d2")
	nameplate_style.set_border_width_all(2)
	nameplate_style.set_corner_radius_all(10)
	nameplate_style.content_margin_left = 12
	nameplate_style.content_margin_right = 12
	nameplate_style.content_margin_top = 6
	nameplate_style.content_margin_bottom = 6
	nameplate.add_theme_stylebox_override("panel", nameplate_style)
	var nameplate_row := HBoxContainer.new()
	nameplate_row.add_theme_constant_override("separation", 7)
	nameplate.add_child(nameplate_row)
	speaker = _label(nameplate_row, 13)
	speaker.autowrap_mode = TextServer.AUTOWRAP_OFF
	speaker.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	speaker.add_theme_color_override("font_color", Color("#fff9ea"))
	emotion = _label(nameplate_row, 8)
	emotion.autowrap_mode = TextServer.AUTOWRAP_OFF
	emotion.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	emotion.add_theme_color_override("font_color", Color("#e9d5a7"))
	content.add_child(nameplate)
	choice_box = VBoxContainer.new()
	choice_box.name = "ChoiceBox"
	choice_box.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(choice_box)
	choice_prompt = _label(choice_box, 18)
	for option in ["A", "B", "C"]:
		var choice_button := _button(choice_box)
		choice_button.name = "Choice" + option
		choice_button.pressed.connect(_choose.bind(option))
		choice_buttons.append(choice_button)
	dialogue = RichTextLabel.new()
	dialogue.name = "Dialogue"
	dialogue.add_theme_color_override("default_color", Color("#29243d"))
	var dialogue_serif := SystemFont.new()
	dialogue_serif.font_names = PackedStringArray(["Georgia", "Noto Serif", "Liberation Serif", "serif"])
	dialogue.add_theme_font_override("normal_font", dialogue_serif)
	dialogue.add_theme_font_size_override("normal_font_size", 17)
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
	_build_ending_panel()
	session.changed.connect(_refresh)
	preferences.locale_changed.connect(func(_locale: String) -> void: _refresh())
	_refresh()
	if not session.ending_result().is_empty():
		ending_menu_button.grab_focus()
	elif session.at_match3_gate():
		menu_button.grab_focus()
	elif session.at_choice_gate():
		choice_buttons[0].grab_focus()
	else:
		next_button.grab_focus()


func _refresh() -> void:
	var outcome: Dictionary = session.ending_result()
	if not outcome.is_empty():
		_refresh_ending(outcome)
		return
	ending_panel.hide()
	dialogue_panel.show()
	stage.show()
	menu_button.show()
	title.show()
	settings_button.show()
	var line: Dictionary = session.current_line()
	if line.is_empty():
		return
	var data: Dictionary = session.scene_data()
	var locale: String = preferences.locale
	var copy: Dictionary = line.localized[locale]
	title.text = data.titles[locale]
	background_rect.texture = load("res://" + str(line.get("background", data.get("background", "./assets/backgrounds/BG_CLUBROOM_DAY.webp"))).trim_prefix("./"))
	speaker.text = copy.speaker
	emotion.text = copy.emotion
	dialogue.text = copy.text
	dialogue.scroll_to_line(0)
	var lines: Array = Prologue.data.lines if session.state.scene == 0 else LockerScene.data.variants[session.state.choice] if session.state.scene == 1 else data.lines
	progress.text = "%d / %d" % [int(session.state.line) + 1, lines.size()]
	menu_button.text = Copy.text("vn_menu", locale)
	settings_button.text = Copy.text("settings", locale)
	next_button.text = Copy.text("vn_next", locale)
	var choosing: bool = session.at_choice_gate()
	_boundary = session.at_match3_gate() or session.at_port_boundary()
	if not _boundary:
		_gate_requested = false
	choice_box.visible = choosing
	nameplate.visible = not choosing and not _boundary
	dialogue.visible = not choosing and not _boundary
	next_button.visible = not choosing
	next_button.disabled = _boundary
	if choosing:
		var gate: Dictionary = data.get("choiceGate", {})
		var prompt: Dictionary = LockerScene.data.choicePrompt if session.state.scene == 1 else gate.prompt
		var choices: Dictionary = LockerScene.data.choices if session.state.scene == 1 else gate.choices
		choice_prompt.text = prompt[locale]
		for index in range(choice_buttons.size()):
			var option: String = ["A", "B", "C"][index]
			var localized: Dictionary = choices[option][locale]
			choice_buttons[index].text = "%s\n%s" % [localized.title, localized.effect]
		next_button.disabled = true
	warning.text = "" if session.last_write_ok else Copy.text("story_save_error", locale)
	warning.visible = not session.last_write_ok
	boundary.text = Copy.text("match3_boundary", locale) if session.at_match3_gate() else Copy.text("prologue_boundary", locale)
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
		_animate_portrait(portrait, stage.size.y * height * 0.0035)
	if _boundary and not _gate_requested:
		_gate_requested = true
		match3_requested.emit(str(session.scene_data().get("nextLevelId", "")))


func _portrait_width(portrait: TextureRect) -> void:
	var width := portrait.size.y * 1024.0 / 1536.0
	portrait.offset_left = -width / 2.0
	portrait.offset_right = width / 2.0


func _animate_portrait(portrait: TextureRect, travel: float) -> void:
	if travel <= 0.0:
		return
	var resting_position: Vector2 = portrait.position
	var breathing := portrait.create_tween().set_loops()
	var rise: PropertyTweener = breathing.tween_property(
		portrait, "position", resting_position + Vector2.UP * travel, 1.4)
	rise.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	var fall: PropertyTweener = breathing.tween_property(portrait, "position", resting_position, 1.4)
	fall.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)


func _next() -> void:
	if _boundary or Time.get_ticks_msec() - _last_advance < 120:
		return
	_last_advance = Time.get_ticks_msec()
	audio_runtime.play_effect("vnAdvance")
	if not session.advance():
		_refresh()
		menu_button.grab_focus()


func _choose(option: String) -> void:
	if session.choose(option):
		_boundary = false
		audio_runtime.play_effect("choice")
		_refresh()
		next_button.grab_focus()


func _build_ending_panel() -> void:
	ending_panel = PanelContainer.new()
	ending_panel.name = "EndingPanel"
	ending_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ending_panel.anchor_top = 0.22
	ending_panel.anchor_bottom = 0.86
	ending_panel.offset_left = 18
	ending_panel.offset_right = -18
	var paper := StyleBoxFlat.new()
	paper.bg_color = Color("#fffdf8")
	paper.set_corner_radius_all(12)
	paper.content_margin_left = 18
	paper.content_margin_right = 18
	paper.content_margin_top = 16
	paper.content_margin_bottom = 16
	ending_panel.add_theme_stylebox_override("panel", paper)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 10)
	ending_panel.add_child(content)
	ending_eyebrow = _label(content, 13)
	ending_eyebrow.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ending_heading = _label(content, 26)
	ending_heading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ending_copy = _label(content, 17)
	ending_copy.size_flags_vertical = Control.SIZE_EXPAND_FILL
	ending_copy.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	ending_summary = _label(content, 14)
	ending_summary.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ending_menu_button = _button(content)
	ending_replay_button = _button(content)
	ending_menu_button.pressed.connect(func() -> void: menu_requested.emit())
	ending_replay_button.pressed.connect(func() -> void: session.new_game())
	ending_panel.hide()
	add_child(ending_panel)


func _refresh_ending(outcome: Dictionary) -> void:
	var locale: String = preferences.locale
	var data: Dictionary = EndingOutcomes.data
	var copy: Dictionary = data.copy[locale]
	var ending_id: String = outcome.endingId
	var localized_ending: Dictionary = copy.outcomes[ending_id]
	var metrics: Dictionary = outcome.metrics
	var final_strategy: String = str(session.state.storyChoices.get("final-strategy", "A"))
	background_rect.texture = load("res://" + str(data.backgrounds[ending_id]).trim_prefix("./"))
	title.hide()
	menu_button.hide()
	settings_button.hide()
	stage.hide()
	dialogue_panel.hide()
	ending_eyebrow.text = localized_ending.eyebrow
	ending_heading.text = localized_ending.heading
	ending_copy.text = localized_ending[outcome.copyKey]
	ending_summary.text = "%s: %s\n%s: %d / %d / %d\n%s: %d / %d" % [
		copy.finalStrategy, copy.strategyTitles[final_strategy], copy.metrics,
		int(metrics.evidence), int(metrics.teamTrust), int(metrics.sourceTrust),
		copy.cluesFound, session.state.clues.size(), data.totalClues,
	]
	ending_menu_button.text = copy.mainMenu
	ending_replay_button.text = copy.replay
	ending_panel.show()
	ending_menu_button.grab_focus()


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


func _style_header_button(button: Button) -> void:
	button.custom_minimum_size = Vector2(50, 46)
	button.add_theme_color_override("font_color", Color("#fff9ea"))
	button.add_theme_color_override("font_hover_color", Color.WHITE)
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("#1d3551")
	normal.border_color = Color("#d3b068")
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(10)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#2a4b76")
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)


func _unhandled_key_input(event: InputEvent) -> void:
	if not is_visible_in_tree() or event.is_echo():
		return
	if event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		menu_requested.emit()
	elif event.is_action_pressed("ui_accept") and session.ending_result().is_empty():
		get_viewport().set_input_as_handled()
		_next()
