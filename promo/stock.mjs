// Downloads the website's editorial photography (lib/media.ts) at full UHD width.
//   node promo/stock.mjs   -> promo/captures/stock/<photo-id>.jpg
// These are the licensed stand-ins the site itself uses (see the note in lib/media.ts). The film
// shows them as atmosphere only and never captions them as a Mindfire project.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'captures', 'stock');
fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync(path.join(HERE, '..', 'lib', 'media.ts'), 'utf8');
const urls = [...new Set(src.match(/https:\/\/images\.unsplash\.com\/[^'"\s]+/g) ?? [])];
for (const u of urls) {
    const id = u.match(/photo-[\w-]+/)[0];
    const big = u.replace(/w=\d+/, 'w=3840').replace(/q=\d+/, 'q=90');
    const r = await fetch(big);
    if (!r.ok) { console.warn('failed', id, r.status); continue; }
    fs.writeFileSync(path.join(OUT, `${id}.jpg`), Buffer.from(await r.arrayBuffer()));
    console.log('  ', id);
}
