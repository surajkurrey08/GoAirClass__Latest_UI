import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, CheckCircle, XCircle, Clock, 
    RefreshCcw, AlertCircle, MessageSquare, ExternalLink,
    ChevronLeft, ChevronRight, Ban
} from 'lucide-react';
import { getFlightRefunds, updateFlightRefundStatus } from '../../../services/flightApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const RefundRow = ({ refund, onUpdate }) => (
    <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
        <td className="py-5 pl-6">
            <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{refund.bookingId?.pnr || 'N/A'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">REF-{refund._id?.substring(0, 8)}</span>
            </div>
        </td>
        <td className="py-5">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{refund.userId?.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{refund.userId?.email}</span>
            </div>
        </td>
        <td className="py-5">
            <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white">₹{refund.amount?.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{refund.paymentMode}</span>
            </div>
        </td>
        <td className="py-5">
            <div className="flex items-start gap-2 max-w-xs">
                <AlertCircle size={14} className="text-slate-300 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">{refund.reason}</p>
            </div>
        </td>
        <td className="py-5">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                refund.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                refund.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                'bg-rose-100 text-rose-600'
            }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                    refund.status === 'Pending' ? 'bg-amber-400' : 
                    refund.status === 'Approved' ? 'bg-emerald-400' : 
                    'bg-rose-400'
                }`}></div>
                {refund.status}
            </span>
            {refund.processedDate && (
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                    {new Date(refund.processedDate).toLocaleDateString()}
                </p>
            )}
        </td>
        <td className="py-5 pr-6 text-right">
            {refund.status === 'Pending' ? (
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => onUpdate(refund._id, 'Approved')}
                        className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                        title="Approve Refund"
                    >
                        <CheckCircle size={18} />
                    </button>
                    <button 
                        onClick={() => onUpdate(refund._id, 'Rejected')}
                        className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                        title="Reject Refund"
                    >
                        <Ban size={18} />
                    </button>
                </div>
            ) : (
                <button className="p-2.5 text-slate-300 hover:text-blue-500 rounded-xl transition-all">
                    <MessageSquare size={18} />
                </button>
            )}
        </td>
    </tr>
);

export default function CancellationRefunds() {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const data = await getFlightRefunds();
            setRefunds(data.refunds);
        } catch (error) {
            toast.error('Failed to load refund requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        const { value: remark } = await Swal.fire({
            title: `${status} Refund?`,
            input: 'textarea',
            inputLabel: 'Admin Remark',
            inputPlaceholder: 'Type your reason or transaction reference here...',
            showCancelButton: true,
            confirmButtonColor: status === 'Approved' ? '#10b981' : '#f43f5e',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: `Yes, ${status}`
        });

        if (remark !== undefined) {
            try {
                await updateFlightRefundStatus(id, { status, adminRemark: remark });
                toast.success(`Refund ${status.toLowerCase()} successfully`);
                fetchRefunds();
            } catch (error) {
                toast.error('Action failed');
            }
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Refund Panel</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Process cancellations and manage payment reversals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-4 mr-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Pending</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Approved</div>
                    </div>
                    <button 
                        onClick={fetchRefunds}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden min-h-[600px]">
                <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by PNR or Refund ID..." 
                            className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-900/50 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">All Requests</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
                                <th className="py-5 pl-6">PNR & ID</th>
                                <th className="py-5">Customer</th>
                                <th className="py-5">Amount</th>
                                <th className="py-5">Reason</th>
                                <th className="py-5">Status</th>
                                <th className="py-5 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="py-10 px-6">
                                            <div className="h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : refunds.length > 0 ? (
                                refunds.map(refund => (
                                    <RefundRow key={refund._id} refund={refund} onUpdate={handleUpdateStatus} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-40 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200">
                                                <RefreshCcw size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">No Refund Requests</h3>
                                            <p className="text-slate-400 text-sm font-medium">All cancellations are currently up to date.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
