extends Control

signal story_requested

const Level = preload("res://data/locker_match3.json")
const Game = preload("res://scripts/match3_game.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")

var preferences: RefCounted
var session: RefCounted
var story_session: RefCounted
var game: RefCounted
var level_id := ""
var campaign_mode := false
var level_data: Dictionary
var level_presentation: Dictionary
var campaign_bundle: Dictionary
var selected_index := -1
var hinted_indices: Array[int] = []
var last_tapped_special_index := -1
var last_tapped_special_at := -1
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
var hint_button: Button
var warning: Label
var board: GridContainer
var result_box: HBoxContainer
var result_label: Label
var retry_button: Button
var back_button: Button
var result_back_button: Button
var evidence_panel: PanelContainer
var evidence_kicker: Label
var evidence_image: TextureRect
var evidence_title: Label
var evidence_label: Label
var evidence_continue: Button


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	campaign_bundle = CampaignData.load_bundle()
	if level_id.is_empty(): level_id = str(Level.data.id)
	level_data = CampaignData.get_level(campaign_bundle, level_id)
	assert(not level_data.is_empty(), "Match-3 level is unavailable: " + level_id)
	level_presentation = campaign_bundle.levelPresentations[level_id]
	game = Game.new(level_data)
	session.start_level(level_id)
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
	board.columns = int(level_data.columns)
	board.add_theme_constant_override("h_separation", 3)
	board.add_theme_constant_override("v_separation", 3)
	board_center.add_child(board)
	evidence_panel = PanelContainer.new()
	evidence_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(evidence_panel)
	var evidence_content := VBoxContainer.new()
	evidence_content.alignment = BoxContainer.ALIGNMENT_CENTER
	evidence_content.add_theme_constant_override("separation", 5)
	evidence_panel.add_child(evidence_content)
	evidence_kicker = _label(evidence_content, 13, Color("#a24762"))
	evidence_kicker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	evidence_image = TextureRect.new()
	evidence_image.custom_minimum_size = Vector2(128, 110)
	evidence_image.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
	evidence_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	evidence_content.add_child(evidence_image)
	evidence_title = _label(evidence_content, 18, Color("#29243d"))
	evidence_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	evidence_label = _label(evidence_content, 13, Color("#29243d"))
	evidence_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	evidence_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	evidence_continue = _button(evidence_content)
	evidence_continue.pressed.connect(_continue_story)
	var footer := HBoxContainer.new()
	content.add_child(footer)
	moves = _label(footer, 15, Color.WHITE)
	moves.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hint_button = _button(footer)
	hint_button.pressed.connect(_show_hint)
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
	var copy: Dictionary = level_presentation.localized.get(locale, level_presentation.localized.en)
	title.text = copy.title
	back_button.text = copy.back
	if game.state == "playing":
		bark.text = copy.noMatchBark if not last_feedback.is_empty() else "%s: %s" % [copy.startSpeaker, copy.startText]
	else:
		bark.text = "%s: %s" % [copy.winSpeaker, copy.winText] if game.state == "won" else "%s: %s" % [copy.loseSpeaker, copy.loseText]
	tutorial_title.text = str(Level.data.localized[locale].tutorialTitle)
	tutorial_body.text = str(Level.data.localized[locale].tutorialBody)
	tutorial_button.text = str(Level.data.localized[locale].tutorialTry)
	tutorial_panel.visible = level_id == str(Level.data.id) and not session.save.tutorialsCompleted.has("basic-swap")
	var objective_lines := PackedStringArray()
	for index in level_data.objectives.size():
		var objective_data: Dictionary = level_data.objectives[index]
		var objective_names: Array = copy.get("objectives", [])
		var objective_name: String = str(objective_names[index]) if index < objective_names.size() else str(objective_data.get("label", "Objective"))
		objective_lines.append("%s %d/%d" % [objective_name, game.objective_value(index), int(objective_data.target)])
	objective.text = "  ·  ".join(objective_lines)
	moves.text = "%s · %d" % [copy.moves, game.moves_left]
	hint_button.text = MenuCopy.text("match3_hint", locale)
	hint_button.disabled = game.state != "playing" or tutorial_panel.visible
	warning.text = "" if session.last_write_ok and (story_session == null or story_session.last_write_ok) else MenuCopy.text("story_save_error", locale)
	warning.visible = not warning.text.is_empty()
	result_label.text = copy.win if game.state == "won" else copy.lose if game.state == "lost" else ""
	result_label.visible = game.state == "lost"
	result_box.visible = game.state == "lost"
	retry_button.text = copy.retry
	result_back_button.text = copy.back
	var won: bool = game.state == "won"
	board.get_parent().visible = not won
	tutorial_panel.visible = not won and level_id == str(Level.data.id) and not session.save.tutorialsCompleted.has("basic-swap")
	objective.visible = not won
	moves.visible = not won
	evidence_panel.visible = won
	if campaign_mode:
		evidence_kicker.visible = false
		evidence_image.visible = false
		evidence_title.text = str(copy.win)
		evidence_label.text = str(copy.resultDetail).replace("{movesLeft}", str(game.moves_left))
		evidence_continue.text = str(copy.backToCampaign)
	else:
		var evidence: Dictionary = Level.data.evidence
		var clue_copy: Dictionary = evidence.localized[locale]
		evidence_kicker.visible = true
		evidence_image.visible = true
		evidence_kicker.text = clue_copy.evidenceFound
		evidence_image.texture = load("res://" + str(evidence.asset).trim_prefix("./"))
		evidence_title.text = clue_copy.title
		evidence_label.text = clue_copy.label
		evidence_continue.text = clue_copy.continueStory
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
		var tile_asset := str(campaign_bundle.assets.tiles.get(game.tiles[index], ""))
		if not tile_asset.is_empty(): tile_button.texture_normal = load("res://" + tile_asset.trim_prefix("./"))
		var tile_tint := Color(1.25, 1.25, 1, 1) if index == selected_index else Color(1.2, 0.95, 0.5, 1) if hinted_indices.has(index) else Color.WHITE
		tile_button.modulate = Color(0.35, 0.38, 0.45, 0.7) if game.tiles[index].is_empty() else tile_tint
		tile_button.disabled = game.state != "playing" or tutorial_panel.visible or game.tiles[index].is_empty() or game.blocker_layers[index] > 0
		tile_button.pressed.connect(_select_cell.bind(index))
		if game.blocker_layers[index] > 0:
			var blocker_asset := str(campaign_bundle.assets.blockers.get(str(level_data.blockerStyle), ""))
			if str(level_data.blockerStyle) == "locked": blocker_asset = str(campaign_bundle.assets.lockedBlockers.get(str(game.blocker_layers[index]), blocker_asset))
			if not blocker_asset.is_empty():
				var blocker := TextureRect.new()
				blocker.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
				blocker.texture = load("res://" + blocker_asset.trim_prefix("./"))
				blocker.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				blocker.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
				blocker.mouse_filter = Control.MOUSE_FILTER_IGNORE
				tile_button.add_child(blocker)
		if not game.ingredients[index].is_empty():
			var ingredient_asset := str(campaign_bundle.assets.ingredients.get(game.ingredients[index], ""))
			if not ingredient_asset.is_empty():
				var ingredient := TextureRect.new()
				ingredient.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
				ingredient.offset_left = -22
				ingredient.offset_top = -22
				ingredient.offset_right = -2
				ingredient.offset_bottom = -2
				ingredient.texture = load("res://" + ingredient_asset.trim_prefix("./"))
				ingredient.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				ingredient.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
				ingredient.mouse_filter = Control.MOUSE_FILTER_IGNORE
				tile_button.add_child(ingredient)
		if not game.specials[index].is_empty():
			var badge := Label.new()
			badge.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
			badge.offset_left = -21
			badge.offset_top = 0
			badge.offset_right = -1
			badge.offset_bottom = 20
			badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			badge.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			badge.add_theme_font_size_override("font_size", 15)
			badge.add_theme_color_override("font_color", Color("#fff2a8"))
			badge.add_theme_color_override("font_shadow_color", Color("#24213c"))
			badge.add_theme_constant_override("shadow_offset_x", 1)
			badge.add_theme_constant_override("shadow_offset_y", 1)
			badge.mouse_filter = Control.MOUSE_FILTER_IGNORE
			badge.text = _special_glyph(game.specials[index])
			tile_button.add_child(badge)
		board.add_child(tile_button)


func _special_glyph(kind: String) -> String:
	match kind:
		"flash-row": return "↔"
		"flash-column": return "↕"
		"evidence": return "◎"
		"lead": return "⌖"
		"insight": return "✦"
	return ""


func _select_cell(index: int) -> void:
	if game.state != "playing" or tutorial_panel.visible:
		return
	var now := Time.get_ticks_msec()
	if not game.specials[index].is_empty() and selected_index == index and last_tapped_special_index == index and now - last_tapped_special_at <= 360:
		selected_index = -1
		last_tapped_special_index = -1
		last_tapped_special_at = -1
		hinted_indices.clear()
		var special_result: Dictionary = game.attempt_special_activation(index)
		last_feedback = "" if special_result.valid else str(special_result.reason)
		if special_result.valid and game.state == "won":
			session.complete_level(level_id, game.moves_left)
			if not campaign_mode and story_session != null: story_session.complete_match3(level_id)
		_refresh()
		return
	if selected_index < 0:
		selected_index = index
		last_tapped_special_index = index if not game.specials[index].is_empty() else -1
		last_tapped_special_at = now if last_tapped_special_index >= 0 else -1
		_render_board()
		return
	if selected_index == index:
		selected_index = -1
		last_tapped_special_index = -1
		last_tapped_special_at = -1
		_render_board()
		return
	var result: Dictionary = game.attempt_swap(selected_index, index)
	hinted_indices.clear()
	last_tapped_special_index = -1
	last_tapped_special_at = -1
	if result.valid:
		selected_index = -1
		last_feedback = ""
		if game.state == "won":
			session.complete_level(level_id, game.moves_left)
			if not campaign_mode and story_session != null: story_session.complete_match3(level_id)
	else:
		selected_index = index
		last_feedback = str(result.reason)
	_refresh()


func _show_hint() -> void:
	if game.state != "playing" or tutorial_panel.visible: return
	var hint: Dictionary = game.get_hint_move()
	hinted_indices.clear()
	if not hint.is_empty(): hinted_indices = [int(hint.first), int(hint.second)]
	selected_index = -1
	last_tapped_special_index = -1
	last_tapped_special_at = -1
	_render_board()


func _dismiss_tutorial() -> void:
	if not session.save.tutorialsCompleted.has("basic-swap"):
		session.save.tutorialsCompleted.append("basic-swap")
		session.persist()
	_refresh()


func _retry() -> void:
	game.reset()
	selected_index = -1
	last_feedback = ""
	session.start_level(level_id)
	_refresh()


func _continue_story() -> void:
	story_requested.emit()


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
