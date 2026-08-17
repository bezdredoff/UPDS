import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distRoot = resolve(here, '..', 'dist');
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? '127.0.0.1';

if (!existsSync(join(distRoot, 'index.html'))) {
  throw new Error(`Production build is missing: ${join(distRoot, 'index.html')}`);
}

const mimeByExtension = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.mp3', 'audio/mpeg'],
  ['.ogg', 'audio/ogg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function candidatePath(pathname) {
  if (pathname === '/preview') return { redirect: '/preview/' };

  const mountedPath = pathname.startsWith('/preview/')
    ? pathname.slice('/preview'.length)
    : pathname;
  const relativePath = decodeURIComponent(mountedPath).replace(/^\/+/, '');
  const safePath = normalize(relativePath || 'index.html');
  const resolved = resolve(distRoot, safePath);

  if (resolved !== distRoot && !resolved.startsWith(`${distRoot}${sep}`)) return null;

  if (existsSync(resolved) && statSync(resolved).isFile()) return resolved;

  // UPDS is currently a single-document app. Extensionless browser navigation
  // should receive index.html; missing assets must remain real 404 responses.
  if (!extname(safePath)) return join(distRoot, 'index.html');
  return null;
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`);
  const candidate = candidatePath(requestUrl.pathname);

  if (candidate && typeof candidate === 'object' && 'redirect' in candidate) {
    response.writeHead(308, { Location: candidate.redirect });
    response.end();
    return;
  }

  if (!candidate) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end('Not found');
    return;
  }

  const contentType = mimeByExtension.get(extname(candidate).toLowerCase()) ?? 'application/octet-stream';
  response.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(candidate).pipe(response);
});

server.listen(port, host, () => {
  console.log(`UPDS production topology server: http://${host}:${port}/ and /preview/`);
});

const close = () => server.close(() => process.exit(0));
process.on('SIGINT', close);
process.on('SIGTERM', close);
