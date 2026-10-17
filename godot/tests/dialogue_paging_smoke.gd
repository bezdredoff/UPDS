extends SceneTree

const Paging = preload("res://scripts/dialogue_paging.gd")


func _initialize() -> void:
	var fixture: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/dialogue_paging_cases.json"))
	for entry: Dictionary in fixture.cases:
		var fits := func(candidate: String) -> bool: return candidate.length() <= int(entry.budget)
		var sentence_units: Array[String] = []
		sentence_units.assign(entry.sentences)
		var pages := Paging.paginate(entry.text, fits, entry.locale, sentence_units)
		assert(pages == entry.pages, "%s pages differ: %s vs source %s" % [entry.id, pages, entry.pages])
		for index in range(pages.size()):
			assert(Paging.continuation(pages[index], index < pages.size() - 1) == entry.displayed[index],
				"%s continuation differs" % entry.id)
	print("UPDS dialogue paging source oracle passed (%d cases)." % fixture.cases.size())
	quit()
