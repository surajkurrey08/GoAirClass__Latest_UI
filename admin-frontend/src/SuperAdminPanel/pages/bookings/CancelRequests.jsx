import React, { useState, useEffect } from 'react';
import { 
    XCircle, CheckCircle, Ticket, 
    User, Bus, Clock, ArrowRight,
    AlertCircle
} from 'lucide-react';
import { getCancelRequests, approveCancel, rejectCancel } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function CancelRequests() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await getCancelRequests();
            if (res.success) {
                setBookings(res.bookings);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            const res = action === 'approve' ? await approveCancel(id) : await rejectCancel(id);
            if (res.success) {
                toast.success(res.message);
                loadRequests();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[2rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                    <AlertCircle size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cancellation Requests</h1>
                    <p className="text-slate-500 font-medium mt-1">Review and process passenger requests for booking cancellations</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Journey Date</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-8">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <CheckCircle size={48} className="text-slate-300 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                                            <p className="text-sm font-medium">No pending cancellation requests to review</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-slate-900">#{booking.pnrNumber || booking._id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{booking.userId?.name || booking.passengerName}</span>
                                                    <span className="text-[10px] text-slate-400">{booking.userId?.mobile || booking.passengerMobile}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800">{booking.bus?.busName}</span>
                                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">{booking.bus?.busNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-xs text-slate-600">
                                            {booking.travelDate}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    disabled={actionLoading === booking._id}
                                                    onClick={() => handleAction(booking._id, 'approve')}
                                                    className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button 
                                                    disabled={actionLoading === booking._id}
                                                    onClick={() => handleAction(booking._id, 'reject')}
                                                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
