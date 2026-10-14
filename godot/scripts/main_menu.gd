extends Control

signal new_game_requested
signal continue_requested
signal campaign_requested
signal settings_requested
signal match3_requested(level_id: String)

const MenuCopy = preload("res://scripts/menu_copy.gd")
const PlayerPreferences = preload("res://scripts/player_preferences.gd")
const SettingsScreen = preload("res://scripts/settings_screen.gd")
const StorySession = preload("res://scripts/story_session.gd")
const VnScreen = preload("res://scripts/vn_screen.gd")

var preferences: RefCounted = PlayerPreferences.new()
var settings_screen: PanelContainer
var audio_runtime := preload("res://scripts/menu_audio.gd").new()
var session: RefCounted
var story_screen: Control
var confirmation := ConfirmationDialog.new()
var status: Label
var _settings_from_story := false


func _ready() -> void:
	audio_runtime.name = "MenuAudio"
	audio_runtime.preferences = preferences
	add_child(audio_runtime)
	if session == null:
		session = StorySession.new()
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
	for button in [$Content/Actions/NewGame, $Content/Actions/Continue, $Content/Actions/Campaign, $Content/Actions/Settings]:
		button.pressed.connect(audio_runtime.play_effect)

	$Content/Actions/NewGame.pressed.connect(_request_new_game)
	$Content/Actions/Continue.pressed.connect(_continue_game)
	$Content/Actions/Campaign.pressed.connect(func() -> void: campaign_requested.emit())
	$Content/Actions/Settings.pressed.connect(_open_settings)


func _refresh_copy(locale: String) -> void:
	$Content/Eyebrow.text = MenuCopy.text("eyebrow", locale)
	$Content/Title.text = MenuCopy.text("title", locale)
	$Content/Accent.text = MenuCopy.text("accent", locale)
	$Content/Tagline.text = MenuCopy.text("tagline", locale)
	$Content/Actions/NewGame.text = MenuCopy.text("new_game", locale)
	$Content/Actions/Continue.text = MenuCopy.text("continue", locale)
	$Content/Actions/Campaign.text = MenuCopy.text("campaign", locale)
	$Content/Actions/Settings.text = MenuCopy.text("settings", locale)
	$Content/Footer.text = MenuCopy.text("version", locale)
	_update_continue()


func _update_continue() -> void:
	$Content/Actions/Continue.disabled = not session.has_progress() or not session.supports_position()
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
	story_screen.settings_requested.connect(_open_settings)
	story_screen.match3_requested.connect(func(level_id: String) -> void: match3_requested.emit(level_id))
	$Content.hide()
	add_child(story_screen)
	audio_runtime.set_scene("vn")


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


func _open_settings() -> void:
	if is_instance_valid(settings_screen):
		return
	settings_requested.emit()
	_settings_from_story = is_instance_valid(story_screen) and story_screen.visible
	if _settings_from_story:
		story_screen.hide()
	settings_screen = SettingsScreen.new()
	settings_screen.name = "SettingsScreen"
	settings_screen.preferences = preferences
	settings_screen.audio_runtime = audio_runtime
	settings_screen.back_requested.connect(_close_settings)
	$Content.hide()
	add_child(settings_screen)


func _close_settings() -> void:
	remove_child(settings_screen)
	settings_screen.queue_free()
	settings_screen = null
	if _settings_from_story and is_instance_valid(story_screen):
		story_screen.show()
		story_screen.settings_button.grab_focus()
	else:
		$Content.show()
		$Content/Actions/Settings.grab_focus()


func _style_button(button: Button, primary: bool = false) -> void:
	preload("res://scripts/menu_theme.gd").style_button(button, primary)
