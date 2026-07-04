import React from 'react';
import { Award, Percent, UserPlus, Search, ChevronRight } from 'lucide-react';

const CommissionRow = ({ agent, type, rate, totalPaid, status }) => (
    <tr className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
        <td className="py-4 pl-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {agent[0]}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{agent}</p>
                </div>
            </div>
        </td>
        <td className="py-4 font-bold text-sm text-slate-900 dark:text-white">{rate}</td>
        <td className="py-4 font-bold text-sm text-slate-900 dark:text-white">₹{totalPaid}</td>
        <td className="py-4">
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {status}
            </span>
        </td>
        <td className="py-4 pr-4 text-right">
            <button className="text-slate-400 hover:text-blue-600 transition-all">
                <ChevronRight size={18} />
            </button>
        </td>
    </tr>
);

export default function CommissionManagement() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Commission Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage agent payouts and airline-specific commission rules.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <UserPlus size={18} /> New Agent Rule
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
                    <Award className="mb-4 opacity-50" size={32} />
                    <h3 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Total Commission Paid</h3>
                    <p className="text-3xl font-black mb-2">₹12,45,800</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agent Commission Rules</h3>
                    <div className="relative">
                        <input type="text" placeholder="Search agents..." className="pl-10 pr-4 py-2 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm w-64" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                                <th className="py-4 pl-4">Agent Name</th>
                                <th className="py-4">Rate</th>
                                <th className="py-4">Total Paid</th>
                                <th className="py-4">Status</th>
                                <th className="py-4 pr-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <CommissionRow agent="Travel Express Pvt Ltd" type="Percentage" rate="5%" totalPaid="84,200" status="Active" />
                            <CommissionRow agent="Global Holidays" type="Fixed" rate="₹150/px" totalPaid="42,100" status="Active" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
