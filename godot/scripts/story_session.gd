extends RefCounted

signal changed
signal save_failed

const Store = preload("res://scripts/campaign_store.gd")
const Format = preload("res://scripts/save_format.gd")
const Prologue = preload("res://data/prologue.json")
const LockerScene = preload("res://data/locker_scene.json")
const PostMatchScene = preload("res://data/post_match_scene.json")
const PhotoScene = preload("res://data/photo_scene.json")
const PostPhotoScene = preload("res://data/post_photo_scene.json")
const PoolScene = preload("res://data/pool_scene.json")
const PostPoolScene = preload("res://data/post_pool_scene.json")
const OrderedInspectionScene = preload("res://data/ordered_inspection_scene.json")
const PostOrderedInspectionScene = preload("res://data/post_ordered_inspection_scene.json")
const EmergencyMeetingScene = preload("res://data/emergency_meeting_scene.json")
const PostEmergencyMeetingScene = preload("res://data/post_emergency_meeting_scene.json")
const BasketballLockersScene = preload("res://data/basketball_lockers_scene.json")
const PostBasketballLockersScene = preload("res://data/post_basketball_lockers_scene.json")
const TextileWorkshopScene = preload("res://data/textile_workshop_scene.json")
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
const CampaignData = preload("res://scripts/match3_campaign_data.gd")
const MAX_PORTED_SCENE_INDEX := 30

var store: RefCounted
var state: Dictionary = Format.fresh_story()
var last_write_ok := true
var load_report := {"status": "fresh", "detail": "not-loaded"}


func _init(adapter: RefCounted = null) -> void:
	store = adapter if adapter != null else Store.new()


func reload() -> void:
	state = store.load_story()
	load_report = store.last_load_report.duplicate()
	last_write_ok = true
	changed.emit()


func has_progress() -> bool:
	return state.scene > 0 or state.line > 0 or not state.completed.is_empty()


func supports_position() -> bool:
	return state.scene >= 0 and state.scene <= MAX_PORTED_SCENE_INDEX and state.line >= 0 and state.line < _scene_lines().size()


func new_game() -> void:
	state = Format.fresh_story()
	load_report = {"status": "fresh", "detail": "new-game"}
	persist()
	changed.emit()


func resume() -> bool:
	if not supports_position():
		return false
	_skip_hidden()
	persist()
	changed.emit()
	return true


func current_line() -> Dictionary:
	return _scene_lines()[int(state.line)] if supports_position() else {}


func at_match3_gate() -> bool:
	return supports_position() and not str(scene_data().get("nextLevelId", "")).is_empty() \
		and state.line == _scene_lines().size() - 1


func at_choice_gate() -> bool:
	if not supports_position():
		return false
	if state.scene == 1:
		return current_line().id == "VN0040"
	var gate: Dictionary = scene_data().get("choiceGate", {})
	return not gate.is_empty() and current_line().id == str(gate.get("checkpointLineId", "")) \
		and not state.storyChoices.has(str(gate.get("id", "")))


func at_port_boundary() -> bool:
	var next_scene_index: int = int(scene_data().get("nextSceneIndex", -1))
	return supports_position() and state.line == _scene_lines().size() - 1 and not at_match3_gate() \
		and (next_scene_index < 0 or next_scene_index > MAX_PORTED_SCENE_INDEX)


func complete_match3(level_id: String) -> bool:
	if not at_match3_gate() or level_id != str(scene_data().get("nextLevelId", "")):
		return false
	var level_index: int = Format.CONTRACT.data.levelIds.find(level_id)
	if level_index < 0:
		return false
	var next_scene_index: int = int(scene_data().get("onWinSceneIndex", -1))
	if next_scene_index < 0 or next_scene_index > MAX_PORTED_SCENE_INDEX:
		return false
	if not state.completed.has(level_index):
		state.completed.append(level_index)
	var bundle: Dictionary = CampaignData.load_bundle()
	var level: Dictionary = CampaignData.get_level(bundle, level_id)
	var evidence: Dictionary = level.get("evidence", {})
	var clue_id: String = str(evidence.get("id", ""))
	if not clue_id.is_empty() and not state.clues.has(clue_id):
		state.clues.append(clue_id)
	state.scene = next_scene_index
	state.line = 0
	_skip_hidden()
	persist()
	changed.emit()
	return true


func scene_data() -> Dictionary:
	match state.scene:
		0: return Prologue.data
		1: return LockerScene.data
		2: return PostMatchScene.data
		3: return PhotoScene.data
		4: return PostPhotoScene.data
		5: return PoolScene.data
		6: return PostPoolScene.data
		7: return OrderedInspectionScene.data
		8: return PostOrderedInspectionScene.data
		9: return EmergencyMeetingScene.data
		10: return PostEmergencyMeetingScene.data
		11: return BasketballLockersScene.data
		12: return PostBasketballLockersScene.data
		13: return TextileWorkshopScene.data
		14: return PostTextileWorkshopScene.data
		15: return AsterionLabScene.data
		16: return PostAsterionLabScene.data
		17: return LostFoundScene.data
		18: return PostLostFoundScene.data
		19: return MaintenanceKeysScene.data
		20: return PostMaintenanceKeysScene.data
		21: return ControlSampleGearScene.data
		22: return PostControlSampleGearScene.data
		23: return AsterionTransferScene.data
		24: return PostAsterionTransferScene.data
		25: return SecondSkinSignalScene.data
		26: return PostSecondSkinSignalScene.data
		27: return KendoPilotListScene.data
		28: return PostKendoPilotListScene.data
		29: return KuboAtelierScene.data
		30: return PostKuboAtelierScene.data
	return {}


func choose(option: String) -> bool:
	if not at_choice_gate() or not ["A", "B", "C"].has(option):
		return false
	if state.scene == 1:
		_mark_read()
		state.choice = option
		state.line = _scene_lines().find_custom(func(line: Dictionary) -> bool: return line.id == "VN0041" + option)
		if state.line < 0:
			return false
	else:
		var gate: Dictionary = scene_data().get("choiceGate", {})
		if not gate.get("choices", {}).has(option):
			return false
		_mark_read()
		state.storyChoices[str(gate.id)] = option
		state.line += 1
		_skip_hidden()
	persist()
	changed.emit()
	return true


func advance() -> bool:
	if not supports_position():
		return false
	if at_choice_gate():
		return false
	_mark_read()
	var moved: bool = state.line + 1 < _scene_lines().size()
	if moved:
		state.line += 1
		_skip_hidden()
	elif int(scene_data().get("nextSceneIndex", -1)) >= 0 and int(scene_data().get("nextSceneIndex", -1)) <= MAX_PORTED_SCENE_INDEX:
		state.scene = int(scene_data().nextSceneIndex)
		state.line = 0
		_skip_hidden()
		moved = true
	persist()
	changed.emit()
	return moved


func persist() -> void:
	last_write_ok = store.save_story(state)
	if not last_write_ok:
		save_failed.emit()


func _mark_read() -> void:
	var id: String = current_line().id
	if not state.readLines.has(id):
		state.readLines.append(id)


func _skip_hidden() -> void:
	while supports_position() and current_line().hidden and not at_choice_gate() and state.line + 1 < _scene_lines().size():
		_mark_read()
		state.line += 1
	if supports_position() and current_line().hidden and not at_choice_gate() and state.line == _scene_lines().size() - 1:
		_mark_read()


func _scene_lines() -> Array:
	if state.scene == 0:
		return Prologue.data.lines
	if state.scene == 1:
		return LockerScene.data.variants.get(state.choice, LockerScene.data.variants.A)
	if state.scene == 2:
		return PostMatchScene.data.lines
	if state.scene == 3:
		return PhotoScene.data.lines
	if state.scene == 4:
		return PostPhotoScene.data.lines
	if state.scene == 5:
		return PoolScene.data.lines
	if state.scene == 6:
		return PostPoolScene.data.lines
	if state.scene == 7:
		return OrderedInspectionScene.data.lines
	if state.scene == 8:
		return PostOrderedInspectionScene.data.lines
	if state.scene == 9:
		return EmergencyMeetingScene.data.lines
	if state.scene == 10:
		return PostEmergencyMeetingScene.data.lines
	if state.scene == 11:
		return BasketballLockersScene.data.lines
	if state.scene == 12:
		return PostBasketballLockersScene.data.lines
	if state.scene == 13:
		return TextileWorkshopScene.data.lines
	if state.scene == 14:
		return PostTextileWorkshopScene.data.lines
	if state.scene == 15:
		return AsterionLabScene.data.lines
	if state.scene == 16:
		return PostAsterionLabScene.data.lines
	if state.scene == 17:
		return LostFoundScene.data.lines
	if state.scene == 18:
		return PostLostFoundScene.data.lines
	if state.scene == 19:
		return MaintenanceKeysScene.data.lines
	if state.scene == 20:
		return PostMaintenanceKeysScene.data.lines
	if state.scene == 21:
		return ControlSampleGearScene.data.lines
	if state.scene == 22:
		return PostControlSampleGearScene.data.lines
	if state.scene == 23:
		return AsterionTransferScene.data.lines
	if state.scene == 24:
		return PostAsterionTransferScene.data.lines
	if state.scene == 25:
		return SecondSkinSignalScene.data.lines
	if state.scene == 26:
		return PostSecondSkinSignalScene.data.lines
	if state.scene == 27:
		return KendoPilotListScene.data.lines
	if state.scene == 28:
		return PostKendoPilotListScene.data.lines
	if state.scene == 29:
		return KuboAtelierScene.data.lines
	if state.scene == 30:
		return PostKuboAtelierScene.data.lines
	return []
