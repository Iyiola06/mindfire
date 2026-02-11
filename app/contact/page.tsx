'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function ContactPage() {
    return (
        <PublicLayout>
            <div className="bg-background-light dark:bg-background-dark min-h-screen pt-24 pb-20">

                {/* Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                    <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-3">We're Here to Help</p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Get in <span className="text-primary italic">Touch</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Have a question about a property, want to schedule a viewing, or just want to chat about your real estate goals? We'd love to hear from you.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                        {/* Contact Information (Left) */}
                        <div className="lg:w-1/3 space-y-10">
                            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
                                <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Details</h3>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <span className="material-icons-outlined" aria-hidden="true">location_on</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-1">Headquarters</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                123 Luxury Boulevard,<br />
                                                Suite 400, Beverly Hills,<br />
                                                CA 90210
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <span className="material-icons-outlined" aria-hidden="true">phone</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-1">Call Us</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Main: +1 (555) 123-4567</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">Sales: +1 (555) 987-6543</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <span className="material-icons-outlined" aria-hidden="true">email</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider mb-1">Email</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">hello@mindfirehomes.com</p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">invest@mindfirehomes.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary rounded-2xl p-8 shadow-lg text-white">
                                <h3 className="font-display text-2xl font-bold mb-4">Business Hours</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-white/20 pb-2">
                                        <span className="font-medium">Monday - Friday</span>
                                        <span className="opacity-90">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/20 pb-2">
                                        <span className="font-medium">Saturday</span>
                                        <span className="opacity-90">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Sunday</span>
                                        <span className="opacity-90">Closed (By Appt Only)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form (Right) */}
                        <div className="lg:w-2/3">
                            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-800 h-full">
                                <h3 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Send a Message</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8">Fill out the form below and one of our agents will get back to you shortly.</p>

                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest" htmlFor="firstName">First Name</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                placeholder="John"
                                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest" htmlFor="lastName">Last Name</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                placeholder="Doe"
                                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest" htmlFor="email">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="john@example.com"
                                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest" htmlFor="phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest" htmlFor="subject">Subject</label>
                                        <select id="subject" className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors cursor-pointer">
                                            <option>I want to buy a property</option>
                                            <option>I want to sell my property</option>
                                            <option>I'm looking for an investment</option>
                                            <option>General Inquiry</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest" htmlFor="message">Your Message</label>
                                        <textarea
                                            id="message"
                                            rows={5}
                                            placeholder="How can we help you?"
                                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors resize-none"
                                        ></textarea>
                                    </div>

                                    <button type="button" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/30 transition-transform active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto min-w-[200px]">
                                        Send Message
                                        <span className="material-icons-outlined text-sm" aria-hidden="true">send</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
