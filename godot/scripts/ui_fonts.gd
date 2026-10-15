extends RefCounted

const INTER_LATIN: FontFile = preload("res://assets/fonts/Inter-latin.woff2")
const INTER_CYRILLIC: FontFile = preload("res://assets/fonts/Inter-cyrillic.woff2")
const COMIC_LATIN: FontFile = preload("res://assets/fonts/ComicRelief-latin.woff2")
const COMIC_CYRILLIC: FontFile = preload("res://assets/fonts/ComicRelief-cyrillic.woff2")
const COMIC_BOLD_LATIN: FontFile = preload("res://assets/fonts/ComicRelief-Bold-latin.woff2")
const COMIC_BOLD_CYRILLIC: FontFile = preload("res://assets/fonts/ComicRelief-Bold-cyrillic.woff2")


static func sans(weight: int = 400) -> FontVariation:
	var font := FontVariation.new()
	font.base_font = INTER_LATIN
	font.fallbacks = [INTER_CYRILLIC]
	font.variation_opentype = {"wght": float(weight)}
	return font


static func match3(weight: int = 400) -> FontVariation:
	var bold := weight >= 600
	var font := FontVariation.new()
	font.base_font = COMIC_BOLD_LATIN if bold else COMIC_LATIN
	font.fallbacks = [COMIC_BOLD_CYRILLIC if bold else COMIC_CYRILLIC]
	font.variation_opentype = {"wght": 700.0 if bold else 400.0}
	return font
