import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const input = process.argv[2] || '.';

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;
  const buffer = await fs.readFile(filePath);
  const base = filePath.slice(0, -ext.length);
  await sharp(buffer).toFormat('webp', { quality: 80 }).toFile(base + '.webp');
  await sharp(buffer).toFormat('avif', { quality: 80 }).toFile(base + '.avif');
  const stat = await fs.stat(filePath);
  if (stat.size <= 1024) {
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const b64 = buffer.toString('base64');
    await fs.writeFile(base + '.b64.txt', `data:${mime};base64,${b64}`);
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else await processFile(p);
  }
}

walk(input).catch(err => { console.error(err); process.exit(1); });
