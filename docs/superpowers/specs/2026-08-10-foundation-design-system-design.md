# Foundation: Liquid Glass Design System

**Date:** 2026-08-10
**Sub-project:** 1 of 6
**Status:** Draft for review

## Context

Mindfire Homes is a Next.js 15 / React 19 / Tailwind 3.4 real-estate site backed by Supabase. It has no design token layer: `app/globals.css` is 38 lines containing three `@tailwind` directives, one `font-feature-settings` rule, and one icon-font class. All visual decisions live as ad-hoc utility strings repeated across files.

The full redesign brief spans a token system, a schema migration, four public page rebuilds, an admin rebuild, a motion layer, and a measured performance/accessibility program. That is too large for one spec. It is decomposed into six sub-projects, built in dependency order:

1. **Foundation** — this document. Token layer, glass materials, motion primitives, typography, icon system, layout contract, showcase page, measurement harness.
2. **Data & content truth** — schema migration for missing property fields; Nigerian content pass; removal of hardcoded and invented values.
3. **Homepage** — hero, glass search panel, editorial sections.
4. **Listings & property detail** — filter bar and bottom sheet, cards, gallery, sticky booking panel, sold-property conversion path, advisor block.
5. **Admin** — dashboard, property manager, leads, blog, newsletter.
6. **Performance & accessibility verification** — measured before/after at six breakpoints.

Sub-projects 3–5 depend on Foundation. Sub-project 2 is independent of Foundation and may proceed in parallel. Sub-project 6 requires all others complete, but its baseline measurement runs **before** Foundation lands.

## Goals

- Replace ad-hoc styling with a semantic token layer that all six sub-projects consume.
- Provide four named glass material levels with graceful degradation.
- Establish a layout contract that structurally eliminates the mobile header/hero overlap.
- Remove both render-blocking font requests and the Material Icons font dependency.
- Document every material and component state in a showcase page.
- Capture the performance and accessibility baseline before any visual change lands.

## Non-goals

- No page redesigns. Foundation changes the system, not the compositions. Pages are migrated to the new tokens only where required to keep them rendering correctly.
- No schema or content changes (sub-project 2).
- No new runtime dependencies. Motion is CSS-only.
- No logo redraw. The existing `public/logo.svg` is kept; only its usage is corrected.

## Decisions

These were settled during brainstorming and are not open for re-litigation during implementation.

| Decision | Choice | Rationale |
|---|---|---|
| Token implementation | CSS custom properties + Tailwind `var()` bridge | Theming, `@supports` fallbacks, and reduced-transparency handling live in one place; works in server components with no JS. |
| Typography | Self-hosted Inter via `next/font`, two cuts | Eliminates two render-blocking requests and font-swap CLS. Real display/text hierarchy without a second family. |
| Icons | Local inline SVG component set | Zero dependencies, zero network cost, tree-shakes, full `currentColor` and ARIA control. |
| Logo | Keep `logo.svg`, fix usage only | User decision. Payload and dark-mode limits accepted. |
| Admin | In scope (sub-project 5) | Means Material Icons is deleted repo-wide, not just from public routes. |
| Palette | Shift primary to `#006960`, accent to bronze `#C98A4A` | Current `#00897B` is stock Material teal 600. Current `#F7B32B` is 1.9:1 on white and fails AA wherever used as text. |
| Glass opacity | High floors, `.72`–`.86` | Legibility over arbitrary photography; AA passes without per-instance scrims. |
| Measurement | Lighthouse + `@axe-core/cli`, scripted | Reproducible, standard output, two devDependencies. |

## Architecture

### Token layer

All tokens are CSS custom properties defined in `app/globals.css` under `:root` and `.dark`. Colors are stored as **space-separated RGB channel triplets**, not hex, so Tailwind's opacity modifiers (`bg-brand/60`) work through the `var()` bridge:

```css
:root {
  /* Brand */
  --brand-700:   0  84  77;
  --brand-600:   0 105  96;   /* primary actions */
  --brand-500:   0 137 123;   /* hover, light fills */
  --accent-500: 201 138  74;  /* warm bronze — decoration, borders, fills only */

  /* Neutrals */
  --bg:         250 250 250;
  --surface:    255 255 255;
  --text:        26  26  26;
  --text-muted:  90  98 104;
  --hairline:     0   0   0;  /* used at low alpha */
}
```

`tailwind.config.ts` references them:

```ts
colors: {
  brand: {
    600: 'rgb(var(--brand-600) / <alpha-value>)',
    // ...
  },
}
```

**Accent constraint:** `--accent-500` at 14px on white is below 4.5:1. It is permitted for fills, borders, icons ≥24px, and large display text only. Eyebrow labels — currently amber across every page — move to `--text-muted`. This is enforced by review, not by tooling.

### Glass materials

Four levels, defined as `@layer components` classes. Light theme values:

| Level | Background | Blur | Saturate | Border | Extra |
|---|---|---|---|---|---|
| `.glass-subtle` | `255 255 255 / .72` | 20px | 1.8 | `rgb(255 255 255 / .5)` | nav, small controls |
| `.glass-regular` | `255 255 255 / .78` | 32px | 1.8 | same | `inset 0 1px 0 rgb(255 255 255 / .7)` |
| `.glass-elevated` | `255 255 255 / .86` | 40px | 1.9 | same | `0 24px 48px -12px rgb(0 0 0 / .18)` |
| `.glass-dark` | `16 18 20 / .60` | 28px | 1.7 | `rgb(255 255 255 / .12)` | over bright photography |

Each level defines a paired `--glass-fallback-*` opaque color. Two guards collapse glass to that solid value:

```css
@supports not (backdrop-filter: blur(1px)) { /* solid */ }
@media (prefers-reduced-transparency: reduce) { /* solid */ }
```

**Stacking rule:** no glass surface may be a descendant of another glass surface. Nested `backdrop-filter` compounds GPU cost and destroys legibility. Enforced by review.

### Typography

`next/font/local` or `next/font/google` with `display: 'swap'`, subset to `latin`, self-hosted. Two roles from one family:

- `--font-display` — headings. Tighter tracking, optical sizing where the variable axis allows.
- `--font-text` — body and UI.

Both currently resolve to Inter. The current config aliases `display` and `sans` to identical stacks, producing no hierarchy; this separates them at the token level so the distinction is real and adjustable.

A modular type scale replaces per-file font sizes, exposed as Tailwind `fontSize` entries with paired line-height and tracking.

### Layout contract

The mobile header overlap is caused by three uncoordinated magic numbers: the nav's `py-3`/`py-5` with an `h-12` inner row, the homepage's `pt-20 -mt-20`, and inner pages' `pt-24`. Replaced by:

```css
--nav-h: 64px;            /* <768px */
@media (min-width: 768px) { --nav-h: 72px; }
--content-max: 1280px;
```

- Every non-hero page: `padding-top: var(--nav-h)`.
- Homepage hero: `min-height: 100svh` with the nav overlaying it. No negative margin. `svh` rather than `vh` so mobile browser chrome does not clip the content.
- A single `--space-*` scale replaces the ad-hoc `py-24 md:py-32` / `py-20` / `pb-28` values.

### Motion

CSS-only. No animation library.

```css
--dur-short:   200ms;   /* control transitions: 180–240ms band */
--dur-spatial: 500ms;   /* sheets, gallery, page-level: 400–600ms band */
--ease-standard: cubic-bezier(.32, .72, 0, 1);
--ease-spring:   cubic-bezier(.34, 1.56, .64, 1);   /* sheets only */
```

`prefers-reduced-motion: reduce` collapses all durations to `1ms` and disables transforms. No information may be conveyed by motion alone.

### Icon system

`components/icons/` — one component per glyph, built on a 24px grid, `currentColor` fill/stroke, `aria-hidden="true"` by default with an opt-in `title` prop for standalone icon buttons.

The audit found 82 Material Icons uses across 18 files. Deduplicated, these resolve to 43 distinct static glyph names plus 20 names supplied from data arrays (with overlap between the two sets), reached through 12 dynamic `{expression}` call sites. The set to build is therefore roughly 50 glyphs, confirmed by enumeration during implementation rather than estimated.

Foundation builds the components and migrates the shared layer — `PublicLayout`, `Button`, `PropertyCard`, `Badge`. Page-level migrations happen in each page's own sub-project. The Material Icons `<link>` and the `.material-icons-outlined` CSS class are deleted only once the final consumer is migrated, in sub-project 5.

### Showcase page

`app/design-system/page.tsx` — not linked from public navigation, `noindex`. Renders every material level over light, dark, and photographic backgrounds; every component state (default, hover, active, focus-visible, disabled, loading, error); the type scale; the spacing scale; the motion durations; and the fallback rendering with `backdrop-filter` disabled. This is the acceptance surface for the whole system and the reference for sub-projects 3–5.

## Files

**Created**
- `app/globals.css` — rewritten from 38 lines to the full token layer
- `components/icons/*` — icon component set + barrel export
- `app/design-system/page.tsx` — showcase
- `scripts/measure.mjs` — Lighthouse + axe harness
- `docs/baseline/*.json` — captured baseline results

**Modified**
- `tailwind.config.ts` — `var()` bridge, type scale, spacing scale, radii, shadows
- `app/layout.tsx` — `next/font`, remove both Google Fonts `<link>`s
- `components/layout/PublicLayout.tsx` — nav height contract, glass nav, logo lockup, labeled controls
- `components/ui/Button.tsx`, `components/ui/Badge.tsx` — token migration, icon prop becomes a component
- `components/shared/PropertyCard.tsx` — token migration, labeled favorite control, no truncation of name/address

**Deleted**
- `components/shared/Preloader.tsx` — and its mount in `app/layout.tsx`. It is a `z-[9999]` full-screen overlay gated on `document.fonts.ready` and `window.load`, which directly defers LCP. Self-hosted fonts remove the reason it existed. No replacement loading treatment is added; per-route `loading.tsx` is a page-sub-project concern.

## Verification

**Baseline first.** `scripts/measure.mjs` runs against the current code and writes `docs/baseline/` before any Foundation change lands. Without this the brief's before/after requirement cannot be satisfied.

Foundation is complete when:

- `next build` and `next dev` are clean.
- The showcase page renders every material and state correctly in light and dark.
- With `backdrop-filter` disabled in DevTools, no glass surface becomes illegible.
- With `prefers-reduced-transparency: reduce`, all glass renders solid.
- With `prefers-reduced-motion: reduce`, no transition exceeds 1ms.
- At 375px and 390px, the header does not overlap page content on any route.
- No `<link>` to `fonts.googleapis.com` remains in `app/layout.tsx`.
- Every interactive element has a visible `:focus-visible` indicator.
- Every icon button has an accessible name.
- Axe reports zero critical or serious violations on the showcase page.

Breakpoints under test throughout: 375, 390, 768, 1024, 1440, 1920.

## Risks

- **Migrating shared components mid-flight.** `PublicLayout`, `Button`, `Badge`, and `PropertyCard` are consumed by pages that have not yet been redesigned. Their token migration must be visually neutral-or-better on unredesigned pages, not merely correct in isolation.
- **Icon count.** ~50 distinct glyphs is meaningful hand-work. If enumeration during implementation shows the set is materially larger, the fallback is to bring in `lucide-react` for admin-only glyphs — a decision to raise, not to make silently.
- **Accent contrast enforcement.** The `--accent-500` small-text prohibition is convention, not machinery. Axe will catch violations on rendered pages, which is the backstop.
