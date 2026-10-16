// Renders scenes/film.html, the 45 s brand film, in true UHD.
//   node promo/film.mjs stills h                 -> out/stills/film_h_*.jpg + sheet (1080p-scale preview)
//   node promo/film.mjs stills v "13,20.5"
//   node promo/film.mjs video h                  -> out/mindfire_10yr_film_uhd_16x9.mp4  (3840x2160, 24 fps)
//   node promo/film.mjs video v                  -> out/mindfire_10yr_film_uhd_9x16.mp4  (2160x3840)
//   add  celebration  to any command for the 60 s cut built from the owner's photos
//   (scenes/celebration.html + audio/score_celebration_80.wav -> out/mindfire_10yr_celebration_uhd_*.mp4)
// The page is laid out at 1920x1080 (or 1080x1920) and screenshotted at deviceScaleFactor 2,
// so type and vectors are drawn natively at 4K rather than upscaled.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const args = process.argv.slice(2);
const CELEB = args.includes('celebration');
const FPS = 24, LEN = CELEB ? 60 : 45, DPR = 2;
const SCENE = CELEB ? 'celebration' : 'film';

const [mode = 'stills', orient = 'h', times] = args.filter((a) => a !== 'celebration');
const V = orient === 'v';
const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
const OUT = path.join(HERE, 'out');
fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: mode === 'video' ? DPR : 1 });
page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
page.on('pageerror', (e) => { console.error('[page error]', e.message); process.exitCode = 1; });
await page.goto(`${pathToFileURL(path.join(HERE, `scenes/${SCENE}.html`))}?v=${V ? 1 : 0}`);
await page.evaluate(() => window.ready);
const frame = async (t) => {
    await page.evaluate((tt) => window.render(tt), t);
    return page.screenshot({ type: 'jpeg', quality: 95 });
};

if (mode === 'stills') {
    const list = times ? times.split(',').map(Number)
        : CELEB ? [2.0, 7.9, 10.9, 13.8, 16.6, 19.6, 22.6, 25.6, 28.2, 29.6, 31.6, 34.6, 37.6, 40.9, 44.0, 47.0, 49.8, 52.6, 57.0]
        : [1.6, 4.0, 7.4, 8.6, 10.9, 13.4, 14.2, 16.4, 19.6, 22.6, 25.0, 26.4, 29.0, 31.5, 35.2, 37.8, 40.0, 43.0];
    const files = [];
    for (const t of list) {
        const f = path.join(OUT, 'stills', `${SCENE}_${orient}_${t.toFixed(2)}.jpg`);
        fs.writeFileSync(f, await frame(t));
        files.push(f);
    }
    const cols = V ? 6 : 3, tw = V ? 300 : 640, th = V ? 533 : 360;
    const filt = files.map((_, i) => `[${i}:v]scale=${tw}:${th},drawtext=text='${list[i].toFixed(1)}s':x=8:y=8:fontsize=24:fontcolor=yellow:box=1:boxcolor=black@0.6[s${i}]`).join(';')
        + ';' + (files.length === 1 ? '[s0]null[o]'
            : files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * tw}_${Math.floor(i / cols) * th}`).join('|')}:fill=black[o]`);
    const sheet = path.join(OUT, 'stills', `${SCENE}_sheet_${orient}.jpg`);
    await new Promise((res, rej) => {
        const p = spawn(FFMPEG, ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', filt, '-map', '[o]', '-frames:v', '1', '-q:v', '3', sheet], { stdio: 'inherit' });
        p.on('exit', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`))));
    });
    console.log('sheet ->', sheet);
} else {
    const dst = path.join(OUT, `mindfire_10yr_${SCENE}_uhd_${V ? '9x16' : '16x9'}.mp4`);
    const ff = spawn(FFMPEG, [
        '-v', 'error', '-y',
        '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
        '-i', path.join(HERE, CELEB ? 'audio/score_celebration_80.wav' : 'audio/score_80.wav'),
        '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p',
        '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-level', '5.1', '-tune', 'film',
        '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', dst,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('exit', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
    const total = FPS * LEN, t0 = Date.now();
    for (let n = 0; n < total; n++) {
        const buf = await frame(n / FPS);
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
        if (n % 96 === 0) console.log(`  ${orient} frame ${n}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await done;
    console.log('video ->', dst);
}
await browser.close();
