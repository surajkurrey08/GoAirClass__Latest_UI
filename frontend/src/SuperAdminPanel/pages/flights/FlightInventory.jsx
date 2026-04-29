import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Layers, Search, Plus, Filter, MoreVertical, 
    Plane, Clock, Users, DollarSign, Edit2, Trash2, 
    Calendar, MapPin, ArrowRight
} from 'lucide-react';
import { getFlightInventory, deleteFlightInventory } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const FlightRow = ({ flight, onDelete }) => (
    <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group text-sm">
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2">
                    <img src={flight.airline?.logo || '/default-airline.png'} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{flight.flightNumber}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{flight.airline?.name}</p>
                </div>
            </div>
        </td>
        <td className="py-4 px-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                    {flight.from} <ArrowRight size={12} className="text-slate-400" /> {flight.to}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(flight.departureDate).toLocaleDateString()}
                </span>
            </div>
        </td>
        <td className="py-4 px-4">
            <div className="flex flex-col">
                <span className="font-bold text-blue-600 dark:text-blue-400">{flight.departureTime}</span>
                <span className="text-[10px] text-slate-400">Duration: {flight.duration}</span>
            </div>
        </td>
        <td className="py-4 px-4 text-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                    <Users size={14} className="text-slate-400" />
                    {flight.availableSeats} / {flight.totalSeats}
                </div>
                <div className="w-16 h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(flight.availableSeats / flight.totalSeats) * 100}%` }}
                    />
                </div>
            </div>
        </td>
        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
            ₹{flight.finalPrice.toLocaleString()}
        </td>
        <td className="py-4 px-4">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                flight.status 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' 
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10'
            }`}>
                {flight.status ? 'ACTIVE' : 'INACTIVE'}
            </span>
        </td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                    <Edit2 size={16} />
                </button>
                <button 
                    onClick={() => onDelete(flight._id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </td>
    </tr>
);

export default function FlightInventory() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ airline: '', status: '' });

    const fetchFlights = async () => {
        try {
            setLoading(true);
            const data = await getFlightInventory({ search, ...filters });
            setFlights(data.flights);
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, [search, filters]);

    const handleDelete = async (id) => {
        if (window.confirm('Remove this flight from inventory?')) {
            try {
                await deleteFlightInventory(id);
                toast.success('Flight removed');
                fetchFlights();
            } catch (error) {
                toast.error('Failed to remove flight');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Flight Inventory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage seat availability and pricing for active schedules.</p>
                </div>
                <Link 
                    to="/super-admin/flights/add-flight"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} /> Add Flight
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by flight no, route..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
                <select 
                    className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-sm font-semibold"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flight</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route & Date</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Seats</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-slate-100 dark:border-slate-800">
                                        <td colSpan="7" className="py-8 px-4">
                                            <div className="h-10 bg-slate-50 dark:bg-slate-800 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : flights.length > 0 ? (
                                flights.map(flight => (
                                    <FlightRow key={flight._id} flight={flight} onDelete={handleDelete} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Layers size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Inventory is Empty</h3>
                                        <p className="text-slate-500 text-sm">Add flights to your inventory to start selling tickets.</p>
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
