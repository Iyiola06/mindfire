// Captures stills of the live Mindfire Homes site and downloads every listing photo.
//   node promo/capture.mjs            -> promo/captures/{screens,photos}/ + manifest.json
// Captures into a temp folder and swaps it in only when every page answered 200,
// so a bad deploy or a network blip never overwrites a good set.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.SITE_URL || 'https://www.mindfirehomes.com';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FINAL = path.join(HERE, 'captures');
const TMP = path.join(HERE, 'captures.tmp');

const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };
// 2x, not 3x: Chromium refuses to decode a second ~1170x10000 image in one page, and the
// phone in the video is only ~300 px wide.
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(path.join(TMP, 'screens'), { recursive: true });
fs.mkdirSync(path.join(TMP, 'photos'), { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });

async function open(device, mode, url) {
    const ctx = await browser.newContext({ ...device, colorScheme: mode });
    // next-themes reads this key; without it the site follows the OS setting.
    await ctx.addInitScript((m) => localStorage.setItem('theme', m), mode);
    const page = await ctx.newPage();
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
    if (!res || res.status() !== 200) throw new Error(`${url} -> HTTP ${res && res.status()}`);
    await page.addStyleTag({ content: 'nextjs-portal,[data-nextjs-toast]{display:none!important}' });
    await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')));
    const vh = device.viewport.height;
    for (let y = 0; y <= vh * 4; y += vh / 2) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(160);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(900); // reveal-on-scroll transitions settle
    const broken = await page.$$eval('img', (is) => is.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    if (broken.length) console.warn('  broken images on', url, broken);
    return { ctx, page };
}

async function shot(name, device, mode, route, screens = 3) {
    const { ctx, page } = await open(device, mode, BASE + route);
    const h = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), device.viewport.height * screens);
    const file = `screens/${name}.jpg`;
    await page.screenshot({ path: path.join(TMP, file), type: 'jpeg', quality: 90, fullPage: true, clip: { x: 0, y: 0, width: device.viewport.width, height: h } });
    console.log('  ', file);
    await ctx.close();
    return file;
}

const manifest = { site: BASE, capturedAt: new Date().toISOString(), screens: {}, properties: [] };

// 1. Which listings exist right now — read from the live properties page, never hardcoded.
const { ctx: listCtx, page: listPage } = await open(DESKTOP, 'light', BASE + '/properties');
const ids = await listPage.$$eval('a[href^="/properties/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').split('/').pop()))]);
await listCtx.close();
console.log('listings:', ids.join(', '));

// 2. Screens: home, listings, about; desktop light + dark, mobile light.
for (const [key, route] of [['home', '/'], ['properties', '/properties'], ['about', '/about']]) {
    manifest.screens[`${key}_desktop_light`] = await shot(`${key}_desktop_light`, DESKTOP, 'light', route);
    manifest.screens[`${key}_desktop_dark`] = await shot(`${key}_desktop_dark`, DESKTOP, 'dark', route);
    manifest.screens[`${key}_mobile_light`] = await shot(`${key}_mobile_light`, MOBILE, 'light', route, 3);
}

// 3. Each listing: its page, its facts as the site prints them, and every photo.
for (const id of ids) {
    const { ctx, page } = await open(DESKTOP, 'light', `${BASE}/properties/${id}`);
    const facts = await page.evaluate(() => {
        const h1 = document.querySelector('h1')?.textContent?.trim() ?? '';
        const title = document.title.replace(/\s*\|\s*Mindfire Homes$/, '');
        // The <title> is "<name>, <location>"; the name may itself contain a comma.
        const loc = title.startsWith(h1) ? title.slice(h1.length).replace(/^[\s,]+|[\s.]+$/g, '') : '';
        const leaves = [...document.querySelectorAll('main *')].filter((e) => e.children.length === 0).map((e) => e.textContent.trim());
        const status = leaves.find((t) => /^Sold\b/.test(t)) ? 'Sold' : 'For Sale';
        const photos = [...new Set([...document.images].map((i) => i.currentSrc || i.src).filter((s) => /supabase\.co\/storage/.test(s)))];
        return { h1, loc, title, status, photos };
    });
    await page.screenshot({ path: path.join(TMP, `screens/listing_${id}.jpg`), type: 'jpeg', quality: 90, fullPage: true, clip: { x: 0, y: 0, width: 1440, height: 900 * 2 } });
    await ctx.close();
    const mobile = await shot(`listing_${id}_mobile`, MOBILE, 'light', `/properties/${id}`);

    const files = [];
    for (const [n, src] of facts.photos.entries()) {
        const r = await fetch(src);
        if (!r.ok) { console.warn('  photo failed', src, r.status); continue; }
        const f = `photos/${id}_${String(n + 1).padStart(2, '0')}.jpg`;
        fs.writeFileSync(path.join(TMP, f), Buffer.from(await r.arrayBuffer()));
        files.push(f);
    }
    manifest.properties.push({ id, name: facts.h1, location: facts.loc, title: facts.title, status: facts.status, screen: `screens/listing_${id}.jpg`, mobile, photos: files });
    console.log(`   ${id}: "${facts.h1}" — ${facts.loc} — ${files.length} photos ${facts.status ? `(${facts.status})` : ''}`);
}

await browser.close();
fs.writeFileSync(path.join(TMP, 'manifest.json'), JSON.stringify(manifest, null, 2));
fs.rmSync(FINAL, { recursive: true, force: true });
fs.renameSync(TMP, FINAL);
console.log('done ->', FINAL);
