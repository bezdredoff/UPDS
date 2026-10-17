extends Control

# CSS line boxes can be shorter than a fallback font's native ascent/descent.
# Draw shaped words inside explicit line boxes instead of expanding the card.
var text := ""
var font: Font
var bold_font: Font
var font_size := 16
var line_height := 23.2
var colour := Color("#29243d")
var tracking := 0.0
var shadow_colour := Color.TRANSPARENT
var shadow_offset := Vector2.ZERO
var centred := true
var css_font := ""
var css_bold_font := ""
var _segments: Array = []
var _lines: Array = []


func set_text(value: String) -> void:
	set_segments([{"text": value}])


func set_segments(value: Array) -> void:
	_segments = value
	text = ""
	for segment: Dictionary in value:
		text += str(segment.text)
	queue_redraw()


func flow(width: float) -> float:
	_lines = []
	var browser_widths := _browser_widths()
	var line := {"words": [], "width": 0.0}
	for segment: Dictionary in _segments:
		var face: Font = bold_font if bool(segment.get("bold", false)) else font
		for word in str(segment.text).replace("\n", " \n ").split(" ", false):
			if word == "\n":
				_lines.append(line)
				line = {"words": [], "width": 0.0}
				continue
			var descriptor := css_bold_font if bool(segment.get("bold", false)) else css_font
			var advance := float(browser_widths.get(descriptor + "|" + word, face.get_string_size(word, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size).x)) + maxf(0, word.length() - 1) * tracking
			var gap := float(browser_widths.get(descriptor + "| ", face.get_string_size(" ", HORIZONTAL_ALIGNMENT_LEFT, -1, font_size).x)) + tracking if not line.words.is_empty() else 0.0
			if line.width + gap + advance > width and not line.words.is_empty():
				_lines.append(line)
				line = {"words": [], "width": 0.0}
				gap = 0.0
			line.words.append({"text": word, "font": face, "x": line.width + gap, "advance": advance})
			line.width += gap + advance
	_lines.append(line)
	size = Vector2(width, _lines.size() * line_height)
	queue_redraw()
	return size.y


func _browser_widths() -> Dictionary:
	if not OS.has_feature("web") or css_font.is_empty(): return {}
	var queries: Array = []
	for segment: Dictionary in _segments:
		var descriptor := css_bold_font if bool(segment.get("bold", false)) else css_font
		for word in [" "] + Array(str(segment.text).replace("\n", " ").split(" ", false)):
			queries.append({"font": descriptor, "text": word})
	# Use the host browser's actual CSS font fallback for advances. SystemFont
	# cannot access those faces in Web exports; glyph rendering stays in Godot.
	var expression := "(function(){const c=document.createElement('canvas').getContext('2d');return JSON.stringify(%s.map(q=>{c.font=q.font;return c.measureText(q.text).width;}));})()" % JSON.stringify(queries)
	var values: Variant = JSON.parse_string(str(JavaScriptBridge.eval(expression, true)))
	var measured := {}
	if values is Array and values.size() == queries.size():
		for index in range(values.size()):
			measured[str(queries[index].font) + "|" + str(queries[index].text)] = values[index]
	return measured


func _draw() -> void:
	for index in range(_lines.size()):
		var line: Dictionary = _lines[index]
		var left: float = (size.x - float(line.width)) * 0.5 if centred else 0.0
		for word: Dictionary in line.words:
			var face: Font = word.font
			var baseline := index * line_height + (line_height - face.get_height(font_size)) * 0.5 + face.get_ascent(font_size)
			var native_width := face.get_string_size(word.text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size).x + maxf(0, str(word.text).length() - 1) * tracking
			var ratio := float(word.advance) / maxf(0.001, native_width)
			draw_set_transform(Vector2(left + float(word.x), baseline), 0, Vector2(ratio, 1))
			var point := Vector2.ZERO
			if is_zero_approx(tracking):
				if shadow_colour.a > 0:
					face.draw_string(get_canvas_item(), shadow_offset, word.text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, shadow_colour)
				face.draw_string(get_canvas_item(), point, word.text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, colour)
			else:
				for character in str(word.text):
					face.draw_string(get_canvas_item(), point, character, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, colour)
					point.x += face.get_string_size(character, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size).x + tracking
	draw_set_transform(Vector2.ZERO)
