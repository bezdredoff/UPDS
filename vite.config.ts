import { defineConfig, type Plugin } from 'vite';

const githubBuildId = [
  process.env.GITHUB_JOB,
  process.env.GITHUB_RUN_ID,
  process.env.GITHUB_SHA?.slice(0, 12),
].filter(Boolean).join('-');
const buildId = process.env.VITE_BUILD_ID ?? (githubBuildId || 'local');
const buildTimestamp = new Date().toISOString();

const buildIdentityPlugin: Plugin = {
  name: 'upds-build-identity',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'build.json',
      source: `${JSON.stringify({ buildId, buildTimestamp }, null, 2)}\n`,
    });
  },
};

export default defineConfig({
  base: './',
  plugins: [buildIdentityPlugin],
  define: {
    __UPDS_BUILD_ID__: JSON.stringify(buildId),
    __UPDS_BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  build: { target: 'es2020', assetsInlineLimit: 4096 },
});
