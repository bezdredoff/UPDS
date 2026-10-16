extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	assert(RenderingServer.get_video_adapter_name() != "", "Art captures require a real renderer")
	var manifest: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(OS.get_environment("UPDS_ART_MATRIX")))
	var destination := OS.get_environment("UPDS_ART_OUTPUT")
	assert(not destination.is_empty() and manifest.has("cases"))
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Memory.story_session()
	menu.match3_session = preload("res://scripts/match3_campaign_session.gd").new(
		preload("res://scripts/campaign_store.gd").new(Memory.new()))
	root.add_child(menu)
	menu._open_match3_level("M3_00_LOCKER_TUTORIAL", true)
	var match3: Control = menu.match3_screen
	match3._reduced_motion_override = true
	menu.hide()
	var vn: Control = preload("res://scripts/vn_screen.gd").new()
	var viewport := SubViewport.new()
	viewport.size = Vector2i(384, 480)
	viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(viewport)
	var backdrop := ColorRect.new()
	backdrop.color = Color("#223b58")
	backdrop.size = Vector2(viewport.size)
	viewport.add_child(backdrop)
	await process_frame
	await process_frame
	var results: Array = []
	for sample: Dictionary in manifest.cases:
		var holder := Control.new()
		viewport.add_child(holder)
		var art: TextureRect
		if sample.kind == "portrait":
			holder.position = Vector2(64, 48)
			holder.size = Vector2(256, 384)
			art = TextureRect.new()
			preload("res://scripts/art_rendering.gd").configure(art)
			art.texture = load("res://" + str(sample.asset).trim_prefix("./"))
			art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			art.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			art.material = vn._portrait_drop_shadow_material()
			art.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		else:
			match3.game.tiles[0] = str(sample.key) if sample.kind == "tile" else "pantiesSportWhite"
			match3.game.specials[0] = str(sample.key) if sample.kind == "special" else ""
			match3.game.ingredients[0] = str(sample.key) if sample.kind == "ingredient" else ""
			match3.game.blocker_layers[0] = int(sample.get("layers", 0))
			match3.level_data.blockerStyle = str(sample.key) if sample.kind == "blocker" else "solid"
			match3.rendered_cell_signatures[0] = ""
			match3._render_board()
			match3._fit_board_cells()
			await process_frame
			var cell: Control = match3.board.get_child(0)
			holder.size = cell.size
			holder.position = ((Vector2(viewport.size) - holder.size) * 0.5).floor()
			holder.clip_contents = true
			var node_path := "TileStack/Tile"
			if sample.kind == "special": node_path = "TileStack/Special"
			if sample.kind == "ingredient": node_path = "TileStack/Ingredient"
			if sample.kind == "blocker": node_path = "Blocker"
			art = cell.get_node(node_path).duplicate(0) as TextureRect
		holder.add_child(art)
		# The fixture freezes idle; production anchors, insets, scale and material remain intact.
		await process_frame
		art.pivot_offset = art.size * 0.5
		await RenderingServer.frame_post_draw
		var capture_path := destination.path_join(str(sample.id) + ".png")
		assert(viewport.get_texture().get_image().save_png(capture_path) == OK)
		var rect := art.get_global_rect()
		var material := art.material as ShaderMaterial
		results.append({"id": sample.id, "cell": [holder.position.x, holder.position.y, holder.size.x, holder.size.y],
			"rect": [rect.position.x, rect.position.y, rect.size.x, rect.size.y],
			"scale": art.scale.x, "opacity": art.modulate.a,
			"brightness": material.get_shader_parameter("brightness") if material != null else 1.0,
			"saturation": material.get_shader_parameter("saturation") if material != null else 1.0,
			"shadow_blur": material.get_shader_parameter("shadow_blur_px") if material != null else 0.0})
		holder.queue_free()
		await process_frame
	var output := FileAccess.open(destination.path_join("geometry.json"), FileAccess.WRITE)
	output.store_string(JSON.stringify(results, "\t"))
	output.close()
	vn.free()
	menu.queue_free()
	print("UPDS art matrix rendered: ", results.size())
	quit()
