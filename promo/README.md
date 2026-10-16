# Mindfire Homes · 10-year anniversary film

A 30-second celebration film in two formats, built entirely from code using [PLAYBOOK.md](PLAYBOOK.md):
real listing photos and live screens from mindfirehomes.com, an original Afro-house beat synthesized in
numpy, and every frame rendered as a pure function of time. There is no stock footage and no licensed
music, so you can re-render after any change.

| Output | Spec | Use |
| --- | --- | --- |
| `out/mindfire_10yr_16x9.mp4` | 1920×1080, 30 fps, H.264 + AAC | YouTube, website, LinkedIn, office screens |
| `out/mindfire_10yr_9x16.mp4` | 1080×1920, 30 fps | Instagram Reels, TikTok, Shorts, WhatsApp Status |
| `out/*_noverse.mp4` | same, without the scripture | Platforms or partners where you'd rather not quote scripture |
| `audio/beat_120.wav` + 4 stems + `cues.json` | 48 kHz stereo | Remixing in Resolve / Fairlight |
| `resolve/mindfire_10yr.lua` | Resolve 18+ | Builds the project with both timelines, stems and markers |

## The celebration film (UHD, 60 s): built from Mindfire's own photographs

| Output | Spec |
| --- | --- |
| `out/mindfire_10yr_celebration_uhd_16x9.mp4` | 3840×2160, 24 fps |
| `out/mindfire_10yr_celebration_uhd_9x16.mp4` | 2160×3840, 24 fps |
| `out/mindfire_10yr_celebration_1080_*.mp4` | 1080p copies for WhatsApp |

| Time | Scene |
| --- | --- |
| 0–12 s | Estate at night: "Every home begins with a promise" · the layout plan: "*It's the title*" · the land: "Since 2016 · *check the title first*" |
| 12–15 s | **Ten Years**, 2016 — 2026 |
| 15–39 s | Eight chapters: walking the land · planned and documented · built from the ground up · raised with care · before → after wipe · Project Elysian (Nibeco Gardens) · communities, not just houses · finished with care |
| 39–42 s | **1,000+** proud property owners |
| 42–48 s | "From land *to keys*": the six services, each with its own photo |
| 48–51 s | "To every family who trusted us with a home — *thank you*" (the site visit) |
| 51–54 s | "Coming next · Here's to the next *ten*" over the townhouse render |
| 54–60 s | End card with falling gold leaf |

```bash
# owner photos go in captures/owner/src/<name>.jpg (names listed in scenes/celebration.html)
bash owner.sh                          # 2x lanczos upscale of the WhatsApp-compressed originals
python score.py celebration            # 60 s score, stems, cues_celebration.json
node film.mjs stills h celebration     # QA sheet; also v
node film.mjs video h celebration      # ~40 min at 4K; also v
```

The owner's photos arrived WhatsApp-compressed (~1 MP). They are shown as framed editorial cards,
or as full-width bands in the vertical cut, so they never have to fill a 4K frame on their own.
Camera originals would let the opening and stat scenes go full-bleed at native sharpness.

## The brand film (UHD, 45 s)

A slower, cinematic cut in the language of luxury-property films: piano-led score, slow camera moves,
realistic grade, editorial serif type, 2.39:1 letterbox that opens on the title.

| Output | Spec |
| --- | --- |
| `out/mindfire_10yr_film_uhd_16x9.mp4` | 3840×2160, 24 fps, H.264 High 5.1 + AAC 320k |
| `out/mindfire_10yr_film_uhd_9x16.mp4` | 2160×3840, 24 fps |
| `out/mindfire_10yr_film_1080_*.mp4` | 1080p downscales for WhatsApp and slow connections |
| `audio/score_80.wav` + `score_stem_*.wav` + `cues_film.json` | Felt piano, strings, pulse, fx |

| Time | Scene |
| --- | --- |
| 0–6 s | "Every home begins with a promise." Dusk house, letterbox |
| 6–9 s | "The real risk in buying property is rarely the price. *It's the title.*" |
| 9–12 s | "Since 2016 · So we made one promise: *check the title first.*" |
| 12–15 s | Letterbox opens: logo, **Ten Years**, 2016 — 2026, gold dust, light leak |
| 15–24 s | A decade of homes: Project Elysian (Nibeco Gardens), Jahi penthouse, Sun City duplex. No sale-status labels (owner request) |
| 24–27 s | **1,000+** proud property owners (counter) |
| 27–33 s | "From land *to keys.*" The six services |
| 33–36 s | "Every title, checked. Every document, shared. Every term, *in writing.*" |
| 36–39 s | "To every family who trusted us with a home — *thank you.*" |
| 39–45 s | "Here's to the next *ten.*" End card: logo, 2016 — 2026, mindfirehomes.com · @mindfirehomes, "Secure assets, not excuses." |

```bash
node stock.mjs            # the site's editorial photography (lib/media.ts) at 3840 px
python score.py           # -> audio/score_80.wav, stems, cues_film.json
node film.mjs stills h    # QA sheet; also: stills v
node film.mjs video h     # ~25 min at 4K; also: video v
```

The five full-frame photographs are the licensed stand-ins the website already uses (`lib/media.ts`).
In the film they are atmosphere only and never captioned as a Mindfire project; every captioned
property is a real listing. Swap in Mindfire's own drone or photo shoot by editing `STOCK` in
`scenes/film.html`.

## Flyer and anniversary copy

- `anniversary-pack.md`: long-form, social and WhatsApp copy, with a claim-by-claim audit. Every unproven number is a `[FILL]` slot, not a guess.
- `node flyer.mjs` writes `out/flyer_status.png` (1080×1920, WhatsApp/Instagram Status) and `out/flyer_feed.png` (1080×1350, groups and feed).
  Options: `bg=path/to/estate.jpg` (your own background), `phone=+234...` (adds the WhatsApp line), `verse=1` (adds Psalm 127:1).

## Storyboard (120 BPM, 1 bar = 2 s, 15 bars = 30 s)

| Time | Scene | On screen | Sound |
| --- | --- | --- | --- |
| 0–4 s | Hook | "Ten years ago, we made one promise: **Check the title** before we sell the home." A title deed slides in and **VERIFIED** stamps onto it at 3.0 s | Low-passed groove opens up, riser, stamp, drop-out at 3.5 s |
| 4–6 s | 10 | Giant bronze **10**, "YEARS", logo lockup, "redefining modern living", confetti | Impact, pad swell, short riser |
| 6–14 s | A decade of homes | Real listing photos and live site screens (desktop and phone matched) cutting on the beat, then the photo wall "A decade of homes in Abuja." | Full drop, whoosh on every cut |
| 14–20 s | The Mindfire way | The five practices from the About page stamp in one per bar, then "Diligence is the product." | Thinner groove, stamp + rising ding on each |
| 20–26 s | Thank you | "To every family who trusted us with a home — thank you." then **Psalm 127:1 (KJV)**: "Except the LORD build the house, they labour in vain that build it." | Impact, half-time breakdown under the verse, snare roll, drop-out at 25.5 s |
| 26–30 s | Next ten | Logo, "Celebrating 10 years", **Here's to the next ten.**, `mindfirehomes.com`, `hello@mindfirehomes.com` | Impact + confetti, URL ding, final hit at 29 s, fade |

Psalm 127:1 is there on purpose: it is a verse about building houses, quoted from the public-domain King
James Version. Render with `verse=0` to replace it with "Your trust is our foundation."

## Claims check (every word on screen is sourced)

| On screen | Source |
| --- | --- |
| Listing names and places | Live `/properties` pages, scraped into `captures/manifest.json` (sale status deliberately not shown) |
| "Every listing title-checked and visited by our team" | Live `/properties` page copy |
| The five practices, "Diligence is the product." | `app/about/page.tsx` (`HOW_WE_WORK`, section heading) |
| "Abuja · verified titles" | Home page eyebrow |
| "redefining modern living" | `public/logo.svg` |
| `hello@mindfirehomes.com` | `lib/contact.ts` |
| **"10 years", "Ten years ago", "A decade of homes"** | **You. Nothing in the repo or on the site states the founding year (see below)** |

### ⚠ Owner action before posting

`app/about/page.tsx` notes that an earlier version of the site said "Founded in 2015" and that this was
removed because nothing evidenced it. If the business started in 2015, the 10th anniversary was 2025; if it
started in 2016, it is this year. The film deliberately shows **no year**, only "10 years", so it is correct
either way once you confirm the decade. When you have the date, also add it to `MILESTONES` in
`app/about/page.tsx` so the site and the film tell the same story.

## Re-run everything

```bash
cd promo
npm i                                   # playwright-core only
pip install numpy                       # ffmpeg with libx264 must be on PATH (or set FFMPEG=...)
node capture.mjs                        # live site -> captures/ (screens, photos, manifest.json)
python beat.py                          # -> audio/beat_120.wav, stems, cues.json
node render.mjs stills h                # QA contact sheet -> out/stills/sheet_h.jpg
node render.mjs stills v
node render.mjs video h                 # ~3 min each
node render.mjs video v
node render.mjs video h verse=0         # optional cut without the scripture
node render.mjs video v verse=0
```

Open `scenes/promo.html?t=17.2` (add `&v=1` for vertical) in Chrome to inspect any single frame. Chrome needs
`--allow-file-access-from-files` for the local captures, or serve the folder with `npx http-server promo`.

On another machine, set `CHROME=/path/to/chrome` if Chromium isn't at `/opt/pw-browsers/...`.

## What to change for the next version

- **Add the founder story or team.** Drop real photos into `captures/photos/` and add cuts to `CUTS` in `scenes/promo.html`.
- **New listings appear automatically.** `capture.mjs` reads `/properties` live; add the new photo paths to `CUTS` / `WALL`.
- **Milestones.** Once you can evidence them (homes handed over, families housed), add a counter scene in the 20–26 s slot. Only use numbers you can show a buyer.
- **Music.** Edit `CHORDS`, `BPM` (keep `bar × 15 = 30 s`) or the section ranges in `beat.py`, then re-render.

## Gotchas hit in this build

| Problem | Fix |
| --- | --- |
| Chromium rejected `decode()` on a second ~1170×10000 capture in the same page | Phone screens are captured at 2× (not 3×) and 3 screens tall; the preload decodes one image at a time with a retry |
| Developer flyers (Skylands/Nibeco artwork) are among Project Elysian's photos | Kept out of the montage and wall; Elysian appears only as its live listing page |
| The logo is a raster trace (`public/logo.svg`, 150 KB) | The mark is redrawn as three clean polygons in `scenes/promo.html` (`MARK`) and is never rotated |
| `xstack` needs at least 2 inputs | A single still skips tiling |
| A finger over the lens in the top corners of the site-visit photo | Cropped the top 250 px of `site-visit-villa` before upscaling; re-rendered 47.5–51.5 s with `film.mjs ... from=47.5 to=51.5` and spliced it in |
| A 4K re-render takes ~45 min per orientation | `from=`/`to=` re-renders one section and splices it frame-accurately into the existing master |
