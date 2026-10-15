extends RefCounted
class_name ReducedMotion


static func is_enabled(override: Variant = null) -> bool:
	if override != null:
		return bool(override)
	if not Engine.has_singleton("JavaScriptBridge"):
		return false
	var bridge: Object = Engine.get_singleton("JavaScriptBridge")
	var preference: Variant = bridge.call(
		"eval",
		"typeof window !== 'undefined' && typeof window.matchMedia === 'function' " +
		"&& window.matchMedia('(prefers-reduced-motion: reduce)').matches"
	)
	return preference is bool and preference
