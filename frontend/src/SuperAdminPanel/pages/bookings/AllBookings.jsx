import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Calendar, Bus, 
    Navigation, MoreVertical, Ban, 
    CreditCard, CheckCircle, XCircle, 
    Eye, RefreshCw, Loader2, Download
} from 'lucide-react';
import { fetchAdminBookings, cancelAdminBooking } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function AllBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');

    const loadBookings = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                status: statusFilter,
                paymentStatus: paymentFilter
            };
            const res = await fetchAdminBookings(params);
            if (res.success) setBookings(res.bookings);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadBookings();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, paymentFilter]);

    const handleForceCancel = async (id) => {
        const reason = window.prompt("Enter cancellation reason:");
        if (!reason) return;

        try {
            const res = await cancelAdminBooking(id, { reason });
            if (res.success) {
                toast.success('Booking cancelled by administrator');
                loadBookings();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-50 text-green-600 border-green-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center sm:text-left">Booking Directory</h1>
                    <p className="text-slate-500 font-medium mt-1 text-center sm:text-left">Universal oversight of all travel transactions</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                    <Download size={20} />
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex-grow relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="PNR, User, or Operator..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/10"
                    >
                        <option value="">All Status</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <select 
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/10"
                    >
                        <option value="">All Payments</option>
                        <option value="Success">Success</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregating Booking Data...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="py-20 text-center">
                        <Bus size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No bookings found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking & User</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service & Route</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date & Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">#{booking.pnrNumber || booking._id.slice(-8).toUpperCase()}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{booking.passengerName || booking.userId?.name || 'Guest User'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{booking.passengerEmail || booking.userId?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate max-w-[150px]">{booking.bus?.busName || 'N/A'}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                    <span className="font-bold uppercase tracking-tight text-blue-600">{booking.route?.fromCity}</span>
                                                    <Navigation size={8} className="rotate-90" />
                                                    <span className="font-bold uppercase tracking-tight text-green-600">{booking.route?.toCity}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <Calendar size={14} />
                                                    <span className="text-xs font-bold">{booking.travelDate}</span>
                                                </div>
                                                <p className="text-[10px] font-medium text-slate-400 tracking-wider">Departure: {booking.boarding?.time}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="space-y-1">
                                                <span className="text-sm font-black text-slate-900 dark:text-white">₹{booking.totalFare?.toLocaleString()}</span>
                                                <p className={`text-[9px] font-black uppercase tracking-widest ${booking.paymentStatus === 'Completed' ? 'text-green-500' : 'text-amber-500'}`}>
                                                    {booking.paymentStatus}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                    title="View Full Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {booking.status !== 'Cancelled' && (
                                                    <button 
                                                        onClick={() => handleForceCancel(booking._id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                        title="Force Cancel"
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                                                    title="Process Refund"
                                                >
                                                    <RefreshCw size={18} />
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
        </div>
    );
}
