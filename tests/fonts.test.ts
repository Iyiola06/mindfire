import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'

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

describe('render blocking', () => {
    it('has no full-screen preloader overlay', () => {
        expect(existsSync('components/shared/Preloader.tsx')).toBe(false)
        expect(layout).not.toMatch(/Preloader/)
    })
})
