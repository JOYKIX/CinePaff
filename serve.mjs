import { publicAssets } from './public-assets.mjs';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('.');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, 'http://localhost').pathname,
      );
      const file = resolve(
        root,
        '.' + (pathname === '/' ? '/index.html' : pathname),
      );
      if (
        !file.startsWith(root + sep) ||
        !types[extname(file)] ||
        !publicAssets.includes(pathname === '/' ? 'index.html' : pathname.slice(1))
      ) {
        res.writeHead(404);
        res.end();
        return;
      }
      const content = await readFile(file);
      res.writeHead(200, {
        'Content-Type': types[extname(file)],
        'Cache-Control': 'no-store',
      });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  })
  .listen(4173, '127.0.0.1', () =>
    console.log('CinePaff preview: http://127.0.0.1:4173'),
  );
