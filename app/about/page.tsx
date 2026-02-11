'use client';

import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function AboutPage() {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <div className="relative min-h-[60vh] flex items-center justify-center pt-20 -mt-20 overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-black">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Modern Architecture"
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-black/40 to-black/60"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-4 block">Who We Are</span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg">
                        Building Your <span className="text-primary italic">Legacy</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto drop-shadow-md">
                        We are more than just a real estate agency. We are curators of exceptional living spaces and partners in your wealth-building journey.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <section className="py-20 md:py-32 bg-background-light dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[600px]">
                                <img
                                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Our Story"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 border-8 border-white/10 rounded-2xl m-4 pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 space-y-6">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white leading-tight">
                                A Vision for <br /> <span className="text-primary italic">Modern Excellence</span>
                            </h2>
                            <div className="w-12 h-1 bg-secondary rounded-full mb-8"></div>

                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                Founded in 2015, Mindfire Homes began with a simple yet ambitious goal: to redefine the luxury real estate market by focusing not just on the property, but on the enduring value it brings to our clients' lives.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                Over the years, we've carefully curated a portfolio of properties that stand as architectural marvels and sound financial investments. Our team of seasoned professionals brings decades of collective experience, ensuring that every transaction is seamless, transparent, and tailored to your unique aspirations.
                            </p>

                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200 dark:border-gray-800 mt-8">
                                <div>
                                    <p className="text-4xl font-display font-bold text-primary mb-2">10+</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Years Experience</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-display font-bold text-primary mb-2">$500M</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Sales Volume</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-surface-light dark:bg-surface-dark border-y border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-2 block">The Mindfire Way</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-16">Our Core Values</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: 'verified_user', title: 'Unwavering Integrity', desc: 'Trust is the foundation of every relationship we build. We operate with absolute transparency and ethical standards.' },
                            { icon: 'diamond', title: 'Commitment to Excellence', desc: 'From the properties we select to the service we provide, we settle for nothing less than extraordinary.' },
                            { icon: 'lightbulb', title: 'Forward-Thinking Innovation', desc: 'We leverage data, technology, and market foresight to secure the best opportunities for our clients before they become obvious.' }
                        ].map((value, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-2">
                                    <span className="material-icons-outlined text-4xl" aria-hidden="true">{value.icon}</span>
                                </div>
                                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-24 bg-background-light dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">Meet The Experts</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Our diverse team of industry veterans is dedicated to helping you navigate the complexities of luxury real estate.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: 'Marcus Reynolds', role: 'Founder & CEO', img: 'https://i.pravatar.cc/300?u=15' },
                            { name: 'Elena Rodriguez', role: 'Head of Sales', img: 'https://i.pravatar.cc/300?u=10' },
                            { name: 'David Chen', role: 'Investment Strategist', img: 'https://i.pravatar.cc/300?u=12' },
                            { name: 'Sarah Jenkins', role: 'Senior Property Consultant', img: 'https://i.pravatar.cc/300?u=13' }
                        ].map((member, i) => (
                            <div key={i} className="group text-center">
                                <div className="relative mb-6 mx-auto w-48 h-48 rounded-full overflow-hidden shadow-lg border-4 border-surface-light dark:border-surface-dark group-hover:border-primary transition-colors duration-300">
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{member.name}</h3>
                                <p className="text-sm font-bold uppercase tracking-widest text-primary mt-1">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] mix-blend-overlay opacity-10 object-cover w-full h-full"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Ready to start your journey?</h2>
                    <p className="text-xl text-white/80 mb-10 font-light">
                        Whether you're looking to buy, sell, or invest, our team is ready to assist you.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/contact" className="bg-secondary hover:bg-secondary-hover text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-black/20 transition-transform hover:-translate-y-1">
                            Contact Us Today
                        </Link>
                        <Link href="/properties" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-bold text-lg transition-all">
                            View Our Properties
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
