shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear;
uniform float blur_radius_px = 1.0;
uniform vec4 tint = vec4(0.027451, 0.078431, 0.152941, 0.619608);

void fragment() {
	vec2 blur = SCREEN_PIXEL_SIZE * blur_radius_px;
	vec3 background = texture(screen_texture, SCREEN_UV).rgb * 0.25;
	background += texture(screen_texture, SCREEN_UV + vec2(blur.x, 0.0)).rgb * 0.125;
	background += texture(screen_texture, SCREEN_UV - vec2(blur.x, 0.0)).rgb * 0.125;
	background += texture(screen_texture, SCREEN_UV + vec2(0.0, blur.y)).rgb * 0.125;
	background += texture(screen_texture, SCREEN_UV - vec2(0.0, blur.y)).rgb * 0.125;
	background += texture(screen_texture, SCREEN_UV + blur).rgb * 0.0625;
	background += texture(screen_texture, SCREEN_UV - blur).rgb * 0.0625;
	background += texture(screen_texture, SCREEN_UV + vec2(blur.x, -blur.y)).rgb * 0.0625;
	background += texture(screen_texture, SCREEN_UV + vec2(-blur.x, blur.y)).rgb * 0.0625;
	COLOR = vec4(mix(background, tint.rgb, tint.a), 1.0);
}
