import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { supabase } from '@/lib/supabase';

export const revalidate = 60;

interface BlogPostPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { id } = await params;

    // Fetch post from Supabase
    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !post) {
        notFound();
    }

    return (
        <PublicLayout>
            <div className="bg-background-light dark:bg-background-dark min-h-screen pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumb & Meta */}
                    <div className="mb-8">
                        <nav aria-label="Breadcrumb" className="flex text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                            <span className="mx-2" aria-hidden="true">/</span>
                            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                            <span className="mx-2" aria-hidden="true">/</span>
                            <span className="text-gray-900 dark:text-white truncate" aria-current="page">{post.category}</span>
                        </nav>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                                {post.category}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{post.date}</span>
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between border-y border-gray-200 dark:border-gray-800 py-4 mb-10">
                            <div className="flex items-center gap-3">
                                <img src={post.authorAvatar} alt={post.author} className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-800" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{post.author}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Real Estate Expert</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button aria-label="Share this post" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                    <span className="material-icons-outlined text-sm" aria-hidden="true">share</span>
                                </button>
                                <button aria-label="Bookmark this post" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                                    <span className="material-icons-outlined text-sm" aria-hidden="true">bookmark_border</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-lg mb-12">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-headings:font-display prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-primary max-w-none">
                        <p className="lead text-xl md:text-2xl text-gray-800 dark:text-gray-200 font-medium mb-8">
                            {post.excerpt}
                        </p>

                        <div className="text-gray-900 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />

                    </div>

                    {/* Tags & Footer */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex gap-2">
                                {post.tags.map((tag: string) => (
                                    <span key={tag} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </PublicLayout>
    );
}
