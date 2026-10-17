shader_type canvas_item;
varying vec4 item_modulate;

void vertex() {
	item_modulate = COLOR;
}

void fragment() {
	// CSS scale(1.08), after filtering, clipped to the background stack.
	vec4 blurred = texture(TEXTURE, (UV - vec2(0.5)) / 1.08 + vec2(0.5));
	COLOR = vec4(blurred.rgb / max(blurred.a, 0.000001), blurred.a) * item_modulate;
}
