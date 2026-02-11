'use client';

import React, { useState } from 'react';
import { MOCK_PROPERTIES } from '@/constants';

export default function AdminProperties() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Property Management</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Invest Smart. Live Better. Manage Efficiently.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-xl shadow-lg shadow-secondary/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 font-bold"
                >
                    <span className="material-icons-outlined">add_business</span>
                    Add New Property
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Properties', value: '124', icon: 'home_work', color: 'primary' },
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
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-bold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-icons-outlined text-lg">filter_list</span> Filter
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-bold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-icons-outlined text-lg">sort</span> Sort
                        </button>
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
                            {MOCK_PROPERTIES.map((property) => (
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
                      ${property.status === 'For Sale' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                property.status === 'For Rent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
                                            {property.status}
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

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Showing {MOCK_PROPERTIES.length} entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 disabled:opacity-50 transition-colors">Prev</button>
                        <button className="px-3 py-1 text-sm font-bold bg-primary text-white rounded-lg shadow-sm">1</button>
                        <button className="px-3 py-1 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 transition-colors">2</button>
                        <button className="px-3 py-1 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Add Property Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark text-left shadow-2xl transition-all w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
                        <div className="bg-primary px-6 py-5 flex justify-between items-center shrink-0">
                            <div>
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1 block">New Listing</span>
                                <h3 className="text-xl font-display font-bold text-white leading-none">Add Property Details</h3>
                            </div>
                            <button className="text-white/70 hover:text-white transition-colors p-1" onClick={() => setIsModalOpen(false)}>
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="px-6 py-6 overflow-y-auto flex-1">
                            <form className="space-y-6">
                                <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-10 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group bg-gray-50/50 dark:bg-gray-800/30">
                                    <div className="text-center">
                                        <span className="material-icons-outlined mx-auto text-4xl text-gray-400 group-hover:text-primary transition-colors">cloud_upload</span>
                                        <div className="mt-4 flex text-sm text-gray-600 dark:text-gray-400 justify-center font-bold">
                                            <span className="text-primary hover:underline">Upload high-res images</span>
                                            <p className="pl-1 font-medium">or drag and drop</p>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Property Title</label>
                                        <input type="text" placeholder="e.g. The Zenith Heights" className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Full Address</label>
                                        <input type="text" placeholder="Street, City, Area" className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                                        <input type="number" placeholder="0.00" className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Listing Status</label>
                                        <select className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all cursor-pointer">
                                            <option>For Sale</option>
                                            <option>For Rent</option>
                                            <option>Coming Soon</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Bedrooms</label>
                                        <input type="number" placeholder="0" className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2">Bathrooms</label>
                                        <input type="number" placeholder="0" className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-primary focus:ring-primary px-4 py-3 font-medium outline-none transition-all" />
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
                                className="px-8 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Publish Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
