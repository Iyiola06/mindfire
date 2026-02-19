'use client';

import React, { useState } from 'react';
import { sendBulkEmail } from '@/lib/actions';

export default function NewsletterAdminPage() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm('Are you sure you want to send this email to ALL subscribers?')) return;

        setStatus('sending');
        const res = await sendBulkEmail(subject, content);

        if (res.success) {
            setStatus('success');
            setResult({ sent: res.sent || 0, failed: res.failed || 0 });
            setSubject('');
            setContent('');
        } else {
            setStatus('error');
            console.error(res.error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8">Newsletter Broadcast</h1>

            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">

                {status === 'success' && result && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                        <p className="font-bold">Email Broadcast Sent!</p>
                        <p>Successfully sent to {result.sent} subscribers. ({result.failed} failed)</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                        <p className="font-bold">Error Sending Broadcast</p>
                        <p>Check console for details.</p>
                    </div>
                )}

                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Subject Line</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            placeholder="e.g. New Exclusive Listing: Seaside Villa"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email Content (HTML supported)</label>
                        <textarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                            placeholder="<p>Hello subscribers,</p>..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Basic HTML tags like &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;br&gt; are supported.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {status === 'sending' ? (
                                <>
                                    <span className="material-icons-outlined animate-spin">refresh</span>
                                    Sending Broadcast...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-outlined">send</span>
                                    Send to All Subscribers
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Preview</h2>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50">
                    <iframe
                        srcDoc={`
                            <html>
                            <head><style>body { margin: 0; font-family: sans-serif; }</style></head>
                            <body>
                                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px;">
                                    <div style="background: #111; color: white; padding: 20px; text-align: center;">Mindfire Homes</div>
                                    <div style="padding: 20px;">
                                        <h2>${subject || 'Subject Line'}</h2>
                                        <div>${content || 'Content will appear here...'}</div>
                                    </div>
                                    <div style="background: #eee; padding: 20px; text-align: center; font-size: 12px;">
                                        © ${new Date().getFullYear()} Mindfire Homes
                                    </div>
                                </div>
                            </body>
                            </html>
                        `}
                        className="w-full h-[500px] bg-white"
                        title="Email Preview"
                    />
                </div>
            </div>
        </div>
    );
}
