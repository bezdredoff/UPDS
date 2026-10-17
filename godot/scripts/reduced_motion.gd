extends RefCounted
class_name ReducedMotion


static func is_enabled(override: Variant = null) -> bool:
	if override != null:
		return bool(override)
	if not OS.has_feature("web"):
		return false
	return bool(JavaScriptBridge.eval(
		"typeof window !== 'undefined' && typeof window.matchMedia === 'function' " +
		"&& window.matchMedia('(prefers-reduced-motion: reduce)').matches", true
	))
