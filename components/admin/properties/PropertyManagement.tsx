'use client';

import React, { useState, useRef, useCallback } from 'react';
import { createProperty, updateProperty, deleteProperty } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { uploadFile } from '@/lib/storage';

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

type TempFiles = {
    mainImage: File | null;
    gallery: File[];
    floorPlan: { label: string; file: File } | null;
};

const FIELD = 'block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary px-4 py-3 text-sm font-medium outline-none transition-all';
const LABEL = 'block text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-1.5';

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

    // ── Currency toggle ────────────────────────────────────────────────────────
    const CurrencyToggle = () => (
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 text-sm font-bold">
            {(['USD', 'NGN'] as const).map(cur => (
                <button key={cur} type="button" onClick={() => set({ currency: cur })}
                    className={`px-4 py-3 transition-colors ${formData.currency === cur ? 'bg-primary text-white' : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'} ${cur === 'NGN' ? 'border-l border-gray-200 dark:border-gray-700' : ''}`}>
                    {cur}
                </button>
            ))}
        </div>
    );

    // ── Toggle switch ──────────────────────────────────────────────────────────
    const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
        <button type="button" onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    // ── Image uploader zone ────────────────────────────────────────────────────
    const ImageZone = ({ preview, onClick, label }: { preview?: string | null; onClick: () => void; label: string }) => (
        <div onClick={onClick}
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-5 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50">
            {preview ? (
                <div className="flex items-center gap-4">
                    <img src={preview} className="h-16 w-24 object-cover rounded-lg shadow" alt="preview" />
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Image selected</p>
                        <p className="text-xs text-primary font-bold mt-0.5">Click to replace</p>
                    </div>
                </div>
            ) : (
                <>
                    <span className="material-icons-outlined text-3xl text-gray-400">add_a_photo</span>
                    <p className="text-xs font-bold text-gray-500 mt-1">{label}</p>
                </>
            )}
        </div>
    );

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Property Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Invest Smart. Live Better. Manage Efficiently.</p>
                </div>
                <button onClick={openAddModal} className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-xl shadow-lg shadow-secondary/20 flex items-center gap-2 transition-all hover:-translate-y-0.5 font-bold">
                    <span className="material-icons-outlined">add_business</span>Add New Property
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Properties', value: initialProperties.length.toString(), icon: 'home_work', color: 'primary' },
                    { label: 'Occupancy Rate', value: '92%', icon: 'pie_chart', color: 'blue' },
                    { label: 'Pending Maintenance', value: '5', icon: 'engineering', color: 'secondary' },
                ].map((s, i) => (
                    <div key={i} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{s.label}</p>
                            <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-2">{s.value}</p>
                        </div>
                        <div className={`p-4 bg-${s.color}-100 dark:bg-${s.color}-900/20 rounded-2xl text-${s.color}-600 dark:text-${s.color}-400`}>
                            <span className="material-icons-outlined text-3xl">{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[600px]">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="relative w-full sm:w-72">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-icons-outlined">search</span>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name or address..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary dark:text-white outline-none transition-all" />
                    </div>
                </div>
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 backdrop-blur-sm">
                            <tr>
                                {['Image', 'Property Details', 'Price', 'Status', ''].map((h, i) => (
                                    <th key={i} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredProperties.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">{searchQuery ? 'No properties match your search.' : 'No properties yet.'}</td></tr>
                            )}
                            {filteredProperties.map(p => (
                                <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="h-16 w-24 rounded-lg overflow-hidden shadow-sm">
                                            <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{p.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]">{p.address}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-gray-200">
                                        {p.currency === 'NGN' ? '₦' : '$'}{p.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${p.status.toLowerCase().includes('sale') ? 'bg-primary/10 text-primary border-primary/20' : p.status.toLowerCase().includes('rent') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(p)} className="text-gray-400 hover:text-primary p-2 rounded-lg hover:bg-primary/5 transition-colors" title="Quick Edit">
                                                <span className="material-icons-outlined text-xl">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
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

            {/* ── MODALS (inlined to prevent remount scroll bug) ───────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

                    {/* ── EDIT MODAL: flat single-page ─────────────────────────────── */}
                    {modalMode === 'edit' && (
                        <div className="relative bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
                                <div>
                                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Quick Edit</p>
                                    <h3 className="text-lg font-display font-bold text-white truncate max-w-[360px]">{editingProperty?.name}</h3>
                                </div>
                                <button onClick={closeModal} className="text-white/70 hover:text-white p-1 transition-colors">
                                    <span className="material-icons-outlined">close</span>
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
                                            <Toggle value={formData.featured} onChange={() => set({ featured: !formData.featured })} />
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
                                        <CurrencyToggle />
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
                                                className={`px-3 py-2 rounded-lg border text-xs font-bold text-left flex items-center gap-2 transition-all ${formData.amenities.includes(a) ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                                                <span className="material-icons-outlined text-sm">{formData.amenities.includes(a) ? 'check_circle' : 'radio_button_unchecked'}</span>{a}
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
                                                <div key={i} className="relative group h-16 w-20 rounded-lg overflow-hidden shadow-sm">
                                                    <img src={url} className="w-full h-full object-cover" alt="" />
                                                    <button type="button" onClick={() => removeGalleryImage(url)}
                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <span className="material-icons-outlined text-white text-lg">delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* New images to add */}
                                    <div onClick={() => galleryRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                                        <span className="material-icons-outlined text-2xl text-gray-400">collections</span>
                                        <p className="text-xs font-bold text-gray-500 mt-1">
                                            {tempFiles.gallery.length > 0 ? `${tempFiles.gallery.length} new image(s) selected — click to change` : 'Click to add gallery images'}
                                        </p>
                                        <input type="file" hidden multiple ref={galleryRef} accept="image/*" onChange={e => setTempFiles(t => ({ ...t, gallery: Array.from(e.target.files || []) }))} />
                                    </div>
                                    {tempFiles.gallery.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tempFiles.gallery.map((f, i) => (
                                                <div key={i} className="h-12 w-16 rounded overflow-hidden shadow-sm">
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
                                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                                    <img src={fp.image} alt={fp.label} className="h-10 w-14 object-cover rounded" />
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-1 truncate">{fp.label}</span>
                                                    <button type="button" onClick={() => removeFloorPlan(i)} className="text-red-400 hover:text-red-600">
                                                        <span className="material-icons-outlined text-lg">delete</span>
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
                                            className="bg-gray-100 dark:bg-gray-800 px-4 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                                            <span className="material-icons-outlined text-base">upload_file</span>
                                            {tempFiles.floorPlan?.file?.size ? 'File Selected' : 'Choose File'}
                                        </button>
                                        <input type="file" hidden ref={floorPlanRef} accept="image/*"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) setTempFiles(t => ({ ...t, floorPlan: { label: floorPlanLabel || 'Floor Plan', file: f } }));
                                            }} />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button type="button" onClick={closeModal}
                                        className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="px-8 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50 text-sm flex items-center gap-2 min-w-[130px] justify-center">
                                        {isSubmitting
                                            ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />Saving...</>
                                            : <><span className="material-icons-outlined text-base">save</span>Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ── ADD MODAL: multi-step wizard ──────────────────────────────── */}
                    {modalMode === 'add' && (
                        <div className="relative bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="bg-primary px-6 py-5 flex justify-between items-center shrink-0">
                                <div>
                                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1 block">
                                        Step {currentStep} of 4: {['', 'Essentials', 'Specifications', 'Amenities', 'Media & Gallery'][currentStep]}
                                    </span>
                                    <h3 className="text-xl font-display font-bold text-white leading-none">Add New Property</h3>
                                </div>
                                <button className="text-white/70 hover:text-white p-1" onClick={closeModal}>
                                    <span className="material-icons-outlined">close</span>
                                </button>
                            </div>

                            <div className="px-8 py-8 overflow-y-auto flex-1">
                                {/* Progress dots */}
                                <div className="mb-8 flex items-center justify-between relative px-2">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10 -translate-y-1/2" />
                                    {[1, 2, 3, 4].map(s => (
                                        <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep >= s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{s}</div>
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
                                                    <CurrencyToggle />
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
                                                    <Toggle value={formData.featured} onChange={() => set({ featured: !formData.featured })} />
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
                                                    className={`p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${formData.amenities.includes(a) ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'}`}>
                                                    <span className="material-icons-outlined text-xl">{formData.amenities.includes(a) ? 'check_circle' : 'circle'}</span>
                                                    <span className="text-sm font-bold">{a}</span>
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
                                                    className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                                                    <span className="material-icons-outlined text-3xl text-gray-400">collections</span>
                                                    <p className="text-sm font-bold text-gray-500 mt-1">
                                                        {tempFiles.gallery.length > 0 ? `${tempFiles.gallery.length} image(s) selected` : 'Select multiple images'}
                                                    </p>
                                                    <input type="file" hidden multiple ref={galleryRef} accept="image/*" onChange={e => setTempFiles(t => ({ ...t, gallery: Array.from(e.target.files || []) }))} />
                                                </div>
                                                {tempFiles.gallery.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {tempFiles.gallery.map((f, i) => (
                                                            <div key={i} className="h-14 w-14 rounded-lg overflow-hidden shadow-sm">
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
                                                        className="bg-gray-100 dark:bg-gray-800 px-4 rounded-lg text-sm font-bold flex items-center gap-2 shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                                        <span className="material-icons-outlined text-base">upload_file</span>
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
                                    <div className="flex justify-between gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <button type="button" disabled={currentStep === 1} onClick={() => setCurrentStep(p => p - 1)}
                                            className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 flex items-center gap-2 text-sm">
                                            <span className="material-icons-outlined text-base">arrow_back</span>Back
                                        </button>
                                        <button type="submit" disabled={isSubmitting}
                                            className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center text-sm">
                                            {isSubmitting
                                                ? <><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />Saving...</>
                                                : currentStep === 4
                                                    ? <><span className="material-icons-outlined text-base">publish</span>Publish</>
                                                    : <>Continue<span className="material-icons-outlined text-base">arrow_forward</span></>}
                                        </button>
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
