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

    it('defines the floating-nav layout contract', () => {
        // The nav is a capsule inset from the top, so three numbers describe
        // it and pages trust --nav-h alone for their clearance.
        expect(css).toMatch(/--nav-inset:\s*14px\s*;/)
        expect(css).toMatch(/--nav-cap-h:\s*54px\s*;/)
        expect(css).toMatch(/--nav-h:\s*82px\s*;/)
        expect(css).toMatch(/--nav-inset:\s*16px\s*;/)
        expect(css).toMatch(/--nav-cap-h:\s*60px\s*;/)
        expect(css).toMatch(/--nav-h:\s*92px\s*;/)
        expect(css).toMatch(/--content-max:\s*1180px\s*;/)
    })

    it('keeps --nav-h equal to the capsule plus both insets', () => {
        // If these drift apart, every page either overlaps the nav or leaves a
        // gap under it, and the failure is silent.
        const read = (name: string) =>
            [...css.matchAll(new RegExp(`--${name}:\\s*(\\d+)px`, 'g'))].map((m) => Number(m[1]))

        const insets = read('nav-inset')
        const caps = read('nav-cap-h')
        const totals = read('nav-h')

        expect(insets).toHaveLength(totals.length)
        insets.forEach((inset, i) => {
            expect(totals[i]).toBe(inset * 2 + caps[i])
        })
    })

    it('bridges tokens into Tailwind with the alpha-value placeholder', () => {
        const full = resolveConfig(tailwindConfig as never)
        const brand = full.theme.colors.brand as Record<string, string>
        expect(brand['600']).toBe('rgb(var(--brand-600) / <alpha-value>)')
        expect(full.theme.colors.surface).toBe('rgb(var(--surface) / <alpha-value>)')
    })
})

describe('glass materials', () => {
    it('defines all five material levels', () => {
        expect(css).toMatch(/\.glass-subtle\s*\{/)
        expect(css).toMatch(/\.glass-regular\s*\{/)
        expect(css).toMatch(/\.glass-elevated\s*\{/)
        expect(css).toMatch(/\.glass-capsule\s*\{/)
        expect(css).toMatch(/\.glass-dark\s*\{/)
    })

    it('collapses the nav capsule to an opaque surface alongside the others', () => {
        // The capsule is the one material that is always on screen. If it is
        // missed out of a fallback list it stays transparent exactly where a
        // reduced-transparency user most needs it not to be.
        const fallbackBlocks = css
            .split(/@supports not|@media \(prefers-reduced-transparency|@media \(prefers-contrast/)
            .slice(1)
        expect(fallbackBlocks.length).toBeGreaterThanOrEqual(3)
        for (const block of fallbackBlocks) {
            expect(block).toMatch(/\.glass-capsule/)
        }
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

describe('reveal-on-scroll', () => {
    it('defines both the hidden and settled states', () => {
        expect(css).toMatch(/\.reveal\s*\{/)
        expect(css).toMatch(/\.reveal\.is-revealed\s*\{/)
    })

    it('resolves to the settled state under reduced motion', () => {
        // Nothing revealed this way carries meaning, so a reduced-motion user
        // must simply see the finished layout — never an element left at
        // opacity 0 because its observer was skipped.
        const block = css.slice(css.lastIndexOf('prefers-reduced-motion'))
        expect(block).toMatch(/\.reveal\s*\{[^}]*opacity:\s*1/)
    })
})

describe('control language', () => {
    it('exposes the pill radius and the long-throw shadows through Tailwind', () => {
        const full = resolveConfig(tailwindConfig as never)
        const radius = full.theme.borderRadius as Record<string, string>
        const shadow = full.theme.boxShadow as Record<string, string>

        expect(radius.pill).toBe('999px')
        expect(radius.showcase).toBe('1.875rem')
        expect(shadow.ambient).toContain('-50px')
        // The CTA shadow is brand-tinted, so it has to resolve through the
        // token bridge rather than hardcoding the green.
        expect(shadow.cta).toContain('var(--brand-600)')
    })

    it('separates the eyebrow tracking from the form-label tracking', () => {
        const full = resolveConfig(tailwindConfig as never)
        const sizes = full.theme.fontSize as Record<string, [string, { letterSpacing?: string }]>
        expect(sizes.eyebrow[1].letterSpacing).toBe('0.3em')
        expect(sizes.label[1].letterSpacing).toBe('0.06em')
    })
})
