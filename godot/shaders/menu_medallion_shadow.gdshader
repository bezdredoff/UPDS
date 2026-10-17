shader_type canvas_item;

uniform float radius_px = 39.0;
uniform float sigma_px = 7.0;
uniform vec4 shadow_color : source_color = vec4(0.098039, 0.125490, 0.219608, 0.333333);

float erf_approx(float value) {
	float x = abs(value);
	float t = 1.0 / (1.0 + 0.3275911 * x);
	float polynomial = (((((1.061405429 * t - 1.453152027) * t)
		+ 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
	return sign(value) * (1.0 - polynomial * exp(-x * x));
}

void fragment() {
	vec2 size_px = vec2(1.0) / fwidth(UV);
	float distance_px = length((UV - vec2(0.5)) * size_px);
	// A disk's curved boundary shifts the Gaussian edge slightly inward.
	float curvature = sigma_px * sigma_px / (2.0 * radius_px);
	float alpha = 0.5 * (1.0 - erf_approx((distance_px - radius_px + curvature) / (1.41421356 * sigma_px)));
	COLOR = vec4(shadow_color.rgb, shadow_color.a * alpha) * COLOR;
}
