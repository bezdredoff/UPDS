shader_type canvas_item;

uniform vec2 box_size_px = vec2(334.0, 49.0);
uniform float sigma_px = 11.0;
uniform vec4 shadow_color : source_color = vec4(0.662745, 0.227451, 0.329412, 0.313725);

float erf_approx(float value) {
	float x = abs(value);
	float t = 1.0 / (1.0 + 0.3275911 * x);
	float polynomial = (((((1.061405429 * t - 1.453152027) * t)
		+ 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
	return sign(value) * (1.0 - polynomial * exp(-x * x));
}

void fragment() {
	vec2 size_px = vec2(1.0) / fwidth(UV);
	vec2 point = (UV - vec2(0.5)) * size_px;
	vec2 half_box = box_size_px * 0.5;
	float denominator = 1.41421356 * sigma_px;
	float alpha_x = 0.5 * (erf_approx((point.x + half_box.x) / denominator)
		- erf_approx((point.x - half_box.x) / denominator));
	float alpha_y = 0.5 * (erf_approx((point.y + half_box.y) / denominator)
		- erf_approx((point.y - half_box.y) / denominator));
	COLOR = vec4(shadow_color.rgb, shadow_color.a * alpha_x * alpha_y) * COLOR;
}
