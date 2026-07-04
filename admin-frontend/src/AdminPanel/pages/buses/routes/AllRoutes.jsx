import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, MapPin, Navigation, 
    Edit3, Trash2, Star, 
    Loader2, Plus, AlertCircle, TrendingUp, Clock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchGlobalRoutes, deleteGlobalRoute, toggleRoutePopularity } from '../../../../services/adminBus';
import { toast } from 'react-toastify';

export default function AllRoutes() {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [popularFilter, setPopularFilter] = useState(false);

    const loadRoutes = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                status: statusFilter,
                popular: popularFilter ? 'true' : undefined
            };
            const res = await fetchGlobalRoutes(params);
            if (res.success) setRoutes(res.routes);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadRoutes();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, popularFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this route?')) return;
        try {
            const res = await deleteGlobalRoute(id);
            if (res.success) {
                toast.success('Route deleted successfully');
                loadRoutes();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const togglePopular = async (route) => {
        try {
            const res = await toggleRoutePopularity(route._id);
            if (res.success) {
                toast.success(res.isPopular ? 'Marked as Popular' : 'Removed from Popular');
                loadRoutes();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Route Network</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage connectivity and travel connections</p>
                </div>
                <Link 
                    to="/admin/buses/routes/add"
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} />
                    Define New Route
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex-grow relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by city name..." 
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
                        <option value="Active">Active Only</option>
                        <option value="Inactive">Inactive Only</option>
                    </select>
                    <button 
                        onClick={() => setPopularFilter(!popularFilter)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                            popularFilter 
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                        }`}
                    >
                        <Star size={18} fill={popularFilter ? 'currentColor' : 'none'} />
                        Popular
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Route Data...</p>
                    </div>
                ) : routes.length === 0 ? (
                    <div className="py-20 text-center">
                        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No routes found matching your criteria</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Distance</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Est. Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {routes.map((route) => (
                                    <tr key={route._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center gap-1 py-1">
                                                    <MapPin size={16} className="text-blue-600" />
                                                    <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                                    <Navigation size={16} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{route.fromCity}</span>
                                                        <TrendingUp size={12} className="text-slate-300" />
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{route.toCity}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {route._id.slice(-8).toUpperCase()}</span>
                                                        {route.isPopular && (
                                                            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/50 flex items-center gap-1">
                                                                <Star size={8} fill="currentColor" /> POPULAR
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{route.distance} KM</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-2 text-slate-500">
                                                <Clock size={14} />
                                                <span className="text-sm font-bold">{route.travelTime}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{route.type}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">₹{route.price}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                route.status === 'Active' 
                                                ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800' 
                                                : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-800'
                                            }`}>
                                                {route.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => togglePopular(route)}
                                                    className={`p-2 rounded-xl transition-all ${
                                                        route.isPopular 
                                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20' 
                                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                    title={route.isPopular ? "Remove from Popular" : "Mark as Popular"}
                                                >
                                                    <Star size={18} fill={route.isPopular ? "currentColor" : "none"} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/admin/buses/routes/edit/${route._id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                    title="Edit Route"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(route._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Delete Route"
                                                >
                                                    <Trash2 size={18} />
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
