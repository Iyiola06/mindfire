import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { absoluteUrl, breadcrumbJsonLd, SITE } from '@/lib/seo';
import { IconFileText } from '@/components/icons';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Journal — notes on buying property in Abuja',
    description:
        'Title verification, payment structures, district infrastructure, and what to check before you commit — what we have learned buying and selling in Abuja.',
    alternates: { canonical: '/blog' },
    openGraph: {
        type: 'website',
        url: absoluteUrl('/blog'),
        title: `Journal | ${SITE.name}`,
        description:
            'Notes on buying property in Abuja — title verification, payment structures, and district infrastructure.',
    },
};

/** `blog_posts` stores `publishedAt`, not `date`. The previous version read
    `post.date`, a column that does not exist, so every card rendered a blank
    line where the date should be. */
const formatDate = (post: { publishedAt?: string | null; createdAt?: string | null }) => {
    const raw = post.publishedAt ?? post.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime())
        ? null
        : d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default async function BlogPage() {
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('publishedAt', { ascending: false });

    if (error) console.error('Error fetching blog posts:', error);

    const [featuredPost, ...otherPosts] = posts ?? [];

    return (
        <PublicLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        breadcrumbJsonLd([
                            { name: 'Home', path: '/' },
                            { name: 'Journal', path: '/blog' },
                        ]),
                    ),
                }}
            />

            <PageHeader
                eyebrow="Insights and market notes"
                title="Journal"
                lede="What we have learned buying and selling in Abuja — title verification, payment structures, district infrastructure, and the questions worth asking before you commit."
            />

            <div className="bg-bg pb-section pt-section-sm">
                <div className="mx-auto max-w-content px-gutter">
                    {featuredPost && (
                        <Reveal>
                            <Link
                                href={`/blog/${featuredPost.id}`}
                                className="group relative block overflow-hidden rounded-showcase shadow-ambient"
                            >
                                <img
                                    src={featuredPost.image}
                                    alt=""
                                    className="h-[24rem] w-full object-cover transition-transform duration-spatial ease-standard group-hover:scale-105 md:h-[32rem]"
                                    fetchPriority="high"
                                />
                                {/* Decorative alt above: the headline immediately
                                    below already carries the meaning, so an
                                    announced duplicate would be noise. */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                                    <Badge color="primary">{featuredPost.category}</Badge>
                                    <h2 className="mt-4 max-w-4xl font-display text-[clamp(1.5rem,3vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.025em] text-white">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="mt-3 max-w-[42rem] text-body-lg text-white/80">
                                        {featuredPost.excerpt}
                                    </p>
                                    <p className="mt-5 text-body-sm font-medium text-white/70">
                                        {featuredPost.author}
                                        {formatDate(featuredPost) && ` · ${formatDate(featuredPost)}`}
                                    </p>
                                </div>
                            </Link>
                        </Reveal>
                    )}

                    {otherPosts.length > 0 && (
                        <div className="grid grid-cols-1 gap-7 pt-14 md:grid-cols-2 lg:grid-cols-3">
                            {otherPosts.map((post, i) => (
                                <Reveal key={post.id} delay={(i % 3) * 80}>
                                    <Link
                                        href={`/blog/${post.id}`}
                                        className="group flex h-full flex-col overflow-hidden rounded-showcase border border-hairline/[0.06] bg-surface p-3 shadow-ambient transition-all duration-short ease-standard hover:-translate-y-1 hover:shadow-lift"
                                    >
                                        <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-surface">
                                            <img
                                                src={post.image}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-spatial ease-standard group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <span className="absolute left-3.5 top-3.5">
                                                <Badge color="overlay">{post.category}</Badge>
                                            </span>
                                        </div>
                                        <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
                                            {formatDate(post) && (
                                                <p className="mb-2 text-body-sm text-content-muted">{formatDate(post)}</p>
                                            )}
                                            <h3 className="font-display text-body-lg font-semibold tracking-tight text-content transition-colors duration-short ease-standard group-hover:text-brand-600">
                                                {post.title}
                                            </h3>
                                            <p className="mt-3 line-clamp-3 text-body-sm text-content-muted">
                                                {post.excerpt}
                                            </p>
                                            <p className="mt-auto border-t border-hairline/10 pt-4 text-body-sm font-medium text-content">
                                                {post.author}
                                            </p>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    )}

                    {/* The previous version ended with a "Load More Articles"
                        button that was wired to nothing. Every published post is
                        on this page; when the archive grows past a single screen
                        this becomes real pagination rather than a decoy. */}

                    {!featuredPost && (
                        <div className="rounded-showcase border border-hairline/[0.06] bg-surface py-24 text-center shadow-ambient">
                            <IconFileText size={44} className="mx-auto mb-4 text-content-muted" />
                            <p className="font-display text-display-sm font-semibold text-content">
                                No articles published yet
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-body text-content-muted">
                                We are writing up what we know about buying in Abuja. In the meantime, an
                                advisor can answer the same questions directly.
                            </p>
                            <ButtonLink href="/contact" className="mt-7">
                                Ask an advisor
                            </ButtonLink>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
