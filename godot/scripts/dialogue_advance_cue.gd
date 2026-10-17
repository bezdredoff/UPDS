extends Control


func _draw() -> void:
	# Font subsets need not contain U+25BC; draw the source's down-triangle directly.
	draw_colored_polygon(PackedVector2Array([Vector2(2, 6), Vector2(11, 6), Vector2(6.5, 13)]), Color("#6d665e"))
