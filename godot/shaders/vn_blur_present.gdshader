shader_type canvas_item;
uniform float zoom = 1.08;
uniform vec2 canvas_size = vec2(390.0, 844.0);
uniform float output_height = 844.0;
uniform float output_y = 0.0;
varying vec4 item_modulate;

void vertex() {
	item_modulate = COLOR;
}

void fragment() {
	// CSS scale(1.08), after filtering, clipped to the background stack.
	vec2 point = vec2(UV.x * canvas_size.x, UV.y * output_height + output_y);
	point = (point - canvas_size * 0.5) / zoom + canvas_size * 0.5;
	vec4 blurred = texture(TEXTURE, (point + vec2(0.0, 48.0)) / (canvas_size + vec2(0.0, 96.0)));
	COLOR = vec4(blurred.rgb / max(blurred.a, 0.000001), blurred.a) * item_modulate;
}
