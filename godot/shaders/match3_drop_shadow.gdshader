shader_type canvas_item;

uniform vec4 shadow_color : source_color = vec4(0.06, 0.09, 0.18, 0.4);
uniform vec2 shadow_offset_px = vec2(0.0, 1.0);
uniform float shadow_blur_px = 1.0;
uniform float brightness = 1.0;
uniform float saturation = 1.0;
uniform float glow_strength = 0.0;
uniform vec4 glow_white : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform vec4 glow_gold : source_color = vec4(1.0, 0.941, 0.659, 1.0);
uniform vec4 glow_aqua : source_color = vec4(0.424, 0.886, 0.827, 1.0);
uniform float glow_white_radius_px = 5.0;
uniform float glow_gold_radius_px = 10.0;
uniform float glow_aqua_radius_px = 14.0;


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
	vec4 source = texture(TEXTURE, UV) * COLOR;
	source.rgb *= brightness;
	float shadow_alpha = alpha / 16.0 * shadow_color.a * COLOR.a * (1.0 - source.a);
	vec3 shadow_rgb = shadow_color.rgb * COLOR.rgb;
	float glow_white_samples = 0.0;
	float glow_gold_samples = 0.0;
	float glow_aqua_samples = 0.0;
	if (glow_strength > 0.001) {
		for (int sample_index = 0; sample_index < 8; sample_index++) {
			float angle = float(sample_index) * 0.785398;
			vec2 direction = vec2(cos(angle), sin(angle));
			vec2 sample_direction = pixel_x * direction.x + pixel_y * direction.y;
			if (glow_white.a > 0.001) {
				glow_white_samples += texture(TEXTURE, UV + sample_direction * glow_white_radius_px).a;
			}
			if (glow_gold.a > 0.001) {
				glow_gold_samples += texture(TEXTURE, UV + sample_direction * glow_gold_radius_px).a;
			}
			if (glow_aqua.a > 0.001) {
				glow_aqua_samples += texture(TEXTURE, UV + sample_direction * glow_aqua_radius_px).a;
			}
		}
	}
	float outside_source = 1.0 - source.a;
	float glow_white_alpha = glow_white_samples / 8.0 * 0.55 * glow_strength * glow_white.a * outside_source;
	float glow_gold_alpha = glow_gold_samples / 8.0 * 0.42 * glow_strength * glow_gold.a * outside_source;
	float glow_aqua_alpha = glow_aqua_samples / 8.0 * 0.30 * glow_strength * glow_aqua.a * outside_source;
	float background_alpha = glow_aqua_alpha
		+ glow_gold_alpha * (1.0 - glow_aqua_alpha)
		+ glow_white_alpha * (1.0 - glow_aqua_alpha) * (1.0 - glow_gold_alpha);
	vec3 background_rgb = glow_aqua.rgb * glow_aqua_alpha
		+ glow_gold.rgb * glow_gold_alpha * (1.0 - glow_aqua_alpha)
		+ glow_white.rgb * glow_white_alpha * (1.0 - glow_aqua_alpha) * (1.0 - glow_gold_alpha);
	background_rgb *= COLOR.rgb;
	float under_alpha = shadow_alpha + background_alpha * (1.0 - shadow_alpha);
	vec3 under_rgb = shadow_rgb * shadow_alpha + background_rgb * background_alpha * (1.0 - shadow_alpha);
	float output_alpha = source.a + under_alpha * (1.0 - source.a);
	vec3 output_rgb = output_alpha > 0.0
		? (source.rgb * source.a + under_rgb * (1.0 - source.a)) / output_alpha
		: vec3(0.0);
	float output_gray = dot(output_rgb, vec3(0.299, 0.587, 0.114));
	output_rgb = mix(vec3(output_gray), output_rgb, saturation);
	COLOR = vec4(output_rgb, output_alpha);
}
