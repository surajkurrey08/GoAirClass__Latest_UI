import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Filter, Ticket, 
    User, Bus, Clock, LayoutGrid
} from 'lucide-react';
import { fetchAllOperators, getOperatorBookings } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function OperatorBookings() {
    const [operators, setOperators] = useState([]);
    const [selectedOperator, setSelectedOperator] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadOperators();
    }, []);

    useEffect(() => {
        if (selectedOperator) {
            loadOperatorBookings();
        }
    }, [selectedOperator]);

    const loadOperators = async () => {
        try {
            const res = await fetchAllOperators();
            if (res.success) {
                setOperators(res.operators);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const loadOperatorBookings = async () => {
        setLoading(true);
        try {
            const res = await getOperatorBookings(selectedOperator);
            if (res.success) {
                setBookings(res.bookings);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                        <LayoutGrid size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Operator Analysis</h1>
                        <p className="text-slate-500 font-medium mt-1">Review sales and booking performance for specific bus operators</p>
                    </div>
                </div>

                <div className="flex-1 max-w-sm">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">Select Operator</label>
                    <select 
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all outline-none"
                        value={selectedOperator}
                        onChange={(e) => setSelectedOperator(e.target.value)}
                    >
                        <option value="">Choose an operator...</option>
                        {operators.map(op => (
                            <option key={op._id} value={op._id}>{op.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content area */}
            {!selectedOperator ? (
                <div className="bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 py-32 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No Operator Selected</h3>
                    <p className="text-slate-500 max-w-xs mt-2 font-medium">Please select a bus operator from the dropdown above to view their booking history.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus Name</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fare</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="5" className="px-6 py-8">
                                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No bookings found for this operator</td>
                                    </tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5 font-black text-slate-900 text-sm">
                                                #{booking.pnrNumber || booking._id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{booking.userId?.name || booking.passengerName}</span>
                                                    <span className="text-[10px] text-slate-400">{booking.userId?.mobile}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs font-bold text-slate-600">
                                                {booking.bus?.busName}
                                            </td>
                                            <td className="px-6 py-5 font-black text-slate-900">
                                                ₹{booking.totalFare}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
