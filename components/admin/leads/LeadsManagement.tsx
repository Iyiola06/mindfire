'use client';

import React, { useState } from 'react';
import { updateLeadStatus, deleteLead } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    propertyInterest: string;
    propertyDetails?: string;
    budget?: string;
    message?: string;
    status: string;
    createdAt: string;
    contactedAt?: string;
}

export default function LeadsManagement({ initialLeads }: { initialLeads: Lead[] }) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setIsUpdating(id);
        const res = await updateLeadStatus(id, newStatus);
        setIsUpdating(null);
        if (res.success) {
            router.refresh();
        } else {
            alert('Error updating status: ' + res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            const res = await deleteLead(id);
            if (res.success) {
                router.refresh();
            } else {
                alert('Error deleting lead: ' + res.error);
            }
        }
    };

    const stats = [
        { label: 'Total Leads', value: initialLeads.length.toString(), icon: 'groups', color: 'primary' },
        { label: 'Uncontacted', value: initialLeads.filter(l => l.status === 'New').length.toString(), icon: 'phone_missed', color: 'red', alert: initialLeads.some(l => l.status === 'New') },
        { label: 'High Interest', value: initialLeads.filter(l => l.status === 'Scheduled Viewing').length.toString(), icon: 'star', color: 'secondary' },
        { label: 'Closed Deals', value: initialLeads.filter(l => l.status === 'Closed').length.toString(), icon: 'verified', color: 'blue' }
    ];

    return (
        <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Leads CRM</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage and track your website inquiries efficiently.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-start justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
                        {stat.alert && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full"></div>}
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="mt-2 text-3xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            {stat.alert && <p className="mt-2 text-[10px] font-bold uppercase tracking-widest flex items-center text-red-500">
                                <span className="material-icons-outlined text-xs mr-1">priority_high</span> Action required
                            </p>}
                        </div>
                        <div className={`p-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-xl relative z-10`}>
                            <span className={`material-icons-outlined text-2xl text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-[calc(100vh-320px)] min-h-[400px]">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 relative">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Lead Info</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Property Interest</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Budget / Message</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                                <th scope="col" className="px-6 py-4 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {initialLeads.map((lead) => (
                                <tr key={lead.id} className={`group transition-colors ${lead.status === 'Contacted' ? 'bg-gray-50/50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                                                    {lead.name.charAt(0)}
                                                </div>
                                                {lead.status === 'New' && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-surface-dark"></span>}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-bold ${lead.status === 'Contacted' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{lead.name}</div>
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{lead.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-200">{lead.propertyInterest}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{lead.propertyDetails}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-200 font-mono">{lead.budget || 'N/A'}</div>
                                        {lead.message && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">"{lead.message}"</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={lead.status}
                                            disabled={isUpdating === lead.id}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                            className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-3 py-1 bg-transparent outline-none cursor-pointer
                                                ${lead.status === 'New' ? 'text-primary border-primary/20' :
                                                    lead.status === 'Pending Review' ? 'text-secondary-hover border-secondary/20 dark:text-secondary' :
                                                        lead.status === 'Scheduled Viewing' ? 'text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800' :
                                                            'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-700'}`}
                                        >
                                            <option value="New">New</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Pending Review">Pending Review</option>
                                            <option value="Scheduled Viewing">Viewing</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleDelete(lead.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <span className="material-icons-outlined text-xl">delete_outline</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
