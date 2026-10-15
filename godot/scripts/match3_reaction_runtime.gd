extends RefCounted

const DATA = preload("res://data/match3_reactions.json")


func resolve(level_id: String, context: Dictionary, triggered: Dictionary) -> Dictionary:
	var rules: Array = DATA.data.get("rulesByLevel", {}).get(level_id, [])
	var selected: Dictionary = {}
	var selected_priority := -2147483648
	for candidate_value in rules:
		if not candidate_value is Dictionary: continue
		var candidate: Dictionary = candidate_value
		var candidate_id := str(candidate.get("id", ""))
		var narrative_profile := str(candidate.get("narrativeProfile", ""))
		if not narrative_profile.is_empty() and narrative_profile != str(context.get("narrativeProfile", "")):
			continue
		var modes: Array = candidate.get("modes", [])
		if not modes.is_empty() and not modes.has(str(context.get("runMode", "story"))):
			continue
		if bool(candidate.get("activeAttemptOnly", false)) and (bool(context.get("won", false)) or bool(context.get("lost", false))):
			continue
		if str(candidate.get("repeat", "once-per-attempt")) != "repeatable" and triggered.has(candidate_id):
			continue
		if not _matches_trigger(candidate.get("trigger", {}), context):
			continue
		var priority := int(candidate.get("priority", 0))
		if priority > selected_priority:
			selected = candidate
			selected_priority = priority
	if selected.is_empty(): return {}
	var reaction := selected.duplicate(true)
	reaction["params"] = {"count": int(context.get("cascades", 1))} if str(reaction.get("id", "")) == "cascade" else {}
	return reaction


func policy(reaction_id: String) -> Dictionary:
	return DATA.data.get("policies", {}).get(reaction_id, {}).duplicate(true)


func text(locale: String, message_key: String, params: Dictionary = {}) -> String:
	var localized: Dictionary = DATA.data.get("localized", {})
	var catalog: Dictionary = localized.get(locale, localized.get("en", {}))
	var result := str(catalog.get(message_key, localized.get("en", {}).get(message_key, message_key)))
	for key in params:
		result = result.replace("{%s}" % str(key), str(params[key]))
	return result


func speaker_name(locale: String, speaker: String) -> String:
	var names: Dictionary = DATA.data.get("speakerNames", {}).get(locale, DATA.data.get("speakerNames", {}).get("en", {}))
	return str(names.get(speaker, speaker))


func speaker_id(locale: String, localized_name: String) -> String:
	var names: Dictionary = DATA.data.get("speakerNames", {}).get(locale, DATA.data.get("speakerNames", {}).get("en", {}))
	for speaker in names:
		if str(names[speaker]) == localized_name: return str(speaker)
	return ""


func speaker_portrait_path(speaker: String) -> String:
	var paths: Dictionary = DATA.data.get("speakerAssets", {})
	var asset := str(paths.get(speaker, ""))
	if asset.is_empty(): return ""
	return "res://" + asset.trim_prefix("./")


func _matches_trigger(trigger_value: Variant, context: Dictionary) -> bool:
	if not trigger_value is Dictionary: return false
	var trigger: Dictionary = trigger_value
	match str(trigger.get("kind", "")):
		"moves-left":
			return int(context.get("movesLeft", -1)) == int(trigger.get("equals", -2))
		"specials-created":
			return int(context.get("specialsCreated", 0)) >= int(trigger.get("min", 0))
		"blockers-cleared":
			return int(context.get("blockersCleared", 0)) >= int(trigger.get("min", 0))
		"move-number":
			return int(context.get("moveNumber", -1)) == int(trigger.get("equals", -2))
		"cascades":
			return int(context.get("cascades", 0)) >= int(trigger.get("min", 0))
		"objective-complete":
			return (
				not bool(context.get("won", false))
				and not bool(context.get("lost", false))
				and int(context.get("objectivesCompleted", 0)) >= int(trigger.get("minCompleted", 0))
			)
		"special-activated":
			return bool(context.get("specialActivated", false))
		"special-combo":
			return bool(context.get("directSpecialCombo", false))
		"near-win":
			var remaining := int(context.get("objectiveUnitsRemaining", 0))
			return (
				not bool(context.get("won", false))
				and not bool(context.get("lost", false))
				and int(context.get("objectivesCompleted", 0)) >= int(trigger.get("minCompleted", 0))
				and remaining > 0
				and remaining <= int(trigger.get("maxUnitsRemaining", 0))
			)
	return false
