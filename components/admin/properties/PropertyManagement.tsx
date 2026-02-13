'use client';

import React, { useState, useRef } from 'react';
import { createProperty, updateProperty, deleteProperty } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Property } from '@/types';
import { uploadFile } from '@/lib/storage';

const AMENITY_OPTIONS = [
    'Smart Home', '24/7 Security', 'Private Gym', 'Infinity Pool',
    'Chef\'s Kitchen', 'Fibre Internet', 'Home Office', 'Garden',
    'Garage', 'Wine Cellar', 'Elevator', 'Cinema Room'
];

export default function PropertyManagement({ initialProperties }: { initialProperties: Property[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        price: '',
        status: 'For Sale' as Property['status'],
        beds: '',
        baths: '',
        sqft: '',
        image: '',
        tags: [] as string[],
        featured: false,
        description: '',
        amenities: [] as string[],
        images: [] as string[],
        floorPlans: [] as { label: string; image: string }[]
    });

    // Refs for file inputs
    const mainImageRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const floorPlanRef = useRef<HTMLInputElement>(null);

    const [tempFiles, setTempFiles] = useState<{
        mainImage: File | null;
        gallery: File[];
        floorPlan: { label: string; file: File } | null;
    }>({
        mainImage: null,
        gallery: [],
        floorPlan: null
    });

    const openAddModal = () => {
        setEditingProperty(null);
        setCurrentStep(1);
        setFormData({
            name: '',
            address: '',
            price: '',
            status: 'For Sale',
            beds: '',
            baths: '',
            sqft: '',
            image: '',
            tags: [],
            featured: false,
            description: '',
            amenities: [],
            images: [],
            floorPlans: []
        });
        setTempFiles({ mainImage: null, gallery: [], floorPlan: null });
        setIsModalOpen(true);
    };

    const openEditModal = (property: Property) => {
        setEditingProperty(property);
        setCurrentStep(1);
        setFormData({
            name: property.name,
            address: property.address,
            price: property.price.toString(),
            status: property.status,
            beds: property.beds.toString(),
            baths: property.baths.toString(),
            sqft: property.sqft.toString(),
            image: property.image,
            tags: property.tags,
            featured: property.featured || false,
            description: property.description || '',
            amenities: property.amenities || [],
            images: property.images || [],
            floorPlans: property.floorPlans || []
        });
        setTempFiles({ mainImage: null, gallery: [], floorPlan: null });
        setIsModalOpen(true);
    };

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < 4) {
            handleNext();
            return;
        }

        setIsSubmitting(true);

        try {
            let mainImageUrl = formData.image;
            let galleryUrls = [...formData.images];
            let floorPlans = [...formData.floorPlans];

            // 1. Upload Main Image if new one selected
            if (tempFiles.mainImage) {
                mainImageUrl = await uploadFile(tempFiles.mainImage, 'properties');
            }

            // 2. Upload Gallery Images
            if (tempFiles.gallery.length > 0) {
                const newUrls = await Promise.all(
                    tempFiles.gallery.map(file => uploadFile(file, 'properties'))
                );
                galleryUrls = [...galleryUrls, ...newUrls];
            }

            // 3. Upload Floor Plan
            if (tempFiles.floorPlan) {
                const floorPlanUrl = await uploadFile(tempFiles.floorPlan.file, 'properties');
                floorPlans = [...floorPlans, { label: tempFiles.floorPlan.label, image: floorPlanUrl }];
            }

            const data = {
                ...formData,
                price: parseFloat(formData.price),
                beds: parseInt(formData.beds),
                baths: parseFloat(formData.baths),
                sqft: parseInt(formData.sqft),
                image: mainImageUrl, // Ensure this is set
                images: galleryUrls,
                floorPlans: floorPlans
            };

            let res;
            if (editingProperty) {
                res = await updateProperty(editingProperty.id, data);
            } else {
                res = await createProperty(data);
            }

            if (res.success) {
                setIsModalOpen(false);
                router.refresh();
            } else {
                alert('Error saving property: ' + res.error);
            }
        } catch (error: any) {
            alert('Error uploading files: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this property?')) {
            const res = await deleteProperty(id);
            if (res.success) {
                router.refresh();
            } else {
                alert('Error deleting property: ' + res.error);
            }
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Property Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Invest Smart. Live Better. Manage Efficiently.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-xl shadow-lg shadow-secondary/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 font-bold"
                >
                    <span className="material-icons-outlined">add_business</span>
                    Add New Property
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Properties', value: initialProperties.length.toString(), icon: 'home_work', color: 'primary' },
                    { label: 'Occupancy Rate', value: '92%', icon: 'pie_chart', color: 'blue' },
                    { label: 'Pending Maintenance', value: '5', icon: 'engineering', color: 'secondary' }
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

            {/* Table Container */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[600px]">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div className="relative w-full sm:w-72">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-icons-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Search properties..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary dark:text-white outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Image</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Property Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {initialProperties.map((property) => (
                                <tr key={property.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-16 w-24 rounded-lg overflow-hidden relative shadow-sm">
                                            <img src={property.image} alt={property.name} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{property.name}</span>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]">{property.address}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-gray-900 dark:text-gray-200 font-bold">${property.price.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${property.status.toLowerCase().includes('sale') ? 'bg-primary/10 text-primary border border-primary/20' :
                                                property.status.toLowerCase().includes('rent') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(property)}
                                                className="text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5"
                                            >
                                                <span className="material-icons-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(property.id)}
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

                        {/* Modal Header */}
                        <div className="bg-primary px-6 py-5 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1 block">
                                    Step {currentStep} of 4: {
                                        currentStep === 1 ? 'Essentials' :
                                            currentStep === 2 ? 'Specifications' :
                                                currentStep === 3 ? 'Amenities' : 'Media & Gallery'
                                    }
                                </span>
                                <h3 className="text-xl font-display font-bold text-white leading-none">
                                    {editingProperty ? 'Edit Property' : 'Add New Property'}
                                </h3>
                            </div>
                            <button className="text-white/70 hover:text-white transition-colors p-1" onClick={() => setIsModalOpen(false)}>
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-8 py-8 overflow-y-auto flex-1">
                            {/* Step Progress Bar */}
                            <div className="mb-8 flex items-center justify-between relative px-2">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10 -translate-y-1/2"></div>
                                {[1, 2, 3, 4].map(step => (
                                    <div
                                        key={step}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all
                                            ${currentStep >= step ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                                    >
                                        {step}
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Step 1: Essentials */}
                                {currentStep === 1 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Property Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. The Zenith Heights"
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Full Address</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Street, City, Area"
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0.00"
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Listing Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Property['status'] })}
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all cursor-pointer"
                                            >
                                                <option>For Sale</option>
                                                <option>For Rent</option>
                                                <option>Coming Soon</option>
                                                <option>Sold</option>
                                                <option>Maintenance</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Featured</label>
                                            <div className="flex items-center mt-3">
                                                <input
                                                    type="checkbox"
                                                    id="featured"
                                                    checked={formData.featured}
                                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                                />
                                                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Show on Home Page</label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Specifications */}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.beds}
                                                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                                placeholder="0"
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Bathrooms</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                required
                                                value={formData.baths}
                                                onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                                                placeholder="0"
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Square Feet</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.sqft}
                                                onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                                                placeholder="0"
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                            />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Property Description</label>
                                            <textarea
                                                required
                                                rows={6}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Describe the property's unique features, location, and appeal..."
                                                className="block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Amenities */}
                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {AMENITY_OPTIONS.map(amenity => (
                                                <button
                                                    key={amenity}
                                                    type="button"
                                                    onClick={() => handleAmenityToggle(amenity)}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3
                                                        ${formData.amenities.includes(amenity)
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'
                                                        }`}
                                                >
                                                    <span className="material-icons-outlined text-xl">
                                                        {formData.amenities.includes(amenity) ? 'check_circle' : 'circle'}
                                                    </span>
                                                    <span className="text-sm font-bold">{amenity}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Media */}
                                {currentStep === 4 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

                                        {/* Main Image */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">Main Cover Image</label>
                                            <div
                                                onClick={() => mainImageRef.current?.click()}
                                                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50"
                                            >
                                                {tempFiles.mainImage || formData.image ? (
                                                    <div className="flex items-center justify-center gap-4">
                                                        <img
                                                            src={tempFiles.mainImage ? URL.createObjectURL(tempFiles.mainImage) : formData.image}
                                                            className="h-20 w-32 object-cover rounded-lg shadow-md"
                                                            alt="Preview"
                                                        />
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Main Image Selected</p>
                                                            <p className="text-xs text-primary font-bold mt-1">Click to replace</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="material-icons-outlined text-4xl text-gray-400 mb-2">add_a_photo</span>
                                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Click to upload main cover image</p>
                                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    hidden
                                                    ref={mainImageRef}
                                                    accept="image/*"
                                                    onChange={(e) => setTempFiles({ ...tempFiles, mainImage: e.target.files?.[0] || null })}
                                                />
                                            </div>
                                        </div>

                                        {/* Gallery */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">Property Gallery (Multiple)</label>
                                            <div
                                                onClick={() => galleryRef.current?.click()}
                                                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer"
                                            >
                                                <span className="material-icons-outlined text-3xl text-gray-400 mb-2">collections</span>
                                                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Select Gallery Images</p>
                                                <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    ref={galleryRef}
                                                    accept="image/*"
                                                    onChange={(e) => setTempFiles({ ...tempFiles, gallery: Array.from(e.target.files || []) })}
                                                />
                                            </div>
                                            {tempFiles.gallery.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {tempFiles.gallery.map((file, i) => (
                                                        <div key={i} className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden">
                                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Gallery preview" />
                                                        </div>
                                                    ))}
                                                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        +{tempFiles.gallery.length}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Floor Plan */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">Floor Plan</label>
                                            <div className="flex gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Level (e.g. Ground Floor)"
                                                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-4 py-2"
                                                    onChange={(e) => setTempFiles({
                                                        ...tempFiles,
                                                        floorPlan: tempFiles.floorPlan ? { ...tempFiles.floorPlan, label: e.target.value } : { label: e.target.value, file: new File([], '') }
                                                    })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => floorPlanRef.current?.click()}
                                                    className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                                                >
                                                    <span className="material-icons-outlined text-base">upload_file</span>
                                                    {tempFiles.floorPlan?.file.name ? 'File Selected' : 'Select Image'}
                                                </button>
                                                <input
                                                    type="file"
                                                    hidden
                                                    ref={floorPlanRef}
                                                    accept="image/*"
                                                    onChange={(e) => setTempFiles({
                                                        ...tempFiles,
                                                        floorPlan: { label: tempFiles.floorPlan?.label || 'Floor Plan', file: e.target.files?.[0]! }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Form Footer */}
                                <div className="flex justify-between gap-3 mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        disabled={currentStep === 1}
                                        className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 flex items-center gap-2"
                                        onClick={handlePrev}
                                    >
                                        <span className="material-icons-outlined text-base">arrow_back</span>
                                        Back
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                                Saving...
                                            </>
                                        ) : currentStep === 4 ? (
                                            <>
                                                <span className="material-icons-outlined text-base">publish</span>
                                                {editingProperty ? 'Update Property' : 'Publish Property'}
                                            </>
                                        ) : (
                                            <>
                                                Continue
                                                <span className="material-icons-outlined text-base">arrow_forward</span>
                                            </>
                                        )}
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
