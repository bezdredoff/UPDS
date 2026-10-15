extends RefCounted

const INTER_LATIN: FontFile = preload("res://assets/fonts/Inter-latin.woff2")
const INTER_CYRILLIC: FontFile = preload("res://assets/fonts/Inter-cyrillic.woff2")
const COMIC_LATIN: FontFile = preload("res://assets/fonts/ComicRelief-latin.woff2")
const COMIC_CYRILLIC: FontFile = preload("res://assets/fonts/ComicRelief-cyrillic.woff2")
const COMIC_BOLD_LATIN: FontFile = preload("res://assets/fonts/ComicRelief-Bold-latin.woff2")
const COMIC_BOLD_CYRILLIC: FontFile = preload("res://assets/fonts/ComicRelief-Bold-cyrillic.woff2")
const GEORGIA_LATIN: FontFile = preload("res://assets/fonts/Gelasio-wght.ttf")
const SERIF_CYRILLIC: FontFile = preload("res://assets/fonts/NotoSerif-wdth-wght.ttf")


static func sans(weight: int = 400) -> FontVariation:
	var font := FontVariation.new()
	font.base_font = INTER_LATIN
	font.fallbacks = [INTER_CYRILLIC]
	font.variation_opentype = {"wght": float(weight)}
	return font


static func serif(weight: int = 400) -> Font:
	var bundled := FontVariation.new()
	bundled.base_font = GEORGIA_LATIN
	bundled.fallbacks = [SERIF_CYRILLIC]
	bundled.variation_opentype = {"wght": float(mini(weight, 700))}
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
		bundled.variation_opentype = {"wght": float(weight)}
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
