import React from 'react';
import BusTable from '../../../SuperAdminPanel/pages/buses/components/BusTable';
import { Plus, Bus as BusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AllBuses() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                        <BusIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fleet Directory</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage and monitor all registered buses across the network</p>
                    </div>
                </div>
                
                <Link 
                    to="/admin/buses/add"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm"
                >
                    <Plus size={18} /> Add New Fleet
                </Link>
            </div>

            <BusTable statusFilter="" />
        </div>
    );
}
