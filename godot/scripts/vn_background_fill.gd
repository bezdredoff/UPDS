extends TextureRect

# CSS blur(16px) is evaluated in the element's screen-sized raster before the
# 1.08 transform. Cache its two separable passes; story idle frames never rerun it.
const PAD := 48
var legacy_material: ShaderMaterial
var _source: Texture2D
var _legacy := false
var _queued := false
var _cover: SubViewport
var _horizontal: SubViewport
var _vertical: SubViewport
var _image: TextureRect
var _horizontal_rect: ColorRect
var _vertical_rect: ColorRect
var _present_material: ShaderMaterial
var render_generation := 0


func _ready() -> void:
	expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_cover = _viewport("CoverRaster")
	_image = TextureRect.new()
	_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_image.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	_cover.add_child(_image)
	_horizontal = _viewport("HorizontalBlur")
	_horizontal_rect = _pass(_horizontal, preload("res://shaders/vn_blur_horizontal.gdshader"))
	_horizontal_rect.material.set_shader_parameter("cover_texture", _cover.get_texture())
	_vertical = _viewport("VerticalBlur")
	_vertical_rect = _pass(_vertical, preload("res://shaders/vn_blur_vertical.gdshader"))
	_vertical_rect.material.set_shader_parameter("horizontal_texture", _horizontal.get_texture())
	_present_material = ShaderMaterial.new()
	_present_material.shader = preload("res://shaders/vn_blur_present.gdshader")
	resized.connect(_queue_render)
	_queue_render()


func set_source(value: Texture2D) -> void:
	if _source == value:
		return
	_source = value
	_queue_render()


func set_legacy(enabled: bool) -> void:
	if _legacy == enabled:
		return
	_legacy = enabled
	_queue_render()


func _viewport(node_name: String) -> SubViewport:
	var viewport := SubViewport.new()
	viewport.name = node_name
	viewport.disable_3d = true
	viewport.transparent_bg = true
	viewport.render_target_update_mode = SubViewport.UPDATE_DISABLED
	add_child(viewport)
	return viewport


func _pass(viewport: SubViewport, shader: Shader) -> ColorRect:
	var rect := ColorRect.new()
	var pass_material := ShaderMaterial.new()
	pass_material.shader = shader
	rect.material = pass_material
	viewport.add_child(rect)
	return rect


func _queue_render() -> void:
	if _queued or not is_node_ready():
		return
	_queued = true
	_render.call_deferred()


func _render() -> void:
	_queued = false
	if _source == null or size.x < 1.0 or size.y < 1.0:
		return
	if _legacy:
		texture = _source
		material = legacy_material
		stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		return
	var raster_size := Vector2i(roundi(size.x), roundi(size.y))
	_cover.size = raster_size
	_image.size = Vector2(raster_size)
	_image.texture = _source
	_horizontal.size = raster_size + Vector2i(0, PAD * 2)
	_horizontal_rect.size = Vector2(_horizontal.size)
	_horizontal_rect.material.set_shader_parameter("canvas_size", Vector2(raster_size))
	_vertical.size = raster_size
	_vertical_rect.size = Vector2(raster_size)
	_vertical_rect.material.set_shader_parameter("canvas_size", Vector2(raster_size))
	_cover.render_target_update_mode = SubViewport.UPDATE_ONCE
	_horizontal.render_target_update_mode = SubViewport.UPDATE_ONCE
	_vertical.render_target_update_mode = SubViewport.UPDATE_ONCE
	texture = _vertical.get_texture()
	material = _present_material
	stretch_mode = TextureRect.STRETCH_SCALE
	render_generation += 1
