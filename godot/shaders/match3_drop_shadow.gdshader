shader_type canvas_item;

uniform vec4 shadow_color : source_color = vec4(0.06, 0.09, 0.18, 0.4);
uniform vec2 shadow_offset_px = vec2(0.0, 1.0);
uniform float shadow_blur_px = 1.0;
uniform float brightness = 1.0;


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
	float output_alpha = source.a + shadow_alpha;
	vec3 output_rgb = output_alpha > 0.0
		? (source.rgb * source.a + shadow_rgb * shadow_alpha) / output_alpha
		: vec3(0.0);
	COLOR = vec4(output_rgb, output_alpha);
}
