'use client';

import React from 'react';
import { MOCK_LEADS } from '@/constants';

export default function AdminLeads() {
    return (
        <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">Leads CRM</h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage and track your website inquiries efficiently.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="inline-flex items-center px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-surface-light dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors">
                        <span className="material-icons-outlined text-lg mr-2">filter_list</span> Filter
                    </button>
                    <button className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
                        <span className="material-icons-outlined text-lg mr-2">add</span> Add Lead
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Leads', value: '1,248', desc: '+12% this week', icon: 'groups', color: 'primary' },
                    { label: 'Uncontacted', value: '42', desc: 'Needs attention', icon: 'phone_missed', color: 'red', alert: true },
                    { label: 'High Interest', value: '186', desc: 'Looking to buy now', icon: 'star', color: 'secondary' },
                    { label: 'Closed Deals', value: '24', desc: '+2 this month', icon: 'verified', color: 'blue' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex items-start justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
                        {stat.alert && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full"></div>}
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="mt-2 text-3xl font-display font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className={`mt-2 text-[10px] font-bold uppercase tracking-widest flex items-center ${stat.alert ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                {stat.alert && <span className="material-icons-outlined text-xs mr-1">priority_high</span>}
                                {stat.desc}
                            </p>
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
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Budget</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date / Time</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                                <th scope="col" className="px-6 py-4 text-center text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {MOCK_LEADS.map((lead) => (
                                <tr key={lead.id} className={`group transition-colors ${lead.status === 'Contacted' ? 'bg-gray-50/50 dark:bg-gray-800/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" src={lead.avatar} alt="" />
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-200 font-mono">{lead.budget}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 dark:text-gray-200">{lead.date}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">{lead.time}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${lead.status === 'New' ? 'bg-primary/10 text-primary border-primary/20' :
                                                lead.status === 'Pending Review' ? 'bg-secondary/10 text-secondary-hover border-secondary/20 dark:text-secondary' :
                                                    lead.status === 'Scheduled Viewing' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                        'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                            }`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button className="text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5">
                                            <span className="material-icons-outlined text-xl">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50/80 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Showing <span className="text-gray-900 dark:text-white">1</span> to <span className="text-gray-900 dark:text-white">{MOCK_LEADS.length}</span> of <span className="text-gray-900 dark:text-white">1,248</span>
                    </p>
                    <div className="flex gap-1">
                        <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-colors disabled:opacity-50"><span className="material-icons-outlined text-sm">chevron_left</span></button>
                        <button className="w-9 h-9 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-sm">1</button>
                        <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-colors"><span className="material-icons-outlined text-sm">chevron_right</span></button>
                    </div>
                </div>
            </div>
        </>
    );
}
