extends SceneTree

const ReducedMotion = preload("res://scripts/reduced_motion.gd")


func _initialize() -> void:
	assert(ReducedMotion.is_enabled(true), "Reduced-motion override did not enable the preference")
	assert(not ReducedMotion.is_enabled(false), "Reduced-motion override did not disable the preference")
	if not Engine.has_singleton("JavaScriptBridge"):
		assert(not ReducedMotion.is_enabled(), "Native builds should default to full motion without a browser preference")
	print("UPDS reduced-motion preference smoke test passed.")
	quit()
