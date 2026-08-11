# ANM-016A · VN Character Staging & Anchoring

Version: `0.16.1-anm016a`

## Goal

Replace the centered full-body VN presentation with a visual-novel close-up composition using the existing production character assets only.

## Changes

- No new character images were created or added.
- Existing Pose A rigs and Pose B images are enlarged and shifted below the stage so the visible frame is approximately upper-half / waist-up.
- Characters are anchored to the bottom edge of the scene instead of floating in the middle.
- Dialogue staging now resolves `left`, `right`, or `center` per line.
- Miku vs Onoe and Miku vs Ayuki use stable shot/reverse-shot lanes.
- Onoe vs Ayuki also use opposite lanes.
- External interview characters are placed opposite the detective team.
- Miku internal thoughts use a centered close shot.
- Existing placeholder cards follow the same staging lanes until ANM-017 replaces them with production portraits.
- The VN background, dialogue box, header, narrative IDs and scene order are unchanged in this subfeature.

## Non-goals

ANM-016A intentionally does not address:

- adaptive dialogue paging / text fit (ANM-016B);
- nameplate z-order (ANM-016C);
- header contrast (ANM-016D);
- new character artwork;
- Match-3 logic or motion.

## Manual QA

Check representative conversations on iPhone:

1. Miku → Onoe → Miku: Miku stays left, Onoe right.
2. Onoe ↔ Ayuki: they occupy opposite lanes.
3. Detective ↔ Emi/Kentaro/Norihiro/Mayu placeholders: team left, interviewee right.
4. Miku thoughts: centered close-up.
5. Pose B lines: same close-up / bottom-anchor rules as Pose A.
6. Character head and torso remain visible; lower body is intentionally outside the stage frame.
7. VN stage does not scroll and characters remain clipped by the stage, not by the whole page.
