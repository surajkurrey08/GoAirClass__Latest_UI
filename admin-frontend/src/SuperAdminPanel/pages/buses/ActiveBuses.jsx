import React from 'react';
import BusTable from './components/BusTable';
import { ShieldCheck } from 'lucide-react';

export default function ActiveBuses() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-green-500/10 flex items-center justify-center text-green-600">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Fleet</h1>
                        <p className="text-slate-500 font-medium mt-1">Verified and operational transport units</p>
                    </div>
                </div>
            </div>

            <BusTable statusFilter="active" />
        </div>
    );
}
