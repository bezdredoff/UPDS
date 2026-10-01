import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { preservationSignatures, type FaceROI } from "./helpers/pngRgba";

type RepairAsset = {
  id: string;
  path: string;
  outputSHA256: string;
  alphaSHA256: string;
  outsideROISHA256: string;
  width: number;
  height: number;
  rois: readonly FaceROI[];
  outsideROIChanges: number;
  alphaChanges: number;
  preservationSourcePath?: string;
};
const manifest: { format: string; assets: readonly RepairAsset[] } = JSON.parse(
  readFileSync("docs/art/FACE_REPAIR_BATCH_2026-10-01.json", "utf8"),
);

describe("G4a face-only repairs preserve approved base pixels", () => {
  it("contains only the six explicitly scoped expression repairs", () => {
    expect(manifest.format).toBe("upds-face-repair-preservation-v1");
    expect(manifest.assets.map((asset) => asset.id).sort()).toEqual([
      "kurose-embarrassed",
      "kurose-surprised",
      "miku-surprised",
      "onoe-surprised",
      "rina-surprised",
      "vincent-smile",
    ]);
    expect(new Set(manifest.assets.map((asset) => asset.path)).size).toBe(6);
  });
  for (const asset of manifest.assets) {
    it(`${asset.id}: locks adopted PNG, original alpha and pixels outside face ROI`, () => {
      expect(asset.path).toMatch(/^public\/assets\/(characters|guests)\//);
      if (asset.preservationSourcePath) {
        expect(asset.id).toBe("onoe-surprised");
        expect(asset.preservationSourcePath).toBe("docs/art/onoe-alpha-2026-10-01/source-surprised.png");
      }
      // Subsequent alpha-only cleanup is independently locked by OnoeAlphaCleanup.test.ts.
      const bytes = readFileSync(asset.preservationSourcePath ?? asset.path);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.outputSHA256);
      const measured = preservationSignatures(bytes, asset.rois);
      expect([measured.width, measured.height]).toEqual([1024, 1536]);
      expect(measured.alphaSHA256).toBe(asset.alphaSHA256);
      expect(measured.outsideROISHA256).toBe(asset.outsideROISHA256);
      expect(asset.outsideROIChanges).toBe(0);
      expect(asset.alphaChanges).toBe(0);
    });
  }
});
