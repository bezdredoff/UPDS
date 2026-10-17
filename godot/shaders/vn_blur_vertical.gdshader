shader_type canvas_item;
render_mode blend_disabled;

uniform sampler2D horizontal_texture : filter_linear, repeat_disable;
uniform vec2 canvas_size = vec2(390.0, 844.0);
const float PAD = 48.0;

vec4 sample_horizontal(vec2 point) {
	return texture(horizontal_texture, (point + vec2(0.0, PAD)) / (canvas_size + vec2(0.0, PAD * 2.0)));
}

void fragment() {
	vec2 point = UV * canvas_size;
	vec4 sum = sample_horizontal(point);
	float total = 1.0;
	for (int i = 1; i <= 47; i += 2) {
		float a = float(i);
		float b = a + 1.0;
		float wa = exp(-a * a / 512.0);
		float wb = exp(-b * b / 512.0);
		float weight = wa + wb;
		float offset = (a * wa + b * wb) / weight;
		sum += (sample_horizontal(point + vec2(0.0, offset)) + sample_horizontal(point - vec2(0.0, offset))) * weight;
		total += weight * 2.0;
	}
	vec4 blurred = sum / total;
	vec3 rgb = blurred.rgb * 0.7;
	float luminance = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
	rgb = mix(vec3(luminance), rgb, 0.82);
	// Keep the cache premultiplied so the subsequent CSS transform can
	// interpolate transparent bounds without dark fringes.
	COLOR = vec4(rgb, blurred.a);
}
