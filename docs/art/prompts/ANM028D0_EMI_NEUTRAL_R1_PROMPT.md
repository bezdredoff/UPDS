# ANM-028D0 — Emi Neutral R1 Work prompt

Mode: built-in ChatGPT Work `imagegen` edit.  
Status: source prompt for the Studio-only candidate; not a runtime asset approval.

## Inputs

1. Approved Emi R1 preview — identity/design edit target.
2. Ayuki neutral master — approved full-body scale reference only.
3. Onoe neutral master — approved adult scale and bottom-padding reference only.

## Final generation prompt

```text
Use case: identity-preserve.
Asset type: ANM-028D0 production chroma-key source for a 1024×1536 visual-novel sprite.

Input images:
- Image 1: approved Emi R1 edit target. Preserve Emi's design and artwork.
- Image 2: approved Ayuki geometry and full-body scale reference only.
- Image 3: approved Onoe bottom-padding and adult-scale reference only.

Primary request:
Keep the character from Image 1 as unchanged as possible. Change only the canvas presentation:
1. replace the entire existing outside area with one perfectly uniform, fully opaque chroma-key green RGB #00FF00;
2. enlarge Emi uniformly by about 4%;
3. move her downward so the lowest shoe sole is approximately 28 px above the bottom edge, while keeping the complete ponytail inside the canvas.

Preserve exactly:
Emi's adult identity and visual age; face; neutral attentive expression; high reddish-brown ponytail; body proportions; pose; left relaxed arm; right hand at hip; white tied shirt; deep-red camisole; navy shorts; black watch; socks; running shoes; line work; cel shading; color palette; anatomy. Do not redesign, beautify, sexualize, re-pose, or change clothing. Images 2–3 define only target scale/footline, not Emi's appearance.

Geometry:
exactly one full-body adult character on a 1024×1536 portrait canvas; both shoes, fingers, hair tips, and entire silhouette visible; centered visual mass; scale comparable to Images 2–3; no floor shadow.

Chroma background requirements:
exact flat #00FF00 from edge to edge behind the character; no pattern, no texture, no gradient, no lighting variation, no vignette, no glow, no green bounce or spill on the character, no contact shadow.

Constraints:
no extra objects, text, logo, signature, or watermark.
```

## Technical export

The Work output was RGB chroma-key rather than RGBA. The project-bound candidate therefore uses a
deterministic green-dominance matte, edge de-spill and a lossless 19 px downward canvas translation.
It was checked on both white and `#20242b` backgrounds before inclusion.

Final candidate:
`public/assets/characters/emi/candidates/anm028d0/neutral-r1.png`.

