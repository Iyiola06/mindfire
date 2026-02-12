import './globals.css'
import type { Metadata } from 'next'
import Preloader from '@/components/shared/Preloader'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

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
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <Preloader />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
