import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readJson = (name: string) => JSON.parse(readFileSync(resolve(process.cwd(), 'docs', name), 'utf8')) as Record<string, unknown>;

describe('release status contract', () => {
  it('keeps every task status valid and every dependency addressable', () => {
    const source = readJson('release-status.json');
    const statuses = new Set(source.statuses as string[]);
    const tasks = source.tasks as Array<{ id: string; status: string; depends: string[] }>;
    const ids = new Set(tasks.map((task) => task.id));
    expect(tasks.length).toBeGreaterThan(0);
    for (const task of tasks) {
      expect(statuses.has(task.status), `${task.id} has unknown status`).toBe(true);
      for (const dependency of task.depends) expect(ids.has(dependency), `${task.id} depends on missing ${dependency}`).toBe(true);
    }
  });

  it('keeps known issues structured for explicit triage', () => {
    const source = readJson('known-issues.json');
    const issues = source.issues as Array<{ id: string; severity: string; status: string; evidence: string }>;
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      expect(issue.id).toMatch(/^KI-/);
      expect(issue.severity).toMatch(/^R[012]$/);
      expect(issue.status).toBeTruthy();
      expect(issue.evidence).toBeTruthy();
    }
  });
});
