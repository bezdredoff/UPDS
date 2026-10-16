extends SceneTree

# Run with a real Compatibility renderer, not --headless (dummy renderer).
# Synthetic RGBA edges isolate compositing from asset, font and animation differences.
func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	assert(RenderingServer.get_video_adapter_name() != "", "A real renderer is required")
	var viewport := SubViewport.new()
	viewport.size = Vector2i(384, 64)
	viewport.transparent_bg = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(viewport)
	for index in range(6):
		var image := Image.create(64, 64, false, Image.FORMAT_RGBA8)
		image.fill(Color.TRANSPARENT)
		image.fill_rect(Rect2i(16, 16, 32, 32), Color(0.8, 0.4, 0.2, 0.5 if index in [2, 4, 5] else 1.0))
		var sprite := Sprite2D.new()
		sprite.texture = ImageTexture.create_from_image(image)
		sprite.centered = false
		sprite.position.x = index * 64
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		sprite.modulate = Color(1, 1, 1, 0.5 if index in [1, 5] else 1.0)
		var material := ShaderMaterial.new()
		material.shader = load("res://shaders/match3_drop_shadow.gdshader")
		material.set_shader_parameter("shadow_color", Color(0.2, 0.6, 0.8, 0.5) if index == 3 else Color(0, 0, 0, 0.5))
		material.set_shader_parameter("shadow_offset_px", Vector2(8, 0))
		material.set_shader_parameter("shadow_blur_px", 0.0)
		if index >= 4:
			material.set_shader_parameter("shadow_color", Color.TRANSPARENT)
			material.set_shader_parameter("glow_strength", 1.0)
			material.set_shader_parameter("glow_white_radius_px", 0.0)
			material.set_shader_parameter("glow_gold", Color.TRANSPARENT)
			material.set_shader_parameter("glow_aqua", Color.TRANSPARENT)
		sprite.material = material
		viewport.add_child(sprite)
	await process_frame
	await RenderingServer.frame_post_draw
	var rendered := viewport.get_texture().get_image()
	var samples: Array = []
	for index in range(6):
		var body := rendered.get_pixel(index * 64 + 24, 32)
		var shadow := rendered.get_pixel(index * 64 + 52, 32)
		var overlap := rendered.get_pixel(index * 64 + 40, 32)
		samples.append({"body": body, "shadow": shadow, "overlap": overlap})
	print("Compositing samples: ", samples)
	var capture_path := OS.get_environment("UPDS_ART_CAPTURE")
	if not capture_path.is_empty():
		assert(rendered.save_png(capture_path) == OK)
	assert(absf(rendered.get_pixel(52, 32).a - 0.5) < 0.02,
		"Drop shadow disappeared outside the opaque sprite silhouette")
	assert(absf(rendered.get_pixel(116, 32).a - 0.25) < 0.02,
		"Parent/item opacity must fade the shadow exactly once")
	assert(absf(rendered.get_pixel(180, 32).a - 0.25) < 0.02,
		"Texture alpha must shape the shadow, not mask its output")
	assert(absf(rendered.get_pixel(168, 32).a - 0.625) < 0.02,
		"Semi-transparent sprite and shadow must use source-over once")
	var body := rendered.get_pixel(24, 32)
	assert(absf(body.r - 0.8) < 0.02 and absf(body.g - 0.4) < 0.02,
		"Opaque art must retain source RGB without squaring the texture")
	var colored_shadow := rendered.get_pixel(244, 32)
	# SubViewport readback stores premultiplied RGB: .2/.6/.8 times .5 alpha.
	assert(absf(colored_shadow.r - 0.1) < 0.02 and absf(colored_shadow.g - 0.3) < 0.02
		and absf(colored_shadow.b - 0.4) < 0.02,
		"Shadow RGB must come from the filter color, not transparent texture RGB")
	assert(absf(rendered.get_pixel(88, 32).a - 0.5) < 0.02,
		"Fading an opaque sprite must not expose its own shadow")
	assert(absf(rendered.get_pixel(280, 32).a - 0.75) < 0.02,
		"Glow behind semi-transparent source must use source-over exactly once")
	assert(absf(rendered.get_pixel(344, 32).a - 0.375) < 0.02,
		"Item opacity must fade the complete glow/source group once")
	print("UPDS Godot art compositing render smoke passed.")
	quit()
