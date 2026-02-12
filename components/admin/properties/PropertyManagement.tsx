'use client';

import React, { useState } from 'react';
import { createProperty, updateProperty, deleteProperty } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface Property {
    id: string;
    name: string;
    address: string;
    price: number;
    priceLabel?: string;
    image: string;
    beds: number;
    baths: number;
    sqft: number;
    status: string;
    tags: string[];
    featured: boolean;
}

export default function PropertyManagement({ initialProperties }: { initialProperties: Property[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        price: '',
        status: 'For Sale',
        beds: '',
        baths: '',
        sqft: '',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        tags: [] as string[],
        featured: false
    });

    const openAddModal = () => {
        setEditingProperty(null);
        setFormData({
            name: '',
            address: '',
            price: '',
            status: 'For Sale',
            beds: '',
            baths: '',
            sqft: '',
            image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
            tags: [],
            featured: false
        });
        setIsModalOpen(true);
    };

    const openEditModal = (property: Property) => {
        setEditingProperty(property);
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
            featured: property.featured
        });
        setIsModalOpen(true);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = {
            ...formData,
            price: parseFloat(formData.price),
            beds: parseInt(formData.beds),
            baths: parseFloat(formData.baths),
            sqft: parseInt(formData.sqft),
        };

        let res;
        if (editingProperty) {
            res = await updateProperty(editingProperty.id, data);
        } else {
            res = await createProperty(data);
        }

        setIsSubmitting(false);
        if (res.success) {
            setIsModalOpen(false);
            router.refresh();
        } else {
            alert('Error saving property: ' + res.error);
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
                {/* Toolbar */}
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

                {/* Table */}
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

                {/* Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Showing {initialProperties.length} entries</span>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark text-left shadow-2xl transition-all w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="bg-primary px-6 py-5 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1 block">{editingProperty ? 'Update Listing' : 'New Listing'}</span>
                                <h3 className="text-xl font-display font-bold text-white leading-none">{editingProperty ? 'Edit Property Details' : 'Add Property Details'}</h3>
                            </div>
                            <button className="text-white/70 hover:text-white transition-colors p-1" onClick={() => setIsModalOpen(false)}>
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Property Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. The Zenith Heights"
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
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
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
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
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Listing Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all cursor-pointer"
                                        >
                                            <option>For Sale</option>
                                            <option>For Rent</option>
                                            <option>Coming Soon</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.beds}
                                            onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                            placeholder="0"
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
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
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
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
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                        />
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
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all"
                                        />
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
                                        {isSubmitting ? 'Saving...' : editingProperty ? 'Update Listing' : 'Publish Listing'}
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
