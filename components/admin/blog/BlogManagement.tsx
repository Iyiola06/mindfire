'use client';

import React, { useState } from 'react';
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    authorAvatar?: string;
    image?: string;
    category: string;
    tags: string[];
    published: boolean;
    publishedAt?: string;
}

export default function BlogManagement({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Market Trends',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        published: false,
        author: 'Mindfire Admin',
        authorAvatar: '/logo.svg'
    });

    const openAddModal = () => {
        setEditingPost(null);
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            category: 'Market Trends',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
            published: false,
            author: 'Mindfire Admin',
            authorAvatar: '/logo.svg'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            image: post.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
            published: post.published,
            author: post.author,
            authorAvatar: post.authorAvatar || '/logo.svg'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            const res = await deleteBlogPost(id);
            if (res.success) {
                router.refresh();
            } else {
                alert('Error deleting post: ' + res.error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const data = {
            ...formData,
            slug,
            tags: [formData.category],
            publishedAt: formData.published ? new Date().toISOString() : null
        };

        let res;
        if (editingPost) {
            res = await updateBlogPost(editingPost.id, data);
        } else {
            res = await createBlogPost(data);
        }

        setIsSubmitting(false);
        if (res.success) {
            setIsModalOpen(false);
            router.refresh();
        } else {
            alert('Error saving post: ' + res.error);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Blog Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Create and manage content to engage your audience.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 font-bold"
                >
                    <span className="material-icons-outlined">edit_document</span>
                    New Post
                </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col min-h-[500px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Post Info</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Author</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {initialPosts.map((post) => (
                                <tr key={post.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={post.image || '/logo.svg'} alt="" className="w-16 h-12 rounded object-cover shadow-sm" />
                                            <div className="flex flex-col max-w-sm">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm truncate">{post.title}</span>
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{post.category}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <img src={post.authorAvatar || '/logo.svg'} alt="" className="w-6 h-6 rounded-full" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
                                        </div>
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
                                            <button
                                                onClick={() => openEditModal(post)}
                                                className="text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5"
                                            >
                                                <span className="material-icons-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark text-left shadow-2xl transition-all w-full max-w-3xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="bg-primary px-6 py-5 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1 block">{editingPost ? 'Update Post' : 'New Post'}</span>
                                <h3 className="text-xl font-display font-bold text-white leading-none">{editingPost ? 'Edit Article' : 'Draft Article'}</h3>
                            </div>
                            <button className="text-white/70 hover:text-white transition-colors p-1" onClick={() => setIsModalOpen(false)}>
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Post Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Engaging title goes here..."
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all cursor-pointer"
                                        >
                                            <option>Market Trends</option>
                                            <option>Design</option>
                                            <option>Finance</option>
                                            <option>Home Improvement</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                        <div className="flex items-center mt-3">
                                            <input
                                                type="checkbox"
                                                id="published"
                                                checked={formData.published}
                                                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                            />
                                            <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Publish Immediately</label>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Excerpt (Short Summary)</label>
                                        <textarea
                                            rows={2}
                                            required
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            placeholder="A short summary for the blog grid..."
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                        ></textarea>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Cover Image URL</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Main Content</label>
                                        <textarea
                                            rows={12}
                                            required
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Write your content here (Markdown or HTML supported)..."
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all resize-y"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : editingPost ? 'Update Post' : 'Publish Post'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
