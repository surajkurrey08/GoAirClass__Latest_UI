import React from 'react';
import { Database, Power, Edit2, Plus } from 'lucide-react';

const ApiCard = ({ name, provider, environment, status, lastSync }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h3>
                    <p className="text-sm text-slate-500">{provider}</p>
                </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${environment === 'Live' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {environment}
            </div>
        </div>

        <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">API Status</span>
                <span className={`font-bold ${status ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {status ? 'Connected' : 'Disconnected'}
                </span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Last Sync</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{lastSync}</span>
            </div>
        </div>

        <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                <Edit2 size={14} /> Configure
            </button>
            <button className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all ${status ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                <Power size={18} />
            </button>
        </div>
    </div>
);

export default function ApiConfig() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">API Configuration</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage flight data providers and GDS integrations.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={18} /> Add New API
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ApiCard name="Amadeus GDS" provider="Travel Distribution" environment="Live" status={true} lastSync="2 mins ago" />
                <ApiCard name="Sabre GDS" provider="Travel Network" environment="Test" status={true} lastSync="15 mins ago" />
                <ApiCard name="Travelport" provider="Galileo/Apollo" environment="Test" status={false} lastSync="Never" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global GDS Settings</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Default Provider</span>
                            <select className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-blue-500">
                                <option>Amadeus</option>
                                <option>Sabre</option>
                                <option>Travelport</option>
                            </select>
                        </label>
                    </div>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Cache Timeout (Minutes)</span>
                            <input type="number" defaultValue={30} className="mt-1 block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-blue-500" />
                        </label>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
                        Save Global Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
