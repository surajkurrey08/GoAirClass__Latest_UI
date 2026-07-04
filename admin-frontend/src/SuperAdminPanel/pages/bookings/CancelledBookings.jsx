import React, { useState, useEffect } from 'react';
import { 
    XCircle, User, ShieldCheck, 
    ArrowRightCircle, History, AlertTriangle,
    Loader2, Search, Filter, RefreshCw
} from 'lucide-react';
import { fetchRefundLogs } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function CancelledBookings() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await fetchRefundLogs();
            if (res.success) setLogs(res.logs);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.pnrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6 text-center sm:text-left mx-auto sm:mx-0">
                    <div className="w-16 h-16 rounded-[2rem] bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/5">
                        <XCircle size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Cancelled Bookings</h1>
                        <p className="text-slate-500 font-medium mt-1">Audit log of aborted journeys and terminations</p>
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-grow relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by PNR or cancellation reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-semibold focus:ring-2 focus:ring-red-500/10 outline-none transition-all"
                    />
                </div>
                <button 
                    onClick={loadLogs}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-3xl text-sm font-black text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Sync Logs
                </button>
            </div>

            {/* Logs List */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Parsing Audit Logs...</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                    <History size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold">No cancellation logs found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredLogs.map((log) => (
                        <div key={log._id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
                            <div className="space-y-6">
                                {/* Top Row */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">PNR: {log.pnrNumber}</span>
                                            <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-100">CANCELLED</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <User size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{log.bookingId?.userId?.name || 'Guest'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {new Date(log.cancellationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div className="grid grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-50 dark:border-slate-800">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">₹{log.originalTotalFare}</p>
                                    </div>
                                    <div className="border-x border-slate-200 dark:border-slate-700 px-6 text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee</p>
                                        <p className="text-sm font-black text-red-500">₹{log.cancellationCharges}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Refund</p>
                                        <p className="text-sm font-black text-green-600">₹{log.refundAmount}</p>
                                    </div>
                                </div>

                                {/* Reasoning Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <AlertTriangle size={12} className="text-amber-500" />
                                        Reason for Termination
                                    </div>
                                    <div className="p-4 bg-red-50/30 dark:bg-red-900/10 rounded-2xl border border-red-50 dark:border-red-900/30">
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                                            "{log.reason || 'No reason provided'}"
                                        </p>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged by System</p>
                                    </div>
                                    <button className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:gap-3 transition-all">
                                        Audit Details 
                                        <ArrowRightCircle size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
