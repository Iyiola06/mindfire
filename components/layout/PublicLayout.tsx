"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const { theme, setTheme } = useTheme();

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navClass = `fixed w-full z-50 transition-all duration-300 ${isScrolled || !isHome || mobileMenuOpen
    ? 'bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-3 shadow-sm'
    : 'bg-transparent py-5'
    }`;

  const textClass = isScrolled || !isHome || mobileMenuOpen ? 'text-text-main-light dark:text-white' : 'text-white drop-shadow-md';

  return (
    <div className="min-h-screen flex flex-col relative">
      <nav className={navClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 relative z-50">
              <img
                src="/logo.svg"
                alt="Mindfire Homes"
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className={`text-sm font-medium hover:text-secondary transition-colors ${textClass}`}>Properties</Link>
              <Link href="/blog" className={`text-sm font-medium hover:text-secondary transition-colors ${textClass}`}>Blog</Link>

              <div className="flex items-center gap-4 border-l border-gray-300 dark:border-gray-700 pl-4">
                <button onClick={toggleDarkMode} aria-label="Toggle dark mode" className={`p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${textClass}`}>
                  <span className="material-icons-outlined text-xl" aria-hidden="true">brightness_4</span>
                </button>
                <Link href="/contact" className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4 relative z-50">
              <button onClick={toggleDarkMode} aria-label="Toggle dark mode" className={`p-2 ${textClass}`}>
                <span className="material-icons-outlined" aria-hidden="true">brightness_4</span>
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu" aria-expanded={mobileMenuOpen} className={`p-2 ${textClass}`}>
                <span className="material-icons-outlined text-3xl" aria-hidden="true">{mobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-surface-light dark:bg-surface-dark transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full pt-24 pb-8 px-6 overflow-y-auto">
          <div className="flex flex-col space-y-6 text-center flex-1 justify-center">
            <Link href="/" className="text-2xl font-display font-bold text-gray-900 dark:text-white hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/properties" className="text-2xl font-display font-bold text-gray-900 dark:text-white hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
            <Link href="/blog" className="text-2xl font-display font-bold text-gray-900 dark:text-white hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <Link href="/about" className="text-2xl font-display font-bold text-gray-900 dark:text-white hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          </div>
          <div className="mt-auto pt-8">
            <Link href="/contact" className="block w-full text-center bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg" onClick={() => setMobileMenuOpen(false)}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col w-full overflow-x-hidden">
        {children}
      </main>

      <footer className="bg-sidebar-dark text-white pt-20 pb-10 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-md">
                  <span className="material-icons-outlined text-2xl" aria-hidden="true">home_work</span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl tracking-tight leading-none text-white">MINDFIRE</h1>
                  <span className="text-[0.65rem] uppercase tracking-widest leading-none block text-gray-400">Homes</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Redefining modern living through exceptional real estate developments and smart investment opportunities.
              </p>
              <div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold font-display mb-6">Discover</h3>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link href="/properties" className="hover:text-secondary transition-colors">New Listings</Link></li>
                <li><Link href="/properties" className="hover:text-secondary transition-colors">Sold Properties</Link></li>
                <li><Link href="/properties" className="hover:text-secondary transition-colors">Commercial</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold font-display mb-6">Company</h3>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-secondary transition-colors">Our Blog</Link></li>
                <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold font-display mb-6">Stay Updated</h3>
              <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest property news.</p>
              <form className="flex">
                <input type="email" aria-label="Email address for newsletter" placeholder="Your email" className="w-full bg-gray-800 border-none rounded-l-lg p-3 text-sm focus:ring-1 focus:ring-primary text-white" />
                <button type="button" aria-label="Subscribe to newsletter" className="bg-primary hover:bg-primary-dark text-white px-4 rounded-r-lg transition-colors">
                  <span className="material-icons-outlined" aria-hidden="true">send</span>
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2023 Mindfire Homes. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};