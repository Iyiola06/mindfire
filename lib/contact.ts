/**
 * Single source of truth for Mindfire's public contact details.
 *
 * Everything that renders a phone number, a tel: link, a WhatsApp link, or the
 * office address imports from here, so the displayed number and the dialled
 * number can never drift apart.
 *
 * OWNER ACTION REQUIRED
 * --------------------
 * `phoneE164` and `streetLine` are null because neither value exists anywhere
 * in this codebase. The previous site shipped `+1 (555) 123-4567` and a Beverly
 * Hills address, which are placeholders rather than facts about this business.
 *
 * Fill these in and the call button, the WhatsApp button, and the full postal
 * address appear automatically across every page. Until then they are hidden on
 * purpose: a dialable link to a guessed number is a control that looks
 * functional and does nothing.
 *
 *   phoneE164: '+2349012345678'   // E.164 — no spaces, leading +, country code
 *   streetLine: 'Plot 123, Ademola Adetokunbo Crescent, Wuse II'
 */
export const OFFICE: {
    name: string;
    streetLine: string | null;
    cityLine: string;
    email: string;
    phoneE164: string | null;
    hours: string;
    responseTime: string;
} = {
    name: 'Mindfire Homes',
    streetLine: null,
    cityLine: 'Abuja, Nigeria',
    email: 'hello@mindfirehomes.com',
    phoneE164: null,
    hours: 'Mon–Sat, 8:00 – 18:00 WAT',
    responseTime: 'within one business day',
};

/** Renders +2349012345678 as +234 901 234 5678. Falls back to the raw E.164
    string for non-Nigerian numbers rather than mangling them. */
export const displayPhone = (e164: string) => {
    const digits = e164.replace(/\D/g, '');
    return digits.length === 13 && digits.startsWith('234')
        ? `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
        : e164;
};

export const whatsappHref = (e164: string, message: string) =>
    `https://wa.me/${e164.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

export const mailtoHref = (subject: string) =>
    `mailto:${OFFICE.email}?subject=${encodeURIComponent(subject)}`;

/**
 * OWNER ACTION REQUIRED — social profiles.
 *
 * The footer previously rendered four social icons pointing at `href="#"`.
 * Every one of them was a control that looked functional and did nothing: a
 * visitor clicking Instagram got a jump to the top of the page.
 *
 * Add the real profile URLs here and each icon appears. Leave an entry out and
 * that icon simply is not rendered — an absent link is honest, a dead one is
 * not. Do not add a network the business does not actually maintain.
 *
 *   { network: 'instagram', href: 'https://instagram.com/mindfirehomes' },
 */
export const SOCIAL_LINKS: { network: 'facebook' | 'twitter' | 'instagram' | 'linkedin'; href: string }[] = [];
