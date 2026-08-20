/**
 * Conservative HTML sanitiser for database-authored article bodies.
 *
 * WHY THIS EXISTS
 * ---------------
 * `app/blog/[id]/page.tsx` renders `post.content` through
 * `dangerouslySetInnerHTML`. That value comes from the `blog_posts` table, so
 * anything able to write a row — a compromised admin session, a permissive RLS
 * policy, a direct database write — becomes stored XSS on a public page that
 * every visitor loads. Rendering the body as plain text would close the hole
 * but would also throw away the article formatting, so instead everything
 * outside a small allowlist is removed.
 *
 * REPLACE THIS WHEN DEPENDENCIES CAN BE INSTALLED
 * -----------------------------------------------
 * This is a string-level allowlist, not a parser. It is deliberately strict —
 * anything it does not positively recognise is dropped — but a real DOM-based
 * sanitiser handles malformed and deliberately-obfuscated markup better than a
 * regex ever will. Swap in `isomorphic-dompurify` and delete this file:
 *
 *   import DOMPurify from 'isomorphic-dompurify'
 *   const clean = DOMPurify.sanitize(post.content, { ALLOWED_TAGS: [...] })
 *
 * Until then this is the floor, not the ceiling.
 */

/** Elements dropped along with everything inside them. Keeping the inner text
    of a <script> would just paste the payload into the page as visible text. */
const DROP_WITH_CONTENT = [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'noscript',
    'template',
    'svg',
    'math',
    'form',
    'input',
    'button',
    'select',
    'textarea',
];

/** Tags an article body is allowed to use. Anything else has its tags removed
    while its text is kept, so unexpected markup degrades to prose. */
const ALLOWED_TAGS = new Set([
    'p', 'br', 'hr',
    'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub', 'mark', 'small',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'span', 'div',
]);

/** Attributes allowed per tag. Everything else — including every `on*` handler,
    `style`, and `srcset` — is discarded. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
    a: new Set(['href', 'title']),
    img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading']),
    th: new Set(['colspan', 'rowspan', 'scope']),
    td: new Set(['colspan', 'rowspan']),
};

/** Only these URL shapes survive. `javascript:` is the obvious one; `data:` is
    excluded too because `data:text/html` executes in some contexts. */
const SAFE_URL = /^(?:https?:\/\/|mailto:|tel:|\/|#|\.\/|\.\.\/)/i;

const escapeText = (s: string) =>
    s.replace(/&(?!(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);)/gi, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

/** Reads `name="value"`, `name='value'`, and bare `name=value` pairs. */
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>`]+)))?/g;

const sanitizeAttributes = (tag: string, rawAttrs: string) => {
    const allowed = ALLOWED_ATTRS[tag];
    if (!allowed || !rawAttrs.trim()) return '';

    const kept: string[] = [];
    let m: RegExpExecArray | null;
    ATTR_RE.lastIndex = 0;

    while ((m = ATTR_RE.exec(rawAttrs)) !== null) {
        const name = m[1].toLowerCase();
        const value = m[2] ?? m[3] ?? m[4] ?? '';

        if (!allowed.has(name)) continue;

        // Decode the handful of entity forms used to smuggle "javascript:"
        // past a literal string check, then test what the browser would see.
        const decoded = value
            .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
            .replace(/&#(\d+);?/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
            .replace(/\s+/g, '')
            .trim();

        if ((name === 'href' || name === 'src') && !SAFE_URL.test(decoded)) continue;

        kept.push(`${name}="${value.replace(/"/g, '&quot;')}"`);
    }

    // rel on outbound links: the article author does not choose this.
    if (tag === 'a' && kept.some((a) => a.startsWith('href='))) {
        kept.push('rel="noopener noreferrer nofollow"');
    }

    return kept.length ? ` ${kept.join(' ')}` : '';
};

export function sanitizeHtml(input: string): string {
    if (!input) return '';

    let html = input;

    // Comments first — they can hide markup from later passes.
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Dangerous elements, with their content. The unclosed-tag alternative
    // catches `<script>alert(1)` where the closing tag never arrives.
    for (const tag of DROP_WITH_CONTENT) {
        html = html.replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, 'gi'), '');
        html = html.replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi'), '');
    }

    // Then every remaining tag, one at a time.
    return html.replace(
        /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g,
        (_match, closing: string, rawName: string, rawAttrs: string) => {
            const tag = rawName.toLowerCase();
            // Unknown tag: drop the tag, keep whatever text it wrapped.
            if (!ALLOWED_TAGS.has(tag)) return '';
            if (closing) return `</${tag}>`;

            const attrs = sanitizeAttributes(tag, rawAttrs);
            const selfClosing = tag === 'br' || tag === 'hr' || tag === 'img';
            return selfClosing ? `<${tag}${attrs} />` : `<${tag}${attrs}>`;
        },
    );
}

/**
 * Article bodies stored as plain text with blank lines between paragraphs.
 *
 * The previous implementation ran `content.replace(/\n/g, '<br/>')` over raw,
 * unsanitised HTML. This sanitises first, then converts newlines, so a body
 * can be written either as HTML or as plain prose and neither one can inject.
 */
export function renderArticleBody(content: string): string {
    const clean = sanitizeHtml(content);
    // Already block-formatted — leave the author's structure alone.
    if (/<(p|h[2-6]|ul|ol|blockquote|pre|table|figure|div)\b/i.test(clean)) return clean;
    return clean
        .split(/\n{2,}/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
        .join('');
}

export { escapeText };
