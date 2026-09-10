import { publicAssets } from './public-assets.mjs';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');

if (!dist.startsWith(`${root}${sep}`)) {
  throw new Error('Invalid build directory');
}

await rm(dist, { recursive: true, force: true });
await Promise.all([
  mkdir(resolve(dist, 'client', 'image'), { recursive: true }),
  mkdir(resolve(dist, 'client', 'src'), { recursive: true }),
  mkdir(resolve(dist, 'server'), { recursive: true }),
]);

await Promise.all([
  ...publicAssets.map(path => copyFile(resolve(root, path), resolve(dist, 'client', path))),
  copyFile(resolve(root, 'worker/index.js'), resolve(dist, 'server/index.js')),
]);

console.log('CinePaff + AniPaff build ready.');
