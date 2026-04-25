import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Calendar,
    User,
    Phone,
    Ticket,
    ChevronRight,
    MapPin,
    IndianRupee,
    Clock,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import {
    fetchMyBookings
} from '../../services/operatorService';
import { toast } from 'react-toastify';

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const getBookings = async () => {
        try {
            setLoading(true);
            const data = await fetchMyBookings();
            setBookings(data);
        } catch (error) {
            console.error("Fetch Bookings Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBookings();
    }, []);

    const filteredBookings = bookings.filter(b =>
        b.pnrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.passengerMobile?.includes(searchTerm)
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Live Bookings</h1>
                    <p className="text-slate-500 font-medium">Monitor reservations and passenger manifests in real-time.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by PNR, Name or Mobile..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-slate-100 mx-2"></div>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all">
                    <Calendar size={18} />
                    Date Range
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* List Table */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">PNR & Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Journey Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fare</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-slate-800">{booking.pnrNumber}</span>
                                            <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-xs uppercase">
                                                {booking.passengerName?.[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800">{booking.passengerName}</span>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
                                                    <Phone size={10} />
                                                    {booking.passengerMobile}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                <MapPin size={12} className="text-blue-500" />
                                                {booking.route?.fromCity} → {booking.route?.toCity}
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {booking.travelDate}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Ticket size={10} />
                                                    Seats: {booking.seatNumbers?.join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-black text-slate-800 flex items-center gap-0.5">
                                                <IndianRupee size={12} />
                                                {booking.totalFare}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{booking.paymentStatus}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center">
                                            <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredBookings.length === 0 && (
                        <div className="p-20 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <Ticket size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">No bookings found</h3>
                            <p className="text-sm text-slate-500 max-w-xs mt-1">Try adjusting your filters or search terms to find what you are looking for.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingList;
