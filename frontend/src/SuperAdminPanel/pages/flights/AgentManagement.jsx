import React from 'react';
import { UserPlus, Search, MoreVertical, Wallet, Mail, Phone, MapPin } from 'lucide-react';

const AgentCard = ({ name, email, phone, location, balance, status }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm group hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {name[0]}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{name}</h3>
                    <div className={`flex items-center gap-1.5 mt-0.5 ${status ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-wider">{status ? 'Verified' : 'Unverified'}</span>
                    </div>
                </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600">
                <MoreVertical size={20} />
            </button>
        </div>

        <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail size={14} className="text-slate-300" />
                <span>{email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone size={14} className="text-slate-300" />
                <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={14} className="text-slate-300" />
                <span>{location}</span>
            </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Credit Balance</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">₹{balance}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Wallet size={20} />
            </div>
        </div>

        <div className="mt-6 flex gap-2">
            <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                View Profile
            </button>
        </div>
    </div>
);

export default function AgentManagement() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage B2B agents and their credit limits.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <UserPlus size={18} /> Add New Agent
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AgentCard name="Travel Duniya" email="info@travelduniya.com" phone="+91 98765 43210" location="Delhi, IN" balance="2,45,000" status={true} />
                <AgentCard name="Skyways Travel" email="contact@skyways.com" phone="+91 88776 55443" location="Mumbai, IN" balance="1,12,000" status={true} />
            </div>
        </div>
    );
}
