# ANM-028D2 — Emi Serious R1 Work prompt

Mode: built-in ChatGPT Work `imagegen`, identity-preserving edit.  
Edit target: approved `public/assets/characters/emi/candidates/anm028d0/neutral-r1.png`.  
Project output: `public/assets/characters/emi/candidates/anm028d2/frame-serious-r1.png`.  
Candidate source id: `gpt-work-face-roi`.

## Финальный prompt

```text
Use case: identity-preserve.
Asset type: ANM-028D2 production expression edit for a visual-novel character sprite, exact 1024×1536 portrait canvas.

Input images:
- Image 1: approved Emi R1 neutral master and the sole edit target.

Primary request:
Create Emi's `serious` expression frame. Change only the internal facial expression: make her focused, attentive, analytical, and mildly stern. Keep both eyes open and directed exactly as in Image 1. Lower and draw the eyebrows slightly inward, add subtle upper-eyelid tension, and use a closed straight or very slightly downturned mouth. The expression must read clearly at visual-novel portrait size without looking angry, hostile, sad, frightened, or exaggerated.

Preserve exactly from Image 1:
Emi's adult identity and visual age; face shape and head angle; eye color, eye placement and gaze direction; nose; skin tone; high reddish-brown ponytail and every outer hair strand; full-body proportions; pose; hands and fingers; left relaxed arm; right hand at hip; white tied shirt; deep-red camisole; navy shorts; black watch; socks; running shoes; line work; cel shading; color palette; lighting; complete 1024×1536 canvas geometry; subject scale, position, footline, and silhouette.

Composition/framing:
Exactly one complete full-body adult character. Keep both shoes, fingers, hair tips, and the full silhouette visible in precisely the same locations as Image 1. Keep the transparent outside area fully transparent. No floor shadow.

Constraints:
This is an expression-only edit. Do not redesign, beautify, sexualize, re-pose, rescale, translate, crop, or change clothing, anatomy, body shading, hair silhouette, background, or canvas. Do not close or wink either eye. No smile, open mouth, blush, tears, sweat, anger vein, props, extra objects, text, logo, signature, or watermark.
```

## Детерминированные face ROI

Полный `imagegen` result не используется как sprite: модель перерисовала остальной кадр и вывела
непрозрачный checkerboard. Из результата взяты только три источника мимики:

| ROI | Rect | Ellipse radius | Feather |
|---|---:|---:|---:|
| левый глаз/бровь | `438,222,80,64` | `36×28 px` | `sigma=4` |
| правый глаз/бровь | `492,205,84,72` | `39×32 px` | `sigma=4` |
| рот | `484,280,76,38` | `34×15 px` | `sigma=3` |

- ROI последовательно скомпозированы поверх утверждённого neutral master;
- за границами объединения трёх прямоугольников RGB исходного master не изменён;
- alpha channel, canvas, silhouette, alpha bounds и footline совпадают с neutral master;
- единая маска всего лица отклонена: она захватывала край челюсти и checkerboard;
- итоговый SHA-256: `838f1eb2d94a248fe9a4d683fe993d815db2cbe10a14cde236875d261760c5df`.

Это offline authoring step. Runtime получает только законченный precomposed frame и не выполняет
face-overlay composition.
