import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  resolve(process.cwd(), '.github/workflows/import-zip.yml'),
  'utf8',
);

describe('mobile preview Pages rerun contract', () => {
  it('uses one attempt-scoped Pages artifact name for upload and deploy', () => {
    const attemptScopedName = 'github-pages-${{ github.run_attempt }}';

    expect(workflow).toContain(`name: ${attemptScopedName}`);
    expect(workflow).toContain(`artifact_name: ${attemptScopedName}`);
    expect(workflow.split(attemptScopedName)).toHaveLength(3);
  });

  it('keeps the preview deployment on the existing GitHub Pages action pair', () => {
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v5');
    expect(workflow).toContain('uses: actions/deploy-pages@v4');
    expect(workflow).toContain('path: ${{ runner.temp }}/site');
    expect(workflow).toContain('preview_url=${{ steps.deployment.outputs.page_url }}preview/');
  });
});
