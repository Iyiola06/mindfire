import { describe, it, expect } from 'vitest'
import { absoluteUrl, BASE_URL, breadcrumbJsonLd, metaDescription, ORGANISATION_JSON_LD } from '@/lib/seo'

describe('canonical URLs', () => {
    it('never emits a double slash', () => {
        // The base is normalised without a trailing slash precisely so that a
        // path joined onto it cannot produce `https://host//about`, which
        // crawlers treat as a separate URL from `/about`.
        expect(BASE_URL.endsWith('/')).toBe(false)
        expect(absoluteUrl('/about')).toBe(`${BASE_URL}/about`)
    })

    it('tolerates a path without a leading slash', () => {
        expect(absoluteUrl('about')).toBe(`${BASE_URL}/about`)
    })

    it('resolves the site root', () => {
        expect(absoluteUrl('/')).toBe(`${BASE_URL}/`)
    })
})

describe('metaDescription', () => {
    it('leaves a short description untouched', () => {
        expect(metaDescription('Two bedroom flat in Jabi.')).toBe('Two bedroom flat in Jabi.')
    })

    it('collapses whitespace so a multi-line body reads as one sentence', () => {
        expect(metaDescription('Two   bedroom\n\nflat.')).toBe('Two bedroom flat.')
    })

    it('truncates at a word boundary rather than mid-word', () => {
        const source = `${'word '.repeat(60)}end`
        const result = metaDescription(source)
        expect(result.length).toBeLessThanOrEqual(157)
        expect(result.endsWith('…')).toBe(true)
        // The visible failure mode this guards against is a snippet ending
        // "…legally verifi…".
        expect(result.replace('…', '').trim().endsWith('word')).toBe(true)
    })

    it('returns an empty string for a missing description', () => {
        expect(metaDescription(null)).toBe('')
        expect(metaDescription(undefined)).toBe('')
    })
})

describe('organisation structured data', () => {
    it('omits fields the business has not supplied rather than inventing them', () => {
        // lib/contact.ts deliberately leaves phoneE164 and streetLine null
        // until the owner fills them in. A schema block asserting a made-up
        // phone number is worse than one without a phone number.
        expect(ORGANISATION_JSON_LD).not.toHaveProperty('telephone')
        expect(ORGANISATION_JSON_LD.address).not.toHaveProperty('streetAddress')
        expect(ORGANISATION_JSON_LD).not.toHaveProperty('aggregateRating')
    })

    it('carries a stable @id that other nodes can reference', () => {
        expect(ORGANISATION_JSON_LD['@id']).toBe(`${BASE_URL}/#organisation`)
    })
})

describe('breadcrumbJsonLd', () => {
    it('numbers positions from one and resolves absolute item URLs', () => {
        const crumbs = breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Properties', path: '/properties' },
        ])

        expect(crumbs.itemListElement).toHaveLength(2)
        expect(crumbs.itemListElement[0].position).toBe(1)
        expect(crumbs.itemListElement[1].item).toBe(`${BASE_URL}/properties`)
    })
})
