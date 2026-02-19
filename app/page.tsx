import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroSearch } from '@/components/home/HeroSearch';
import { PropertyCard } from '@/components/shared/PropertyCard';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mindfire Homes | Luxury Real Estate & Investments',
    description: 'Discover exclusive properties that combine luxury living with exceptional investment returns. Invest Smart. Live Better. Own Proudly.',
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const { data: featuredProperties } = await supabase
        .from('properties')
        .select('*')
        .eq('featured', true)
        .limit(3);

    const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

    const { count: soldCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Sold');

    return (
        <PublicLayout>
            {/* Hero Section */}
            <div className="relative min-h-[90vh] flex items-center justify-center pt-20 -mt-20">
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLbUhfg0e7PqYIfpQlLJMclWwsBwG9CiyOMwcrWJKnx25qTncITTETSO9APKDMbUMl6_nVo2njbubiDnMSkyH4RENd1fqT3UgeS07jAdKneyJigEF6uSraZbIo-FccrxoyCp2qa31L-5estiYHwTy-gmjbqEUfK-W4t5wHLbF12LjGyFr0PuiDTW0PX_pZpYH-FGTM8GTtDkfak7Nbuz_OzrZWF2_8zT0cUqE2L_tIT7nJiwOAq589mNMpHyKzdEz0alfv_0p4QhI"
                        alt="Luxury Villa"
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background-light dark:to-background-dark"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 leading-tight drop-shadow-xl">
                        Invest Smart. <br className="hidden sm:block" />
                        <span className="text-secondary italic">Live Better.</span> Own Proudly.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-gray-200 font-light mb-12 drop-shadow-md">
                        Discover exclusive properties that combine luxury living with exceptional investment returns. Your future space is secured with Mindfire.
                    </p>

                    {/* Search Widget */}
                    <HeroSearch />
                </div>
            </div>

            {/* Featured Projects */}
            <section className="py-24 md:py-32 bg-background-light dark:bg-background-dark relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="max-w-2xl">
                            <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-2 block">Premium Selection</span>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-text-main-light dark:text-white mb-4">Featured Projects</h2>
                            <p className="text-text-muted-light dark:text-text-muted-dark text-lg">Curated selection of premium residences offering the perfect blend of comfort and investment potential.</p>
                        </div>
                        <Link href="/properties" className="hidden md:flex items-center text-primary font-bold hover:text-secondary transition-colors group">
                            View All Projects <span className="material-icons-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredProperties?.map((property: any) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>

                    <div className="mt-10 text-center md:hidden">
                        <Link href="/properties" className="inline-flex items-center justify-center w-full bg-primary/10 text-primary font-bold py-3.5 rounded-xl hover:bg-primary hover:text-white transition-colors">
                            View All Projects <span className="material-icons-outlined ml-1">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </section>


            {/* Value Props */}
            <section className="py-24 bg-surface-light dark:bg-surface-dark border-y border-gray-200 dark:border-gray-800 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-text-main-light dark:text-white mb-6 leading-tight">
                                Secure Your Future <br className="hidden sm:block" />With <span className="text-primary italic">Smart Assets.</span>
                            </h2>
                            <p className="text-text-muted-light dark:text-text-muted-dark text-base sm:text-lg mb-10 leading-relaxed">
                                At Mindfire Homes, we don't just sell properties; we curate wealth-building opportunities. Our data-driven approach ensures that every square foot you own works as hard as you do.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { icon: 'trending_up', title: 'High ROI Potential', desc: 'Properties located in high-growth zones ensuring capital appreciation year over year.' },
                                    { icon: 'verified_user', title: 'Legally Verified', desc: '100% due diligence completed. Clean titles and hassle-free ownership transfer.' },
                                    { icon: 'design_services', title: 'Premium Finish', desc: 'Architectural masterpieces built with high-quality materials and modern aesthetics.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 sm:gap-5">
                                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <span className="material-icons-outlined text-xl sm:text-2xl" aria-hidden="true">{item.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-text-main-light dark:text-white mb-2 font-display">{item.title}</h3>
                                            <p className="text-sm sm:text-base text-text-muted-light dark:text-text-muted-dark leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 text-center sm:text-left">
                                <Link href="/contact" className="inline-block w-full sm:w-auto bg-text-main-light dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary px-8 py-4 rounded-xl font-bold transition-colors shadow-xl">
                                    Schedule a Consultation
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 w-full">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-auto lg:h-[700px]">
                                <img
                                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Modern Home Interior"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-6 rounded-xl flex justify-between text-center shadow-lg divide-x divide-white/20">
                                    <div className="px-2 w-1/3">
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary font-display drop-shadow-sm">
                                            {soldCount || 150}+
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] lg:text-xs text-white uppercase tracking-widest mt-2 font-medium">Units Sold</p>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary font-display drop-shadow-sm">98%</p>
                                        <p className="text-[9px] sm:text-[10px] lg:text-xs text-white uppercase tracking-widest mt-2 font-medium">Satisfaction</p>
                                    </div>
                                    <div className="px-2 w-1/3">
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary font-display drop-shadow-sm">{propertiesCount || 12}</p>
                                        <p className="text-[9px] sm:text-[10px] lg:text-xs text-white uppercase tracking-widest mt-2 font-medium">Projects</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-24 bg-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right"></div>
                <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white mb-6">Let's Secure Your Space.</h2>
                    <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light">
                        Ready to make a move? Join hundreds of smart investors building their portfolio with Mindfire Homes today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/properties" className="bg-secondary hover:bg-secondary-hover text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-black/20 transition-transform hover:-translate-y-1">
                            Explore Properties
                        </Link>
                        <Link href="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-bold text-lg transition-all">
                            Contact an Agent
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};
