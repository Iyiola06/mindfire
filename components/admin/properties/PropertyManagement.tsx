'use client';

import React, { useState, useRef, useCallback } from 'react';
import { createProperty, updateProperty, deleteProperty } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { uploadFile } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import {
    IconArrowRight,
    IconCheck,
    IconChevronLeft,
    IconClose,
    IconEdit,
    IconImage,
    IconPlus,
    IconSearch,
    IconTrash,
} from '@/components/icons';

const AMENITY_OPTIONS = [
    'Smart Home', '24/7 Security', 'Private Gym', 'Infinity Pool',
    "Chef's Kitchen", 'Fibre Internet', 'Home Office', 'Garden',
    'Garage', 'Wine Cellar', 'Elevator', 'Cinema Room'
];

type ModalMode = 'add' | 'edit';

type FormData = {
    name: string;
    address: string;
    price: string;
    currency: 'USD' | 'NGN';
    status: Property['status'];
    beds: string;
    baths: string;
    sqft: string;
    image: string;
    tags: string[];
    featured: boolean;
    description: string;
    amenities: string[];
    images: string[];
    floorPlans: { label: string; image: string }[];
};

const emptyForm = (): FormData => ({
    name: '', address: '', price: '', currency: 'USD',
    status: 'For Sale', beds: '', baths: '', sqft: '',
    image: '', tags: [], featured: false, description: '',
    amenities: [], images: [], floorPlans: [],
});

/**
 * These three were declared inside `PropertyManagement`, which meant React saw
 * a brand-new component type on every render and unmounted/remounted their
 * subtrees each time — the cause of the scroll-position loss the modal comment
 * refers to. At module scope the type is stable and the DOM is reused.
 */
const CurrencyToggle: React.FC<{ value: 'USD' | 'NGN'; onChange: (c: 'USD' | 'NGN') => void }> = ({ value, onChange }) => (
    <div className="flex shrink-0 overflow-hidden rounded-control border border-hairline/15 text-body-sm font-semibold">
        {(['USD', 'NGN'] as const).map(cur => (
            <button key={cur} type="button" onClick={() => onChange(cur)} aria-pressed={value === cur}
                className={`px-4 py-3 transition-colors duration-short ease-standard ${value === cur ? 'bg-brand-600 text-white' : 'bg-surface-2 text-content-muted hover:text-content'} ${cur === 'NGN' ? 'border-l border-hairline/15' : ''}`}>
                {cur}
            </button>
        ))}
    </div>
);

const Toggle: React.FC<{ value: boolean; onChange: () => void; label: string }> = ({ value, onChange, label }) => (
    <button type="button" onClick={onChange} role="switch" aria-checked={value} aria-label={label}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors duration-short ease-standard ${value ? 'bg-brand-600' : 'bg-content/15'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-pill bg-white shadow transition-transform duration-short ease-standard ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const ImageZone: React.FC<{ preview?: string | null; onClick: () => void; label: string }> = ({ preview, onClick, label }) => (
    <button type="button" onClick={onClick}
        className="flex w-full cursor-pointer items-center justify-center rounded-control border-2 border-dashed border-hairline/15 bg-surface-2 p-5 text-center transition-colors duration-short ease-standard hover:border-brand-600">
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
                <IconImage size={26} />
                <span className="text-body-sm font-medium">{label}</span>
            </span>
        )}
    </button>
);

type TempFiles = {
    mainImage: File | null;
    gallery: File[];
    floorPlan: { label: string; file: File } | null;
};

const FIELD = 'block w-full rounded-control border border-hairline/15 bg-surface-2 px-4 py-3 text-body-sm text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted/70 focus:border-brand-600 focus:ring-1 focus:ring-brand-600';
const LABEL = 'mb-2 block text-label font-semibold uppercase text-content-muted';

export default function PropertyManagement({ initialProperties }: { initialProperties: Property[] }) {
    const [modalMode, setModalMode] = useState<ModalMode>('add');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState<FormData>(emptyForm());
    const [tempFiles, setTempFiles] = useState<TempFiles>({ mainImage: null, gallery: [], floorPlan: null });
    const [floorPlanLabel, setFloorPlanLabel] = useState('');
    const router = useRouter();

    const mainImageRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const floorPlanRef = useRef<HTMLInputElement>(null);

    const set = useCallback((patch: Partial<FormData>) =>
        setFormData(prev => ({ ...prev, ...patch })), []);

    const filteredProperties = initialProperties.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const closeModal = () => setIsModalOpen(false);

    const openAddModal = () => {
        setModalMode('add');
        setEditingProperty(null);
        setCurrentStep(1);
        setFormData(emptyForm());
        setTempFiles({ mainImage: null, gallery: [], floorPlan: null });
        setFloorPlanLabel('');
        setIsModalOpen(true);
    };

    const openEditModal = (property: Property) => {
        setModalMode('edit');
        setEditingProperty(property);
        setFormData({
            name: property.name,
            address: property.address,
            price: property.price.toString(),
            currency: property.currency || 'USD',
            status: property.status,
            beds: property.beds.toString(),
            baths: property.baths.toString(),
            sqft: property.sqft.toString(),
            image: property.image,
            tags: property.tags || [],
            featured: property.featured || false,
            description: property.description || '',
            amenities: property.amenities || [],
            images: property.images || [],
            floorPlans: property.floorPlans || [],
        });
        setTempFiles({ mainImage: null, gallery: [], floorPlan: null });
        setFloorPlanLabel('');
        setIsModalOpen(true);
    };

    const toggleAmenity = (amenity: string) =>
        set({ amenities: formData.amenities.includes(amenity) ? formData.amenities.filter(a => a !== amenity) : [...formData.amenities, amenity] });

    const removeGalleryImage = (url: string) =>
        set({ images: formData.images.filter(i => i !== url) });

    const removeFloorPlan = (idx: number) =>
        set({ floorPlans: formData.floorPlans.filter((_, i) => i !== idx) });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'add' && currentStep < 4) {
            setCurrentStep(p => p + 1);
            return;
        }
        setIsSubmitting(true);
        try {
            let mainImageUrl = formData.image;
            let galleryUrls = [...formData.images];
            let floorPlans = [...formData.floorPlans];

            if (tempFiles.mainImage)
                mainImageUrl = await uploadFile(tempFiles.mainImage, 'properties');

            if (tempFiles.gallery.length > 0) {
                const newUrls = await Promise.all(tempFiles.gallery.map(f => uploadFile(f, 'properties')));
                galleryUrls = [...galleryUrls, ...newUrls];
            }

            if (tempFiles.floorPlan && tempFiles.floorPlan.file.size > 0) {
                const fpUrl = await uploadFile(tempFiles.floorPlan.file, 'properties');
                floorPlans = [...floorPlans, { label: tempFiles.floorPlan.label || 'Floor Plan', image: fpUrl }];
            }

            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                beds: parseInt(formData.beds) || 0,
                baths: parseFloat(formData.baths) || 0,
                sqft: parseInt(formData.sqft) || 0,
                image: mainImageUrl,
                images: galleryUrls,
                floorPlans,
            };

            const res = editingProperty
                ? await updateProperty(editingProperty.id, payload)
                : await createProperty(payload);

            if (res.success) {
                closeModal();
                router.refresh();
            } else {
                alert('Error: ' + res.error);
            }
        } catch (err: any) {
            alert('Upload error: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this property?')) return;
        const res = await deleteProperty(id);
        if (res.success) router.refresh();
        else alert('Error: ' + res.error);
    };

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            {/* Header */}
            <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <Eyebrow>Inventory</Eyebrow>
                    <h1 className="mt-3 font-display text-display-md font-bold tracking-tight text-content">Properties</h1>
                    <p className="mt-2 max-w-[42rem] text-body text-content-muted">
                        Everything published to the public listings, plus anything held back.
                    </p>
                </div>
                <Button onClick={openAddModal} size="lg" icon={<IconPlus size={18} />}>Add property</Button>
            </header>

            {/* Stats, counted from the rows themselves.

                The previous version displayed "Occupancy Rate 92%" and
                "Pending Maintenance 5" as fixed strings. Neither has a column
                behind it, and both sat on a page the owner reads as reporting.

                The tone classes are written out in full rather than built from
                a `color` key: Tailwind scans source text, so the old
                `bg-${s.color}-100` never produced a class at all. */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Listings', value: initialProperties.length, tone: 'text-content' },
                    { label: 'For sale', value: initialProperties.filter(p => p.status === 'For Sale').length, tone: 'text-brand-600' },
                    { label: 'Featured', value: initialProperties.filter(p => p.featured).length, tone: 'text-accent-500' },
                    { label: 'Sold', value: initialProperties.filter(p => p.status === 'Sold').length, tone: 'text-content-muted' },
                ].map(stat => (
                    <div key={stat.label} className="rounded-surface border border-hairline/10 bg-surface p-5 shadow-soft">
                        <p className="text-label font-semibold uppercase text-content-muted">{stat.label}</p>
                        <p className={`mt-2 font-display text-display-sm font-bold tracking-tight ${stat.tone}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="flex h-[600px] flex-col overflow-hidden rounded-panel border border-hairline/10 bg-surface shadow-soft">
                <div className="shrink-0 border-b border-hairline/10 p-5">
                    <div className="relative w-full sm:w-80">
                        <label htmlFor="property-search" className="sr-only">Search properties</label>
                        <IconSearch size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" />
                        <input id="property-search" type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name or address"
                            className="h-11 w-full rounded-pill border border-hairline/15 bg-surface-2 pl-11 pr-4 text-body-sm text-content outline-none transition-colors duration-short ease-standard placeholder:text-content-muted/70 focus:border-brand-600" />
                    </div>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-surface-2 backdrop-blur-sm">
                            <tr>
                                {['Image', 'Property', 'Price', 'Status', 'Actions'].map((h, i) => (
                                    <th key={h} scope="col" className={`px-6 py-4 text-label font-semibold uppercase text-content-muted ${i === 4 ? 'text-right' : ''}`}>
                                        {i === 4 ? <span className="sr-only">{h}</span> : h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline/10">
                            {filteredProperties.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-body-sm text-content-muted">{searchQuery ? 'No properties match that search.' : 'No properties yet.'}</td></tr>
                            )}
                            {filteredProperties.map(p => (
                                <tr key={p.id} className="group transition-colors hover:bg-surface-2/60">
                                    <td className="px-6 py-4">
                                        <div className="h-16 w-24 overflow-hidden rounded-control bg-surface-2">
                                            <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-body-sm font-semibold text-content">{p.name}</p>
                                        <p className="mt-0.5 max-w-[220px] truncate text-[0.8125rem] text-content-muted">{p.address}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-body-sm font-semibold text-content">
                                        {p.currency === 'NGN' ? '₦' : '$'}{p.price.toLocaleString('en-NG')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-pill border px-3 py-1.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.1em] ${p.status.toLowerCase().includes('sale') ? 'border-brand-600/25 bg-brand-600/10 text-brand-600' : p.status.toLowerCase().includes('rent') ? 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-hairline/15 bg-surface-2 text-content-muted'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button type="button" onClick={() => openEditModal(p)} aria-label={`Edit ${p.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors duration-short ease-standard hover:bg-brand-600/10 hover:text-brand-600">
                                                <IconEdit size={18} />
                                            </button>
                                            <button type="button" onClick={() => handleDelete(p.id)} aria-label={`Delete ${p.name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors duration-short ease-standard hover:bg-red-500/10 hover:text-red-600">
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── MODALS (inlined to prevent remount scroll bug) ───────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

                    {/* ── EDIT MODAL: flat single-page ─────────────────────────────── */}
                    {modalMode === 'edit' && (
                        <div role="dialog" aria-modal="true" aria-label={`Edit ${editingProperty?.name ?? 'property'}`}
                            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-panel border border-hairline/10 bg-surface shadow-elevated">
                            <div className="flex shrink-0 items-center justify-between border-b border-hairline/10 px-6 py-5">
                                <div className="min-w-0">
                                    <Eyebrow>Quick edit</Eyebrow>
                                    <h2 className="mt-1.5 max-w-[360px] truncate font-display text-display-sm font-bold tracking-tight text-content">{editingProperty?.name}</h2>
                                </div>
                                <button type="button" onClick={closeModal} aria-label="Close"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-content-muted transition-colors hover:bg-content/10">
                                    <IconClose size={22} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-6 space-y-5">
                                {/* Name */}
                                <div>
                                    <label className={LABEL}>Property Title</label>
                                    <input type="text" required value={formData.name} onChange={e => set({ name: e.target.value })} className={FIELD} placeholder="e.g. The Zenith Heights" />
                                </div>

                                {/* Status + Featured */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={LABEL}>Status</label>
                                        <select value={formData.status} onChange={e => set({ status: e.target.value as Property['status'] })} className={FIELD}>
                                            <option>For Sale</option><option>For Rent</option><option>Coming Soon</option><option>Sold</option><option>Maintenance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={LABEL}>Featured on Homepage</label>
                                        <div className="flex items-center gap-3 mt-3">
                                            <Toggle value={formData.featured} onChange={() => set({ featured: !formData.featured })} label="Feature this property on the home page" />
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{formData.featured ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className={LABEL}>Address</label>
                                    <input type="text" value={formData.address} onChange={e => set({ address: e.target.value })} className={FIELD} placeholder="Street, City, Area" />
                                </div>

                                {/* Price + Currency */}
                                <div>
                                    <label className={LABEL}>Price ({formData.currency === 'NGN' ? '₦ NGN' : '$ USD'})</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={formData.price} onChange={e => set({ price: e.target.value })} className={`${FIELD} flex-1`} placeholder="0.00" />
                                        <CurrencyToggle value={formData.currency} onChange={cur => set({ currency: cur })} />
                                    </div>
                                </div>

                                {/* Beds / Baths / Sqft */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className={LABEL}>Bedrooms</label><input type="number" value={formData.beds} onChange={e => set({ beds: e.target.value })} className={FIELD} placeholder="0" /></div>
                                    <div><label className={LABEL}>Bathrooms</label><input type="number" step="0.5" value={formData.baths} onChange={e => set({ baths: e.target.value })} className={FIELD} placeholder="0" /></div>
                                    <div><label className={LABEL}>Sq Ft</label><input type="number" value={formData.sqft} onChange={e => set({ sqft: e.target.value })} className={FIELD} placeholder="0" /></div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={LABEL}>Description</label>
                                    <textarea rows={3} value={formData.description} onChange={e => set({ description: e.target.value })} className={`${FIELD} resize-none`} placeholder="Describe the property..." />
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className={LABEL}>Amenities</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {AMENITY_OPTIONS.map(a => (
                                            <button key={a} type="button" onClick={() => toggleAmenity(a)}
                                                aria-pressed={formData.amenities.includes(a)}
                                                className={`flex items-center gap-2 rounded-control border px-3 py-2 text-left text-[0.8125rem] font-medium transition-colors duration-short ease-standard ${formData.amenities.includes(a) ? 'border-brand-600 bg-brand-600/5 text-brand-600' : 'border-hairline/15 text-content-muted hover:text-content'}`}>
                                                {formData.amenities.includes(a) ? <IconCheck size={15} /> : <span className="h-[15px] w-[15px] rounded-pill border border-current" />}{a}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Main image */}
                                <div>
                                    <label className={LABEL}>Main Cover Image</label>
                                    <ImageZone
                                        preview={tempFiles.mainImage ? URL.createObjectURL(tempFiles.mainImage) : formData.image || null}
                                        onClick={() => mainImageRef.current?.click()}
                                        label="Click to upload cover image" />
                                    <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={e => setTempFiles(t => ({ ...t, mainImage: e.target.files?.[0] || null }))} />
                                </div>

                                {/* Gallery */}
                                <div>
                                    <label className={LABEL}>Gallery Images</label>
                                    {/* Existing images */}
                                    {formData.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {formData.images.map((url, i) => (
                                                <div key={url} className="group relative h-16 w-20 overflow-hidden rounded-control">
                                                    <img src={url} className="h-full w-full object-cover" alt="" />
                                                    <button type="button" onClick={() => removeGalleryImage(url)} aria-label={`Remove gallery image ${i + 1}`}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity duration-short ease-standard hover:opacity-100 focus-visible:opacity-100">
                                                        <IconTrash size={17} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* New images to add */}
                                    <div onClick={() => galleryRef.current?.click()}
                                        className="cursor-pointer rounded-control border-2 border-dashed border-hairline/15 bg-surface-2 p-4 text-center transition-colors duration-short ease-standard hover:border-brand-600">
                                        <IconImage size={22} className="mx-auto text-content-muted" />
                                        <p className="mt-1.5 text-body-sm font-medium text-content-muted">
                                            {tempFiles.gallery.length > 0 ? `${tempFiles.gallery.length} new image(s) selected — click to change` : 'Click to add gallery images'}
                                        </p>
                                        <input type="file" hidden multiple ref={galleryRef} accept="image/*" onChange={e => setTempFiles(t => ({ ...t, gallery: Array.from(e.target.files || []) }))} />
                                    </div>
                                    {tempFiles.gallery.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tempFiles.gallery.map((f, i) => (
                                                <div key={i} className="h-12 w-16 overflow-hidden rounded-control">
                                                    <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Floor Plans */}
                                <div>
                                    <label className={LABEL}>Floor Plans</label>
                                    {formData.floorPlans.length > 0 && (
                                        <div className="space-y-2 mb-3">
                                            {formData.floorPlans.map((fp, i) => (
                                                <div key={`${fp.label}-${i}`} className="flex items-center gap-3 rounded-control border border-hairline/15 bg-surface-2 p-2">
                                                    <img src={fp.image} alt="" className="h-10 w-14 rounded-control object-cover" />
                                                    <span className="flex-1 truncate text-body-sm font-medium text-content">{fp.label}</span>
                                                    <button type="button" onClick={() => removeFloorPlan(i)} aria-label={`Remove floor plan ${fp.label}`}
                                                        className="flex h-9 w-9 items-center justify-center rounded-pill text-content-muted transition-colors hover:bg-red-500/10 hover:text-red-600">
                                                        <IconTrash size={17} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <input type="text" placeholder='Level label (e.g. "Ground Floor")' value={floorPlanLabel}
                                            onChange={e => setFloorPlanLabel(e.target.value)}
                                            className={`${FIELD} flex-1`} />
                                        <button type="button" onClick={() => floorPlanRef.current?.click()}
                                            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-control border border-hairline/15 bg-surface-2 px-4 text-body-sm font-semibold text-content transition-colors duration-short ease-standard hover:border-brand-600">
                                            <IconImage size={17} />
                                            {tempFiles.floorPlan?.file?.size ? 'File selected' : 'Choose file'}
                                        </button>
                                        <input type="file" hidden ref={floorPlanRef} accept="image/*"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) setTempFiles(t => ({ ...t, floorPlan: { label: floorPlanLabel || 'Floor Plan', file: f } }));
                                            }} />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 border-t border-hairline/10 pt-5">
                                    <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving…' : 'Save changes'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── ADD MODAL: multi-step wizard ──────────────────────────────── */}
                    {modalMode === 'add' && (
                        <div role="dialog" aria-modal="true" aria-label="Add a property"
                            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-panel border border-hairline/10 bg-surface shadow-elevated">
                            <div className="flex shrink-0 items-center justify-between border-b border-hairline/10 px-6 py-5">
                                <div>
                                    <Eyebrow>
                                        Step {currentStep} of 4 · {['', 'Essentials', 'Specifications', 'Amenities', 'Media'][currentStep]}
                                    </Eyebrow>
                                    <h2 className="mt-1.5 font-display text-display-sm font-bold tracking-tight text-content">Add a property</h2>
                                </div>
                                <button type="button" onClick={closeModal} aria-label="Close"
                                    className="flex h-10 w-10 items-center justify-center rounded-pill text-content-muted transition-colors hover:bg-content/10">
                                    <IconClose size={22} />
                                </button>
                            </div>

                            <div className="px-8 py-8 overflow-y-auto flex-1">
                                {/* Progress dots */}
                                <div className="mb-8 flex items-center justify-between relative px-2">
                                    <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-hairline/10" />
                                    {[1, 2, 3, 4].map(step => (
                                        <div key={step} aria-current={currentStep === step ? 'step' : undefined}
                                            className={`flex h-8 w-8 items-center justify-center rounded-pill text-[0.75rem] font-bold transition-all duration-short ease-standard ${currentStep >= step ? 'bg-brand-600 text-white shadow-cta' : 'bg-surface-2 text-content-muted'}`}>{step}</div>
                                    ))}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Step 1 */}
                                    {currentStep === 1 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                                            <div className="sm:col-span-2">
                                                <label className={LABEL}>Property Title</label>
                                                <input type="text" required value={formData.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. The Zenith Heights" className={FIELD} />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className={LABEL}>Full Address</label>
                                                <input type="text" required value={formData.address} onChange={e => set({ address: e.target.value })} placeholder="Street, City, Area" className={FIELD} />
                                            </div>
                                            <div>
                                                <label className={LABEL}>Price ({formData.currency === 'NGN' ? '₦ NGN' : '$ USD'})</label>
                                                <div className="flex gap-2">
                                                    <input type="number" required value={formData.price} onChange={e => set({ price: e.target.value })} placeholder="0.00" className={`${FIELD} flex-1`} />
                                                    <CurrencyToggle value={formData.currency} onChange={cur => set({ currency: cur })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={LABEL}>Listing Status</label>
                                                <select value={formData.status} onChange={e => set({ status: e.target.value as Property['status'] })} className={FIELD}>
                                                    <option>For Sale</option><option>For Rent</option><option>Coming Soon</option><option>Sold</option><option>Maintenance</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={LABEL}>Featured on Homepage</label>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <Toggle value={formData.featured} onChange={() => set({ featured: !formData.featured })} label="Feature this property on the home page" />
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{formData.featured ? 'Yes' : 'No'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2 */}
                                    {currentStep === 2 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in duration-300">
                                            <div><label className={LABEL}>Bedrooms</label><input type="number" required value={formData.beds} onChange={e => set({ beds: e.target.value })} placeholder="0" className={FIELD} /></div>
                                            <div><label className={LABEL}>Bathrooms</label><input type="number" step="0.5" required value={formData.baths} onChange={e => set({ baths: e.target.value })} placeholder="0" className={FIELD} /></div>
                                            <div><label className={LABEL}>Sq Ft</label><input type="number" required value={formData.sqft} onChange={e => set({ sqft: e.target.value })} placeholder="0" className={FIELD} /></div>
                                            <div className="sm:col-span-3">
                                                <label className={LABEL}>Property Description</label>
                                                <textarea required rows={6} value={formData.description} onChange={e => set({ description: e.target.value })} placeholder="Describe the property..." className={`${FIELD} resize-none`} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3 */}
                                    {currentStep === 3 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
                                            {AMENITY_OPTIONS.map(a => (
                                                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                                                    aria-pressed={formData.amenities.includes(a)}
                                                    className={`flex items-center gap-3 rounded-control border-2 p-4 text-left transition-colors duration-short ease-standard ${formData.amenities.includes(a) ? 'border-brand-600 bg-brand-600/5 text-brand-600' : 'border-hairline/10 text-content-muted hover:border-hairline/20'}`}>
                                                    {formData.amenities.includes(a) ? <IconCheck size={18} /> : <span className="h-[18px] w-[18px] shrink-0 rounded-pill border border-current" />}
                                                    <span className="text-body-sm font-medium">{a}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Step 4 */}
                                    {currentStep === 4 && (
                                        <div className="space-y-6 animate-in fade-in duration-300">
                                            <div>
                                                <label className={LABEL}>Main Cover Image</label>
                                                <ImageZone
                                                    preview={tempFiles.mainImage ? URL.createObjectURL(tempFiles.mainImage) : null}
                                                    onClick={() => mainImageRef.current?.click()}
                                                    label="Click to upload cover image (PNG, JPG, WEBP)" />
                                                <input type="file" hidden ref={mainImageRef} accept="image/*" onChange={e => setTempFiles(t => ({ ...t, mainImage: e.target.files?.[0] || null }))} />
                                            </div>
                                            <div>
                                                <label className={LABEL}>Gallery Images (Multiple)</label>
                                                <div onClick={() => galleryRef.current?.click()}
                                                    className="cursor-pointer rounded-control border-2 border-dashed border-hairline/15 bg-surface-2 p-6 text-center transition-colors duration-short ease-standard hover:border-brand-600">
                                                    <IconImage size={26} className="mx-auto text-content-muted" />
                                                    <p className="mt-1.5 text-body-sm font-medium text-content-muted">
                                                        {tempFiles.gallery.length > 0 ? `${tempFiles.gallery.length} image(s) selected` : 'Select multiple images'}
                                                    </p>
                                                    <input type="file" hidden multiple ref={galleryRef} accept="image/*" onChange={e => setTempFiles(t => ({ ...t, gallery: Array.from(e.target.files || []) }))} />
                                                </div>
                                                {tempFiles.gallery.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {tempFiles.gallery.map((f, i) => (
                                                            <div key={i} className="h-14 w-14 overflow-hidden rounded-control">
                                                                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className={LABEL}>Floor Plan</label>
                                                <div className="flex gap-3">
                                                    <input type="text" placeholder='Level (e.g. "Ground Floor")' value={floorPlanLabel}
                                                        onChange={e => setFloorPlanLabel(e.target.value)} className={`${FIELD} flex-1`} />
                                                    <button type="button" onClick={() => floorPlanRef.current?.click()}
                                                        className="flex shrink-0 items-center gap-2 rounded-control border border-hairline/15 bg-surface-2 px-4 text-body-sm font-semibold text-content transition-colors duration-short ease-standard hover:border-brand-600">
                                                        <IconImage size={17} />
                                                        {tempFiles.floorPlan?.file?.size ? 'Selected' : 'Choose'}
                                                    </button>
                                                    <input type="file" hidden ref={floorPlanRef} accept="image/*"
                                                        onChange={e => {
                                                            const f = e.target.files?.[0];
                                                            if (f) setTempFiles(t => ({ ...t, floorPlan: { label: floorPlanLabel || 'Floor Plan', file: f } }));
                                                        }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Nav */}
                                    <div className="mt-10 flex justify-between gap-3 border-t border-hairline/10 pt-6">
                                        <Button type="button" variant="outline" disabled={currentStep === 1}
                                            onClick={() => setCurrentStep(p => p - 1)} icon={<IconChevronLeft size={17} />}>
                                            Back
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}
                                            icon={currentStep === 4 || isSubmitting ? undefined : <IconArrowRight size={17} />} iconPosition="end">
                                            {isSubmitting ? 'Saving…' : currentStep === 4 ? 'Publish' : 'Continue'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
