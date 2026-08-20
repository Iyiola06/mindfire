import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { supabase } from '@/lib/supabase';
import { renderArticleBody } from '@/lib/sanitize';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { absoluteUrl, BASE_URL, breadcrumbJsonLd, metaDescription, SITE } from '@/lib/seo';

export const revalidate = 60;

interface BlogPostPageProps {
    params: Promise<{ id: string }>;
}

const fetchPost = async (id: string) => {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    return error || !data ? null : data;
};

/** `blog_posts` stores `publishedAt`; the previous version read `post.date`,
    which is not a column, so the byline rendered a blank. */
const formatDate = (post: { publishedAt?: string | null; createdAt?: string | null }) => {
    const raw = post.publishedAt ?? post.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
        ? null
        : d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
};

const isoDate = (post: { publishedAt?: string | null; createdAt?: string | null }) => {
    const raw = post.publishedAt ?? post.createdAt;
    if (!raw) return undefined;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { id } = await params;
    const post = await fetchPost(id);

    // Unpublished drafts are reachable by id. They must not be indexed, and
    // neither must a 404.
    if (!post || !post.published) {
        return { title: 'Article not found', robots: { index: false, follow: false } };
    }

    const description = metaDescription(post.excerpt);

    return {
        title: post.title,
        description,
        alternates: { canonical: `/blog/${post.id}` },
        openGraph: {
            type: 'article',
            url: absoluteUrl(`/blog/${post.id}`),
            title: post.title,
            description,
            siteName: SITE.name,
            publishedTime: isoDate(post),
            modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
            authors: post.author ? [post.author] : undefined,
            tags: post.tags ?? undefined,
            images: post.image ? [{ url: post.image, alt: post.title }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description,
            images: post.image ? [post.image] : undefined,
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { id } = await params;
    const post = await fetchPost(id);

    // A draft is reachable by id, so the public route has to refuse it. The
    // admin previews through the admin, which reads the row directly.
    if (!post || !post.published) notFound();

    const published = formatDate(post);

    /** Only fields the row actually holds are emitted — no invented rating to
        chase a rich result. The publisher is a reference to the organisation
        node on the home page rather than a second, duplicate description of
        the same business. */
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || undefined,
        image: post.image || undefined,
        datePublished: isoDate(post),
        dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : isoDate(post),
        mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/blog/${post.id}`) },
        publisher: { '@id': `${BASE_URL}/#organisation` },
        author: post.author ? { '@type': 'Person', name: post.author } : undefined,
        keywords: post.tags?.length ? post.tags.join(', ') : undefined,
    };

    return (
        <PublicLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Journal', path: '/blog' },
                            { name: post.title, path: `/blog/${post.id}` },
                        ]),
                    ),
                }}
            />

            <article className="hero-wash min-h-screen pb-section">
                <div className="mx-auto max-w-3xl px-gutter">
                    <nav aria-label="Breadcrumb" className="py-6">
                        <ol className="flex flex-wrap items-center gap-x-2 text-body-sm text-content-muted">
                            <li>
                                <Link href="/" className="hover:text-brand-600">
                                    Home
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <Link href="/blog" className="hover:text-brand-600">
                                    Journal
                                </Link>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li aria-current="page" className="truncate font-medium text-content">
                                {post.category}
                            </li>
                        </ol>
                    </nav>

                    <header className="mb-10">
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                            <Badge color="primary">{post.category}</Badge>
                            {published && (
                                <time dateTime={isoDate(post)} className="text-body-sm text-content-muted">
                                    {published}
                                </time>
                            )}
                        </div>

                        <h1 className="text-balance font-display text-[clamp(2.125rem,4.6vw,3.625rem)] font-bold leading-[1.04] tracking-[-0.03em] text-content">
                            {post.title}
                        </h1>

                        {/* Author only — the previous version captioned every
                            writer "Real Estate Expert", a credential nothing in
                            the record supports. The share and bookmark buttons
                            were also removed: neither was wired to anything. */}
                        {post.author && (
                            <p className="mt-6 border-y border-hairline/10 py-4 text-body-sm text-content">
                                By <span className="font-semibold">{post.author}</span>
                            </p>
                        )}
                    </header>

                    {post.image && (
                        <figure className="mb-12 overflow-hidden rounded-showcase shadow-ambient">
                            <img
                                src={post.image}
                                alt=""
                                className="aspect-[16/9] w-full object-cover"
                                fetchPriority="high"
                            />
                        </figure>
                    )}

                    {post.excerpt && (
                        <p className="mb-10 max-w-[42rem] font-display text-body-lg font-medium text-content">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Body is allowlist-sanitised before it reaches the DOM —
                        see lib/sanitize.ts. It arrives from the database, so it
                        is untrusted input on a public page. */}
                    <div
                        className="prose prose-lg max-w-[42rem] text-body text-content-muted prose-headings:font-display prose-headings:text-content prose-a:text-brand-600 dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: renderArticleBody(post.content ?? '') }}
                    />

                    {post.tags && post.tags.length > 0 && (
                        <ul className="mt-12 flex flex-wrap gap-2 border-t border-hairline/10 pt-8">
                            {post.tags.map((tag: string) => (
                                <li
                                    key={tag}
                                    className="rounded-pill bg-surface-2 px-4 py-2 text-body-sm font-medium text-content-muted"
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-16 rounded-showcase border border-hairline/[0.06] bg-surface p-8 text-center shadow-ambient">
                        <h2 className="font-display text-display-sm font-semibold tracking-tight text-content">
                            Have a question about buying in Abuja?
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-body text-content-muted">
                            An advisor can answer it directly, with the documents to back the answer up.
                        </p>
                        <ButtonLink href="/contact" className="mt-6">
                            Speak with an advisor
                        </ButtonLink>
                    </div>
                </div>
            </article>
        </PublicLayout>
    );
}
