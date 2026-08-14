# ANM-028D1 — Emi Smile R1 Work prompt

Mode: built-in ChatGPT Work `imagegen`, identity-preserving edit.  
Edit target: approved `public/assets/characters/emi/candidates/anm028d0/neutral-r1.png`.  
Project output: `public/assets/characters/emi/candidates/anm028d1/frame-smile-r1.png`.
Candidate source id: `gpt-work-face-roi`.

## Финальный prompt

```text
Use case: identity-preserve.
Asset type: ANM-028D1 production expression edit for a visual-novel character sprite, exact 1024×1536 portrait canvas.

Input images:
- Image 1: approved Emi R1 neutral master and the sole edit target.

Primary request:
Create Emi's `smile` expression frame. Change only the internal facial expression: give her a clearly readable warm, confident smile with gently raised mouth corners, a small natural smile opening or subtle upper teeth, slightly lifted cheeks, and friendly OPEN eyes. The smile must remain readable at visual-novel portrait size and clearly differ from the neutral frame, but must not become exaggerated.

Preserve exactly from Image 1:
Emi's adult identity and visual age; face shape and head angle; eye color and eye placement; eyebrows except the minimal expression change; nose; skin tone; high reddish-brown ponytail and every outer hair strand; full-body proportions; pose; hands and fingers; left relaxed arm; right hand at hip; white tied shirt; deep-red camisole; navy shorts; black watch; socks; running shoes; line work; cel shading; color palette; lighting; complete 1024×1536 canvas geometry; subject scale, position, footline, and silhouette.

Composition/framing:
Exactly one complete full-body adult character. Keep both shoes, fingers, hair tips, and the full silhouette visible in precisely the same locations as Image 1. Keep the transparent outside area fully transparent. No floor shadow.

Constraints:
This is an expression-only edit. Do not redesign, beautify, sexualize, re-pose, rescale, translate, crop, or change clothing, anatomy, body shading, hair silhouette, background, or canvas. Do not close or wink either eye. No blush, tears, props, extra objects, text, logo, signature, or watermark.
```

## Детерминированный face-ROI

Полный `imagegen` result не используется как sprite: модель перерисовала остальной кадр и вывела
непрозрачный checkerboard. Из результата взят только источник новой мимики:

- прямоугольник ROI: `x=486..573`, `y=280..321` (`88×42 px`);
- elliptical keep area: radius `40×16 px`;
- Gaussian feather: `sigma=4`;
- ROI скомпозирован поверх утверждённого neutral master;
- за границами ROI RGB исходного master не изменён;
- alpha channel, canvas, silhouette, alpha bounds и footline совпадают с neutral master;
- итоговый SHA-256: `a100dab525a18b743c267b76ac778652f5aa3c297a6c2950857e616d6b78d9f5`.

Это offline authoring step. Runtime по-прежнему получает только законченный precomposed frame и не
выполняет face-overlay composition.
