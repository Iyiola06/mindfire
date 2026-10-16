// Renders the 10-year flyer as PNGs.
//   node promo/flyer.mjs                                   -> out/flyer_status.png (1080x1920), out/flyer_feed.png (1080x1350)
//   node promo/flyer.mjs bg=/abs/path/estate.jpg phone=+234... verse=0
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const opts = Object.fromEntries(process.argv.slice(2).map((a) => a.split(/=(.*)/s).slice(0, 2)));
if (opts.bg && !/^(https?|file):/.test(opts.bg)) opts.bg = pathToFileURL(path.resolve(opts.bg)).href;
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
for (const [f, h] of [['status', 1920], ['feed', 1350]]) {
    const page = await browser.newPage({ viewport: { width: 1080, height: h }, deviceScaleFactor: 1 });
    page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
    const q = new URLSearchParams({ f, ...opts });
    await page.goto(`${pathToFileURL(path.join(HERE, 'scenes/flyer.html'))}?${q}`);
    await page.evaluate(() => window.ready);
    const out = path.join(HERE, 'out', `flyer_${f}.png`);
    await page.locator('#f').screenshot({ path: out });
    console.log('flyer ->', out);
}
await browser.close();
