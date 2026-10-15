shader_type canvas_item;

uniform vec4 color_start : source_color = vec4(0.2863, 0.2078, 0.3216, 1.0);
uniform vec4 color_end : source_color = vec4(0.1647, 0.2353, 0.3490, 1.0);
uniform float gradient_end_stop = 0.72;

void fragment() {
	vec2 gradient_axis = vec2(0.573576, 0.819152);
	float gradient_position = clamp(dot(UV, gradient_axis) / 1.392728 / gradient_end_stop, 0.0, 1.0);
	vec3 base_color = mix(color_start.rgb, color_end.rgb, gradient_position);
	float edge = min(min(UV.x, 1.0 - UV.x), min(UV.y, 1.0 - UV.y));
	float border_px = max(fwidth(UV.x), fwidth(UV.y));
	float inset_border = 1.0 - smoothstep(border_px * 1.5, border_px * 2.5, edge);
	base_color = mix(base_color, vec3(0.0471, 0.1020, 0.1922), inset_border * 0.87);
	float top_highlight = 1.0 - smoothstep(border_px * 0.5, border_px * 1.5, UV.y);
	base_color = mix(base_color, vec3(1.0), top_highlight * 0.12);
	COLOR = vec4(base_color, 1.0) * COLOR;
}
