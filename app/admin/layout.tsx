'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
    IconClose,
    IconFileText,
    IconGrid,
    IconLogout,
    IconMail,
    IconMenu,
    IconBuilding,
    IconUsers,
} from '@/components/icons';

const NAV_ITEMS = [
    { name: 'Dashboard', path: '/admin', icon: IconGrid },
    { name: 'Properties', path: '/admin/properties', icon: IconBuilding },
    { name: 'Leads', path: '/admin/leads', icon: IconUsers },
    { name: 'Journal', path: '/admin/blog', icon: IconFileText },
    { name: 'Newsletter', path: '/admin/newsletter', icon: IconMail },
];

function AdminShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const sidebarRef = useRef<HTMLElement>(null);

    const isLoginPage = pathname === '/admin/login';

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    // The drawer is a modal on small screens: Escape closes it and Tab stays
    // inside it. Without this the nav behind the scrim remains tabbable.
    useFocusTrap(sidebarRef, sidebarOpen, closeSidebar);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    /**
     * A real sign-out. The previous handler was
     * `console.log('Logout clicked')` behind a `// TODO`, so the button in the
     * sidebar cleared no session and navigated nowhere — the only way out of
     * the admin was to clear cookies by hand.
     */
    const handleLogout = () => signOut({ callbackUrl: '/admin/login' });

    if (isLoginPage) {
        return <div className="min-h-screen bg-bg text-content">{children}</div>;
    }

    const user = session?.user as { name?: string | null; email?: string | null } | undefined;
    const displayName = user?.name?.trim() || 'Signed in';
    const initial = (user?.name?.trim() || user?.email || '?').charAt(0).toUpperCase();

    return (
        <div className="flex min-h-screen bg-bg font-sans text-content">
            <aside
                ref={sidebarRef}
                aria-label="Admin sections"
                className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-hairline/10 bg-surface transition-transform duration-spatial ease-standard lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-nav shrink-0 items-center justify-between border-b border-hairline/10 px-6">
                        <Link href="/admin" className="flex items-center gap-3">
                            <img src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
                            <span className="flex flex-col leading-none">
                                <span className="font-display text-[0.9375rem] font-extrabold tracking-[-0.01em]">MINDFIRE</span>
                                <span className="mt-[3px] text-[0.53rem] font-semibold uppercase leading-none tracking-[0.3em] text-content-muted">
                                    Admin
                                </span>
                            </span>
                        </Link>
                        <button
                            type="button"
                            onClick={closeSidebar}
                            aria-label="Close menu"
                            className="flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors hover:bg-content/10 lg:hidden"
                        >
                            <IconClose size={22} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
                        {NAV_ITEMS.map(({ name, path, icon: Glyph }) => {
                            // `/admin` would otherwise match every child route.
                            const isActive = path === '/admin' ? pathname === path : pathname.startsWith(path);
                            return (
                                <Link
                                    key={path}
                                    href={path}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`flex min-h-[44px] items-center gap-3 rounded-pill px-4 text-body-sm font-medium transition-colors duration-short ease-standard ${
                                        isActive
                                            ? 'bg-brand-600 text-white shadow-cta'
                                            : 'text-content-muted hover:bg-content/5 hover:text-content'
                                    }`}
                                >
                                    <Glyph size={20} />
                                    {name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="shrink-0 border-t border-hairline/10 p-4">
                        {/* The signed-in account, from the session. The previous
                            version rendered a fixed "Admin User /
                            admin@mindfire.com" and a pravatar.cc avatar of a
                            person who does not exist. */}
                        <div className="flex items-center gap-3 px-2 py-2">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-brand-600/10 font-display font-bold text-brand-600">
                                {initial}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-body-sm font-semibold text-content">{displayName}</p>
                                <p className="truncate text-[0.75rem] text-content-muted">{user?.email ?? '—'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-pill text-body-sm font-semibold text-red-600 transition-colors duration-short ease-standard hover:bg-red-500/10 dark:text-red-400"
                        >
                            <IconLogout size={18} />
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-nav shrink-0 items-center justify-between border-b border-hairline/10 bg-surface px-4 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={sidebarOpen}
                        className="flex h-11 w-11 items-center justify-center rounded-pill text-content transition-colors hover:bg-content/10"
                    >
                        <IconMenu size={24} />
                    </button>
                    <span className="font-display text-body-lg font-bold">Admin</span>
                    <div className="w-11" aria-hidden="true" />
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
            </div>

            {sidebarOpen && (
                <div
                    role="presentation"
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={closeSidebar}
                />
            )}
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminShell>{children}</AdminShell>
        </AuthProvider>
    );
}
