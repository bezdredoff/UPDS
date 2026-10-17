shader_type canvas_item;
uniform vec2 canvas_size = vec2(390.0, 844.0);
varying vec4 item_modulate;

void vertex() {
	item_modulate = COLOR;
}

void fragment() {
	// TextureRect's centred aspect layout rounds the destination rectangle.
	// CSS object-fit retains fractional bounds (e.g. 75.333px at 390x844).
	vec2 image_size = vec2(textureSize(TEXTURE, 0));
	vec2 fit_size = image_size * min(canvas_size.x / image_size.x, canvas_size.y / image_size.y);
	vec2 image_uv = (UV * canvas_size - (canvas_size - fit_size) * 0.5) / fit_size;
	vec4 source = texture(TEXTURE, image_uv) * item_modulate;
	if (image_uv.x < 0.0 || image_uv.y < 0.0 || image_uv.x > 1.0 || image_uv.y > 1.0) {
		source = vec4(0.0);
	}
	// CSS filter order: brightness(.92), then saturate(.96), in sRGB.
	vec3 rgb = source.rgb * 0.92;
	float luminance = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
	COLOR = vec4(mix(vec3(luminance), rgb, 0.96), source.a);
}
