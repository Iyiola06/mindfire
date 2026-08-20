"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { OFFICE, SOCIAL_LINKS } from '@/lib/contact';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { ButtonLink } from '@/components/ui/Button';
import {
  IconCheck,
  IconClose,
  IconMenu,
  IconMoon,
  IconSend,
  IconSpinner,
  IconSun,
  SOCIAL_ICONS,
} from '@/components/icons';

const NAV_LINKS = [
  { href: '/properties', label: 'Properties' },
  { href: '/blog', label: 'Journal' },
  { href: '/about', label: 'About' },
];

/**
 * The wordmark lockup, used at two scales in two places. `tone` exists because
 * the footer copy sits on near-black and the nav copy sits on glass — the
 * subtitle needs a different alpha in each, and hardcoding one produced an
 * illegible "HOMES" in the footer.
 */
const Wordmark: React.FC<{ size: 'sm' | 'lg'; tone: 'default' | 'inverse' }> = ({ size, tone }) => {
  const small = size === 'sm';
  return (
    <>
      <img
        src="/logo.svg"
        alt=""
        width={small ? 30 : 40}
        height={small ? 30 : 40}
        className={`${small ? 'h-[30px] w-[30px] rounded-lg' : 'h-10 w-10 rounded-xl'} shrink-0 object-contain`}
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold tracking-[-0.01em] ${
            small ? 'text-[0.9375rem]' : 'text-xl'
          } ${tone === 'inverse' ? 'text-white' : 'text-content'}`}
        >
          MINDFIRE
        </span>
        <span
          className={`mt-[3px] font-semibold uppercase leading-none tracking-[0.3em] ${
            small ? 'text-[0.53rem]' : 'text-[0.625rem]'
          } ${tone === 'inverse' ? 'text-white/55' : 'text-content-muted'}`}
        >
          Homes
        </span>
      </span>
    </>
  );
};

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock background scroll while the mobile drawer is open. Saving and
  // restoring the previous value rather than hardcoding 'unset' is what stops
  // this and PropertiesList — which writes the same property — fighting, and
  // it restores scroll if the component unmounts with the menu open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  // Escape closes, Tab cycles inside the panel, and focus returns to the
  // hamburger on close. A full-screen sheet without this leaves keyboard users
  // navigating the page hidden behind it.
  useFocusTrap(drawerRef, mobileMenuOpen, closeMenu);

  // A route change while the sheet is open must dismiss it, or the new page
  // renders underneath a panel that is still covering the viewport.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes resolves `theme` only on the client. Rendering the icon before
  // then produces a hydration mismatch and a flash of the wrong glyph, so the
  // control renders inert until the real value is known.
  useEffect(() => setMounted(true), []);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('submitting');

    try {
      const { subscribeToNewsletter } = await import('@/lib/actions');
      const res = await subscribeToNewsletter(newsletterEmail);

      if (res.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(
          res.message === 'Already subscribed'
            ? 'You are already on the list.'
            : 'Thanks — check your inbox to confirm.',
        );
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(res.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('Something went wrong. Please try again.');
    }
  };

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  /**
   * 40×40 inside the capsule rather than the 44px floor used elsewhere: the
   * capsule itself is only --nav-cap-h tall, and a 44px control inside it
   * leaves no room for the material's border. The tap target is extended past
   * the visible circle by the capsule's own padding, which is generous on
   * every side.
   */
  const iconButton =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-content transition-colors duration-short ease-standard hover:bg-content/10';

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* First focusable element in the document. */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* The nav is a floating capsule rather than a full-width bar: it is
          centred, inset from the top by --nav-inset, and never spans the
          viewport. Pages reserve --nav-h below it, which is the inset plus the
          capsule height plus the same inset again. */}
      <nav
        aria-label="Primary"
        className="fixed left-1/2 top-nav-inset z-50 flex h-nav-cap max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-pill glass-capsule py-0 pl-4 pr-2 md:gap-6 md:pl-[18px] md:pr-3"
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Mindfire Homes — home">
          <Wordmark size="sm" tone="default" />
        </Link>

        {/* Desktop links. Hover dims rather than switching to the accent:
            accent-500 is 2.9:1 on white and fails AA at this size. */}
        <div className="hidden items-center gap-[22px] md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const current = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`text-[0.84rem] font-medium transition-opacity duration-short ease-standard hover:opacity-70 ${
                  current ? 'text-brand-600 underline decoration-2 underline-offset-[6px]' : 'text-content'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={iconButton}
          >
            {mounted ? (
              theme === 'dark' ? <IconSun size={19} /> : <IconMoon size={19} />
            ) : (
              <span className="h-[19px] w-[19px]" />
            )}
          </button>

          <ButtonLink href="/contact" size="sm" className="hidden md:inline-flex">
            Contact us
          </ButtonLink>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            className={`${iconButton} md:hidden`}
          >
            {mobileMenuOpen ? <IconClose size={24} /> : <IconMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav sheet.
          `inert` while closed: the panel stays mounted for the slide
          transition, and without it every link inside remains in the tab order
          off-screen — a keyboard user tabs into invisible controls. */}
      <div
        id="mobile-nav"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        tabIndex={-1}
        /* React 19 types `inert` as a boolean. `undefined` rather than
           `false` because an `inert="false"` attribute still activates it. */
        inert={mobileMenuOpen ? undefined : true}
        aria-hidden={mobileMenuOpen ? undefined : true}
        className={`hero-wash fixed inset-0 z-40 transition-transform duration-spatial ease-standard md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-nav">
          <ul className="flex flex-1 flex-col justify-center gap-1 text-center">
            {[{ href: '/', label: 'Home' }, ...NAV_LINKS].map(({ href, label }) => {
              const current = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    aria-current={current ? 'page' : undefined}
                    className={`flex min-h-[44px] items-center justify-center py-3 font-display text-display-sm font-bold tracking-tight transition-colors duration-short ease-standard hover:text-brand-600 ${
                      current ? 'text-brand-600' : 'text-content'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto space-y-4 pt-8">
            <ButtonLink href="/contact" size="lg" fullWidth onClick={closeMenu}>
              Contact us
            </ButtonLink>
            <p className="text-center text-body-sm text-content-muted">
              <a href={`mailto:${OFFICE.email}`} className="font-semibold text-brand-600">
                {OFFICE.email}
              </a>
              <span className="mt-1 block">{OFFICE.hours}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Every route reserves the full capsule clearance. Nothing sits under
          the nav at rest — the glass is there for what scrolls beneath it. */}
      <main id="main-content" className="flex w-full flex-1 flex-col overflow-x-hidden pt-nav">
        {children}
      </main>

      <footer className="mt-auto bg-sidebar-dark pb-10 pt-section-sm text-white">
        <div className="mx-auto max-w-content px-gutter">
          <div className="mb-11 grid grid-cols-1 gap-11 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <Wordmark size="lg" tone="inverse" />
              </div>
              <p className="mb-6 max-w-[34ch] text-body-sm leading-relaxed text-white/65">
                Residential and investment property in Abuja, with the title checked and the
                documentation in your hands before you commit.
              </p>

              {/* Social icons render only for profiles that exist. The previous
                  version shipped four `href="#"` links — controls that looked
                  functional and navigated nowhere. See SOCIAL_LINKS. */}
              {SOCIAL_LINKS.length > 0 && (
                <ul className="flex gap-3">
                  {SOCIAL_LINKS.map(({ network, href }) => {
                    const { Glyph, label } = SOCIAL_ICONS[network];
                    return (
                      <li key={network}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Mindfire Homes on ${label}`}
                          className="flex h-11 w-11 items-center justify-center rounded-pill bg-white/10 text-white transition-colors duration-short ease-standard hover:bg-brand-600"
                        >
                          <Glyph size={18} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <h2 className="mb-5 font-display text-body-lg font-bold">Discover</h2>
              <ul className="space-y-3 text-body-sm text-white/70">
                {/* PropertiesList already reads `status` from the URL. `type`
                    arrives in sub-project 4; until then Commercial lands on
                    unfiltered listings rather than a dead `#`. */}
                <li><Link href="/properties?status=For+Sale" className="transition-colors hover:text-white">New listings</Link></li>
                <li><Link href="/properties?status=Sold" className="transition-colors hover:text-white">Sold properties</Link></li>
                <li><Link href="/properties?type=Commercial" className="transition-colors hover:text-white">Commercial</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="mb-5 font-display text-body-lg font-bold">Company</h2>
              <ul className="space-y-3 text-body-sm text-white/70">
                <li><Link href="/about" className="transition-colors hover:text-white">About us</Link></li>
                <li><Link href="/blog" className="transition-colors hover:text-white">Journal</Link></li>
                <li><Link href="/contact" className="transition-colors hover:text-white">Contact</Link></li>
                <li>
                  <a href={`mailto:${OFFICE.email}`} className="transition-colors hover:text-white">
                    {OFFICE.email}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 font-display text-body-lg font-bold">Stay updated</h2>
              <p className="mb-4 text-body-sm text-white/65">
                New Abuja listings and market notes. No more than once a fortnight.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="flex">
                  <input
                    type="email"
                    id="newsletter-email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full min-w-0 rounded-l-pill border-none bg-white/10 px-5 text-body-sm text-white placeholder:text-white/50 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                    disabled={newsletterStatus === 'submitting' || newsletterStatus === 'success'}
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="flex h-12 w-14 shrink-0 items-center justify-center rounded-r-pill bg-brand-600 text-white transition-colors duration-short ease-standard hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={newsletterStatus === 'submitting' || newsletterStatus === 'success'}
                  >
                    {newsletterStatus === 'submitting' ? (
                      <IconSpinner size={20} className="animate-spin" />
                    ) : newsletterStatus === 'success' ? (
                      <IconCheck size={20} />
                    ) : (
                      <IconSend size={20} />
                    )}
                  </button>
                </div>
                {/* role="status" so the outcome is announced — the icon swap
                    inside the button is decorative and conveys nothing to AT. */}
                <p role="status" className="mt-1 min-h-[1.25rem] text-body-sm">
                  {newsletterStatus === 'success' && <span className="text-brand-500">{newsletterMessage}</span>}
                  {newsletterStatus === 'error' && <span className="text-red-400">{newsletterMessage}</span>}
                </p>
                <p className="text-[0.7rem] leading-relaxed text-white/50">
                  We store only your email address, and only to send this newsletter. Unsubscribe
                  from any issue. See our{' '}
                  <Link href="/privacy" className="underline hover:text-white">
                    privacy policy
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-body-sm text-white/50 md:flex-row md:gap-0">
            <p>© {new Date().getFullYear()} Mindfire Homes. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="transition-colors hover:text-white">Privacy policy</Link>
              <Link href="/terms" className="transition-colors hover:text-white">Terms of service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
