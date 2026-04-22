import React, { useState, useEffect } from 'react';
import { 
    Star, TrendingUp, Clock, MapPin, 
    Navigation, Loader2, Plus, LayoutGrid, 
    AlertCircle, Trash2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchGlobalRoutes, updateGlobalRoute } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function PopularRoutes() {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPopularRoutes = async () => {
        setLoading(true);
        try {
            const res = await fetchGlobalRoutes({ popular: 'true' });
            if (res.success) setRoutes(res.routes);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPopularRoutes();
    }, []);

    const removePopular = async (id) => {
        try {
            const res = await updateGlobalRoute(id, { isPopular: false });
            if (res.success) {
                toast.success('Removed from popular connections');
                loadPopularRoutes();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-xl shadow-amber-500/5">
                        <Star size={32} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Popular Connections</h1>
                        <p className="text-slate-500 font-medium mt-1">High-density travel paths highlighted for marketing and search</p>
                    </div>
                </div>
                <Link 
                    to="/super-admin/buses/routes/all"
                    className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-6 py-3.5 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all shadow-sm"
                >
                    <LayoutGrid size={20} />
                    View All Routes
                </Link>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Network Data...</p>
                </div>
            ) : routes.length === 0 ? (
                <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <Star size={48} className="mx-auto text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Popular Routes Defined</h3>
                    <p className="text-slate-400 font-medium mb-8">Mark active routes as popular from the network registry to show them here.</p>
                    <Link to="/super-admin/buses/routes/all" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline">Go to Registry</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {routes.map((route) => (
                        <div key={route._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none group overflow-hidden">
                            <div className="p-8 space-y-6">
                                {/* Route Visualization */}
                                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                    <div className="text-center">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-blue-600 shadow-sm mx-auto mb-2 capitalize">
                                            <MapPin size={18} />
                                        </div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{route.fromCity}</p>
                                    </div>
                                    <div className="flex flex-col items-center flex-grow px-4">
                                        <div className="w-full h-px border-t border-dashed border-slate-300 dark:border-slate-600 relative">
                                            <TrendingUp size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 bg-white dark:bg-slate-900 px-1" />
                                        </div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">{route.distance}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-green-600 shadow-sm mx-auto mb-2 capitalize">
                                            <Navigation size={18} />
                                        </div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{route.toCity}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-50 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 items-center flex gap-2">
                                            <Clock size={10} /> Time
                                        </p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{route.travelTime}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-50 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 items-center flex gap-2">
                                            <AlertCircle size={10} /> Status
                                        </p>
                                        <p className={`text-sm font-bold ${route.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>{route.status}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions Footer */}
                            <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    onClick={() => removePopular(route._id)}
                                    className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-all"
                                >
                                    <Trash2 size={14} />
                                    Remove Popularity
                                </button>
                                <Link 
                                    to={`/super-admin/buses/routes/edit/${route._id}`}
                                    className="p-2 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                                >
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
