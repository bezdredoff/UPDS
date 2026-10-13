extends Control

signal new_game_requested
signal continue_requested
signal campaign_requested
signal settings_requested

const MenuCopy = preload("res://scripts/menu_copy.gd")


func _ready() -> void:
	var locale := MenuCopy.system_locale()
	$Content/Eyebrow.text = MenuCopy.text("eyebrow", locale)
	$Content/Title.text = MenuCopy.text("title", locale)
	$Content/Accent.text = MenuCopy.text("accent", locale)
	$Content/Tagline.text = MenuCopy.text("tagline", locale)
	$Content/Actions/NewGame.text = MenuCopy.text("new_game", locale)
	$Content/Actions/Continue.text = MenuCopy.text("continue", locale)
	$Content/Actions/Campaign.text = MenuCopy.text("campaign", locale)
	$Content/Actions/Settings.text = MenuCopy.text("settings", locale)
	$Content/Footer.text = MenuCopy.text("version", locale)
	$Content/Actions/Continue.disabled = true

	_style_button($Content/Actions/NewGame, true)
	_style_button($Content/Actions/Continue)
	_style_button($Content/Actions/Campaign)
	_style_button($Content/Actions/Settings)

	$Content/Actions/NewGame.pressed.connect(func() -> void: new_game_requested.emit())
	$Content/Actions/Continue.pressed.connect(func() -> void: continue_requested.emit())
	$Content/Actions/Campaign.pressed.connect(func() -> void: campaign_requested.emit())
	$Content/Actions/Settings.pressed.connect(func() -> void: settings_requested.emit())


func _style_button(button: Button, primary: bool = false) -> void:
	button.custom_minimum_size = Vector2(0, 49)
	button.add_theme_font_size_override("font_size", 16)
	button.add_theme_color_override("font_color", Color.WHITE if primary else Color("#29243d"))
	button.add_theme_color_override("font_hover_color", Color.WHITE if primary else Color("#29243d"))
	button.add_theme_color_override("font_pressed_color", Color.WHITE if primary else Color("#29243d"))
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("#d96279") if primary else Color("#fffdf8")
	normal.border_color = Color("#d96279") if primary else Color("#d8ced7")
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(9)
	normal.content_margin_left = 12
	normal.content_margin_right = 12
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("#c65068") if primary else Color("#f1e8e8")
	var pressed := normal.duplicate() as StyleBoxFlat
	pressed.bg_color = Color("#ac3f59") if primary else Color("#e7dcdd")
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("pressed", pressed)
	button.add_theme_stylebox_override("focus", normal.duplicate())
