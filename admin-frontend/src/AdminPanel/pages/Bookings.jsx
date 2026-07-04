import React, { useState } from 'react';
import { 
    Search, Filter, Download, MoreHorizontal, 
    Plane, Hotel, Bus, TrainFront,
    CheckCircle2, Clock, XCircle, ChevronRight
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const mockBookings = [
    { id: 'BK-1204', customer: 'Rahul Sharma', service: 'Flight', route: 'DEL → BOM', date: '20 Apr 2026', amount: '₹12,450', status: 'Confirmed', type: 'flight' },
    { id: 'BK-1205', customer: 'Priya Patel', service: 'Bus', route: 'BOM → PNE', date: '21 Apr 2026', amount: '₹1,200', status: 'Pending', type: 'bus' },
    { id: 'BK-1206', customer: 'Amit Kumar', service: 'Hotel', route: 'The Leela Palace', date: '22 Apr 2026', amount: '₹8,500', status: 'Cancelled', type: 'hotel' },
    { id: 'BK-1207', customer: 'Sneha Gupta', service: 'Train', route: 'NDLS → BCT', date: '23 Apr 2026', amount: '₹2,800', status: 'Confirmed', type: 'train' },
    { id: 'BK-1208', customer: 'Vikram Singh', service: 'Flight', route: 'BLR → DEL', date: '24 Apr 2026', amount: '₹15,200', status: 'Confirmed', type: 'flight' },
    { id: 'BK-1209', customer: 'Anjali Nair', service: 'Bus', route: 'MAA → HYD', date: '25 Apr 2026', amount: '₹1,800', status: 'Pending', type: 'bus' },
];

const FilterButton = ({ active, children, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
        }`}
    >
        {children}
    </button>
);

export default function Bookings() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get('type') || 'all';
    
    const [filter, setFilter] = useState(initialType);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBookings = mockBookings.filter(b => {
        const matchesType = filter === 'all' || b.type === filter;
        const matchesSearch = b.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              b.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-50 text-green-600 dark:bg-green-500/10';
            case 'Pending': return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10';
            case 'Cancelled': return 'bg-red-50 text-red-600 dark:bg-red-500/10';
            default: return 'bg-slate-50 text-slate-600 dark:bg-slate-800';
        }
    };

    const getServiceIcon = (type) => {
        switch (type) {
            case 'flight': return <Plane size={16} />;
            case 'hotel': return <Hotel size={16} />;
            case 'bus': return <Bus size={16} />;
            case 'train': return <TrainFront size={16} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Booking Management</h1>
                    <p className="text-slate-500 font-medium italic">Track and manage all user travel reservations.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group overflow-hidden">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Find ID or Customer..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium w-full sm:w-64 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/20 transition-all">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All Bookings</FilterButton>
                <FilterButton active={filter === 'flights'} onClick={() => setFilter('flights')}>Flights</FilterButton>
                <FilterButton active={filter === 'hotels'} onClick={() => setFilter('hotels')}>Hotels</FilterButton>
                <FilterButton active={filter === 'buses'} onClick={() => setFilter('buses')}>Buses</FilterButton>
                <FilterButton active={filter === 'trains'} onClick={() => setFilter('trains')}>Trains</FilterButton>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">Booking ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service & Route</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Travel Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                                            {booking.id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{booking.customer}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">Verified Customer</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-blue-600">{getServiceIcon(booking.type)}</div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{booking.service}</span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-500">{booking.route}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{booking.date}</div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white">
                                        {booking.amount}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${getStatusStyles(booking.status)}`}>
                                            {booking.status === 'Confirmed' && <CheckCircle2 size={12} />}
                                            {booking.status === 'Pending' && <Clock size={12} />}
                                            {booking.status === 'Cancelled' && <XCircle size={12} />}
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredBookings.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold">No bookings found matching your search.</p>
                    </div>
                )}

                <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
                    <p className="text-xs font-medium text-slate-400 italic">Showing {filteredBookings.length} results</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
