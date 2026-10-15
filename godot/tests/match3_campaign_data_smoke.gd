extends SceneTree

const CampaignData = preload("res://scripts/match3_campaign_data.gd")


func _initialize() -> void:
	var bundle := CampaignData.load_bundle()
	assert(not bundle.has("error"), str(bundle.get("error", "campaign data failed to load")))
	var levels: Array = bundle.levels
	assert(levels.size() == 22, "All 22 authored levels must be present in Godot data")
	assert(CampaignData.get_level(bundle, "M3_00_LOCKER_TUTORIAL").size() > 0, "M3_00 lookup failed")
	assert(CampaignData.get_level(bundle, "M3_21_CONVENIENT_CASE").size() > 0, "M3_21 lookup failed")
	assert(bundle.assets.tiles.size() > 0, "Tile asset map is missing")
	assert(bundle.assets.ingredients.size() > 0, "Ingredient asset map is missing")
	assert(bundle.assets.backgrounds.size() > 0, "Page-background asset map is missing")
	assert(bundle.assets.blockers.size() == 3, "Blocker archetypes are incomplete")
	assert(bundle.assets.specials.size() == 5, "Special asset map is incomplete")
	for level: Dictionary in levels:
		var background_key := str(level.get("pageBackground", ""))
		var background_asset := str(bundle.assets.backgrounds.get(background_key, ""))
		assert(not background_asset.is_empty(), "%s has no exported page background" % str(level.id))
		assert(FileAccess.file_exists("res://" + background_asset.trim_prefix("./")), "%s background asset was not copied into Godot" % str(level.id))
	print("UPDS Godot campaign Match-3 data smoke test passed (22 levels, schema %d)." % int(bundle.schemaVersion))
	quit()
