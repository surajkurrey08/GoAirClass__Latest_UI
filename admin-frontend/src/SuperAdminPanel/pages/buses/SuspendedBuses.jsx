import React from 'react';
import BusTable from './components/BusTable';
import { Ban } from 'lucide-react';

export default function SuspendedBuses() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-600">
                        <Ban size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suspended Fleet</h1>
                        <p className="text-slate-500 font-medium mt-1">Units temporarily restricted from network operations</p>
                    </div>
                </div>
            </div>

            <BusTable statusFilter="suspended" />
        </div>
    );
}
