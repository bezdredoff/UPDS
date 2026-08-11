import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isUsableDialogueViewport } from '../src/ui/dialogueMeasurement';

describe('ANM-016B R4 dialogue measurement safety', () => {
  it('rejects collapsed or absurdly narrow viewports before measured pagination', () => {
    expect(isUsableDialogueViewport(0, 120, 24)).toBe(false);
    expect(isUsableDialogueViewport(2, 24, 24)).toBe(false);
    expect(isUsableDialogueViewport(100, 120, 24)).toBe(false);
    expect(isUsableDialogueViewport(280, 24, 24)).toBe(false);
  });

  it('accepts a normal mobile dialogue viewport with multiple visible lines', () => {
    expect(isUsableDialogueViewport(280, 96, 24)).toBe(true);
    expect(isUsableDialogueViewport(340, 120, 27)).toBe(true);
  });

  it('uses a detached auto-height probe and never candidate-dependent source height', () => {
    const source = readFileSync(new URL('../src/ui/dialogueMeasurement.ts', import.meta.url), 'utf8');
    expect(source).toContain("probe.style.height = 'auto'");
    expect(source).toContain("probe.style.width = `${width}px`");
    expect(source).toContain('probe.scrollHeight <= safeHeight');
    expect(source).not.toContain('source.textContent = candidate');
  });
});
