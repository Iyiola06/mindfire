// Renders scenes/promo.html frame by frame.
//   node promo/render.mjs stills h                  -> out/stills/h_*.jpg + out/stills/sheet_h.jpg
//   node promo/render.mjs stills v "1.3,6.5,9.2"    -> custom times, vertical
//   node promo/render.mjs video h                   -> out/mindfire_10yr_16x9.mp4
//   node promo/render.mjs video v                   -> out/mindfire_10yr_9x16.mp4
//   add  verse=0  to any command for the cut without the scripture (adds _noverse to names)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FPS = 30, LEN = 30;

const args = process.argv.slice(2);
const noVerse = args.includes('verse=0');
const [mode = 'stills', orient = 'h', times] = args.filter((a) => a !== 'verse=0');
const V = orient === 'v';
const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
const suffix = noVerse ? '_noverse' : '';
const url = `${pathToFileURL(path.join(HERE, 'scenes/promo.html'))}?v=${V ? 1 : 0}${noVerse ? '&verse=0' : ''}`;
const OUT = path.join(HERE, 'out');
fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
page.on('pageerror', (e) => { console.error('[page error]', e.message); process.exitCode = 1; });
await page.goto(url);
await page.evaluate(() => window.ready);

const frame = async (t) => {
    await page.evaluate((tt) => window.render(tt), t);
    return page.screenshot({ type: 'jpeg', quality: 95 });
};

if (mode === 'stills') {
    const list = times ? times.split(',').map(Number) : [1.2, 3.2, 4.7, 5.6, 6.5, 8.6, 10.6, 13.6, 16.0, 19.4, 21.6, 24.4, 27.0, 28.6, 29.2];
    const files = [];
    for (const t of list) {
        const f = path.join(OUT, 'stills', `${orient}${suffix}_${t.toFixed(2)}.jpg`);
        fs.writeFileSync(f, await frame(t));
        files.push(f);
    }
    const cols = V ? 5 : 3;
    const tw = V ? 360 : 640, th = V ? 640 : 360;
    const rowsN = Math.ceil(files.length / cols);
    const inputs = files.flatMap((f) => ['-i', f]);
    const filt = files.map((_, i) => `[${i}:v]scale=${tw}:${th},drawtext=text='${list[i].toFixed(1)}s':x=10:y=10:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6[s${i}]`).join(';')
        + ';' + (files.length === 1 ? '[s0]null[o]'
            : files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * tw}_${Math.floor(i / cols) * th}`).join('|')}:fill=black[o]`);
    const sheet = path.join(OUT, 'stills', `sheet_${orient}${suffix}.jpg`);
    await new Promise((res, rej) => {
        const p = spawn(FFMPEG, ['-v', 'error', '-y', ...inputs, '-filter_complex', filt, '-map', '[o]', '-frames:v', '1', '-q:v', '3', sheet], { stdio: 'inherit' });
        p.on('exit', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`))));
    });
    console.log('sheet ->', sheet, `(${cols}x${rowsN})`);
} else {
    const name = `mindfire_10yr_${V ? '9x16' : '16x9'}${suffix}.mp4`;
    const dst = path.join(OUT, name);
    const ff = spawn(FFMPEG, [
        '-v', 'error', '-y',
        '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
        '-i', path.join(HERE, 'audio/beat_120.wav'),
        '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p',
        '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '15',
        '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', dst,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('exit', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
    const total = FPS * LEN;
    const t0 = Date.now();
    for (let n = 0; n < total; n++) {
        const buf = await frame(n / FPS);
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
        if (n % 60 === 0) console.log(`  ${orient} frame ${n}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await done;
    console.log('video ->', dst);
}
await browser.close();
