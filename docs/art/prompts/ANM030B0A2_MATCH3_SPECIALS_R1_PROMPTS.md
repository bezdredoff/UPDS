# ANM-030B0A2 R1 — Match-3 Special Production Prompts

## Shared generation brief

- Use case: `stylized-concept`.
- Asset type: production mobile Match-3 special-tile overlay.
- Style: approved UPDS early-2000s hybrid anime/VN item art; clean dark-indigo contour,
  simple readable forms, near-flat cel shading, restrained highlights and minimal gloss.
- Palette: muted gold, deep navy/indigo, warm ivory light and small teal accents.
- Composition: one centered identity, square master, about 12% safe transparent padding.
- Readability: preserve open negative space so the retained base tile remains visible; the
  silhouette must remain distinct at `48 px`.
- Output constraints: genuine RGBA transparency; no baked board/UI background, text,
  watermark, opaque plaque, realistic photography, painterly rendering or modern gacha gloss.

## Per-asset prompts

1. `flash-row`: compact camera-strobe emitter with a crisp long horizontal flash rail; the
   horizontal axis must be unmistakable without animation.
2. `flash-column`: exact sibling of `flash-row`, retaining device, palette and line weight while
   changing the dominant rail to an unmistakable vertical axis.
3. `evidence`: compact front-facing camera with one concise eight-ray frontal burst; communicate
   a local `3×3` area clear and avoid a row/column silhouette.
4. `lead`: tilted magnifying-glass focus locator with transparent center, simple teal focus
   brackets and one offset marked target connected by a short trace; avoid a radial burst.
5. `insight`: premium circular camera lens/viewfinder with bold concentric focus rings, four
   corner marks and controlled outward energy; strongest tier, no magnifying-glass handle.

## Transparency normalization

When a generated draft contained a drawn checkerboard, a built-in background-extraction edit
removed the complete checkerboard (including open lens areas) and required genuine alpha while
preserving the foreground. Final masters were trimmed and fitted inside `194×194`, centered on a
transparent `256×256` RGBA runtime canvas.

