'use client';

import React, { useState } from 'react';
import { MOCK_BLOG_POSTS } from '@/constants';

export default function AdminBlog() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Blog Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Create and manage content to engage your audience.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 font-bold"
                >
                    <span className="material-icons-outlined">edit_document</span>
                    New Post
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Posts', value: '45', icon: 'article', color: 'blue' },
                    { label: 'Total Views', value: '24.5K', icon: 'visibility', color: 'primary' },
                    { label: 'Drafts', value: '3', icon: 'drafts', color: 'secondary' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                        </div>
                        <div className={`p-4 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400`}>
                            <span className="material-icons-outlined text-3xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Container */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div className="relative w-full sm:w-72">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-icons-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Search posts..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary dark:text-white outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2.5 focus:ring-primary outline-none">
                            <option>All Categories</option>
                            <option>Market Trends</option>
                            <option>Design</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Post Info</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Author</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {MOCK_BLOG_POSTS.map((post) => (
                                <tr key={post.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={post.image} alt="" className="w-16 h-12 rounded object-cover shadow-sm" />
                                            <div className="flex flex-col max-w-sm">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm truncate">{post.title}</span>
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{post.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${post.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                                                <span className="material-icons-outlined text-xl">edit</span>
                                            </button>
                                            <button className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                                <span className="material-icons-outlined text-xl">delete_outline</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Post Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark text-left shadow-2xl transition-all w-full max-w-3xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="bg-primary px-6 py-5 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1 block">New Blog Post</span>
                                <h3 className="text-xl font-display font-bold text-white leading-none">Draft Article</h3>
                            </div>
                            <button className="text-white/70 hover:text-white transition-colors p-1" onClick={() => setIsModalOpen(false)}>
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto flex-1">
                            <form className="space-y-6">
                                <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-8 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group bg-gray-50/50 dark:bg-gray-800/30">
                                    <div className="text-center">
                                        <span className="material-icons-outlined mx-auto text-4xl text-gray-400 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                        <div className="mt-3 flex text-sm text-gray-600 dark:text-gray-400 justify-center font-bold">
                                            <span className="text-primary hover:underline">Upload Cover Image</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Post Title</label>
                                        <input type="text" placeholder="Engaging title goes here..." className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <select className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all cursor-pointer">
                                            <option>Market Trends</option>
                                            <option>Design</option>
                                            <option>Finance</option>
                                            <option>Home Improvement</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Publish Date</label>
                                        <input type="date" className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Excerpt (Short Summary)</label>
                                        <textarea rows={2} placeholder="A short summary for the blog grid..." className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"></textarea>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Main Content</label>
                                        <div className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex gap-2">
                                                <button type="button" className="p-1 text-gray-600 dark:text-gray-300 hover:text-primary"><span className="material-icons-outlined text-sm">format_bold</span></button>
                                                <button type="button" className="p-1 text-gray-600 dark:text-gray-300 hover:text-primary"><span className="material-icons-outlined text-sm">format_italic</span></button>
                                                <button type="button" className="p-1 text-gray-600 dark:text-gray-300 hover:text-primary"><span className="material-icons-outlined text-sm">format_list_bulleted</span></button>
                                                <button type="button" className="p-1 text-gray-600 dark:text-gray-300 hover:text-primary"><span className="material-icons-outlined text-sm">link</span></button>
                                            </div>
                                            <textarea rows={8} placeholder="Write your content here..." className="block w-full border-none bg-transparent text-gray-900 dark:text-white focus:ring-0 px-4 py-3 font-medium outline-none resize-y"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-6 py-2.5 rounded-lg border border-primary text-primary font-bold hover:bg-primary/5 transition-all"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Save Draft
                            </button>
                            <button
                                type="button"
                                className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Publish Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
