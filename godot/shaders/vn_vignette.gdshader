shader_type canvas_item;

void fragment() {
	// CSS interpolates gradients in premultiplied sRGB. The horizontal
	// gradient is painted over the bottom-to-top vertical gradient.
	float left = clamp((0.38 - UV.x) / 0.38, 0.0, 1.0);
	float right = clamp((UV.x - 0.38) / 0.62, 0.0, 1.0);
	float bottom = clamp((UV.y - 0.48) / 0.52, 0.0, 1.0);
	float horizontal_alpha = left * (33.0 / 255.0) + right * (31.0 / 255.0);
	vec3 horizontal_rgb = (vec3(24.0, 32.0, 61.0) * left * (33.0 / 255.0)
		+ vec3(74.0, 37.0, 64.0) * right * (31.0 / 255.0)) / 255.0;
	float vertical_alpha = bottom * (92.0 / 255.0);
	vec3 vertical_rgb = vec3(23.0, 26.0, 51.0) / 255.0 * vertical_alpha;
	float alpha = horizontal_alpha + vertical_alpha * (1.0 - horizontal_alpha);
	vec3 premultiplied = horizontal_rgb + vertical_rgb * (1.0 - horizontal_alpha);
	COLOR = vec4(premultiplied / max(alpha, 0.000001), alpha) * COLOR;
}
