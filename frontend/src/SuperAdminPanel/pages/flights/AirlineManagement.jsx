import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Search, Plus, Filter, MoreVertical, ShieldCheck, ShieldAlert, Image as ImageIcon } from 'lucide-react';

const AirlineCard = ({ name, code, logo, status, routes }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm group hover:border-blue-500/50 transition-all">
        <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                    {logo ? (
                        <img src={logo} alt={name} className="w-10 h-10 object-contain" />
                    ) : (
                        <ImageIcon className="text-slate-300" size={24} />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{name}</h3>
                    <p className="text-xs font-black text-slate-400 tracking-widest">{code}</p>
                </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <MoreVertical size={20} />
            </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Active Routes</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{routes}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Commission</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">4.5%</p>
            </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
            <div className={`flex items-center gap-1.5 ${status ? 'text-emerald-500' : 'text-rose-500'}`}>
                {status ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                <span className="text-xs font-bold uppercase tracking-wider">{status ? 'Operational' : 'Disabled'}</span>
            </div>
            <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${status ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                {status ? 'Disable' : 'Enable'}
            </button>
        </div>
    </div>
);

export default function AirlineManagement() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Airline Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Enable/Disable airlines and manage metadata.</p>
                </div>
                <div className="flex gap-3">
                    <Link 
                        to="/super-admin/flights/add-airline"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus size={18} /> Add Airline
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AirlineCard name="Air India" code="AI" status={true} routes={145} />
                <AirlineCard name="IndiGo" code="6E" status={true} routes={280} />
                <AirlineCard name="Vistara" code="UK" status={true} routes={92} />
                <AirlineCard name="SpiceJet" code="SG" status={false} routes={0} />
            </div>
        </div>
    );
}
