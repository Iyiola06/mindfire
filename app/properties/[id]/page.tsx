import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { notFound } from 'next/navigation';
import { Property } from '@/types';
import { PropertyContactForm } from '@/components/properties/PropertyContactForm';

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

    const typedProperty = property as Property;

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
                            <span className="text-gray-900 dark:text-white" aria-current="page">{typedProperty.name}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{typedProperty.name}</h1>
                                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <span className="material-icons-outlined text-primary text-xl shrink-0" aria-hidden="true">location_on</span>
                                    {typedProperty.address}
                                </p>
                            </div>
                            <div className="flex flex-col items-start md:items-end border-t border-gray-200 dark:border-gray-800 md:border-t-0 pt-4 md:pt-0">
                                <p className="text-3xl font-bold text-primary dark:text-primary">
                                    {typedProperty.currency === 'NGN' ? '₦' : '$'}{typedProperty.price.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Status: {typedProperty.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 mb-12 h-[350px] sm:h-[450px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
                        <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden">
                            <img src={typedProperty.image} alt={`${typedProperty.name} main view`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            {typedProperty.featured && <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider shadow-md">Featured</div>}
                        </div>
                        {/* Additional images from the gallery */}
                        {(typedProperty.images || []).slice(0, 4).map((img, i) => (
                            <div key={i} className={`relative group cursor-pointer overflow-hidden hidden md:block ${i === 3 && (typedProperty.images?.length || 0) > 4 ? 'relative' : ''}`}>
                                <img src={img} alt={`Gallery view ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                {i === 3 && (typedProperty.images?.length || 0) > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                        <span className="text-white font-bold">+{(typedProperty.images?.length || 0) - 4} More</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Fallback if no gallery images */}
                        {(!typedProperty.images || typedProperty.images.length === 0) && (
                            <>
                                <div className="relative group cursor-pointer overflow-hidden hidden md:block bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-icons-outlined text-gray-300 text-4xl">image</span>
                                </div>
                                <div className="relative group cursor-pointer overflow-hidden hidden md:block bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-icons-outlined text-gray-300 text-4xl">image</span>
                                </div>
                                <div className="relative group cursor-pointer overflow-hidden hidden md:block bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-icons-outlined text-gray-300 text-4xl">image</span>
                                </div>
                                <div className="relative group cursor-pointer overflow-hidden hidden md:block bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="material-icons-outlined text-gray-300 text-4xl">image</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6 sm:py-8 border-y border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark rounded-2xl px-4 sm:px-6 shadow-sm">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="material-icons-outlined text-primary text-3xl sm:text-4xl" aria-hidden="true">king_bed</span>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">{typedProperty.beds}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Bedrooms</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="material-icons-outlined text-primary text-3xl sm:text-4xl" aria-hidden="true">bathtub</span>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">{typedProperty.baths}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Bathrooms</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <span className="material-icons-outlined text-primary text-3xl sm:text-4xl" aria-hidden="true">square_foot</span>
                                    <div>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-display">{typedProperty.sqft}</p>
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
                                <div className="prose prose-base sm:prose-lg dark:prose-invert text-gray-600 dark:text-gray-300 max-w-none leading-relaxed whitespace-pre-wrap">
                                    {typedProperty.description || `Experience the pinnacle of luxury living with "${typedProperty.name}". Designed for those who appreciate the finer things, this architectural masterpiece redefines modern living.`}
                                </div>
                            </div>

                            {/* Amenities */}
                            {(typedProperty.amenities || []).length > 0 && (
                                <div>
                                    <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                                        <span className="w-8 h-1 bg-secondary rounded-full" aria-hidden="true"></span> Premium Amenities
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                        {typedProperty.amenities?.map((amenity, i) => (
                                            <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-colors">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                                                    <span className="material-icons-outlined" aria-hidden="true">
                                                        {amenity.toLowerCase().includes('wifi') || amenity.toLowerCase().includes('internet') ? 'wifi' :
                                                            amenity.toLowerCase().includes('gym') ? 'fitness_center' :
                                                                amenity.toLowerCase().includes('pool') ? 'pool' :
                                                                    amenity.toLowerCase().includes('smart') ? 'bolt' :
                                                                        amenity.toLowerCase().includes('security') ? 'security' :
                                                                            amenity.toLowerCase().includes('kit') ? 'kitchen' : 'check_circle'}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-gray-700 dark:text-gray-200 text-xs sm:text-sm">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Floor Plans */}
                            {(typedProperty.floorPlans || []).length > 0 && (
                                <div>
                                    <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                                        <span className="w-8 h-1 bg-secondary rounded-full" aria-hidden="true"></span> Architectural Floor Plans
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {typedProperty.floorPlans?.map((plan, i) => (
                                            <div key={i} className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-md group">
                                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{plan.label}</p>
                                                </div>
                                                <div className="aspect-[4/3] overflow-hidden cursor-zoom-in">
                                                    <img src={plan.image} alt={plan.label} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar - Sticky Form */}
                        <div className="lg:col-span-1 hidden lg:block">
                            <div className="sticky top-24 space-y-6">
                                <PropertyContactForm propertyName={typedProperty.name} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
