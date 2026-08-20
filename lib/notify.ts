import { getResend } from './resend'
import { OFFICE } from './contact'

/**
 * Sender address for transactional mail.
 *
 * OWNER ACTION REQUIRED — `onboarding@resend.dev` is Resend's shared sandbox
 * sender. It works for testing and will only deliver to the account owner's own
 * address. Verify the mindfirehomes.com domain in Resend and set
 * `RESEND_FROM="Mindfire Homes <hello@mindfirehomes.com>"`.
 */
const FROM = process.env.RESEND_FROM || 'Mindfire Homes <onboarding@resend.dev>'

/** Where new-enquiry alerts go. Defaults to the published office address. */
const NOTIFY_TO = process.env.LEAD_NOTIFICATION_EMAIL || OFFICE.email

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

export interface LeadNotification {
    name: string
    email: string
    phone?: string | null
    propertyInterest: string
    budget?: string | null
    message?: string | null
}

/**
 * Emails the team when an enquiry arrives.
 *
 * Deliberately never throws. The lead row is already committed by the time
 * this runs, so a mail failure must not turn a successful submission into an
 * error for the visitor — it is logged and swallowed.
 *
 * `Reply-To` is set to the enquirer, so replying from the inbox reaches them
 * directly rather than reaching Resend.
 */
export async function notifyNewLead(lead: LeadNotification): Promise<void> {
    const resend = getResend()
    if (!resend) {
        console.warn('notifyNewLead: RESEND_API_KEY is not set — no notification sent.')
        return
    }

    const rows: [string, string | null | undefined][] = [
        ['Name', lead.name],
        ['Email', lead.email],
        ['Phone', lead.phone],
        ['Interest', lead.propertyInterest],
        ['Budget', lead.budget],
    ]

    const html = `
        <div style="font-family:system-ui,sans-serif;color:#1a1a1a;max-width:600px">
          <h2 style="margin:0 0 16px;font-size:20px;letter-spacing:-0.02em">New enquiry</h2>
          <table style="border-collapse:collapse;font-size:14px">
            ${rows
                .filter(([, value]) => Boolean(value))
                .map(
                    ([label, value]) =>
                        `<tr><td style="padding:4px 16px 4px 0;color:#5a6268">${label}</td><td style="padding:4px 0;font-weight:600">${escapeHtml(String(value))}</td></tr>`,
                )
                .join('')}
          </table>
          ${
              lead.message
                  ? `<p style="margin:20px 0 0;padding:16px;background:#f4f5f6;border-radius:12px;font-size:14px;line-height:1.6">${escapeHtml(lead.message)}</p>`
                  : ''
          }
        </div>`

    try {
        await resend.emails.send({
            from: FROM,
            to: NOTIFY_TO,
            replyTo: lead.email,
            subject: `New enquiry — ${lead.name} (${lead.propertyInterest})`,
            html,
        })
    } catch (error) {
        console.error('notifyNewLead: failed to send notification', error)
    }
}
