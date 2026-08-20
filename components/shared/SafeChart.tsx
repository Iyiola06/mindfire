"use client"

import { useEffect, useState } from 'react'

export function SafeChart({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex h-full w-full animate-pulse items-center justify-center rounded-surface bg-surface-2">
                <div className="h-4 w-4 rounded-full bg-content/10" />
            </div>
        )
    }

    return <>{children}</>
}
