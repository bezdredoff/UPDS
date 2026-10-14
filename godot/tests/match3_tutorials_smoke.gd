extends SceneTree

const Tutorials = preload("res://scripts/match3_tutorials.gd")


func _initialize() -> void:
	assert(Tutorials.next_pending(["basic-swap", "clear-package"], [], ["level-start"]) == "basic-swap", "Tutorial order did not preserve the authored sequence")
	assert(Tutorials.next_pending(["activate-special"], [], ["level-start"]).is_empty(), "Special tutorial appeared before a special was created")
	assert(Tutorials.next_pending(["activate-special"], [], ["special-created"]) == "activate-special", "Special tutorial did not appear after special creation")
	assert(Tutorials.board_reveal_events(["", "flash-row", "", "", "flash-column", ""], 2, 3) == ["special-combo-ready"], "Adjacent specials did not reveal the combination tutorial")
	assert(Tutorials.board_reveal_events(["flash-row", "", "", "", "flash-column", ""], 2, 3).is_empty(), "Non-adjacent specials incorrectly revealed the combination tutorial")
	assert(Tutorials.reveal_events_for_move({"valid": true, "specialsCreated": 1}) == ["special-created"], "A newly created special did not produce its reveal event")
	assert(Tutorials.reveal_events_for_move({"valid": true, "specialsCreated": 0}).is_empty(), "A move without a new special produced a reveal event")
	var events := Tutorials.completion_events({"valid": true, "blockersCleared": 2, "ingredientsDropped": 1})
	assert(events == ["valid-swap", "blocker-cleared", "ingredient-dropped"], "Move completion events did not preserve all objective events")
	assert(Tutorials.completion_events({"valid": true}, true) == ["special-activated"], "Direct special activation was counted as a normal swap")
	assert(Tutorials.completion_events({"valid": true, "specialsCombined": true}, false, true) == ["valid-swap", "special-combined"], "Special combination did not report both source events")
	assert(Tutorials.completed_by_events(["clear-package", "drop-ingredient", "basic-swap"], [], events) == ["clear-package", "drop-ingredient", "basic-swap"], "Tutorial concepts did not complete from the matching move events")
	assert(Tutorials.completed_by_events(["basic-swap"], ["basic-swap"], ["valid-swap"]).is_empty(), "A completed tutorial was awarded twice")
	print("UPDS Godot Match-3 tutorial progression smoke test passed.")
	quit()
