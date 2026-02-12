"use client"

import { useEffect, useState } from 'react'

export function SafeChart({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-pulse">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        )
    }

    return <>{children}</>
}
