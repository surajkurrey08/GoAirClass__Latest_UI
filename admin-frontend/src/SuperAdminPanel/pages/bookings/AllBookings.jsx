import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Calendar, User, 
    Bus, Ticket, Clock, ArrowRight,
    Download, Eye, XCircle, RefreshCcw, 
    CreditCard, MapPin, IndianRupee,
    ChevronDown, ChevronUp, AlertCircle,
    CheckCircle2, Loader2, Users, ShieldAlert, X, Info
} from 'lucide-react';
import { 
    fetchAdminBookings, 
    fetchBookingStats, 
    forceCancelAdminBooking, 
    initiateRefund,
    fetchAllOperators
} from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function AllBookings() {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [operatorFilter, setOperatorFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    
    // UI State
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadBookings();
    }, [statusFilter, paymentFilter, operatorFilter, dateRange]);

    const loadInitialData = async () => {
        try {
            const [statsRes, opsRes] = await Promise.all([
                fetchBookingStats(),
                fetchAllOperators()
            ]);
            if (statsRes.success) setStats(statsRes.stats);
            if (opsRes.success) setOperators(opsRes.operators);
        } catch (error) {
            console.error("Initial Load Error:", error);
        }
    };

    const loadBookings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;
            if (operatorFilter !== 'all') params.operatorId = operatorFilter;
            if (dateRange.start) params.startDate = dateRange.start;
            if (dateRange.end) params.endDate = dateRange.end;
            if (searchTerm) params.search = searchTerm;

            const res = await fetchAdminBookings(params);
            if (res.success) {
                setBookings(res.bookings);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, type) => {
        if (!window.confirm(`Are you sure you want to perform this action?`)) return;
        
        setActionLoading(id);
        try {
            let res;
            if (type === 'cancel') {
                res = await forceCancelAdminBooking(id, { reason: 'Admin Force Cancellation' });
            } else if (type === 'refund') {
                res = await initiateRefund(id);
            }
            
            if (res.success) {
                toast.success(res.message);
                loadBookings();
                loadInitialData();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'cancel_requested': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'refund_initiated': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getPaymentStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': 
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#fdfdfd] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Booking Control Center</h1>
                    <p className="text-slate-500 font-medium mt-1">Enterprise-grade management for all reservations and payments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-200 shadow-sm active:scale-95">
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95">
                        <RefreshCcw size={18} /> Sync Data
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Volume', value: stats?.totalBookings || 0, icon: Ticket, color: 'blue' },
                    { label: 'Net Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'emerald' },
                    { label: 'Cancellations', value: stats?.cancelledBookings || 0, icon: XCircle, color: 'rose' },
                    { label: 'Pending Refunds', value: stats?.pendingRefunds || 0, icon: RefreshCcw, color: 'amber' }
                ].map((card, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                            <h4 className="text-3xl font-black text-slate-900">{card.value}</h4>
                        </div>
                        <div className={`w-14 h-14 bg-${card.color}-50 text-${card.color}-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-${card.color}-100`}>
                            <card.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                    <form onSubmit={(e) => { e.preventDefault(); loadBookings(); }} className="flex-grow min-w-[300px] relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by PNR, Customer Name, Email, or Bus ID..."
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    
                    <div className="flex flex-wrap gap-3">
                        <select 
                            className="px-6 py-5 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Status: All</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Pending">Pending</option>
                            <option value="cancel_requested">Requests</option>
                        </select>

                        <select 
                            className="px-6 py-5 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <option value="all">Payment: All</option>
                            <option value="Completed">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>

                        <select 
                            className="px-6 py-5 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm max-w-[150px]"
                            value={operatorFilter}
                            onChange={(e) => setOperatorFilter(e.target.value)}
                        >
                            <option value="all">Operator: All</option>
                            {operators.map(op => (
                                <option key={op._id} value={op._id}>{op.companyName || op.name}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-3 bg-slate-50 px-6 py-2 rounded-2xl shadow-inner border border-slate-100">
                            <Calendar size={18} className="text-slate-400" />
                            <input 
                                type="date" 
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-tighter p-2 focus:ring-0"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            />
                            <div className="w-4 h-px bg-slate-300" />
                            <input 
                                type="date" 
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-tighter p-2 focus:ring-0"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifiers</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client Intel</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle & Network</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Matrix</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-10">
                                            <div className="h-6 bg-slate-50 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-40 text-center">
                                        <div className="flex flex-col items-center max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                                                <ShieldAlert size={40} />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">No Records Found</h3>
                                            <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">We couldn't find any bookings matching your current configuration. Try resetting filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-slate-50/30 transition-all duration-300 group">
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-black text-slate-900 tracking-tight">#{booking.pnrNumber || booking._id.slice(-8).toUpperCase()}</span>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-slate-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(booking.bookingDate).toLocaleDateString('en-GB')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shadow-inner">
                                                    {booking.passengerName?.[0] || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-black text-slate-800">{booking.passengerName || booking.userId?.name}</span>
                                                        {booking.passengers?.length > 1 && (
                                                            <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                                                +{booking.passengers.length - 1} More
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold tracking-tight">{booking.passengerEmail || booking.userId?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                                                        <Bus size={12} />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-800">{booking.bus?.busName || 'API Travel'}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                                                        <MapPin size={10} className="text-rose-400" />
                                                        {booking.route?.fromCity || booking.boardingPoint?.split(',')[0]} → {booking.route?.toCity || booking.droppingPoint?.split(',')[0]}
                                                    </div>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                                        {booking.seatNumbers?.join(', ') || booking.seatNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1">
                                                    <IndianRupee size={14} className="text-slate-400" />
                                                    <span className="text-base font-black text-slate-900">{booking.totalFare.toLocaleString()}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${getPaymentStyle(booking.paymentStatus)}`}>
                                                        {booking.paymentStatus}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{booking.paymentMethod}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border-2 ${getStatusStyle(booking.status)} inline-flex items-center gap-2`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {booking.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { setSelectedBooking(booking); setIsDetailsModalOpen(true); }}
                                                    className="p-3 bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-2xl border border-slate-100 shadow-sm"
                                                    title="Detailed Intel"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    disabled={actionLoading === booking._id || booking.status === 'Cancelled'}
                                                    onClick={() => handleAction(booking._id, 'cancel')}
                                                    className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-2xl border border-slate-100 shadow-sm"
                                                    title="Force Terminate"
                                                >
                                                    {actionLoading === booking._id ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                                                </button>
                                                {booking.status === 'Cancelled' && booking.paymentStatus === 'Completed' && (
                                                    <button 
                                                        onClick={() => handleAction(booking._id, 'refund')}
                                                        className="p-3 bg-white text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all rounded-2xl border border-slate-100 shadow-sm"
                                                        title="Initiate Reversal"
                                                    >
                                                        <RefreshCcw size={18} />
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

            {/* Details Modal */}
            {isDetailsModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                    <Ticket size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">#{selectedBooking.pnrNumber}</h2>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedBooking.status)}`}>
                                            {selectedBooking.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm mt-1">Booked on {new Date(selectedBooking.bookingDate).toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="p-4 bg-white text-slate-400 hover:text-rose-500 rounded-3xl shadow-sm border border-slate-100 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-10 space-y-12">
                            {/* Grid 1: Journey & Vehicle */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={14} /> Logistics Network
                                    </h3>
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Bus size={120} />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Boarding Point</p>
                                                <p className="text-base font-black text-slate-800">{selectedBooking.boardingPoint}</p>
                                                <p className="text-xs font-bold text-blue-600">{selectedBooking.travelDate} • {selectedBooking.boarding?.time || 'Scheduled'}</p>
                                            </div>
                                            <ArrowRight className="text-slate-200 mt-6" />
                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Dropping Point</p>
                                                <p className="text-base font-black text-slate-800">{selectedBooking.droppingPoint}</p>
                                            </div>
                                        </div>
                                        <div className="pt-8 border-t border-slate-200/60 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-700">
                                                <Bus size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{selectedBooking.bus?.busName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedBooking.bus?.busNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} /> Passenger Manifest
                                    </h3>
                                    <div className="space-y-3">
                                        {(selectedBooking.passengers || [{ name: selectedBooking.passengerName, age: selectedBooking.passengerAge, gender: selectedBooking.passengerGender, seatNumber: selectedBooking.seatNumber }]).map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{p.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{p.gender} • {p.age} Years</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Seat</p>
                                                    <p className="text-sm font-black text-blue-600 tracking-tighter">{p.seatNumber || selectedBooking.seatNumbers?.[idx] || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Grid 2: Payment Matrix */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={14} /> Financial Intel
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-slate-200">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaction</p>
                                        <h4 className="text-4xl font-black flex items-center gap-2 tracking-tighter">
                                            <IndianRupee size={28} className="text-blue-500" />
                                            {selectedBooking.totalFare.toLocaleString()}
                                        </h4>
                                        <div className="pt-4 flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getPaymentStyle(selectedBooking.paymentStatus)}`}>
                                                {selectedBooking.paymentStatus}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase">Via {selectedBooking.paymentMethod}</span>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-2 gap-6">
                                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Transactional Hash</p>
                                            <code className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl block truncate">
                                                {selectedBooking.transactionId || selectedBooking.razorpayPaymentId || 'N/A_EXTERNAL_REF'}
                                            </code>
                                            <p className="text-[9px] text-slate-400 mt-4 font-medium italic">* This is a secure ledger entry from the payment gateway.</p>
                                        </div>
                                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Fare Breakdown</p>
                                                <Info size={14} className="text-slate-300" />
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500">Base Price</span>
                                                    <span className="font-bold text-slate-800">₹{(selectedBooking.totalFare * 0.92).toFixed(0)}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-500">Service Fee (GST)</span>
                                                    <span className="font-bold text-slate-800">₹{(selectedBooking.totalFare * 0.08).toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <AlertCircle size={14} /> Global ID: {selectedBooking._id}
                            </div>
                            <div className="flex gap-4">
                                <button className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                                    <Download size={16} className="inline mr-2" /> Download Invoice
                                </button>
                                {selectedBooking.status !== 'Cancelled' && (
                                    <button 
                                        onClick={() => handleAction(selectedBooking._id, 'cancel')}
                                        className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Terminate Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
