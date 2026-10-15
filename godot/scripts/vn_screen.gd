extends Control

signal menu_requested
signal progress_reset_requested
signal match3_requested(level_id: String)
signal overlay_closed

const Prologue = preload("res://data/prologue.json")
const LockerScene = preload("res://data/locker_scene.json")
const EndingOutcomes = preload("res://data/ending_outcomes.json")
const Copy = preload("res://scripts/menu_copy.gd")
const Style = preload("res://scripts/menu_theme.gd")
const PhoneFrame = preload("res://scripts/phone_frame.gd")
const Match3CampaignData = preload("res://scripts/match3_campaign_data.gd")
const CssMotion = preload("res://scripts/css_motion.gd")

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
var page_progress: HBoxContainer
var case_button: Button
var case_label: Label
var clue_badge: Label
var warning: Label
var boundary: Label
var menu_button: Button
var history_button: Button
var settings_button: Button
var next_button: Button
var controls_panel: PanelContainer
var skip_button: Button
var auto_button: Button
var save_button: Button
var load_button: Button
var status: PanelContainer
var status_label: Label
var background_fill: TextureRect
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
var overlay: Control
var overlay_return_focus: Control
var overlay_title: Label
var overlay_body: VBoxContainer
var overlay_scroll: ScrollContainer
var dossier_clues: GridContainer
var dossier_theories: VBoxContainer
var dossier_clues_tab: Button
var dossier_theories_tab: Button
var _dossier_tab := "clues"
var _boundary := false
var _last_advance := -1000
var _gate_requested := false
var _dialogue_line_id := ""
var _dialogue_locale := ""
var _pending_clue_id := ""
var _dialogue_pages: Array[String] = []
var _dialogue_page_index := 0
var _auto_mode := false
var _auto_generation := 0
var _auto_speed := "normal"
var _text_scale := "normal"
var config_speed_buttons: Dictionary = {}
var config_text_buttons: Dictionary = {}


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	PhoneFrame.fit(self)
	visibility_changed.connect(_on_visibility_changed)
	background_fill = TextureRect.new()
	background_fill.name = "BackgroundFill"
	background_fill.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background_fill.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background_fill.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	background_fill.material = _background_blur_material()
	background_fill.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background_fill)
	background_rect = TextureRect.new()
	background_rect.name = "BackgroundFit"
	background_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	background_rect.modulate = Color(0.92, 0.92, 0.92, 1.0)
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
	header_background.offset_bottom = 60
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color("#17304d")
	header_style.border_color = Color("#d3b068")
	header_style.border_width_bottom = 2
	header_background.add_theme_stylebox_override("panel", header_style)
	header_background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(header_background)
	var header := HBoxContainer.new()
	header.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	header.offset_left = 8
	header.offset_right = -8
	header.offset_top = 7
	header.add_theme_constant_override("separation", 6)
	add_child(header)
	menu_button = Button.new()
	menu_button.pressed.connect(func() -> void: menu_requested.emit())
	case_button = Button.new()
	case_button.name = "CaseDossier"
	case_button.custom_minimum_size = Vector2(0, 44)
	case_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	case_button.add_theme_stylebox_override("normal", _case_button_style())
	case_button.add_theme_stylebox_override("hover", _case_button_style(true))
	case_button.pressed.connect(_show_dossier)
	header.add_child(case_button)
	var case_row := HBoxContainer.new()
	case_row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	case_row.add_theme_constant_override("separation", 6)
	case_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	case_button.add_child(case_row)
	var case_copy := VBoxContainer.new()
	case_copy.alignment = BoxContainer.ALIGNMENT_CENTER
	case_copy.add_theme_constant_override("separation", 0)
	case_copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	case_copy.mouse_filter = Control.MOUSE_FILTER_IGNORE
	case_row.add_child(case_copy)
	case_label = _label(case_copy, 8)
	case_label.add_theme_color_override("font_color", Color("#e9d5a7"))
	title = _label(case_copy, 11)
	title.add_theme_font_size_override("font_size", 12)
	title.add_theme_color_override("font_color", Color("#fff9ea"))
	var dossier_icon := _icon_texture("dossier", 22)
	dossier_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	case_row.add_child(dossier_icon)
	var badge := PanelContainer.new()
	badge.custom_minimum_size = Vector2(16, 16)
	badge.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var badge_style := StyleBoxFlat.new()
	badge_style.bg_color = Color("#d95170")
	badge_style.set_corner_radius_all(8)
	badge.add_theme_stylebox_override("panel", badge_style)
	badge.mouse_filter = Control.MOUSE_FILTER_IGNORE
	case_row.add_child(badge)
	clue_badge = _label(badge, 8)
	clue_badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	clue_badge.add_theme_color_override("font_color", Color.WHITE)
	history_button = _header_icon_button(header, "log", Copy.text("vn_history", preferences.locale))
	history_button.pressed.connect(_show_history)
	settings_button = _header_icon_button(header, "settings", Copy.text("settings", preferences.locale))
	settings_button.pressed.connect(_show_config)
	dialogue_panel = PanelContainer.new()
	dialogue_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dialogue_panel.anchor_top = 0.70
	dialogue_panel.anchor_bottom = 1.0
	dialogue_panel.offset_left = 12
	dialogue_panel.offset_right = -12
	dialogue_panel.offset_bottom = -78
	var paper := StyleBoxFlat.new()
	paper.bg_color = Color("#fff8e8f7")
	paper.border_color = Color("#d9bd83")
	paper.set_border_width_all(2)
	paper.set_corner_radius_all(18)
	paper.content_margin_left = 20
	paper.content_margin_right = 20
	paper.content_margin_top = 55
	paper.content_margin_bottom = 16
	dialogue_panel.add_theme_stylebox_override("panel", paper)
	add_child(dialogue_panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 6)
	dialogue_panel.add_child(content)
	nameplate = PanelContainer.new()
	nameplate.name = "Nameplate"
	nameplate.custom_minimum_size = Vector2(200.0, 38.0)
	nameplate.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	nameplate.anchor_top = 0.70
	nameplate.anchor_bottom = 0.70
	nameplate.offset_left = 28
	nameplate.offset_top = -30
	nameplate.offset_right = 228
	nameplate.offset_bottom = 8
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
	add_child(nameplate)
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
	dialogue.scroll_active = false
	dialogue.scroll_following = false
	content.add_child(dialogue)
	warning = _label(content, 13)
	warning.add_theme_color_override("font_color", Color("#ac3f59"))
	boundary = _label(content, 13)
	var footer := HBoxContainer.new()
	content.add_child(footer)
	progress = _label(footer, 13)
	progress.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	page_progress = HBoxContainer.new()
	page_progress.name = "DialogueProgress"
	page_progress.custom_minimum_size.x = 38.0
	page_progress.size_flags_horizontal = Control.SIZE_SHRINK_END
	page_progress.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	page_progress.alignment = BoxContainer.ALIGNMENT_CENTER
	page_progress.add_theme_constant_override("separation", 4)
	footer.add_child(page_progress)
	next_button = _button(footer)
	next_button.pressed.connect(_next)
	_build_controls()
	_build_ending_panel()
	session.changed.connect(_refresh)
	preferences.locale_changed.connect(func(_locale: String) -> void: _refresh())
	_refresh()
	if not session.ending_result().is_empty():
		ending_menu_button.grab_focus()
	elif session.at_match3_gate():
		case_button.grab_focus()
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
	controls_panel.show()
	case_button.show()
	history_button.show()
	title.show()
	settings_button.show()
	var line: Dictionary = session.current_line()
	if line.is_empty():
		return
	var data: Dictionary = session.scene_data()
	var locale: String = preferences.locale
	var copy: Dictionary = line.localized[locale]
	dialogue.add_theme_font_size_override("normal_font_size", 19 if _text_scale == "large" else 17)
	if _dialogue_line_id != str(line.id) or _dialogue_locale != locale:
		_dialogue_line_id = str(line.id)
		_dialogue_locale = locale
		_dialogue_page_index = 0
		_dialogue_pages.clear()
	title.text = data.titles[locale]
	_set_background(str(line.get("background", data.get("background", "./assets/backgrounds/BG_CLUBROOM_DAY.webp"))))
	speaker.text = copy.speaker
	emotion.text = copy.emotion
	if _dialogue_pages.is_empty():
		_dialogue_pages = _paginate_dialogue(str(copy.text))
	_dialogue_page_index = mini(_dialogue_page_index, _dialogue_pages.size() - 1)
	_update_dialogue_page()
	var lines: Array = Prologue.data.lines if session.state.scene == 0 else LockerScene.data.variants[session.state.choice] if session.state.scene == 1 else data.lines
	progress.text = "%d / %d" % [int(session.state.line) + 1, lines.size()]
	case_label.text = Copy.text("vn_case_scene", locale) + " %02d" % int(session.state.scene)
	clue_badge.text = str(session.state.clues.size())
	history_button.tooltip_text = Copy.text("vn_history", locale)
	settings_button.tooltip_text = Copy.text("settings", locale)
	next_button.text = Copy.text("vn_next", locale)
	_set_control_caption(skip_button, "skip", Copy.text("vn_skip", locale))
	_set_control_caption(auto_button, "auto", Copy.text("vn_auto", locale))
	_set_control_caption(save_button, "save", Copy.text("vn_save", locale))
	_set_control_caption(load_button, "load", Copy.text("vn_load", locale))
	status_label.text = ""
	var choosing: bool = session.at_choice_gate()
	_boundary = session.at_match3_gate() or session.at_port_boundary()
	if not _boundary:
		_gate_requested = false
	choice_box.visible = choosing
	nameplate.visible = not choosing and not _boundary
	dialogue.visible = not choosing and not _boundary
	next_button.visible = not choosing
	next_button.disabled = _boundary
	page_progress.visible = _dialogue_pages.size() > 1 and not choosing and not _boundary
	skip_button.disabled = _boundary or choosing or not session.state.readLines.has(str(line.id))
	auto_button.disabled = _boundary or choosing
	auto_button.add_theme_stylebox_override("normal", _control_button_style(_auto_mode))
	skip_button.disabled = skip_button.disabled or _boundary
	for control_button in [skip_button, auto_button, save_button, load_button]:
		control_button.visible = not choosing and not _boundary
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
	status.visible = false
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
		if _portrait_should_breathe(str(actor.asset)):
			_animate_portrait(portrait, stage.size.y * height * 0.0035)
	if not _pending_clue_id.is_empty():
		_add_clue_toast(_pending_clue_id, locale)
		_pending_clue_id = ""
	if _boundary and not _gate_requested:
		_gate_requested = true
		match3_requested.emit(str(session.scene_data().get("nextLevelId", "")))
	_schedule_auto()


func _portrait_width(portrait: TextureRect) -> void:
	var width := portrait.size.y * 1024.0 / 1536.0
	portrait.offset_left = -width / 2.0
	portrait.offset_right = width / 2.0


func _portrait_should_breathe(asset_path: String) -> bool:
	return not asset_path.contains("/poses/pose_b_")


func set_pending_clue(clue_id: String) -> void:
	_pending_clue_id = clue_id


func _add_clue_toast(clue_id: String, locale: String) -> void:
	var bundle := Match3CampaignData.load_bundle()
	for level: Dictionary in bundle.get("levels", []):
		var evidence: Dictionary = level.get("evidence", {})
		if str(evidence.get("id", "")) != clue_id: continue
		var localized: Dictionary = evidence.get("localized", {}).get(locale, evidence.get("localized", {}).get("en", {}))
		var toast := PanelContainer.new()
		toast.name = "ClueToast"
		toast.anchor_left = 0
		toast.anchor_right = 1
		toast.anchor_top = 0
		toast.anchor_bottom = 0
		toast.offset_left = 14
		toast.offset_right = -14
		toast.offset_top = -8
		toast.offset_bottom = 54
		toast.modulate.a = 0.0
		toast.z_index = 8
		toast.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var style := StyleBoxFlat.new()
		style.bg_color = Color("#f9fff8ed")
		style.border_color = Color("#f3e8d2")
		style.set_border_width_all(2)
		style.set_corner_radius_all(12)
		style.content_margin_left = 12
		style.content_margin_right = 12
		style.content_margin_top = 8
		style.content_margin_bottom = 8
		style.shadow_color = Color("#17203c3d")
		style.shadow_size = 12
		style.shadow_offset = Vector2(0, 5)
		toast.add_theme_stylebox_override("panel", style)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		row.mouse_filter = Control.MOUSE_FILTER_IGNORE
		toast.add_child(row)
		var image := TextureRect.new()
		image.name = "ClueImage"
		image.custom_minimum_size = Vector2(46, 46)
		image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		image.texture = load("res://" + str(evidence.get("asset", "")).trim_prefix("./"))
		image.mouse_filter = Control.MOUSE_FILTER_IGNORE
		row.add_child(image)
		var copy := VBoxContainer.new()
		copy.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		copy.alignment = BoxContainer.ALIGNMENT_CENTER
		row.add_child(copy)
		var updated := _label(copy, 8)
		updated.text = Copy.text("dossier_updated", locale)
		updated.add_theme_color_override("font_color", Color("#4aa5a3"))
		var clue_title := _label(copy, 13)
		clue_title.text = str(localized.get("title", ""))
		clue_title.add_theme_color_override("font_color", Color("#29243d"))
		clue_title.add_theme_font_size_override("font_size", 13)
		var clue_font := SystemFont.new()
		clue_font.font_names = PackedStringArray(["Inter", "Arial", "sans-serif"])
		clue_font.font_weight = 700
		clue_title.add_theme_font_override("font", clue_font)
		stage.add_child(toast)
		var tween := create_tween()
		tween.set_parallel(true)
		var css_ease_out := Callable(self, "_css_cubic_bezier").bind(0.0, 0.0, 0.58, 1.0)
		tween.tween_property(toast, "modulate:a", 1.0, 0.4).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
		tween.tween_property(toast, "offset_top", 8.0, 0.4).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
		tween.tween_property(toast, "offset_bottom", 70.0, 0.4).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(css_ease_out)
		return


func _set_background(asset_path: String) -> void:
	var texture := load("res://" + asset_path.trim_prefix("./"))
	background_rect.texture = texture
	background_fill.texture = texture


func _background_blur_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
	shader_type canvas_item;
void fragment() {
	vec2 blur = TEXTURE_PIXEL_SIZE * 32.0;
	vec3 color = texture(TEXTURE, UV).rgb * 0.20;
	color += texture(TEXTURE, UV + vec2(blur.x, 0.0)).rgb * 0.10;
	color += texture(TEXTURE, UV - vec2(blur.x, 0.0)).rgb * 0.10;
	color += texture(TEXTURE, UV + vec2(0.0, blur.y)).rgb * 0.10;
	color += texture(TEXTURE, UV - vec2(0.0, blur.y)).rgb * 0.10;
	color += texture(TEXTURE, UV + blur).rgb * 0.10;
	color += texture(TEXTURE, UV - blur).rgb * 0.10;
	color += texture(TEXTURE, UV + vec2(blur.x, -blur.y)).rgb * 0.10;
	color += texture(TEXTURE, UV + vec2(-blur.x, blur.y)).rgb * 0.10;
	float gray = dot(color, vec3(0.299, 0.587, 0.114));
	COLOR = vec4(mix(vec3(gray), color, 0.82) * 0.70, 1.0);
}
	"""
	var shader_material := ShaderMaterial.new()
	shader_material.shader = shader
	return shader_material


func _animate_portrait(portrait: TextureRect, travel: float) -> void:
	if travel <= 0.0:
		return
	var resting_position: Vector2 = portrait.position
	var breathing := portrait.create_tween().set_loops()
	var ease_in_out := Callable(self, "_idle_breathe_curve")
	var rise: PropertyTweener = breathing.tween_property(
		portrait, "position", resting_position + Vector2.UP * travel, 1.4)
	rise.set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(ease_in_out)
	var fall: PropertyTweener = breathing.tween_property(portrait, "position", resting_position, 1.4)
	fall.set_trans(Tween.TRANS_LINEAR).set_ease(Tween.EASE_IN).set_custom_interpolator(ease_in_out)


func _css_cubic_bezier(progress: float, x1: float, y1: float, x2: float, y2: float) -> float:
	return CssMotion.cubic_bezier(progress, x1, y1, x2, y2)


func _idle_breathe_curve(progress: float) -> float:
	return CssMotion.cubic_bezier(progress, 0.42, 0.0, 0.58, 1.0)


func _next() -> void:
	if _boundary or Time.get_ticks_msec() - _last_advance < 120:
		return
	_last_advance = Time.get_ticks_msec()
	audio_runtime.play_effect("vnAdvance")
	if _dialogue_page_index + 1 < _dialogue_pages.size():
		_dialogue_page_index += 1
		_update_dialogue_page()
		_schedule_auto()
		return
	if not session.advance():
		_refresh()
		case_button.grab_focus()


func _build_controls() -> void:
	controls_panel = PanelContainer.new()
	controls_panel.name = "VnControls"
	controls_panel.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	controls_panel.offset_top = -72
	var strip := StyleBoxFlat.new()
	strip.bg_color = Color("#f3e8d2")
	strip.border_color = Color("#d7c29b")
	strip.border_width_top = 1
	strip.content_margin_left = 10
	strip.content_margin_right = 10
	strip.content_margin_top = 6
	strip.content_margin_bottom = 6
	controls_panel.add_theme_stylebox_override("panel", strip)
	controls_panel.mouse_filter = Control.MOUSE_FILTER_PASS
	add_child(controls_panel)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 7)
	controls_panel.add_child(row)
	skip_button = _control_button(row, "skip", Copy.text("vn_skip", preferences.locale))
	skip_button.pressed.connect(_skip_read_lines)
	auto_button = _control_button(row, "auto", Copy.text("vn_auto", preferences.locale))
	auto_button.pressed.connect(_toggle_auto)
	save_button = _control_button(row, "save", Copy.text("vn_save", preferences.locale))
	save_button.pressed.connect(_save_manual)
	load_button = _control_button(row, "load", Copy.text("vn_load", preferences.locale))
	load_button.pressed.connect(_load_manual)
	status = PanelContainer.new()
	status.name = "VnStatus"
	status.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	status.anchor_left = 0.08
	status.anchor_right = 0.92
	status.offset_bottom = -80
	status.custom_minimum_size.y = 38
	status.z_index = 30
	var toast := StyleBoxFlat.new()
	toast.bg_color = Color("#1d3551")
	toast.border_color = Color("#f3e8d2")
	toast.set_border_width_all(1)
	toast.set_corner_radius_all(16)
	toast.content_margin_left = 12
	toast.content_margin_right = 12
	toast.content_margin_top = 7
	toast.content_margin_bottom = 7
	status.add_theme_stylebox_override("panel", toast)
	status.mouse_filter = Control.MOUSE_FILTER_IGNORE
	status_label = _label(status, 12)
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status_label.add_theme_color_override("font_color", Color("#fff9ea"))
	status.hide()


func _control_button(parent: Node, icon_name: String, caption: String) -> Button:
	var button := Button.new()
	button.custom_minimum_size = Vector2(0, 52)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_color_override("font_color", Color("#fff9ea"))
	button.add_theme_stylebox_override("normal", _control_button_style(false))
	button.add_theme_stylebox_override("hover", _control_button_style(true))
	parent.add_child(button)
	_set_control_caption(button, icon_name, caption)
	return button


func _set_control_caption(button: Button, icon_name: String, caption: String) -> void:
	button.text = ""
	button.tooltip_text = caption
	for child in button.get_children():
		child.queue_free()
	var stack := VBoxContainer.new()
	stack.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	stack.alignment = BoxContainer.ALIGNMENT_CENTER
	stack.add_theme_constant_override("separation", 0)
	stack.mouse_filter = Control.MOUSE_FILTER_IGNORE
	button.add_child(stack)
	var icon_texture := _icon_texture(icon_name, 19)
	icon_texture.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	icon_texture.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	stack.add_child(icon_texture)
	var caption_label := _label(stack, 8)
	caption_label.text = caption
	caption_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	caption_label.add_theme_color_override("font_color", Color("#fff9ea"))
	caption_label.mouse_filter = Control.MOUSE_FILTER_IGNORE


func _control_button_style(active: bool) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#2b6f6c") if active else Color("#1d3551")
	style.border_color = Color("#f3e8d2")
	style.set_border_width_all(2)
	style.set_corner_radius_all(10)
	style.shadow_color = Color("#c9a45c")
	style.shadow_size = 2
	return style


func _paginate_dialogue(value: String) -> Array[String]:
	var normalized := " ".join(value.split(" ", false))
	var pages: Array[String] = []
	var page := ""
	var font := dialogue.get_theme_font("normal_font")
	var font_size := dialogue.get_theme_font_size("normal_font_size")
	var text_width := maxf(120.0, size.x - 88.0)
	# The source CSS keeps the reading window to roughly two lines at both text scales.
	var line_limit := font.get_height(font_size) * 2.0
	for word in normalized.split(" ", false):
		var candidate := word if page.is_empty() else page + " " + word
		var measured := font.get_multiline_string_size(candidate, HORIZONTAL_ALIGNMENT_LEFT, text_width, font_size)
		if not page.is_empty() and measured.y > line_limit:
			pages.append(page)
			page = word
		else:
			page = candidate
	if not page.is_empty():
		pages.append(page)
	return pages if not pages.is_empty() else [value]


func _update_dialogue_page() -> void:
	if _dialogue_pages.is_empty():
		return
	var has_more := _dialogue_page_index + 1 < _dialogue_pages.size()
	dialogue.text = _dialogue_pages[_dialogue_page_index] + ("…" if has_more else "")
	dialogue.scroll_to_line(0)
	page_progress.visible = has_more or _dialogue_page_index > 0
	for child in page_progress.get_children():
		child.queue_free()
	for page in range(_dialogue_pages.size()):
		var dot := Panel.new()
		dot.custom_minimum_size = Vector2(7, 7)
		dot.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var dot_style := StyleBoxFlat.new()
		dot_style.bg_color = Color("#d98982") if page <= _dialogue_page_index else Color("#c9bda8")
		dot_style.set_corner_radius_all(4)
		dot.add_theme_stylebox_override("panel", dot_style)
		dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
		page_progress.add_child(dot)
	var prompt := _label(page_progress, 11)
	prompt.text = "▼"
	prompt.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	prompt.add_theme_color_override("font_color", Color("#6d665e"))
	prompt.mouse_filter = Control.MOUSE_FILTER_IGNORE
	prompt.pivot_offset = Vector2.ZERO
	var pulse := prompt.create_tween().set_loops()
	var ease_in_out := Callable(self, "_idle_breathe_curve")
	pulse.tween_property(prompt, "offset_top", 3.0, 0.5).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_in_out)
	pulse.parallel().tween_property(prompt, "modulate:a", 0.45, 0.5).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_in_out)
	pulse.tween_property(prompt, "offset_top", 0.0, 0.5).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_in_out)
	pulse.parallel().tween_property(prompt, "modulate:a", 1.0, 0.5).set_trans(Tween.TRANS_LINEAR).set_custom_interpolator(ease_in_out)


func _toggle_auto() -> void:
	_auto_mode = not _auto_mode
	auto_button.add_theme_stylebox_override("normal", _control_button_style(_auto_mode))
	_schedule_auto()


func _schedule_auto() -> void:
	_auto_generation += 1
	if not _auto_mode or _boundary or session.at_choice_gate() or is_instance_valid(overlay) or not is_visible_in_tree():
		return
	var token := _auto_generation
	var text_length := _dialogue_pages[_dialogue_page_index].length() if not _dialogue_pages.is_empty() else 0
	var delay_seconds := _auto_delay_for_text(text_length) / 1000.0
	get_tree().create_timer(delay_seconds).timeout.connect(func() -> void:
		if token == _auto_generation and _auto_mode and is_visible_in_tree():
			_next()
	)


func _auto_delay_for_text(text_length: int) -> float:
	var base_delay := 3400.0 if _auto_speed == "slow" else 1750.0 if _auto_speed == "fast" else 2500.0
	return base_delay + mini(1800.0, maxi(0, text_length - 28) * 18.0)


func _on_visibility_changed() -> void:
	if is_visible_in_tree():
		_schedule_auto()
	else:
		_auto_generation += 1


func _save_manual() -> void:
	var locale: String = preferences.locale
	var saved: bool = session.store.save_manual(session.state)
	_show_status(Copy.text("vn_saved" if saved else "vn_save_failed", locale))


func _load_manual() -> void:
	var locale: String = preferences.locale
	var manual: Variant = session.store.load_manual()
	if manual == null:
		_show_status(Copy.text("vn_empty_slot", locale))
		return
	session.state = manual
	if not session.resume():
		_show_status(Copy.text("vn_empty_slot", locale))
		return
	_auto_mode = false
	_dialogue_line_id = ""
	_refresh()


func _skip_read_lines() -> void:
	var lines: Array = _current_story_lines()
	var read_lines: Array = session.state.readLines
	var target := int(session.state.line)
	if target >= lines.size() or not read_lines.has(str(lines[target].id)):
		_show_status(Copy.text("vn_skip_read_only", preferences.locale))
		return
	while target < lines.size():
		var current_line: Dictionary = lines[target]
		if _is_choice_checkpoint(str(current_line.id)) or not read_lines.has(str(current_line.id)):
			break
		target += 1
	if target >= lines.size() or target == int(session.state.line):
		_show_status(Copy.text("vn_skip_read_only", preferences.locale))
		return
	session.state.line = target
	session.persist()
	session.changed.emit()


func _current_story_lines() -> Array:
	if session.state.scene == 0:
		return Prologue.data.lines
	if session.state.scene == 1:
		return LockerScene.data.variants[session.state.choice]
	return session.scene_data().get("lines", [])


func _is_choice_checkpoint(line_id: String) -> bool:
	if line_id == "VN0040":
		return true
	var gate: Dictionary = session.scene_data().get("choiceGate", {})
	return not gate.is_empty() and str(gate.get("checkpointLineId", "")) == line_id


func _show_status(message: String) -> void:
	status_label.text = message
	status.show()
	_auto_generation += 1
	var token := _auto_generation
	get_tree().create_timer(1.5).timeout.connect(func() -> void:
		if token == _auto_generation and is_instance_valid(status):
			status.hide()
			_schedule_auto()
	)


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
	_auto_mode = false
	_auto_generation += 1
	var locale: String = preferences.locale
	var data: Dictionary = EndingOutcomes.data
	var copy: Dictionary = data.copy[locale]
	var ending_id: String = outcome.endingId
	var localized_ending: Dictionary = copy.outcomes[ending_id]
	var metrics: Dictionary = outcome.metrics
	var final_strategy: String = str(session.state.storyChoices.get("final-strategy", "A"))
	_set_background(str(data.backgrounds[ending_id]))
	title.hide()
	case_button.hide()
	history_button.hide()
	settings_button.hide()
	controls_panel.hide()
	status.hide()
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
	button.custom_minimum_size = Vector2(44, 44)
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


func _header_icon_button(parent: Node, icon_name: String, label: String) -> Button:
	var button := Button.new()
	button.custom_minimum_size = Vector2(44, 44)
	button.tooltip_text = label
	button.add_theme_color_override("font_color", Color("#fff9ea"))
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("#1d3551")
	normal.border_color = Color("#d3b068")
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(10)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#2a4b76")
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)
	parent.add_child(button)
	var icon_texture := _icon_texture(icon_name, 22)
	icon_texture.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	icon_texture.offset_left = 11
	icon_texture.offset_top = 11
	icon_texture.offset_right = -11
	icon_texture.offset_bottom = -11
	icon_texture.mouse_filter = Control.MOUSE_FILTER_IGNORE
	button.add_child(icon_texture)
	return button


func _icon_texture(icon_name: String, side: float) -> TextureRect:
	var icon_texture := TextureRect.new()
	icon_texture.custom_minimum_size = Vector2(side, side)
	icon_texture.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon_texture.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	icon_texture.texture = load("res://assets/ui/icon_%s.svg" % icon_name)
	icon_texture.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return icon_texture


func _case_button_style(hovered: bool = false) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#1d3551") if hovered else Color("#17304d")
	style.border_color = Color("#d3b068")
	style.set_border_width_all(1)
	style.set_corner_radius_all(10)
	style.content_margin_left = 12
	style.content_margin_right = 10
	style.content_margin_top = 3
	style.content_margin_bottom = 3
	return style


func _create_overlay(heading: String, eyebrow: String = "CASE FILE", height_ratio: float = 0.88) -> void:
	_auto_generation += 1
	overlay_return_focus = get_viewport().gui_get_focus_owner()
	if is_instance_valid(overlay):
		overlay.queue_free()
	overlay = Control.new()
	overlay.name = "VnOverlay"
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 20
	var dim := ColorRect.new()
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dim.color = Color(0.055, 0.063, 0.11, 0.72)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.add_child(dim)
	var card := PanelContainer.new()
	card.name = "OverlayCard"
	card.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	card.anchor_left = 0.055
	var vertical_margin := (1.0 - height_ratio) * 0.5
	card.anchor_top = vertical_margin
	card.anchor_right = 0.945
	card.anchor_bottom = 1.0 - vertical_margin
	var paper := StyleBoxFlat.new()
	paper.bg_color = Color("#fff8e8")
	paper.border_color = Color("#d9bd83")
	paper.set_border_width_all(2)
	paper.set_corner_radius_all(18)
	paper.content_margin_left = 14
	paper.content_margin_right = 14
	paper.content_margin_top = 12
	paper.content_margin_bottom = 12
	card.add_theme_stylebox_override("panel", paper)
	overlay.add_child(card)
	var layout := VBoxContainer.new()
	layout.add_theme_constant_override("separation", 8)
	card.add_child(layout)
	var header_panel := PanelContainer.new()
	header_panel.custom_minimum_size.y = 64
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = Color("#1d3551")
	header_style.set_corner_radius_all(12)
	header_style.content_margin_left = 12
	header_style.content_margin_right = 8
	header_style.content_margin_top = 6
	header_style.content_margin_bottom = 6
	header_panel.add_theme_stylebox_override("panel", header_style)
	layout.add_child(header_panel)
	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 8)
	header_panel.add_child(header)
	var title_stack := VBoxContainer.new()
	title_stack.alignment = BoxContainer.ALIGNMENT_CENTER
	title_stack.add_theme_constant_override("separation", 1)
	title_stack.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(title_stack)
	var eyebrow_label := _label(title_stack, 8)
	eyebrow_label.text = eyebrow
	eyebrow_label.add_theme_color_override("font_color", Color("#e9d5a7"))
	overlay_title = _label(title_stack, 20)
	overlay_title.text = heading
	overlay_title.add_theme_color_override("font_color", Color("#fff9ea"))
	var close := Button.new()
	close.name = "CloseOverlay"
	close.custom_minimum_size = Vector2(44, 44)
	close.add_theme_stylebox_override("normal", _control_button_style(false))
	close.add_theme_stylebox_override("hover", _control_button_style(true))
	var close_icon := _icon_texture("close", 22)
	close_icon.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	close_icon.offset_left = 11
	close_icon.offset_top = 11
	close_icon.offset_right = -11
	close_icon.offset_bottom = -11
	close_icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
	close.add_child(close_icon)
	close.pressed.connect(_close_overlay)
	header.add_child(close)
	var separator := HSeparator.new()
	layout.add_child(separator)
	overlay_scroll = ScrollContainer.new()
	overlay_scroll.name = "OverlayScroll"
	overlay_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	overlay_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	layout.add_child(overlay_scroll)
	overlay_body = VBoxContainer.new()
	overlay_body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	overlay_body.add_theme_constant_override("separation", 9)
	overlay_scroll.add_child(overlay_body)
	add_child(overlay)
	close.grab_focus()


func _show_history() -> void:
	_create_overlay(Copy.text("vn_history", preferences.locale), "CASE LOG")
	var history: Array = session.read_history()
	var current: Dictionary = session.current_line()
	if not current.is_empty() and not current.get("hidden", false):
		var already_listed := history.any(func(line: Dictionary) -> bool: return str(line.id) == str(current.id))
		if not already_listed:
			history.append(current)
	if history.is_empty():
		var empty := _label(overlay_body, 14)
		empty.text = Copy.text("vn_history_empty", preferences.locale)
		return
	for entry in history:
		var localized: Dictionary = entry.localized[preferences.locale]
		var history_card := PanelContainer.new()
		var card_style := StyleBoxFlat.new()
		card_style.bg_color = Color("#fffdf7")
		card_style.border_color = Color("#e2d5bb")
		card_style.set_border_width_all(1)
		card_style.set_corner_radius_all(9)
		card_style.content_margin_left = 10
		card_style.content_margin_right = 10
		card_style.content_margin_top = 8
		card_style.content_margin_bottom = 8
		history_card.add_theme_stylebox_override("panel", card_style)
		overlay_body.add_child(history_card)
		var entry_body := VBoxContainer.new()
		entry_body.add_theme_constant_override("separation", 4)
		history_card.add_child(entry_body)
		var speaker_label := _label(entry_body, 10)
		speaker_label.text = localized.speaker
		speaker_label.add_theme_color_override("font_color", Color("#2a4b76"))
		var text_label := _label(entry_body, 14)
		text_label.text = localized.text
		text_label.add_theme_font_override("font", _serif_font())


func _show_dossier() -> void:
	_create_overlay(Copy.text("dossier_title", preferences.locale), "CASE FILE")
	_dossier_tab = "clues"
	var heading := _label(overlay_body, 19)
	heading.text = Copy.text("dossier_heading", preferences.locale)
	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 8)
	overlay_body.add_child(tabs)
	dossier_clues_tab = _button(tabs)
	dossier_clues_tab.text = Copy.text("dossier_clues", preferences.locale)
	dossier_clues_tab.pressed.connect(_select_dossier_tab.bind("clues"))
	dossier_theories_tab = _button(tabs)
	dossier_theories_tab.text = Copy.text("dossier_theories", preferences.locale)
	dossier_theories_tab.pressed.connect(_select_dossier_tab.bind("theories"))
	dossier_clues = GridContainer.new()
	dossier_clues.name = "ClueGrid"
	dossier_clues.columns = 2
	dossier_clues.add_theme_constant_override("h_separation", 8)
	dossier_clues.add_theme_constant_override("v_separation", 8)
	overlay_body.add_child(dossier_clues)
	dossier_theories = VBoxContainer.new()
	dossier_theories.name = "Theories"
	dossier_theories.add_theme_constant_override("separation", 8)
	overlay_body.add_child(dossier_theories)
	var theories_heading := _label(dossier_theories, 17)
	theories_heading.text = Copy.text("dossier_theories_heading", preferences.locale)
	_add_suspect_theory("K", Copy.text("character_kentaro", preferences.locale),
		Copy.text("dossier_kentaro_cleared" if session.state.completed.has(1) else "dossier_kentaro_active", preferences.locale),
		session.state.completed.has(1))
	if session.state.readLines.has("VN0150"):
		_add_suspect_theory("N", Copy.text("character_norihiro", preferences.locale),
			Copy.text("dossier_norihiro_cleared" if session.state.completed.has(3) else "dossier_norihiro_pending", preferences.locale),
			session.state.completed.has(3))
	var bundle: Dictionary = Match3CampaignData.load_bundle()
	var levels: Array = bundle.get("levels", [])
	for index in range(levels.size()):
		_add_clue_card(levels[index], index + 1)
	var reset_progress := Button.new()
	reset_progress.name = "ResetDossierProgress"
	reset_progress.custom_minimum_size.y = 42
	reset_progress.text = Copy.text("dossier_reset", preferences.locale)
	reset_progress.add_theme_color_override("font_color", Color("#a34c5e"))
	reset_progress.add_theme_stylebox_override("normal", _case_button_style())
	reset_progress.pressed.connect(_reset_dossier_progress)
	overlay_body.add_child(reset_progress)
	_select_dossier_tab(_dossier_tab)


func _add_clue_card(level: Dictionary, number: int) -> void:
	var evidence: Dictionary = level.get("evidence", {})
	var clue_id := str(evidence.get("id", ""))
	var unlocked: bool = session.state.clues.has(clue_id)
	var localized: Dictionary = evidence.get("localized", {}).get(preferences.locale, {})
	var card := PanelContainer.new()
	card.custom_minimum_size.x = 150
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#fffdf9")
	style.border_color = Color("#ded3db")
	style.set_border_width_all(1)
	style.set_corner_radius_all(9)
	style.content_margin_left = 8
	style.content_margin_right = 8
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	if not unlocked:
		style.bg_color = Color("#f1ece5")
	card.add_theme_stylebox_override("panel", style)
	dossier_clues.add_child(card)
	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation", 4)
	card.add_child(body)
	var art := PanelContainer.new()
	art.custom_minimum_size = Vector2(0, 82)
	var art_style := StyleBoxFlat.new()
	art_style.bg_color = Color("#33223a")
	art_style.set_corner_radius_all(7)
	art.add_theme_stylebox_override("panel", art_style)
	body.add_child(art)
	if unlocked and not str(evidence.get("asset", "")).is_empty():
		var image := TextureRect.new()
		image.custom_minimum_size = Vector2(82, 78)
		image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		image.texture = load("res://" + str(evidence.asset).trim_prefix("./"))
		art.add_child(image)
	else:
		var locked_mark := _label(art, 38)
		locked_mark.text = "?"
		locked_mark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		locked_mark.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		locked_mark.add_theme_color_override("font_color", Color("#ffffff55"))
	var number_label := _label(body, 8)
	number_label.text = "%s %02d" % [Copy.text("dossier_clue_number", preferences.locale), number]
	number_label.add_theme_color_override("font_color", Color("#d95f70"))
	var title_label := _label(body, 11)
	title_label.text = str(localized.get("title", Copy.text("dossier_locked", preferences.locale))) if unlocked else Copy.text("dossier_locked", preferences.locale)
	var summary := _label(body, 9)
	summary.text = str(localized.get("summary", "")) if unlocked else Copy.text("dossier_unlock_hint", preferences.locale)


func _add_suspect_theory(initial: String, suspect: String, description: String, cleared: bool) -> void:
	var row := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color("#eefaf7") if cleared else Color("#fff3f2")
	style.border_color = Color("#bfe0da") if cleared else Color("#e3ced3")
	style.set_border_width_all(1)
	style.set_corner_radius_all(8)
	style.content_margin_left = 9
	style.content_margin_right = 9
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	row.add_theme_stylebox_override("panel", style)
	dossier_theories.add_child(row)
	var content := HBoxContainer.new()
	content.add_theme_constant_override("separation", 9)
	row.add_child(content)
	var initial_label := _label(content, 20)
	initial_label.text = initial
	initial_label.add_theme_color_override("font_color", Color("#2b6f6c") if cleared else Color("#d95f70"))
	var details := VBoxContainer.new()
	details.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.add_child(details)
	var name_label := _label(details, 13)
	name_label.text = suspect
	var theory_status_label := _label(details, 8)
	theory_status_label.text = description
	theory_status_label.add_theme_color_override("font_color", Color("#2b6f6c") if cleared else Color("#d95f70"))


func _select_dossier_tab(tab: String) -> void:
	_dossier_tab = tab
	if is_instance_valid(dossier_clues):
		dossier_clues.visible = tab == "clues"
		dossier_theories.visible = tab == "theories"
		dossier_clues_tab.disabled = tab == "clues"
		dossier_theories_tab.disabled = tab == "theories"


func _close_overlay() -> void:
	if is_instance_valid(overlay):
		overlay.queue_free()
	overlay = null
	overlay_closed.emit()
	if is_instance_valid(overlay_return_focus):
		overlay_return_focus.grab_focus()
	else:
		case_button.grab_focus()
	_schedule_auto()


func _reset_dossier_progress() -> void:
	progress_reset_requested.emit()
	menu_requested.emit()


func _show_config() -> void:
	_create_overlay(Copy.text("vn_config_title", preferences.locale), "CONFIG", 0.72)
	var auto_section := _config_section("vn_config_speed")
	var auto_row := HBoxContainer.new()
	auto_row.add_theme_constant_override("separation", 6)
	auto_section.add_child(auto_row)
	config_speed_buttons.clear()
	for speed in ["slow", "normal", "fast"]:
		var button := _config_option(auto_row, "vn_speed_" + speed)
		button.name = "AutoSpeed" + speed.capitalize()
		config_speed_buttons[speed] = button
		button.pressed.connect(_select_auto_speed.bind(speed))
	_select_auto_speed(_auto_speed, false)

	var text_section := _config_section("vn_config_text_size")
	var text_row := HBoxContainer.new()
	text_row.add_theme_constant_override("separation", 6)
	text_section.add_child(text_row)
	config_text_buttons.clear()
	for scale in ["normal", "large"]:
		var label_key := "vn_speed_normal" if scale == "normal" else "vn_text_large"
		var button := _config_option(text_row, label_key)
		button.name = "TextSize" + scale.capitalize()
		config_text_buttons[scale] = button
		button.pressed.connect(_select_text_scale.bind(scale))
	_select_text_scale(_text_scale, false)

	var audio_section := _config_section("vn_config_audio")
	_audio_slider(audio_section, "musicVolume", Copy.text("music", preferences.locale))
	_audio_slider(audio_section, "effectsVolume", Copy.text("effects", preferences.locale))
	var audio_row := HBoxContainer.new()
	audio_row.add_theme_constant_override("separation", 6)
	audio_section.add_child(audio_row)
	var audio_settings: Dictionary = preferences.audio
	var mute_button := _audio_toggle_button(audio_row, "muted", Copy.text("mute", preferences.locale), bool(audio_settings.muted))
	mute_button.name = "MuteAudio"
	var haptics_button := _audio_toggle_button(audio_row, "hapticsEnabled", Copy.text("haptics", preferences.locale), bool(audio_settings.hapticsEnabled))
	haptics_button.name = "HapticsAudio"
	haptics_button.tooltip_text = Copy.text("haptics_available" if audio_runtime.haptics_supported else "haptics_unavailable", preferences.locale)
	var preview_row := HBoxContainer.new()
	preview_row.add_theme_constant_override("separation", 6)
	audio_section.add_child(preview_row)
	var preview_music := _button(preview_row)
	preview_music.text = Copy.text("preview_music", preferences.locale)
	preview_music.pressed.connect(audio_runtime.preview_music)
	var preview_effects := _button(preview_row)
	preview_effects.text = Copy.text("preview_effects", preferences.locale)
	preview_effects.pressed.connect(audio_runtime.preview_effects)
	var capability := _label(audio_section, 9)
	capability.text = Copy.text("vn_config_audio_capability", preferences.locale) + ": " + Copy.text("vn_config_available" if audio_runtime.haptics_supported else "vn_config_unavailable", preferences.locale)
	capability.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	capability.add_theme_color_override("font_color", Color("#756c61"))

	var navigation_section := _config_section("vn_config_navigation")
	var main_menu := _button(navigation_section)
	main_menu.name = "VnMainMenu"
	main_menu.text = Copy.text("vn_config_main_menu", preferences.locale) + "\n" + Copy.text("vn_config_saved", preferences.locale)
	main_menu.pressed.connect(func() -> void:
		menu_requested.emit()
	)
	var note := _label(overlay_body, 10)
	note.text = Copy.text("vn_config_note", preferences.locale)
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	note.add_theme_color_override("font_color", Color("#756c61"))


func _config_section(label_key: String) -> VBoxContainer:
	var section := VBoxContainer.new()
	section.name = "Config" + label_key.trim_prefix("vn_config_").capitalize()
	section.add_theme_constant_override("separation", 5)
	overlay_body.add_child(section)
	var heading := _label(section, 10)
	heading.text = Copy.text(label_key, preferences.locale)
	heading.add_theme_color_override("font_color", Color("#2a4b76"))
	return section


func _config_option(parent: Node, copy_key: String) -> Button:
	var button := Button.new()
	button.custom_minimum_size.y = 40
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.text = Copy.text(copy_key, preferences.locale)
	button.add_theme_color_override("font_color", Color("#fff9ea"))
	button.add_theme_stylebox_override("normal", _control_button_style(false))
	button.add_theme_stylebox_override("hover", _control_button_style(true))
	parent.add_child(button)
	return button


func _select_auto_speed(speed: String, reschedule: bool = true) -> void:
	_auto_speed = speed
	for key in config_speed_buttons:
		config_speed_buttons[key].add_theme_stylebox_override("normal", _control_button_style(key == speed))
	if reschedule:
		_schedule_auto()


func _select_text_scale(scale: String, relayout: bool = true) -> void:
	_text_scale = scale
	for key in config_text_buttons:
		config_text_buttons[key].add_theme_stylebox_override("normal", _control_button_style(key == scale))
	dialogue.add_theme_font_size_override("normal_font_size", 19 if scale == "large" else 17)
	if relayout and is_instance_valid(overlay):
		_dialogue_pages.clear()
		_dialogue_page_index = 0
		_refresh()
		_show_config()


func _audio_slider(parent: Node, key: String, label: String) -> void:
	var settings: Dictionary = preferences.audio
	var row := VBoxContainer.new()
	row.name = "Audio_" + key
	row.add_theme_constant_override("separation", 2)
	parent.add_child(row)
	var value_label := _label(row, 9)
	value_label.name = "Value"
	value_label.text = "%s · %d%%" % [label, roundi(float(settings[key]) * 100.0)]
	var slider := HSlider.new()
	slider.name = "Slider"
	slider.min_value = 0
	slider.max_value = 100
	slider.step = 1
	slider.custom_minimum_size.y = 32
	slider.value = roundi(float(settings[key]) * 100.0)
	slider.value_changed.connect(func(value: float) -> void:
		value_label.text = "%s · %d%%" % [label, roundi(value)]
		_update_audio_setting(key, value / 100.0)
	)
	row.add_child(slider)


func _audio_toggle_button(parent: Node, key: String, label: String, enabled: bool) -> Button:
	var button := Button.new()
	button.toggle_mode = true
	button.button_pressed = enabled
	button.custom_minimum_size.y = 48
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_color_override("font_color", Color("#fff9ea"))
	button.add_theme_stylebox_override("normal", _control_button_style(enabled))
	button.add_theme_stylebox_override("pressed", _control_button_style(true))
	button.add_theme_stylebox_override("hover", _control_button_style(not enabled))
	button.toggled.connect(func(value: bool) -> void:
		button.text = "%s · %s" % [label, Copy.text("vn_on" if value else "vn_off", preferences.locale)]
		button.add_theme_stylebox_override("normal", _control_button_style(value))
		button.add_theme_stylebox_override("pressed", _control_button_style(true))
		button.add_theme_color_override("font_color", Color("#fff9ea"))
		_update_audio_setting(key, value)
	)
	button.text = "%s · %s" % [label, Copy.text("vn_on" if enabled else "vn_off", preferences.locale)]
	parent.add_child(button)
	return button


func _update_audio_setting(key: String, value: Variant) -> void:
	var error: Error = preferences.update_audio({key: value})
	if error != OK:
		_show_status(Copy.text("settings_save_error", preferences.locale))


func _serif_font() -> SystemFont:
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Georgia", "Noto Serif", "Liberation Serif", "serif"])
	return font


func _unhandled_key_input(event: InputEvent) -> void:
	if not is_visible_in_tree() or event.is_echo():
		return
	if event.is_action_pressed("ui_cancel"):
		get_viewport().set_input_as_handled()
		if is_instance_valid(overlay):
			_close_overlay()
		else:
			menu_requested.emit()
	elif event.is_action_pressed("ui_accept") and session.ending_result().is_empty():
		get_viewport().set_input_as_handled()
		_next()
