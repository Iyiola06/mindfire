# Foundation Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ad-hoc styling with a semantic Liquid Glass token layer, icon system, typography, and layout contract that all later sub-projects consume.

**Architecture:** All design tokens are CSS custom properties in `app/globals.css` under `:root`/`.dark`, with colors stored as space-separated RGB channel triplets so Tailwind opacity modifiers work through a `var()` bridge in `tailwind.config.ts`. Four glass material levels are `@layer components` classes that collapse to opaque fallbacks under `@supports not (backdrop-filter)` and `prefers-reduced-transparency: reduce`. Icons become local inline SVG React components; fonts become self-hosted via `next/font`.

**Tech Stack:** Next.js 15.1.6 (App Router), React 19, TypeScript 5.8, Tailwind CSS 3.4.19, Vitest + Testing Library (added by this plan), Lighthouse + `@axe-core/cli` (added by this plan).

## Global Constraints

Every task's requirements implicitly include this section.

- **Spec:** `docs/superpowers/specs/2026-08-10-foundation-design-system-design.md`.
- **No new runtime dependencies.** Motion is CSS-only. New packages go in `devDependencies` only.
- **Colors are stored as space-separated RGB channel triplets**, never hex, e.g. `--brand-600: 0 105 96;`. This is what makes `rgb(var(--brand-600) / <alpha-value>)` work.
- **Brand values, verbatim:** `--brand-700: 0 84 77`, `--brand-600: 0 105 96`, `--brand-500: 0 137 123`, `--accent-500: 201 138 74`.
- **Accent constraint:** `--accent-500` is permitted for fills, borders, icons ≥24px, and large display text only. Never for small text. Eyebrow labels use `--text-muted`.
- **Glass opacity floors:** `.glass-subtle` .72, `.glass-regular` .78, `.glass-elevated` .86, `.glass-dark` .60. Do not lower these.
- **Stacking rule:** no glass surface may be a descendant of another glass surface.
- **Motion bands:** `--dur-short: 200ms` (control transitions, 180–240ms band), `--dur-spatial: 500ms` (sheets/gallery/page, 400–600ms band). `--ease-standard: cubic-bezier(.32, .72, 0, 1)`, `--ease-spring: cubic-bezier(.34, 1.56, .64, 1)` (sheets only).
- **Nav height:** `--nav-h: 64px` below 768px, `72px` at and above 768px. `--content-max: 1280px`.
- **Breakpoints under test:** 375, 390, 768, 1024, 1440, 1920.
- **No page redesigns.** Shared-component migrations must be visually neutral-or-better on pages not yet redesigned.
- **Logo:** keep `public/logo.svg`. Do not redraw it.
- **Material Icons deletion is deferred.** The `<link>` and `.material-icons-outlined` class are removed in sub-project 5, once the final consumer is migrated. Foundation migrates only the shared layer, so the class must keep working for unmigrated pages.
- **Resolved conflict — the Material Icons `<link>` stays through Foundation.** The spec's verification list says "No `<link>` to `fonts.googleapis.com` remains in `app/layout.tsx`", which collides with the constraint above: 18 files still render Material ligatures, and without the stylesheet they display glyph *names* as literal text across the whole site. Self-hosting the icon font was the obvious escape and it does not exist — `next/font/google` exposes `Inter` (`next/dist/compiled/@next/font/dist/google/index.d.ts:6660`) but has no `Material_Icons` export at all, verified by search. So Foundation removes only the Inter stylesheet and the two `preconnect` hints, and the `fonts.googleapis.com` criterion moves to sub-project 5, where the constraint above already places the deletion. Task 5's test asserts the Inter link is gone, not that the origin is unreferenced.
- **Commit after every task.** Co-author trailer: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## File Structure

**Created**

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config: jsdom, path aliases, setup file |
| `vitest.setup.ts` | Registers `@testing-library/jest-dom` matchers |
| `scripts/measure.mjs` | Lighthouse + axe harness across the six breakpoints |
| `docs/baseline/*.json` | Captured pre-change measurements |
| `components/icons/Icon.tsx` | Shared SVG primitive: sizing, `currentColor`, ARIA |
| `components/icons/*.tsx` | One component per glyph |
| `components/icons/index.ts` | Barrel export |
| `app/design-system/page.tsx` | Showcase / acceptance surface |
| `tests/tokens.test.ts` | Asserts token layer and glass fallbacks exist |
| `tests/icons.test.tsx` | Asserts icon ARIA behaviour |
| `tests/shared-components.test.tsx` | Asserts accessible names, no truncation |
| `tests/fonts.test.ts` | Asserts no render-blocking font links remain |

**Modified**

| File | Change |
|---|---|
| `app/globals.css` | Rewritten: token layer, glass materials, motion, base |
| `tailwind.config.ts` | `var()` bridge, type scale, spacing, radii, shadows |
| `app/layout.tsx` | `next/font`, remove both Google Fonts links, drop Preloader |
| `components/layout/PublicLayout.tsx` | Nav height contract, glass nav, icon components, theme-state labelling |
| `components/ui/Button.tsx` | Token migration, `icon` becomes `ReactNode` |
| `components/ui/Badge.tsx` | Token migration |
| `components/shared/PropertyCard.tsx` | Token migration, labelled favourite, no truncation |
| `package.json` | Test + measurement scripts and devDependencies |

**Deleted**

| File | Reason |
|---|---|
| `components/shared/Preloader.tsx` | `z-[9999]` overlay gated on `window.load`; defers LCP directly |

---

### Task 1: Test harness and measurement baseline

Nothing in this repo can currently be tested or measured. This task creates both, and captures the "before" numbers the brief requires — which must happen before any visual change lands.

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `scripts/measure.mjs`
- Create: `docs/baseline/` (output directory, git-tracked)
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` (Vitest, jsdom, `@/` alias resolves to repo root). `npm run measure -- --out <dir>` writes `<dir>/lighthouse-<route>.json` and `<dir>/axe-<route>.json`.

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest@^2.1.8 @vitejs/plugin-react@^4.3.4 jsdom@^25.0.1 \
  @testing-library/react@^16.1.0 @testing-library/jest-dom@^6.6.3 \
  vite-tsconfig-paths@^5.1.4 lighthouse@^12.2.1 @axe-core/cli@^4.10.1
```

- [ ] **Step 2: Create the Vitest config**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
```

`vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Add scripts to package.json**

Add to the `scripts` object:

```json
"test": "vitest run",
"test:watch": "vitest",
"measure": "node scripts/measure.mjs"
```

- [ ] **Step 4: Write a smoke test to prove the harness runs**

`tests/harness.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('test harness', () => {
  it('can read repo files from the project root', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.name).toBe('mindfire-homes')
  })
})
```

- [ ] **Step 5: Run the smoke test**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 6: Write the measurement harness**

`scripts/measure.mjs`:

```js
#!/usr/bin/env node
// Runs Lighthouse (desktop + mobile) and axe against a running server,
// writing raw JSON to an output directory. Start the server first:
//   npm run build && npm start
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const outFlag = args.indexOf('--out')
const OUT = outFlag !== -1 ? args[outFlag + 1] : 'docs/baseline'
const BASE = process.env.MEASURE_BASE_URL ?? 'http://localhost:3000'

const ROUTES = [
  ['home', '/'],
  ['properties', '/properties'],
  ['contact', '/contact'],
]

const WIDTHS = [375, 390, 768, 1024, 1440, 1920]

mkdirSync(OUT, { recursive: true })

function run(cmd, cmdArgs) {
  try {
    return execFileSync(cmd, cmdArgs, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    })
  } catch (err) {
    // Lighthouse and axe exit non-zero when they find problems.
    // That is the expected case for a baseline run — keep the output.
    return err.stdout ?? ''
  }
}

for (const [name, path] of ROUTES) {
  const url = `${BASE}${path}`

  const lh = run('npx', [
    'lighthouse', url,
    '--quiet',
    '--output=json',
    '--chrome-flags=--headless=new --no-sandbox',
    '--only-categories=performance,accessibility,best-practices,seo',
  ])
  writeFileSync(join(OUT, `lighthouse-${name}.json`), lh)

  const axe = run('npx', [
    'axe', url,
    '--stdout',
    '--chrome-options=headless,no-sandbox',
    '--tags=wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa',
  ])
  writeFileSync(join(OUT, `axe-${name}.json`), axe)

  console.log(`measured ${name}`)
}

writeFileSync(
  join(OUT, 'meta.json'),
  JSON.stringify({ base: BASE, routes: ROUTES, widths: WIDTHS }, null, 2),
)
console.log(`wrote results to ${OUT}`)
```

- [ ] **Step 7: Capture the baseline against unmodified code**

```bash
npm run build
npm start &
npx wait-on http://localhost:3000 || sleep 10
npm run measure -- --out docs/baseline
kill %1
```

Expected: `docs/baseline/` contains `lighthouse-home.json`, `axe-home.json`, and the same pair for `properties` and `contact`, plus `meta.json`.

If `npm run build` fails because Supabase env vars are absent, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the values in `.env.local` before building. Do not commit those values.

- [ ] **Step 8: Record the headline baseline numbers**

Create `docs/baseline/README.md` with the Lighthouse category scores and axe violation counts pulled from the JSON, so the "after" comparison has a human-readable reference:

```markdown
# Baseline — captured 2026-08-10, before Foundation

Measured against commit <SHA> with `npm run measure -- --out docs/baseline`.

| Route | Performance | Accessibility | Best practices | SEO | axe critical | axe serious |
|---|---|---|---|---|---|---|
| / | | | | | | |
| /properties | | | | | | |
| /contact | | | | | | |
```

Fill every cell from the captured JSON. An empty cell is a plan failure.

- [ ] **Step 9: Commit**

```bash
git add vitest.config.ts vitest.setup.ts tests/harness.test.ts scripts/measure.mjs docs/baseline package.json package-lock.json
git commit -m "test: add Vitest harness and capture pre-redesign baseline

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Token layer

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Test: `tests/tokens.test.ts`

**Interfaces:**
- Consumes: `npm test` from Task 1.
- Produces: CSS custom properties `--brand-{700,600,500}`, `--accent-500`, `--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`, `--hairline`, `--nav-h`, `--content-max`, `--dur-short`, `--dur-spatial`, `--ease-standard`, `--ease-spring`. Tailwind colour names `brand.{700,600,500}`, `accent.500`, `bg`, `surface`, `surface-2`, `content`, `content-muted`.

- [ ] **Step 1: Write the failing test**

`tests/tokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config'

const css = readFileSync('app/globals.css', 'utf8')

describe('token layer', () => {
  it('defines brand tokens as RGB channel triplets', () => {
    expect(css).toMatch(/--brand-700:\s*0\s+84\s+77\s*;/)
    expect(css).toMatch(/--brand-600:\s*0\s+105\s+96\s*;/)
    expect(css).toMatch(/--brand-500:\s*0\s+137\s+123\s*;/)
    expect(css).toMatch(/--accent-500:\s*201\s+138\s+74\s*;/)
  })

  it('defines a dark theme override block', () => {
    expect(css).toMatch(/\.dark\s*\{/)
  })

  it('defines the layout contract', () => {
    expect(css).toMatch(/--nav-h:\s*64px\s*;/)
    expect(css).toMatch(/--nav-h:\s*72px\s*;/)
    expect(css).toMatch(/--content-max:\s*1280px\s*;/)
  })

  it('bridges tokens into Tailwind with the alpha-value placeholder', () => {
    const full = resolveConfig(tailwindConfig as never)
    const brand = full.theme.colors.brand as Record<string, string>
    expect(brand['600']).toBe('rgb(var(--brand-600) / <alpha-value>)')
    expect(full.theme.colors.surface).toBe('rgb(var(--surface) / <alpha-value>)')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/tokens.test.ts`
Expected: FAIL — `--brand-700` not found in `app/globals.css`.

- [ ] **Step 3: Write the token layer**

Replace the whole of `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand — RGB channel triplets so Tailwind alpha modifiers work */
    --brand-700:   0  84  77;
    --brand-600:   0 105  96;
    --brand-500:   0 137 123;
    --accent-500: 201 138  74;

    /* Neutrals — light theme */
    --bg:         250 250 250;
    --surface:    255 255 255;
    --surface-2:  244 245 246;
    --text:        26  26  26;
    --text-muted:  90  98 104;
    --hairline:     0   0   0;

    /* Glass — light theme */
    --glass-tint:        255 255 255;
    --glass-border:      255 255 255;
    --glass-highlight:   255 255 255;
    --glass-fallback:    255 255 255;
    --glass-fallback-2:  248 249 250;

    /* Layout contract */
    --nav-h: 64px;
    --content-max: 1280px;

    /* Motion */
    --dur-short: 200ms;
    --dur-spatial: 500ms;
    --ease-standard: cubic-bezier(.32, .72, 0, 1);
    --ease-spring: cubic-bezier(.34, 1.56, .64, 1);
  }

  @media (min-width: 768px) {
    :root { --nav-h: 72px; }
  }

  .dark {
    --bg:          15  15  15;
    --surface:     26  26  26;
    --surface-2:   34  34  34;
    --text:       245 245 245;
    --text-muted: 156 163 175;
    --hairline:   255 255 255;

    --glass-tint:       22  24  27;
    --glass-border:    255 255 255;
    --glass-highlight: 255 255 255;
    --glass-fallback:   26  26  26;
    --glass-fallback-2: 34  34  34;
  }

  body {
    background-color: rgb(var(--bg));
    color: rgb(var(--text));
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  :focus-visible {
    outline: 2px solid rgb(var(--brand-600));
    outline-offset: 2px;
  }
}

/* Retained until sub-project 5 migrates the final consumer. */
.material-icons-outlined {
  font-family: 'Material Icons Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'liga';
}
```

- [ ] **Step 4: Write the Tailwind bridge**

Replace the `theme.extend` block in `tailwind.config.ts`. Keep `content`, `darkMode`, and `plugins` exactly as they are:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    700: 'rgb(var(--brand-700) / <alpha-value>)',
                    600: 'rgb(var(--brand-600) / <alpha-value>)',
                    500: 'rgb(var(--brand-500) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--brand-600) / <alpha-value>)',
                },
                accent: {
                    500: 'rgb(var(--accent-500) / <alpha-value>)',
                    DEFAULT: 'rgb(var(--accent-500) / <alpha-value>)',
                },
                bg: 'rgb(var(--bg) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
                content: 'rgb(var(--text) / <alpha-value>)',
                'content-muted': 'rgb(var(--text-muted) / <alpha-value>)',
                hairline: 'rgb(var(--hairline) / <alpha-value>)',

                /* Legacy aliases — kept so unmigrated pages keep rendering.
                   Removed in sub-project 5. */
                primary: {
                    DEFAULT: 'rgb(var(--brand-600) / <alpha-value>)',
                    dark: 'rgb(var(--brand-700) / <alpha-value>)',
                    hover: 'rgb(var(--brand-700) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--accent-500) / <alpha-value>)',
                    hover: 'rgb(var(--accent-500) / <alpha-value>)',
                },
                background: {
                    light: 'rgb(var(--bg) / <alpha-value>)',
                    dark: 'rgb(var(--bg) / <alpha-value>)',
                },
                'text-main': {
                    light: 'rgb(var(--text) / <alpha-value>)',
                    dark: 'rgb(var(--text) / <alpha-value>)',
                },
                'text-muted': {
                    light: 'rgb(var(--text-muted) / <alpha-value>)',
                    dark: 'rgb(var(--text-muted) / <alpha-value>)',
                },
                sidebar: {
                    dark: '#0A0A0A',
                },
            },
            fontFamily: {
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
                sans: ['var(--font-text)', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'display-xl': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
                'display-lg': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
                'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
                'display-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
                'body-lg': ['1.125rem', { lineHeight: '1.65' }],
                'body': ['1rem', { lineHeight: '1.6' }],
                'body-sm': ['0.875rem', { lineHeight: '1.55' }],
                'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
            },
            spacing: {
                'nav': 'var(--nav-h)',
                'section': 'clamp(4rem, 8vw, 7.5rem)',
                'section-sm': 'clamp(2.5rem, 5vw, 4rem)',
            },
            maxWidth: {
                content: 'var(--content-max)',
            },
            borderRadius: {
                control: '0.75rem',
                surface: '1rem',
                panel: '1.5rem',
            },
            boxShadow: {
                soft: '0 2px 8px rgb(0 0 0 / 0.08)',
                hover: '0 8px 24px rgb(0 0 0 / 0.12)',
                elevated: '0 24px 48px -12px rgb(0 0 0 / 0.18)',
            },
            transitionDuration: {
                short: 'var(--dur-short)',
                spatial: 'var(--dur-spatial)',
            },
            transitionTimingFunction: {
                standard: 'var(--ease-standard)',
                spring: 'var(--ease-spring)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

export default config
```

The legacy aliases matter: `PropertiesList`, `about`, `contact`, `blog`, and every admin component still reference `bg-primary`, `text-secondary`, `bg-surface-light`, and `text-text-muted-dark`. Removing those names now would break pages this sub-project is not redesigning.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- tests/tokens.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Verify the app still builds and renders**

Run: `npm run build`
Expected: build succeeds. Then `npm run dev` and confirm `/`, `/properties`, `/about`, `/contact` still render with colours close to before — the legacy aliases now resolve through the new tokens, so primary shifts from `#00897B` to the deeper `#006960` and secondary from amber to bronze. That shift is intended.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css tailwind.config.ts tests/tokens.test.ts
git commit -m "feat: add semantic design token layer with Tailwind var() bridge

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Glass materials

**Files:**
- Modify: `app/globals.css`
- Test: `tests/tokens.test.ts` (extend)

**Interfaces:**
- Consumes: `--glass-tint`, `--glass-border`, `--glass-highlight`, `--glass-fallback` from Task 2.
- Produces: CSS classes `.glass-subtle`, `.glass-regular`, `.glass-elevated`, `.glass-dark`.

- [ ] **Step 1: Write the failing test**

Append to `tests/tokens.test.ts`:

```ts
describe('glass materials', () => {
  it('defines all four material levels', () => {
    expect(css).toMatch(/\.glass-subtle\s*\{/)
    expect(css).toMatch(/\.glass-regular\s*\{/)
    expect(css).toMatch(/\.glass-elevated\s*\{/)
    expect(css).toMatch(/\.glass-dark\s*\{/)
  })

  it('holds the specified opacity floors', () => {
    expect(css).toMatch(/--glass-alpha:\s*\.72/)
    expect(css).toMatch(/--glass-alpha:\s*\.78/)
    expect(css).toMatch(/--glass-alpha:\s*\.86/)
    expect(css).toMatch(/--glass-alpha:\s*\.6/)
  })

  it('falls back to opaque without backdrop-filter support', () => {
    expect(css).toMatch(/@supports\s+not\s*\(backdrop-filter:\s*blur\(1px\)\)/)
  })

  it('falls back to opaque under reduced transparency', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-transparency:\s*reduce\)/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/tokens.test.ts`
Expected: FAIL — `.glass-subtle` not found.

- [ ] **Step 3: Add the glass component layer**

Insert into `app/globals.css`, after the `@layer base` block and before the `.material-icons-outlined` rule:

```css
@layer components {
  .glass-subtle,
  .glass-regular,
  .glass-elevated,
  .glass-dark {
    background-color: rgb(var(--glass-tint) / var(--glass-alpha));
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat));
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat));
    border: 1px solid rgb(var(--glass-border) / var(--glass-border-alpha));
  }

  .glass-subtle {
    --glass-alpha: .72;
    --glass-blur: 20px;
    --glass-sat: 1.8;
    --glass-border-alpha: .5;
  }

  .glass-regular {
    --glass-alpha: .78;
    --glass-blur: 32px;
    --glass-sat: 1.8;
    --glass-border-alpha: .5;
    box-shadow: inset 0 1px 0 rgb(var(--glass-highlight) / .7);
  }

  .glass-elevated {
    --glass-alpha: .86;
    --glass-blur: 40px;
    --glass-sat: 1.9;
    --glass-border-alpha: .5;
    box-shadow:
      inset 0 1px 0 rgb(var(--glass-highlight) / .7),
      0 24px 48px -12px rgb(0 0 0 / .18);
  }

  /* Over bright photography. Always dark-tinted regardless of theme. */
  .glass-dark {
    --glass-tint: 16 18 20;
    --glass-alpha: .6;
    --glass-blur: 28px;
    --glass-sat: 1.7;
    --glass-border-alpha: .12;
    color: rgb(255 255 255);
  }

  .dark .glass-subtle { --glass-border-alpha: .12; }
  .dark .glass-regular { --glass-border-alpha: .12; }
  .dark .glass-elevated { --glass-border-alpha: .12; }
  .dark .glass-regular,
  .dark .glass-elevated {
    box-shadow:
      inset 0 1px 0 rgb(var(--glass-highlight) / .08),
      0 24px 48px -12px rgb(0 0 0 / .5);
  }
}

/* Fallbacks: collapse glass to a solid surface. Both guards produce the
   same result, so any browser or user setting that removes the blur still
   yields legible text at full contrast. */
@supports not (backdrop-filter: blur(1px)) {
  .glass-subtle,
  .glass-regular,
  .glass-elevated {
    background-color: rgb(var(--glass-fallback));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .glass-dark {
    background-color: rgb(16 18 20);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .glass-subtle,
  .glass-regular,
  .glass-elevated {
    background-color: rgb(var(--glass-fallback));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .glass-dark {
    background-color: rgb(16 18 20);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/tokens.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tests/tokens.test.ts
git commit -m "feat: add four Liquid Glass material levels with opaque fallbacks

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Motion primitives

**Files:**
- Modify: `app/globals.css`
- Test: `tests/tokens.test.ts` (extend)

**Interfaces:**
- Consumes: `--dur-short`, `--dur-spatial` from Task 2.
- Produces: a global `prefers-reduced-motion` guard. Tailwind `duration-short`, `duration-spatial`, `ease-standard`, `ease-spring` are already wired by Task 2's config.

- [ ] **Step 1: Write the failing test**

Append to `tests/tokens.test.ts`:

```ts
describe('motion', () => {
  it('defines durations inside the specified bands', () => {
    expect(css).toMatch(/--dur-short:\s*200ms\s*;/)
    expect(css).toMatch(/--dur-spatial:\s*500ms\s*;/)
  })

  it('collapses all motion under prefers-reduced-motion', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
    const block = css.slice(css.indexOf('prefers-reduced-motion'))
    expect(block).toMatch(/animation-duration:\s*0?\.01ms\s*!important/)
    expect(block).toMatch(/transition-duration:\s*0?\.01ms\s*!important/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/tokens.test.ts`
Expected: FAIL — no `prefers-reduced-motion` block.

- [ ] **Step 3: Add the reduced-motion guard**

Append to the end of `app/globals.css`:

```css
/* No information may be conveyed by motion alone, so collapsing every
   duration is safe. 0.01ms rather than 0 so transitionend still fires
   and JS that waits on it does not hang. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/tokens.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tests/tokens.test.ts
git commit -m "feat: add motion tokens and global reduced-motion guard

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Self-hosted typography

**Files:**
- Modify: `app/layout.tsx`
- Test: `tests/fonts.test.ts`

**Interfaces:**
- Consumes: `--font-display` / `--font-text` referenced by Task 2's `fontFamily` config.
- Produces: both CSS variables set on `<html>`. No external font requests.

- [ ] **Step 1: Write the failing test**

`tests/fonts.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const layout = readFileSync('app/layout.tsx', 'utf8')

describe('typography', () => {
  it('does not fetch Inter over the network', () => {
    expect(layout).not.toMatch(/family=Inter/)
    expect(layout).not.toMatch(/fonts\.gstatic\.com/)
  })

  // The Material Icons stylesheet is the one remaining external font request.
  // It cannot be self-hosted (no next/font/google export) and 18 files still
  // depend on it. Sub-project 5 deletes it with the last consumer.
  it('keeps only the Material Icons stylesheet, pending sub-project 5', () => {
    const googleLinks = layout.match(/fonts\.googleapis\.com[^"']*/g) ?? []
    expect(googleLinks).toHaveLength(1)
    expect(googleLinks[0]).toMatch(/Material\+Icons\+Outlined/)
  })

  it('self-hosts fonts through next/font', () => {
    expect(layout).toMatch(/from ['"]next\/font\/google['"]/)
  })

  it('exposes both type roles as CSS variables', () => {
    expect(layout).toMatch(/--font-display/)
    expect(layout).toMatch(/--font-text/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/fonts.test.ts`
Expected: FAIL — `fonts.googleapis.com` is present in `app/layout.tsx`.

- [ ] **Step 3: Convert to next/font**

Replace `app/layout.tsx` with:

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import GoogleAnalytics from '@/components/shared/GoogleAnalytics'

// One family, two roles. Splitting them at the token level means the
// display/text distinction is real and independently adjustable, rather
// than the previous config where both aliases resolved to the same stack.
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-text',
})

const interDisplay = Inter({
    subsets: ['latin'],
    display: 'swap',
    weight: ['600', '700', '800'],
    variable: '--font-display',
})

export const metadata: Metadata = {
    title: 'Mindfire Homes - Premium Real Estate',
    description: 'Find your dream home with Mindfire Homes. Explore luxury properties, apartments, and houses for sale and rent.',
    keywords: ['real estate', 'property', 'homes', 'apartments', 'houses', 'buy', 'rent'],
    icons: {
        icon: '/logo.svg',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${interDisplay.variable}`} suppressHydrationWarning>
            <head>
                {/* Cannot be self-hosted — next/font/google has no Material_Icons
                    export. 18 files still render these ligatures; sub-project 5
                    deletes this link together with the last consumer. */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <GoogleAnalytics />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
```

Three changes beyond fonts: the Inter stylesheet and both `preconnect` hints are gone (Inter is now self-hosted, and the hints pointed at an origin only Inter used at high priority), `Preloader` is no longer imported or mounted (Task 9 deletes the file), and `suppressHydrationWarning` is added to `<html>` because `next-themes` writes the theme class before React hydrates.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/fonts.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Verify no font requests hit the network**

Run `npm run dev`, open `/` with DevTools → Network filtered to `Font`. Expected: Inter served from `/_next/static/media/`, zero requests to `fonts.gstatic.com`, and exactly one `fonts.googleapis.com` request — the Material Icons stylesheet.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx tests/fonts.test.ts
git commit -m "perf: self-host Inter via next/font, drop two render-blocking requests

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Icon system

Foundation migrates only the shared layer, so only the glyphs that layer uses are built here. Later sub-projects add their own as they migrate.

**Files:**
- Create: `components/icons/Icon.tsx`
- Create: `components/icons/glyphs.tsx`
- Create: `components/icons/index.ts`
- Test: `tests/icons.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `Icon` — props `{ size?: number; label?: string; className?: string; children: React.ReactNode }`. Renders `<svg>` with `aria-hidden="true"` when `label` is absent, or `role="img"` + `<title>` when present.
  - Named components, each accepting `{ size?: number; label?: string; className?: string }`: `IconHeart`, `IconMapPin`, `IconBed`, `IconBath`, `IconArea`, `IconMenu`, `IconClose`, `IconSun`, `IconMoon`, `IconSend`, `IconCheck`, `IconSpinner`, `IconBuilding`.
  - All exported from `components/icons/index.ts`.

- [ ] **Step 1: Write the failing test**

`tests/icons.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon, IconHeart, IconMenu } from '@/components/icons'

describe('Icon primitive', () => {
  it('is hidden from assistive tech by default', () => {
    const { container } = render(<Icon><path d="M0 0h24v24H0z" /></Icon>)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role', 'img')
  })

  it('becomes an accessible image when given a label', () => {
    render(<Icon label="Add to favourites"><path d="M0 0h24v24H0z" /></Icon>)
    expect(screen.getByRole('img', { name: 'Add to favourites' })).toBeInTheDocument()
  })

  it('inherits colour from the parent', () => {
    const { container } = render(<Icon><path d="M0 0h24v24H0z" /></Icon>)
    expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor')
  })

  it('honours a custom size', () => {
    const { container } = render(<Icon size={32}><path d="M0 0h24v24H0z" /></Icon>)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
  })
})

describe('glyph components', () => {
  it('render on a 24px grid', () => {
    const { container } = render(<IconHeart />)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('pass a label through to the primitive', () => {
    render(<IconMenu label="Open menu" />)
    expect(screen.getByRole('img', { name: 'Open menu' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/icons.test.tsx`
Expected: FAIL — cannot resolve `@/components/icons`.

- [ ] **Step 3: Write the primitive**

`components/icons/Icon.tsx`:

```tsx
import React from 'react'

export interface IconProps {
  /** Rendered size in px, applied to both axes. */
  size?: number
  /**
   * Accessible name. Omit for decorative icons sitting next to visible text —
   * the icon is then hidden from assistive tech. Supply it when the icon is
   * the only content of a control.
   */
  label?: string
  className?: string
}

export const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 24,
  label,
  className,
  children,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...(label
      ? { role: 'img' as const }
      : { 'aria-hidden': 'true' as const, focusable: 'false' as const })}
  >
    {label ? <title>{label}</title> : null}
    {children}
  </svg>
)
```

- [ ] **Step 4: Write the glyphs**

`components/icons/glyphs.tsx`:

```tsx
import React from 'react'
import { Icon } from './Icon'
import type { IconProps } from './Icon'

export const IconHeart: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </Icon>
)

export const IconMapPin: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
)

export const IconBed: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </Icon>
)

export const IconBath: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1Z" />
    <path d="M6 12V5a2 2 0 0 1 2-2h1.5" />
    <path d="M9 5h2" />
    <path d="M7 20l-1 2" />
    <path d="M17 20l1 2" />
  </Icon>
)

export const IconArea: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z" />
    <path d="m7.5 10.5 2 2" />
    <path d="m10.5 7.5 2 2" />
    <path d="m13.5 4.5 2 2" />
  </Icon>
)

export const IconMenu: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Icon>
)

export const IconClose: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
)

export const IconSun: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </Icon>
)

export const IconMoon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Icon>
)

export const IconSend: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4Z" />
  </Icon>
)

export const IconCheck: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)

export const IconSpinner: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Icon>
)

export const IconBuilding: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </Icon>
)
```

`components/icons/index.ts`:

```ts
export { Icon } from './Icon'
export type { IconProps } from './Icon'
export * from './glyphs'
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- tests/icons.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add components/icons tests/icons.test.tsx
git commit -m "feat: add local inline SVG icon system for the shared layer

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Layout contract and navigation

This is the task that structurally removes the mobile header overlap. Three uncoordinated magic numbers — the nav's `py-3`/`py-5` around an `h-12` row, the homepage's `pt-20 -mt-20`, and inner pages' `pt-24` — are replaced by one `--nav-h` token.

**Files:**
- Modify: `components/layout/PublicLayout.tsx`
- Test: `tests/shared-components.test.tsx`

**Interfaces:**
- Consumes: `--nav-h` (Task 2), glass classes (Task 3), `IconMenu`/`IconClose`/`IconSun`/`IconMoon`/`IconSend`/`IconCheck`/`IconSpinner`/`IconBuilding` (Task 6).
- Produces: `PublicLayout` renders a nav of height `var(--nav-h)` and a `<main>` offset by the same token.

- [ ] **Step 1: Write the failing test**

`tests/shared-components.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PublicLayout } from '@/components/layout/PublicLayout'

vi.mock('next/navigation', () => ({
  usePathname: () => '/properties',
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

describe('PublicLayout navigation', () => {
  it('names the theme toggle by its destination state', () => {
    render(<PublicLayout><div>content</div></PublicLayout>)
    expect(
      screen.getAllByRole('button', { name: /switch to dark mode/i }).length,
    ).toBeGreaterThan(0)
  })

  it('gives the mobile menu button an accessible name and expanded state', () => {
    render(<PublicLayout><div>content</div></PublicLayout>)
    const btn = screen.getByRole('button', { name: /open menu/i })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('offsets main content by the nav height token', () => {
    const { container } = render(<PublicLayout><div>content</div></PublicLayout>)
    const main = container.querySelector('main')
    expect(main?.className).toMatch(/pt-nav/)
  })

  it('links the footer legal pages somewhere real', () => {
    render(<PublicLayout><div>content</div></PublicLayout>)
    const privacy = screen.getByRole('link', { name: /privacy policy/i })
    expect(privacy).toHaveAttribute('href', '/privacy')
  })

  it('points the discover links at filtered listings', () => {
    render(<PublicLayout><div>content</div></PublicLayout>)
    expect(screen.getByRole('link', { name: /sold properties/i }))
      .toHaveAttribute('href', '/properties?status=Sold')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/shared-components.test.tsx`
Expected: FAIL — the toggle is named "Toggle dark mode", not "Switch to dark mode".

- [ ] **Step 3: Apply the nav height contract**

In `components/layout/PublicLayout.tsx`, replace the `navClass`/`textClass` definitions and the nav element. The nav no longer changes its own padding on scroll — its height is fixed by the token, and only its material changes:

```tsx
const solid = isScrolled || !isHome || mobileMenuOpen

const navClass = `fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-short ease-standard ${
  solid ? 'glass-subtle border-b border-hairline/10 shadow-soft' : 'bg-transparent border-b border-transparent'
}`

const textClass = solid ? 'text-content' : 'text-white drop-shadow-md'
```

Replace the inner row's fixed `h-12` with the token:

```tsx
<div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
  <div className="flex h-nav items-center justify-between">
```

Change `<main>` so every route is offset by exactly the nav height, and let the homepage opt out because its hero sits under the nav deliberately:

```tsx
<main className={`flex w-full flex-1 flex-col overflow-x-hidden ${isHome ? '' : 'pt-nav'}`}>
  {children}
</main>
```

The homepage's own `pt-20 -mt-20` hack is removed in sub-project 3, which rebuilds the hero as `min-h-[100svh]`. Until then the homepage renders as it does today.

- [ ] **Step 4: Fix the theme toggle, menu button, and logo**

The toggle currently renders `brightness_4` unconditionally, so it never conveys state. Both the icon and the name must follow the theme. Replace both toggle buttons (desktop and mobile) with:

```tsx
<button
  onClick={toggleDarkMode}
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  className={`rounded-full p-2 transition-colors duration-short ease-standard hover:bg-black/10 dark:hover:bg-white/10 ${textClass}`}
>
  {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
</button>
```

Replace the mobile menu button:

```tsx
<button
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={mobileMenuOpen}
  aria-controls="mobile-nav"
  className={`p-2 ${textClass}`}
>
  {mobileMenuOpen ? <IconClose size={28} /> : <IconMenu size={28} />}
</button>
```

Add `id="mobile-nav"` to the drawer `div`, and change its `pt-24` to `pt-nav` so it uses the same token as everything else.

Give the logo a consistent treatment. `logo.svg` has an opaque white background, so it needs a contrast-safe container rather than sitting bare on a transparent nav:

```tsx
<Link href="/" className="relative z-50 flex items-center gap-3" aria-label="Mindfire Homes — home">
  <img
    src="/logo.svg"
    alt=""
    width={40}
    height={40}
    className="h-10 w-10 rounded-lg object-contain"
  />
  <span className={`font-display text-lg font-bold leading-none tracking-tight ${textClass}`}>
    MINDFIRE
  </span>
</Link>
```

`alt=""` because the adjacent wordmark already names the link, and the `aria-label` on the anchor covers the whole control. Explicit `width`/`height` prevent layout shift.

- [ ] **Step 5: Fix the footer's broken links and second brand mark**

Replace the footer brand lockup so it matches the header instead of using an unrelated `home_work` icon:

```tsx
<div className="mb-6 flex items-center gap-3">
  <img src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-contain" />
  <div>
    <p className="font-display text-xl font-bold leading-none tracking-tight text-white">MINDFIRE</p>
    <span className="block text-[0.65rem] uppercase leading-none tracking-widest text-gray-400">Homes</span>
  </div>
</div>
```

Point the Discover links at real filtered listings:

```tsx
<li><Link href="/properties?status=For+Sale" className="transition-colors hover:text-accent">New Listings</Link></li>
<li><Link href="/properties?status=Sold" className="transition-colors hover:text-accent">Sold Properties</Link></li>
<li><Link href="/properties?type=Commercial" className="transition-colors hover:text-accent">Commercial</Link></li>
```

`PropertiesList` already reads `status` from the URL. It does not yet read `type` — that filter arrives in sub-project 4, and until then the Commercial link lands on unfiltered listings rather than a dead `#`.

Replace the two dead legal anchors with real routes:

```tsx
<Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
<Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
```

Create both pages so the links do not 404. `app/privacy/page.tsx`:

```tsx
import { PublicLayout } from '@/components/layout/PublicLayout'

export const metadata = { title: 'Privacy Policy | Mindfire Homes' }

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-section sm:px-6 lg:px-8">
        <h1 className="mb-6 font-display text-display-md text-content">Privacy Policy</h1>
        <p className="text-body text-content-muted">
          This policy explains what personal information Mindfire Homes collects when you
          enquire about a property or subscribe to our newsletter, how we use it, and how to
          request its deletion. Contact us at hello@mindfirehomes.com with any questions.
        </p>
      </div>
    </PublicLayout>
  )
}
```

`app/terms/page.tsx` is the same shape with the heading "Terms of Service" and this body:

```tsx
        <p className="text-body text-content-muted">
          These terms govern your use of the Mindfire Homes website. Property listings,
          prices, and availability are indicative and subject to change until confirmed in
          writing. Contact us at hello@mindfirehomes.com with any questions.
        </p>
```

Both are placeholder-content pages by design: the brief requires the links to work, and writing actual legal copy is not an engineering task. Flag to the user that real copy is needed before launch.

Replace the three newsletter status icons: `refresh` → `<IconSpinner size={20} className="animate-spin" />`, `check` → `<IconCheck size={20} />`, `send` → `<IconSend size={20} />`.

Change the four social `hover:bg-primary` to `hover:bg-brand-600`, and leave their `href="#"` alone — real social URLs are content, not code, and belong to sub-project 2. Add a `title` to each so the placeholder is visible rather than silent:

```tsx
<a href="#" aria-label="Facebook" title="Social links coming soon" ...>
```

- [ ] **Step 6: Add the missing scroll-lock cleanup**

The existing mobile-menu effect never restores scroll on unmount, and `PropertiesList` writes the same property independently. Replace the effect:

```tsx
useEffect(() => {
  if (!mobileMenuOpen) return
  const previous = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = previous }
}, [mobileMenuOpen])
```

Saving and restoring the previous value rather than hardcoding `'unset'` is what stops the two components fighting.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- tests/shared-components.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 8: Verify the overlap is gone**

Run `npm run dev`. At 375px and 390px, on `/properties`, `/about`, `/contact`, and `/blog`: the first heading must sit fully below the nav with no clipping. Open the mobile menu and confirm the drawer content starts below the nav row.

- [ ] **Step 9: Commit**

```bash
git add components/layout/PublicLayout.tsx app/privacy app/terms tests/shared-components.test.tsx
git commit -m "fix: unify nav height contract, label icon controls, repair dead links

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Shared component migration

**Files:**
- Modify: `components/ui/Button.tsx`
- Modify: `components/ui/Badge.tsx`
- Modify: `components/shared/PropertyCard.tsx`
- Test: `tests/shared-components.test.tsx` (extend)

**Interfaces:**
- Consumes: tokens (Task 2), glass classes (Task 3), icons (Task 6).
- Produces: `Button` prop `icon` changes type from `string` to `React.ReactNode`. This is a breaking change for any caller passing a Material glyph name; grep confirms there are none — `Button` is currently used without the `icon` prop.

- [ ] **Step 1: Write the failing test**

Append to `tests/shared-components.test.tsx`:

```tsx
import { PropertyCard } from '@/components/shared/PropertyCard'
import type { Property } from '@/types'
const property: Property = {
  id: 'p1',
  name: 'A Very Long Property Name That Would Previously Have Been Clamped Away',
  address: '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  price: 145000000,
  currency: 'NGN',
  image: '/logo.svg',
  beds: 4,
  baths: 3,
  sqft: 2400,
  status: 'For Sale',
  tags: ['New'],
}

describe('PropertyCard', () => {
  it('gives the favourite control an accessible name', () => {
    render(<PropertyCard property={property} />)
    expect(screen.getByRole('button', { name: /add .* to favourites/i })).toBeInTheDocument()
  })

  it('does not truncate the property name', () => {
    const { container } = render(<PropertyCard property={property} />)
    const heading = container.querySelector('h3')
    expect(heading?.className).not.toMatch(/line-clamp-1|truncate/)
    expect(heading).toHaveTextContent(property.name)
  })

  it('does not truncate the address', () => {
    render(<PropertyCard property={property} />)
    const addr = screen.getByText(property.address)
    expect(addr.className).not.toMatch(/truncate/)
  })

  it('formats NGN prices with the naira sign', () => {
    render(<PropertyCard property={property} />)
    expect(screen.getByText(/₦145,000,000/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/shared-components.test.tsx`
Expected: FAIL — the favourite button has no accessible name.

- [ ] **Step 3: Migrate PropertyCard**

Replace the favourite button. It needs a name, and the name must identify *which* property, because a listings grid renders many of them:

```tsx
<button
  type="button"
  aria-label={`Add ${property.name} to favourites`}
  className="glass-subtle absolute right-4 top-4 z-10 rounded-full p-2 text-content transition-colors duration-short ease-standard hover:text-red-500"
  onClick={(e) => { e.preventDefault() }}
>
  <IconHeart size={18} />
</button>
```

The handler stays a no-op — favouriting has no backing store, and inventing one is out of scope. The `aria-label` now describes what the control *will* do, which is honest, and the control is reachable and named.

Remove the truncation. `line-clamp-1` on the name and `truncate` on the address are the "truncated fields" defect:

```tsx
<h3 className="mb-2 font-display text-lg font-semibold text-content transition-colors duration-short group-hover:text-brand-600">
  {property.name}
</h3>
<p className="mb-4 flex items-start gap-1.5 text-body-sm text-content-muted">
  <IconMapPin size={16} className="mt-0.5 shrink-0" />
  <span>{property.address}</span>
</p>
```

Swap the three stat icons for `IconBed`, `IconBath`, `IconArea` at `size={16}` with `className="text-brand-600"`, and migrate the container classes from `bg-surface-light dark:bg-surface-dark` / `border-gray-100 dark:border-gray-800` to `bg-surface` / `border-hairline/10`.

Consolidate the price into a single text node. It currently renders the currency sign and the number as two sibling JSX expressions, which splits them across two DOM text nodes — the price is one value and should be one node:

```tsx
<p className="font-display text-xl font-bold text-brand-600">
  {`${property.currency === 'NGN' ? '₦' : '$'}${property.price.toLocaleString('en-NG')}`}
</p>
```

`'en-NG'` is passed explicitly rather than relying on the ambient locale, so the grouping separators are stable in tests and in every visitor's browser.

- [ ] **Step 4: Migrate Button**

Change the `icon` prop type and render it as a node:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}
```

```tsx
{icon && <span className={children ? 'mr-2' : ''}>{icon}</span>}
{children}
```

Update the variant classes to tokens, and the base classes to use the motion and radius tokens:

```tsx
const baseClasses = 'inline-flex items-center justify-center rounded-control font-medium transition-all duration-short ease-standard focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/25',
  secondary: 'bg-accent-500 text-white hover:brightness-95 shadow-lg shadow-accent-500/25',
  outline: 'border-2 border-brand-600 text-brand-600 hover:bg-brand-600/5',
  ghost: 'text-content-muted hover:text-brand-600 hover:bg-content/5',
};
```

- [ ] **Step 5: Migrate Badge**

Replace the `primary` and `secondary` entries in `colorMap`; leave the semantic colours alone:

```tsx
primary: 'bg-brand-600 text-white',
secondary: 'bg-accent-500 text-[rgb(26_26_26)]',
```

White on `accent-500` is 2.90:1 — it fails AA, so the secondary badge takes near-black text rather than white. `brand-600` behind white is 6.4:1 and passes.

- [ ] **Step 6: Move the small-text accent violations off the accent colour**

The spec's accent constraint prohibits `--accent-500` on small text. Six eyebrow labels currently use `text-secondary` at `text-xs`, which resolves to bronze after Task 2 — roughly 2.9:1 on white, still under 4.5:1. All six share the same class string. Change `text-secondary` to `text-content-muted` on exactly these lines:

- `app/about/page.tsx:22` — "Who We Are"
- `app/about/page.tsx:78` — "The Mindfire Way"
- `app/properties/page.tsx:22` — "Redefining Modern Living"
- `app/page.tsx:64` — "Premium Selection"
- `app/contact/page.tsx:56` — "We're Here to Help"
- `app/blog/page.tsx:28` — "Insights & News"

Verify with `git grep -n 'text-secondary font-bold text-xs'` that no matches remain.

Leave the other `text-secondary` uses alone — they are permitted by the constraint:

- `app/page.tsx:48`, `app/page.tsx:139`, `:145`, `:149` — large display text.
- `app/blog/page.tsx:51` — a hover state on a `text-3xl md:text-5xl` heading over a photograph.
- `app/admin/page.tsx:67` — an icon colour, not text.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all suites.

- [ ] **Step 8: Verify unredesigned pages still look right**

Run `npm run dev` and check `/`, `/properties`, `/about`, `/contact`. These pages are not redesigned yet; the requirement is neutral-or-better, not identical. Cards should now show full names and addresses.

- [ ] **Step 9: Commit**

```bash
git add components/ui/Button.tsx components/ui/Badge.tsx components/shared/PropertyCard.tsx app/about/page.tsx app/properties/page.tsx app/page.tsx app/contact/page.tsx app/blog/page.tsx tests/shared-components.test.tsx
git commit -m "feat: migrate shared components to tokens, fix truncation and unlabelled controls

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Remove the blocking preloader

**Files:**
- Delete: `components/shared/Preloader.tsx`
- Test: `tests/fonts.test.ts` (extend)

**Interfaces:**
- Consumes: Task 5 already removed the import and mount from `app/layout.tsx`.
- Produces: no `Preloader` module in the repo.

- [ ] **Step 1: Write the failing test**

Append to `tests/fonts.test.ts`:

```ts
import { existsSync } from 'node:fs'

describe('render blocking', () => {
  it('has no full-screen preloader overlay', () => {
    expect(existsSync('components/shared/Preloader.tsx')).toBe(false)
    expect(layout).not.toMatch(/Preloader/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/fonts.test.ts`
Expected: FAIL — `components/shared/Preloader.tsx` still exists.

- [ ] **Step 3: Confirm nothing else imports it**

Run: `git grep -n "Preloader"`
Expected: no matches outside `components/shared/Preloader.tsx` itself. If any page imports it, remove that import before deleting.

- [ ] **Step 4: Delete the file**

```bash
git rm components/shared/Preloader.tsx
```

It was a `z-[9999]` overlay that hid the page until `document.fonts.ready` and `window.load` both resolved — deferring the largest contentful paint by design. Self-hosted fonts remove the reason it existed. No replacement loading treatment is added here; per-route `loading.tsx` belongs to the page sub-projects.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- tests/fonts.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "perf: delete full-screen preloader that deferred LCP

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Design system showcase

The acceptance surface for the whole system, and the reference sub-projects 3–6 build against.

**Files:**
- Create: `app/design-system/page.tsx`

**Interfaces:**
- Consumes: every token, material, and component from Tasks 2–8.
- Produces: a `noindex` route at `/design-system`.

- [ ] **Step 1: Write the showcase page**

`app/design-system/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  IconHeart, IconMapPin, IconBed, IconBath, IconArea, IconMenu,
  IconClose, IconSun, IconMoon, IconSend, IconCheck, IconSpinner, IconBuilding,
} from '@/components/icons'

export const metadata: Metadata = {
  title: 'Design System | Mindfire Homes',
  robots: { index: false, follow: false },
}

const PHOTO =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'

const MATERIALS = [
  ['glass-subtle', 'Nav, small controls', '.72 / blur 20px'],
  ['glass-regular', 'Search panels, menus', '.78 / blur 32px'],
  ['glass-elevated', 'Modal sheets, booking panels', '.86 / blur 40px'],
  ['glass-dark', 'Over bright photography', '.60 / blur 28px'],
] as const

const ICONS = [
  ['IconHeart', <IconHeart key="h" />], ['IconMapPin', <IconMapPin key="m" />],
  ['IconBed', <IconBed key="b" />], ['IconBath', <IconBath key="ba" />],
  ['IconArea', <IconArea key="a" />], ['IconMenu', <IconMenu key="mn" />],
  ['IconClose', <IconClose key="c" />], ['IconSun', <IconSun key="s" />],
  ['IconMoon', <IconMoon key="mo" />], ['IconSend', <IconSend key="se" />],
  ['IconCheck', <IconCheck key="ch" />], ['IconSpinner', <IconSpinner key="sp" />],
  ['IconBuilding', <IconBuilding key="bu" />],
] as const

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-hairline/10 py-section-sm">
      <h2 className="mb-1 font-display text-display-sm text-content">{title}</h2>
      {note && <p className="mb-6 text-body-sm text-content-muted">{note}</p>}
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-content px-4 py-section sm:px-6 lg:px-8">
        <h1 className="font-display text-display-lg text-content">Liquid Glass Design System</h1>
        <p className="mt-2 max-w-2xl text-body-lg text-content-muted">
          Acceptance surface for the Foundation sub-project. Toggle your OS between light and
          dark, enable reduced transparency and reduced motion, and disable{' '}
          <code>backdrop-filter</code> in DevTools — every state below must stay legible.
        </p>

        <Section title="Glass materials over photography" note="The real test: text legibility over an arbitrary image.">
          <div className="relative overflow-hidden rounded-panel">
            <img src={PHOTO} alt="" className="h-[28rem] w-full object-cover" />
            <div className="absolute inset-0 grid grid-cols-1 content-center gap-4 p-6 sm:grid-cols-2">
              {MATERIALS.map(([cls, use, spec]) => (
                <div key={cls} className={`${cls} rounded-surface p-5`}>
                  <p className="font-display text-base font-semibold">{cls}</p>
                  <p className="text-body-sm opacity-80">{use}</p>
                  <p className="mt-1 text-label uppercase opacity-70">{spec}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Glass materials on a solid surface">
          <div className="grid grid-cols-1 gap-4 rounded-panel bg-surface-2 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {MATERIALS.map(([cls]) => (
              <div key={cls} className={`${cls} rounded-surface p-5`}>
                <p className="font-display text-base font-semibold">{cls}</p>
                <p className="text-body-sm opacity-80">Body text at full contrast.</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Colour" note="accent-500 is for fills, borders, icons ≥24px, and large display text only — never small text.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              ['brand-700', 'bg-brand-700'], ['brand-600', 'bg-brand-600'],
              ['brand-500', 'bg-brand-500'], ['accent-500', 'bg-accent-500'],
              ['surface-2', 'bg-surface-2'],
            ].map(([name, cls]) => (
              <div key={name}>
                <div className={`${cls} h-20 rounded-surface border border-hairline/10`} />
                <p className="mt-2 text-label uppercase text-content-muted">{name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Type scale">
          <div className="space-y-3">
            <p className="font-display text-display-xl text-content">Display XL</p>
            <p className="font-display text-display-lg text-content">Display LG</p>
            <p className="font-display text-display-md text-content">Display MD</p>
            <p className="font-display text-display-sm text-content">Display SM</p>
            <p className="text-body-lg text-content">Body large — introductory paragraphs.</p>
            <p className="text-body text-content">Body — default reading size.</p>
            <p className="text-body-sm text-content-muted">Body small — captions and metadata.</p>
            <p className="text-label uppercase text-content-muted">Label — eyebrows and field labels</p>
          </div>
        </Section>

        <Section title="Buttons — every state">
          <div className="space-y-4">
            {(['primary', 'secondary', 'outline', 'ghost'] as const).map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-3">
                <Button variant={variant} size="sm">Small</Button>
                <Button variant={variant}>Default</Button>
                <Button variant={variant} size="lg">Large</Button>
                <Button variant={variant} icon={<IconSend size={16} />}>With icon</Button>
                <Button variant={variant} disabled>Disabled</Button>
              </div>
            ))}
            <p className="text-body-sm text-content-muted">
              Tab through the row above — every control must show a visible focus ring.
            </p>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            {(['primary', 'secondary', 'gray', 'red', 'green', 'blue', 'yellow'] as const).map((c) => (
              <Badge key={c} color={c}>{c}</Badge>
            ))}
          </div>
        </Section>

        <Section title="Icons" note="24px grid, currentColor, aria-hidden unless given a label.">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-8">
            {ICONS.map(([name, node]) => (
              <div key={name} className="flex flex-col items-center gap-2 rounded-surface bg-surface p-4 text-content">
                {node}
                <span className="text-center text-[0.65rem] text-content-muted">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Motion" note="Hover each tile. Enable reduced motion and confirm they stop moving.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="cursor-pointer rounded-surface bg-surface p-6 shadow-soft transition-all duration-short ease-standard hover:-translate-y-1 hover:shadow-hover">
              <p className="font-display font-semibold text-content">duration-short — 200ms</p>
              <p className="text-body-sm text-content-muted">Controls, hover, focus. 180–240ms band.</p>
            </div>
            <div className="cursor-pointer rounded-surface bg-surface p-6 shadow-soft transition-all duration-spatial ease-spring hover:-translate-y-2 hover:shadow-elevated">
              <p className="font-display font-semibold text-content">duration-spatial — 500ms</p>
              <p className="text-body-sm text-content-muted">Sheets, gallery, page transitions. 400–600ms band.</p>
            </div>
          </div>
        </Section>

        <Section title="Layout contract">
          <dl className="grid grid-cols-2 gap-4 text-body-sm sm:grid-cols-4">
            {[
              ['--nav-h', '64px / 72px ≥768'],
              ['--content-max', '1280px'],
              ['--dur-short', '200ms'],
              ['--dur-spatial', '500ms'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-surface bg-surface p-4">
                <dt className="font-mono text-label text-content-muted">{k}</dt>
                <dd className="mt-1 font-display font-semibold text-content">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: build succeeds, `/design-system` appears in the route list.

- [ ] **Step 3: Walk the acceptance checklist**

Run `npm run dev`, open `/design-system`, and confirm each item:

- Every material reads legibly over the photograph in light and dark.
- DevTools → Rendering → emulate `prefers-reduced-transparency: reduce` → all glass renders solid, nothing becomes unreadable.
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → hover tiles no longer animate.
- In DevTools, add `backdrop-filter: none !important` to `.glass-subtle, .glass-regular, .glass-elevated, .glass-dark` → all four stay legible.
- Tab through the buttons — every one shows a visible focus ring.
- At 375px, nothing overflows horizontally.

- [ ] **Step 4: Run axe against the showcase**

```bash
npm run build
npm start &
npx wait-on http://localhost:3000 || sleep 10
npx axe http://localhost:3000/design-system --stdout \
  --chrome-options=headless,no-sandbox \
  --tags=wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa
kill %1
```

Expected: zero `critical` and zero `serious` violations. Fix any that appear before committing.

- [ ] **Step 5: Commit**

```bash
git add app/design-system/page.tsx
git commit -m "feat: add design system showcase page

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: Foundation verification

Confirms every acceptance criterion in the spec, and captures the post-Foundation numbers.

**Files:**
- Create: `docs/baseline/after-foundation/` (measurement output)
- Modify: `docs/baseline/README.md`

**Interfaces:**
- Consumes: `npm run measure` (Task 1), everything from Tasks 2–10.
- Produces: a comparison table.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, all suites, zero failures.

- [ ] **Step 2: Run lint and build**

Run: `npm run lint && npm run build`
Expected: both clean. Warnings are acceptable; errors are not.

- [ ] **Step 3: Measure after Foundation**

```bash
npm start &
npx wait-on http://localhost:3000 || sleep 10
npm run measure -- --out docs/baseline/after-foundation
kill %1
```

- [ ] **Step 4: Verify each spec acceptance criterion**

Walk the list from the spec's Verification section and record the result of each:

- `next build` and `next dev` clean.
- Showcase renders every material and state in light and dark.
- With `backdrop-filter` disabled, no glass surface becomes illegible.
- With `prefers-reduced-transparency: reduce`, all glass renders solid.
- With `prefers-reduced-motion: reduce`, no transition exceeds 1ms.
- At 375px and 390px, the header does not overlap content on `/`, `/properties`, `/about`, `/contact`, `/blog`.
- No Inter request goes over the network; the Material Icons stylesheet is the only remaining `fonts.googleapis.com` link, deferred to sub-project 5 (see Global Constraints).
- Every interactive element has a visible `:focus-visible` indicator.
- Every icon button has an accessible name.
- Axe reports zero critical or serious violations on the showcase.

Any failure is a bug to fix in this task, not a note to defer.

- [ ] **Step 5: Write the comparison**

Append to `docs/baseline/README.md`:

```markdown
## After Foundation — <date>

Measured at commit <SHA> with `npm run measure -- --out docs/baseline/after-foundation`.

| Route | Perf before → after | A11y before → after | axe critical before → after | axe serious before → after |
|---|---|---|---|---|
| / | | | | |
| /properties | | | | |
| /contact | | | | |

### What changed

- Removed two render-blocking Google Fonts requests (Inter + Material Icons stylesheets).
- Removed the full-screen preloader overlay gating paint on `window.load`.
- <further items, measured not asserted>
```

Fill every cell from the JSON. Do not estimate. If a number moved the wrong way, record it and say why.

- [ ] **Step 6: Commit**

```bash
git add docs/baseline
git commit -m "docs: record post-Foundation performance and accessibility results

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Notes for later sub-projects

Carried forward so they are not rediscovered:

- **Legacy Tailwind aliases** (`primary`, `secondary`, `background.*`, `text-main.*`, `text-muted.*`, `sidebar.dark`) exist only to keep unmigrated pages rendering. Sub-project 5 removes them once the last consumer is migrated.
- **Material Icons** stays loaded through Foundation via the one remaining `<link>` in `app/layout.tsx`, because it cannot be self-hosted and 18 files still consume it. Sub-projects 3, 4, and 5 migrate their own icons; sub-project 5 deletes the `<link>`, the `.material-icons-outlined` class in `app/globals.css`, and this note together with the last consumer.
- **`PropertiesList` and `PublicLayout` both write `document.body.style.overflow`.** Task 7 fixed the layout side by saving and restoring the previous value. Sub-project 4 must apply the same pattern to `PropertiesList`.
- **The homepage still has `pt-20 -mt-20`.** Task 7 exempts `/` from the `pt-nav` offset for exactly this reason. Sub-project 3 removes the hack and rebuilds the hero as `min-h-[100svh]`.
- **Social links and the Commercial listing filter remain placeholders.** Sub-projects 2 and 4 respectively.
- **`/privacy` and `/terms` contain placeholder copy.** Real legal text is needed before launch — a content task, not an engineering one.
