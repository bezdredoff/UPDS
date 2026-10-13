extends SceneTree


func _initialize() -> void:
	call_deferred("_run_smoke")


func _run_smoke() -> void:
	var packed_scene: PackedScene = load("res://scenes/port_bootstrap.tscn")
	assert(packed_scene != null, "Bootstrap scene could not be loaded")
	var instance: Control = packed_scene.instantiate()
	root.add_child(instance)
	await process_frame
	var status: Label = instance.get_node("Status")
	assert(status.text.contains("Godot port shell"), "Bootstrap status label is missing")
	print("UPDS Godot bootstrap smoke test passed.")
	quit()
