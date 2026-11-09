import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogMiddleware } from './catalog.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const api = catalogMiddleware();
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
};
createServer((req, res) =>
  api(req, res, async () => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const target = resolve(root, `.${pathname}`);
      const base = root.replace(/[\\/]$/, '');
      if (target !== base && !target.startsWith(base + sep)) {
        res.statusCode = 403;
        return res.end();
      }
      const file = extname(pathname) ? target : resolve(root, 'index.html');
      const body = await readFile(file);
      res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end('Not found');
    }
  }),
).listen(Number(process.env.PORT || 5180), process.env.HOST || '127.0.0.1', () => {
  console.info('NOCTIS production server ready. Default: http://127.0.0.1:5180');
});
