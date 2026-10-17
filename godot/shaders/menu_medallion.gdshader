shader_type canvas_item;

varying vec4 item_modulation;

void vertex() {
	item_modulation = COLOR;
}

void fragment() {
	vec2 size_px = vec2(1.0) / fwidth(UV);
	vec2 content_uv = (UV * size_px - vec2(3.0)) / (size_px - vec2(6.0));
	vec2 texel_dx = dFdx(content_uv) / TEXTURE_PIXEL_SIZE;
	vec2 texel_dy = dFdy(content_uv) / TEXTURE_PIXEL_SIZE;
	float lod = floor(max(0.0, log2(max(length(texel_dx), length(texel_dy)))));
	vec4 source = textureLod(TEXTURE, content_uv, lod);
	vec3 background = vec3(0.121569, 0.137255, 0.250980);
	vec3 color = source.rgb * source.a + background * (1.0 - source.a);
	float radius = length((UV - vec2(0.5)) * size_px);
	float outer_radius = min(size_px.x, size_px.y) * 0.5;
	float outer_alpha = 1.0 - smoothstep(outer_radius - 0.5, outer_radius + 0.5, radius);
	float border_alpha = smoothstep(outer_radius - 3.5, outer_radius - 2.5, radius);
	color = mix(color, vec3(1.0, 0.972549, 0.913725), border_alpha);
	COLOR = vec4(color, outer_alpha) * item_modulation;
}
