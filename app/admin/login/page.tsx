"use client"

import { Suspense } from 'react'
import LoginForm from '@/components/admin/LoginForm'

export default function AdminLogin() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <img
                        className="mx-auto h-12 w-auto"
                        src="/logo.svg"
                        alt="Mindfire Homes"
                    />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white font-display">
                        Admin Dashboard
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Sign in to manage properties and content
                    </p>
                </div>
                <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}
