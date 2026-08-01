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
  copyFile(resolve(root, 'index.html'), resolve(dist, 'client', 'index.html')),
  copyFile(resolve(root, 'styles.css'), resolve(dist, 'client', 'styles.css')),
  copyFile(resolve(root, 'src', 'main.js'), resolve(dist, 'client', 'src', 'main.js')),
  copyFile(resolve(root, 'image', 'Logo.png'), resolve(dist, 'client', 'image', 'Logo.png')),
  copyFile(resolve(root, 'worker', 'index.js'), resolve(dist, 'server', 'index.js')),
]);

console.log('Grand Paff build ready.');
