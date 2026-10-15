extends Control

signal story_requested
signal dossier_requested
signal settings_requested
signal clue_awarded(clue_id: String)
signal campaign_next_requested(level_id: String)

const Level = preload("res://data/locker_match3.json")
const Game = preload("res://scripts/match3_game.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const Tutorials = preload("res://scripts/match3_tutorials.gd")
const CssMotion = preload("res://scripts/css_motion.gd")
const Match3DropShadow = preload("res://shaders/match3_drop_shadow.gdshader")
const ReducedMotion = preload("res://scripts/reduced_motion.gd")
const UiFonts = preload("res://scripts/ui_fonts.gd")
const MenuCopy = preload("res://scripts/menu_copy.gd")
const ReactionRuntime = preload("res://scripts/match3_reaction_runtime.gd")
const Style = preload("res://scripts/menu_theme.gd")
const PhoneFrame = preload("res://scripts/phone_frame.gd")
const SWAP_MOTION_SECONDS := 0.15
const INVALID_HOLD_SECONDS := 0.70
const CLEAR_MOTION_SECONDS := 0.28
const SETTLE_MOTION_SECONDS := 0.32
const RESHUFFLE_MOTION_SECONDS := 0.46
const FEEDBACK_HOLD_SECONDS := 0.42
const HINT_ICON := "res://assets/match3/special_observation_magnifier.png"

static var _drop_shadow_material_cache: Dictionary = {}
static var _special_icon_material_cache: ShaderMaterial
static var _match_background_material_cache: ShaderMaterial

var preferences: RefCounted
var session: RefCounted
var story_session: RefCounted
var game: RefCounted
var reaction_runtime := ReactionRuntime.new()
var level_id := ""
var campaign_mode := false
var _reduced_motion_override: Variant = null
var level_data: Dictionary
var level_presentation: Dictionary
var campaign_bundle: Dictionary
var selected_index := -1
var hinted_indices: Array[int] = []
var last_tapped_special_index := -1
var last_tapped_special_at := -1
var last_feedback := ""
var triggered_reactions: Dictionary = {}
var reaction_presented_at: Dictionary = {}
var active_reaction: Dictionary = {}
var reaction_generation := 0
var reaction_blockers_cleared := 0
var reaction_tween: Tween
var background: TextureRect
var background_base: ColorRect
var title: Label
var title_short: Label
var bark: Label
var bark_panel: PanelContainer
var bark_slot: Control
var bark_base_style: StyleBoxFlat
var bark_speaker: Label
var bark_portrait_frame: Panel
var bark_portrait: TextureRect
var tutorial_panel: PanelContainer
var tutorial_frame: PanelContainer
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
var board_top_spacer: Control
var board_frame: PanelContainer
var back_button: Button
var evidence_transition_overlay: Control
var evidence_transition_image: TextureRect
var evidence_transition_kicker: Label
var evidence_transition_title: Label
var evidence_transition_copy: RichTextLabel
var evidence_transition_continue: Button
var story_evidence_visible := false
var campaign_result_overlay: Control
var campaign_result_back: Button
var campaign_result_eyebrow: Label
var campaign_result_level: Label
var campaign_result_mark: Label
var campaign_result_kicker: Label
var campaign_result_heading: Label
var campaign_result_detail: Label
var campaign_result_loss_quote: RichTextLabel
var campaign_result_next: Button
var campaign_result_retry: Button
var campaign_result_hub: Button
var input_locked := false
var drag_start_index := -1
var drag_start_position := Vector2.ZERO
var drag_start_cell_size := 1.0
var drag_target_index := -1
var suppress_drag_click_index := -1
var bottom_spacer: Control
var guidance_labels: Array[Label] = []
var tutorial_reveal_events: Array[String] = []
var active_tutorial := ""
var tutorial_prompt_dismissed := false


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
	background_base = ColorRect.new()
	background_base.name = "MatchBackgroundBase"
	background_base.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background_base.color = Color("#d9d0b6")
	background_base.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background_base)
	background = TextureRect.new()
	background.name = "MatchBackground"
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var background_asset := str(campaign_bundle.assets.backgrounds.get(str(level_data.get("pageBackground", "")), ""))
	assert(not background_asset.is_empty(), "Match-3 level has no authored page background: " + level_id)
	background.texture = load("res://" + background_asset.trim_prefix("./"))
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background.modulate.a = 0.96
	background.material = _match_background_material()
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	var layout := VBoxContainer.new()
	layout.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layout.add_theme_constant_override("separation", 10)
	add_child(layout)
	var margin := MarginContainer.new()
	margin.size_flags_vertical = Control.SIZE_EXPAND_FILL
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 12)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 7)
	margin.add_child(content)
	var header_panel := PanelContainer.new()
	header_panel.custom_minimum_size.y = 60
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color("#10243d")
	header_style.border_color = Color("#d3b068")
	header_style.border_width_bottom = 2
	header_style.content_margin_left = 9
	header_style.content_margin_right = 9
	header_style.content_margin_top = 0
	header_style.content_margin_bottom = 0
	header_panel.add_theme_stylebox_override("panel", header_style)
	layout.add_child(header_panel)
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
	title.add_theme_font_override("font", UiFonts.serif(800))
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
	layout.add_child(margin)
	bark = _label(content, 15, Color.WHITE)
	bark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	bark.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bark.add_theme_font_size_override("font_size", 12)
	bark.add_theme_color_override("font_color", Color("#29243d"))
	tutorial_panel = PanelContainer.new()
	var tutorial_style := StyleBoxFlat.new()
	tutorial_style.bg_color = Color("#fff7df")
	tutorial_style.border_color = Color("#d5b269")
	tutorial_style.set_border_width_all(3)
	tutorial_style.border_width_left = 8
	tutorial_style.set_corner_radius_all(7)
	tutorial_style.content_margin_left = 26
	tutorial_style.content_margin_right = 26
	tutorial_style.content_margin_top = 30
	tutorial_style.content_margin_bottom = 18
	tutorial_panel.add_theme_stylebox_override("panel", tutorial_style)
	content.add_child(tutorial_panel)
	var tutorial_content := VBoxContainer.new()
	tutorial_content.name = "TutorialContent"
	tutorial_content.add_theme_constant_override("separation", 0)
	var tutorial_content_layer := Control.new()
	tutorial_content_layer.name = "TutorialContentLayer"
	tutorial_panel.add_child(tutorial_content_layer)
	tutorial_content.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_content_layer.add_child(tutorial_content)
	tutorial_badge = PanelContainer.new()
	tutorial_badge.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	tutorial_badge.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	tutorial_badge.position = Vector2(-18, -33)
	tutorial_badge.custom_minimum_size = Vector2(102, 18)
	var tutorial_badge_style := StyleBoxFlat.new()
	tutorial_badge_style.bg_color = Color("#2f6549")
	tutorial_badge_style.corner_radius_bottom_left = 10
	tutorial_badge_style.corner_radius_bottom_right = 10
	tutorial_badge_style.content_margin_left = 13
	tutorial_badge_style.content_margin_right = 13
	tutorial_badge_style.content_margin_top = 4
	tutorial_badge_style.content_margin_bottom = 5
	tutorial_badge.add_theme_stylebox_override("panel", tutorial_badge_style)
	tutorial_content_layer.add_child(tutorial_badge)
	tutorial_eyebrow = _label(tutorial_badge, 9, Color.WHITE)
	tutorial_eyebrow.autowrap_mode = TextServer.AUTOWRAP_OFF
	tutorial_eyebrow.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	tutorial_eyebrow.text = {"ru": "ОБУЧЕНИЕ", "be": "НАВУЧАННЕ", "en": "HOW TO PLAY"}.get(preferences.locale, "HOW TO PLAY")
	tutorial_title = _label(tutorial_content, 24, Color("#102744"))
	tutorial_title.add_theme_font_size_override("font_size", 24)
	tutorial_title.add_theme_font_override("font", UiFonts.serif(850))
	var tutorial_title_top_gap := Control.new()
	tutorial_title_top_gap.custom_minimum_size.y = 7
	tutorial_content.add_child(tutorial_title_top_gap)
	tutorial_content.move_child(tutorial_title, tutorial_content.get_child_count() - 1)
	var tutorial_title_body_gap := Control.new()
	tutorial_title_body_gap.custom_minimum_size.y = 8
	tutorial_body = _label(tutorial_content, 13, Color("#5c513e"))
	tutorial_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tutorial_body.add_theme_font_size_override("font_size", 13)
	tutorial_body.add_theme_constant_override("line_spacing", 0)
	var tutorial_sans := UiFonts.sans(700)
	tutorial_body.add_theme_font_override("font", tutorial_sans)
	tutorial_content.add_child(tutorial_title_body_gap)
	tutorial_content.move_child(tutorial_body, tutorial_content.get_child_count() - 1)
	tutorial_button = _button(tutorial_content)
	_style_tutorial_button(tutorial_button)
	var tutorial_button_gap := Control.new()
	tutorial_button_gap.custom_minimum_size.y = 10
	tutorial_content.add_child(tutorial_button_gap)
	tutorial_content.move_child(tutorial_button, tutorial_content.get_child_count() - 1)
	tutorial_button.pressed.connect(_dismiss_tutorial)
	content.remove_child(tutorial_panel)
	tutorial_overlay = Control.new()
	# Board cells and the inner frame use elevated z-indices for tile effects.
	# Keep the tutorial above those effects but beneath evidence and result overlays.
	tutorial_overlay.z_index = 25
	tutorial_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	var tutorial_shade := ColorRect.new()
	tutorial_shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_shade.color = Color("#0714279e")
	tutorial_shade.mouse_filter = Control.MOUSE_FILTER_STOP
	tutorial_overlay.add_child(tutorial_shade)
	var tutorial_center := CenterContainer.new()
	tutorial_center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	tutorial_overlay.add_child(tutorial_center)
	tutorial_frame = PanelContainer.new()
	tutorial_frame.name = "TutorialNavyOutline"
	tutorial_frame.custom_minimum_size = Vector2(0, 0)
	var frame_style := StyleBoxFlat.new()
	frame_style.bg_color = Color("#102744")
	frame_style.set_corner_radius_all(7)
	frame_style.content_margin_left = 3
	frame_style.content_margin_right = 3
	frame_style.content_margin_top = 3
	frame_style.content_margin_bottom = 3
	frame_style.shadow_color = Color("#020914c7")
	frame_style.shadow_size = 22
	frame_style.shadow_offset = Vector2(0, 18)
	tutorial_frame.add_theme_stylebox_override("panel", frame_style)
	tutorial_center.add_child(tutorial_frame)
	tutorial_panel.custom_minimum_size.x = 0
	tutorial_panel.custom_maximum_size.x = 350
	tutorial_panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	tutorial_frame.add_child(tutorial_panel)
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
	objective_panel.custom_minimum_size.x = 224
	objective_panel.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	hud.add_child(objective_panel)
	var objective_content := VBoxContainer.new()
	objective_content.add_theme_constant_override("separation", 1)
	objective_panel.add_child(objective_content)
	objective_heading = _label(objective_content, 9, Color("#326349"))
	objective_heading.add_theme_font_override("font", UiFonts.match3(800))
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
	objective.add_theme_font_override("font", UiFonts.match3(800))
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
	moves_heading.add_theme_font_override("font", UiFonts.match3(800))
	moves_heading.text = {"ru": "ХОДОВ", "be": "ХАДОЎ", "en": "MOVES"}.get(preferences.locale, "MOVES")
	moves = _label(stage_content, 14, Color("#326349"))
	moves.add_theme_font_override("font", UiFonts.match3(800))
	moves.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	moves.add_theme_font_size_override("font_size", 14)
	board_top_spacer = Control.new()
	board_top_spacer.name = "BoardHudSpacing"
	board_top_spacer.custom_minimum_size.y = _board_hud_spacing()
	content.add_child(board_top_spacer)
	board_center = CenterContainer.new()
	board_center.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.add_child(board_center)
	var board_outline := PanelContainer.new()
	board_outline.name = "BoardNavyOutline"
	board_outline.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var board_outline_style := StyleBoxFlat.new()
	board_outline_style.bg_color = Color(0, 0, 0, 0)
	board_outline_style.set_corner_radius_all(0)
	board_outline_style.content_margin_left = 0
	board_outline_style.content_margin_right = 0
	board_outline_style.content_margin_top = 0
	board_outline_style.content_margin_bottom = 0
	board_outline.add_theme_stylebox_override("panel", board_outline_style)
	board_center.add_child(board_outline)
	board_frame = PanelContainer.new()
	board_frame.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var board_style := StyleBoxFlat.new()
	board_style.bg_color = Color("#0713289e")
	board_style.border_color = Color("#f7ebc8")
	board_style.set_border_width_all(3)
	board_style.set_corner_radius_all(8)
	board_style.content_margin_left = 0
	board_style.content_margin_right = 0
	board_style.content_margin_top = 0
	board_style.content_margin_bottom = 0
	board_frame.add_theme_stylebox_override("panel", board_style)
	board_outline.add_child(board_frame)
	var board_inner_border := Panel.new()
	board_inner_border.name = "BoardInnerBorder"
	board_inner_border.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	board_inner_border.offset_left = 0
	board_inner_border.offset_top = 0
	board_inner_border.offset_right = 0
	board_inner_border.offset_bottom = 0
	board_inner_border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	board_inner_border.z_index = 20
	var board_inner_border_style := StyleBoxFlat.new()
	board_inner_border_style.bg_color = Color(0, 0, 0, 0)
	board_inner_border_style.border_color = Color(0, 0, 0, 0)
	board_inner_border_style.set_border_width_all(0)
	board_inner_border_style.set_corner_radius_all(0)
	board_inner_border.add_theme_stylebox_override("panel", board_inner_border_style)
	board_outline.add_child(board_inner_border)
	board_inner_border.visible = false
	board = GridContainer.new()
	board.columns = int(level_data.columns)
	board.add_theme_constant_override("h_separation", 1)
	board.add_theme_constant_override("v_separation", 1)
	board_frame.add_child(board)
	board_frame.material = null
	board_center.resized.connect(_fit_board_cells)
	resized.connect(_fit_board_hud_spacing)
	var bark_style := StyleBoxFlat.new()
	bark_style.bg_color = Color("#f7ebc8")
	bark_style.border_color = Color("#f7ebc8")
	bark_style.set_border_width_all(3)
	bark_style.set_corner_radius_all(8)
	bark_style.content_margin_left = 1
	bark_style.content_margin_right = 3
	bark_style.content_margin_top = 1
	bark_style.content_margin_bottom = 1
	bark_base_style = bark_style
	bark_slot = Control.new()
	bark_slot.name = "BarkSlot"
	bark_slot.custom_minimum_size.y = 62
	bark_slot.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bark_slot.clip_contents = false
	content.remove_child(bark)
	content.add_child(bark_slot)
	bark_panel = PanelContainer.new()
	bark_panel.name = "FieldBark"
	bark_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bark_panel.custom_minimum_size.y = 62
	bark_panel.add_theme_stylebox_override("panel", bark_style)
	bark_slot.add_child(bark_panel)
	var bark_row := HBoxContainer.new()
	bark_row.add_theme_constant_override("separation", 5)
	bark_panel.add_child(bark_row)
	bark_portrait_frame = Panel.new()
	bark_portrait_frame.name = "PortraitFrame"
	bark_portrait_frame.custom_minimum_size = Vector2(42, 42)
	bark_portrait_frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var portrait_frame_style := StyleBoxFlat.new()
	portrait_frame_style.bg_color = Color("#fff5d2")
	portrait_frame_style.border_color = Color("#fff5d2")
	portrait_frame_style.set_border_width_all(2)
	portrait_frame_style.set_corner_radius_all(999)
	portrait_frame_style.shadow_color = Color("#326349")
	portrait_frame_style.shadow_size = 1
	portrait_frame_style.shadow_offset = Vector2.ZERO
	bark_portrait_frame.add_theme_stylebox_override("panel", portrait_frame_style)
	bark_row.add_child(bark_portrait_frame)
	bark_portrait = TextureRect.new()
	bark_portrait.name = "Portrait"
	bark_portrait.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bark_portrait.offset_left = 2
	bark_portrait.offset_top = 2
	bark_portrait.offset_right = -2
	bark_portrait.offset_bottom = -2
	bark_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bark_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bark_portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var portrait_mask := Shader.new()
	portrait_mask.code = """
	shader_type canvas_item;
	void fragment() {
		vec4 portrait = texture(TEXTURE, UV) * COLOR;
		float radius = length(UV * 2.0 - 1.0);
		float edge = fwidth(radius);
		portrait.a *= 1.0 - smoothstep(1.0 - edge, 1.0 + edge, radius);
		COLOR = portrait;
	}
	"""
	var portrait_material := ShaderMaterial.new()
	portrait_material.shader = portrait_mask
	bark_portrait.material = portrait_material
	bark_portrait_frame.add_child(bark_portrait)
	var bark_lines := VBoxContainer.new()
	bark_lines.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bark_lines.alignment = BoxContainer.ALIGNMENT_CENTER
	bark_lines.add_theme_constant_override("separation", 1)
	bark_row.add_child(bark_lines)
	bark_speaker = _label(bark_lines, 9, Color("#326349"))
	bark_speaker.add_theme_font_override("font", UiFonts.match3(850))
	bark_speaker.add_theme_color_override("font_color", Color("#326349"))
	bark_lines.add_child(bark)
	bark.add_theme_font_override("font", UiFonts.match3(500))
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
	hint_label.add_theme_font_override("font", UiFonts.match3(900))
	hint_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hint_button.pressed.connect(_show_hint)
	warning = _label(content, 12, Color("#ffd7a5"))
	warning.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	bottom_spacer = VBoxContainer.new()
	bottom_spacer.name = "MatchGuidance"
	bottom_spacer.add_theme_constant_override("separation", 1)
	bottom_spacer.custom_minimum_size.y = 42
	content.add_child(bottom_spacer)
	var input_guidance := _label(bottom_spacer, 8, Color("#363f43"))
	input_guidance.name = "InputGuidance"
	input_guidance.text = MenuCopy.text("match3_input_hint", preferences.locale)
	input_guidance.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	input_guidance.add_theme_font_size_override("font_size", 8)
	input_guidance.add_theme_constant_override("shadow_offset_y", 1)
	input_guidance.add_theme_color_override("font_shadow_color", Color("#fff7d7"))
	guidance_labels.append(input_guidance)
	for index in level_data.objectives.size():
		var objective_data: Dictionary = level_data.objectives[index]
		var objective_kind := str(objective_data.get("kind", ""))
		if objective_kind != "drop" and objective_kind != "dropGroup": continue
		var label := _label(bottom_spacer, 8, Color("#363f43"))
		label.name = "StoryObjectGuidance%d" % index
		label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label.add_theme_font_size_override("font_size", 8)
		label.add_theme_constant_override("shadow_offset_y", 1)
		label.add_theme_color_override("font_shadow_color", Color("#fff7d7"))
		guidance_labels.append(label)
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
	match_feedback_panel.pivot_offset = Vector2(75, 23)
	match_feedback_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	match_feedback_panel.visible = false
	feedback_center.add_child(match_feedback_panel)
	match_feedback_label = _label(match_feedback_panel, 13, Color("#fff9df"))
	match_feedback_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	match_feedback_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	match_feedback_label.add_theme_font_size_override("font_size", 13)
	match_feedback_label.add_theme_color_override("font_color", Color("#fff9df"))
	match_feedback_label.add_theme_font_override("font", UiFonts.serif(900))
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
	_build_campaign_result()
	preferences.locale_changed.connect(func(_locale: String) -> void: _refresh())
	_sync_tutorial_prompt()
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
		var invalid_bark_keys := {
			"not-adjacent": "match3_bark_not_adjacent",
			"ingredient": "match3_bark_ingredient_invalid",
			"blocked": "match3_bark_blocked_invalid",
			"no-match": "match3_bark_no_match_invalid",
		}
		if invalid_bark_keys.has(last_feedback):
			var is_miku: bool = last_feedback in ["not-adjacent", "ingredient"]
			speaker = MenuCopy.text("character_miku" if is_miku else "character_onoe", locale)
			bark.text = MenuCopy.text(str(invalid_bark_keys[last_feedback]), locale)
		else:
			speaker = str(copy.startSpeaker)
			bark.text = str(copy.startText)
	else:
		speaker = str(copy.winSpeaker) if game.state == "won" else str(copy.loseSpeaker)
		bark.text = str(copy.winText) if game.state == "won" else str(copy.loseText)
	if not active_reaction.is_empty() and last_feedback.is_empty():
		var reaction_id := str(active_reaction.get("id", ""))
		speaker = reaction_runtime.speaker_name(locale, str(active_reaction.get("speaker", "miku")))
		bark.text = reaction_runtime.text(locale, str(active_reaction.get("messageKey", "")), active_reaction.get("params", {}))
		_set_bark_emphasis(str(reaction_runtime.policy(reaction_id).get("emphasis", "standard")))
	else:
		_set_bark_emphasis("")
	bark_speaker.text = speaker.to_upper()
	bark_portrait.texture = _speaker_portrait(speaker)
	var tutorial_locale: Dictionary = campaign_bundle.get("tutorials", {}).get(locale, campaign_bundle.get("tutorials", {}).get("en", {}))
	var tutorial_copy: Dictionary = tutorial_locale.get("concepts", {}).get(active_tutorial, {})
	tutorial_title.text = str(tutorial_copy.get("title", ""))
	tutorial_eyebrow.text = {"ru": "ОБУЧЕНИЕ", "be": "НАВУЧАННЕ", "en": "HOW TO PLAY"}.get(locale, "HOW TO PLAY")
	tutorial_body.text = str(tutorial_copy.get("body", ""))
	tutorial_button.text = str(tutorial_locale.get("try", Level.data.localized[locale].tutorialTry))
	var objective_lines := PackedStringArray()
	for index in level_data.objectives.size():
		var objective_data: Dictionary = level_data.objectives[index]
		objective_lines.append("%d/%d" % [game.objective_value(index), int(objective_data.target)])
	objective.text = " · ".join(objective_lines)
	objective_icon.texture = _objective_texture(level_data.objectives[0]) if not level_data.objectives.is_empty() else null
	moves.text = str(game.moves_left)
	hint_label.text = MenuCopy.text("match3_hint", locale)
	guidance_labels[0].text = MenuCopy.text("match3_input_hint", locale)
	var guidance_index := 1
	for index in level_data.objectives.size():
		var objective_data: Dictionary = level_data.objectives[index]
		var objective_kind := str(objective_data.get("kind", ""))
		if objective_kind != "drop" and objective_kind != "dropGroup": continue
		var object_label := str(copy.objectives[index]) if index < copy.objectives.size() else str(objective_data.get("label", ""))
		guidance_labels[guidance_index].text = MenuCopy.text("match3_story_object_guidance", locale).replace("{object}", object_label)
		guidance_index += 1
	hint_button.disabled = game.state != "playing" or tutorial_panel.visible
	warning.text = "" if session.last_write_ok and (story_session == null or story_session.last_write_ok) else MenuCopy.text("story_save_error", locale)
	warning.visible = not warning.text.is_empty()
	if not match_feedback_key.is_empty():
		match_feedback_label.text = _feedback_text(match_feedback_key, match_feedback_cascade)
	call_deferred("_fit_tutorial_card")
	bottom_spacer.visible = game.state == "playing"
	var won: bool = game.state == "won"
	board_center.visible = not won
	tutorial_panel.visible = game.state == "playing" and not active_tutorial.is_empty() and not tutorial_prompt_dismissed
	tutorial_overlay.visible = tutorial_panel.visible
	objective.visible = not won
	moves.visible = not won
	if won and not campaign_mode and story_session != null:
		story_evidence_visible = true
	if story_evidence_visible:
		_show_story_evidence_transition()
	evidence_transition_overlay.visible = won and not campaign_mode and story_evidence_visible
	_render_board()
	if campaign_mode:
		campaign_result_overlay.visible = game.state != "playing"
		if game.state != "playing": _refresh_campaign_result(locale)
	else:
		campaign_result_overlay.visible = game.state == "lost"
		if game.state == "lost": _refresh_story_loss_result(locale, copy)


func _render_board() -> void:
	var reduced_motion := _prefers_reduced_motion()
	var cell_size := _board_cell_size()
	_clear_drag_preview()
	for child in board.get_children():
		board.remove_child(child)
		child.queue_free()
	for index in game.tiles.size():
		var tile_button := Button.new()
		tile_button.custom_minimum_size = Vector2(cell_size, cell_size)
		tile_button.pivot_offset = tile_button.custom_minimum_size * 0.5
		tile_button.clip_contents = true
		if index == selected_index:
			tile_button.z_index = 5
		tile_button.focus_mode = Control.FOCUS_NONE
		var cell_style := StyleBoxFlat.new()
		cell_style.bg_color = Color("#5a859926")
		cell_style.border_color = Color("#dbe0be59")
		cell_style.set_border_width_all(1)
		cell_style.set_corner_radius_all(0)
		var selected_style := cell_style.duplicate() as StyleBoxFlat
		selected_style.border_color = Color("#fff2a8")
		selected_style.set_border_width_all(3)
		var hinted_style := cell_style.duplicate() as StyleBoxFlat
		hinted_style.border_color = Color("#7ddfd8")
		hinted_style.set_border_width_all(3)
		hinted_style.shadow_color = Color("#7ddfd8")
		hinted_style.shadow_size = 15
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
		tile_button.gui_input.connect(_on_tile_gui_input.bind(index))
		var cell_background := Panel.new()
		cell_background.name = "CellBackground"
		cell_background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		cell_background.offset_left = 1
		cell_background.offset_top = 1
		cell_background.offset_right = -1
		cell_background.offset_bottom = -1
		cell_background.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var cell_background_style := StyleBoxFlat.new()
		cell_background_style.bg_color = Color("#5a859926")
		cell_background_style.set_corner_radius_all(0)
		cell_background.add_theme_stylebox_override("panel", cell_background_style)
		tile_button.add_child(cell_background)
		var cell_socket := Panel.new()
		cell_socket.name = "CellSocket"
		cell_socket.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		cell_socket.offset_left = 1
		cell_socket.offset_top = 1
		cell_socket.offset_right = -1
		cell_socket.offset_bottom = -1
		cell_socket.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var socket_style := StyleBoxFlat.new()
		socket_style.bg_color = Color(0, 0, 0, 0)
		socket_style.border_color = Color(0, 0, 0, 0)
		socket_style.set_border_width_all(0)
		socket_style.set_corner_radius_all(0)
		cell_socket.add_theme_stylebox_override("panel", socket_style)
		tile_button.add_child(cell_socket)
		var tile_stack := Control.new()
		tile_stack.name = "TileStack"
		tile_stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		tile_stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tile_stack.clip_contents = false
		tile_stack.z_index = 0
		tile_stack.pivot_offset = tile_button.custom_minimum_size * 0.5
		var tile_asset := str(campaign_bundle.assets.tiles.get(game.tiles[index], ""))
		if not tile_asset.is_empty():
			var tile := TextureRect.new()
			tile.name = "Tile"
			tile.z_index = 1
			tile.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
			tile.offset_left = 0
			tile.offset_top = 0
			tile.offset_right = 0
			tile.offset_bottom = 0
			tile.resized.connect(func() -> void: tile.pivot_offset = tile.size * 0.5)
			tile.texture = load("res://" + tile_asset.trim_prefix("./"))
			tile.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			tile.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			var is_camisole: bool = game.tiles[index] == "camisole"
			tile.scale = Vector2(1.08, 1.08)
			tile.material = _match3_drop_shadow_material(
				Color("#10172d66") if is_camisole else Color("#071224b8"),
				Vector2(0, 1) if is_camisole else Vector2(0, 2),
				1.0, 1.38 if is_camisole else 1.0, 1.0 if is_camisole else 1.05,
			)
			tile.mouse_filter = Control.MOUSE_FILTER_IGNORE
			tile_stack.add_child(tile)
		tile_stack.modulate = Color(0.35, 0.38, 0.45, 0.7) if game.tiles[index].is_empty() else Color.WHITE
		if game.blocker_layers[index] > 0 and str(level_data.blockerStyle) == "solid":
			tile_stack.scale = Vector2(0.64, 0.64)
		elif game.blocker_layers[index] > 0 and str(level_data.blockerStyle) == "locked":
			tile_stack.modulate.a *= 0.84
		tile_button.disabled = game.state != "playing" or tutorial_panel.visible or game.tiles[index].is_empty() or game.blocker_layers[index] > 0
		tile_button.pressed.connect(_select_cell.bind(index))
		tile_button.add_child(tile_stack)
		if index == selected_index:
			if reduced_motion:
				tile_button.scale = Vector2(0.9, 0.9)
				tile_button.modulate = Color(1.18, 1.18, 1.18, 1.0)
			else:
				var selected_tween := tile_button.create_tween()
				var css_ease := Callable(self, "_css_cubic_bezier").bind(0.25, 0.1, 0.25, 1.0)
				selected_tween.tween_property(tile_button, "scale", Vector2(0.9, 0.9), 0.12).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
				selected_tween.parallel().tween_property(tile_button, "modulate", Color(1.18, 1.18, 1.18, 1.0), 0.12).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
		if hinted_indices.has(index) and not reduced_motion:
			tile_button.pivot_offset = Vector2(27, 27)
			var hint_tween := tile_button.create_tween().set_loops()
			var css_ease_in_out := Callable(self, "_css_cubic_bezier").bind(0.42, 0.0, 0.58, 1.0)
			hint_tween.tween_property(tile_button, "scale", Vector2(0.91, 0.91), 0.41).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
			hint_tween.parallel().tween_property(tile_button, "modulate", Color(1.18, 1.18, 1.18, 1.0), 0.41).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
			hint_tween.tween_property(tile_button, "scale", Vector2.ONE, 0.41).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
			hint_tween.parallel().tween_property(tile_button, "modulate", Color.WHITE, 0.41).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
		if game.blocker_layers[index] > 0:
			var blocker_style: String = str(level_data.blockerStyle)
			var blocker_asset := str(campaign_bundle.assets.blockers.get(blocker_style, ""))
			if blocker_style == "locked": blocker_asset = str(campaign_bundle.assets.lockedBlockers.get(str(game.blocker_layers[index]), blocker_asset))
			if not blocker_asset.is_empty():
				var blocker := TextureRect.new()
				blocker.name = "Blocker"
				blocker.z_index = 4
				blocker.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
				blocker.offset_left = 1
				blocker.offset_top = 1
				blocker.offset_right = -1
				blocker.offset_bottom = -1
				blocker.texture = load("res://" + blocker_asset.trim_prefix("./"))
				blocker.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				blocker.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
				if blocker_style == "solid":
					blocker.modulate = Color(1, 1, 1, 0.68 if game.blocker_layers[index] == 1 else 0.84)
				elif blocker_style == "overlay":
					blocker.modulate = Color(1, 1, 1, 0.72)
					blocker.material = _match3_drop_shadow_material(Color("#0713269e"), Vector2(0, 1), 2.0, 1.0, 0.9, 1.04)
				else:
					blocker.modulate = Color.WHITE
					blocker.material = _match3_drop_shadow_material(Color(0, 0, 0, 0), Vector2.ZERO, 0.0)
				blocker.mouse_filter = Control.MOUSE_FILTER_IGNORE
				tile_button.add_child(blocker)
				if blocker_style == "locked":
					var locked_outline := Panel.new()
					locked_outline.name = "LockedBlockerOutline"
					locked_outline.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
					locked_outline.offset_left = 1
					locked_outline.offset_top = 1
					locked_outline.offset_right = -1
					locked_outline.offset_bottom = -1
					locked_outline.mouse_filter = Control.MOUSE_FILTER_IGNORE
					locked_outline.z_index = 5
					var locked_outline_style := StyleBoxFlat.new()
					locked_outline_style.bg_color = Color(0, 0, 0, 0)
					locked_outline_style.border_color = Color("#dfd5bd70")
					locked_outline_style.set_border_width_all(1)
					locked_outline.add_theme_stylebox_override("panel", locked_outline_style)
					tile_button.add_child(locked_outline)
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
					layer_badge.z_index = 5
					tile_button.add_child(layer_badge)
		if not game.ingredients[index].is_empty():
			var ingredient_asset := str(campaign_bundle.assets.ingredients.get(game.ingredients[index], ""))
			if not ingredient_asset.is_empty():
				var ingredient_texture: Texture2D = load("res://" + ingredient_asset.trim_prefix("./"))
				var ingredient := TextureRect.new()
				ingredient.name = "Ingredient"
				ingredient.z_index = 3
				ingredient.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
				ingredient.offset_left = 2
				ingredient.offset_top = 2
				ingredient.offset_right = -2
				ingredient.offset_bottom = -2
				ingredient.texture = ingredient_texture
				ingredient.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				ingredient.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
				ingredient.material = _match3_drop_shadow_material(Color("#00000088"), Vector2(0, 2), 2.0)
				ingredient.mouse_filter = Control.MOUSE_FILTER_IGNORE
				tile_stack.add_child(ingredient)
				var ingredient_material := (ingredient.material as ShaderMaterial).duplicate() as ShaderMaterial
				ingredient_material.set_shader_parameter("glow_white", Color("#fff2a0"))
				ingredient_material.set_shader_parameter("glow_gold", Color(0, 0, 0, 0))
				ingredient_material.set_shader_parameter("glow_aqua", Color(0, 0, 0, 0))
				ingredient_material.set_shader_parameter("glow_white_radius_px", 7.0)
				ingredient.material = ingredient_material
				if not reduced_motion:
					var ingredient_bob := tile_button.create_tween().set_loops()
					var css_ease_in_out := Callable(self, "_css_cubic_bezier").bind(0.42, 0.0, 0.58, 1.0)
					ingredient_bob.tween_property(ingredient, "offset_top", 1.0, 0.7).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
					ingredient_bob.parallel().tween_property(ingredient, "offset_bottom", -5.0, 0.7).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
					ingredient_bob.parallel().tween_method(Callable(self, "_set_ingredient_glow").bind(ingredient_material, false), 0.0, 1.0, 0.7).set_trans(Tween.TRANS_LINEAR)
					ingredient_bob.tween_property(ingredient, "offset_top", 3.0, 0.7).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
					ingredient_bob.parallel().tween_property(ingredient, "offset_bottom", -3.0, 0.7).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_in_out)
					ingredient_bob.parallel().tween_method(Callable(self, "_set_ingredient_glow").bind(ingredient_material, true), 0.0, 1.0, 0.7).set_trans(Tween.TRANS_LINEAR)
		if not game.specials[index].is_empty():
			var special_kind: String = game.specials[index]
			var special_asset := str(campaign_bundle.assets.get("specials", {}).get(special_kind, ""))
			if not special_asset.is_empty():
				var special_texture: Texture2D = load("res://" + special_asset.trim_prefix("./"))
				var special := TextureRect.new()
				special.name = "Special"
				special.z_index = 2
				special.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
				# Keep the original web presentation: directional line specials fill
				# their cell, while the three silhouette specials extend by 14%.
				if special_kind in ["flash-row", "flash-column", "evidence"]:
					special.offset_left = 0
					special.offset_top = 0
					special.offset_right = 0
					special.offset_bottom = 0
				else:
					var special_bleed := cell_size * 0.14
					special.offset_left = -special_bleed
					special.offset_top = -special_bleed
					special.offset_right = special_bleed
					special.offset_bottom = special_bleed
				special.texture = special_texture
				special.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				special.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
				special.material = _match3_special_icon_material()
				special.pivot_offset = tile_button.custom_minimum_size * 0.5
				special.mouse_filter = Control.MOUSE_FILTER_IGNORE
				tile_stack.add_child(special)
				if special_kind == "flash-row" or special_kind == "flash-column":
					var direction_marker := PanelContainer.new()
					direction_marker.name = "SpecialDirectionMarker"
					direction_marker.z_index = 3
					direction_marker.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT)
					direction_marker.offset_left = 1
					direction_marker.offset_top = -16
					direction_marker.offset_right = 16
					direction_marker.offset_bottom = -1
					var marker_style := StyleBoxFlat.new()
					marker_style.bg_color = Color("#10243deb")
					marker_style.border_color = Color("#fff0bd")
					marker_style.set_border_width_all(1)
					marker_style.set_corner_radius_all(3)
					direction_marker.add_theme_stylebox_override("panel", marker_style)
					var direction_label := Label.new()
					direction_label.text = "↔" if special_kind == "flash-row" else "↕"
					direction_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
					direction_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
					direction_label.add_theme_font_size_override("font_size", 13)
					direction_label.add_theme_color_override("font_color", Color("#fff0bd"))
					direction_marker.add_child(direction_label)
					direction_marker.mouse_filter = Control.MOUSE_FILTER_IGNORE
					tile_stack.add_child(direction_marker)
		if hinted_indices.has(index):
			var hint_ring := Panel.new()
			hint_ring.name = "HintInnerRing"
			hint_ring.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
			hint_ring.offset_left = 2.0
			hint_ring.offset_top = 2.0
			hint_ring.offset_right = -2.0
			hint_ring.offset_bottom = -2.0
			hint_ring.mouse_filter = Control.MOUSE_FILTER_IGNORE
			hint_ring.z_index = 20
			var hint_ring_style := StyleBoxFlat.new()
			hint_ring_style.bg_color = Color(0, 0, 0, 0)
			hint_ring_style.border_color = Color("#fff8d7")
			hint_ring_style.set_border_width_all(2)
			hint_ring.add_theme_stylebox_override("panel", hint_ring_style)
			tile_button.add_child(hint_ring)
		board.add_child(tile_button)
	_fit_board_cells()


func _board_cell_size() -> float:
	var rows := maxi(1, int(level_data.get("rows", 1)))
	var columns := maxi(1, int(level_data.get("columns", 1)))
	var width_limit := minf(size.x - 24.0, 414.0)
	if board_center.size.y > 0.0:
		width_limit = minf(width_limit, board_center.size.y * float(columns) / float(rows))
	var cell_width := (width_limit - 6.0 - float(columns - 1)) / float(columns)
	# GridContainer does not include the UI A outline in its cell minimum size.
	return maxf(1.0, cell_width + 1.0)


func _board_hud_spacing() -> float:
	# UI A anchors its board toward the bottom of the playfield, leaving a
	# deliberate gap after the HUD. A short responsive spacer shifts the Godot
	# center-layout equivalent down without affecting the dialogue slot.
	return clampf((size.y - 568.0) * 0.19, 0.0, 52.0)


func _fit_board_hud_spacing() -> void:
	if is_instance_valid(board_top_spacer):
		board_top_spacer.custom_minimum_size.y = _board_hud_spacing()


func _fit_board_cells() -> void:
	if not is_instance_valid(board) or board.get_child_count() == 0:
		return
	var cell_size := _board_cell_size()
	for child in board.get_children():
		if child is Control:
			(child as Control).custom_minimum_size = Vector2(cell_size, cell_size)
			(child as Control).pivot_offset = Vector2(cell_size, cell_size) * 0.5


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
			var clear_ease := Callable(self, "_css_cubic_bezier").bind(0.2, 0.72, 0.18, 1.0)
			var tween := create_tween()
			tween.tween_property(tile_stack, "scale", Vector2(1.1, 1.1), CLEAR_MOTION_SECONDS * 0.48).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(clear_ease)
			tween.parallel().tween_property(tile_stack, "modulate", Color(1.55, 1.55, 1.55, 1.0), CLEAR_MOTION_SECONDS * 0.48).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(clear_ease)
			tween.tween_property(tile_stack, "scale", Vector2(0.18, 0.18), CLEAR_MOTION_SECONDS * 0.52).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(clear_ease)
			tween.parallel().tween_property(tile_stack, "modulate", Color(1.8, 1.8, 1.8, 0.0), CLEAR_MOTION_SECONDS * 0.52).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(clear_ease)
	elif str(frame.phase) == "settle":
		for motion_value in frame.motions:
			var motion: Dictionary = motion_value
			var cell := board.get_child(int(motion.index)) as Control
			var tile_stack := cell.get_node_or_null("TileStack") as Control
			if tile_stack == null: continue
			var distance := float(motion.rows) * cell.size.y
			var is_spawn := bool(motion.spawn)
			var settle_mark := 0.78 if is_spawn else 0.72
			var settle_scale := 1.02 if is_spawn else 1.015
			var bezier := Callable(self, "_css_cubic_bezier").bind(0.18, 0.82, 0.28, 1.0)
			tile_stack.offset_top = -distance
			tile_stack.offset_bottom = -distance
			tile_stack.scale = Vector2(0.86, 0.86) if is_spawn else Vector2(0.98, 0.98)
			tile_stack.modulate.a = 0.05 if is_spawn else 1.0
			var tween := create_tween()
			tween.tween_property(tile_stack, "offset_top", cell.size.y * 0.03, SETTLE_MOTION_SECONDS * settle_mark).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(bezier)
			tween.parallel().tween_property(tile_stack, "offset_bottom", cell.size.y * 0.03, SETTLE_MOTION_SECONDS * settle_mark).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(bezier)
			tween.parallel().tween_property(tile_stack, "scale", Vector2(settle_scale, settle_scale), SETTLE_MOTION_SECONDS * settle_mark).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(bezier)
			tween.tween_property(tile_stack, "offset_top", 0.0, SETTLE_MOTION_SECONDS * (1.0 - settle_mark)).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(bezier)
			tween.parallel().tween_property(tile_stack, "offset_bottom", 0.0, SETTLE_MOTION_SECONDS * (1.0 - settle_mark)).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(bezier)
			var settle_back := tween.parallel().tween_property(tile_stack, "scale", Vector2.ONE, SETTLE_MOTION_SECONDS * (1.0 - settle_mark)).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(bezier)
			settle_back.from(Vector2(settle_scale, settle_scale))
			if is_spawn:
				var opacity := create_tween()
				opacity.tween_property(tile_stack, "modulate:a", 1.0, SETTLE_MOTION_SECONDS * 0.68).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(bezier)
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
			var css_ease := Callable(self, "_css_cubic_bezier").bind(0.25, 0.1, 0.25, 1.0)
			tween.tween_property(tile_stack, "scale", Vector2(1.04, 1.04), RESHUFFLE_MOTION_SECONDS * 0.65).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
			tween.parallel().tween_property(tile_stack, "rotation_degrees", 1.0, RESHUFFLE_MOTION_SECONDS * 0.65).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
			tween.parallel().tween_property(tile_stack, "modulate:a", 1.0, RESHUFFLE_MOTION_SECONDS * 0.65)
			tween.tween_property(tile_stack, "scale", Vector2.ONE, RESHUFFLE_MOTION_SECONDS * 0.35).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
			tween.parallel().tween_property(tile_stack, "rotation_degrees", 0.0, RESHUFFLE_MOTION_SECONDS * 0.35).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)


func _css_cubic_bezier(progress: float, x1: float, y1: float, x2: float, y2: float) -> float:
	return CssMotion.cubic_bezier(progress, x1, y1, x2, y2)


func _prefers_reduced_motion() -> bool:
	return ReducedMotion.is_enabled(_reduced_motion_override)


func _set_ingredient_glow(progress: float, material: ShaderMaterial, reverse: bool) -> void:
	var eased_progress := _css_cubic_bezier(progress, 0.42, 0.0, 0.58, 1.0)
	material.set_shader_parameter("glow_strength", 1.0 - eased_progress if reverse else eased_progress)


func _match3_drop_shadow_material(shadow_color: Color, shadow_offset: Vector2, blur: float, brightness: float = 1.0, saturation: float = 1.0, contrast: float = 1.0) -> ShaderMaterial:
	var cache_key := "%s:%s:%s:%s:%s:%s" % [shadow_color.to_html(), shadow_offset, blur, brightness, saturation, contrast]
	if _drop_shadow_material_cache.has(cache_key):
		return _drop_shadow_material_cache[cache_key] as ShaderMaterial
	var material := ShaderMaterial.new()
	material.shader = Match3DropShadow
	material.set_shader_parameter("shadow_color", shadow_color)
	material.set_shader_parameter("shadow_offset_px", shadow_offset)
	material.set_shader_parameter("shadow_blur_px", blur)
	material.set_shader_parameter("brightness", brightness)
	material.set_shader_parameter("saturation", saturation)
	material.set_shader_parameter("contrast", contrast)
	_drop_shadow_material_cache[cache_key] = material
	return material


func _match_background_material() -> ShaderMaterial:
	if _match_background_material_cache != null:
		return _match_background_material_cache
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;
uniform float brightness : hint_range(0.0, 2.0) = 0.94;
uniform float saturation : hint_range(0.0, 2.0) = 0.90;
void fragment() {
	vec4 source = texture(TEXTURE, UV) * COLOR;
	float luminance = dot(source.rgb, vec3(0.2126, 0.7152, 0.0722));
	vec3 color = mix(vec3(luminance), source.rgb, saturation) * brightness;
	COLOR = vec4(color, source.a);
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("brightness", 0.94)
	material.set_shader_parameter("saturation", 0.90)
	_match_background_material_cache = material
	return _match_background_material_cache


func _match3_special_icon_material() -> ShaderMaterial:
	if _special_icon_material_cache != null:
		return _special_icon_material_cache
	var material := _match3_drop_shadow_material(Color("#181426b8"), Vector2(0, 1), 2.0)
	material.set_shader_parameter("glow_strength", 0.0)
	_special_icon_material_cache = material
	return _special_icon_material_cache


func _animate_swap(first: int, second: int, keep_at_target: bool) -> void:
	if _prefers_reduced_motion(): return
	if first == second or first < 0 or second < 0 or first >= board.get_child_count() or second >= board.get_child_count():
		await get_tree().create_timer(SWAP_MOTION_SECONDS).timeout
		return
	var first_cell := board.get_child(first) as Control
	var second_cell := board.get_child(second) as Control
	var first_stack := first_cell.get_node_or_null("TileStack") as Control
	var second_stack := second_cell.get_node_or_null("TileStack") as Control
	if first_stack == null or second_stack == null: return
	var offset := second_cell.get_global_rect().position - first_cell.get_global_rect().position
	if offset.is_zero_approx():
		var columns := board.columns
		var grid_delta := Vector2(second % columns - first % columns, second / columns - first / columns)
		var cell_width := first_cell.size.x if first_cell.size.x > 0.0 else first_cell.custom_minimum_size.x
		var cell_height := first_cell.size.y if first_cell.size.y > 0.0 else first_cell.custom_minimum_size.y
		var gap := float(board.get_theme_constant("h_separation"))
		offset = Vector2(grid_delta.x * (cell_width + gap), grid_delta.y * (cell_height + gap))
	first_stack.z_index = 8
	second_stack.z_index = 8
	var tween := create_tween()
	tween.set_parallel(true)
	_tween_stack_offsets(tween, first_stack, offset, SWAP_MOTION_SECONDS)
	_tween_stack_offsets(tween, second_stack, -offset, SWAP_MOTION_SECONDS)
	await tween.finished
	if keep_at_target: return
	_reset_swap_stack(first_stack)
	_reset_swap_stack(second_stack)


func _return_rejected_swap(first: int, second: int) -> void:
	if first < 0 or second < 0 or first >= board.get_child_count() or second >= board.get_child_count(): return
	var first_stack := (board.get_child(first) as Control).get_node_or_null("TileStack") as Control
	var second_stack := (board.get_child(second) as Control).get_node_or_null("TileStack") as Control
	if first_stack == null or second_stack == null: return
	var back := create_tween()
	back.set_parallel(true)
	_tween_stack_offsets(back, first_stack, Vector2.ZERO, SWAP_MOTION_SECONDS)
	_tween_stack_offsets(back, second_stack, Vector2.ZERO, SWAP_MOTION_SECONDS)
	_shake_rejected_cells([first, second])
	await back.finished
	_reset_swap_stack(first_stack)
	_reset_swap_stack(second_stack)


func _reset_swap_stack(stack: Control) -> void:
	stack.offset_left = 0.0
	stack.offset_top = 0.0
	stack.offset_right = 0.0
	stack.offset_bottom = 0.0
	stack.z_index = 0


func _tween_stack_offsets(tween: Tween, stack: Control, target: Vector2, duration: float) -> void:
	var css_ease := Callable(self, "_css_cubic_bezier").bind(0.22, 0.72, 0.22, 1.0)
	tween.tween_property(stack, "offset_left", target.x, duration).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
	tween.parallel().tween_property(stack, "offset_right", target.x, duration).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
	tween.parallel().tween_property(stack, "offset_top", target.y, duration).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
	tween.parallel().tween_property(stack, "offset_bottom", target.y, duration).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)


func _shake_rejected_cells(indices: Array) -> void:
	if _prefers_reduced_motion(): return
	for index in indices:
		if index < 0 or index >= board.get_child_count(): continue
		var cell := board.get_child(index) as Control
		var start_x := cell.position.x
		var tween := create_tween()
		var css_ease := Callable(self, "_css_cubic_bezier").bind(0.25, 0.1, 0.25, 1.0)
		for offset in [-5.0, 5.0, -3.0, 0.0]:
			tween.tween_property(cell, "position:x", start_x + offset, 0.055).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)


func _feedback_text(key: String, count: int = 1) -> String:
	var copy_key := "match3_feedback_" + key
	return MenuCopy.text(copy_key, preferences.locale).replace("{count}", str(count))


func _show_match_feedback(kind: String, cascade: int = 1, localized_key: String = "") -> void:
	if not is_instance_valid(match_feedback_panel) or not is_instance_valid(match_feedback_label): return
	var was_hidden := not match_feedback_panel.visible
	var was_fading_out := match_feedback_key.is_empty() and match_feedback_panel.visible
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
	match_feedback_panel.pivot_offset = match_feedback_panel.size * 0.5
	match_feedback_panel.visible = true
	if was_hidden:
		match_feedback_panel.scale = Vector2(0.86, 0.86)
		match_feedback_panel.modulate.a = 0.0
	if _prefers_reduced_motion():
		match_feedback_panel.scale = Vector2.ONE
		match_feedback_panel.modulate = Color.WHITE
		return
	if not was_hidden and not was_fading_out and is_equal_approx(match_feedback_panel.modulate.a, 1.0):
		return
	var css_ease := Callable(self, "_css_cubic_bezier").bind(0.25, 0.1, 0.25, 1.0)
	match_feedback_tween = create_tween()
	match_feedback_tween.set_parallel(true)
	match_feedback_tween.tween_property(match_feedback_panel, "scale", Vector2.ONE, 0.1).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
	match_feedback_tween.tween_property(match_feedback_panel, "modulate:a", 1.0, 0.1).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)


func _clear_match_feedback() -> void:
	if not is_instance_valid(match_feedback_panel): return
	match_feedback_key = ""
	if not match_feedback_panel.visible: return
	if match_feedback_tween != null and match_feedback_tween.is_valid(): match_feedback_tween.kill()
	if _prefers_reduced_motion():
		match_feedback_panel.scale = Vector2(0.86, 0.86)
		match_feedback_panel.modulate.a = 0.0
		match_feedback_panel.visible = false
		return
	var css_ease := Callable(self, "_css_cubic_bezier").bind(0.25, 0.1, 0.25, 1.0)
	match_feedback_tween = create_tween()
	match_feedback_tween.set_parallel(true)
	match_feedback_tween.tween_property(match_feedback_panel, "scale", Vector2(0.86, 0.86), 0.1).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
	match_feedback_tween.tween_property(match_feedback_panel, "modulate:a", 0.0, 0.1).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease)
	match_feedback_tween.finished.connect(func() -> void:
		if is_instance_valid(match_feedback_panel) and match_feedback_key.is_empty():
			match_feedback_panel.visible = false
	)


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
	evidence_transition_title.add_theme_font_override("font", UiFonts.serif(800))
	evidence_transition_copy = RichTextLabel.new()
	evidence_transition_copy.bbcode_enabled = true
	evidence_transition_copy.fit_content = true
	evidence_transition_copy.scroll_active = false
	evidence_transition_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	evidence_transition_copy.add_theme_color_override("default_color", Color("#746d7c"))
	evidence_transition_copy.add_theme_font_size_override("normal_font_size", 15)
	evidence_transition_copy.add_theme_font_override("normal_font", UiFonts.serif())
	content.add_child(evidence_transition_copy)
	evidence_transition_continue = Button.new()
	Style.style_button(evidence_transition_continue, true)
	evidence_transition_continue.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_child(evidence_transition_continue)
	evidence_transition_continue.pressed.connect(_continue_story)


func _build_campaign_result() -> void:
	campaign_result_overlay = Control.new()
	campaign_result_overlay.name = "CampaignResult"
	campaign_result_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	campaign_result_overlay.z_index = 30
	campaign_result_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	campaign_result_overlay.visible = false
	add_child(campaign_result_overlay)
	var background_fill := ColorRect.new()
	background_fill.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background_fill.color = Color("#fffaf2")
	background_fill.mouse_filter = Control.MOUSE_FILTER_IGNORE
	campaign_result_overlay.add_child(background_fill)
	var background_wash := TextureRect.new()
	background_wash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background_wash.texture = _campaign_result_wash()
	background_wash.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background_wash.stretch_mode = TextureRect.STRETCH_SCALE
	background_wash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	campaign_result_overlay.add_child(background_wash)
	var header_panel := PanelContainer.new()
	header_panel.anchor_right = 1
	header_panel.offset_bottom = 60
	header_panel.custom_minimum_size.y = 60
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color("#10243d")
	header_style.border_color = Color("#d3b068")
	header_style.border_width_bottom = 2
	header_style.content_margin_left = 6
	header_style.content_margin_right = 6
	header_style.content_margin_top = 5
	header_style.content_margin_bottom = 5
	header_panel.add_theme_stylebox_override("panel", header_style)
	campaign_result_overlay.add_child(header_panel)
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 7)
	header_panel.add_child(header)
	campaign_result_back = _button(header)
	campaign_result_back.text = ""
	_add_header_icon(campaign_result_back, "back")
	_style_header_button(campaign_result_back)
	campaign_result_back.pressed.connect(func() -> void: story_requested.emit())
	var header_copy := VBoxContainer.new()
	header_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header_copy.alignment = BoxContainer.ALIGNMENT_CENTER
	header_copy.add_theme_constant_override("separation", 1)
	header.add_child(header_copy)
	campaign_result_eyebrow = _label(header_copy, 7, Color("#f0d69b"))
	campaign_result_eyebrow.add_theme_font_size_override("font_size", 7)
	campaign_result_eyebrow.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	campaign_result_level = _label(header_copy, 11, Color.WHITE)
	campaign_result_level.add_theme_font_override("font", UiFonts.serif(800))
	campaign_result_level.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	var header_spacer := Control.new()
	header_spacer.custom_minimum_size.x = 44
	header.add_child(header_spacer)
	var content := VBoxContainer.new()
	content.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content.offset_left = 28
	content.offset_right = -28
	content.offset_top = 68
	content.offset_bottom = -24
	content.alignment = BoxContainer.ALIGNMENT_CENTER
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_theme_constant_override("separation", 11)
	campaign_result_overlay.add_child(content)
	var mark_center := CenterContainer.new()
	mark_center.custom_minimum_size.y = 82
	content.add_child(mark_center)
	var mark_panel := PanelContainer.new()
	mark_panel.custom_minimum_size = Vector2(82, 82)
	var mark_style := StyleBoxFlat.new()
	mark_style.bg_color = Color("#d96279")
	mark_style.set_corner_radius_all(41)
	mark_panel.add_theme_stylebox_override("panel", mark_style)
	mark_center.add_child(mark_panel)
	campaign_result_mark = _label(mark_panel, 44, Color.WHITE)
	campaign_result_mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	campaign_result_mark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	campaign_result_kicker = _label(content, 10, Color("#a24762"))
	campaign_result_kicker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	campaign_result_heading = _label(content, 29, Color("#29243d"))
	campaign_result_heading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	campaign_result_heading.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	campaign_result_heading.add_theme_font_size_override("font_size", 29)
	campaign_result_heading.add_theme_font_override("font", UiFonts.serif(800))
	campaign_result_detail = _label(content, 12, Color("#5f5866"))
	campaign_result_detail.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	campaign_result_detail.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var quote_panel := PanelContainer.new()
	var quote_style := StyleBoxFlat.new()
	quote_style.bg_color = Color.WHITE
	quote_style.content_margin_left = 14
	quote_style.content_margin_right = 14
	quote_style.content_margin_top = 14
	quote_style.content_margin_bottom = 14
	quote_panel.add_theme_stylebox_override("panel", quote_style)
	content.add_child(quote_panel)
	campaign_result_loss_quote = RichTextLabel.new()
	campaign_result_loss_quote.name = "LossQuote"
	campaign_result_loss_quote.bbcode_enabled = true
	campaign_result_loss_quote.fit_content = true
	campaign_result_loss_quote.scroll_active = false
	campaign_result_loss_quote.custom_minimum_size.y = 52
	campaign_result_loss_quote.add_theme_color_override("default_color", Color("#5f5866"))
	campaign_result_loss_quote.add_theme_font_size_override("normal_font_size", 14)
	campaign_result_loss_quote.add_theme_font_override("normal_font", UiFonts.serif())
	quote_panel.add_child(campaign_result_loss_quote)
	campaign_result_next = _button(content)
	campaign_result_next.pressed.connect(func() -> void: campaign_next_requested.emit(_next_campaign_level_id()))
	campaign_result_retry = _button(content)
	campaign_result_retry.pressed.connect(_retry)
	campaign_result_hub = _button(content)
	campaign_result_hub.pressed.connect(func() -> void: story_requested.emit())


func _campaign_result_wash() -> Texture2D:
	var gradient := Gradient.new()
	gradient.set_color(0, Color("#fffaf2"))
	gradient.add_point(1.0, Color("#eadce4"))
	var texture := GradientTexture2D.new()
	texture.gradient = gradient
	texture.width = 1
	texture.height = 512
	return texture


func _refresh_campaign_result(locale: String) -> void:
	var copy: Dictionary = campaign_bundle.campaignLocalized.get(locale, campaign_bundle.campaignLocalized.en)
	var won: bool = game.state == "won"
	campaign_result_loss_quote.get_parent().visible = false
	campaign_result_detail.visible = true
	campaign_result_back.tooltip_text = str(copy.back)
	campaign_result_eyebrow.text = str(copy.eyebrow)
	campaign_result_level.text = str(level_data.shortId)
	campaign_result_mark.text = "✓" if won else "↻"
	campaign_result_kicker.text = MenuCopy.text("campaign_win_eyebrow" if won else "campaign_loss_eyebrow", locale)
	campaign_result_heading.text = MenuCopy.text("campaign_win_heading" if won else "campaign_loss_heading", locale)
	campaign_result_detail.text = MenuCopy.text("campaign_result_detail", locale).replace("{movesLeft}", str(game.moves_left))
	campaign_result_next.text = MenuCopy.text("campaign_next_level", locale)
	campaign_result_retry.text = MenuCopy.text("campaign_retry_level", locale)
	campaign_result_hub.text = MenuCopy.text("campaign_back_to_hub", locale)
	campaign_result_next.visible = won and not _next_campaign_level_id().is_empty()
	Style.style_button(campaign_result_next, true)
	Style.style_button(campaign_result_retry, not campaign_result_next.visible)
	Style.style_button(campaign_result_hub, false)
	campaign_result_retry.visible = true
	campaign_result_hub.visible = true


func _refresh_story_loss_result(locale: String, copy: Dictionary) -> void:
	campaign_result_back.tooltip_text = MenuCopy.text("match3_back_to_investigation", locale)
	campaign_result_eyebrow.text = str(level_data.get("shortId", ""))
	campaign_result_level.text = MenuCopy.text("match3_result_title", locale)
	campaign_result_mark.text = "↻"
	campaign_result_kicker.text = MenuCopy.text("match3_feedback_out_of_moves", locale)
	campaign_result_heading.text = MenuCopy.text("match3_loss_heading", locale)
	campaign_result_detail.visible = false
	campaign_result_loss_quote.get_parent().visible = true
	var speaker := str(copy.get("loseSpeaker", ""))
	var lose_text := str(copy.get("loseText", "")).replace("[", "[lb]")
	campaign_result_loss_quote.text = "[b][color=#d96279]%s[/color][/b]\n%s" % [speaker, lose_text]
	campaign_result_next.visible = false
	campaign_result_retry.text = MenuCopy.text("match3_retry_level", locale)
	campaign_result_hub.visible = false
	Style.style_button(campaign_result_retry, true)


func _next_campaign_level_id() -> String:
	var levels: Array = campaign_bundle.get("levels", [])
	for index in levels.size():
		if str(levels[index].get("id", "")) != level_id: continue
		return str(levels[index + 1].get("id", "")) if index + 1 < levels.size() else ""
	return ""


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
	if _prefers_reduced_motion(): return
	var special_kinds: Array = frame.get("specials", [])
	var cleared: Array = frame.get("cleared", [])
	var activated_sources: Array[int] = []
	for index_value in cleared:
		var index := int(index_value)
		if index >= 0 and index < special_kinds.size() and not str(special_kinds[index]).is_empty():
			activated_sources.append(index)
	if activated_sources.is_empty(): return
	var impact_curve := Callable(self, "_css_cubic_bezier").bind(0.18, 0.82, 0.28, 1.0)
	var css_ease_out := Callable(self, "_css_cubic_bezier").bind(0.0, 0.0, 0.58, 1.0)
	for index_value in cleared:
		var index := int(index_value)
		if index < 0 or index >= board.get_child_count(): continue
		var cell := board.get_child(index) as Control
		var is_source := activated_sources.has(index)
		var resting_z_index := cell.z_index
		cell.z_index = 6 if is_source else 3
		var flash := ColorRect.new()
		flash.name = "SpecialImpactFlash"
		flash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		flash.pivot_offset = cell.size * 0.5
		flash.scale = Vector2(0.72, 0.72)
		flash.material = _special_impact_flash_material()
		flash.modulate.a = 0.0
		flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
		flash.z_index = 8
		cell.add_child(flash)
		var flash_tween := create_tween()
		flash_tween.tween_property(flash, "modulate:a", 1.0, 0.095).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
		flash_tween.parallel().tween_property(flash, "scale", Vector2(1.04, 1.04), 0.095).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
		flash_tween.tween_property(flash, "modulate:a", 0.0, 0.185).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
		flash_tween.parallel().tween_property(flash, "scale", Vector2(1.12, 1.12), 0.185).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
		flash_tween.finished.connect(flash.queue_free)
		var outline := Panel.new()
		outline.name = "SpecialImpactSourceOutline" if is_source else "SpecialImpactTargetOutline"
		outline.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		outline.offset_left = -1.0 if is_source else 1.0
		outline.offset_top = -1.0 if is_source else 1.0
		outline.offset_right = 1.0 if is_source else -1.0
		outline.offset_bottom = 1.0 if is_source else -1.0
		outline.mouse_filter = Control.MOUSE_FILTER_IGNORE
		outline.z_index = 9
		var outline_style := StyleBoxFlat.new()
		outline_style.bg_color = Color(0, 0, 0, 0)
		outline_style.border_color = Color("#fff2a8")
		outline_style.set_border_width_all(3 if is_source else 2)
		outline_style.set_corner_radius_all(3)
		outline_style.shadow_color = Color("#6ce2d388" if is_source else "#6ce2d355")
		outline_style.shadow_size = 18 if is_source else 8
		outline.add_theme_stylebox_override("panel", outline_style)
		outline.modulate.a = 1.0 if is_source else 0.0
		cell.add_child(outline)
		if not is_source:
			var outline_tween := create_tween()
			outline_tween.tween_property(outline, "modulate:a", 1.0, 0.095).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
			outline_tween.tween_property(outline, "modulate:a", 0.0, 0.185).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
			outline_tween.finished.connect(outline.queue_free)
		var impact_tween := create_tween()
		var peak_scale := 1.11 if is_source else 1.055
		impact_tween.tween_property(cell, "scale", Vector2(peak_scale, peak_scale), 0.118).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
		if not is_source:
			impact_tween.parallel().tween_property(cell, "modulate", Color(1.42, 1.42, 1.42, 1.0), 0.118).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
		var return_impact := impact_tween.tween_property(cell, "scale", Vector2.ONE, 0.162).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
		return_impact.from(Vector2(peak_scale, peak_scale))
		if not is_source:
			var return_brightness := impact_tween.parallel().tween_property(cell, "modulate", Color.WHITE, 0.162).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
			return_brightness.from(Color(1.42, 1.42, 1.42, 1.0))
		impact_tween.finished.connect(Callable(self, "_restore_special_impact_z_index").bind(cell, resting_z_index))
		var special_kind := str(special_kinds[index]) if index < special_kinds.size() else ""
		if special_kind.is_empty(): continue
		var tile_stack := cell.get_node_or_null("TileStack") as Control
		var special_icon := tile_stack.get_node_or_null("Special") as Control if tile_stack != null else null
		if special_icon != null:
			special_icon.pivot_offset = special_icon.size * 0.5
			special_icon.scale = Vector2(0.82, 0.82)
			special_icon.rotation_degrees = -8.0
			var impact_material := (special_icon.material as ShaderMaterial).duplicate() as ShaderMaterial
			impact_material.set_shader_parameter("glow_strength", 1.0)
			impact_material.set_shader_parameter("glow_white", Color.WHITE)
			impact_material.set_shader_parameter("glow_white_radius_px", 5.0)
			impact_material.set_shader_parameter("glow_gold", Color("#fff0a8"))
			impact_material.set_shader_parameter("glow_gold_radius_px", 10.0)
			impact_material.set_shader_parameter("glow_aqua", Color("#6ce2d3"))
			impact_material.set_shader_parameter("glow_aqua_radius_px", 14.0)
			special_icon.material = impact_material
			var icon_tween := create_tween()
			icon_tween.tween_property(special_icon, "scale", Vector2(1.24, 1.24), 0.118).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
			icon_tween.parallel().tween_property(special_icon, "rotation_degrees", 4.0, 0.118).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
			icon_tween.tween_property(special_icon, "scale", Vector2.ONE, 0.162).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
			icon_tween.parallel().tween_property(special_icon, "rotation_degrees", 0.0, 0.162).set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(impact_curve)
		if special_kind == "flash-row" or special_kind == "flash-column":
			var beam := ColorRect.new()
			beam.name = "SpecialImpactBeam"
			beam.pivot_offset = cell.size * 0.5
			beam.material = _special_impact_beam_material(special_kind == "flash-column")
			beam.modulate.a = 0.0
			beam.mouse_filter = Control.MOUSE_FILTER_IGNORE
			beam.z_index = 10
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
			beam.scale = Vector2(1.0, 0.25) if special_kind == "flash-column" else Vector2(0.25, 1.0)
			var beam_tween := create_tween()
			beam_tween.tween_property(beam, "modulate:a", 1.0, 0.098).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
			beam_tween.parallel().tween_property(beam, "scale", Vector2(1.0, 1.15) if special_kind == "flash-column" else Vector2(1.15, 1.0), 0.098).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
			beam_tween.tween_property(beam, "modulate:a", 0.0, 0.182).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
			beam_tween.parallel().tween_property(beam, "scale", Vector2.ONE, 0.182).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
			beam_tween.finished.connect(beam.queue_free)


func _restore_special_impact_z_index(cell: Control, resting_z_index: int) -> void:
	if is_instance_valid(cell):
		cell.z_index = resting_z_index


func _special_impact_flash_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
	shader_type canvas_item;
	void fragment() {
		float radius = distance(UV, vec2(0.5)) / length(vec2(0.5));
		vec4 inner_glow = vec4(1.0, 0.930, 0.527, 0.302);
		vec4 outer_glow = vec4(0.145, 0.761, 0.638, 0.161);
		vec4 glow = vec4(0.0);
		if (radius <= 0.35) {
			glow = inner_glow;
		} else if (radius <= 0.58) {
			glow = mix(inner_glow, outer_glow, (radius - 0.35) / 0.23);
		} else if (radius <= 0.76) {
			glow = mix(outer_glow, vec4(0.0), (radius - 0.58) / 0.18);
		}
		COLOR = glow * COLOR;
	}
	"""
	var material := ShaderMaterial.new()
	material.shader = shader
	return material


func _special_impact_beam_material(vertical: bool) -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
	shader_type canvas_item;
	uniform bool vertical_gradient = false;
	void fragment() {
		float point = vertical_gradient ? UV.y : UV.x;
		float edge_alpha = smoothstep(0.0, 0.2, point) * (1.0 - smoothstep(0.8, 1.0, point));
		float teal = 1.0 - min(abs(point - 0.5) * 5.0, 1.0);
		vec3 gold = vec3(1.0, 0.96, 0.74);
		vec3 aqua = vec3(0.42, 0.89, 0.83);
		COLOR = vec4(mix(gold, aqua, teal), edge_alpha) * COLOR;
	}
	"""
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("vertical_gradient", vertical)
	return material


func _play_move_frames(result: Dictionary, first: int, second: int) -> void:
	input_locked = true
	var reduced_motion := _prefers_reduced_motion()
	var valid := bool(result.valid)
	if valid:
		_present_narrative_reaction(result)
		_clear_match_feedback()
		if reduced_motion:
			_render_board()
		else:
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
		if reduced_motion and bool(result.get("reshuffled", false)):
			_show_match_feedback("reshuffled")
			await get_tree().create_timer(0.16).timeout
		elif not reduced_motion and bool(result.get("reshuffled", false)):
			_show_match_feedback("reshuffled")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif not reduced_motion and int(result.get("cascades", 0)) >= 2:
			_show_match_feedback("chain", int(result.cascades))
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif not reduced_motion and int(result.get("ingredientsDropped", 0)) > 0:
			_show_match_feedback("match", 1, "clue_collected")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif not reduced_motion and game.state == "lost":
			_show_match_feedback("loss", 1, "out_of_moves")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		elif not reduced_motion and game.state == "won":
			_show_match_feedback("win", 1, "clue_collected")
			await get_tree().create_timer(FEEDBACK_HOLD_SECONDS).timeout
		_clear_match_feedback()
	else:
		var reason := str(result.get("reason", ""))
		if reason == "no-match" and not reduced_motion:
			await _animate_swap(first, second, true)
		_show_match_feedback("reject", 1, _invalid_feedback_key(reason))
		if reason == "no-match" and not reduced_motion: await _return_rejected_swap(first, second)
		await get_tree().create_timer(INVALID_HOLD_SECONDS).timeout
		_clear_match_feedback()
		last_feedback = ""
	_render_board()
	input_locked = false


func _speaker_portrait(speaker: String) -> Texture2D:
	var reaction_speaker := reaction_runtime.speaker_id(preferences.locale, speaker)
	var reaction_portrait := reaction_runtime.speaker_portrait_path(reaction_speaker)
	if not reaction_portrait.is_empty() and ResourceLoader.exists(reaction_portrait):
		return load(reaction_portrait) as Texture2D
	var normalized := speaker.to_lower()
	var character := "miku"
	if ["onoe", "оноэ", "онoэ"].any(func(name: String) -> bool: return normalized.contains(name)):
		character = "onoe"
	elif ["ayuki", "аюки"].any(func(name: String) -> bool: return normalized.contains(name)):
		character = "ayuki"
	var path := "res://assets/characters/%s/portrait_neutral_256.png" % character
	return load(path) as Texture2D if ResourceLoader.exists(path) else null


func _set_bark_emphasis(emphasis: String) -> void:
	if not is_instance_valid(bark_panel) or bark_base_style == null: return
	var style := bark_base_style.duplicate() as StyleBoxFlat
	style.shadow_color = Color("#252b3c40")
	style.shadow_size = 14
	style.shadow_offset = Vector2(0, 5)
	if emphasis == "urgent":
		style.border_width_left = 5
		style.border_color = Color("#d96279")
		style.shadow_color = Color("#252b3c52")
		style.shadow_size = 18
		style.shadow_offset = Vector2(0, 6)
	elif emphasis == "strong":
		style.border_width_left = 5
	elif emphasis == "light":
		style.shadow_color = Color("#252b3c2e")
		style.shadow_size = 9
		style.shadow_offset = Vector2(0, 3)
	bark_panel.add_theme_stylebox_override("panel", style)


func _present_narrative_reaction(result: Dictionary) -> void:
	var objectives_completed := 0
	var objective_units_remaining := 0
	for index in level_data.get("objectives", []).size():
		var objective_data: Dictionary = level_data.objectives[index]
		var value: int = game.objective_value(index)
		var target := int(objective_data.get("target", 0))
		if value >= target: objectives_completed += 1
		objective_units_remaining += maxi(0, target - value)
	reaction_blockers_cleared += int(result.get("blockersCleared", 0))
	var context := {
		"narrativeProfile": str(level_data.get("narrativeProfile", "")),
		"runMode": "campaign" if campaign_mode else "story",
		"movesLeft": game.moves_left,
		"moveNumber": int(level_data.get("moves", 0)) - game.moves_left,
		"blockersCleared": reaction_blockers_cleared,
		"specialsCreated": int(result.get("specialsCreated", 0)),
		"cascades": int(result.get("cascades", 0)),
		"specialActivated": str(result.get("primaryFeedback", "")) == "special",
		"directSpecialCombo": bool(result.get("specialsCombined", false)),
		"objectivesCompleted": objectives_completed,
		"objectiveUnitsRemaining": objective_units_remaining,
		"won": bool(result.get("won", false)),
		"lost": bool(result.get("lost", false)),
	}
	var reaction: Dictionary = reaction_runtime.resolve(level_id, context, triggered_reactions)
	if reaction.is_empty(): return
	var reaction_id := str(reaction.get("id", ""))
	var reaction_policy := reaction_runtime.policy(reaction_id)
	var now := Time.get_ticks_msec()
	var last_presented: Variant = reaction_presented_at.get(reaction_id, null)
	var cooldown := int(reaction_policy.get("cooldownMs", 0))
	if str(reaction.get("repeat", "")) == "repeatable" and cooldown > 0 and last_presented != null and now - int(last_presented) < cooldown:
		return
	if str(reaction.get("repeat", "")) == "once-per-attempt": triggered_reactions[reaction_id] = true
	reaction_presented_at[reaction_id] = now
	active_reaction = reaction
	reaction_generation += 1
	var generation := reaction_generation
	_refresh()
	_animate_reaction_enter()
	get_tree().create_timer(float(reaction_policy.get("durationMs", 0)) / 1000.0).timeout.connect(
		_dismiss_narrative_reaction.bind(reaction_id, generation), CONNECT_ONE_SHOT)


func _animate_reaction_enter() -> void:
	if reaction_tween != null and reaction_tween.is_valid(): reaction_tween.kill()
	bark_panel.position.y = 0.0
	bark_panel.modulate = Color.WHITE
	if _prefers_reduced_motion(): return
	var ease_out := Callable(self, "_css_cubic_bezier").bind(0.0, 0.0, 0.58, 1.0)
	bark_panel.position.y = 4.0
	bark_panel.modulate.a = 0.0
	reaction_tween = create_tween()
	reaction_tween.tween_property(bark_panel, "position:y", 0.0, 0.16).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_out)
	reaction_tween.parallel().tween_property(bark_panel, "modulate:a", 1.0, 0.16).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_out)



func _dismiss_narrative_reaction(reaction_id: String, generation: int = -1) -> void:
	if generation >= 0 and generation != reaction_generation: return
	if str(active_reaction.get("id", "")) != reaction_id: return
	if reaction_tween != null and reaction_tween.is_valid(): reaction_tween.kill()
	var reduced := _prefers_reduced_motion()
	var duration := 0.08 if reduced else 0.18
	var ease_out := Callable(self, "_css_cubic_bezier").bind(0.0, 0.0, 0.58, 1.0)
	reaction_tween = create_tween()
	reaction_tween.tween_property(bark_panel, "modulate:a", 0.0, duration).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_out)
	if not reduced:
		reaction_tween.parallel().tween_property(bark_panel, "position:y", -2.0, duration).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_out)
	reaction_tween.finished.connect(_finish_narrative_reaction_dismiss.bind(reaction_id, reaction_generation), CONNECT_ONE_SHOT)


func _finish_narrative_reaction_dismiss(reaction_id: String, generation: int = -1) -> void:
	if generation >= 0 and generation != reaction_generation: return
	if str(active_reaction.get("id", "")) != reaction_id: return
	active_reaction.clear()
	bark_panel.position.y = 0.0
	bark_panel.modulate = Color.WHITE
	_refresh()


func _new_game_for_attempt() -> RefCounted:
	reaction_generation += 1
	triggered_reactions.clear()
	reaction_presented_at.clear()
	active_reaction.clear()
	reaction_blockers_cleared = 0
	if reaction_tween != null and reaction_tween.is_valid(): reaction_tween.kill()
	if is_instance_valid(bark_panel):
		bark_panel.position.y = 0.0
		bark_panel.modulate = Color.WHITE
	var runtime_level: Dictionary = level_data.duplicate(true)
	runtime_level.erase("openingBoard")
	runtime_level.erase("seededOpeningBoard")
	var attempt := int(session.save.attempts.get(level_id, 0))
	runtime_level.seed = int(level_data.seed) + attempt * 101
	tutorial_reveal_events = ["level-start"]
	active_tutorial = ""
	tutorial_prompt_dismissed = false
	return Game.new(runtime_level)


func _select_cell(index: int) -> void:
	if suppress_drag_click_index == index:
		suppress_drag_click_index = -1
		return
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
		_record_tutorial_move(special_result, true)
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
	if not result.valid and str(result.reason) == "not-adjacent":
		selected_index = index
		last_feedback = "not-adjacent"
		input_locked = true
		_refresh()
		_show_match_feedback("reject", 1, _invalid_feedback_key("not-adjacent"))
		await get_tree().create_timer(INVALID_HOLD_SECONDS).timeout
		_clear_match_feedback()
		last_feedback = ""
		_refresh()
		input_locked = false
		return
	if result.valid:
		selected_index = -1
		last_feedback = ""
		if game.state == "won":
			session.complete_level(level_id, game.moves_left)
			if not campaign_mode and story_session != null: story_session.complete_match3(level_id)
	else:
		selected_index = -1
		last_feedback = str(result.reason)
	await _play_move_frames(result, first_index, index)
	_record_tutorial_move(result)
	if result.valid and game.state == "won":
		_show_story_evidence_transition()
	_refresh()


func _on_tile_gui_input(event: InputEvent, index: int) -> void:
	if input_locked or game == null or game.state != "playing" or tutorial_panel.visible:
		return
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			_begin_tile_drag(index, _tile_event_position(event, index))
		else:
			_end_tile_drag(_tile_event_position(event, index))
	elif event is InputEventMouseMotion and drag_start_index >= 0 and (event.button_mask & MOUSE_BUTTON_MASK_LEFT) != 0:
		_update_tile_drag(_tile_event_position(event, index))
	elif event is InputEventScreenTouch:
		if event.pressed:
			_begin_tile_drag(index, _tile_event_position(event, index))
		else:
			_end_tile_drag(_tile_event_position(event, index))
	elif event is InputEventScreenDrag and drag_start_index >= 0:
		_update_tile_drag(_tile_event_position(event, index))


func _tile_event_position(event: InputEvent, index: int) -> Vector2:
	if event is InputEventMouse:
		return get_global_mouse_position()
	if index < 0 or index >= board.get_child_count(): return Vector2.ZERO
	var cell := board.get_child(index) as Control
	return cell.get_global_transform_with_canvas() * event.position


func _begin_tile_drag(index: int, position: Vector2) -> void:
	if index < 0 or index >= game.tiles.size() or game.tiles[index].is_empty() or game.blocker_layers[index] > 0:
		return
	drag_start_index = index
	drag_start_position = position
	drag_target_index = -1
	var cell := board.get_child(index) as Control
	drag_start_cell_size = maxf(1.0, cell.size.x)
	hinted_indices.clear()


func _update_tile_drag(position: Vector2) -> void:
	if drag_start_index < 0 or input_locked:
		return
	var delta := position - drag_start_position
	var horizontal := absf(delta.x)
	var vertical := absf(delta.y)
	var direction := ""
	if horizontal >= vertical * 1.08:
		direction = "left" if delta.x < 0.0 else "right"
	elif vertical >= horizontal * 1.08:
		direction = "up" if delta.y < 0.0 else "down"
	var target := _drag_neighbour(drag_start_index, direction) if not direction.is_empty() else -1
	var distance := absf(delta.x) if direction in ["left", "right"] else absf(delta.y) if direction in ["up", "down"] else 0.0
	var signed_distance := delta.x if direction in ["left", "right"] else delta.y
	var visual_limit := drag_start_cell_size * 0.94
	var travel := clampf(signed_distance, -visual_limit, visual_limit)
	var reacting := target >= 0 and distance >= drag_start_cell_size * 0.035
	var source := board.get_child(drag_start_index) as Control
	var source_stack := source.get_node_or_null("TileStack") as Control
	if source_stack != null:
		source.z_index = 9
		source.clip_contents = false
		_set_stack_translation(source_stack, Vector2(travel, 0.0) if direction in ["left", "right"] else Vector2(0.0, travel))
		source_stack.scale = Vector2.ONE * 1.06
		source_stack.modulate = Color(1.08, 1.08, 1.08, 1.0)
	if drag_target_index >= 0 and drag_target_index < board.get_child_count():
		var previous := board.get_child(drag_target_index) as Control
		var previous_stack := previous.get_node_or_null("TileStack") as Control
		if previous_stack != null:
			_set_stack_translation(previous_stack, Vector2.ZERO)
			previous_stack.scale = Vector2.ONE
	if reacting:
		var target_cell := board.get_child(target) as Control
		var target_stack := target_cell.get_node_or_null("TileStack") as Control
		if target_stack != null:
			var reaction := minf(drag_start_cell_size * 0.18, distance * 0.18) * (-1.0 if signed_distance > 0.0 else 1.0)
			_set_stack_translation(target_stack, Vector2(reaction, 0.0) if direction in ["left", "right"] else Vector2(0.0, reaction))
			target_stack.scale = Vector2.ONE * 0.97
	drag_target_index = target if reacting else -1


func _end_tile_drag(position: Vector2) -> void:
	if drag_start_index < 0:
		return
	var start := drag_start_index
	var delta := position - drag_start_position
	var horizontal := absf(delta.x)
	var vertical := absf(delta.y)
	var direction := ""
	if horizontal >= vertical * 1.08:
		direction = "left" if delta.x < 0.0 else "right"
	elif vertical >= horizontal * 1.08:
		direction = "up" if delta.y < 0.0 else "down"
	var target := _drag_neighbour(start, direction) if not direction.is_empty() else -1
	var should_swap := target >= 0 and maxf(horizontal, vertical) >= drag_start_cell_size * 0.24
	_clear_drag_preview()
	if should_swap and not input_locked:
		selected_index = start
		suppress_drag_click_index = start
		await _select_cell(target)
		await get_tree().process_frame
		suppress_drag_click_index = -1


func _drag_neighbour(index: int, direction: String) -> int:
	if direction.is_empty(): return -1
	var columns := int(level_data.get("columns", 8))
	var rows := int(level_data.get("rows", 8))
	var row := index / columns
	var column := index % columns
	if direction == "left": column -= 1
	elif direction == "right": column += 1
	elif direction == "up": row -= 1
	else: row += 1
	if row < 0 or row >= rows or column < 0 or column >= columns: return -1
	var target := row * columns + column
	return target if game._is_active(target) else -1


func _clear_drag_preview() -> void:
	for index in [drag_start_index, drag_target_index]:
		if index < 0 or index >= board.get_child_count(): continue
		var cell := board.get_child(index) as Control
		cell.z_index = 0
		cell.clip_contents = true
		var stack := cell.get_node_or_null("TileStack") as Control
		if stack != null:
			_set_stack_translation(stack, Vector2.ZERO)
			stack.scale = Vector2.ONE
			stack.modulate = Color.WHITE
	drag_start_index = -1
	drag_target_index = -1


func _set_stack_translation(stack: Control, translation: Vector2) -> void:
	stack.offset_left = translation.x
	stack.offset_right = translation.x
	stack.offset_top = translation.y
	stack.offset_bottom = translation.y


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
	if active_tutorial.is_empty(): return
	if active_tutorial == "activate-special":
		var progress := _tutorial_progress()
		if not progress.has(active_tutorial):
			progress.append(active_tutorial)
			_persist_tutorial_progress()
	tutorial_prompt_dismissed = true
	_refresh()


func _tutorial_progress() -> Array:
	if story_session != null:
		return story_session.state.tutorialsCompleted
	return session.save.tutorialsCompleted


func _persist_tutorial_progress() -> void:
	if story_session != null:
		story_session.persist()
	else:
		session.persist()


func _sync_tutorial_prompt() -> void:
	var revealed := tutorial_reveal_events.duplicate()
	var board_events: Array[String] = Tutorials.board_reveal_events(game.specials, int(level_data.rows), int(level_data.columns))
	for event in board_events:
		if not revealed.has(event): revealed.append(event)
	var next := Tutorials.next_pending(level_data.get("tutorialConcepts", []), _tutorial_progress(), revealed)
	if next != active_tutorial:
		active_tutorial = next
		tutorial_prompt_dismissed = false


func _record_tutorial_move(result: Dictionary, direct_activation := false) -> void:
	if not bool(result.get("valid", false)): return
	for event in Tutorials.reveal_events_for_move(result):
		if not tutorial_reveal_events.has(event): tutorial_reveal_events.append(event)
	var events := Tutorials.completion_events(result, direct_activation, bool(result.get("specialsCombined", false)))
	var progress := _tutorial_progress()
	var completed := Tutorials.completed_by_events(level_data.get("tutorialConcepts", []), progress, events)
	if not completed.is_empty():
		for concept in completed:
			progress.append(concept)
		_persist_tutorial_progress()
	_sync_tutorial_prompt()


func _retry() -> void:
	session.start_level(level_id)
	game = _new_game_for_attempt()
	selected_index = -1
	last_feedback = ""
	_sync_tutorial_prompt()
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
	button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
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
	button.add_theme_font_override("font", UiFonts.match3(900))
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
	button.add_theme_color_override("font_color", Color("#fff7dc"))
	button.add_theme_color_override("font_hover_color", Color("#fff7dc"))
	button.add_theme_color_override("font_pressed_color", Color("#fff7dc"))
	var tutorial_button_font := UiFonts.sans(950)
	button.add_theme_font_override("font", tutorial_button_font)
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("#2f6549")
	normal.border_color = Color("#d5b269")
	normal.set_border_width_all(2)
	normal.set_corner_radius_all(5)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#244d39")
	var pressed := normal.duplicate() as StyleBoxFlat
	pressed.bg_color = Color("#1c402f")
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("pressed", pressed)


func _fit_tutorial_card() -> void:
	if not is_instance_valid(tutorial_panel) or not is_instance_valid(tutorial_frame): return
	var card_width := minf(350.0, maxf(0.0, size.x - 28.0))
	tutorial_panel.custom_minimum_size.x = card_width
	tutorial_panel.custom_maximum_size.x = card_width
	tutorial_frame.custom_minimum_size.x = card_width + 6.0
	var compact := size.x <= 340.0
	tutorial_title.add_theme_font_size_override("font_size", 20 if compact else 24)
	tutorial_body.add_theme_font_size_override("font_size", 11 if compact else 13)
	var content_layer := tutorial_panel.get_node("TutorialContentLayer") as Control
	content_layer.custom_minimum_size.y = 207.0 + maxf(0.0, 350.0 - card_width) * 0.8
