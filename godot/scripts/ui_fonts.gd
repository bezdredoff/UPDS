extends RefCounted

static var INTER_LATIN: FontFile = _load_font("res://assets/fonts/Inter-latin.woff2")
static var INTER_CYRILLIC: FontFile = _load_font("res://assets/fonts/Inter-cyrillic.woff2")
static var COMIC_LATIN: FontFile = _load_font("res://assets/fonts/ComicRelief-latin.woff2")
static var COMIC_CYRILLIC: FontFile = _load_font("res://assets/fonts/ComicRelief-cyrillic.woff2")
static var COMIC_BOLD_LATIN: FontFile = _load_font("res://assets/fonts/ComicRelief-Bold-latin.woff2")
static var COMIC_BOLD_CYRILLIC: FontFile = _load_font("res://assets/fonts/ComicRelief-Bold-cyrillic.woff2")


static func _load_font(path: String) -> FontFile:
	var font := FontFile.new()
	font.load_dynamic_font(path)
	return font


static func sans(weight: int = 400) -> FontVariation:
	var font := FontVariation.new()
	font.base_font = INTER_LATIN
	font.fallbacks = [INTER_CYRILLIC]
	font.variation_opentype = {"wght": float(weight)}
	return font


static func match3(weight: int = 400) -> SystemFont:
	var bold := weight >= 600
	var bundled := FontVariation.new()
	bundled.base_font = COMIC_BOLD_LATIN if bold else COMIC_LATIN
	bundled.fallbacks = [COMIC_BOLD_CYRILLIC if bold else COMIC_CYRILLIC]
	if bold:
		bundled.variation_embolden = float(maxi(0, weight - 700)) / 500.0
	else:
		bundled.variation_opentype = {"wght": float(weight)}
	var font := SystemFont.new()
	font.font_names = PackedStringArray(["Comic Sans MS", "Trebuchet MS"])
	font.font_weight = weight
	font.fallbacks = [bundled]
	return font
