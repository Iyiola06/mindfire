'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/actions';
import { uploadFile } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconClose, IconEdit, IconFileText, IconImage, IconPlus, IconTrash } from '@/components/icons';

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
    publishedAt?: string | null;
}

const CATEGORIES = ['Market Trends', 'Buying Guide', 'Title & Documentation', 'Design', 'Finance'];

const FIELD =
    'block w-full rounded-control border border-hairline/15 bg-surface-2 px-4 py-3 text-body-sm text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted/70 focus:border-brand-600 focus:ring-1 focus:ring-brand-600';
const LABEL = 'mb-2 block text-label font-semibold uppercase text-content-muted';

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80);

const emptyForm = () => ({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: CATEGORIES[0],
    image: '',
    published: false,
    author: 'Mindfire Homes',
    tags: '',
});

export default function BlogManagement({ initialPosts }: { initialPosts: BlogPost[] }) {
    const router = useRouter();
    const imageRef = useRef<HTMLInputElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [tempFile, setTempFile] = useState<File | null>(null);
    const [formData, setFormData] = useState(emptyForm());

    const preview = useMemo(
        () => (tempFile ? URL.createObjectURL(tempFile) : formData.image || ''),
        [tempFile, formData.image],
    );

    const openAddModal = () => {
        setEditingPost(null);
        setTempFile(null);
        setError('');
        setFormData(emptyForm());
        setIsModalOpen(true);
    };

    const openEditModal = (post: BlogPost) => {
        setEditingPost(post);
        setTempFile(null);
        setError('');
        setFormData({
            title: post.title,
            slug: post.slug ?? '',
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            image: post.image || '',
            published: post.published,
            author: post.author,
            tags: (post.tags ?? []).join(', '),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (post: BlogPost) => {
        if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
        const res = await deleteBlogPost(post.id);
        if (res.success) router.refresh();
        else setError(res.error ?? 'Could not delete that article.');
    };

    /**
     * The slug is derived from the title once, when the post is created, and
     * then left alone.
     *
     * The previous version regenerated it from the title on every save. Two
     * consequences: renaming a published article changed its slug, and two
     * articles that happened to share a title collided on the table's UNIQUE
     * constraint and surfaced a raw Postgres error to the author.
     */
    const resolveSlug = () => {
        if (editingPost) return formData.slug || editingPost.slug || slugify(formData.title);

        const base = slugify(formData.slug || formData.title) || 'article';
        const taken = new Set(initialPosts.map((p) => p.slug));
        if (!taken.has(base)) return base;

        let n = 2;
        while (taken.has(`${base}-${n}`)) n += 1;
        return `${base}-${n}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            let imageUrl = formData.image;
            if (tempFile) imageUrl = await uploadFile(tempFile, 'blog');

            const tags = formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            // Preserve the original publication date. Re-saving a published
            // article used to stamp it with the current time, which silently
            // reordered the journal and rewrote the byline date.
            const publishedAt = formData.published
                ? editingPost?.publishedAt ?? new Date().toISOString()
                : null;

            const payload = {
                title: formData.title.trim(),
                slug: resolveSlug(),
                excerpt: formData.excerpt.trim(),
                content: formData.content,
                author: formData.author.trim() || 'Mindfire Homes',
                authorAvatar: '/logo.svg',
                category: formData.category,
                image: imageUrl || null,
                tags: tags.length > 0 ? tags : [formData.category],
                published: formData.published,
                publishedAt,
            };

            const res = editingPost
                ? await updateBlogPost(editingPost.id, payload)
                : await createBlogPost(payload);

            if (res.success) {
                setIsModalOpen(false);
                router.refresh();
            } else {
                setError(res.error ?? 'Could not save that article.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not upload that image.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-content">
            <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <Eyebrow>Content</Eyebrow>
                    <h1 className="mt-3 font-display text-display-md font-bold tracking-tight text-content">Journal</h1>
                    <p className="mt-2 max-w-[42rem] text-body text-content-muted">
                        Articles published to the public journal, plus anything still in draft.
                    </p>
                </div>
                <Button onClick={openAddModal} size="lg" icon={<IconPlus size={18} />}>
                    New article
                </Button>
            </header>

            {error && !isModalOpen && (
                <p role="alert" className="mb-6 rounded-control border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            <div className="overflow-hidden rounded-panel border border-hairline/10 bg-surface shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <caption className="sr-only">Journal articles</caption>
                        <thead className="border-b border-hairline/10 bg-surface-2">
                            <tr>
                                {['Article', 'Author', 'Status', 'Actions'].map((h) => (
                                    <th
                                        key={h}
                                        scope="col"
                                        className={`whitespace-nowrap px-6 py-4 text-label font-semibold uppercase text-content-muted ${
                                            h === 'Actions' ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline/10">
                            {initialPosts.map((post) => (
                                <tr key={post.id} className="transition-colors hover:bg-surface-2/60">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={post.image || '/logo.svg'}
                                                alt=""
                                                className="h-12 w-16 shrink-0 rounded-control bg-surface-2 object-cover"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-body-sm font-semibold text-content">{post.title}</p>
                                                <p className="mt-0.5 text-[0.8125rem] text-content-muted">
                                                    {post.category} · /{post.slug}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-body-sm text-content">{post.author}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <Badge color={post.published ? 'primary' : 'gray'}>
                                            {post.published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(post)}
                                                aria-label={`Edit ${post.title}`}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors duration-short ease-standard hover:bg-brand-600/10 hover:text-brand-600"
                                            >
                                                <IconEdit size={18} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(post)}
                                                aria-label={`Delete ${post.title}`}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors duration-short ease-standard hover:bg-red-500/10 hover:text-red-600"
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {initialPosts.length === 0 && (
                    <div className="px-6 py-20 text-center">
                        <IconFileText size={40} className="mx-auto mb-4 text-content-muted" />
                        <p className="font-display text-body-lg font-semibold text-content">No articles yet</p>
                        <p className="mx-auto mt-2 max-w-sm text-body-sm text-content-muted">
                            Drafts are visible here only. Publishing puts an article on the public journal.
                        </p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="article-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
                >
                    <div
                        role="presentation"
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-panel border border-hairline/10 bg-surface shadow-elevated">
                        <div className="flex shrink-0 items-center justify-between border-b border-hairline/10 px-6 py-5">
                            <div>
                                <Eyebrow>{editingPost ? 'Update' : 'New'}</Eyebrow>
                                <h2 id="article-modal-title" className="mt-1.5 font-display text-display-sm font-bold tracking-tight text-content">
                                    {editingPost ? 'Edit article' : 'Draft article'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Close"
                                className="flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors hover:bg-content/10"
                            >
                                <IconClose size={22} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <form onSubmit={handleSubmit} className="space-y-5" id="article-form">
                                {error && (
                                    <p role="alert" className="rounded-control border border-red-500/30 bg-red-500/10 px-4 py-3 text-body-sm text-red-600 dark:text-red-400">
                                        {error}
                                    </p>
                                )}

                                <div>
                                    <label htmlFor="post-title" className={LABEL}>Title</label>
                                    <input
                                        id="post-title"
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="What a buyer should check before paying a deposit"
                                        className={FIELD}
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="post-slug" className={LABEL}>URL slug</label>
                                        <input
                                            id="post-slug"
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder={slugify(formData.title) || 'auto-generated'}
                                            className={FIELD}
                                        />
                                        <p className="mt-1.5 text-[0.75rem] text-content-muted">
                                            {editingPost
                                                ? 'Changing this breaks any existing links to the article.'
                                                : 'Left blank, it is generated from the title.'}
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="post-category" className={LABEL}>Category</label>
                                        <select
                                            id="post-category"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className={`${FIELD} cursor-pointer`}
                                        >
                                            {CATEGORIES.map((c) => (
                                                <option key={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="post-author" className={LABEL}>Author</label>
                                        <input
                                            id="post-author"
                                            type="text"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            className={FIELD}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="post-tags" className={LABEL}>Tags</label>
                                        <input
                                            id="post-tags"
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="title, abuja, deposits"
                                            className={FIELD}
                                        />
                                        <p className="mt-1.5 text-[0.75rem] text-content-muted">Comma separated.</p>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="post-excerpt" className={LABEL}>Excerpt</label>
                                    <textarea
                                        id="post-excerpt"
                                        rows={2}
                                        required
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="One or two sentences — this is the search-result description as well as the card summary."
                                        className={FIELD}
                                    />
                                    <p className="mt-1.5 text-[0.75rem] text-content-muted">
                                        {formData.excerpt.length}/160 characters used by search engines.
                                    </p>
                                </div>

                                <div>
                                    <span className={LABEL}>Cover image</span>
                                    <button
                                        type="button"
                                        onClick={() => imageRef.current?.click()}
                                        className="flex w-full cursor-pointer items-center justify-center rounded-control border-2 border-dashed border-hairline/15 bg-surface-2 p-6 text-center transition-colors duration-short ease-standard hover:border-brand-600"
                                    >
                                        {preview ? (
                                            <span className="flex items-center gap-4">
                                                <img src={preview} className="h-16 w-24 rounded-control object-cover" alt="" />
                                                <span className="text-left">
                                                    <span className="block text-body-sm font-semibold text-content">Image selected</span>
                                                    <span className="mt-0.5 block text-[0.8125rem] font-semibold text-brand-600">Click to replace</span>
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="flex flex-col items-center gap-2 text-content-muted">
                                                <IconImage size={28} />
                                                <span className="text-body-sm font-medium">Click to upload a cover image</span>
                                            </span>
                                        )}
                                    </button>
                                    <input
                                        type="file"
                                        hidden
                                        ref={imageRef}
                                        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                                        onChange={(e) => setTempFile(e.target.files?.[0] || null)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="post-content" className={LABEL}>Article body</label>
                                    <textarea
                                        id="post-content"
                                        rows={12}
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="<p>The body is sanitised against an allowlist before it renders.</p>"
                                        className={`${FIELD} resize-y font-mono text-[0.8125rem]`}
                                    />
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 rounded-control border border-hairline/15 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        className="h-4 w-4 rounded border-hairline/30 text-brand-600 focus:ring-brand-600"
                                    />
                                    <span className="text-body-sm font-medium text-content">
                                        Published — visible on the public journal
                                    </span>
                                </label>
                            </form>
                        </div>

                        <div className="flex shrink-0 justify-end gap-3 border-t border-hairline/10 px-6 py-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="article-form" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving…' : editingPost ? 'Save changes' : 'Create article'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
