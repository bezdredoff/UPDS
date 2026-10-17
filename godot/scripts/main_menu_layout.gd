extends RefCounted

const MedallionShadow = preload("res://shaders/menu_medallion_shadow.gdshader")
const ActionShadow = preload("res://shaders/menu_action_shadow.gdshader")
const ArtRendering = preload("res://scripts/art_rendering.gd")
static var _shadow_materials: Dictionary = {}


static func apply(menu: Control) -> void:
	fit_backdrop(menu)
	var narrow := menu.size.x <= 340.0
	var compact := menu.size.y <= 760.0
	var width: float = menu.size.x
	for path in ["Background", "Wash"]:
		menu.get_node(path).offset_left = -width * 0.5
		menu.get_node(path).offset_right = width * 0.5
	var content: VBoxContainer = menu.get_node("Content")
	var content_width := maxf(0.0, width - (36.0 if narrow else 56.0))
	content.offset_left = -content_width * 0.5
	content.offset_right = content_width * 0.5
	content.offset_top = 18.0 if narrow else 26.0 if compact else 42.0
	content.anchor_bottom = 1.0 - (12.0 if narrow else 24.0) / menu.size.y
	# Model source flex margins explicitly; font leading must not drive screen flow.
	content.add_theme_constant_override("separation", 0)
	menu.get_node("Content/Eyebrow").custom_minimum_size.y = 14.0
	menu.get_node("Content/TitleMargin").custom_minimum_size.y = 7.0 if narrow else 14.0
	var title_size := 34 if narrow else 38 if compact else 44
	var title: RichTextLabel = menu.get_node("Content/TitleFrame/Title")
	title.add_theme_font_size_override("normal_font_size", title_size)
	var font: Font = title.get_theme_font("normal_font")
	if OS.has_feature("web"):
		# Measure the actual weighted face, including synthetic bold metrics.
		font = font if menu.preferences.locale == "en" else font.fallbacks[0]
	title.add_theme_constant_override("line_separation", roundi(title_size * 1.02 - font.get_height(title_size)))
	title.add_theme_color_override("font_shadow_color", Color.WHITE)
	title.add_theme_constant_override("shadow_offset_x", 0)
	title.add_theme_constant_override("shadow_offset_y", 2)
	menu.get_node("Content/TitleFrame").custom_minimum_size.y = title_size * 1.02 * 2.0
	menu.get_node("Content/TitleSpacer").custom_minimum_size.y = 12.0
	var tagline: Label = menu.get_node("Content/Tagline/Copy")
	tagline.add_theme_font_size_override("font_size", 12 if narrow else 15)
	tagline.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tagline.offset_top = 0.0
	tagline.offset_bottom = 0.0
	tagline.offset_left = 0.0
	tagline.offset_right = 0.0
	fit_tagline(menu)
	menu.get_node("Content/HeroSpacer").custom_minimum_size.y = 8.0 if narrow else 20.0
	var hero_size := 56.0 if narrow else 66.0 if compact else 78.0
	menu.get_node("Content/Hero").custom_minimum_size.y = hero_size
	for portrait in menu.get_node("Content/Hero").get_children():
		portrait.custom_minimum_size = Vector2(hero_size, hero_size)
		_style_medallion(portrait, hero_size)
	var footer: Label = menu.get_node("Content/Footer")
	footer.add_theme_font_size_override("font_size", 8 if narrow else 10)
	footer.custom_minimum_size.y = 24.0 if narrow else 30.0
	footer.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	menu.get_node("Content/FooterSpacer").custom_minimum_size.y = 7.0 if narrow else 17.0
	for button in menu.get_node("Content/Actions").get_children():
		button.custom_minimum_size.y = 44.0 if narrow else 49.0
	menu.get_node("Content/Actions").add_theme_constant_override("separation", 6 if narrow else 9)
	fit_action_shadow(menu)
	fit_title(menu)


static func fit_tagline(menu: Control) -> void:
	var copy: Label = menu.get_node("Content/Tagline/Copy")
	var line_height := 16.0 if menu.size.x <= 340.0 else 21.0
	menu.get_node("Content/Tagline").custom_minimum_size.y = line_height * maxi(1, copy.get_line_count())


static func fit_title(menu: Control) -> void:
	var title: RichTextLabel = menu.get_node("Content/TitleFrame/Title")
	var height := float(title.get_content_height())
	var optical_offset := 0.0
	if OS.has_feature("web") and menu.preferences.locale == "en":
		optical_offset = float(title.get_theme_font_size("normal_font_size")) * 3.0 / 44.0
	title.offset_top = -height * 0.5 + optical_offset
	title.offset_bottom = height * 0.5 + optical_offset


static func _style_medallion(portrait: Control, size_px: float) -> void:
	ArtRendering.configure(portrait.get_node("Portrait"))
	var shadow: Panel = portrait.get_node("Shadow")
	if not _shadow_materials.has(size_px):
		var material := ShaderMaterial.new()
		material.shader = MedallionShadow
		material.set_shader_parameter("radius_px", size_px * 0.5)
		_shadow_materials[size_px] = material
	shadow.material = _shadow_materials[size_px]
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color.WHITE
	shadow.add_theme_stylebox_override("panel", fill)
	# CSS box-shadow blur 14px has sigma 7px; keep its 3-sigma support and 5px offset.
	shadow.offset_left = -21.0
	shadow.offset_right = 21.0
	shadow.offset_top = -16.0
	shadow.offset_bottom = 26.0


static func fit_action_shadow(menu: Control) -> void:
	var button: Button = menu.get_node("Content/Actions/NewGame")
	var shadow := button.get_node_or_null("SourceShadow") as ColorRect
	if shadow == null:
		shadow = ColorRect.new()
		shadow.name = "SourceShadow"
		shadow.show_behind_parent = true
		shadow.mouse_filter = Control.MOUSE_FILTER_IGNORE
		shadow.material = ShaderMaterial.new()
		(shadow.material as ShaderMaterial).shader = ActionShadow
		button.add_child(shadow)
		shadow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shadow.offset_left = -33.0
	shadow.offset_right = 33.0
	shadow.offset_top = -25.0
	shadow.offset_bottom = 41.0
	(shadow.material as ShaderMaterial).set_shader_parameter("box_size_px", button.size)


static func fit_backdrop(menu: Control) -> void:
	var backdrop: ColorRect = menu.get_node("Backdrop")
	backdrop.position = Vector2.ZERO
	backdrop.size = menu.get_viewport().get_visible_rect().size
	var shadow := menu.get_node_or_null("PhoneShadow") as ColorRect
	if shadow == null:
		shadow = ColorRect.new()
		shadow.name = "PhoneShadow"
		shadow.top_level = true
		shadow.z_index = -50
		shadow.z_as_relative = false
		shadow.mouse_filter = Control.MOUSE_FILTER_IGNORE
		shadow.material = ShaderMaterial.new()
		(shadow.material as ShaderMaterial).shader = ActionShadow
		(shadow.material as ShaderMaterial).set_shader_parameter("sigma_px", 45.0)
		(shadow.material as ShaderMaterial).set_shader_parameter("shadow_color", Color("#00000099"))
		menu.add_child(shadow)
	var window_size := Vector2(menu.get_window().size)
	shadow.visible = window_size.x > 430.0
	shadow.size = backdrop.size
	shadow.position = Vector2(0.0, 24.0 * backdrop.size.y / window_size.y)
	(shadow.material as ShaderMaterial).set_shader_parameter("box_size_px", menu.size)
