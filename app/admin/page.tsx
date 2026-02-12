'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import { SafeChart } from '@/components/shared/SafeChart';

const data = [
    { name: 'Mon', organic: 12, paid: 8 },
    { name: 'Tue', organic: 19, paid: 12 },
    { name: 'Wed', organic: 15, paid: 10 },
    { name: 'Thu', organic: 25, paid: 18 },
    { name: 'Fri', organic: 22, paid: 16 },
    { name: 'Sat', organic: 30, paid: 22 },
    { name: 'Sun', organic: 28, paid: 20 },
];

export default function AdminDashboard() {
    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Welcome back, Leke! 👋</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Here's what's happening with your properties this week.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-icons-outlined text-base">file_download</span> Export
                    </button>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex items-center gap-2">
                        <span className="material-icons-outlined text-base">add</span> New Listing
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Total New Leads', value: '1,248', change: '+12.5%', icon: 'person_add', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { title: 'Active Listings', value: '42', change: '+5.2%', icon: 'home', color: 'text-primary', bg: 'bg-primary/10' },
                    { title: 'Blog Views', value: '8,540', change: '-2.4%', icon: 'visibility', color: 'text-secondary', bg: 'bg-secondary/10', isDown: true },
                    { title: 'Sales Volume', value: '$2.4M', change: '+8.1%', icon: 'payments', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <span className={`material-icons-outlined ${stat.color}`}>{stat.icon}</span>
                            </div>
                            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.isDown ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-green-600 bg-green-50 dark:bg-green-900/30'}`}>
                                <span className="material-icons-outlined text-sm mr-1">{stat.isDown ? 'trending_down' : 'trending_up'}</span> {stat.change}
                            </span>
                        </div>
                        <h4 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h4>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Lead Generation Overview</h3>
                        <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-lg focus:ring-primary dark:text-gray-300 py-1.5 px-3 outline-none">
                            <option>This Week</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full h-[300px] min-h-[300px]">
                        <SafeChart>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Line type="monotone" dataKey="paid" name="Paid Leads" stroke="#d9a527" strokeWidth={3} strokeDasharray="5 5" dot={false} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </SafeChart>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-[400px] lg:h-auto">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
                            {[
                                { icon: 'email', color: 'blue', title: 'New inquiry received', desc: 'John Doe asked about Sunnyvale Villa.', time: '2 mins ago' },
                                { icon: 'check_circle', color: 'green', title: 'Listing approved', desc: '"The Grand Loft" is now public.', time: '2 hours ago' },
                                { icon: 'edit', color: 'secondary', title: 'Blog post updated', desc: '"Invest Smart" draft saved by Admin.', time: '4 hours ago' },
                                { icon: 'person', color: 'purple', title: 'New Agent added', desc: 'Sarah Smith joined the team.', time: 'Yesterday' }
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className={`absolute -left-[31px] bg-${item.color}-100 dark:bg-${item.color}-900/30 p-1.5 rounded-full border-4 border-surface-light dark:border-surface-dark`}>
                                        <span className={`material-icons-outlined text-[14px] text-${item.color}-600 dark:text-${item.color}-400`}>{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0 text-center">
                        <button className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">View All Activity</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
