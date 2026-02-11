import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mindfire Homes - Premium Real Estate',
    description: 'Find your dream home with Mindfire Homes. Explore luxury properties, apartments, and houses for sale and rent.',
    keywords: ['real estate', 'property', 'homes', 'apartments', 'houses', 'buy', 'rent'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
