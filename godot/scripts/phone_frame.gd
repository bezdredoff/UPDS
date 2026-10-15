extends RefCounted

const MAX_WIDTH := 430.0
const MAX_HEIGHT := 932.0


static func fit(control: Control) -> void:
	_apply(control)
	var viewport := control.get_viewport()
	var control_ref: WeakRef = weakref(control)
	var resize_callback: Callable = func() -> void:
		var current := control_ref.get_ref() as Control
		if is_instance_valid(current):
			_apply(current)
	viewport.size_changed.connect(resize_callback)
	control.tree_exiting.connect(func() -> void:
		if is_instance_valid(viewport) and viewport.size_changed.is_connected(resize_callback):
			viewport.size_changed.disconnect(resize_callback)
	)


static func _apply(control: Control) -> void:
	var parent_size := control.get_parent_area_size()
	var canvas_scale := _canvas_scale(control, parent_size)
	canvas_scale.x = maxf(canvas_scale.x, 0.0001)
	canvas_scale.y = maxf(canvas_scale.y, 0.0001)
	var frame_size := Vector2(
		minf(parent_size.x * canvas_scale.x, MAX_WIDTH),
		minf(parent_size.y * canvas_scale.y, MAX_HEIGHT),
	)
	control.scale = Vector2(1.0 / canvas_scale.x, 1.0 / canvas_scale.y)
	control.anchor_left = 0.5
	control.anchor_right = 0.5
	control.anchor_top = 0.5
	control.anchor_bottom = 0.5
	control.offset_left = -frame_size.x * control.scale.x * 0.5
	control.offset_right = control.offset_left + frame_size.x
	control.offset_top = -frame_size.y * control.scale.y * 0.5
	control.offset_bottom = control.offset_top + frame_size.y


static func _canvas_scale(control: Control, logical_size: Vector2) -> Vector2:
	if not OS.has_feature("web"):
		return Vector2.ONE
	var window_size := Vector2(control.get_window().size)
	return Vector2(
		window_size.x / logical_size.x if not is_zero_approx(logical_size.x) else 1.0,
		window_size.y / logical_size.y if not is_zero_approx(logical_size.y) else 1.0,
	)
