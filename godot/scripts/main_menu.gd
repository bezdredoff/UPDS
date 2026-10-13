extends Control

signal new_game_requested
signal continue_requested
signal campaign_requested
signal settings_requested

const MenuCopy = preload("res://scripts/menu_copy.gd")
const PlayerPreferences = preload("res://scripts/player_preferences.gd")
const SettingsScreen = preload("res://scripts/settings_screen.gd")

var preferences: RefCounted = PlayerPreferences.new()
var settings_screen: PanelContainer


func _ready() -> void:
	preferences.locale_changed.connect(_refresh_copy)
	_refresh_copy(preferences.locale)
	$Content/Actions/Continue.disabled = true

	_style_button($Content/Actions/NewGame, true)
	_style_button($Content/Actions/Continue)
	_style_button($Content/Actions/Campaign)
	_style_button($Content/Actions/Settings)

	$Content/Actions/NewGame.pressed.connect(func() -> void: new_game_requested.emit())
	$Content/Actions/Continue.pressed.connect(func() -> void: continue_requested.emit())
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


func _open_settings() -> void:
	if is_instance_valid(settings_screen):
		return
	settings_requested.emit()
	settings_screen = SettingsScreen.new()
	settings_screen.name = "SettingsScreen"
	settings_screen.preferences = preferences
	settings_screen.back_requested.connect(_close_settings)
	$Content.hide()
	add_child(settings_screen)


func _close_settings() -> void:
	remove_child(settings_screen)
	settings_screen.queue_free()
	settings_screen = null
	$Content.show()
	$Content/Actions/Settings.grab_focus()


func _style_button(button: Button, primary: bool = false) -> void:
	preload("res://scripts/menu_theme.gd").style_button(button, primary)
