extends Control

signal story_requested

const Level = preload("res://data/locker_match3.json")
const Game = preload("res://scripts/match3_game.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")

var preferences: RefCounted
var session: RefCounted
var game: RefCounted
var selected_index := -1
var last_feedback := ""
var background: TextureRect
var title: Label
var bark: Label
var tutorial_panel: PanelContainer
var tutorial_title: Label
var tutorial_body: Label
var tutorial_button: Button
var objective: Label
var moves: Label
var warning: Label
var board: GridContainer
var result_box: HBoxContainer
var result_label: Label
var retry_button: Button
var back_button: Button
var result_back_button: Button


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	game = Game.new()
	session.start_level(str(Level.data.id))
	background = TextureRect.new()
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.texture = load("res://assets/backgrounds/BG_LOCKER_ATHLETICS_DAY.webp")
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	var wash := ColorRect.new()
	wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	wash.color = Color(0.08, 0.11, 0.17, 0.55)
	wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(wash)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 12)
	margin.add_theme_constant_override("margin_bottom", 12)
	add_child(margin)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 7)
	margin.add_child(content)
	var header := HBoxContainer.new()
	content.add_child(header)
	back_button = _button(header)
	back_button.pressed.connect(func() -> void: story_requested.emit())
	title = _label(header, 19, Color.WHITE)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var spacer := Control.new()
	spacer.custom_minimum_size.x = 72
	header.add_child(spacer)
	bark = _label(content, 15, Color.WHITE)
	bark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	bark.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tutorial_panel = PanelContainer.new()
	var tutorial_style := StyleBoxFlat.new()
	tutorial_style.bg_color = Color(0.99, 0.98, 0.94, 0.95)
	tutorial_style.set_corner_radius_all(10)
	tutorial_style.content_margin_left = 10
	tutorial_style.content_margin_right = 10
	tutorial_style.content_margin_top = 7
	tutorial_style.content_margin_bottom = 7
	tutorial_panel.add_theme_stylebox_override("panel", tutorial_style)
	content.add_child(tutorial_panel)
	var tutorial_content := VBoxContainer.new()
	tutorial_content.add_theme_constant_override("separation", 3)
	tutorial_panel.add_child(tutorial_content)
	tutorial_title = _label(tutorial_content, 15, Color("#a24762"))
	tutorial_body = _label(tutorial_content, 12, Color("#29243d"))
	tutorial_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tutorial_button = _button(tutorial_content)
	tutorial_button.size_flags_horizontal = Control.SIZE_SHRINK_END
	tutorial_button.pressed.connect(_dismiss_tutorial)
	var objective_panel := PanelContainer.new()
	var objective_style := StyleBoxFlat.new()
	objective_style.bg_color = Color(0.99, 0.98, 0.94, 0.96)
	objective_style.set_corner_radius_all(9)
	objective_style.content_margin_left = 10
	objective_style.content_margin_right = 10
	objective_style.content_margin_top = 6
	objective_style.content_margin_bottom = 6
	objective_panel.add_theme_stylebox_override("panel", objective_style)
	content.add_child(objective_panel)
	objective = _label(objective_panel, 14, Color("#29243d"))
	var board_center := CenterContainer.new()
	board_center.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(board_center)
	board = GridContainer.new()
	board.columns = int(Level.data.columns)
	board.add_theme_constant_override("h_separation", 3)
	board.add_theme_constant_override("v_separation", 3)
	board_center.add_child(board)
	var footer := HBoxContainer.new()
	content.add_child(footer)
	moves = _label(footer, 15, Color.WHITE)
	moves.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	warning = _label(content, 12, Color("#ffd7a5"))
	warning.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	result_label = _label(content, 15, Color.WHITE)
	result_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	result_box = HBoxContainer.new()
	result_box.alignment = BoxContainer.ALIGNMENT_CENTER
	content.add_child(result_box)
	retry_button = _button(result_box)
	retry_button.pressed.connect(_retry)
	result_back_button = _button(result_box)
	result_back_button.pressed.connect(func() -> void: story_requested.emit())
	preferences.locale_changed.connect(func(_locale: String) -> void: _refresh())
	_refresh()


func _refresh() -> void:
	var locale: String = preferences.locale
	var copy: Dictionary = Level.data.localized[locale]
	title.text = copy.title
	back_button.text = copy.back
	if game.state == "playing":
		bark.text = copy.noMatchBark if not last_feedback.is_empty() else "%s: %s" % [copy.startSpeaker, copy.startText]
	else:
		bark.text = "%s: %s" % [copy.winSpeaker, copy.winText] if game.state == "won" else "%s: %s" % [copy.loseSpeaker, copy.loseText]
	tutorial_title.text = copy.tutorialTitle
	tutorial_body.text = copy.tutorialBody
	tutorial_button.text = copy.tutorialTry
	tutorial_panel.visible = not session.save.tutorialsCompleted.has("basic-swap")
	objective.text = "%s  %s · %d / %d" % [copy.collected, copy.objective, game.collected, int(Level.data.target)]
	moves.text = "%s · %d" % [copy.moves, game.moves_left]
	warning.text = "" if session.last_write_ok else MenuCopy.text("story_save_error", locale)
	warning.visible = not session.last_write_ok
	result_label.text = copy.win if game.state == "won" else copy.lose if game.state == "lost" else ""
	result_label.visible = game.state != "playing"
	result_box.visible = game.state != "playing"
	retry_button.text = copy.retry
	result_back_button.text = copy.back
	_render_board()


func _render_board() -> void:
	for child in board.get_children():
		board.remove_child(child)
		child.queue_free()
	for index in game.tiles.size():
		var tile_button := TextureButton.new()
		tile_button.ignore_texture_size = true
		tile_button.stretch_mode = TextureButton.STRETCH_KEEP_ASPECT_CENTERED
		tile_button.custom_minimum_size = Vector2(44, 44)
		tile_button.texture_normal = load("res://" + str(Level.data.assets[game.tiles[index]]).trim_prefix("./"))
		tile_button.modulate = Color(1.25, 1.25, 1.25, 1) if index == selected_index else Color.WHITE
		tile_button.disabled = game.state != "playing" or tutorial_panel.visible
		tile_button.pressed.connect(_select_cell.bind(index))
		board.add_child(tile_button)


func _select_cell(index: int) -> void:
	if game.state != "playing" or tutorial_panel.visible:
		return
	if selected_index < 0:
		selected_index = index
		_render_board()
		return
	if selected_index == index:
		selected_index = -1
		_render_board()
		return
	var result: Dictionary = game.attempt_swap(selected_index, index)
	if result.valid:
		selected_index = -1
		last_feedback = ""
		if game.state == "won":
			session.complete_level(str(Level.data.id), game.moves_left)
	else:
		selected_index = index
		last_feedback = str(result.reason)
	_refresh()


func _dismiss_tutorial() -> void:
	if not session.save.tutorialsCompleted.has("basic-swap"):
		session.save.tutorialsCompleted.append("basic-swap")
		session.persist()
	_refresh()


func _retry() -> void:
	game.reset()
	selected_index = -1
	last_feedback = ""
	session.start_level(str(Level.data.id))
	_refresh()


func _label(parent: Node, size: int, color: Color) -> Label:
	var label := Label.new()
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	parent.add_child(label)
	return label


func _button(parent: Node) -> Button:
	var button := Button.new()
	Style.style_button(button)
	parent.add_child(button)
	return button
