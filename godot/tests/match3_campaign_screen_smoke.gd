extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")
const Match3Session = preload("res://scripts/match3_campaign_session.gd")
const CampaignData = preload("res://scripts/match3_campaign_data.gd")


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var memory := Memory.new()
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Memory.story_session()
	menu.match3_session = Match3Session.new(preload("res://scripts/campaign_store.gd").new(memory))
	menu.preferences = preload("res://scripts/player_preferences.gd").new("user://campaign_screen_smoke_%s.cfg" % Time.get_ticks_usec())
	root.add_child(menu)
	await process_frame
	menu._open_campaign()
	await process_frame
	var campaign: Control = menu.match3_campaign_screen
	assert(campaign.cards.get_child_count() == 22, "Campaign hub did not render all authored levels")
	assert(campaign.cards.get_child(1).get_child(0).get_child(1).disabled, "Second level should be locked initially")
	var bundle := CampaignData.load_bundle()
	var first_id := str(bundle.levels[0].id)
	var second_id := str(bundle.levels[1].id)
	menu._open_match3_level(second_id, true)
	assert(menu.match3_screen == null, "Locked level launched through the navigation boundary")
	menu.match3_session.complete_level(first_id, 5)
	campaign.refresh_screen()
	assert(not campaign.cards.get_child(1).get_child(0).get_child(1).disabled, "Completing first level did not unlock the second")
	campaign.cards.get_child(1).get_child(0).get_child(1).pressed.emit()
	await process_frame
	var match3: Control = menu.match3_screen
	assert(match3 != null and match3.campaign_mode, "Campaign level did not launch in standalone mode")
	assert(match3.level_id == second_id and match3.game.level_data.id == second_id, "Selected campaign level was not loaded")
	assert(match3.game.tiles.size() == int(bundle.levels[1].rows) * int(bundle.levels[1].columns), "Selected campaign board dimensions mismatch")
	assert(menu.session.state.completed.is_empty(), "Standalone Match-3 campaign changed VN completion")
	match3.story_requested.emit()
	await process_frame
	assert(menu.match3_screen == null and campaign.visible, "Returning from a level did not restore the campaign hub")
	campaign.back_button.pressed.emit()
	await process_frame
	assert(menu.match3_campaign_screen == null and menu.get_node("Content").visible, "Campaign back did not restore the main menu")
	menu.queue_free()
	await process_frame
	print("UPDS Godot Match-3 campaign screen smoke test passed (sequential unlock and level routing).")
	quit()
