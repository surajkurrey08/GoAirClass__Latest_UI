import React, { useState, useEffect } from 'react';
import { 
    Tag, CheckCircle, Ticket, 
    User, Bus, IndianRupee, CreditCard,
    ShieldCheck, Timer
} from 'lucide-react';
import { fetchAdminBookings, initiateRefund } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function RefundInitiate() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    
    // Simple role check from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isSuperAdmin = user.role === 'superadmin';

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            // Show only cancelled bookings where refund is not yet completed
            const res = await fetchAdminBookings({ status: 'Cancelled' });
            if (res.success) {
                setBookings(res.bookings);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInitiate = async (id) => {
        setActionLoading(id);
        try {
            const res = await initiateRefund(id);
            if (res.success) {
                toast.success("Refund initiated and sent for final approval");
                loadBookings();
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
                <div className="w-14 h-14 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <IndianRupee size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Refund Queue</h1>
                    <p className="text-slate-500 font-medium mt-1">Initiate and approve refunds for cancelled bookings</p>
                </div>
            </div>

            {/* Warning for Standard Admins */}
            {!isSuperAdmin && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Admin Limitation</h4>
                        <p className="text-xs font-medium text-blue-700 mt-0.5">You can initiate refunds, but final approval is restricted to the Super Admin.</p>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Ref</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Fare</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
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
                                            <Timer size={48} className="text-slate-300 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-900">Queue is empty</h3>
                                            <p className="text-sm font-medium">No cancelled bookings waiting for refund initiation</p>
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
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800">{booking.userId?.name || booking.passengerName}</span>
                                                <span className="text-[10px] text-slate-400">{booking.userId?.mobile || booking.passengerMobile}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-slate-900 font-mono">₹{booking.totalFare}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-50 text-red-600 border-red-100 inline-block">
                                                Cancelled
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    disabled={actionLoading === booking._id}
                                                    onClick={() => handleInitiate(booking._id)}
                                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                                                >
                                                    <CreditCard size={14} /> Initiate Refund
                                                </button>
                                                
                                                {isSuperAdmin && (
                                                    <button 
                                                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-600/20 active:scale-95 flex items-center gap-2"
                                                    >
                                                        <ShieldCheck size={14} /> Final Approve
                                                    </button>
                                                )}
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
