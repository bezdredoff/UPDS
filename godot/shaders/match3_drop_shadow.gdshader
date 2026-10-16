shader_type canvas_item;

uniform vec4 shadow_color : source_color = vec4(0.06, 0.09, 0.18, 0.4);
uniform vec2 shadow_offset_px = vec2(0.0, 1.0);
uniform float shadow_blur_px = 1.0;
uniform float brightness = 1.0;
uniform float saturation = 1.0;
uniform float contrast = 1.0;
uniform float glow_strength = 0.0;
uniform vec4 glow_white : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform vec4 glow_gold : source_color = vec4(1.0, 0.941, 0.659, 1.0);
uniform vec4 glow_aqua : source_color = vec4(0.424, 0.886, 0.827, 1.0);
uniform float glow_white_radius_px = 5.0;
uniform float glow_gold_radius_px = 10.0;
uniform float glow_aqua_radius_px = 14.0;

// Fragment COLOR already includes texture RGBA. Keep item/parent modulation
// separately so transparent texels do not erase the shadow or tint it twice.
varying vec4 item_modulation;

void vertex() {
	item_modulation = COLOR;
}

float blurred_alpha(sampler2D source_texture, vec2 uv, vec2 pixel_x, vec2 pixel_y, float sigma_px) {
	float weighted_alpha = 0.0;
	float total_weight = 0.0;
	for (int y = -6; y <= 6; y++) {
		float y_offset = float(y) * 0.5;
		float y_weight = exp(-0.5 * y_offset * y_offset);
		for (int x = -6; x <= 6; x++) {
			float x_offset = float(x) * 0.5;
			float weight = y_weight * exp(-0.5 * x_offset * x_offset);
			vec2 sample_uv = uv + pixel_x * x_offset * sigma_px + pixel_y * y_offset * sigma_px;
			weighted_alpha += texture(source_texture, sample_uv).a * weight;
			total_weight += weight;
		}
	}
	return weighted_alpha / total_weight;
}


void fragment() {
	vec2 pixel_x = dFdx(UV);
	vec2 pixel_y = dFdy(UV);
	vec2 offset = pixel_x * shadow_offset_px.x + pixel_y * shadow_offset_px.y;
	vec2 blur_x = pixel_x * shadow_blur_px;
	vec2 blur_y = pixel_y * shadow_blur_px;
	float alpha = texture(TEXTURE, UV - offset).a * 4.0;
	alpha += texture(TEXTURE, UV - offset + blur_x).a * 2.0;
	alpha += texture(TEXTURE, UV - offset - blur_x).a * 2.0;
	alpha += texture(TEXTURE, UV - offset + blur_y).a * 2.0;
	alpha += texture(TEXTURE, UV - offset - blur_y).a * 2.0;
	alpha += texture(TEXTURE, UV - offset + blur_x + blur_y).a;
	alpha += texture(TEXTURE, UV - offset + blur_x - blur_y).a;
	alpha += texture(TEXTURE, UV - offset - blur_x + blur_y).a;
	alpha += texture(TEXTURE, UV - offset - blur_x - blur_y).a;
	vec4 source = texture(TEXTURE, UV);
	source.rgb *= brightness;
	float shadow_alpha = alpha / 16.0 * shadow_color.a;
	vec3 shadow_rgb = shadow_color.rgb;
	float glow_white_alpha = glow_strength > 0.001 && glow_white.a > 0.001
		? blurred_alpha(TEXTURE, UV, pixel_x, pixel_y, glow_white_radius_px) * glow_strength * glow_white.a
		: 0.0;
	float glow_gold_alpha = glow_strength > 0.001 && glow_gold.a > 0.001
		? blurred_alpha(TEXTURE, UV, pixel_x, pixel_y, sqrt(glow_white_radius_px * glow_white_radius_px
			+ glow_gold_radius_px * glow_gold_radius_px)) * glow_strength * glow_gold.a
		: 0.0;
	float glow_aqua_alpha = glow_strength > 0.001 && glow_aqua.a > 0.001
		? blurred_alpha(TEXTURE, UV, pixel_x, pixel_y, sqrt(glow_white_radius_px * glow_white_radius_px
			+ glow_gold_radius_px * glow_gold_radius_px + glow_aqua_radius_px * glow_aqua_radius_px))
			* glow_strength * glow_aqua.a
		: 0.0;
	float background_alpha = glow_aqua_alpha
		+ glow_gold_alpha * (1.0 - glow_aqua_alpha)
		+ glow_white_alpha * (1.0 - glow_aqua_alpha) * (1.0 - glow_gold_alpha);
	vec3 background_rgb = glow_aqua.rgb * glow_aqua_alpha
		+ glow_gold.rgb * glow_gold_alpha * (1.0 - glow_aqua_alpha)
		+ glow_white.rgb * glow_white_alpha * (1.0 - glow_aqua_alpha) * (1.0 - glow_gold_alpha);
	float under_alpha = shadow_alpha + background_alpha * (1.0 - shadow_alpha);
	vec3 under_rgb = shadow_rgb * shadow_alpha + background_rgb * (1.0 - shadow_alpha);
	float output_alpha = source.a + under_alpha * (1.0 - source.a);
	vec3 output_rgb = output_alpha > 0.0
		? (source.rgb * source.a + under_rgb * (1.0 - source.a)) / output_alpha
		: vec3(0.0);
	output_rgb = (output_rgb - vec3(0.5)) * contrast + vec3(0.5);
	float output_gray = dot(output_rgb, vec3(0.299, 0.587, 0.114));
	output_rgb = mix(vec3(output_gray), output_rgb, saturation);
	// Composite the filtered image first, then fade/tint the entire result once.
	COLOR = vec4(output_rgb * item_modulation.rgb, output_alpha * item_modulation.a);
}
