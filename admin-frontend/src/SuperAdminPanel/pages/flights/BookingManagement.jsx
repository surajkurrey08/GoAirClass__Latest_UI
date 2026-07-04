import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Download, MoreHorizontal, Plane, 
    User, CreditCard, Mail, Phone, Calendar, 
    Eye, XCircle, ChevronLeft, ChevronRight, RefreshCcw
} from 'lucide-react';
import { getFlightBookings } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const BookingRow = ({ booking }) => {
    const mainPassenger = booking.passengers[0];
    return (
        <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
            <td className="py-4 pl-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                        {booking.flightDetails?.airline?.substring(0, 2).toUpperCase() || 'FL'}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{booking.pnr || 'N/A'}</p>
                        <p className="text-[10px] text-slate-500 font-bold">ID: {booking.bookingId}</p>
                    </div>
                </div>
            </td>
            <td className="py-4">
                <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{mainPassenger?.firstName} {mainPassenger?.lastName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <Mail size={12} className="text-slate-400" />
                        <span className="text-[10px] text-slate-500 font-medium">{booking.contactDetails?.email}</span>
                    </div>
                </div>
            </td>
            <td className="py-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{booking.flightDetails?.departureAirport}</span>
                    <Plane size={12} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{booking.flightDetails?.arrivalAirport}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={12} className="text-slate-400" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(booking.flightDetails?.departureTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
            </td>
            <td className="py-4 font-black text-sm text-slate-900 dark:text-white">
                ₹{(booking.fareDetails?.totalAmount || 0).toLocaleString()}
            </td>
            <td className="py-4">
                <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-flex w-fit ${
                        booking.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-600' : 
                        booking.bookingStatus === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                        'bg-rose-100 text-rose-600'
                    }`}>
                        {booking.bookingStatus}
                    </span>
                    <span className={`text-[9px] font-bold ${booking.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {booking.paymentStatus === 'PAID' ? '✓ PAID' : '• PENDING'}
                    </span>
                </div>
            </td>
            <td className="py-4 pr-6 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 rounded-lg transition-all" title="View Details">
                        <Eye size={16} />
                    </button>
                    <button className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 rounded-lg transition-all" title="Cancel Booking">
                        <XCircle size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getFlightBookings({ search, status: statusFilter });
            setBookings(data.bookings);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Flight Bookings</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage reservations, PNRs and ticket issuance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchBookings}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:border-blue-200 transition-all">
                        <Download size={18} className="text-blue-500" /> 
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by PNR, Email, or Booking ID..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-900/50 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-400 outline-none cursor-pointer border-b-2 border-transparent hover:border-blue-500 transition-all py-1"
                            >
                                <option value="">All Statuses</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PENDING">Pending</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
                                <th className="py-5 pl-6">Booking Details</th>
                                <th className="py-5">Passenger Info</th>
                                <th className="py-5">Route & Schedule</th>
                                <th className="py-5">Fare</th>
                                <th className="py-5">Status</th>
                                <th className="py-5 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="py-8 px-6">
                                            <div className="h-10 bg-slate-50 dark:bg-slate-900 rounded-xl"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : bookings.length > 0 ? (
                                bookings.map(booking => (
                                    <BookingRow key={booking._id} booking={booking} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-300">
                                                <Search size={40} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">No Bookings Found</h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {bookings.length > 0 && (
                    <div className="p-6 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {bookings.length} Results</p>
                        <div className="flex gap-2">
                            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50" disabled>
                                <ChevronLeft size={20} />
                            </button>
                            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50" disabled>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
