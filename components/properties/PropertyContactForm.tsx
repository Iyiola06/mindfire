'use client';

import React, { useState } from 'react';
import { createLead } from '@/lib/actions';

export const PropertyContactForm = ({ propertyName }: { propertyName: string }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const res = await createLead({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            propertyInterest: `Interest in ${propertyName}`,
            message: `I'm interested in scheduling a visit for ${propertyName}.`,
            budget: 'Not specified'
        });

        setIsSubmitting(false);

        if (res.success) {
            setIsSuccess(true);
            setFormData({ name: '', phone: '', email: '' });
        } else {
            alert('Something went wrong. Please try again.');
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">Request Sent!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">An agent will contact you shortly to schedule your visit.</p>
                <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary font-bold text-sm hover:underline">
                    Send another request
                </button>
            </div>
        );
    }

    return (
        <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
                <p className="text-secondary font-bold text-[10px] uppercase tracking-widest mb-2">Let's Secure Your Space</p>
                <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Book a Site Visit</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Our elite agents are ready to show you around.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-widest" htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-widest" htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 ..."
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-widest" htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 outline-none transition-colors" />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg shadow-xl shadow-primary/30 transition-transform active:scale-95 mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    <span className="material-icons-outlined text-lg" aria-hidden="true">calendar_today</span>
                    {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
                </button>
            </form>
        </div>
    );
};
