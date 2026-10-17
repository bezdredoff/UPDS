shader_type canvas_item;
uniform float header_height = 60.0;

void fragment() {
	vec4 wash = mix(vec4(23.0, 48.0, 77.0, 248.0), vec4(16.0, 36.0, 61.0, 248.0), UV.y) / 255.0;
	if (UV.y * header_height >= header_height - 2.0) {
		wash = vec4(211.0, 176.0, 104.0, 255.0) / 255.0;
	}
	COLOR = wash * COLOR;
}
