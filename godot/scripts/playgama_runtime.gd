extends Node

## Keeps Playgama-specific lifecycle events outside the game screens.

var _game_ready_sent := false
var _platform: Object


func _ready() -> void:
	if not Engine.has_singleton("Bridge") and not get_tree().root.has_node("Bridge"):
		push_warning("Playgama Bridge is unavailable; running without platform lifecycle events.")
		return
	_platform = get_node_or_null("/root/Bridge").platform
	_platform.pause_state_changed.connect(_on_pause_state_changed)
	_platform.audio_state_changed.connect(_on_audio_state_changed)
	_on_audio_state_changed(_platform.is_audio_enabled)
	call_deferred("_send_game_ready")


func _send_game_ready() -> void:
	if _game_ready_sent or _platform == null:
		return
	_game_ready_sent = true
	_platform.send_message(Bridge.PlatformMessage.GAME_READY)


func _on_pause_state_changed(paused: bool) -> void:
	get_tree().paused = paused


func _on_audio_state_changed(enabled: bool) -> void:
	AudioServer.set_bus_mute(AudioServer.get_bus_index("Master"), not enabled)
