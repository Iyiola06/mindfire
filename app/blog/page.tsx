'use client';

import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MOCK_BLOG_POSTS } from '@/constants';

export default function BlogPage() {
    const featuredPost = MOCK_BLOG_POSTS[0];
    const otherPosts = MOCK_BLOG_POSTS.slice(1);

    return (
        <PublicLayout>
            <div className="bg-background-light dark:bg-background-dark min-h-screen pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8 text-center md:text-left">
                        <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-2">Insights & News</p>
                        <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
                            Mindfire <span className="text-primary italic">Journal</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                            Expert advice, market trends, and design inspiration for the modern real estate investor.
                        </p>
                    </div>

                    {/* Featured Post */}
                    {featuredPost && (
                        <div className="mb-16">
                            <Link href={`/blog/${featuredPost.id}`} className="group block relative rounded-2xl overflow-hidden shadow-xl aspect-auto md:aspect-[21/9]">
                                <img
                                    src={featuredPost.image}
                                    alt={featuredPost.title}
                                    className="w-full h-[500px] md:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                                    <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-4">
                                        {featuredPost.category}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 group-hover:text-secondary transition-colors max-w-4xl">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-gray-300 md:text-lg mb-6 max-w-3xl line-clamp-2 md:line-clamp-none">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <img src={featuredPost.authorAvatar} alt={featuredPost.author} className="w-10 h-10 rounded-full border-2 border-white" />
                                        <div className="text-sm">
                                            <p className="font-bold text-white">{featuredPost.author}</p>
                                            <p className="text-gray-400">{featuredPost.date}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Post Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherPosts.map(post => (
                            <Link key={post.id} href={`/blog/${post.id}`} className="group bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden shadow-soft border border-gray-200 dark:border-gray-800 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                <div className="relative h-60 overflow-hidden">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider shadow-sm">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">{post.date}</p>
                                    <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full" />
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{post.author}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-16 flex justify-center">
                        <button className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl font-bold transition-colors">
                            Load More Articles
                        </button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
