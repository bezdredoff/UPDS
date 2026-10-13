extends RefCounted


static func style_button(button: Button, primary: bool = false) -> void:
	button.custom_minimum_size = Vector2(0, 49)
	button.add_theme_font_size_override("font_size", 16)
	button.add_theme_color_override("font_color", Color.WHITE if primary else Color("#29243d"))
	button.add_theme_color_override("font_hover_color", Color.WHITE if primary else Color("#29243d"))
	button.add_theme_color_override("font_pressed_color", Color.WHITE if primary else Color("#29243d"))
	button.add_theme_color_override("font_focus_color", Color.WHITE if primary else Color("#29243d"))
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
	var focus := StyleBoxFlat.new()
	focus.bg_color = Color.TRANSPARENT
	focus.border_color = Color("#ac3f59")
	focus.set_border_width_all(3)
	focus.set_corner_radius_all(9)
	button.add_theme_stylebox_override("focus", focus)
