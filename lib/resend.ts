import { Resend } from 'resend';

/**
 * The Resend client, constructed on first use rather than at module load.
 *
 * `new Resend(undefined)` throws "Missing API key". Building the client at
 * import time therefore meant that any module importing this one crashed on a
 * deploy without `RESEND_API_KEY` — including at build time, when Next
 * collects page data for `/api/contact`, and at runtime for every route that
 * transitively imported it.
 *
 * Email is a secondary effect of the routes that use it: an enquiry is stored
 * whether or not it can also be mailed. So a missing key degrades to "no mail
 * sent, warning logged" instead of taking the route down.
 */
let client: Resend | null = null;

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) return null;
    if (!client) client = new Resend(process.env.RESEND_API_KEY);
    return client;
}
