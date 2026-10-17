shader_type canvas_item;

void fragment() {
	vec4 source = COLOR;
	// CSS filter order: brightness(.92), then saturate(.96), in sRGB.
	vec3 rgb = source.rgb * 0.92;
	float luminance = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
	COLOR = vec4(mix(vec3(luminance), rgb, 0.96), source.a);
}
