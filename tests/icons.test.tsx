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
