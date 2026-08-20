'use client';

import React, { useState } from 'react';
import { sendBulkEmail } from '@/lib/actions';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconAlert, IconCheck, IconSend, IconSpinner } from '@/components/icons';

const FIELD =
    'block w-full rounded-control border border-hairline/15 bg-surface-2 px-4 py-3 text-body-sm text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted/70 focus:border-brand-600 focus:ring-1 focus:ring-brand-600';
const LABEL = 'mb-2 block text-label font-semibold uppercase text-content-muted';

export default function NewsletterAdminPage() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
    const [error, setError] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        // This mails every subscriber on the list and cannot be recalled.
        if (!confirm('Send this email to every subscriber? This cannot be undone.')) return;

        setStatus('sending');
        setError('');

        const res = await sendBulkEmail(subject, content);

        // `sendBulkEmail` returns either a send report or an authorisation
        // failure. The previous version read `res.sent` unconditionally, so a
        // rejected send reported "sent to 0 subscribers" as a success.
        if (res.success) {
            setStatus('success');
            setResult({ sent: res.sent ?? 0, failed: res.failed ?? 0 });
            setSubject('');
            setContent('');
        } else {
            setStatus('error');
            setError(res.error ?? 'The broadcast could not be sent.');
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <header className="mb-8">
                <Eyebrow>Broadcast</Eyebrow>
                <h1 className="mt-3 font-display text-display-md font-bold tracking-tight text-content">
                    Newsletter
                </h1>
                <p className="mt-2 max-w-[42rem] text-body text-content-muted">
                    One email to everyone on the subscriber list. There is no send queue and no undo —
                    check the preview below before you send.
                </p>
            </header>

            <div className="rounded-panel border border-hairline/10 bg-surface p-6 shadow-soft sm:p-8">
                {status === 'success' && result && (
                    <p
                        role="status"
                        className="mb-6 flex items-start gap-3 rounded-control border border-brand-600/30 bg-brand-600/10 px-4 py-3 text-body-sm text-content"
                    >
                        <IconCheck size={18} className="mt-0.5 shrink-0 text-brand-600" />
                        <span>
                            Sent to {result.sent} subscriber{result.sent === 1 ? '' : 's'}.
                            {result.failed > 0 && ` ${result.failed} failed — see the server log.`}
                        </span>
                    </p>
                )}

                {status === 'error' && (
                    <p
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-control border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-600 dark:text-red-400"
                    >
                        <IconAlert size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </p>
                )}

                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label htmlFor="broadcast-subject" className={LABEL}>
                            Subject line
                        </label>
                        <input
                            id="broadcast-subject"
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={FIELD}
                            placeholder="Three new Maitama listings, and what we checked"
                        />
                    </div>

                    <div>
                        <label htmlFor="broadcast-content" className={LABEL}>
                            Body
                        </label>
                        <textarea
                            id="broadcast-content"
                            required
                            rows={10}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={`${FIELD} resize-y font-mono text-[0.8125rem]`}
                            placeholder="<p>Hello,</p>"
                        />
                        <p className="mt-2 text-[0.75rem] text-content-muted">
                            Basic HTML — &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;br&gt;.
                        </p>
                    </div>

                    <div className="border-t border-hairline/10 pt-6">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={status === 'sending'}
                            icon={
                                status === 'sending' ? (
                                    <IconSpinner size={18} className="animate-spin" />
                                ) : (
                                    <IconSend size={18} />
                                )
                            }
                        >
                            {status === 'sending' ? 'Sending…' : 'Send to all subscribers'}
                        </Button>
                    </div>
                </form>
            </div>

            <section className="mt-8">
                <h2 className="mb-4 font-display text-body-lg font-bold text-content">Preview</h2>
                <div className="overflow-hidden rounded-panel border border-hairline/10 bg-white">
                    <iframe
                        // Sandboxed with no allowances: the preview renders
                        // author-supplied markup and has no reason to run
                        // scripts or reach the parent document.
                        sandbox=""
                        srcDoc={`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:system-ui,sans-serif;color:#1a1a1a}</style></head><body>
                            <div style="max-width:600px;margin:0 auto;background:#fff">
                                <div style="background:#0a0a0a;color:#fff;padding:24px;text-align:center;font-weight:700;letter-spacing:-0.01em">MINDFIRE HOMES</div>
                                <div style="padding:28px 24px">
                                    <h2 style="margin:0 0 16px;font-size:22px;letter-spacing:-0.02em">${subject || 'Subject line'}</h2>
                                    <div style="font-size:15px;line-height:1.65;color:#4b5459">${content || 'Body will appear here…'}</div>
                                </div>
                                <div style="background:#f4f5f6;padding:20px;text-align:center;font-size:12px;color:#7a8288">© ${new Date().getFullYear()} Mindfire Homes</div>
                            </div>
                        </body></html>`}
                        className="h-[500px] w-full bg-white"
                        title="Email preview"
                    />
                </div>
            </section>
        </div>
    );
}
