shader_type canvas_item;

void fragment() {
	float aspect = fwidth(UV.y) / fwidth(UV.x);
	vec2 point = (UV - vec2(0.5, 0.0)) * vec2(aspect, 1.0);
	float radius = length(vec2(aspect * 0.5, 1.0));
	float shade = clamp(length(point) / (radius * 0.62), 0.0, 1.0);
	COLOR = mix(vec4(0.333333, 0.317647, 0.431373, 1.0),
		vec4(0.090196, 0.101961, 0.184314, 1.0), shade) * COLOR;
}
