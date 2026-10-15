extends Control

signal new_game_requested
signal continue_requested
signal campaign_requested
signal settings_requested
signal match3_requested(level_id: String)

const MenuCopy = preload("res://scripts/menu_copy.gd")
const CONTRACT = preload("res://data/save_contract.json")
const PlayerPreferences = preload("res://scripts/player_preferences.gd")
const SettingsScreen = preload("res://scripts/settings_screen.gd")
const StorySession = preload("res://scripts/story_session.gd")
const VnScreen = preload("res://scripts/vn_screen.gd")
const Match3CampaignSession = preload("res://scripts/match3_campaign_session.gd")
const Match3CampaignScreen = preload("res://scripts/match3_campaign_screen.gd")
const Match3CampaignData = preload("res://scripts/match3_campaign_data.gd")
const Match3Screen = preload("res://scripts/match3_screen.gd")
const PhoneFrame = preload("res://scripts/phone_frame.gd")
const UiFonts = preload("res://scripts/ui_fonts.gd")

var preferences: RefCounted = PlayerPreferences.new()
var settings_screen: PanelContainer
var audio_runtime := preload("res://scripts/menu_audio.gd").new()
var session: RefCounted
var story_screen: Control
var match3_screen: Control
var match3_campaign_screen: Control
var match3_session: RefCounted
var confirmation := ConfirmationDialog.new()
var status: Label
var _settings_from_story := false
var _settings_from_match3 := false
var _settings_from_campaign := false


func _ready() -> void:
	PhoneFrame.fit(self)
	var runtime_theme := theme.duplicate() as Theme
	runtime_theme.default_font = UiFonts.sans()
	runtime_theme.default_font_size = 16
	theme = runtime_theme
	resized.connect(_layout_menu)
	audio_runtime.name = "MenuAudio"
	audio_runtime.preferences = preferences
	add_child(audio_runtime)
	if session == null:
		session = StorySession.new()
	if match3_session == null:
		match3_session = Match3CampaignSession.new()
	session.reload()
	session.changed.connect(_update_continue)
	confirmation.confirmed.connect(_begin_new_game)
	add_child(confirmation)
	status = Label.new()
	status.name = "SaveStatus"
	status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status.add_theme_color_override("font_color", Color.WHITE)
	status.add_theme_font_size_override("font_size", 13)
	$Content.add_child(status)
	preferences.locale_changed.connect(_refresh_copy)
	_refresh_copy(preferences.locale)
	_update_continue()

	_style_button($Content/Actions/NewGame, true)
	_style_button($Content/Actions/Continue)
	_style_button($Content/Actions/Campaign)
	_style_button($Content/Actions/Settings)
	$Content/Title.add_theme_font_override("normal_font", UiFonts.serif(800))
	$Content/Title.add_theme_constant_override("line_separation", -12)
	$Content/Eyebrow.add_theme_font_override("font", UiFonts.sans(900))
	$Content/Tagline.add_theme_font_override("font", UiFonts.sans(400))
	$Content/Footer.add_theme_font_override("font", UiFonts.sans(400))
	_layout_menu()
	for button in [$Content/Actions/NewGame, $Content/Actions/Continue, $Content/Actions/Campaign, $Content/Actions/Settings]:
		button.pressed.connect(audio_runtime.play_effect)

	$Content/Actions/NewGame.pressed.connect(_request_new_game)
	$Content/Actions/Continue.pressed.connect(_continue_game)
	$Content/Actions/Campaign.pressed.connect(func() -> void:
		campaign_requested.emit()
		_open_campaign()
	)
	$Content/Actions/Settings.pressed.connect(_open_settings)


func _layout_menu() -> void:
	var narrow := size.x <= 340.0
	var compact := size.y <= 760.0
	var phone_width: float = size.x
	$Background.offset_left = -phone_width * 0.5
	$Background.offset_right = phone_width * 0.5
	$Wash.offset_left = -phone_width * 0.5
	$Wash.offset_right = phone_width * 0.5
	var content_inset := 36.0 if narrow else 56.0
	var content_width: float = maxf(0.0, phone_width - content_inset)
	$Content.offset_left = -content_width * 0.5
	$Content.offset_right = content_width * 0.5
	$Content.offset_top = 18.0 if narrow else 26.0 if compact else 42.0
	var bottom_inset := 12.0 if narrow else 24.0
	$Content.anchor_bottom = 1.0 - bottom_inset / size.y
	$Content.add_theme_constant_override("separation", 4 if narrow else 8 if compact else 6)
	var title_size := 34 if narrow else 38 if compact else 44
	$Content/Title.add_theme_font_size_override("normal_font_size", title_size)
	$Content/Title.add_theme_constant_override("line_separation", -12 if narrow or compact else -20)
	$Content/Title.fit_content = not narrow
	$Content/Title.custom_minimum_size.y = 74.0 if narrow else 0.0
	$Content/TitleSpacer.custom_minimum_size.y = 4.0 if narrow else 0.0
	$Content/Tagline.add_theme_font_size_override("font_size", 12 if narrow else 16)
	$Content/Tagline.autowrap_mode = TextServer.AUTOWRAP_OFF if narrow else TextServer.AUTOWRAP_WORD_SMART
	var hero_size := 56.0 if narrow else 66.0 if compact else 78.0
	$Content/Hero.custom_minimum_size.y = hero_size
	$Content/HeroSpacer.custom_minimum_size.y = 2.0
	for portrait in $Content/Hero.get_children():
		portrait.custom_minimum_size = Vector2(hero_size, hero_size)
	$Content/FooterSpacer.custom_minimum_size.y = 17.0 if narrow else 21.0
	$Content/Footer.add_theme_font_size_override("font_size", 8 if narrow else 10)
	for button in $Content/Actions.get_children():
		if button is Button:
			button.custom_minimum_size.y = 44.0 if narrow else 49.0
	$Content/Actions.add_theme_constant_override("separation", 6 if narrow else 9)


func _refresh_copy(locale: String) -> void:
	$Content/Eyebrow.text = MenuCopy.text("eyebrow", locale)
	$Content/Title.text = "[center][color=#1f2340]%s[/color]\n[color=#d96279]%s[/color][/center]" % [
		MenuCopy.text("title", locale), MenuCopy.text("accent", locale),
	]
	$Content/Tagline.text = MenuCopy.text("tagline", locale)
	$Content/Actions/NewGame.text = MenuCopy.text("new_game", locale)
	$Content/Actions/Continue.text = MenuCopy.text("continue", locale)
	$Content/Actions/Campaign.text = MenuCopy.text("campaign", locale)
	$Content/Actions/Settings.text = MenuCopy.text("settings", locale)
	$Content/Footer.text = "v" + str(CONTRACT.data.appVersion)
	_update_continue()


func _update_continue() -> void:
	var continue_button: Button = $Content/Actions/Continue
	continue_button.disabled = not session.has_progress() or not session.supports_position()
	continue_button.modulate = Color(1, 1, 1, 0.38) if continue_button.disabled else Color.WHITE
	if status == null:
		return
	status.text = ""
	if session.has_progress() and not session.supports_position():
		status.text = MenuCopy.text("story_position_unavailable", preferences.locale)
	elif not session.last_write_ok:
		status.text = MenuCopy.text("story_save_error", preferences.locale)
	elif session.load_report.detail == "storage-read-failed":
		status.text = MenuCopy.text("story_load_error", preferences.locale)
	elif session.load_report.status == "recovered-corrupt":
		status.text = MenuCopy.text("story_recovered", preferences.locale)
	status.visible = not status.text.is_empty()


func _request_new_game() -> void:
	if session.has_progress() or session.load_report.status == "recovered-corrupt" or session.load_report.detail == "storage-read-failed":
		confirmation.dialog_text = MenuCopy.text("new_game_confirm", preferences.locale)
		confirmation.ok_button_text = MenuCopy.text("new_game", preferences.locale)
		confirmation.cancel_button_text = MenuCopy.text("cancel", preferences.locale)
		confirmation.popup_centered(Vector2i(400, 160))
		return
	_begin_new_game()


func _begin_new_game() -> void:
	session.new_game()
	new_game_requested.emit()
	_open_story()


func _continue_game() -> void:
	if not session.has_progress() or not session.resume():
		return
	continue_requested.emit()
	_open_story()


func _open_story() -> void:
	if is_instance_valid(story_screen):
		return
	story_screen = VnScreen.new()
	story_screen.name = "StoryScreen"
	story_screen.session = session
	story_screen.preferences = preferences
	story_screen.audio_runtime = audio_runtime
	story_screen.menu_requested.connect(_close_story)
	story_screen.progress_reset_requested.connect(_reset_progress_from_story)
	story_screen.match3_requested.connect(_handle_match3_request)
	$Content.hide()
	add_child(story_screen)
	audio_runtime.set_scene("vn")


func _reset_progress_from_story() -> void:
	session.new_game()
	match3_session.reset()


func _handle_match3_request(level_id: String) -> void:
	match3_requested.emit(level_id)
	call_deferred("_open_match3", level_id)


func _open_match3(level_id: String) -> void:
	_open_match3_level(level_id, false)


func _open_match3_level(level_id: String, standalone_campaign: bool) -> void:
	if is_instance_valid(match3_screen):
		return
	var bundle := Match3CampaignData.load_bundle()
	if Match3CampaignData.get_level(bundle, level_id).is_empty(): return
	if not standalone_campaign and (not session.at_match3_gate() or str(session.scene_data().get("nextLevelId", "")) != level_id): return
	if standalone_campaign and not _campaign_level_unlocked(bundle, level_id): return
	match3_screen = Match3Screen.new()
	match3_screen.name = "Match3Screen"
	match3_screen.preferences = preferences
	match3_screen.session = match3_session
	match3_screen.story_session = null if standalone_campaign else session
	match3_screen.level_id = level_id
	match3_screen.campaign_mode = standalone_campaign
	match3_screen.story_requested.connect(_close_match3)
	match3_screen.clue_awarded.connect(_set_pending_story_clue)
	match3_screen.campaign_next_requested.connect(_start_next_campaign_level)
	match3_screen.settings_requested.connect(_open_settings_from_match3)
	match3_screen.dossier_requested.connect(_open_dossier_from_match3)
	if is_instance_valid(story_screen):
		story_screen.hide()
	if is_instance_valid(match3_campaign_screen): match3_campaign_screen.hide()
	add_child(match3_screen)
	audio_runtime.set_scene("vn")


func _campaign_level_unlocked(bundle: Dictionary, level_id: String) -> bool:
	var levels: Array = bundle.get("levels", [])
	for index in levels.size():
		if str(levels[index].id) != level_id: continue
		return index == 0 or match3_session.save.completed.has(str(levels[index - 1].id))
	return false


func _close_match3() -> void:
	if not is_instance_valid(match3_screen):
		return
	remove_child(match3_screen)
	match3_screen.queue_free()
	match3_screen = null
	if is_instance_valid(match3_campaign_screen):
		match3_campaign_screen.show()
		match3_campaign_screen.refresh_screen()
		audio_runtime.set_scene("menu")
	elif is_instance_valid(story_screen):
		story_screen.show()
		story_screen.call("_refresh")
		audio_runtime.set_scene("vn")


func _set_pending_story_clue(clue_id: String) -> void:
	if is_instance_valid(story_screen): story_screen.call("set_pending_clue", clue_id)


func _open_campaign() -> void:
	if is_instance_valid(match3_campaign_screen): return
	match3_campaign_screen = Match3CampaignScreen.new()
	match3_campaign_screen.name = "Match3CampaignScreen"
	match3_campaign_screen.preferences = preferences
	match3_campaign_screen.session = match3_session
	match3_campaign_screen.back_requested.connect(_close_campaign)
	match3_campaign_screen.settings_requested.connect(_open_settings_from_campaign)
	match3_campaign_screen.level_requested.connect(_start_campaign_level)
	$Content.hide()
	add_child(match3_campaign_screen)
	audio_runtime.set_scene("menu")


func _start_campaign_level(level_id: String) -> void:
	if not is_instance_valid(match3_campaign_screen): return
	match3_campaign_screen.hide()
	_open_match3_level(level_id, true)


func _start_next_campaign_level(level_id: String) -> void:
	if level_id.is_empty(): return
	_close_match3()
	_start_campaign_level(level_id)


func _close_campaign() -> void:
	if not is_instance_valid(match3_campaign_screen): return
	remove_child(match3_campaign_screen)
	match3_campaign_screen.queue_free()
	match3_campaign_screen = null
	$Content.show()
	audio_runtime.set_scene("menu")
	$Content/Actions/Campaign.grab_focus()


func _close_story() -> void:
	remove_child(story_screen)
	story_screen.queue_free()
	story_screen = null
	audio_runtime.set_scene("menu")
	$Content.show()
	_update_continue()
	if not $Content/Actions/Continue.disabled:
		$Content/Actions/Continue.grab_focus()
	else:
		$Content/Actions/NewGame.grab_focus()


func _open_settings_from_match3() -> void:
	_open_settings(true)


func _open_settings_from_campaign() -> void:
	_open_settings(false, true)


func _open_dossier_from_match3() -> void:
	if not is_instance_valid(story_screen) or not is_instance_valid(match3_screen): return
	match3_screen.hide()
	story_screen.show()
	story_screen.overlay_closed.connect(_resume_match3_after_dossier, CONNECT_ONE_SHOT)
	story_screen.call("_show_dossier")


func _resume_match3_after_dossier() -> void:
	if is_instance_valid(story_screen): story_screen.hide()
	if is_instance_valid(match3_screen): match3_screen.show()


func _open_settings(from_match3: bool = false, from_campaign: bool = false) -> void:
	if is_instance_valid(settings_screen):
		return
	settings_requested.emit()
	_settings_from_story = is_instance_valid(story_screen) and story_screen.visible
	_settings_from_match3 = from_match3 and is_instance_valid(match3_screen) and match3_screen.visible
	_settings_from_campaign = from_campaign and is_instance_valid(match3_campaign_screen) and match3_campaign_screen.visible
	if _settings_from_story:
		story_screen.hide()
	elif not _settings_from_match3 and not _settings_from_campaign:
		$Content.hide()
	settings_screen = SettingsScreen.new()
	settings_screen.name = "SettingsScreen"
	settings_screen.preferences = preferences
	settings_screen.audio_runtime = audio_runtime
	settings_screen.back_requested.connect(_close_settings)
	add_child(settings_screen)


func _close_settings() -> void:
	remove_child(settings_screen)
	settings_screen.queue_free()
	settings_screen = null
	if _settings_from_story and is_instance_valid(story_screen):
		story_screen.show()
		story_screen.settings_button.grab_focus()
	elif _settings_from_match3 and is_instance_valid(match3_screen):
		match3_screen.show()
		match3_screen.settings_button.grab_focus()
	elif _settings_from_campaign and is_instance_valid(match3_campaign_screen):
		match3_campaign_screen.show()
		match3_campaign_screen.refresh_screen()
		match3_campaign_screen.grab_focus()
	else:
		$Content.show()
		$Content/Actions/Settings.grab_focus()
	_settings_from_match3 = false
	_settings_from_campaign = false


func _style_button(button: Button, primary: bool = false) -> void:
	preload("res://scripts/menu_theme.gd").style_button(button, primary)
	var font_color := Color.WHITE if primary else Color("#29243d")
	button.add_theme_color_override("font_disabled_color", font_color)
	button.add_theme_stylebox_override("disabled", button.get_theme_stylebox("normal"))
	var font := UiFonts.sans(900 if primary else 700)
	button.add_theme_font_override("font", font)
