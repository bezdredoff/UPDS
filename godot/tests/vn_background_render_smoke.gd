extends SceneTree


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	assert(RenderingServer.get_video_adapter_name() != "", "A real renderer is required")
	var fill := preload("res://scripts/vn_background_fill.gd").new()
	fill.size = Vector2(128, 128)
	root.add_child(fill)
	var white := Image.create(128, 128, false, Image.FORMAT_RGBA8)
	white.fill(Color.WHITE)
	var source := ImageTexture.create_from_image(white)
	fill.set_source(source)
	await _draw_frames()
	var generation: int = fill.render_generation
	assert(generation == 1, "The initial backdrop must render once")
	var image: Image = fill.texture.get_image()
	var centre := image.get_pixel(64, 64)
	assert(absf(centre.r - 0.7) < 0.008 and centre.a > 0.99, "The cached opaque centre must preserve CSS brightness")
	var edge := image.get_pixel(0, 0)
	var expected_alpha := pow(_gaussian_coverage(0.5, 128.0), 2.0)
	assert(absf(edge.a - expected_alpha) < 0.015, "Transparent bounds must use a 16 CSS px separable Gaussian")
	assert(absf(edge.r - edge.a * 0.7) < 0.008, "Blur intermediates must remain premultiplied")
	fill.set_source(source)
	await _draw_frames()
	assert(fill.render_generation == generation, "Idle/same-source frames must reuse the cached raster")
	# SubViewport's property retains UPDATE_ONCE after the server consumes it.
	# Dirty each pass and inspect real GPU bytes instead of trusting that field.
	var cached: Array[PackedByteArray] = []
	var materials: Array[Material] = []
	for name in ["CoverRaster", "HorizontalBlur", "VerticalBlur"]:
		var viewport: SubViewport = fill.get_node(name)
		cached.append(viewport.get_texture().get_image().get_data())
		var rect: Control = viewport.get_child(0)
		materials.append(rect.material)
		rect.material = null
		rect.modulate = Color.RED
	await _draw_frames()
	var index := 0
	for name in ["CoverRaster", "HorizontalBlur", "VerticalBlur"]:
		var viewport: SubViewport = fill.get_node(name)
		assert(viewport.get_texture().get_image().get_data() == cached[index],
			"Idle cached viewports must not rerender even if their source canvas is dirty")
		var rect: Control = viewport.get_child(0)
		rect.material = materials[index]
		rect.modulate = Color.WHITE
		index += 1
	fill.size = Vector2(160, 128)
	await _draw_frames()
	assert(fill.render_generation == generation + 1)
	assert(fill.get_node("CoverRaster").size == Vector2i(160, 128))
	assert(fill.get_node("HorizontalBlur").size == Vector2i(160, 224))
	assert(fill.texture.get_width() == 160)
	print("UPDS Godot VN background render smoke passed.")
	fill.queue_free()
	await process_frame
	quit()


func _draw_frames() -> void:
	for index in range(4):
		await process_frame
		await RenderingServer.frame_post_draw


func _gaussian_coverage(point: float, extent: float) -> float:
	var weight := 0.0
	var total := 0.0
	for offset in range(-48, 49):
		var sample_weight := exp(-float(offset * offset) / (2.0 * 16.0 * 16.0))
		total += sample_weight
		if point + offset >= 0.0 and point + offset < extent:
			weight += sample_weight
	return weight / total
