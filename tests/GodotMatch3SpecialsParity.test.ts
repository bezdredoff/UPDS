import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("PG-003K Godot Match-3 special parity", () => {
  it("keeps all source special kinds wired to Godot creation and clear rules", async () => {
    const source = await readFile(new URL("../src/engine/Match3Rules.ts", import.meta.url), "utf8");
    const godot = await readFile(new URL("../godot/scripts/match3_game.gd", import.meta.url), "utf8");
    const kinds = source.match(/export type SpecialKind = ([^;]+);/)?.[1];
    expect(kinds).toBeTruthy();
    for (const kind of kinds!.match(/'[^']+'/g) ?? []) {
      expect(godot, `Godot is missing ${kind}`).toContain(kind.replaceAll("'", '"'));
    }
    for (const handler of [
      "_find_player_special_creations",
      "_find_automatic_special_creations",
      "_expand_special_clear",
      "_direct_combo_targets",
      "_lead_targets",
    ]) {
      expect(godot).toContain(`func ${handler}(`);
    }
  });

  it("gives each special a visible Godot board marker and a smoke assertion", async () => {
    const screen = await readFile(new URL("../godot/scripts/match3_screen.gd", import.meta.url), "utf8");
    const smoke = await readFile(new URL("../godot/tests/match3_model_smoke.gd", import.meta.url), "utf8");
    for (const kind of ["flash-row", "flash-column", "evidence", "lead", "insight"]) {
      expect(screen).toContain(`"${kind}"`);
      expect(smoke).toContain(kind);
    }
    expect(smoke).toContain("Direct special combo did not resolve as one move");
  });

  it("records the Godot port slice and retains the production-art follow-up boundary", async () => {
    const status = JSON.parse(await readFile(new URL("../docs/release-status.json", import.meta.url), "utf8")) as {
      tasks: Array<{ id: string; status: string; evidence: string }>;
    };
    const task = status.tasks.find(({ id }) => id === "PG-003K");
    expect(task?.status).toBe("review");
    expect(task?.evidence).toContain("direct special-swap matrix");
    const docs = await readFile(
      new URL("../docs/features/PG003K_GODOT_MATCH3_SPECIALS_RU.md", import.meta.url),
      "utf8",
    );
    expect(docs.toLowerCase()).toContain("пять production png");
    expect(docs).toContain("Этот срез переносит готовые правила игры");
  });
});
