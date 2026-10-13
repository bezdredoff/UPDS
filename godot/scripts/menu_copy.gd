extends RefCounted


const FALLBACK_LOCALE := "en"
const COPY := {
	"en": {
		"eyebrow": "SEIRAN COLLEGE · CASE 001",
		"title": "Class U",
		"accent": "Detectives",
		"tagline": "Comedy visual novel × match-3",
		"new_game": "New Game",
		"continue": "Continue",
		"campaign": "Match-3 Campaign",
		"settings": "Settings",
		"back": "Back",
		"language": "Language",
		"language_help": "Interface language is saved on this device separately from game progress.",
		"settings_save_error": "Could not save settings. Please try again.",
		"version": "UPDS · Godot port",
	},
	"ru": {
		"eyebrow": "SEIRAN COLLEGE · CASE 001",
		"title": "Детективы",
		"accent": "класса U",
		"tagline": "Комедийная визуальная новелла × «три в ряд»",
		"new_game": "Новая игра",
		"continue": "Продолжить",
		"campaign": "Кампания «три в ряд»",
		"settings": "Настройки",
		"back": "Назад",
		"language": "Язык",
		"language_help": "Язык интерфейса сохраняется на этом устройстве отдельно от игрового прогресса.",
		"settings_save_error": "Не удалось сохранить настройки. Попробуйте ещё раз.",
		"version": "UPDS · порт на Godot",
	},
	"be": {
		"eyebrow": "КАЛЕДЖ СЭЙРАН · СПРАВА 001",
		"title": "Дэтэктывы",
		"accent": "класа U",
		"tagline": "Камедыйная візуальная навела × гульня «тры ў шэраг»",
		"new_game": "Новая гульня",
		"continue": "Працягнуць",
		"campaign": "Кампанія «тры ў шэраг»",
		"settings": "Налады",
		"back": "Назад",
		"language": "Мова",
		"language_help": "Мова інтэрфейсу захоўваецца на гэтай прыладзе асобна ад гульнявога прагрэсу.",
		"settings_save_error": "Не ўдалося захаваць налады. Паспрабуйце яшчэ раз.",
		"version": "UPDS · порт на Godot",
	},
}


static func system_locale() -> String:
	var language := OS.get_locale_language().to_lower()
	return language if COPY.has(language) else FALLBACK_LOCALE


static func text(key: String, locale: String = "") -> String:
	var selected_locale := locale if COPY.has(locale) else system_locale()
	var selected_copy: Dictionary = COPY.get(selected_locale, COPY[FALLBACK_LOCALE])
	var fallback_copy: Dictionary = COPY[FALLBACK_LOCALE]
	return str(selected_copy.get(key, fallback_copy.get(key, key)))
