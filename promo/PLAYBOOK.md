# Promo Video Playbook

How the 30-second Sulva Sites promo was made, written so you can make the same kind of video for any web app.
Everything is generated from code. There is no screen recording, no stock footage and no licensed music, so
every render comes out identical and you can re-render after any change.

**What you get per project**

- `out/promo_16x9.mp4`: 1920×1080, 30 fps, H.264 with AAC audio (YouTube, website, LinkedIn)
- `out/promo_9x16.mp4`: 1080×1920 vertical cut (Reels, TikTok, Shorts, WhatsApp Status)
- `audio/beat_120.wav` plus 4 stems (drums, bass, music, fx) and `cues.json` with the hit times
- A DaVinci Resolve script that builds a project with both timelines, the stems on separate tracks and markers on
  every scene change

---

## 1. The prompt

Paste this into Claude Code from the root of the project you want a promo for. Fill in or delete the bracketed parts.
Claude will ask follow-up questions. The answers used for Sulva Sites are in section 2.

```text
Make a punchy 30-second promotional video for this app, in two formats: 16:9 (1920x1080) and a
9:16 vertical cut (1080x1920), both 30 fps. I'll finish it in DaVinci Resolve.

Build it entirely from code, with no screen recording, using this pipeline:
1. Capture high-res stills of the real app with headless Playwright (desktop 1440x900 @1.5x and
   mobile 390x844 @3x, light and dark modes where the app has them). Use dev/sample-data routes if
   they exist so no login or database is needed. Force lazy images to eager, wait for every image to
   load, hide dev-tool overlays, and check for broken images.
2. Synthesize an original instrumental beat in Python/numpy (no vocals, no samples, no licensing):
   [GENRE, e.g. Afro-house] at [BPM, e.g. 120] so that [N] bars fit the video exactly. Include
   kick, clap, hats, shaker, percussion, bass, chord stabs, pads, risers, impacts, whooshes, UI
   clicks, typing taps and a "ding". Export a full mix, 4 stems and a cues.json of hit times.
3. Write all the scenes as ONE HTML page in which every frame is a pure function render(t) of time
   (no CSS animations), using the brand's fonts, colours and logo rules from [BRAND DOC / CSS TOKENS].
   Lay it out for both orientations (?v=1 = vertical).
4. Render frame by frame with Playwright: call render(t), wait for image decode, screenshot to JPEG,
   pipe into ffmpeg (libx264 crf 15, yuv420p, tv range, bt709), and mux the beat.
5. Write a DaVinci Resolve Lua script (Workspace > Scripts) that creates the project, imports both
   videos and the stems, builds the 16x9 and 9x16 timelines with picture on V1, stems on A1-A4 and
   markers at every cue.

Story (lock every scene to bar lines on the beat grid):
- Hook (0-4s): the customer's problem as kinetic type, plus [a search bar / notification / etc.]
- Logo reveal (4-6s) on an impact hit
- Product montage (6-14s): real screens cutting on every beat, labelled by [category / feature]
- Product in action (14-20s): a mock of [the core workflow] with a cursor, UI sounds synced to clicks
- Outcome (20-26s): "[benefit headline]" with device mockups and feature badges popping on beats
- CTA (26-30s): "[call to action]", [URL], [offer / trial line]

Main message to hammer: [e.g. "your site is live in minutes"].
Only state claims that are true in the code or docs (counts, prices, features); check each one.

Before rendering the final video: render a contact sheet of key frames in both orientations, look at
it, and fix overlaps, cropping, broken images and off-brand details. After rendering: sample a frame
from every cut to check that the desktop and phone show the same screen. Put everything in a
promo/ folder and gitignore the media.
```

### Follow-up prompts that helped

- *"Propose a sound that does like beats, no song"* → Claude suggests genre/BPM options and maps every hit to a scene.
- *"Proceed"* → it builds the whole thing.
- After the first draft: *"Make the beat punchier / switch to amapiano 112 BPM / add a 15s cut / make a version
  for [other offer]"*. Every part is code, so each change is a re-run.

---

## 2. Decisions used for Sulva Sites (reuse as defaults)

| Decision | Choice | Why |
| --- | --- | --- |
| Length / format | 30s, 16:9 + 9:16 | One edit covers YouTube/site and every vertical platform |
| Hook | "Site live in minutes" | Speed is the strongest promise; price comes in the CTA |
| Music | Code-synthesized Afro-house, 120 BPM, F minor | Original, so no copyright risk. At 120 BPM a bar is exactly 2 s, so 15 bars = 30 s and every scene starts on a whole second |
| Frame rate | 30 fps | Social default; half the render time of 60 |
| Cut rhythm | 1 s cuts for the first 3 shots, then 0.5 s (every beat) | Builds energy into the "all designs" wall |
| Fonts / colours | From `docs/brand.md`: Inter Tight 600, Instrument Serif italic accent words, koi palette | Keeps the video identical to the product brand |

**BPM math.** One bar is 4 beats: `bar = 240 / BPM` seconds. Pick a BPM where `bar × N = video length`:
120 BPM gives 2 s bars (15 bars = 30 s, 7.5 = 15 s); 128 BPM gives 1.875 s bars (16 bars = 30 s);
112 BPM gives about 2.14 s bars (not whole seconds, which still works but gives odd timecodes).

---

## 3. Toolchain

| Tool | Used for | Install |
| --- | --- | --- |
| Node 18+ | Capture and render scripts | — |
| `playwright-core` | Driving headless Chromium | `npm i playwright-core` inside `promo/` |
| Playwright Chromium | The browser itself | Reuses the cache at `%LOCALAPPDATA%\ms-playwright\chromium-*` (`npx playwright install chromium` if missing; update the folder name in the scripts) |
| Python 3 + `numpy` | Beat synthesis | `pip install numpy imageio-ffmpeg` |
| `imageio-ffmpeg` | A full ffmpeg build with libx264 and no separate install (Playwright's bundled ffmpeg can only make VP8) | same command as above |
| DaVinci Resolve 18+ (free works) | Final polish, mix, extra exports | Lua scripting is built in, so Python setup isn't needed |
| The app's dev server | Source of screenshots | Prefer sample-data routes (here `/dev/templates/<key>`, `/dev/ui/*`) |

Disk: the full pipeline needs about 1 GB of working space (captures about 60 MB, final MP4s about 30 MB each).
Resolve needs several more GB for its cache if you edit there.

---

## 4. Folder layout

```
promo/
  PLAYBOOK.md          this file
  README.md            per-project notes: timeline, how to finish in Resolve
  package.json         { "dependencies": { "playwright-core": "..." } }
  capture.mjs          app stills -> captures/
  beat.py              beat + stems + cues.json -> audio/
  scenes/promo.html    every scene, render(t)
  render.mjs           stills (QA) or video -> out/
  resolve/*.lua        Resolve project builder
  captures/  audio/*.wav  out/       (gitignored)
```

`.gitignore` additions:

```
promo/captures/
promo/out/
promo/audio/*.wav
promo/package-lock.json
```

---

## 5. Process, step by step

### Step 1: Brief (5 min)
Settle three things: **format/length**, **the one message**, **music**. Read the brand guide (logo rules,
fonts, colours) and check every claim the video will make (counts, prices, feature names, URLs) against the
code or docs. Flag anything that isn't live yet, such as a promo price.

### Step 2: Storyboard locked to the beat grid
Write a table of time, scene, on-screen text and sound, with every boundary on a bar line. The beat and the
visuals then share one set of cue times (`cues.json`), so cuts land on hits without manual syncing.

| Bars | Time | Scene | Sound |
| --- | --- | --- | --- |
| 0–1 | 0–4 s | Hook | Low-pass filtered groove opening up, riser in bar 1, drop-out on the last beat |
| 2 | 4–6 s | Logo | Impact (sub boom + crash), pad swell, short riser |
| 3–6 | 6–14 s | Montage | Full drop: kick, claps, hats, congas, bass, stabs, whoosh per bar |
| 7–9 | 14–20 s | Product in action | Thinned groove, UI clicks, typing, pops |
| 10–12 | 20–26 s | Outcome | Full groove, snare roll in bar 12, drop-out at 25.5 s |
| 13–14 | 26–30 s | CTA | Impact + chord stab, ding on the URL, final hit at 29 s, fade |

### Step 3: Capture the app (`capture.mjs`)
- For each screen, open it in its own browser context with the device size, `colorScheme`, and an init script
  that sets the app's colour-mode localStorage key (`sulva-color-mode` here).
- Set `loading=eager` on all `img[loading=lazy]` **before** scrolling.
- Scroll through about 4 viewport heights in half-screen steps to trigger reveal-on-scroll animations, then
  scroll back to the top.
- Wait for `document.images` to all be `complete`, and log any image with `naturalWidth === 0`.
- Hide dev overlays: `nextjs-portal,[data-nextjs-toast]{display:none!important}`.
- Take a full-page JPEG clipped to about 3 screens tall (q90).
- Look at a contact sheet of the results before moving on.

### Step 4: Synthesize the beat (`beat.py`)
Every instrument is a few lines of numpy:

| Sound | Recipe |
| --- | --- |
| Kick | Sine with pitch sweeping 158 Hz → 48 Hz (exp, 30 ms) + a short noise click, tanh saturation |
| Clap | Band-passed noise (900–5000 Hz), three bursts 11 ms apart, last one with a longer tail |
| Hats / shaker | High-passed noise (7 kHz / 5–12 kHz) with very short decay; 16ths with slight swing (+18 ms on odd steps) |
| Conga | Sine 220–330 Hz with a slight pitch drop + a noise slap |
| Log-drum bass | Sine plus 2nd/3rd harmonics, gliding down into the note, saturated (amapiano style) |
| Chord stabs / pads | Additive detuned harmonics with 1/h rolloff (a "filtered saw" with no filter needed) |
| Riser | Noise + upward sine sweep, amplitude ramp `(t/len)^2.2` |
| Impact | Sine 90 → 30 Hz long decay + low-passed noise hit |
| Whoosh | Noise through a moving band-pass made from two time-varying one-pole low-passes |
| UI click / pop / key tap / ding | Tiny sine blips; ding = inharmonic partials (1, 2.76, 5.4, 8.93) |

Mix: FFT-convolution reverb on fx and music; **sidechain ducking** (bass and music dip on each kick);
tanh soft clip; normalize to about −1 dBFS; fade the last 0.8 s. Write 16-bit WAVs with the `wave` module.

QA without listening: print RMS per second (should rise and fall with the arrangement) and energy per band.
Then **listen** before rendering the final video.

### Step 5: Build the scenes (`scenes/promo.html`)
The core idea: **no CSS animations or timers. `render(t)` sets every style from `t` alone.** Any frame is
then reproducible, renders are frame-exact, and you can jump to `?t=17.2` in a browser to inspect one frame.

Building blocks to copy:

```js
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg   = (t, a, b) => clamp((t - a) / (b - a));          // 0..1 progress through a window
const lerp  = (a, b, p) => a + (b - a) * p;
const eOutExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const eOutBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2; };
// word "slam": scale 1.35 -> 1 and fade in over ~0.22 s, timed to a beat
function slam(t, at, dur = 0.22) { const p = seg(t, at, at + dur); return { o: clamp(p * 3), s: lerp(1.35, 1, eOutExpo(p)), p }; }
// image swaps must be decoded before the screenshot (see Gotchas)
window.pending = [];
function setSrc(img, src) { if (img.getAttribute("src") !== src) { img.src = src; window.pending.push(img.decode().catch(() => {})); } }
```

Patterns used:
- **Scene switch**: `if (t < 4) renderHook(t) else if (t < 6) renderLogo(t) ...`. Each scene is a div shown or hidden per frame.
- **Cut list**: an array of `{ t, screen, label }`; find the active cut, then use `local = t - cut.t` for the entrance and slow scroll.
- **Device mockups**: browser chrome (traffic-light dots and URL bar) and phone (bezel and notch) as plain divs; the screenshot inside scrolls with `translateY`.
- **Camera shake and white flash** on impact times; decaying sine offsets.
- **Fake product UI** (the editor) built in HTML so typing, colour swaps and dark mode actually change on screen. A cursor follows keyframes measured from target elements' `getBoundingClientRect()`, with a click ripple.
- **Orientation**: `?v=1` switches a layout-constants object `L` (positions and sizes) and a few `if (V)` branches. Recompose for 9:16; don't crop.
- **Background**: brand colour plus 3 big blurred drifting glows, a vignette and an SVG grain overlay. Light background for the product-in-action scene for contrast.
- `window.ready` waits for `document.fonts.ready` and preloads every capture.

### Step 6: Quick-look stills, then fix
```bash
node promo/render.mjs stills h                 # 12 default key times
node promo/render.mjs stills v 0 "1.3,6.5,9.2" # custom times, vertical
```
Tile them into one image (`ffmpeg ... -vf tile=3x4`) and look for overlapping text, crops showing the
wrong part of a screenshot, broken images, labels without spaces, and off-brand details (logo rotation, wrong
weights). Fix, then re-run.

### Step 7: Render
```bash
node promo/render.mjs video h   # about 6-7 min for 900 frames
node promo/render.mjs video v
```
Per frame: `render(t)` → await `window.pending` → JPEG screenshot (q95) → ffmpeg stdin.
ffmpeg arguments that matter:

```
-f image2pipe -framerate 30 -i -  -i audio/beat_120.wav
-vf scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p
-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709
-c:v libx264 -preset slow -crf 15 -c:a aac -b:a 320k -shortest -movflags +faststart
```

### Step 8: Verify the render
- `ffmpeg -i out/promo_16x9.mp4` should report `Duration: 00:00:30.00`, `yuv420p(tv, bt709)`, 30 fps, and an audio stream.
- Sample **one frame from every cut** (`select='eq(n\,N)+...'`, `tile`) and confirm the desktop and phone show the same screen and the labels are right.
- Watch it with sound at least once.

### Step 9: Finish in DaVinci Resolve
1. Copy `resolve/<name>.lua` to `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\`
   (macOS: `~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/`).
2. In Resolve, run **Workspace → Scripts → \<name\>**. It creates the project, sets 30 fps, imports the media, builds
   both timelines (custom resolution on the 9:16 one), puts video only on V1 and the stems on A1–A4, and adds markers.
3. Mix the stems in Fairlight, grade if needed, and export from Deliver (YouTube preset for 16:9; TikTok/Instagram
   1080×1920 for 9:16).

Key Lua calls: `Resolve()`, `pm:CreateProject` / `LoadProject`, `project:SetSetting("timelineFrameRate","30")`,
`mp:ImportMedia({path})`, `mp:CreateEmptyTimeline(name)`, `tl:SetSetting("useCustomSettings","1")`,
`tl:AddTrack("audio","stereo")`, `mp:AppendToTimeline({{mediaPoolItem=, mediaType=1|2, trackIndex=, recordFrame=tl:GetStartFrame()}})`,
`tl:AddMarker(frame, "Red", name, note, 1)`.

---

## 6. Adapting to a new project: checklist

- [ ] `capture.mjs`: base URL, list of screens (paths, devices, which have dark mode), colour-mode storage key, dev-overlay selector
- [ ] `beat.py`: BPM / bars to fit the length, key and chords (`CHORDS`), section ranges, UI-sound cue times to match the product scene
- [ ] `scenes/promo.html`:
  - [ ] brand tokens in `:root`, Google Fonts link, logo SVG path (`MARK`) and lockup rules
  - [ ] hook copy and search query
  - [ ] `CUTS` list (screens, labels, accent dots) and the wall screens
  - [ ] fake product UI: fields, demo name typed, colours, the toggle, the publish/confirm moment
  - [ ] outcome headline and `BADGES`
  - [ ] CTA headline, URL, offer line, promo pill (only if the offer is live)
- [ ] `render.mjs`: Chromium path if the cache version differs, output names
- [ ] Resolve Lua: `ROOT` path, project name, `MARKERS`
- [ ] Claims check: counts, prices, feature names and URLs all match the live product

---

## 7. Gotchas from this build (and fixes)

| Problem | Symptom | Fix |
| --- | --- | --- |
| Image swapped mid-render shows the **previous** picture | Browser and phone showed different templates on one cut | Push `img.decode()` into `window.pending` and await it before each screenshot |
| JPEG frames are full-range BT.601 | Output tagged `yuvj420p(pc)`, so colours wash out or crush on social | `scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p` plus bt709 tags |
| Lazy-loaded images | Broken image icons and alt text in mobile captures | Set `loading=eager` before scrolling, wait until every image is `complete`, log broken ones |
| A show/hide helper set `display:block` | Flex chip lost its `gap` ("RestaurantTavola") | Restore with `display = ""` (CSS default); only scene containers get `block` |
| Another `next dev` holds `.next/dev/lock` | Can't start a second server in the same folder | Use a temporary `git worktree` with a `node_modules` junction on another port, then delete it |
| Deleting a junction | `rm -rf` can delete the real target's contents | Remove junctions with `cmd /c rmdir <path>` first, then `git worktree remove --force` |
| Another session's dev server restarted into a bad state | Template route returned 404 and **overwrote good captures** | Check a page's HTTP status before batch capture; capture into a temp folder and swap it in only on success |
| Playwright's bundled ffmpeg | No H.264 encoder | Use `imageio-ffmpeg`'s binary |
| Brand rules | First draft rotated the logo mark and used weight 800 | Read the brand doc before the first render: no mark rotation, weight 600, serif-italic accent words |
| Low disk space | Renders or Resolve fail with no clear error | Check free space first (`df -h`); stream frames to ffmpeg instead of writing PNG sequences |
| Unverifiable audio | The agent can't hear the beat | RMS per second and band-energy checks, then a human listen before the final render |

---

## 8. QA checklist before posting

- [ ] Every claim is true today (counts, features, URLs); promo prices are live with the real end date
- [ ] Contact sheet in both orientations: no overlaps, crops or broken images
- [ ] One frame per cut checked for matching screens and labels
- [ ] `ffprobe` shows 30.00 s, yuv420p tv bt709, and an audio stream
- [ ] Watched with sound: hits land on cuts, nothing clips, the ending fades cleanly
- [ ] Vertical cut keeps text out of the platform UI zones (roughly the top 220 px and bottom 380 px on TikTok/Reels)

---

## 9. Timing reference (this build)

`audio/cues.json` holds the exact values. Summary:

| Cue | Time (s) |
| --- | --- |
| Riser start | 2.0 |
| Logo impact | 4.0 |
| Drop / montage | 6.0 |
| Montage cuts | 6, 7, 8, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5; wall 13.0 |
| Editor: click / type / colour / colour / dark / publish | 14.5 / 15.0–16.5 / 17.0 / 17.5 / 18.0 / 19.0 |
| Outcome hit | 20.0; badges 21.0–23.0 every 0.5 s |
| Snare roll | 24.0–25.5; drop-out 25.5 |
| CTA hit / URL ding / final hit | 26.0 / 26.5 / 29.0 |
