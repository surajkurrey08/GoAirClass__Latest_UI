import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    MapPin, Search, Plus, Filter, MoreVertical, 
    ShieldCheck, ShieldAlert, Globe, Plane, Edit2, Trash2 
} from 'lucide-react';
import { getAirports, deleteAirport } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const AirportCard = ({ airport, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                    {airport.iataCode}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {airport.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} /> {airport.city}, {airport.country}
                    </p>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-600">
                    <Edit2 size={16} />
                </button>
                <button 
                    onClick={() => onDelete(airport._id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-600"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{airport.type}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    airport.status 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' 
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10'
                }`}>
                    {airport.status ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
            <div className="flex gap-2">
                {airport.isPopular && (
                    <span className="px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-100 dark:border-amber-500/20">
                        POPULAR
                    </span>
                )}
                {airport.type === 'International' && (
                    <span className="px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 text-[10px] font-bold rounded-lg border border-purple-100 dark:border-purple-500/20">
                        INTL
                    </span>
                )}
            </div>
            <p className="text-[10px] font-bold text-slate-400">ICAO: {airport.icaoCode || 'N/A'}</p>
        </div>
    </div>
);

export default function AirportsList() {
    const [airports, setAirports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ type: '', status: '', country: '' });

    const fetchAirports = async () => {
        try {
            setLoading(true);
            const data = await getAirports({ search, ...filters });
            setAirports(data.airports);
        } catch (error) {
            toast.error('Failed to load airports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAirports();
    }, [search, filters]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this airport?')) {
            try {
                await deleteAirport(id);
                toast.success('Airport deleted successfully');
                fetchAirports();
            } catch (error) {
                toast.error('Failed to delete airport');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Airport Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Add and manage airports for flight routes.</p>
                </div>
                <Link 
                    to="/super-admin/flights/add-airport"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} /> Add Airport
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, IATA code, or city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
                <select 
                    className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-sm font-semibold"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                    <option value="">All Types</option>
                    <option value="Domestic">Domestic</option>
                    <option value="International">International</option>
                    <option value="Both">Both</option>
                </select>
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

            {/* Airports Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50" />
                    ))}
                </div>
            ) : airports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {airports.map(airport => (
                        <AirportCard key={airport._id} airport={airport} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-700/50">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <MapPin size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Airports Found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-6 text-sm">
                        No airports match your search or filters. Try adjusting them or add a new airport.
                    </p>
                </div>
            )}
        </div>
    );
}
