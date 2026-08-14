# ANM-028D3 — Emi Surprised R1 Work prompt

Mode: built-in ChatGPT Work `imagegen`, identity-preserving edit.  
Edit target: approved `public/assets/characters/emi/candidates/anm028d0/neutral-r1.png`.  
Project output: `public/assets/characters/emi/candidates/anm028d3/frame-surprised-r1.png`.  
Candidate source id: `gpt-work-face-roi`.

## Финальный prompt

```text
Use case: identity-preserve.
Asset type: ANM-028D3 production expression edit for a visual-novel character sprite, exact 1024×1536 portrait canvas.

Input images:
- Image 1: approved Emi R1 neutral master and the sole edit target.

Primary request:
Create Emi's `surprised` expression frame. Change only the internal facial expression: make her visibly and immediately surprised by an unexpected clue, alert and curious rather than frightened. Keep both eyes open and directed exactly as in Image 1. Raise the eyebrows clearly, widen the eyes moderately while preserving their placement, shape language, iris color, and gaze, and give her a small softly open rounded mouth. The expression must read clearly at visual-novel portrait size, with controlled anime timing and no extreme deformation.

Preserve exactly from Image 1:
Emi's adult identity and visual age; face shape and head angle; eye color, eye placement and gaze direction; nose; skin tone; high reddish-brown ponytail and every outer hair strand; full-body proportions; pose; hands and fingers; left relaxed arm; right hand at hip; white tied shirt; deep-red camisole; navy shorts; black watch; socks; running shoes; line work; cel shading; color palette; lighting; complete 1024×1536 canvas geometry; subject scale, position, footline, and silhouette.

Composition/framing:
Exactly one complete full-body adult character. Keep both shoes, fingers, hair tips, and the full silhouette visible in precisely the same locations as Image 1. Keep the transparent outside area fully transparent. No floor shadow.

Constraints:
This is an expression-only edit. Do not redesign, beautify, sexualize, re-pose, rescale, translate, crop, or change clothing, anatomy, body shading, hair silhouette, background, or canvas. Do not close or wink either eye. No smile, frown, clenched teeth, screaming, oversized mouth, tears, blush, sweat, fear, panic, anger vein, props, extra objects, text, logo, signature, or watermark.
```

## Детерминированные face ROI

Полный `imagegen` result не используется как sprite: модель перерисовала остальной кадр и вывела
непрозрачный checkerboard. Из результата взяты только три источника мимики:

| ROI | Rect | Ellipse radius | Feather |
|---|---:|---:|---:|
| левый глаз/бровь | `434,211,88,74` | `41×33 px` | `sigma=4` |
| правый глаз/бровь | `488,194,92,82` | `43×37 px` | `sigma=4` |
| рот | `482,276,80,48` | `36×20 px` | `sigma=3` |

- ROI последовательно скомпозированы поверх утверждённого neutral master;
- за границами объединения трёх прямоугольников RGB исходного master не изменён;
- alpha channel принудительно восстановлен из neutral master и совпадает с ним с diff `0`;
- canvas, silhouette, alpha bounds и footline совпадают с neutral master;
- более узкая маска из ANM-028D2 отклонена: она недостаточно сохраняла поднятые брови;
- итоговый SHA-256: `6a4258117507588704d6f3994de7c74393d8b2a984889a220d788a5a27af3847`.

Это offline authoring step. Runtime получает только законченный precomposed frame и не выполняет
face-overlay composition.
