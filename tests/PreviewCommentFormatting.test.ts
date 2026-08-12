import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('mobile preview comment formatting', () => {
  it('uses printf so the PR comment contains real newlines', () => {
    const workflow = read('.github/workflows/import-zip.yml');
    expect(workflow).toContain("body=\"$(printf '📱 **GitHub Pages candidate preview:** %s\\n\\n");
    expect(workflow).toContain('gh pr comment "$PR_URL" --body "$body"');
    expect(workflow).not.toContain('gh pr comment "$PR_URL" --body "📱 **GitHub Pages candidate preview:** $PREVIEW_URL\\\\n\\\\n');
  });
});
