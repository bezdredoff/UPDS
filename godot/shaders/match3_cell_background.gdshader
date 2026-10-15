shader_type canvas_item;


void fragment() {
	vec2 gradient_axis = vec2(0.573576, 0.819152);
	float gradient_position = clamp(dot(UV, gradient_axis) / 1.392728, 0.0, 1.0);
	vec3 base_color = mix(vec3(0.1804, 0.2588, 0.4), vec3(0.1412, 0.2078, 0.3294), gradient_position);
	float edge = min(min(UV.x, 1.0 - UV.x), min(UV.y, 1.0 - UV.y));
	float highlight = 1.0 - smoothstep(0.0, 0.02, edge);
	base_color = mix(base_color, vec3(1.0), highlight * 0.05);
	float bottom_edge = 1.0 - UV.y;
	float bottom_shadow = 1.0 - smoothstep(0.0, 0.04, bottom_edge);
	base_color = mix(base_color, vec3(0.0667, 0.0941, 0.1686), bottom_shadow * 0.36);
	COLOR = vec4(base_color, 1.0) * COLOR;
}
