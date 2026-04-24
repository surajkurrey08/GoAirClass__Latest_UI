import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Calendar, User, Phone, Ticket, ChevronRight,
    MapPin, IndianRupee, Clock, CheckCircle2, XCircle, Info,
    PhoneCall, UserCheck, UserX, Scissors, ExternalLink, RefreshCw, Bus, Loader2
} from 'lucide-react';
import { 
    getLiveBookings, 
    updateBoardingStatus, 
    cancelBooking 
} from '../../services/operatorService';
import { toast } from 'react-toastify';

const LiveBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('all'); // all, today, upcoming, completed
    const [updatingId, setUpdatingId] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getLiveBookings();
            setBookings(data.bookings);
        } catch (error) {
            console.error("Fetch Bookings Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            setUpdatingId(bookingId);
            await updateBoardingStatus(bookingId, status);
            toast.dismiss();
            toast.success(`Passenger marked as ${status}`);
            
            // Update local state
            setBookings(prev => prev.map(b => 
                b._id === bookingId ? { ...b, boardingStatus: status } : b
            ));
        } catch (error) {
            toast.dismiss();
            toast.error(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await cancelBooking(bookingId);
            toast.success("Booking cancelled successfully");
            fetchBookings();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            b.pnrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.passengerMobile?.includes(searchTerm);
        
        // Date filtering logic
        const today = new Date().toISOString().split('T')[0];
        if (filterDate === 'today') return matchesSearch && b.travelDate === today;
        if (filterDate === 'upcoming') return matchesSearch && b.travelDate > today;
        if (filterDate === 'completed') return matchesSearch && b.travelDate < today;
        
        return matchesSearch;
    });

    return (
        <div className="p-8 space-y-8 bg-[#f8fafc] min-h-screen font-inter">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Live Bookings</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor reservations and passenger boarding in real-time.</p>
                </div>
                <button 
                    onClick={fetchBookings}
                    className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-100 hover:rotate-180 transition-all duration-500"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Premium Toolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search PNR, Name or Mobile..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="py-4 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/10"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                >
                    <option value="all">All Dates</option>
                    <option value="today">Today's Journeys</option>
                    <option value="upcoming">Upcoming Trips</option>
                    <option value="completed">Completed History</option>
                </select>
                <div className="flex items-center gap-2 px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-100">
                    <Filter size={14} />
                    Advanced Filters
                </div>
            </div>

            {/* List View */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Syncing Manifest...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <div key={booking._id} className="group bg-white border border-slate-100 hover:border-blue-200 rounded-[32px] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden">
                                {/* Real-time Status Badge */}
                                <div className="absolute top-0 right-0">
                                    <div className={`px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${
                                        booking.travelDate === new Date().toISOString().split('T')[0] ? 'bg-rose-500 text-white animate-pulse' :
                                        booking.travelDate > new Date().toISOString().split('T')[0] ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                        {booking.travelDate === new Date().toISOString().split('T')[0] ? '🔴 LIVE TRIP' :
                                         booking.travelDate > new Date().toISOString().split('T')[0] ? '🟡 UPCOMING' : '⚪ COMPLETED'}
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Column 1: Booking & Passenger */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-100">
                                                {booking.passengerName?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{booking.pnrNumber}</div>
                                                <h3 className="text-xl font-black text-slate-800">{booking.passengerName}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-md">{booking.passengers?.[0]?.gender} • {booking.passengers?.[0]?.age} Yrs</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                                        <PhoneCall size={12} className="text-blue-500" />
                                                        {booking.passengerMobile}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Boarding Point</div>
                                                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                                    <MapPin size={12} className="text-blue-500" />
                                                    {booking.boarding?.point || booking.boardingPoint}
                                                </div>
                                                <div className="text-[10px] font-black text-blue-600 mt-1 pl-5">{booking.boarding?.time || 'N/A'}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dropping Point</div>
                                                <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                                    <MapPin size={12} className="text-rose-500" />
                                                    {booking.dropping?.point || booking.droppingPoint}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Trip & Seat */}
                                    <div className="flex-1 border-t lg:border-t-0 lg:border-l border-dashed border-slate-200 lg:pl-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle Details</div>
                                                <div className="flex items-center gap-2">
                                                    <Bus className="w-5 h-5 text-slate-800" />
                                                    <span className="text-sm font-black text-slate-800">{booking.bus?.busName}</span>
                                                </div>
                                                <div className="text-xs font-bold text-slate-500">{booking.bus?.busNumber}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Seat Assignment</div>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <Ticket className="w-5 h-5 text-blue-600" />
                                                    <span className="text-xl font-black text-blue-600">{booking.seatNumbers?.join(', ') || booking.seatNumber}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 flex items-center justify-between">
                                            <div>
                                                <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Boarding Status</div>
                                                <div className={`text-sm font-black flex items-center gap-2 ${
                                                    booking.boardingStatus === 'Boarded' ? 'text-green-600' :
                                                    booking.boardingStatus === 'No Show' ? 'text-red-600' : 'text-amber-600'
                                                }`}>
                                                    {booking.boardingStatus === 'Boarded' ? <UserCheck size={16} /> : 
                                                     booking.boardingStatus === 'No Show' ? <UserX size={16} /> : <Clock size={16} />}
                                                    {booking.boardingStatus || 'Not Boarded'}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    disabled={updatingId === booking._id || booking.boardingStatus === 'Boarded'}
                                                    onClick={() => handleStatusUpdate(booking._id, 'Boarded')}
                                                    className={`p-3 rounded-xl transition-all shadow-sm border ${
                                                        booking.boardingStatus === 'Boarded'
                                                        ? 'bg-green-600 text-white border-green-600 opacity-80'
                                                        : 'bg-white text-green-600 border-green-100 hover:bg-green-600 hover:text-white'
                                                    } disabled:opacity-50`}
                                                >
                                                    {updatingId === booking._id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                                                </button>
                                                <button 
                                                    disabled={updatingId === booking._id || booking.boardingStatus === 'No Show'}
                                                    onClick={() => handleStatusUpdate(booking._id, 'No Show')}
                                                    className={`p-3 rounded-xl transition-all shadow-sm border ${
                                                        booking.boardingStatus === 'No Show'
                                                        ? 'bg-red-600 text-white border-red-600 opacity-80'
                                                        : 'bg-white text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                                                    } disabled:opacity-50`}
                                                >
                                                    {updatingId === booking._id ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Payment & Actions */}
                                    <div className="md:w-64 bg-slate-50/80 rounded-[32px] p-6 flex flex-col justify-between border border-slate-100">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fare</div>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                                                    booking.paymentStatus === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {booking.paymentStatus}
                                                </span>
                                            </div>
                                            <div className="text-3xl font-black text-slate-900 flex items-center gap-1 tracking-tighter">
                                                <IndianRupee size={20} className="text-slate-400" />
                                                {booking.totalFare}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Via {booking.paymentMethod}</div>
                                        </div>

                                        <div className="mt-8 space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="flex items-center justify-center gap-2 p-3 bg-white text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-slate-100">
                                                    <Scissors size={14} /> Change
                                                </button>
                                                <button 
                                                    onClick={() => handleCancel(booking._id)}
                                                    className="flex items-center justify-center gap-2 p-3 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                                                >
                                                    <XCircle size={14} /> Cancel
                                                </button>
                                            </div>
                                            <button className="w-full flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                                                <ExternalLink size={14} /> View Manifest
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                                <Ticket size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">No Reservoirs Found</h2>
                            <p className="text-slate-500 mt-2 max-w-xs font-medium">Try adjusting your filters or search terms to find specific passenger bookings.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setFilterDate('all'); }}
                                className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
                            >
                                Reset Manifest
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveBookings;
