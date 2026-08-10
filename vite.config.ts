import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const PRECACHE_PLACEHOLDER = '__RAVEN_MANOR_PRECACHE_MANIFEST__';
const CACHE_VERSION_PLACEHOLDER = '__RAVEN_MANOR_CACHE_VERSION__';

const listFiles = async (directory: string, root = directory): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(absolute, root);
    return [path.relative(root, absolute).split(path.sep).join('/')];
  }));
  return files.flat();
};

const readAppMetadata = async (): Promise<{ appVersion: string; buildLabel: string }> => {
  const source = await fs.readFile(path.resolve('src/appVersion.ts'), 'utf8');
  const appVersion = source.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1];
  const buildLabel = source.match(/BUILD_LABEL\s*=\s*['"]([^'"]+)['"]/)?.[1];
  if (!appVersion || !buildLabel) {
    throw new Error('Unable to read APP_VERSION or BUILD_LABEL');
  }
  return { appVersion, buildLabel };
};

const createBuildId = async (outDir: string, files: string[]): Promise<string> => {
  const hash = createHash('sha256');
  for (const file of files.sort()) {
    hash.update(file);
    hash.update(await fs.readFile(path.join(outDir, file)));
  }
  return hash.digest('hex').slice(0, 16);
};

const sanitiseCachePart = (value: string): string => value.replace(/[^a-zA-Z0-9._-]+/g, '-');

const precacheManifestPlugin = (): Plugin => ({
  name: 'raven-manor-precache-manifest',
  apply: 'build',
  async writeBundle(outputOptions) {
    const outDir = path.resolve(outputOptions.dir ?? 'dist');
    const serviceWorkerPath = path.join(outDir, 'sw.js');
    const metadata = await readAppMetadata();

    const initialFiles = (await listFiles(outDir))
      .filter((file) => file !== 'sw.js' && file !== 'version.json' && !file.endsWith('.map'));
    const buildId = await createBuildId(outDir, initialFiles);

    await fs.writeFile(
      path.join(outDir, 'version.json'),
      JSON.stringify({
        ...metadata,
        buildId,
        generatedAt: new Date().toISOString(),
      }, null, 2),
      'utf8',
    );

    const generatedFiles = await listFiles(outDir);
    const precachePaths = [
      './',
      ...generatedFiles
        .filter((file) => file !== 'sw.js' && !file.endsWith('.map'))
        .map((file) => `./${file}`),
    ];
    const uniquePaths = [...new Set(precachePaths)].sort();
    const cacheVersion = `raven-manor-${sanitiseCachePart(metadata.appVersion)}-${buildId}`;

    const source = await fs.readFile(serviceWorkerPath, 'utf8');
    const precacheLiteral = `'${PRECACHE_PLACEHOLDER}'`;
    const cacheVersionLiteral = `'${CACHE_VERSION_PLACEHOLDER}'`;
    if (!source.includes(precacheLiteral) || !source.includes(cacheVersionLiteral)) {
      throw new Error('Service worker build placeholders were not found');
    }

    await fs.writeFile(
      serviceWorkerPath,
      source
        .replace(precacheLiteral, JSON.stringify(uniquePaths))
        .replace(cacheVersionLiteral, `'${cacheVersion}'`),
      'utf8',
    );
  },
});

export default defineConfig({
  base: './',
  plugins: [precacheManifestPlugin()],
});
