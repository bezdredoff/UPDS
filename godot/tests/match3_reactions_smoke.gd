extends SceneTree

const Reactions = preload("res://scripts/match3_reaction_runtime.gd")


func _initialize() -> void:
	var runtime := Reactions.new()
	var context := {
		"narrativeProfile": "locker-search", "runMode": "story", "movesLeft": 23, "moveNumber": 1,
		"blockersCleared": 0, "specialsCreated": 0, "cascades": 1, "specialActivated": false,
		"directSpecialCombo": false, "objectivesCompleted": 0, "objectiveUnitsRemaining": 12,
		"won": false, "lost": false,
	}
	var reaction: Dictionary = runtime.resolve("M3_00_LOCKER_TUTORIAL", context, {})
	assert(reaction.get("id") == "ingredient-context" and reaction.get("speaker") == "onoe",
		"First move should select the authored ingredient-context reaction")
	assert(runtime.text("ru", str(reaction.messageKey)) == "Документ в верхней секции. Освободи путь к нижнему краю.",
		"Reaction copy should use the canonical Russian localization")
	assert(runtime.speaker_name("be", "ayuki") == "Аюкі", "Reaction speaker name should use the Belarusian catalog")
	assert(runtime.speaker_id("ru", "Мику") == "miku", "Localized bark names should map to the canonical speaker id")
	assert(ResourceLoader.exists(runtime.speaker_portrait_path("miku")), "Reaction speaker medallion is missing")

	context.moveNumber = 2
	context.specialsCreated = 1
	reaction = runtime.resolve("M3_00_LOCKER_TUTORIAL", context, {})
	assert(reaction.get("id") == "special-created" and reaction.get("speaker") == "miku",
		"Created special should select the authored reaction")

	context.specialsCreated = 0
	context.movesLeft = 2
	context.directSpecialCombo = true
	context.objectivesCompleted = 1
	context.objectiveUnitsRemaining = 1
	reaction = runtime.resolve("M3_00_LOCKER_TUTORIAL", context, {})
	assert(reaction.get("id") == "objective-complete", "Objective completion should outrank danger and combo reactions")
	reaction = runtime.resolve("M3_00_LOCKER_TUTORIAL", context, {"objective-complete": true})
	assert(reaction.get("id") == "danger", "A once-per-attempt reaction should not repeat")

	context.won = true
	context.directSpecialCombo = false
	context.moveNumber = 4
	context.movesLeft = 2
	assert(runtime.resolve("M3_00_LOCKER_TUTORIAL", context, {}).is_empty(),
		"Active-attempt-only dialogue should not interrupt a finished move")

	context.won = false
	context.moveNumber = 11
	context.movesLeft = 11
	context.objectivesCompleted = 1
	context.objectiveUnitsRemaining = 2
	context.directSpecialCombo = false
	reaction = runtime.resolve("M3_00_LOCKER_TUTORIAL", context, {"objective-complete": true})
	assert(reaction.get("id") == "near-win", "Near-win reaction should match its remaining-objective threshold")
	context.cascades = 3
	context.objectivesCompleted = 0
	context.objectiveUnitsRemaining = 12
	reaction = runtime.resolve("M3_00_LOCKER_TUTORIAL", context, {})
	assert(reaction.get("id") == "cascade" and reaction.get("params", {}).get("count") == 3,
		"Cascade reaction should carry the current cascade count")
	var policy: Dictionary = runtime.policy("cascade")
	assert(policy.durationMs == 1700 and policy.cooldownMs == 3600 and policy.emphasis == "light",
		"Cascade presentation timing and emphasis should match the source")
	print("UPDS Godot Match-3 reaction smoke test passed.")
	quit()
