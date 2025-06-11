import fs from 'fs/promises';
import path from 'path';

const contentDir = 'content';
const outDir = 'statamic/content/collections/profile';
const mediaDir = 'statamic/public/assets/img';

await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(mediaDir, { recursive: true });

for (const lang of await fs.readdir(contentDir)) {
  const jsonPath = path.join(contentDir, lang, 'profile.json');
  const raw = await fs.readFile(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  const md = `---\nlang: ${lang}\ntitle: ${data.tagline || ''}\n---\n` + raw;
  await fs.writeFile(path.join(outDir, `profile.${lang}.md`), md);

  const media = new Set();
  (function collect(o){
    if (typeof o === 'string' && /\.(png|jpe?g|svg|webp|avif|mp4|json)$/.test(o)) media.add(o);
    else if (Array.isArray(o)) o.forEach(collect);
    else if (o && typeof o === 'object') Object.values(o).forEach(collect);
  })(data);

  for (const file of media) {
    try {
      const base = path.basename(file);
      await fs.copyFile(file, path.join(mediaDir, base));
    } catch {}
  }
}
