extends RefCounted

const INTER_LATIN: FontFile = preload("res://assets/fonts/Inter-latin.woff2")
const INTER_CYRILLIC: FontFile = preload("res://assets/fonts/Inter-cyrillic.woff2")
const COMIC_LATIN: FontFile = preload("res://assets/fonts/ComicRelief-latin.woff2")
const COMIC_CYRILLIC: FontFile = preload("res://assets/fonts/ComicRelief-cyrillic.woff2")
const COMIC_BOLD_LATIN: FontFile = preload("res://assets/fonts/ComicRelief-Bold-latin.woff2")
const COMIC_BOLD_CYRILLIC: FontFile = preload("res://assets/fonts/ComicRelief-Bold-cyrillic.woff2")
const GEORGIA_LATIN: FontFile = preload("res://assets/fonts/Gelasio-wght.ttf")
const SERIF_CYRILLIC: FontFile = preload("res://assets/fonts/NotoSerif-wdth-wght.ttf")

# Godot 4.7.2 ignores the documented "wght" tag alias; use "weight" to apply axes.


static func sans(weight: int = 400) -> FontVariation:
	var cyrillic := FontVariation.new()
	cyrillic.base_font = INTER_CYRILLIC
	cyrillic.variation_opentype = {"weight": float(weight)}
	var font := FontVariation.new()
	font.base_font = INTER_LATIN
	font.fallbacks = [cyrillic]
	font.variation_opentype = {"weight": float(weight)}
	return font


static func serif(weight: int = 400) -> Font:
	var cyrillic := FontVariation.new()
	cyrillic.base_font = SERIF_CYRILLIC
	cyrillic.variation_opentype = {"weight": float(mini(weight, 700))}
	if weight > 700:
		cyrillic.variation_embolden = float(weight - 700) / 500.0
	var bundled := FontVariation.new()
	bundled.base_font = GEORGIA_LATIN
	bundled.fallbacks = [cyrillic]
	bundled.variation_opentype = {"weight": float(mini(weight, 700))}
	if weight > 700:
		bundled.variation_embolden = float(weight - 700) / 500.0
	if OS.has_feature("web"):
		return bundled
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Georgia", "Noto Serif", "Liberation Serif", "serif"])
	font.font_weight = weight
	font.fallbacks = [bundled]
	return font


static func match3(weight: int = 400) -> Font:
	var bold := weight >= 600
	var bundled := FontVariation.new()
	bundled.base_font = COMIC_BOLD_LATIN if bold else COMIC_LATIN
	bundled.fallbacks = [COMIC_BOLD_CYRILLIC if bold else COMIC_CYRILLIC]
	if bold:
		bundled.variation_embolden = float(maxi(0, weight - 700)) / 500.0
	else:
		bundled.variation_opentype = {"weight": float(weight)}
	# Godot SystemFont is not implemented by the Web export. On Playgama/Web,
	# return the bundled Comic Relief face directly instead of falling back to
	# the project's Inter theme font.
	if OS.has_feature("web"):
		return bundled
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Comic Sans MS", "Trebuchet MS"])
	font.font_weight = weight
	font.fallbacks = [bundled]
	return font
