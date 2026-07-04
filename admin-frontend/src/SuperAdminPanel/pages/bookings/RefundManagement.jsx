import React, { useState, useEffect } from 'react';
import { 
    CreditCard, CheckCircle2, XCircle, 
    AlertCircle, DollarSign, Wallet, 
    ArrowUpRight, Loader2, Search,
    Filter, MoreHorizontal, ShieldCheck
} from 'lucide-react';
import { fetchRefundLogs } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function RefundManagement() {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadRefundData = async () => {
        setLoading(true);
        try {
            const res = await fetchRefundLogs();
            if (res.success) setRefunds(res.logs);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRefundData();
    }, []);

    const getStatusBadge = (status) => {
        // Simplified status for log-based refunds
        return (
            <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                Pending Approval
            </span>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Refund Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Review and reconcile financial reversals</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="px-6 py-2 text-center border-r border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p>
                        <p className="text-lg font-black text-amber-500">₹{refunds.reduce((acc, curr) => acc + curr.refundAmount, 0).toLocaleString()}</p>
                    </div>
                    <div className="px-6 py-2 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completed</p>
                        <p className="text-lg font-black text-green-600">₹0</p>
                    </div>
                </div>
            </div>

            {/* Refund Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Reconciling Ledgers...</p>
                    </div>
                ) : refunds.length === 0 ? (
                    <div className="py-20 text-center">
                        <Wallet size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No active refund requests</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID & Recipient</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payment Source</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Refundable Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Approval</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {refunds.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600">
                                                    <CreditCard size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase">#{log.pnrNumber}</p>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{log.bookingId?.userId?.name || 'Customer'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                <DollarSign size={10} />
                                                Razorpay / UPI
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">₹{log.refundAmount.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-slate-400 line-through tracking-widest">₹{log.originalTotalFare}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {getStatusBadge()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                                    title="Approve and Release Funds"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Decline Refund"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Footer Summary */}
            <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[3rem] border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-center gap-6 justify-between animate-in slide-in-from-bottom-4 duration-1000">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">Admin Refund Overrides</p>
                        <p className="text-xs font-medium text-slate-500">Super Admins can bypass standard policies to issue full reversals when necessary.</p>
                    </div>
                </div>
                <button className="px-8 py-4 bg-white dark:bg-slate-800 border-2 border-blue-600 text-blue-600 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                    Platform Refund Policy
                </button>
            </div>
        </div>
    );
}
