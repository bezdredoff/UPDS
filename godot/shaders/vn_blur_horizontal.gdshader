shader_type canvas_item;
render_mode blend_disabled;

uniform sampler2D cover_texture : filter_linear, repeat_disable;
uniform vec2 canvas_size = vec2(390.0, 844.0);
const float PAD = 48.0;

vec4 sample_cover(vec2 point) {
	if (point.x < -0.5 || point.y < 0.0 || point.x > canvas_size.x + 0.5 || point.y >= canvas_size.y) {
		return vec4(0.0);
	}
	float coverage = clamp(point.x + 0.5, 0.0, 1.0) * clamp(canvas_size.x + 0.5 - point.x, 0.0, 1.0);
	return texture(cover_texture, point / canvas_size) * coverage;
}

void fragment() {
	vec2 point = UV * (canvas_size + vec2(0.0, PAD * 2.0)) - vec2(0.0, PAD);
	vec4 sum = sample_cover(point);
	float total = 1.0;
	// Pair adjacent Gaussian taps through linear filtering of the CSS-sized
	// cover raster. The intermediate is premultiplied RGBA, including bounds.
	for (int i = 1; i <= 47; i += 2) {
		float a = float(i);
		float b = a + 1.0;
		float wa = exp(-a * a / 512.0);
		float wb = exp(-b * b / 512.0);
		float weight = wa + wb;
		float offset = (a * wa + b * wb) / weight;
		sum += (sample_cover(point + vec2(offset, 0.0)) + sample_cover(point - vec2(offset, 0.0))) * weight;
		total += weight * 2.0;
	}
	COLOR = sum / total;
}
