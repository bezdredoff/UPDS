extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")
const Match3Session = preload("res://scripts/match3_campaign_session.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const Match3Screen = preload("res://scripts/match3_screen.gd")
const Preferences = preload("res://scripts/player_preferences.gd")


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var bundle := CampaignData.load_bundle()
	assert(not bundle.has("error"), str(bundle.get("error", "campaign data failed to load")))
	var level: Dictionary = bundle.levels[11]
	var drop_objectives: Array[int] = []
	for index in level.objectives.size():
		var kind := str(level.objectives[index].get("kind", ""))
		if kind == "drop" or kind == "dropGroup":
			drop_objectives.append(index)
	assert(drop_objectives.size() == 2, "M3_11 should cover ordered guidance for two story-object objectives")

	var screen := Match3Screen.new()
	screen.preferences = Preferences.new("user://match3_guidance_smoke_%s.cfg" % Time.get_ticks_usec())
	screen.preferences.set_locale("ru")
	screen.session = Match3Session.new(preload("res://scripts/campaign_store.gd").new(Memory.new()))
	screen.level_id = str(level.id)
	screen.campaign_mode = true
	root.add_child(screen)
	await process_frame
	await process_frame

	assert(screen.guidance_objective_indices == drop_objectives,
		"Guidance objective order should follow the authored objective order")
	assert(not screen.guidance_labels[0].visible
		and screen.guidance_labels[1].visible
		and not screen.guidance_labels[2].visible,
		"Only the first incomplete story-object objective should replace the default input hint")
	var first_style := screen.guidance_labels[1].get_theme_stylebox("normal") as StyleBoxFlat
	assert(first_style != null
		and first_style.bg_color == Color("#fffaf0e8")
		and first_style.border_color == Color("#dcae42")
		and first_style.get_border_width(SIDE_LEFT) == 1
		and first_style.content_margin_left == 13.0
		and (screen.guidance_labels[1].get_node("AccentStripe").get_theme_stylebox("panel") as StyleBoxFlat).bg_color == Color("#326349")
		and screen.guidance_labels[1].horizontal_alignment == HORIZONTAL_ALIGNMENT_LEFT,
		"Story-object guidance should use the source paper card, green leading stripe, inset and left alignment")
	assert(screen.guidance_labels[1].text.contains("Сюжетный объект")
		and screen.guidance_labels[1].text.contains(str(bundle.levelPresentations[level.id].localized.ru.objectives[drop_objectives[0]])),
		"Story-object guidance should retain its localized objective copy")
	screen._fit_story_object_guidance(320.0)
	var compact_style := screen.guidance_labels[1].get_theme_stylebox("normal") as StyleBoxFlat
	assert(compact_style.content_margin_left == 11.0
		and compact_style.content_margin_right == 6.0
		and compact_style.content_margin_top == 4.0
		and screen.guidance_labels[1].get_theme_font_size("font_size") == 8
		and screen.bottom_spacer.custom_minimum_size.y == 20.0,
		"Compact guidance should follow the source <=340px padding, type size and row height")
	screen._fit_story_object_guidance(390.0)

	_complete_drop_objective(screen.game, level.objectives[drop_objectives[0]])
	screen._refresh()
	assert(not screen.guidance_labels[0].visible
		and not screen.guidance_labels[1].visible
		and screen.guidance_labels[2].visible,
		"Completing the first drop objective should reveal the next incomplete drop objective")
	_complete_drop_objective(screen.game, level.objectives[drop_objectives[1]])
	screen._refresh()
	assert(screen.guidance_labels[0].visible
		and not screen.guidance_labels[1].visible
		and not screen.guidance_labels[2].visible,
		"Completing all story-object objectives should restore the default input hint")
	assert(screen.bottom_spacer.custom_minimum_size.y == 20.0,
		"The default input hint should reserve the source 20px guidance row")

	print("UPDS Godot Match-3 story-object guidance smoke test passed (ordered objectives and responsive card styling).")
	quit()


func _complete_drop_objective(game: RefCounted, objective: Dictionary) -> void:
	var target := int(objective.get("target", 0))
	if str(objective.get("kind", "")) == "drop":
		game.ingredients_dropped[str(objective.ingredient)] = target
	else:
		var ingredients: Array = objective.get("ingredients", [])
		if not ingredients.is_empty():
			game.ingredients_dropped[str(ingredients[0])] = target
