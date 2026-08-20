import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { PropertyCard } from '@/components/shared/PropertyCard'
import type { Property } from '@/types'

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
        // Two links carry this name — the newsletter consent line and the
        // legal row — and both must resolve to the real page. A dead `#` in
        // either is the failure this guards against.
        const privacy = screen.getAllByRole('link', { name: /privacy policy/i })
        expect(privacy.length).toBeGreaterThan(0)
        for (const link of privacy) {
            expect(link).toHaveAttribute('href', '/privacy')
        }
    })

    it('points the discover links at filtered listings', () => {
        render(<PublicLayout><div>content</div></PublicLayout>)
        expect(screen.getByRole('link', { name: /sold properties/i }))
            .toHaveAttribute('href', '/properties?status=Sold')
    })
})

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
