import { defineConfig } from 'vite';
const buildId = process.env.GITHUB_SHA?.slice(0, 12) ?? process.env.VITE_BUILD_ID ?? 'local';
const buildTimestamp = new Date().toISOString();
export default defineConfig({
  base: './',
  define: {
    __UPDS_BUILD_ID__: JSON.stringify(buildId),
    __UPDS_BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  build: { target: 'es2020', assetsInlineLimit: 4096 },
});
