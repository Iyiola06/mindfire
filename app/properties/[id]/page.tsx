import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !property) {
        return notFound();
    }

    return (
        <PublicLayout>
            <div className="bg-background-light dark:bg-background-dark min-h-screen pt-24 pb-28 lg:pb-16 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumb & Header */}
                    <div className="mb-8">
                        <nav aria-label="Breadcrumb" className="flex text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            <span className="mx-2" aria-hidden="true">/</span>
                            <Link href="/properties" className="hover:text-primary transition-colors">Listings</Link>
                            <span className="mx-2" aria-hidden="true">/</span>
                            <span className="text-gray-900 dark:text-white" aria-current="page">{property.name}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{property.name}</h1>
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <span className="material-icons-outlined text-primary text-xl shrink-0" aria-hidden="true">location_on</span>
                                    {property.address}
                                </p>
                            </div>
                            <div className="flex flex-col items-start md:items-end border-t border-gray-200 dark:border-gray-800 md:border-t-0 pt-4 md:pt-0">
                                <p className="text-3xl font-bold text-primary dark:text-primary">
                                    ${property.price.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Status: {property.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 mb-12 h-[350px] sm:h-[450px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
                        <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden">
                            <img src={property.image} alt={`${property.name} exterior view`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            {property.featured && <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider shadow-md">Featured</div>}
                        </div>
                        <div className="relative group cursor-pointer overflow-hidden hidden md:block">
                            <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Interior living room" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="relative group cursor-pointer overflow-hidden hidden md:block">
                            <img src="https://images.unsplash.com/photo-1600566753086-00f18efc2291?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Kitchen view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="relative group cursor-pointer overflow-hidden hidden md:block">
                            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Bedroom view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="relative group cursor-pointer overflow-hidden hidden md:block">
                            <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Bathroom view" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 w-full bg-black/50 flex items-center justify-center transition-opacity hover:bg-black/40 backdrop-blur-sm cursor-pointer border-none">
                                <span className="text-white font-bold flex items-center gap-2 border-2 border-white px-4 py-2 rounded-lg">
                                    <span className="material-icons-outlined" aria-hidden="true">grid_view</span>
                                    View All Photos (24)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6 sm:py-8 border-y border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark rounded-2xl px-4 sm:px-6 shadow-sm">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="material-icons-outlined text-primary text-3xl sm:text-4xl" aria-hidden="true">king_bed</span>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">{property.beds}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Bedrooms</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="material-icons-outlined text-primary text-3xl sm:text-4xl" aria-hidden="true">bathtub</span>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">{property.baths}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Bathrooms</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="material-icons-outlined text-primary text-3xl sm:text-4xl" aria-hidden="true">square_foot</span>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">{property.sqft}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Sq. Ft.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="material-icons-outlined text-primary text-3xl sm:text-4xl" aria-hidden="true">garage</span>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">2</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Cars</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="w-8 h-1 bg-secondary rounded-full" aria-hidden="true"></span> About This Property
                                </h2>
                                <div className="prose prose-base sm:prose-lg dark:prose-invert text-gray-600 dark:text-gray-300 max-w-none leading-relaxed">
                                    <p>Experience the pinnacle of luxury living with "{property.name}". Designed for those who appreciate the finer things, this architectural masterpiece redefines modern living.</p>
                                    <p>Featuring expansive open-plan living areas, floor-to-ceiling windows that flood the space with natural light, and premium finishes throughout. The property is situated in a secure, high-end neighborhood, ensuring peace of mind for you and your family.</p>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="w-8 h-1 bg-secondary rounded-full" aria-hidden="true"></span> Premium Amenities
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                    {[
                                        { icon: 'bolt', text: 'Smart Home Ready' },
                                        { icon: 'security', text: '24/7 Security' },
                                        { icon: 'fitness_center', text: 'Private Gym' },
                                        { icon: 'pool', text: 'Infinity Pool' },
                                        { icon: 'kitchen', text: 'Chef\'s Kitchen' },
                                        { icon: 'wifi', text: 'Fibre Internet' }
                                    ].map((amenity, i) => (
                                        <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-colors">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                                                <span className="material-icons-outlined" aria-hidden="true">{amenity.icon}</span>
                                            </div>
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-xs sm:text-sm">{amenity.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Sticky Form */}
                        <div className="lg:col-span-1 hidden lg:block">
                            <div className="sticky top-24 space-y-6">
                                <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                                    <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                                        <p className="text-secondary font-bold text-[10px] uppercase tracking-widest mb-2">Let's Secure Your Space</p>
                                        <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Book a Site Visit</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Our elite agents are ready to show you around.</p>
                                    </div>

                                    <form className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-widest" htmlFor="name">Full Name</label>
                                            <input type="text" id="name" placeholder="Enter your name" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-widest" htmlFor="phone">Phone Number</label>
                                            <input type="tel" id="phone" placeholder="+1 ..." className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-widest" htmlFor="email">Email Address</label>
                                            <input type="email" id="email" placeholder="you@email.com" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3" />
                                        </div>

                                        <button type="button" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg shadow-xl shadow-primary/30 transition-transform active:scale-95 mt-6 flex justify-center items-center gap-2">
                                            <span className="material-icons-outlined text-lg" aria-hidden="true">calendar_today</span>
                                            Schedule Visit
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
