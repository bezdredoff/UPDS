extends SceneTree

const Memory = preload("res://tests/memory_storage.gd")
const Session = preload("res://scripts/story_session.gd")
const Store = preload("res://scripts/campaign_store.gd")
const Format = preload("res://scripts/save_format.gd")
const Match3Session = preload("res://scripts/match3_campaign_session.gd")
const Copy = preload("res://scripts/menu_copy.gd")
const Prologue = preload("res://data/prologue.json")
const LockerScene = preload("res://data/locker_scene.json")
const PostMatchScene = preload("res://data/post_match_scene.json")
const PhotoScene = preload("res://data/photo_scene.json")
const PostPhotoScene = preload("res://data/post_photo_scene.json")
const PoolScene = preload("res://data/pool_scene.json")
const PostPoolScene = preload("res://data/post_pool_scene.json")
const EmergencyMeetingScene = preload("res://data/emergency_meeting_scene.json")
const PostTextileWorkshopScene = preload("res://data/post_textile_workshop_scene.json")
const AsterionLabScene = preload("res://data/asterion_lab_scene.json")
const PostAsterionLabScene = preload("res://data/post_asterion_lab_scene.json")
const LostFoundScene = preload("res://data/lost_found_scene.json")
const PostLostFoundScene = preload("res://data/post_lost_found_scene.json")
const MaintenanceKeysScene = preload("res://data/maintenance_keys_scene.json")
const PostMaintenanceKeysScene = preload("res://data/post_maintenance_keys_scene.json")
const ControlSampleGearScene = preload("res://data/control_sample_gear_scene.json")
const PostControlSampleGearScene = preload("res://data/post_control_sample_gear_scene.json")
const AsterionTransferScene = preload("res://data/asterion_transfer_scene.json")
const PostAsterionTransferScene = preload("res://data/post_asterion_transfer_scene.json")
const SecondSkinSignalScene = preload("res://data/second_skin_signal_scene.json")
const PostSecondSkinSignalScene = preload("res://data/post_second_skin_signal_scene.json")
const KendoPilotListScene = preload("res://data/kendo_pilot_list_scene.json")
const PostKendoPilotListScene = preload("res://data/post_kendo_pilot_list_scene.json")
const KuboAtelierScene = preload("res://data/kubo_atelier_scene.json")
const PostKuboAtelierScene = preload("res://data/post_kubo_atelier_scene.json")
const AbandonedLaundryScene = preload("res://data/abandoned_laundry_scene.json")
const PostAbandonedLaundryScene = preload("res://data/post_abandoned_laundry_scene.json")

const PinkRibbonScannerScene = preload("res://data/pink_ribbon_scanner_scene.json")
const PostPinkRibbonScannerScene = preload("res://data/post_pink_ribbon_scanner_scene.json")
const RinaArchiveCatalogScene = preload("res://data/rina_archive_catalog_scene.json")
const PostRinaArchiveCatalogScene = preload("res://data/post_rina_archive_catalog_scene.json")
const FullTimelineProofScene = preload("res://data/full_timeline_proof_scene.json")
const PostFullTimelineProofScene = preload("res://data/post_full_timeline_proof_scene.json")
const PrivateReturnScene = preload("res://data/private_return_scene.json")
const PostPrivateReturnScene = preload("res://data/post_private_return_scene.json")
const FullTruthScene = preload("res://data/full_truth_scene.json")
const PostFullTruthScene = preload("res://data/post_full_truth_scene.json")
const ConvenientCaseScene = preload("res://data/convenient_case_scene.json")
const PostConvenientCaseScene = preload("res://data/post_convenient_case_scene.json")
const Match3Level = preload("res://data/locker_match3.json")

var _test_dossier_reset_requested := false
var _test_menu_requested := false


func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var preferences_path := "user://vn_smoke_%s.cfg" % Time.get_ticks_usec()
	var session := Memory.story_session()
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = session
	menu.match3_session = Match3Session.new(Store.new(Memory.new()))
	menu.preferences = preload("res://scripts/player_preferences.gd").new(preferences_path)
	root.add_child(menu)
	await process_frame
	assert(menu.get_node("Content/Actions/Continue").disabled)
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	await process_frame
	var screen: Control = menu.get_node("StoryScreen")
	assert(absf(screen.size.x - 430.0) < 1.0, "Story screens must share the web phone frame width")
	assert(not screen.stage.clip_contents, "Authored characters must continue behind the VN dialogue panel")
	assert(screen.background_rect.stretch_mode == TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		and screen.background_fill.stretch_mode == TextureRect.STRETCH_KEEP_ASPECT_COVERED
		and screen.background_fill.material != null,
		"VN backgrounds should mirror the original fit image and blurred fill layers")
	assert(not menu.get_node("Content").visible)
	assert(session.current_line().id == "VN0001")
	menu.audio_runtime.activate()
	assert(menu.audio_runtime.music.playing)
	assert(menu.audio_runtime.music.stream.get_length() > 12.6 and menu.audio_runtime.music.stream.get_length() < 12.7)
	assert(screen.stage.get_child_count() == 1)
	var idle_portrait: TextureRect = screen.stage.get_child(0)
	var portrait_shadow := idle_portrait.material as ShaderMaterial
	assert(portrait_shadow != null
		and (portrait_shadow.get_shader_parameter("shadow_color") as Color).is_equal_approx(Color("#10162b59"))
		and (portrait_shadow.get_shader_parameter("shadow_offset_px") as Vector2).is_equal_approx(Vector2(0.0, 12.0))
		and is_equal_approx(portrait_shadow.get_shader_parameter("shadow_blur_px"), 12.0),
		"VN character portrait did not preserve the source drop shadow treatment")
	assert(idle_portrait.get_global_rect().end.y > screen.dialogue_panel.position.y,
		"The portrait must continue underneath the overlayed VN dialogue card")
	assert(screen._portrait_should_breathe("./assets/characters/miku/rig/pose_a/frames/frame-neutral.png"),
		"Rig portraits should retain the source idle-breathe animation")
	assert(is_equal_approx(screen._idle_breathe_curve(0.5), 0.5)
		and screen._idle_breathe_curve(0.25) < 0.25
		and screen._idle_breathe_curve(0.75) > 0.75,
		"Rig portrait idle motion should use the source CSS ease-in-out curve")
	assert(not screen._portrait_should_breathe("./assets/characters/ayuki/poses/pose_b_phone_theory.png"),
		"Authored prop poses should remain still like the source static portrait wrapper")
	assert(screen.nameplate.size.x >= 180.0 and screen.nameplate.size.x < screen.dialogue_panel.size.x,
		"The dialogue nameplate must keep its compact horizontal shape")
	var resting_position := idle_portrait.position
	await create_timer(0.8).timeout
	assert(absf(idle_portrait.position.y - resting_position.y) > 0.1,
		"The production idle-breathe motion must move the authored VN portrait")
	await _vn_reading_controls(menu)
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		var source_dialogue: String = Prologue.data.lines[0].localized[locale].text
		assert(" ".join(screen._dialogue_pages) == " ".join(source_dialogue.split(" ", false)),
			"VN pages must preserve the complete localized line")
		assert(screen.speaker.text == Prologue.data.lines[0].localized[locale].speaker)
		assert(screen.skip_button.tooltip_text == Copy.text("vn_skip", locale))
	if screen._dialogue_pages.size() > 1:
		screen.next_button.pressed.emit()
		assert(screen._dialogue_page_index == 1 and session.current_line().id == "VN0001",
			"The first advance must reveal the next page without changing the story line")
		screen.next_button.pressed.emit()
		assert(screen._dialogue_page_index == 1 and session.current_line().id == "VN0001",
			"Rapid taps must not skip a dialogue page")
		while screen._dialogue_page_index + 1 < screen._dialogue_pages.size():
			await create_timer(0.3).timeout
			screen.next_button.pressed.emit()
		await create_timer(0.3).timeout
		screen.next_button.pressed.emit()
	else:
		screen.next_button.pressed.emit()
		screen.next_button.pressed.emit()
	assert(session.current_line().id == "VN0002", "The final page must advance to the next story line")
	assert(session.state.readLines == ["VN0001"])
	screen.settings_button.pressed.emit()
	assert(screen.overlay_title.text == Copy.text("vn_config_title", menu.preferences.locale))
	assert(screen.overlay.find_child("AutoSpeedNormal", true, false) != null,
		"VN settings should open the reading configuration in place")
	screen._close_overlay()
	assert(screen.visible and not menu.has_node("SettingsScreen"))
	assert(not menu.get_node("Content").visible)
	screen.menu_button.pressed.emit()
	assert(not menu.has_node("StoryScreen") and menu.get_node("Content").visible)
	assert(menu.audio_runtime.music.stream.get_length() > 11.1 and menu.audio_runtime.music.stream.get_length() < 11.2)
	assert(not menu.get_node("Content/Actions/Continue").disabled)
	var restored := Session.new(session.store)
	restored.reload()
	assert(restored.current_line().id == "VN0002")
	menu.get_node("Content/Actions/Continue").pressed.emit()
	screen = menu.get_node("StoryScreen")
	assert(screen.dialogue.text == Prologue.data.lines[1].localized.en.text)
	while session.current_line().id != "VN0008":
		assert(session.advance())
	assert(screen.stage.get_child_count() == 3, "Authored trio shot was lost")
	for portrait in screen.stage.get_children():
		assert(portrait.texture != null)
	while session.current_line().id != "VN0020":
		assert(session.advance())
	assert(session.advance())
	assert(session.current_line().id == "VN0022")
	assert(session.state.readLines.has("VN0021"), "Hidden direction was not consumed")
	assert(screen.speaker.text == Prologue.data.lines[21].localized.en.speaker)
	await create_timer(0.15).timeout
	screen.next_button.pressed.emit()
	assert(session.state.scene == 1 and session.current_line().id == "VN0023", "Prologue did not enter scene 1")
	var reached_levels: Array[String] = []
	screen.match3_requested.connect(func(level_id: String) -> void: reached_levels.append(level_id))
	while session.current_line().id != "VN0040":
		assert(session.advance())
	assert(screen.choice_box.visible and screen.choice_prompt.text == "Where do we start?")
	screen.choice_buttons[1].pressed.emit()
	assert(session.state.choice == "B" and session.current_line().id == "VN0041B")
	assert(session.state.readLines.has("VN0040"), "Choice checkpoint was not consumed")
	while session.current_line().id != "VN0057":
		assert(session.advance())
	assert(screen.background_rect.texture.resource_path.ends_with("BG_LOCKER_ATHLETICS_DAY.webp"))
	assert(screen.boundary.visible and screen.next_button.disabled)
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL"], "First Match-3 gate was not requested")
	await process_frame
	assert(menu.match3_screen != null and not screen.visible, "First Match-3 gate did not open the level")
	assert(menu.match3_screen.game.tiles.size() == 63 and menu.match3_screen.game.moves_left == 24)
	assert(menu.match3_session.save.attempts.M3_00_LOCKER_TUTORIAL == 1)
	menu.match3_screen.tutorial_button.pressed.emit()
	assert(not menu.match3_screen.tutorial_panel.visible)
	assert(menu.match3_session.save.tutorialsCompleted.is_empty(), "Story tutorial progress leaked into the standalone Match-3 campaign save")
	assert(session.state.tutorialsCompleted.is_empty(), "Acknowledging the story tutorial incorrectly marked its mechanic complete")
	menu.match3_screen.back_button.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible, "Match-3 back did not restore the story gate")
	assert(session.state.scene == 1 and session.state.line == LockerScene.data.variants.B.size() - 1, "Advanced into an unavailable scene")
	assert(session.state.readLines.has("VN0041B") and not session.state.readLines.has("VN0041A"))
	menu._handle_match3_request("M3_00_LOCKER_TUTORIAL")
	await process_frame
	var match3_screen: Control = menu.match3_screen
	assert(match3_screen.tutorial_panel.visible, "An acknowledged but uncompleted tutorial should return when its level is restarted")
	match3_screen._record_tutorial_move({"valid": true})
	assert(session.state.tutorialsCompleted == ["basic-swap"], "A valid story swap did not complete the story tutorial in the story save")
	assert(menu.match3_session.save.tutorialsCompleted.is_empty(), "Completing a story tutorial changed standalone campaign tutorial progress")
	match3_screen._refresh()
	assert(not match3_screen.tutorial_panel.visible, "Completed story tutorial was not dismissed after its completion event")
	var model: RefCounted = match3_screen.game
	assert(menu.preferences.set_locale("ru") == OK)
	model.state = "lost"
	match3_screen._refresh()
	assert(match3_screen.campaign_result_overlay.visible, "Story loss did not open its dedicated result screen")
	assert(match3_screen.campaign_result_heading.text == "Версия требует повторной проверки", "Story loss heading did not match the source copy")
	assert(match3_screen.campaign_result_loss_quote.text.contains(Match3Level.data.localized.ru.loseText), "Story loss omitted the level-specific character bark")
	assert(match3_screen.campaign_result_retry.text == "Повторить уровень" and not match3_screen.campaign_result_hub.visible, "Story loss actions did not match the source controls")
	for locale in ["be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(match3_screen.campaign_result_heading.text == Copy.text("match3_loss_heading", locale))
		assert(match3_screen.campaign_result_loss_quote.text.contains(Match3Level.data.localized[locale].loseText))
	assert(menu.preferences.set_locale("ru") == OK)
	var story_attempts_before_retry := int(menu.match3_session.save.attempts.M3_00_LOCKER_TUTORIAL)
	match3_screen.campaign_result_retry.pressed.emit()
	assert(match3_screen.game.state == "playing" and not match3_screen.campaign_result_overlay.visible, "Story loss retry did not restart the board")
	assert(int(menu.match3_session.save.attempts.M3_00_LOCKER_TUTORIAL) == story_attempts_before_retry + 1, "Story loss retry did not increment the attempt")
	match3_screen.game.state = "lost"
	match3_screen._refresh()
	match3_screen.campaign_result_back.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible, "Story loss back action did not return to the investigation gate")
	menu._handle_match3_request("M3_00_LOCKER_TUTORIAL")
	await process_frame
	match3_screen = menu.match3_screen
	model = match3_screen.game
	var rows := int(Match3Level.data.rows)
	var columns := int(Match3Level.data.columns)
	var other_tiles: Array = Match3Level.data.activeTiles.filter(func(tile: Variant) -> bool: return str(tile) != str(Match3Level.data.objectiveTile))
	model.tiles.clear()
	model.specials.clear()
	for row in range(rows):
		for column in range(columns):
			model.tiles.append(str(Match3Level.data.activeTiles[(row * 2 + column) % Match3Level.data.activeTiles.size()]))
			model.specials.append("")
	model.tiles[0] = str(Match3Level.data.objectiveTile)
	model.tiles[1] = str(Match3Level.data.objectiveTile)
	model.tiles[2] = str(other_tiles[0])
	model.tiles[3] = str(Match3Level.data.objectiveTile)
	model.collected = 9
	model.collected_by_tile[str(Match3Level.data.objectiveTile)] = 9
	model.moves_left = 1
	match3_screen._refresh()
	match3_screen._select_cell(2)
	match3_screen._select_cell(3)
	while match3_screen.input_locked:
		await process_frame
	assert(model.state == "won" and match3_screen.evidence_transition_overlay.visible, "Match-3 win did not open the full-screen evidence transition")
	assert(session.state.scene == 2 and session.current_line().id == "VN0059")
	assert(session.state.readLines.has("VN0058"), "Post-match direction line was not consumed")
	assert(session.state.completed == [0] and session.state.clues == ["CUE_001"], "Win progress or clue was not saved")
	assert(menu.match3_session.save.completed == ["M3_00_LOCKER_TUTORIAL"])
	assert(match3_screen.evidence_transition_image.texture != null)
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(match3_screen.evidence_transition_title.text == Match3Level.data.evidence.localized[locale].title)
		assert(match3_screen.evidence_transition_continue.text == Match3Level.data.evidence.localized[locale].continueStory)
	match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible, "Continue Story did not return to the post-match VN")
	var clue_toast := screen.stage.find_child("ClueToast", true, false) as PanelContainer
	assert(clue_toast != null and clue_toast.visible, "Returning from an earned clue did not show the animated VN toast")
	assert((clue_toast.find_child("ClueImage", true, false) as TextureRect).texture != null, "VN clue toast did not render its evidence art")
	assert(clue_toast.modulate.a < 1.0 and clue_toast.offset_top < 8.0,
		"Clue toast should begin faded and 8px above its final CSS position")
	var clue_enter_wait := 0.0
	while (clue_toast.modulate.a < 0.99 or absf(clue_toast.offset_top - 8.0) > 0.1) and clue_enter_wait < 1.0:
		await create_timer(0.05).timeout
		clue_enter_wait += 0.05
	assert(absf(clue_toast.modulate.a - 1.0) <= 0.01 and absf(clue_toast.offset_top - 8.0) <= 0.1,
		"Clue toast should finish at the source 8px top position and full opacity")
	assert(screen.speaker.text == PostMatchScene.data.lines[1].localized.en.speaker)
	assert(session.current_line().id == "VN0059")
	assert(screen.dialogue.text == PostMatchScene.data.lines[1].localized.en.text)
	var restored_post_match := Session.new(session.store)
	restored_post_match.reload()
	assert(restored_post_match.current_line().id == "VN0059", "Continue did not restore post-win VN progress")
	while session.state.line < PostMatchScene.data.lines.size() - 1:
		assert(session.advance())
	assert(session.current_line().id == "VN0084" and not session.at_port_boundary())
	assert(session.advance() and session.state.scene == 3 and session.current_line().id == "VN0086")
	assert(session.state.readLines.has("VN0085"), "Scene transition did not consume its hidden opening direction")
	assert(screen.title.text == PhotoScene.data.titles.en)
	while session.current_line().id != "VN0113":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_01_PHOTO_PROPS")
	assert(not session.at_port_boundary())
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_01_PHOTO_PROPS")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS"])
	assert(session.complete_match3("M3_01_PHOTO_PROPS"), "Second Match-3 gate did not route to its VN scene")
	assert(session.state.scene == 4 and session.current_line().id == "VN0115")
	assert(session.state.completed == [0, 1] and session.state.clues == ["CUE_001", "CUE_002"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostPhotoScene.data.titles.en)
	while session.state.line < PostPhotoScene.data.lines.size() - 1:
		assert(session.advance())
	assert(session.current_line().id == "VN0142" and not session.at_port_boundary())
	assert(session.advance() and session.state.scene == 5 and session.current_line().id == "VN0143")
	assert(screen.title.text == PoolScene.data.titles.en)
	while session.current_line().id != "VN0166":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_02_POOL_LAUNDRY")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_02_POOL_LAUNDRY")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY"])
	assert(session.complete_match3("M3_02_POOL_LAUNDRY"))
	assert(session.state.scene == 6 and session.current_line().id == "VN0168")
	assert(session.state.completed == [0, 1, 2] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostPoolScene.data.titles.en)
	while session.current_line().id != "VN0191":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 7 and session.current_line().id == "VN0192")
	assert(screen.title.text == session.scene_data().titles.en)
	while session.current_line().id != "VN0216":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_03_ORDERED_APARTMENT")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_03_ORDERED_APARTMENT")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT"])
	assert(session.complete_match3("M3_03_ORDERED_APARTMENT"))
	assert(session.state.scene == 8 and session.current_line().id == "VN0218")
	assert(session.state.completed == [0, 1, 2, 3] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003", "CUE_004"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == session.scene_data().titles.en)
	while session.current_line().id != "VN0250":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 9 and session.current_line().id == "VN0252")
	assert(session.state.readLines.has("VN0251"), "Scene transition did not consume its hidden opening direction")
	assert(screen.title.text == session.scene_data().titles.en)
	while session.current_line().id != "VN0262":
		assert(session.advance())
	assert(session.at_choice_gate() and not session.advance(), "Meeting choice checkpoint was skipped")
	await process_frame
	assert(screen.choice_box.visible)
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == EmergencyMeetingScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[2].text.begins_with(EmergencyMeetingScene.data.choiceGate.choices.C[locale].title))
	screen.choice_buttons[2].pressed.emit()
	assert(session.state.storyChoices["meeting-tone"] == "C")
	assert(session.current_line().id == "VN0264" and session.state.readLines.has("VN0262") and session.state.readLines.has("VN0263"))
	while session.current_line().id != "VN0270":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_04_EMERGENCY_MEETING")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_04_EMERGENCY_MEETING")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT", "M3_04_EMERGENCY_MEETING"])
	assert(session.complete_match3("M3_04_EMERGENCY_MEETING"))
	assert(session.state.scene == 10 and session.current_line().id == "VN0272")
	assert(session.state.completed == [0, 1, 2, 3, 4] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003", "CUE_004", "CUE_005"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == session.scene_data().titles.en)
	while session.current_line().id != "VN0288":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 11 and session.current_line().id == "VN0290")
	assert(session.state.readLines.has("VN0289"), "Basketball chapter opening direction was not consumed")
	while session.current_line().id != "VN0308":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_05_BASKETBALL_LOCKERS")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_05_BASKETBALL_LOCKERS")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT", "M3_04_EMERGENCY_MEETING", "M3_05_BASKETBALL_LOCKERS"])
	assert(session.complete_match3("M3_05_BASKETBALL_LOCKERS"))
	assert(session.state.scene == 12 and session.current_line().id == "VN0310")
	assert(session.state.completed == [0, 1, 2, 3, 4, 5] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003", "CUE_004", "CUE_005", "CUE_006"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == session.scene_data().titles.en)
	while session.current_line().id != "VN0326":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 13 and session.current_line().id == "VN0328")
	assert(session.state.readLines.has("VN0327"), "Workshop opening direction was not consumed")
	while session.current_line().id != "VN0347":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_06_TEXTILE_WORKSHOP")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_06_TEXTILE_WORKSHOP")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT", "M3_04_EMERGENCY_MEETING", "M3_05_BASKETBALL_LOCKERS", "M3_06_TEXTILE_WORKSHOP"])
	assert(session.complete_match3("M3_06_TEXTILE_WORKSHOP"))
	assert(session.state.scene == 14 and session.current_line().id == "VN0349")
	assert(session.state.completed == [0, 1, 2, 3, 4, 5, 6] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003", "CUE_004", "CUE_005", "CUE_006", "CUE_007"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	while session.current_line().id != "VN0356":
		assert(session.advance())
	assert(session.at_choice_gate() and not session.advance(), "Hinata apology checkpoint was skipped")
	await process_frame
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == PostTextileWorkshopScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[0].text.begins_with(PostTextileWorkshopScene.data.choiceGate.choices.A[locale].title))
	screen.choice_buttons[0].pressed.emit()
	assert(session.state.storyChoices["apology-to-hinata"] == "A")
	assert(session.current_line().id == "VN0358" and session.state.readLines.has("VN0356") and session.state.readLines.has("VN0357"))
	var restored_choice := Session.new(session.store)
	restored_choice.reload()
	assert(restored_choice.current_line().id == "VN0358" and restored_choice.state.storyChoices["apology-to-hinata"] == "A")
	while session.current_line().id != "VN0369":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 15 and session.current_line().id == "VN0371")
	assert(session.state.readLines.has("VN0370"), "Asterion lab opening direction was not consumed")
	assert(screen.title.text == AsterionLabScene.data.titles.en)
	while session.current_line().id != "VN0390":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_07_ASTERION_THREAD")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_07_ASTERION_THREAD")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT", "M3_04_EMERGENCY_MEETING", "M3_05_BASKETBALL_LOCKERS", "M3_06_TEXTILE_WORKSHOP", "M3_07_ASTERION_THREAD"])
	assert(session.complete_match3("M3_07_ASTERION_THREAD"))
	assert(session.state.scene == 16 and session.current_line().id == "VN0392")
	assert(session.state.completed == [0, 1, 2, 3, 4, 5, 6, 7] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003", "CUE_004", "CUE_005", "CUE_006", "CUE_007", "CUE_008"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostAsterionLabScene.data.titles.en)
	while session.current_line().id != "VN0409":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 17 and session.current_line().id == "VN0411")
	assert(session.state.readLines.has("VN0410"), "Lost-and-found opening direction was not consumed")
	assert(screen.title.text == LostFoundScene.data.titles.en)
	while session.current_line().id != "VN0429":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_08_LOST_FOUND_LEDGER")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_08_LOST_FOUND_LEDGER")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT", "M3_04_EMERGENCY_MEETING", "M3_05_BASKETBALL_LOCKERS", "M3_06_TEXTILE_WORKSHOP", "M3_07_ASTERION_THREAD", "M3_08_LOST_FOUND_LEDGER"])
	assert(session.complete_match3("M3_08_LOST_FOUND_LEDGER"))
	assert(session.state.scene == 18 and session.current_line().id == "VN0431")
	assert(session.state.completed == [0, 1, 2, 3, 4, 5, 6, 7, 8] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003", "CUE_004", "CUE_005", "CUE_006", "CUE_007", "CUE_008", "CUE_009"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostLostFoundScene.data.titles.en)
	while session.current_line().id != "VN0448":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 19 and session.current_line().id == "VN0450")
	assert(session.state.readLines.has("VN0449"), "Maintenance-room opening direction was not consumed")
	assert(screen.title.text == MaintenanceKeysScene.data.titles.en)
	while session.current_line().id != "VN0469":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_09_MAINTENANCE_KEYS")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_09_MAINTENANCE_KEYS")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT", "M3_04_EMERGENCY_MEETING", "M3_05_BASKETBALL_LOCKERS", "M3_06_TEXTILE_WORKSHOP", "M3_07_ASTERION_THREAD", "M3_08_LOST_FOUND_LEDGER", "M3_09_MAINTENANCE_KEYS"])
	assert(session.complete_match3("M3_09_MAINTENANCE_KEYS"))
	assert(session.state.scene == 20 and session.current_line().id == "VN0471")
	assert(session.state.completed == [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] and session.state.clues == ["CUE_001", "CUE_002", "CUE_003", "CUE_004", "CUE_005", "CUE_006", "CUE_007", "CUE_008", "CUE_009", "CUE_010"])
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostMaintenanceKeysScene.data.titles.en)
	while session.current_line().id != "VN0480":
		assert(session.advance())
	assert(session.at_choice_gate() and not session.advance(), "Gen source checkpoint was skipped")
	await process_frame
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == PostMaintenanceKeysScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[1].text.begins_with(PostMaintenanceKeysScene.data.choiceGate.choices.B[locale].title))
	screen.choice_buttons[1].pressed.emit()
	assert(session.state.storyChoices["protect-gen-source"] == "B")
	assert(session.current_line().id == "VN0482" and session.state.readLines.has("VN0480") and session.state.readLines.has("VN0481"))
	var restored_protect_gen := Session.new(session.store)
	restored_protect_gen.reload()
	assert(restored_protect_gen.current_line().id == "VN0482" and restored_protect_gen.state.storyChoices["protect-gen-source"] == "B")
	while session.current_line().id != "VN0488":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 21 and session.current_line().id == "VN0490")
	assert(session.state.readLines.has("VN0489"), "Control-sample opening direction was not consumed")
	assert(screen.title.text == ControlSampleGearScene.data.titles.en)
	while session.current_line().id != "VN0508":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_10_CONTROL_SAMPLE_GEAR")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_10_CONTROL_SAMPLE_GEAR")
	assert(reached_levels == ["M3_00_LOCKER_TUTORIAL", "M3_01_PHOTO_PROPS", "M3_02_POOL_LAUNDRY", "M3_03_ORDERED_APARTMENT", "M3_04_EMERGENCY_MEETING", "M3_05_BASKETBALL_LOCKERS", "M3_06_TEXTILE_WORKSHOP", "M3_07_ASTERION_THREAD", "M3_08_LOST_FOUND_LEDGER", "M3_09_MAINTENANCE_KEYS", "M3_10_CONTROL_SAMPLE_GEAR"])
	assert(session.complete_match3("M3_10_CONTROL_SAMPLE_GEAR"))
	assert(session.state.scene == 22 and session.current_line().id == "VN0510")
	assert(session.state.completed.size() == 11 and session.state.clues[-1] == "CUE_011")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostControlSampleGearScene.data.titles.en)
	while session.current_line().id != "VN0527":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 23 and session.current_line().id == "VN0529")
	assert(session.state.readLines.has("VN0528"), "Asterion transfer opening direction was not consumed")
	assert(screen.title.text == AsterionTransferScene.data.titles.en)
	while session.current_line().id != "VN0547":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_11_ASTERION_TRANSFER")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_11_ASTERION_TRANSFER")
	assert(reached_levels.size() == 12 and reached_levels[-1] == "M3_11_ASTERION_TRANSFER")
	assert(session.complete_match3("M3_11_ASTERION_TRANSFER"))
	assert(session.state.scene == 24 and session.current_line().id == "VN0549")
	assert(session.state.completed.size() == 12 and session.state.clues[-1] == "CUE_012")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostAsterionTransferScene.data.titles.en)
	while session.current_line().id != "VN0560":
		assert(session.advance(), "Stopped at %s in scene %d" % [session.current_line().id, session.state.scene])
	assert(session.at_choice_gate() and not session.advance(), "Photo-permission checkpoint was skipped")
	await process_frame
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == PostAsterionTransferScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[1].text.begins_with(PostAsterionTransferScene.data.choiceGate.choices.B[locale].title))
	screen.choice_buttons[1].pressed.emit()
	assert(session.state.storyChoices["photo-permission"] == "B")
	assert(session.current_line().id == "VN0562" and session.state.readLines.has("VN0560") and session.state.readLines.has("VN0561"))
	var restored_photo_permission := Session.new(session.store)
	restored_photo_permission.reload()
	assert(restored_photo_permission.current_line().id == "VN0562" and restored_photo_permission.state.storyChoices["photo-permission"] == "B")
	while session.current_line().id != "VN0567":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 25 and session.current_line().id == "VN0569")
	assert(session.state.readLines.has("VN0568"), "Second-Skin opening direction was not consumed")
	assert(screen.title.text == SecondSkinSignalScene.data.titles.en)
	while session.current_line().id != "VN0588":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_12_SECOND_SKIN_SIGNAL")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_12_SECOND_SKIN_SIGNAL")
	assert(reached_levels.size() == 13 and reached_levels[-1] == "M3_12_SECOND_SKIN_SIGNAL")
	assert(session.complete_match3("M3_12_SECOND_SKIN_SIGNAL"))
	assert(session.state.scene == 26 and session.current_line().id == "VN0590")
	assert(session.state.completed.size() == 13 and session.state.clues[-1] == "CUE_013")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostSecondSkinSignalScene.data.titles.en)
	while session.current_line().id != "VN0601":
		assert(session.advance())
	assert(session.at_choice_gate() and not session.advance(), "Publish-tag checkpoint was skipped")
	await process_frame
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == PostSecondSkinSignalScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[1].text.begins_with(PostSecondSkinSignalScene.data.choiceGate.choices.B[locale].title))
	screen.choice_buttons[1].pressed.emit()
	assert(session.state.storyChoices["publish-tag"] == "B")
	assert(session.current_line().id == "VN0604", "Publish-tag advanced to %s" % session.current_line().id)
	assert(session.state.readLines.has("VN0601") and session.state.readLines.has("VN0602") and session.state.readLines.has("VN0603"))
	var restored_publish_tag := Session.new(session.store)
	restored_publish_tag.reload()
	assert(restored_publish_tag.current_line().id == "VN0604" and restored_publish_tag.state.storyChoices["publish-tag"] == "B")
	while session.current_line().id != "VN0607":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 27 and session.current_line().id == "VN0609")
	assert(session.state.readLines.has("VN0608"), "Kendo-hall opening direction was not consumed")
	assert(screen.title.text == KendoPilotListScene.data.titles.en)
	while session.current_line().id != "VN0627":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_13_KENDO_PILOT_LIST")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_13_KENDO_PILOT_LIST")
	assert(reached_levels.size() == 14 and reached_levels[-1] == "M3_13_KENDO_PILOT_LIST")
	assert(session.complete_match3("M3_13_KENDO_PILOT_LIST"))
	assert(session.state.scene == 28 and session.current_line().id == "VN0629")
	assert(session.state.completed.size() == 14 and session.state.clues[-1] == "CUE_014")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostKendoPilotListScene.data.titles.en)
	while session.current_line().id != "VN0646":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 29 and session.current_line().id == "VN0648")
	assert(session.state.readLines.has("VN0647"), "Atelier opening direction was not consumed")
	assert(screen.title.text == KuboAtelierScene.data.titles.en)
	while session.current_line().id != "VN0666":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_14_KUBO_ATELIER_LEDGER")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_14_KUBO_ATELIER_LEDGER")
	assert(reached_levels.size() == 15 and reached_levels[-1] == "M3_14_KUBO_ATELIER_LEDGER")
	assert(session.complete_match3("M3_14_KUBO_ATELIER_LEDGER"))
	assert(session.state.scene == 30 and session.current_line().id == "VN0668")
	assert(session.state.completed.size() == 15 and session.state.clues[-1] == "CUE_015")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostKuboAtelierScene.data.titles.en)
	while session.current_line().id != "VN0678":
		assert(session.advance())
	assert(session.at_choice_gate() and not session.advance(), "Family-ledger permission checkpoint was skipped")
	await process_frame
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == PostKuboAtelierScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[1].text.begins_with(PostKuboAtelierScene.data.choiceGate.choices.B[locale].title))
	screen.choice_buttons[1].pressed.emit()
	assert(session.state.storyChoices["family-ledger-permission"] == "B")
	assert(session.current_line().id == "VN0680", "Family-ledger choice did not skip the hidden post-choice direction")
	assert(session.state.readLines.has("VN0678") and session.state.readLines.has("VN0679"))
	var restored_family_permission := Session.new(session.store)
	restored_family_permission.reload()
	assert(restored_family_permission.current_line().id == "VN0680" and restored_family_permission.state.storyChoices["family-ledger-permission"] == "B")
	while session.current_line().id != "VN0686":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 31 and session.current_line().id == "VN0688")
	assert(session.state.readLines.has("VN0687"), "Campus-chase opening direction was not consumed")
	assert(screen.title.text == AbandonedLaundryScene.data.titles.en)
	while session.current_line().id != "VN0707":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_15_ABANDONED_LAUNDRY_ROUTE")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_15_ABANDONED_LAUNDRY_ROUTE")
	assert(reached_levels.size() == 16 and reached_levels[-1] == "M3_15_ABANDONED_LAUNDRY_ROUTE")
	assert(session.complete_match3("M3_15_ABANDONED_LAUNDRY_ROUTE"))
	assert(session.state.scene == 32 and session.current_line().id == "VN0709")
	assert(session.state.completed.size() == 16 and session.state.clues[-1] == "CUE_016")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostAbandonedLaundryScene.data.titles.en)
	while session.current_line().id != "VN0726":
		assert(session.advance())
	assert(not session.at_port_boundary() and session.advance())
	assert(session.state.scene == 33 and session.current_line().id == "VN0728")
	assert(session.state.readLines.has("VN0727"), "Gymnastics-hall opening direction was not consumed")
	assert(screen.title.text == PinkRibbonScannerScene.data.titles.en)
	while session.current_line().id != "VN0746":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_16_PINK_RIBBON_SCANNER")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_16_PINK_RIBBON_SCANNER")
	assert(reached_levels.size() == 17 and reached_levels[-1] == "M3_16_PINK_RIBBON_SCANNER")
	assert(session.complete_match3("M3_16_PINK_RIBBON_SCANNER"))
	assert(session.state.scene == 34 and session.current_line().id == "VN0748")
	assert(session.state.completed.size() == 17 and session.state.clues[-1] == "CUE_017")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostPinkRibbonScannerScene.data.titles.en)
	while session.current_line().id != "VN0756":
		assert(session.advance())
	assert(session.at_choice_gate() and not session.advance(), "Trust-vincent checkpoint was skipped")
	await process_frame
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == PostPinkRibbonScannerScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[1].text.begins_with(PostPinkRibbonScannerScene.data.choiceGate.choices.B[locale].title))
	screen.choice_buttons[1].pressed.emit()
	assert(session.state.storyChoices["trust-vincent"] == "B")
	assert(session.current_line().id == "VN0757", "Trust choice did not resume on its authored follow-up line")
	assert(session.state.readLines.has("VN0756") and not session.state.readLines.has("VN0757"))
	var restored_trust_vincent := Session.new(session.store)
	restored_trust_vincent.reload()
	assert(restored_trust_vincent.current_line().id == "VN0757" and restored_trust_vincent.state.storyChoices["trust-vincent"] == "B")
	while session.current_line().id != "VN0765":
		assert(session.advance())
	assert(session.state.scene == 34 and session.current_line().id == "VN0765")
	assert(session.advance())
	assert(session.state.scene == 35 and session.current_line().id == "VN0767")
	assert(session.state.readLines.has("VN0766"), "Archive opening direction was not consumed")
	assert(screen.title.text == RinaArchiveCatalogScene.data.titles.en)
	while session.current_line().id != "VN0785":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_17_RINA_ARCHIVE_CATALOG")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_17_RINA_ARCHIVE_CATALOG")
	assert(reached_levels.size() == 18 and reached_levels[-1] == "M3_17_RINA_ARCHIVE_CATALOG")
	assert(session.complete_match3("M3_17_RINA_ARCHIVE_CATALOG"))
	assert(session.state.scene == 36 and session.current_line().id == "VN0787")
	assert(session.state.completed.size() == 18 and session.state.clues[-1] == "CUE_018")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostRinaArchiveCatalogScene.data.titles.en)
	while session.current_line().id != "VN0805":
		assert(session.advance())
	assert(session.state.scene == 36 and session.current_line().id == "VN0805")
	assert(session.advance())
	assert(session.state.scene == 37 and session.current_line().id == "VN0807")
	assert(session.state.readLines.has("VN0806"), "Episode 18 opening direction was not consumed")
	assert(screen.title.text == FullTimelineProofScene.data.titles.en)
	while session.current_line().id != "VN0826":
		assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_18_FULL_TIMELINE_PROOF")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_18_FULL_TIMELINE_PROOF")
	assert(reached_levels.size() == 19 and reached_levels[-1] == "M3_18_FULL_TIMELINE_PROOF")
	assert(session.complete_match3("M3_18_FULL_TIMELINE_PROOF"))
	assert(session.state.scene == 38 and session.current_line().id == "VN0828")
	assert(session.state.completed.size() == 19 and session.state.clues[-1] == "CUE_019")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostFullTimelineProofScene.data.titles.en)
	while session.current_line().id != "VN0841":
		assert(session.advance())
	assert(session.at_choice_gate() and not session.advance(), "Final-strategy checkpoint was skipped")
	await process_frame
	for locale in ["ru", "be", "en"]:
		assert(menu.preferences.set_locale(locale) == OK)
		assert(screen.choice_prompt.text == PostFullTimelineProofScene.data.choiceGate.prompt[locale])
		assert(screen.choice_buttons[1].text.begins_with(PostFullTimelineProofScene.data.choiceGate.choices.B[locale].title))
	screen.choice_buttons[0].pressed.emit()
	assert(session.state.storyChoices["final-strategy"] == "A" and session.current_line().id == "VN0842")
	var restored_final_strategy := Session.new(session.store)
	restored_final_strategy.reload()
	assert(restored_final_strategy.current_line().id == "VN0842" and restored_final_strategy.state.storyChoices["final-strategy"] == "A")
	while session.current_line().id != "VN0845":
		assert(session.advance())
	assert(not session.at_port_boundary(), "Selected A route should be connected to the first ending scenes")
	assert(session.scene_data().branchChoiceId == "final-strategy")
	var final_routes: Dictionary = session.scene_data().nextSceneIndices
	assert(final_routes.get("A", -1) == 39 and final_routes.get("B", -1) == 41 and final_routes.get("C", -1) == 43)
	assert(session.state.scene == 38 and session.state.storyChoices["final-strategy"] == "A")
	while session.current_line().id != "VN0845": assert(session.advance())
	assert(session.advance() and session.state.scene == 39 and session.current_line().id == "VN0847")
	assert(screen.title.text == PrivateReturnScene.data.titles.en)
	while session.current_line().id != "VN0865": assert(session.advance())
	assert(session.at_match3_gate() and session.scene_data().nextLevelId == "M3_19_PRIVATE_RETURN")
	await process_frame
	assert(menu.match3_screen != null and menu.match3_screen.level_id == "M3_19_PRIVATE_RETURN")
	assert(reached_levels.size() == 20 and reached_levels[-1] == "M3_19_PRIVATE_RETURN")
	assert(session.complete_match3("M3_19_PRIVATE_RETURN"))
	assert(session.state.scene == 40 and session.current_line().id == "VN0867")
	assert(session.state.completed.size() == 20 and session.state.clues[-1] == "CUE_020")
	menu.match3_screen.game.state = "won"
	menu.match3_screen._refresh()
	assert(menu.match3_screen.evidence_transition_title.text == menu.match3_screen.level_data.evidence.localized.en.title)
	menu.match3_screen.evidence_transition_continue.pressed.emit()
	await process_frame
	assert(menu.match3_screen == null and screen.visible)
	assert(screen.title.text == PostPrivateReturnScene.data.titles.en)
	while session.current_line().id != "VN0884": assert(session.advance())
	assert(not session.at_port_boundary())
	assert(session.advance() and session.ending_result().endingId == "ENDING_B_CASE_CLOSED")
	assert(screen.ending_panel.visible and screen.ending_heading.text == "The Thief Is Caught")
	var restored_ending_route := Session.new(session.store)
	restored_ending_route.reload()
	assert(restored_ending_route.ending_result().endingId == "ENDING_B_CASE_CLOSED")
	screen.menu_button.pressed.emit()
	var raw: String = session.store.storage.get_item(Format.CONTRACT.data.storyKey)
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	assert(menu.confirmation.visible)
	assert(session.store.storage.get_item(Format.CONTRACT.data.storyKey) == raw)
	menu.confirmation.hide()
	menu.confirmation.canceled.emit()
	assert(session.state.scene == 40 and session.ending_result().endingId == "ENDING_B_CASE_CLOSED")
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	menu.confirmation.hide()
	menu.confirmation.confirmed.emit()
	assert(session.current_line().id == "VN0001" and session.state.scene == 0 and session.state.readLines.is_empty())
	# An unsuccessful write keeps in-memory progress and tells the player.
	session.store.storage.fail_write = true
	assert(session.advance())
	assert(menu.get_node("StoryScreen").warning.visible)
	menu.get_node("StoryScreen").menu_button.pressed.emit()
	assert(not menu.get_node("Content/Actions/Continue").disabled and menu.status.visible)
	menu.get_node("Content/Actions/Continue").pressed.emit()
	assert(session.current_line().id == "VN0002")
	menu.match3_session.save.completed.append("M3_01")
	menu.match3_session.persist()
	var active_story: Control = menu.get_node("StoryScreen")
	active_story.case_button.pressed.emit()
	active_story.overlay.find_child("ResetDossierProgress", true, false).pressed.emit()
	assert(not menu.has_node("StoryScreen") and menu.get_node("Content/Actions/Continue").disabled,
		"Dossier reset should clear story progress and return to the main menu")
	assert(menu.match3_session.save.completed.is_empty(), "Dossier reset should clear standalone Match-3 progress too")
	menu.queue_free()
	await process_frame
	DirAccess.remove_absolute(preferences_path)
	_unsupported_save()
	_future_save()
	_choice_routes()
	_final_strategy_routes()
	await _full_truth_outcomes()
	await _perfect_suspect_ending()
	var hidden_session := Memory.story_session()
	assert(hidden_session.store.save_story({"scene": 0, "line": 20}))
	hidden_session.reload()
	assert(hidden_session.resume() and hidden_session.current_line().id == "VN0022")
	assert(hidden_session.state.readLines.has("VN0021"))
	await process_frame
	print("UPDS Godot VN prologue smoke test passed.")
	quit()


func _vn_reading_controls(menu: Control) -> void:
	var session := Memory.story_session()
	session.state.line = 2
	assert(session.resume() and session.current_line().id == "VN0003")
	var screen = load("res://scripts/vn_screen.gd").new()
	screen.session = session
	screen.preferences = menu.preferences
	screen.audio_runtime = menu.audio_runtime
	root.add_child(screen)
	await process_frame
	assert(screen.controls_panel.visible and screen.skip_button.disabled)
	assert(screen.case_button.visible and screen.history_button.visible and screen.settings_button.visible,
		"VN chrome should expose dossier, history, and settings actions in the source header layout")
	assert(is_equal_approx(screen.get_node("HeaderBackground").offset_bottom, 60.0),
		"VN header should match the 60px source chrome")
	assert(screen.nameplate.get_parent() == screen and screen.nameplate.position.y < screen.dialogue_panel.position.y,
		"VN speaker nameplate should overlap the dialogue card's top edge like the source")
	assert(screen._dialogue_pages.size() > 1 and screen.page_progress.get_child_count() == screen._dialogue_pages.size() + 1,
		"Long dialogue must show one progress dot per page and the animated advance cue")
	var advance_cue: Label = screen.page_progress.get_child(screen.page_progress.get_child_count() - 1)
	assert(advance_cue.text == "▼" and advance_cue.pivot_offset == Vector2.ZERO,
		"The source advance cue should be a non-scaling down-arrow")
	await create_timer(0.56).timeout
	assert(absf(advance_cue.offset_top - 3.0) < 0.5 and absf(advance_cue.modulate.a - 0.45) < 0.08,
		"Advance cue should reach the source 3px down and 0.45 opacity midpoint")
	var return_wait := 0.0
	while (absf(advance_cue.offset_top) > 0.1 or absf(advance_cue.modulate.a - 1.0) > 0.02) and return_wait < 2.0:
		await create_timer(0.05).timeout
		return_wait += 0.05
	assert(absf(advance_cue.offset_top) <= 0.1 and absf(advance_cue.modulate.a - 1.0) <= 0.02,
		"Advance cue should return to its source position and opacity")
	screen.next_button.pressed.emit()
	assert(screen._dialogue_page_index == 1 and session.current_line().id == "VN0003")
	screen.auto_button.pressed.emit()
	assert(screen._auto_mode, "Auto should turn on from the reading controls")
	screen.auto_button.pressed.emit()
	assert(not screen._auto_mode, "Auto should turn off from the reading controls")
	screen.load_button.pressed.emit()
	assert(screen.status.visible and screen.status_label.text == Copy.text("vn_empty_slot", menu.preferences.locale),
		"An empty manual slot should show the localized source status")
	screen.save_button.pressed.emit()
	assert(screen.status.visible and session.store.load_manual().line == 2,
		"Manual save should persist the current story position and show confirmation")
	session.state.line = 3
	assert(session.resume() and session.current_line().id == "VN0004")
	screen.load_button.pressed.emit()
	assert(session.current_line().id == "VN0003", "Manual load should restore its saved story position")
	session.state.readLines.append("VN0003")
	session.state.readLines.append("VN0004")
	screen._refresh()
	assert(not screen.skip_button.disabled)
	screen.skip_button.pressed.emit()
	assert(session.current_line().id == "VN0005", "Skip should stop on the first unread story line")
	screen.case_button.pressed.emit()
	assert(screen.overlay_title.text == Copy.text("dossier_title", menu.preferences.locale))
	assert(screen.dossier_clues.get_child_count() == 22, "The dossier should render all campaign clue cards")
	screen._select_dossier_tab("theories")
	assert(screen.dossier_theories.visible and not screen.dossier_clues.visible)
	screen._close_overlay()
	screen.history_button.pressed.emit()
	assert(screen.overlay_title.text == Copy.text("vn_history", menu.preferences.locale))
	assert(screen.overlay_body.get_child_count() >= 3, "Dialogue history should include read lines and the current line")
	screen._close_overlay()
	screen.settings_button.pressed.emit()
	assert(screen.overlay.find_child("Audio_musicVolume", true, false) != null)
	assert(screen.overlay.find_child("VnMainMenu", true, false) != null)
	screen.config_speed_buttons.fast.pressed.emit()
	assert(screen._auto_speed == "fast", "Reading configuration should change AUTO speed")
	assert(is_equal_approx(screen._auto_delay_for_text(28), 1750.0))
	screen._select_auto_speed("slow", false)
	assert(is_equal_approx(screen._auto_delay_for_text(28), 3400.0))
	screen._select_auto_speed("normal", false)
	assert(is_equal_approx(screen._auto_delay_for_text(60), 3076.0),
		"AUTO delay should match the source base speed and text-length allowance")
	screen.config_text_buttons.large.pressed.emit()
	assert(screen._text_scale == "large" and screen.dialogue.get_theme_font_size("normal_font_size") == 19,
		"Reading configuration should apply the large dialogue text size")
	var music_slider: HSlider = screen.overlay.find_child("Audio_musicVolume", true, false).get_node("Slider")
	music_slider.value = 63
	assert(is_equal_approx(menu.preferences.audio.musicVolume, 0.63),
		"Reading configuration should apply audio settings through shared preferences")
	var mute_button: Button = screen.overlay.find_child("MuteAudio", true, false)
	mute_button.toggled.emit(true)
	assert(menu.preferences.audio.muted)
	mute_button.toggled.emit(false)
	assert(not menu.preferences.audio.muted, "Audio toggle should update the shared preference and restore it")
	screen._close_overlay()
	screen.case_button.pressed.emit()
	_test_dossier_reset_requested = false
	_test_menu_requested = false
	screen.progress_reset_requested.connect(_record_dossier_reset)
	screen.menu_requested.connect(_record_menu_request)
	screen.overlay.find_child("ResetDossierProgress", true, false).pressed.emit()
	assert(_test_dossier_reset_requested and _test_menu_requested,
		"Resetting dossier progress should emit both reset and return-to-menu actions")
	screen.queue_free()
	await process_frame


func _record_dossier_reset() -> void:
	_test_dossier_reset_requested = true


func _record_menu_request() -> void:
	_test_menu_requested = true


func _unsupported_save() -> void:
	var memory := Memory.new()
	var store := Store.new(memory)
	assert(store.save_story({"scene": 44, "line": 999, "completed": [1]}))
	var raw: String = memory.get_item(Format.CONTRACT.data.storyKey)
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Session.new(store)
	root.add_child(menu)
	assert(menu.get_node("Content/Actions/Continue").disabled and menu.status.visible)
	menu.get_node("Content/Actions/Continue").pressed.emit()
	assert(not menu.has_node("StoryScreen"))
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	assert(menu.confirmation.visible and memory.get_item(Format.CONTRACT.data.storyKey) == raw)
	menu.confirmation.hide()
	menu.queue_free()


func _future_save() -> void:
	var memory := Memory.new()
	var raw := '{"schemaVersion":99,"scene":45,"line":3}'
	assert(memory.set_item(Format.CONTRACT.data.storyKey, raw))
	var menu: Control = load("res://scenes/main_menu.tscn").instantiate()
	menu.session = Session.new(Store.new(memory))
	root.add_child(menu)
	assert(menu.get_node("Content/Actions/Continue").disabled and menu.status.visible)
	menu.get_node("Content/Actions/NewGame").pressed.emit()
	assert(menu.confirmation.visible)
	assert(memory.get_item(Format.CONTRACT.data.storyKey) == raw)
	menu.confirmation.hide()
	menu.queue_free()


func _choice_routes() -> void:
	for option in ["A", "B", "C"]:
		var session := Memory.story_session()
		session.state.scene = 1
		session.state.choice = "A"
		session.state.line = LockerScene.data.variants.A.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0040")
		assert(session.choose(option), "CHOICE_00 option %s was rejected" % option)
		assert(session.current_line().id == "VN0041" + option)
		assert(session.state.choice == option and session.state.readLines == ["VN0040"])
		session.reload()
		assert(session.current_line().id == "VN0041" + option, "CHOICE_00 option %s did not resume" % option)
	for option in ["A", "B", "C"]:
		var session := Memory.story_session()
		session.state.scene = 14
		session.state.line = PostTextileWorkshopScene.data.lines.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0356")
		assert(session.at_choice_gate() and not session.advance(), "Apology checkpoint was not guarded")
		assert(session.choose(option), "Apology option %s was rejected" % option)
		assert(session.state.storyChoices["apology-to-hinata"] == option)
		assert(session.current_line().id == "VN0358")
		assert(session.state.readLines.has("VN0356") and session.state.readLines.has("VN0357"))
		session.reload()
		assert(session.current_line().id == "VN0358" and session.state.storyChoices["apology-to-hinata"] == option)
	for option in ["A", "B", "C"]:
		var choice_session := Memory.story_session()
		choice_session.state.scene = 20
		choice_session.state.line = PostMaintenanceKeysScene.data.lines.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0480")
		assert(choice_session.at_choice_gate() and not choice_session.advance(), "Gen source checkpoint was not guarded")
		assert(choice_session.choose(option), "Gen source option %s was rejected" % option)
		assert(choice_session.state.storyChoices["protect-gen-source"] == option)
		assert(choice_session.current_line().id == "VN0482")
		assert(choice_session.state.readLines.has("VN0480") and choice_session.state.readLines.has("VN0481"))
		choice_session.reload()
		assert(choice_session.current_line().id == "VN0482" and choice_session.state.storyChoices["protect-gen-source"] == option)
	for option in ["A", "B", "C"]:
		var choice_session := Memory.story_session()
		choice_session.state.scene = 24
		choice_session.state.line = PostAsterionTransferScene.data.lines.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0560")
		assert(choice_session.at_choice_gate() and not choice_session.advance(), "Photo-permission checkpoint was not guarded")
		assert(choice_session.choose(option), "Photo-permission option %s was rejected" % option)
		assert(choice_session.state.storyChoices["photo-permission"] == option)
		assert(choice_session.current_line().id == "VN0562")
		assert(choice_session.state.readLines.has("VN0560") and choice_session.state.readLines.has("VN0561"))
		choice_session.reload()
		assert(choice_session.current_line().id == "VN0562" and choice_session.state.storyChoices["photo-permission"] == option)
	for option in ["A", "B", "C"]:
		var choice_session := Memory.story_session()
		choice_session.state.scene = 26
		choice_session.state.line = PostSecondSkinSignalScene.data.lines.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0601")
		assert(choice_session.at_choice_gate() and not choice_session.advance(), "Publish-tag checkpoint was not guarded")
		assert(choice_session.choose(option), "Publish-tag option %s was rejected" % option)
		assert(choice_session.state.storyChoices["publish-tag"] == option)
		assert(choice_session.current_line().id == "VN0604")
		assert(choice_session.state.readLines.has("VN0601") and choice_session.state.readLines.has("VN0602") and choice_session.state.readLines.has("VN0603"))
		choice_session.reload()
		assert(choice_session.current_line().id == "VN0604" and choice_session.state.storyChoices["publish-tag"] == option)
	for option in ["A", "B", "C"]:
		var choice_session := Memory.story_session()
		choice_session.state.scene = 30
		choice_session.state.line = PostKuboAtelierScene.data.lines.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0678")
		assert(choice_session.at_choice_gate() and not choice_session.advance(), "Family-ledger permission checkpoint was not guarded")
		assert(choice_session.choose(option), "Family-ledger permission option %s was rejected" % option)
		assert(choice_session.state.storyChoices["family-ledger-permission"] == option)
		assert(choice_session.current_line().id == "VN0680")
		assert(choice_session.state.readLines.has("VN0678") and choice_session.state.readLines.has("VN0679"))
		choice_session.reload()
		assert(choice_session.current_line().id == "VN0680" and choice_session.state.storyChoices["family-ledger-permission"] == option)
	for option in ["A", "B", "C"]:
		var choice_session := Memory.story_session()
		choice_session.state.scene = 34
		choice_session.state.line = PostPinkRibbonScannerScene.data.lines.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0756")
		assert(choice_session.at_choice_gate() and not choice_session.advance(), "Trust-vincent checkpoint was not guarded")
		assert(choice_session.choose(option), "Trust-vincent option %s was rejected" % option)
		assert(choice_session.state.storyChoices["trust-vincent"] == option)
		assert(choice_session.current_line().id == "VN0757")
		assert(choice_session.state.readLines.has("VN0756") and not choice_session.state.readLines.has("VN0757"))
		choice_session.reload()
		assert(choice_session.current_line().id == "VN0757" and choice_session.state.storyChoices["trust-vincent"] == option)


func _final_strategy_routes() -> void:
	var expected_routes := {"A": 39, "B": 41, "C": 43}
	for option in ["A", "B", "C"]:
		var session := Memory.story_session()
		session.state.scene = 38
		session.state.line = PostFullTimelineProofScene.data.lines.find_custom(func(line: Dictionary) -> bool: return line.id == "VN0841")
		assert(session.at_choice_gate() and not session.advance(), "Final-strategy checkpoint was not guarded")
		assert(session.choose(option), "Final-strategy option %s was rejected" % option)
		assert(session.state.storyChoices["final-strategy"] == option and session.current_line().id == "VN0842")
		session.reload()
		assert(session.current_line().id == "VN0842" and session.state.storyChoices["final-strategy"] == option)
		while session.current_line().id != "VN0845":
			assert(session.advance())
		var routes: Dictionary = session.scene_data().get("nextSceneIndices", {})
		assert(routes.get(option, -1) == expected_routes[option], "Final-strategy option %s lost its route: scene=%s routes=%s" % [option, session.state.scene, routes])
		assert(not session.at_port_boundary() and session.advance() and session.state.scene == expected_routes[option])


func _full_truth_outcomes() -> void:
	var success := Memory.story_session()
	success.state.scene = 42
	success.state.line = PostFullTruthScene.data.lines.size() - 1
	success.state.choice = "A"
	success.state.clues = ["CUE_010", "CUE_011", "CUE_012", "CUE_013", "CUE_014", "CUE_015", "CUE_016", "CUE_017", "CUE_018", "CUE_019"]
	success.state.storyChoices = {
		"final-strategy": "B", "meeting-tone": "A", "apology-to-hinata": "C",
		"protect-gen-source": "A", "photo-permission": "A", "family-ledger-permission": "A", "trust-vincent": "A",
	}
	assert(success.advance())
	var full_truth: Dictionary = success.ending_result()
	assert(full_truth.endingId == "ENDING_A_FULL_TRUTH")
	assert(full_truth.metrics == {"evidence": 10, "teamTrust": 3, "sourceTrust": 4})
	var preferences_path := "user://ending_smoke_%s.cfg" % Time.get_ticks_usec()
	var result_screen = load("res://scripts/vn_screen.gd").new()
	result_screen.session = success
	result_screen.preferences = preload("res://scripts/player_preferences.gd").new(preferences_path)
	result_screen.preferences.set_locale("ru")
	root.add_child(result_screen)
	await process_frame
	assert(result_screen.ending_panel.visible)
	assert(result_screen.ending_heading.text == "Под прачечной")
	assert(result_screen.ending_summary.text.contains("10 / 3 / 4"))
	var restored := Session.new(success.store)
	restored.reload()
	assert(restored.ending_result().endingId == "ENDING_A_FULL_TRUTH")
	result_screen.queue_free()
	await process_frame
	DirAccess.remove_absolute(preferences_path)
	var fallback := Memory.story_session()
	fallback.state.scene = 42
	fallback.state.line = PostFullTruthScene.data.lines.size() - 1
	fallback.state.choice = "B"
	fallback.state.storyChoices = {"final-strategy": "B"}
	assert(fallback.advance())
	var case_closed: Dictionary = fallback.ending_result()
	assert(case_closed.endingId == "ENDING_B_CASE_CLOSED" and case_closed.copyKey == "fallbackCopy")
	assert(case_closed.metrics == {"evidence": 0, "teamTrust": 0, "sourceTrust": 0})


func _perfect_suspect_ending() -> void:
	var session := Memory.story_session()
	session.state.scene = 43
	session.state.line = ConvenientCaseScene.data.lines.size() - 1
	session.state.storyChoices = {"final-strategy": "C"}
	assert(session.at_match3_gate())
	assert(session.scene_data().nextLevelId == "M3_21_CONVENIENT_CASE")
	assert(session.complete_match3("M3_21_CONVENIENT_CASE"))
	assert(session.state.scene == 44 and session.current_line().id == "VN0946")
	assert(session.state.clues.has("CUE_022"))
	var restored_route := Session.new(session.store)
	restored_route.reload()
	assert(restored_route.state.scene == 44 and restored_route.state.clues.has("CUE_022"))
	while session.current_line().id != "VN0964":
		assert(session.advance())
	assert(session.advance())
	var result: Dictionary = session.ending_result()
	assert(result.endingId == "ENDING_C_PERFECT_SUSPECT")
	assert(result.metrics.evidence == 0 and session.state.clues.has("CUE_022"))
	var preferences_path := "user://perfect_suspect_smoke_%s.cfg" % Time.get_ticks_usec()
	var screen = load("res://scripts/vn_screen.gd").new()
	screen.session = session
	screen.preferences = preload("res://scripts/player_preferences.gd").new(preferences_path)
	screen.preferences.set_locale("en")
	root.add_child(screen)
	await process_frame
	assert(screen.ending_panel.visible)
	assert(screen.ending_heading.text == "Fame Instead of Truth")
	assert(screen.ending_summary.text.contains("Give the college a suspect it will accept"))
	var restored_ending := Session.new(session.store)
	restored_ending.reload()
	assert(restored_ending.ending_result().endingId == "ENDING_C_PERFECT_SUSPECT")
	screen.queue_free()
	await process_frame
	DirAccess.remove_absolute(preferences_path)
