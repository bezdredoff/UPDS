import { defineConfig } from 'vite';

const githubBuildId = [
  process.env.GITHUB_JOB,
  process.env.GITHUB_RUN_ID,
  process.env.GITHUB_SHA?.slice(0, 12),
].filter(Boolean).join('-');
const buildId = process.env.VITE_BUILD_ID ?? (githubBuildId || 'local');
const buildTimestamp = new Date().toISOString();

export default defineConfig({
  base: './',
  define: {
    __UPDS_BUILD_ID__: JSON.stringify(buildId),
    __UPDS_BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  build: { target: 'es2020', assetsInlineLimit: 4096 },
});
