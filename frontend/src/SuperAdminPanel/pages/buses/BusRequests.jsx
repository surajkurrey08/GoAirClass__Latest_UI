import React from 'react';
import BusTable from './components/BusTable';
import { Clock } from 'lucide-react';

export default function BusRequests() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Clock size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pending Approval</h1>
                        <p className="text-slate-500 font-medium mt-1">Review registration requests from operators</p>
                    </div>
                </div>
            </div>

            <BusTable statusFilter="pending" />
        </div>
    );
}
