import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/manual/Match3DifficultyDeepAudit.manual.ts'],
    fileParallelism: false,
    hookTimeout: 300_000,
  },
});
