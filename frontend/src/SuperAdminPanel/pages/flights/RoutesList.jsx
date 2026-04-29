import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Navigation, Search, Plus, Filter, MoreVertical, 
    ArrowRight, Clock, MapPin, Edit2, Trash2 
} from 'lucide-react';
import { getFlightRoutes, deleteFlightRoute } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const RouteRow = ({ route, onDelete }) => (
    <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {route.from} <ArrowRight size={14} className="text-slate-400" /> {route.to}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {route.fromCity} to {route.toCity}
                    </span>
                </div>
            </div>
        </td>
        <td className="py-4 px-4">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{route.distance} km</span>
        </td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock size={14} />
                <span className="text-sm font-semibold">{route.duration}</span>
            </div>
        </td>
        <td className="py-4 px-4">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                route.status 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' 
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10'
            }`}>
                {route.status ? 'ACTIVE' : 'INACTIVE'}
            </span>
        </td>
        <td className="py-4 px-4">
            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                    <Edit2 size={16} />
                </button>
                <button 
                    onClick={() => onDelete(route._id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </td>
    </tr>
);

export default function RoutesList() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ status: '' });

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await getFlightRoutes({ search, ...filters });
            setRoutes(data.routes);
        } catch (error) {
            toast.error('Failed to load routes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, [search, filters]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                await deleteFlightRoute(id);
                toast.success('Route deleted successfully');
                fetchRoutes();
            } catch (error) {
                toast.error('Failed to delete route');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Route Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage flight paths and network connections.</p>
                </div>
                <Link 
                    to="/super-admin/flights/add-route"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} /> Add Route
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by city or IATA code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>
                <select 
                    className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none text-sm font-semibold"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distance</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="py-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="py-8 px-4">
                                            <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : routes.length > 0 ? (
                                routes.map(route => (
                                    <RouteRow key={route._id} route={route} onDelete={handleDelete} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Navigation size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Routes Found</h3>
                                        <p className="text-slate-500 text-sm">Add your first flight route to start management.</p>
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
