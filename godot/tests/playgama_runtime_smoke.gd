extends SceneTree


func _initialize() -> void:
	_run.call_deferred()


func _run() -> void:
	await process_frame
	assert(root.has_node("Bridge"), "Playgama Bridge autoload is missing")
	assert(root.has_node("PlaygamaRuntime"), "UPDS platform adapter is missing")
	assert(root.get_children().find(root.get_node("Bridge")) < root.get_children().find(root.get_node("PlaygamaRuntime")), "Bridge must initialize before its adapter")
	var runtime := root.get_node("PlaygamaRuntime")
	assert(runtime._game_ready_sent, "Adapter did not send game_ready")
	var platform = root.get_node("Bridge").platform
	platform.pause_state_changed.emit(true)
	assert(paused, "Platform pause did not pause the scene tree")
	platform.pause_state_changed.emit(false)
	assert(not paused, "Platform resume did not resume the scene tree")
	var master := AudioServer.get_bus_index("Master")
	platform.audio_state_changed.emit(false)
	assert(AudioServer.is_bus_mute(master), "Platform audio-off state did not mute audio")
	platform.audio_state_changed.emit(true)
	assert(not AudioServer.is_bus_mute(master), "Platform audio-on state did not restore audio")
	print("UPDS Playgama Bridge smoke test passed.")
	quit()
