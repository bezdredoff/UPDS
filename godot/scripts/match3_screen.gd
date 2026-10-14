extends Control

signal story_requested
signal dossier_requested
signal settings_requested
signal clue_awarded(clue_id: String)

const Level = preload("res://data/locker_match3.json")
const Game = preload("res://scripts/match3_game.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")
const PhoneFrame = preload("res://scripts/phone_frame.gd")
const SWAP_MOTION_SECONDS := 0.15
const CLEAR_MOTION_SECONDS := 0.28
const SETTLE_MOTION_SECONDS := 0.32
const RESHUFFLE_MOTION_SECONDS := 0.46
const FEEDBACK_HOLD_SECONDS := 0.42
const HINT_ICON := "res://assets/match3/special_observation_magnifier.png"

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
var title_short: Label
var bark: Label
var bark_speaker: Label
var bark_portrait: TextureRect
var tutorial_panel: PanelContainer
var tutorial_overlay: Control
var tutorial_badge: PanelContainer
var tutorial_eyebrow: Label
var tutorial_title: Label
var tutorial_body: Label
var tutorial_button: Button
var objective: Label
var objective_heading: Label
var objective_icon: TextureRect
var moves: Label
var moves_heading: Label
var hint_button: Button
var hint_label: Label
var dossier_button: Button
var help_button: Button
var settings_button: Button
var help_dialog: AcceptDialog
var match_feedback_panel: PanelContainer
var match_feedback_label: Label
var match_feedback_tween: Tween
var match_feedback_key := ""
var match_feedback_kind := "match"
var match_feedback_cascade := 1
var warning: Label
var board: GridContainer
var board_center: CenterContainer
var board_frame: PanelContainer
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
var evidence_transition_overlay: Control
var evidence_transition_image: TextureRect
var evidence_transition_kicker: Label
var evidence_transition_title: Label
var evidence_transition_copy: RichTextLabel
var evidence_transition_continue: Button
var story_evidence_visible := false
var input_locked := false
var bottom_spacer: Control


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	PhoneFrame.fit(self)
	campaign_bundle = CampaignData.load_bundle()
	if level_id.is_empty(): level_id = str(Level.data.id)
	level_data = CampaignData.get_level(campaign_bundle, level_id)
	assert(not level_data.is_empty(), "Match-3 level is unavailable: " + level_id)
	level_presentation = campaign_bundle.levelPresentations[level_id]
	session.start_level(level_id)
	game = _new_game_for_attempt()
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
	margin.add_theme_constant_override("margin_top", 0)
	margin.add_theme_constant_override("margin_bottom", 12)
	add_child(margin)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 7)
	margin.add_child(content)
	var header_panel := PanelContainer.new()
	header_panel.custom_minimum_size.y = 60
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color("#10243d")
	header_style.border_color = Color("#d3b068")
	header_style.border_width_bottom = 2
	header_style.content_margin_left = 0
	header_style.content_margin_right = 0
	header_style.content_margin_top = 0
	header_style.content_margin_bottom = 0
	header_panel.add_theme_stylebox_override("panel", header_style)
	content.add_child(header_panel)
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 7)
	header.custom_minimum_size.y = 60
	header_panel.add_child(header)
	back_button = _button(header)
	back_button.custom_minimum_size = Vector2(44, 44)
	back_button.text = ""
	_add_header_icon(back_button, "back")
	_style_header_button(back_button, Color("#283750"))
	back_button.pressed.connect(func() -> void: story_requested.emit())
	var title_stack := VBoxContainer.new()
	title_stack.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_stack.alignment = BoxContainer.ALIGNMENT_CENTER
	title_stack.add_theme_constant_override("separation", 1)
	header.add_child(title_stack)
	title_short = _label(title_stack, 7, Color("#f0d69b"))
	title_short.text = str(level_data.get("shortId", ""))
	title = _label(title_stack, 11, Color.WHITE)
	title.add_theme_font_size_override("font_size", 11)
	var title_serif := SystemFont.new()
	title_serif.font_names = PackedStringArray(["Georgia", "serif"])
	title.add_theme_font_override("font", title_serif)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var actions := HBoxContainer.new()
	actions.add_theme_constant_override("separation", 5)
	header.add_child(actions)
	if story_session != null:
		dossier_button = _header_icon_button(actions, "dossier")
		dossier_button.pressed.connect(func() -> void: dossier_requested.emit())
	help_button = _header_text_button(actions, "?")
	help_button.add_theme_font_size_override("font_size", 20)
	help_button.pressed.connect(_show_help)
	settings_button = _header_icon_button(actions, "settings")
	settings_button.pressed.connect(func() -> void: settings_requested.emit())
	bark = _label(content, 15, Color.WHITE)
	bark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	bark.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bark.add_theme_font_size_override("font_size", 12)
	bark.add_theme_color_override("font_color", Color("#29243d"))
	tutorial_panel = PanelContainer.new()
	var tutorial_style := StyleBoxFlat.new()
	tutorial_style.bg_color = Color("#fff4d7")
	tutorial_style.border_color = Color("#326349")
	tutorial_style.set_border_width_all(2)
	tutorial_style.border_width_left = 8
	tutorial_style.set_corner_radius_all(9)
	tutorial_style.shadow_color = Color(0.06, 0.1, 0.14, 0.35)
	tutorial_style.shadow_size = 14
	tutorial_style.shadow_offset = Vector2(0, 5)
	tutorial_style.content_margin_left = 16
	tutorial_style.content_margin_right = 19
	tutorial_style.content_margin_top = 12
	tutorial_style.content_margin_bottom = 14
	tutorial_panel.add_theme_stylebox_override("panel", tutorial_style)
	content.add_child(tutorial_panel)
	var tutorial_content := VBoxContainer.new()
	tutorial_content.add_theme_constant_override("separation", 5)
	tutorial_panel.add_child(tutorial_content)
	tutorial_badge = PanelContainer.new()
	tutorial_badge.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	tutorial_badge.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	tutorial_badge.custom_minimum_size = Vector2(90, 22)
	var tutorial_badge_style := StyleBoxFlat.new()
	tutorial_badge_style.bg_color = Color("#326349")
	tutorial_badge_style.set_corner_radius_all(3)
	tutorial_badge_style.content_margin_left = 10
	tutorial_badge_style.content_margin_right = 10
	tutorial_badge_style.content_margin_top = 3
	tutorial_badge_style.content_margin_bottom = 3
	tutorial_badge.add_theme_stylebox_override("panel", tutorial_badge_style)
	tutorial_content.add_child(tutorial_badge)
	tutorial_eyebrow = _label(tutorial_badge, 9, Color.WHITE)
	tutorial_eyebrow.autowrap_mode = TextServer.AUTOWRAP_OFF
	tutorial_eyebrow.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	tutorial_eyebrow.text = {"ru": "ОБУЧЕНИЕ", "be": "НАВУЧАННЕ", "en": "HOW TO PLAY"}.get(preferences.locale, "HOW TO PLAY")
	tutorial_title = _label(tutorial_content, 24, Color("#172b49"))
	tutorial_title.add_theme_font_size_override("font_size", 24)
	var tutorial_serif := SystemFont.new()
	tutorial_serif.font_names = PackedStringArray(["Georgia", "serif"])
	tutorial_serif.font_weight = 800
	tutorial_title.add_theme_font_override("font", tutorial_serif)
	tutorial_body = _label(tutorial_content, 14, Color("#29243d"))
	tutorial_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	var tutorial_sans := SystemFont.new()
	tutorial_sans.font_names = PackedStringArray(["Comic Sans MS", "Trebuchet MS", "Arial"])
	tutorial_sans.font_weight = 700
	tutorial_body.add_theme_font_override("font", tutorial_sans)
	tutorial_button = _button(tutorial_content)
	_style_tutorial_button(tutorial_button)
	tutorial_button.pressed.connect(_dismiss_tutorial)
	content.remove_child(tutorial_panel)
	tutorial_overlay = Control.new()
	tutorial_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	var tutorial_shade := ColorRect.new()
	tutorial_shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_shade.color = Color(0.05, 0.08, 0.14, 0.62)
	tutorial_shade.mouse_filter = Control.MOUSE_FILTER_STOP
	tutorial_overlay.add_child(tutorial_shade)
	var tutorial_center := CenterContainer.new()
	tutorial_center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_overlay.add_child(tutorial_center)
	tutorial_panel.custom_minimum_size.x = 354
	tutorial_panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	tutorial_center.add_child(tutorial_panel)
	var objective_panel := PanelContainer.new()
	var objective_style := StyleBoxFlat.new()
	objective_style.bg_color = Color(0.99, 0.98, 0.94, 0.96)
	objective_style.set_corner_radius_all(9)
	objective_style.content_margin_left = 10
	objective_style.content_margin_right = 10
	objective_style.content_margin_top = 6
	objective_style.content_margin_bottom = 6
	objective_panel.add_theme_stylebox_override("panel", objective_style)
	var hud := HBoxContainer.new()
	hud.add_theme_constant_override("separation", 8)
	hud.custom_minimum_size.y = 51
	content.add_child(hud)
	objective_panel.custom_minimum_size.x = 234
	objective_panel.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	hud.add_child(objective_panel)
	var objective_content := VBoxContainer.new()
	objective_content.add_theme_constant_override("separation", 1)
	objective_panel.add_child(objective_content)
	objective_heading = _label(objective_content, 9, Color("#326349"))
	objective_heading.text = {"ru": "ЦЕЛЬ", "be": "МЭТА", "en": "GOAL"}.get(preferences.locale, "GOAL")
	var objective_row := HBoxContainer.new()
	objective_row.add_theme_constant_override("separation", 4)
	objective_content.add_child(objective_row)
	objective_icon = TextureRect.new()
	objective_icon.custom_minimum_size = Vector2(24, 24)
	objective_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	objective_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	objective_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	objective_row.add_child(objective_icon)
	objective = _label(objective_row, 14, Color("#326349"))
	objective.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	objective.add_theme_font_size_override("font_size", 14)
	var hud_spacer := Control.new()
	hud_spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hud.add_child(hud_spacer)
	var stage_panel := PanelContainer.new()
	stage_panel.custom_minimum_size.x = 72
	stage_panel.add_theme_stylebox_override("panel", objective_style.duplicate())
	hud.add_child(stage_panel)
	var stage_content := VBoxContainer.new()
	stage_content.alignment = BoxContainer.ALIGNMENT_CENTER
	stage_content.add_theme_constant_override("separation", 1)
	stage_panel.add_child(stage_content)
	moves_heading = _label(stage_content, 9, Color("#326349"))
	moves_heading.text = {"ru": "ХОДОВ", "be": "ХАДОЎ", "en": "MOVES"}.get(preferences.locale, "MOVES")
	moves = _label(stage_content, 14, Color("#326349"))
	moves.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	moves.add_theme_font_size_override("font_size", 14)
	board_center = CenterContainer.new()
	board_center.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(board_center)
	board_frame = PanelContainer.new()
	board_frame.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var board_style := StyleBoxFlat.new()
	board_style.bg_color = Color("#243354")
	board_style.border_color = Color("#53694f")
	board_style.set_border_width_all(3)
	board_style.set_corner_radius_all(14)
	board_style.content_margin_left = 6
	board_style.content_margin_right = 6
	board_style.content_margin_top = 6
	board_style.content_margin_bottom = 6
	board_frame.add_theme_stylebox_override("panel", board_style)
	board_center.add_child(board_frame)
	board = GridContainer.new()
	board.columns = int(level_data.columns)
	board.add_theme_constant_override("h_separation", 3)
	board.add_theme_constant_override("v_separation", 3)
	board_frame.add_child(board)
	var bark_style := StyleBoxFlat.new()
	bark_style.bg_color = Color("#fff7df")
	bark_style.border_color = Color("#66755d")
	bark_style.set_border_width_all(1)
	bark_style.border_width_left = 4
	bark_style.set_corner_radius_all(9)
	bark_style.content_margin_left = 9
	bark_style.content_margin_right = 9
	bark_style.content_margin_top = 6
	bark_style.content_margin_bottom = 6
	var bark_panel := PanelContainer.new()
	bark_panel.custom_minimum_size.y = 62
	bark_panel.add_theme_stylebox_override("panel", bark_style)
	content.remove_child(bark)
	content.add_child(bark_panel)
	var bark_row := HBoxContainer.new()
	bark_row.add_theme_constant_override("separation", 7)
	bark_panel.add_child(bark_row)
	bark_portrait = TextureRect.new()
	bark_portrait.custom_minimum_size = Vector2(40, 40)
	bark_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bark_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bark_portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bark_row.add_child(bark_portrait)
	var bark_lines := VBoxContainer.new()
	bark_lines.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bark_lines.alignment = BoxContainer.ALIGNMENT_CENTER
	bark_lines.add_theme_constant_override("separation", 1)
	bark_row.add_child(bark_lines)
	bark_speaker = _label(bark_lines, 9, Color("#326349"))
	bark_speaker.add_theme_color_override("font_color", Color("#326349"))
	bark_lines.add_child(bark)
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
	hint_button = _button(bark_row)
	hint_button.custom_minimum_size = Vector2(94, 48)
	hint_button.text = ""
	_style_hint_button(hint_button)
	var hint_content := HBoxContainer.new()
	hint_content.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hint_content.offset_left = 3
	hint_content.offset_right = -3
	hint_content.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hint_content.add_theme_constant_override("separation", 3)
	hint_button.add_child(hint_content)
	var hint_icon := TextureRect.new()
	hint_icon.custom_minimum_size = Vector2(23, 23)
	hint_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hint_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hint_icon.texture = load(HINT_ICON)
	hint_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hint_content.add_child(hint_icon)
	hint_label = _label(hint_content, 9, Color("#326349"))
	hint_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
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
	bottom_spacer = Control.new()
	bottom_spacer.custom_minimum_size.y = 42
	content.add_child(bottom_spacer)
	add_child(tutorial_overlay)
	var feedback_center := CenterContainer.new()
	feedback_center.anchor_left = 0
	feedback_center.anchor_right = 1
	feedback_center.anchor_top = 0.48
	feedback_center.anchor_bottom = 0.48
	feedback_center.offset_top = -23
	feedback_center.offset_bottom = 23
	feedback_center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	feedback_center.z_index = 10
	add_child(feedback_center)
	match_feedback_panel = PanelContainer.new()
	match_feedback_panel.custom_minimum_size.x = 150
	match_feedback_panel.custom_maximum_size.x = 336
	match_feedback_panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	match_feedback_panel.pivot_offset = Vector2(168, 23)
	match_feedback_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	match_feedback_panel.visible = false
	feedback_center.add_child(match_feedback_panel)
	match_feedback_label = _label(match_feedback_panel, 13, Color("#fff9df"))
	match_feedback_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	match_feedback_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	match_feedback_label.add_theme_font_size_override("font_size", 13)
	match_feedback_label.add_theme_color_override("font_color", Color("#fff9df"))
	var feedback_serif := SystemFont.new()
	feedback_serif.font_names = PackedStringArray(["Georgia", "serif"])
	feedback_serif.font_weight = 900
	match_feedback_label.add_theme_font_override("font", feedback_serif)
	match_feedback_label.add_theme_constant_override("shadow_offset_x", 1)
	match_feedback_label.add_theme_constant_override("shadow_offset_y", 2)
	match_feedback_label.add_theme_color_override("font_shadow_color", Color("#161a2d72"))
	var feedback_style := StyleBoxFlat.new()
	feedback_style.bg_color = Color("#326349eb")
	feedback_style.border_color = Color("#fff4cf")
	feedback_style.set_border_width_all(2)
	feedback_style.set_corner_radius_all(999)
	feedback_style.content_margin_left = 14
	feedback_style.content_margin_right = 14
	feedback_style.content_margin_top = 7
	feedback_style.content_margin_bottom = 7
	feedback_style.shadow_color = Color("#161a2d72")
	feedback_style.shadow_size = 12
	feedback_style.shadow_offset = Vector2(0, 7)
	match_feedback_panel.add_theme_stylebox_override("panel", feedback_style)
	_build_evidence_transition()
	preferences.locale_changed.connect(func(_locale: String) -> void: _refresh())
	_refresh()


func _refresh() -> void:
	var locale: String = preferences.locale
	var copy: Dictionary = level_presentation.localized.get(locale, level_presentation.localized.en)
	title.text = copy.title
	title_short.text = str(level_data.get("shortId", ""))
	back_button.tooltip_text = str(copy.back)
	if is_instance_valid(dossier_button): dossier_button.tooltip_text = MenuCopy.text("dossier_title", locale)
	settings_button.tooltip_text = MenuCopy.text("settings", locale)
	objective_heading.text = {"ru": "ЦЕЛЬ", "be": "МЭТА", "en": "GOAL"}.get(locale, "GOAL")
	moves_heading.text = {"ru": "ХОДОВ", "be": "ХАДОЎ", "en": "MOVES"}.get(locale, "MOVES")
	var speaker: String
	if game.state == "playing":
		speaker = str(copy.startSpeaker)
		bark.text = str(copy.noMatchBark) if not last_feedback.is_empty() else str(copy.startText)
	else:
		speaker = str(copy.winSpeaker) if game.state == "won" else str(copy.loseSpeaker)
		bark.text = str(copy.winText) if game.state == "won" else str(copy.loseText)
	bark_speaker.text = speaker
	bark_portrait.texture = _speaker_portrait(speaker)
	tutorial_title.text = str(Level.data.localized[locale].tutorialTitle)
	tutorial_eyebrow.text = {"ru": "ОБУЧЕНИЕ", "be": "НАВУЧАННЕ", "en": "HOW TO PLAY"}.get(locale, "HOW TO PLAY")
	tutorial_body.text = str(Level.data.localized[locale].tutorialBody)
	tutorial_button.text = str(Level.data.localized[locale].tutorialTry)
	tutorial_panel.visible = level_id == str(Level.data.id) and not session.save.tutorialsCompleted.has("basic-swap")
	var objective_lines := PackedStringArray()
	for index in level_data.objectives.size():
		var objective_data: Dictionary = level_data.objectives[index]
		objective_lines.append("%d/%d" % [game.objective_value(index), int(objective_data.target)])
	objective.text = " · ".join(objective_lines)
	objective_icon.texture = _objective_texture(level_data.objectives[0]) if not level_data.objectives.is_empty() else null
	moves.text = str(game.moves_left)
	hint_label.text = MenuCopy.text("match3_hint", locale)
	hint_button.disabled = game.state != "playing" or tutorial_panel.visible
	warning.text = "" if session.last_write_ok and (story_session == null or story_session.last_write_ok) else MenuCopy.text("story_save_error", locale)
	warning.visible = not warning.text.is_empty()
	if not match_feedback_key.is_empty():
		match_feedback_label.text = _feedback_text(match_feedback_key, match_feedback_cascade)
	result_label.text = copy.win if game.state == "won" else copy.lose if game.state == "lost" else ""
	result_label.visible = game.state == "lost"
	result_box.visible = game.state == "lost"
	bottom_spacer.visible = game.state == "playing"
	retry_button.text = copy.retry
	result_back_button.text = copy.back
	var won: bool = game.state == "won"
	board_center.visible = not won
	tutorial_panel.visible = not won and level_id == str(Level.data.id) and not session.save.tutorialsCompleted.has("basic-swap")
	tutorial_overlay.visible = tutorial_panel.visible
	objective.visible = not won
	moves.visible = not won
	if won and not campaign_mode and story_session != null:
		story_evidence_visible = true
	if story_evidence_visible:
		_show_story_evidence_transition()
	evidence_panel.visible = won and campaign_mode
	evidence_transition_overlay.visible = won and not campaign_mode and story_evidence_visible
	if campaign_mode:
		evidence_kicker.visible = false
		evidence_image.visible = false
		evidence_title.text = str(copy.win)
		evidence_label.text = str(copy.resultDetail).replace("{movesLeft}", str(game.moves_left))
		evidence_continue.text = str(copy.backToCampaign)
	else:
		var evidence: Dictionary = level_data.evidence
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
		var tile_button := Button.new()
		tile_button.custom_minimum_size = Vector2(54, 54)
		tile_button.clip_contents = false
		tile_button.focus_mode = Control.FOCUS_NONE
		var cell_style := StyleBoxFlat.new()
		cell_style.bg_color = Color("#2e4266")
		cell_style.border_color = Color(0.45, 0.52, 0.46, 0.57)
		cell_style.set_border_width_all(1)
		cell_style.set_corner_radius_all(4)
		var selected_style := cell_style.duplicate() as StyleBoxFlat
		selected_style.border_color = Color("#fff6cf")
		selected_style.set_border_width_all(3)
		var hinted_style := cell_style.duplicate() as StyleBoxFlat
		hinted_style.border_color = Color("#7ddfd8")
		hinted_style.set_border_width_all(3)
		hinted_style.shadow_color = Color("#6ce2d3")
		hinted_style.shadow_size = 12
		hinted_style.shadow_offset = Vector2.ZERO
		var hover_style := cell_style.duplicate() as StyleBoxFlat
		hover_style.bg_color = Color("#3a5278")
		tile_button.add_theme_stylebox_override("normal", selected_style if index == selected_index else hinted_style if hinted_indices.has(index) else cell_style)
		tile_button.add_theme_stylebox_override("hover", hover_style)
		tile_button.add_theme_stylebox_override("pressed", selected_style)
		tile_button.add_theme_stylebox_override("disabled", cell_style)
		tile_button.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
		tile_button.add_theme_color_override("font_color", Color.TRANSPARENT)
		tile_button.add_theme_color_override("font_disabled_color", Color.TRANSPARENT)
		tile_button.text = ""
		var tile_stack := Control.new()
		tile_stack.name = "TileStack"
		tile_stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		tile_stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tile_stack.clip_contents = false
		tile_stack.z_index = 0
		var tile_asset := str(campaign_bundle.assets.tiles.get(game.tiles[index], ""))
		if not tile_asset.is_empty():
			var tile := TextureRect.new()
			tile.name = "Tile"
			tile.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
			tile.offset_left = 2
			tile.offset_top = 2
			tile.offset_right = -2
			tile.offset_bottom = -2
			tile.texture = load("res://" + tile_asset.trim_prefix("./"))
			tile.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tile.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			tile.mouse_filter = Control.MOUSE_FILTER_IGNORE
			tile_stack.add_child(tile)
		var tile_tint := Color(1.25, 1.25, 1, 1) if index == selected_index else Color.WHITE
		tile_stack.modulate = Color(0.35, 0.38, 0.45, 0.7) if game.tiles[index].is_empty() else tile_tint
		tile_button.disabled = game.state != "playing" or tutorial_panel.visible or game.tiles[index].is_empty() or game.blocker_layers[index] > 0
		tile_button.pressed.connect(_select_cell.bind(index))
		tile_button.add_child(tile_stack)
		if hinted_indices.has(index):
			tile_button.pivot_offset = Vector2(27, 27)
			var hint_tween := tile_button.create_tween().set_loops()
			hint_tween.tween_property(tile_button, "scale", Vector2(0.91, 0.91), 0.41).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
			hint_tween.parallel().tween_property(tile_button, "modulate", Color(1.18, 1.18, 1.18, 1.0), 0.41).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
			hint_tween.tween_property(tile_button, "scale", Vector2.ONE, 0.41).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
			hint_tween.parallel().tween_property(tile_button, "modulate", Color.WHITE, 0.41).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
		if game.blocker_layers[index] > 0:
			var blocker_asset := str(campaign_bundle.assets.blockers.get(str(level_data.blockerStyle), ""))
			if str(level_data.blockerStyle) == "locked": blocker_asset = str(campaign_bundle.assets.lockedBlockers.get(str(game.blocker_layers[index]), blocker_asset))
			if not blocker_asset.is_empty():
				var blocker := TextureRect.new()
				blocker.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
				blocker.offset_left = 1
				blocker.offset_top = 1
				blocker.offset_right = -1
				blocker.offset_bottom = -1
				blocker.texture = load("res://" + blocker_asset.trim_prefix("./"))
				blocker.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				blocker.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
				blocker.modulate = Color(1, 1, 1, 0.66)
				blocker.mouse_filter = Control.MOUSE_FILTER_IGNORE
				tile_button.add_child(blocker)
				if game.blocker_layers[index] > 1:
					var layer_badge := Label.new()
					layer_badge.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT)
					layer_badge.offset_left = -17
					layer_badge.offset_top = -17
					layer_badge.offset_right = -1
					layer_badge.offset_bottom = -1
					layer_badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
					layer_badge.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
					layer_badge.text = str(game.blocker_layers[index])
					layer_badge.add_theme_font_size_override("font_size", 9)
					layer_badge.add_theme_color_override("font_color", Color.WHITE)
					layer_badge.add_theme_color_override("font_shadow_color", Color("#182238"))
					layer_badge.add_theme_constant_override("shadow_offset_x", 1)
					layer_badge.add_theme_constant_override("shadow_offset_y", 1)
					layer_badge.mouse_filter = Control.MOUSE_FILTER_IGNORE
					tile_button.add_child(layer_badge)
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
				tile_stack.add_child(ingredient)
		if not game.specials[index].is_empty():
			var special_asset := str(campaign_bundle.assets.get("specials", {}).get(game.specials[index], ""))
			if not special_asset.is_empty():
				var special := TextureRect.new()
				special.name = "Special"
				special.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
				special.offset_left = -7
				special.offset_top = -7
				special.offset_right = 7
				special.offset_bottom = 7
				special.texture = load("res://" + special_asset.trim_prefix("./"))
				special.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				special.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
				special.mouse_filter = Control.MOUSE_FILTER_IGNORE
				tile_stack.add_child(special)
		board.add_child(tile_button)


func _render_frame(frame: Dictionary) -> void:
	var old_tiles: Array[String] = game.tiles
	var old_specials: Array[String] = game.specials
	var old_blockers: Array[int] = game.blocker_layers
	var old_ingredients: Array[String] = game.ingredients
	game.tiles = frame.tiles.duplicate()
	game.specials = frame.specials.duplicate()
	game.blocker_layers = frame.blockers.duplicate()
	game.ingredients = frame.ingredients.duplicate()
	_render_board()
	game.tiles = old_tiles
	game.specials = old_specials
	game.blocker_layers = old_blockers
	game.ingredients = old_ingredients
	if str(frame.phase) == "clear":
		_show_match_feedback(str(frame.get("feedback", "match")), int(frame.get("cascade", 1)))
		_animate_special_impact(frame)
		for index_value in frame.cleared:
			var cell := board.get_child(int(index_value)) as Control
			var tile_stack := cell.get_node_or_null("TileStack") as Control
			if tile_stack == null: continue
			var tween := create_tween()
			tween.tween_property(tile_stack, "scale", Vector2(1.1, 1.1), CLEAR_MOTION_SECONDS * 0.48).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			tween.parallel().tween_property(tile_stack, "modulate", Color(1.55, 1.55, 1.55, 1.0), CLEAR_MOTION_SECONDS * 0.48)
			tween.tween_property(tile_stack, "scale", Vector2(0.18, 0.18), CLEAR_MOTION_SECONDS * 0.52).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN)
			tween.parallel().tween_property(tile_stack, "modulate", Color(1.8, 1.8, 1.8, 0.0), CLEAR_MOTION_SECONDS * 0.52)
	elif str(frame.phase) == "settle":
		for motion_value in frame.motions:
			var motion: Dictionary = motion_value
			var cell := board.get_child(int(motion.index)) as Control
			var tile_stack := cell.get_node_or_null("TileStack") as Control
			if tile_stack == null: continue
			var distance := float(motion.rows) * (cell.size.y + float(board.get_theme_constant("v_separation")))
			tile_stack.position.y = -distance
			tile_stack.modulate.a = 0.05 if bool(motion.spawn) else 1.0
			var tween := create_tween()
			tween.tween_property(tile_stack, "position:y", 0.0, SETTLE_MOTION_SECONDS).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			tween.parallel().tween_property(tile_stack, "modulate:a", 1.0, SETTLE_MOTION_SECONDS * 0.68)
			tween.parallel().tween_property(tile_stack, "scale", Vector2(1.015, 1.015), SETTLE_MOTION_SECONDS * 0.72)
			tween.tween_property(tile_stack, "scale", Vector2.ONE, SETTLE_MOTION_SECONDS * 0.28)
	elif str(frame.phase) == "reshuffle":
		_show_match_feedback("reshuffled")
		for cell_value in board.get_children():
			var cell := cell_value as Control
			var tile_stack := cell.get_node_or_null("TileStack") as Control
			if tile_stack == null: continue
			tile_stack.scale = Vector2(0.82, 0.82)
			tile_stack.rotation_degrees = -2.0
			tile_stack.modulate.a = 0.45
			var tween := create_tween()
			tween.tween_property(tile_stack, "scale", Vector2(1.04, 1.04), RESHUFFLE_MOTION_SECONDS * 0.65).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			tween.parallel().tween_property(tile_stack, "rotation_degrees", 1.0, RESHUFFLE_MOTION_SECONDS * 0.65)
			tween.parallel().tween_property(tile_stack, "modulate:a", 1.0, RESHUFFLE_MOTION_SECONDS * 0.65)
			tween.tween_property(tile_stack, "scale", Vector2.ONE, RESHUFFLE_MOTION_SECONDS * 0.35).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			tween.parallel().tween_property(tile_stack, "rotation_degrees", 0.0, RESHUFFLE_MOTION_SECONDS * 0.35)


func _animate_swap(first: int, second: int, return_to_start: bool) -> void:
	if first == second or first < 0 or second < 0 or first >= board.get_child_count() or second >= board.get_child_count():
		await get_tree().create_timer(SWAP_MOTION_SECONDS).timeout
		return
	var first_cell := board.get_child(first) as Control
	var second_cell := board.get_child(second) as Control
	var first_stack := first_cell.get_node_or_null("TileStack") as Control
	var second_stack := second_cell.get_node_or_null("TileStack") as Control
	if first_stack == null or second_stack == null: return
	var offset := second_cell.position - first_cell.position
	first_stack.z_index = 8
	second_stack.z_index = 8
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(first_stack, "position", offset, SWAP_MOTION_SECONDS).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	tween.tween_property(second_stack, "position", -offset, SWAP_MOTION_SECONDS).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	await tween.finished
	if return_to_start:
		var back := create_tween()
		back.set_parallel(true)
		back.tween_property(first_stack, "position", Vector2.ZERO, SWAP_MOTION_SECONDS).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		back.tween_property(second_stack, "position", Vector2.ZERO, SWAP_MOTION_SECONDS).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		await back.finished
	first_stack.position = Vector2.ZERO
	second_stack.position = Vector2.ZERO
	first_stack.z_index = 0
	second_stack.z_index = 0


func _feedback_text(key: String, count: int = 1) -> String:
	var copy_key := "match3_feedback_" + key
	return MenuCopy.text(copy_key, preferences.locale).replace("{count}", str(count))


func _show_match_feedback(kind: String, cascade: int = 1, localized_key: String = "") -> void:
	if not is_instance_valid(match_feedback_panel) or not is_instance_valid(match_feedback_label): return
	if match_feedback_tween != null and match_feedback_tween.is_valid(): match_feedback_tween.kill()
	match_feedback_key = localized_key if not localized_key.is_empty() else kind
	match_feedback_kind = kind
	match_feedback_cascade = cascade
	match_feedback_label.text = _feedback_text(match_feedback_key, cascade)
	var colors := {
		"match": Color("#326349eb"), "special": Color("#c07f35ef"), "combo": Color("#c07f35ef"),
		"chain": Color("#c07f35ef"), "reshuffled": Color("#4c5577ef"), "reject": Color("#9a4955eb"),
		"win": Color("#28715aec"), "loss": Color("#803f4dec"),
	}
	var feedback_style := match_feedback_panel.get_theme_stylebox("panel").duplicate() as StyleBoxFlat
	feedback_style.bg_color = colors.get(kind, colors.match)
	match_feedback_panel.add_theme_stylebox_override("panel", feedback_style)
	match_feedback_panel.visible = true
	match_feedback_panel.scale = Vector2(0.86, 0.86)
	match_feedback_panel.modulate.a = 0.0
	match_feedback_tween = create_tween()
	match_feedback_tween.set_parallel(true)
	match_feedback_tween.tween_property(match_feedback_panel, "scale", Vector2.ONE, 0.1).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	match_feedback_tween.tween_property(match_feedback_panel, "modulate:a", 1.0, 0.1)


func _clear_match_feedback() -> void:
	if match_feedback_tween != null and match_feedback_tween.is_valid(): match_feedback_tween.kill()
	match_feedback_key = ""
	match_feedback_panel.visible = false


func _build_evidence_transition() -> void:
	evidence_transition_overlay = Control.new()
	evidence_transition_overlay.name = "EvidenceTransition"
	evidence_transition_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	evidence_transition_overlay.z_index = 20
	evidence_transition_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	evidence_transition_overlay.visible = false
	add_child(evidence_transition_overlay)
	var blurred_background := TextureRect.new()
	blurred_background.name = "EvidenceBackground"
	blurred_background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	blurred_background.texture = background.texture
	blurred_background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	blurred_background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	blurred_background.material = _evidence_blur_material()
	blurred_background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	evidence_transition_overlay.add_child(blurred_background)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	center.offset_left = 22
	center.offset_right = -22
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	evidence_transition_overlay.add_child(center)
	var panel := PanelContainer.new()
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var paper := StyleBoxFlat.new()
	paper.bg_color = Color("#fffaf2f2")
	paper.set_corner_radius_all(14)
	paper.content_margin_left = 24
	paper.content_margin_right = 24
	paper.content_margin_top = 27
	paper.content_margin_bottom = 27
	paper.shadow_color = Color("#0a0c18a3")
	paper.shadow_size = 24
	paper.shadow_offset = Vector2(0, 12)
	panel.add_theme_stylebox_override("panel", paper)
	center.add_child(panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 8)
	panel.add_child(content)
	evidence_transition_kicker = _label(content, 10, Color("#d96279"))
	evidence_transition_kicker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	evidence_transition_image = TextureRect.new()
	evidence_transition_image.custom_minimum_size = Vector2(150, 150)
	evidence_transition_image.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
	evidence_transition_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	content.add_child(evidence_transition_image)
	evidence_transition_title = _label(content, 29, Color("#29243d"))
	evidence_transition_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var title_serif := SystemFont.new()
	title_serif.font_names = PackedStringArray(["Georgia", "Noto Serif", "Liberation Serif", "serif"])
	title_serif.font_weight = 800
	evidence_transition_title.add_theme_font_override("font", title_serif)
	evidence_transition_copy = RichTextLabel.new()
	evidence_transition_copy.bbcode_enabled = true
	evidence_transition_copy.fit_content = true
	evidence_transition_copy.scroll_active = false
	evidence_transition_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	evidence_transition_copy.add_theme_color_override("default_color", Color("#746d7c"))
	evidence_transition_copy.add_theme_font_size_override("normal_font_size", 15)
	var copy_serif := SystemFont.new()
	copy_serif.font_names = PackedStringArray(["Georgia", "Noto Serif", "Liberation Serif", "serif"])
	evidence_transition_copy.add_theme_font_override("normal_font", copy_serif)
	content.add_child(evidence_transition_copy)
	evidence_transition_continue = Button.new()
	Style.style_button(evidence_transition_continue, true)
	evidence_transition_continue.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_child(evidence_transition_continue)
	evidence_transition_continue.pressed.connect(_continue_story)


func _evidence_blur_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
	shader_type canvas_item;
	void fragment() {
		vec2 blur = TEXTURE_PIXEL_SIZE * 3.0;
		vec3 color = texture(TEXTURE, UV).rgb * 0.20;
		color += texture(TEXTURE, UV + vec2(blur.x, 0.0)).rgb * 0.10;
		color += texture(TEXTURE, UV - vec2(blur.x, 0.0)).rgb * 0.10;
		color += texture(TEXTURE, UV + vec2(0.0, blur.y)).rgb * 0.10;
		color += texture(TEXTURE, UV - vec2(0.0, blur.y)).rgb * 0.10;
		color += texture(TEXTURE, UV + blur).rgb * 0.10;
		color += texture(TEXTURE, UV - blur).rgb * 0.10;
		color += texture(TEXTURE, UV + vec2(blur.x, -blur.y)).rgb * 0.10;
		color += texture(TEXTURE, UV + vec2(-blur.x, blur.y)).rgb * 0.10;
		COLOR = vec4(color * 0.45, 1.0);
	}
	"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material


func _show_story_evidence_transition() -> void:
	if campaign_mode or story_session == null: return
	var locale: String = preferences.locale
	var evidence: Dictionary = level_data.get("evidence", {})
	var localized: Dictionary = evidence.get("localized", {}).get(locale, evidence.get("localized", {}).get("en", {}))
	var copy: Dictionary = level_presentation.localized.get(locale, level_presentation.localized.en)
	evidence_transition_overlay.get_node("EvidenceBackground").texture = background.texture
	evidence_transition_kicker.text = str(localized.get("evidenceFound", MenuCopy.text("dossier_updated", locale)))
	evidence_transition_image.texture = load("res://" + str(evidence.get("asset", "")).trim_prefix("./"))
	evidence_transition_title.text = str(localized.get("title", ""))
	var win_speaker := str(copy.get("winSpeaker", ""))
	var win_text := str(copy.get("winText", "")).replace("[", "[lb]")
	evidence_transition_copy.text = "[b]%s:[/b] %s" % [win_speaker, win_text]
	evidence_transition_continue.text = str(localized.get("continueStory", MenuCopy.text("vn_next", locale)))
	story_evidence_visible = true
	evidence_transition_overlay.visible = true


func _invalid_feedback_key(reason: String) -> String:
	return {
		"no-match": "no_match", "blocked": "move_blocked", "ingredient": "story_object_locked",
		"not-adjacent": "adjacent_only",
	}.get(reason, "swap_unavailable")


func _animate_special_impact(frame: Dictionary) -> void:
	var special_kinds: Array = frame.get("specials", [])
	var cleared: Array = frame.get("cleared", [])
	var has_activated_special := false
	for index_value in cleared:
		var index := int(index_value)
		if index >= 0 and index < special_kinds.size() and not str(special_kinds[index]).is_empty():
			has_activated_special = true
			break
	if not has_activated_special: return
	for index_value in cleared:
		var index := int(index_value)
		if index < 0 or index >= board.get_child_count(): continue
		var cell := board.get_child(index) as Control
		var flash := ColorRect.new()
		flash.name = "SpecialImpactFlash"
		flash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		flash.color = Color("#fff2a8")
		flash.modulate.a = 0.0
		flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
		flash.z_index = 7
		cell.add_child(flash)
		var flash_tween := create_tween()
		flash_tween.tween_property(flash, "modulate:a", 0.45, 0.095).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		flash_tween.tween_property(flash, "modulate:a", 0.0, 0.185).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		flash_tween.finished.connect(flash.queue_free)
		var impact_tween := create_tween()
		impact_tween.tween_property(cell, "scale", Vector2(1.055, 1.055), 0.118).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		impact_tween.tween_property(cell, "scale", Vector2.ONE, 0.162).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		var special_kind := str(special_kinds[index]) if index < special_kinds.size() else ""
		if special_kind.is_empty(): continue
		var tile_stack := cell.get_node_or_null("TileStack") as Control
		var special_icon := tile_stack.get_node_or_null("Special") as Control if tile_stack != null else null
		if special_icon != null:
			special_icon.pivot_offset = special_icon.size * 0.5
			special_icon.scale = Vector2(0.82, 0.82)
			special_icon.rotation_degrees = -8.0
			var icon_tween := create_tween()
			icon_tween.tween_property(special_icon, "scale", Vector2(1.24, 1.24), 0.118).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			icon_tween.parallel().tween_property(special_icon, "rotation_degrees", 4.0, 0.118)
			icon_tween.tween_property(special_icon, "scale", Vector2.ONE, 0.162).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			icon_tween.parallel().tween_property(special_icon, "rotation_degrees", 0.0, 0.162)
		if special_kind == "flash-row" or special_kind == "flash-column":
			var beam := ColorRect.new()
			beam.name = "SpecialImpactBeam"
			beam.color = Color("#6ce2d3")
			beam.modulate.a = 0.0
			beam.mouse_filter = Control.MOUSE_FILTER_IGNORE
			beam.z_index = 8
			if special_kind == "flash-row":
				beam.anchor_left = -0.18
				beam.anchor_right = 1.18
				beam.anchor_top = 0.44
				beam.anchor_bottom = 0.56
			else:
				beam.anchor_left = 0.44
				beam.anchor_right = 0.56
				beam.anchor_top = -0.18
				beam.anchor_bottom = 1.18
			cell.add_child(beam)
			var beam_tween := create_tween()
			beam_tween.tween_property(beam, "modulate:a", 0.95, 0.098).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			beam_tween.tween_property(beam, "modulate:a", 0.0, 0.182).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			beam_tween.finished.connect(beam.queue_free)


func _play_move_frames(result: Dictionary, first: int, second: int) -> void:
	input_locked = true
	var valid := bool(result.valid)
	if valid:
		_clear_match_feedback()
		for frame_value in result.get("frames", []):
			var frame: Dictionary = frame_value
			if str(frame.phase) == "swap":
				await _animate_swap(first, second, false)
				_render_frame(frame)
			elif str(frame.phase) == "clear":
				_render_frame(frame)
				await get_tree().create_timer(CLEAR_MOTION_SECONDS).timeout
			elif str(frame.phase) == "settle":
				_render_frame(frame)
				await get_tree().create_timer(SETTLE_MOTION_SECONDS).timeout
			elif str(frame.phase) == "reshuffle":
				_render_frame(frame)
				await get_tree().create_timer(RESHUFFLE_MOTION_SECONDS).timeout
		_render_board()
		if bool(result.get("reshuffled", false)):
			_show_match_feedback("reshuffled")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif int(result.get("cascades", 0)) >= 2:
			_show_match_feedback("chain", int(result.cascades))
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif int(result.get("ingredientsDropped", 0)) > 0:
			_show_match_feedback("match", 1, "clue_collected")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif game.state == "lost":
			_show_match_feedback("loss", 1, "out_of_moves")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif game.state == "won":
			_show_match_feedback("win", 1, "clue_collected")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		_clear_match_feedback()
	else:
		_show_match_feedback("reject", 1, _invalid_feedback_key(str(result.get("reason", ""))))
		if str(result.get("reason", "")) == "no-match":
			await _animate_swap(first, second, true)
		var rejected := [board.get_child(first), board.get_child(second)]
		for cell_value in rejected:
			var cell := cell_value as Control
			var tile_stack := cell.get_node_or_null("TileStack") as Control
			if tile_stack == null: continue
			var tween := create_tween()
			for offset in [-5.0, 5.0, -3.0, 0.0]:
				tween.tween_property(tile_stack, "position:x", offset, 0.055)
		await get_tree().create_timer(0.70).timeout
		_clear_match_feedback()
	_render_board()
	input_locked = false


func _speaker_portrait(speaker: String) -> Texture2D:
	var normalized := speaker.to_lower()
	var character := "miku"
	if ["onoe", "оноэ", "онoэ"].any(func(name: String) -> bool: return normalized.contains(name)):
		character = "onoe"
	elif ["ayuki", "аюки"].any(func(name: String) -> bool: return normalized.contains(name)):
		character = "ayuki"
	var path := "res://assets/characters/%s/portrait_neutral_256.png" % character
	return load(path) as Texture2D if ResourceLoader.exists(path) else null


func _new_game_for_attempt() -> RefCounted:
	var runtime_level: Dictionary = level_data.duplicate(true)
	runtime_level.erase("openingBoard")
	runtime_level.erase("seededOpeningBoard")
	var attempt := int(session.save.attempts.get(level_id, 0))
	runtime_level.seed = int(level_data.seed) + attempt * 101
	return Game.new(runtime_level)


func _select_cell(index: int) -> void:
	if input_locked or game.state != "playing" or tutorial_panel.visible:
		return
	var now := Time.get_ticks_msec()
	if not game.specials[index].is_empty() and selected_index == index and last_tapped_special_index == index and now - last_tapped_special_at <= 360:
		selected_index = -1
		last_tapped_special_index = -1
		last_tapped_special_at = -1
		hinted_indices.clear()
		var special_result: Dictionary = game.attempt_special_activation(index)
		last_feedback = "" if special_result.valid else str(special_result.reason)
		if special_result.valid:
			await _play_move_frames(special_result, index, index)
		if special_result.valid and game.state == "won":
			session.complete_level(level_id, game.moves_left)
			if not campaign_mode and story_session != null: story_session.complete_match3(level_id)
			_show_story_evidence_transition()
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
	var first_index := selected_index
	var result: Dictionary = game.attempt_swap(first_index, index)
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
	await _play_move_frames(result, first_index, index)
	if result.valid and game.state == "won":
		_show_story_evidence_transition()
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
	session.start_level(level_id)
	game = _new_game_for_attempt()
	selected_index = -1
	last_feedback = ""
	_refresh()


func _continue_story() -> void:
	if story_evidence_visible and story_session != null:
		clue_awarded.emit(str(level_data.get("evidence", {}).get("id", "")))
		story_evidence_visible = false
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


func _header_icon_button(parent: Node, icon_name: String) -> Button:
	var button := _button(parent)
	button.custom_minimum_size = Vector2(44, 44)
	button.text = ""
	_add_header_icon(button, icon_name)
	_style_header_button(button)
	return button


func _add_header_icon(button: Button, icon_name: String) -> void:
	var icon := TextureRect.new()
	icon.name = "HeaderIcon"
	icon.anchor_left = 0.5
	icon.anchor_right = 0.5
	icon.anchor_top = 0.5
	icon.anchor_bottom = 0.5
	icon.offset_left = -10.5
	icon.offset_right = 10.5
	icon.offset_top = -10.5
	icon.offset_bottom = 10.5
	icon.texture = load("res://assets/ui/icon_%s.svg" % icon_name)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	button.add_child(icon)


func _header_text_button(parent: Node, text: String) -> Button:
	var button := _button(parent)
	button.custom_minimum_size = Vector2(44, 44)
	button.text = text
	button.add_theme_color_override("font_color", Color.WHITE)
	button.add_theme_color_override("font_hover_color", Color.WHITE)
	_style_header_button(button)
	return button


func _style_header_button(button: Button, background: Color = Color("#0b2038")) -> void:
	button.custom_minimum_size = Vector2(44, 44)
	button.add_theme_font_size_override("font_size", 15)
	button.add_theme_color_override("font_color", Color.WHITE)
	button.add_theme_color_override("font_hover_color", Color.WHITE)
	button.add_theme_color_override("font_pressed_color", Color.WHITE)
	var normal := StyleBoxFlat.new()
	normal.bg_color = background
	normal.border_color = Color("#e3ca84")
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(10)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#294a69")
	var pressed := normal.duplicate() as StyleBoxFlat
	pressed.bg_color = Color("#1d3551")
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("pressed", pressed)


func _style_hint_button(button: Button) -> void:
	button.custom_minimum_size = Vector2(94, 48)
	button.add_theme_font_size_override("font_size", 9)
	button.add_theme_color_override("font_color", Color("#326349"))
	button.add_theme_color_override("font_hover_color", Color("#244d39"))
	var transparent := StyleBoxFlat.new()
	transparent.bg_color = Color.TRANSPARENT
	transparent.set_border_width_all(0)
	button.add_theme_stylebox_override("normal", transparent)
	button.add_theme_stylebox_override("hover", transparent)
	button.add_theme_stylebox_override("pressed", transparent)


func _objective_texture(objective_data: Dictionary) -> Texture2D:
	var assets: Dictionary = campaign_bundle.get("assets", {})
	var asset_group := ""
	var asset_key := ""
	match str(objective_data.get("kind", "")):
		"collect":
			asset_group = "tiles"
			asset_key = str(objective_data.get("tile", ""))
		"drop":
			asset_group = "ingredients"
			asset_key = str(objective_data.get("ingredient", ""))
		"dropGroup":
			asset_group = "ingredients"
			var ingredients_group: Array = objective_data.get("ingredients", [])
			asset_key = str(ingredients_group[0]) if not ingredients_group.is_empty() else ""
		"clearBlockers":
			asset_group = "blockers"
			asset_key = str(level_data.get("blockerStyle", "solid"))
	var asset_path := str(assets.get(asset_group, {}).get(asset_key, ""))
	if asset_path.is_empty(): return null
	return load("res://" + asset_path.trim_prefix("./")) as Texture2D


func _show_help() -> void:
	if is_instance_valid(help_dialog):
		help_dialog.popup_centered()
		return
	help_dialog = AcceptDialog.new()
	help_dialog.title = MenuCopy.text("match3_help_title", preferences.locale)
	help_dialog.dialog_text = MenuCopy.text("match3_help_body", preferences.locale)
	help_dialog.min_size = Vector2i(350, 260)
	add_child(help_dialog)
	help_dialog.confirmed.connect(func() -> void:
		help_dialog.queue_free()
		help_dialog = null
	)
	help_dialog.close_requested.connect(func() -> void:
		help_dialog.queue_free()
		help_dialog = null
	)
	help_dialog.popup_centered()


func _style_tutorial_button(button: Button) -> void:
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.custom_minimum_size.y = 48
	button.add_theme_font_size_override("font_size", 15)
	button.add_theme_color_override("font_color", Color.WHITE)
	button.add_theme_color_override("font_hover_color", Color.WHITE)
	button.add_theme_color_override("font_pressed_color", Color.WHITE)
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("#326349")
	normal.border_color = Color("#d3b068")
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(5)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#244d39")
	var pressed := normal.duplicate() as StyleBoxFlat
	pressed.bg_color = Color("#1c402f")
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("pressed", pressed)
