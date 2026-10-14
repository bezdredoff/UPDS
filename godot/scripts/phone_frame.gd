extends RefCounted

const MAX_WIDTH := 430.0


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
	var available_width: float = control.get_parent_area_size().x
	var width: float = minf(available_width, MAX_WIDTH)
	control.anchor_left = 0.5
	control.anchor_right = 0.5
	control.anchor_top = 0.0
	control.anchor_bottom = 1.0
	control.offset_left = -width * 0.5
	control.offset_right = width * 0.5
	control.offset_top = 0.0
	control.offset_bottom = 0.0
