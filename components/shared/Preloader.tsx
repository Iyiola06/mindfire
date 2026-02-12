"use client"

import { useEffect, useState } from 'react'

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        const handleLoad = () => {
            setFadeOut(true)
            setTimeout(() => {
                setIsLoading(false)
            }, 500)
        }

        const waitForResources = async () => {
            // Wait for fonts to load
            try {
                await document.fonts.ready
            } catch (e) {
                console.error('Font loading check failed:', e)
            }

            // Check if page is already loaded
            if (document.readyState === 'complete') {
                handleLoad()
            } else {
                window.addEventListener('load', handleLoad)
                return () => window.removeEventListener('load', handleLoad)
            }
        }

        waitForResources()
    }, [])

    if (!isLoading) return null

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-background-dark transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            <div className="text-center">
                {/* Logo Animation */}
                <div className="mb-6 animate-pulse">
                    <img src="/logo.svg" alt="Mindfire Homes" className="w-20 h-20 mx-auto" />
                </div>

                {/* Brand Text */}
                <div className="space-y-1">
                    <h1 className="font-display font-bold text-2xl text-primary tracking-wide">
                        MINDFIRE
                    </h1>
                    <p className="text-sm font-medium text-primary/70 tracking-widest">
                        HOMES
                    </p>
                </div>

                {/* Loading Animation */}
                <div className="mt-8 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    )
}
