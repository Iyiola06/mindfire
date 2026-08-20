import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'

const layout = readFileSync('app/layout.tsx', 'utf8')

describe('typography', () => {
    it('does not fetch Inter over the network', () => {
        expect(layout).not.toMatch(/family=Inter/)
        expect(layout).not.toMatch(/fonts\.gstatic\.com/)
    })

    // The Material Icons stylesheet was the last external font request. Its
    // consumers have all been migrated to the SVG glyphs in components/icons,
    // so the document now makes no font request off our own origin at all.
    it('makes no external font request', () => {
        // Matched inside a quoted attribute value so the sentence in the
        // comment at the top of layout.tsx, which names the host it no longer
        // calls, is not counted as a request.
        expect(layout.match(/["']https:\/\/fonts\.(googleapis|gstatic)\.com[^"']*/g) ?? [])
            .toHaveLength(0)
    })

    it('self-hosts fonts through next/font', () => {
        expect(layout).toMatch(/from ['"]next\/font\/google['"]/)
    })

    it('exposes both type roles as CSS variables', () => {
        expect(layout).toMatch(/--font-display/)
        expect(layout).toMatch(/--font-text/)
    })
})

describe('render blocking', () => {
    it('has no full-screen preloader overlay', () => {
        expect(existsSync('components/shared/Preloader.tsx')).toBe(false)
        expect(layout).not.toMatch(/Preloader/)
    })
})
