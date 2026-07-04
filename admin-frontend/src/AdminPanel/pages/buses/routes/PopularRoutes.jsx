import React, { useState, useEffect } from 'react';
import { Star, MapPin, Navigation, TrendingUp, Clock, Loader2, AlertCircle, Plane, TrainFront, Bus } from 'lucide-react';
import { fetchGlobalRoutes, toggleRoutePopularity } from '../../../../services/adminBus';
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

    const togglePopular = async (route) => {
        try {
            const res = await toggleRoutePopularity(route._id);
            if (res.success) {
                toast.success('Removed from Popular');
                loadPopularRoutes();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    const getRouteIcon = (type) => {
        switch (type) {
            case 'flight': return <Plane size={24} className="text-blue-500" />;
            case 'train': return <TrainFront size={24} className="text-emerald-500" />;
            case 'bus': return <Bus size={24} className="text-amber-500" />;
            default: return <Star size={24} className="text-slate-500" />;
        }
    };
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 w-fit bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/50">
                    <Star size={12} fill="currentColor" /> Featured Routes
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Trending Now</h1>
                <p className="text-slate-500 font-medium">Most searched travel routes with the best prices in your network</p>
            </div>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Network...</p>
                </div>
            ) : routes.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                    <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold text-lg">No routes are currently marked as popular</p>
                    <p className="text-slate-400 text-sm mt-1">Mark routes as popular in the "All Routes" page</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routes.map((route) => (
                        <div key={route._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            {/* Decorative Star Background */}
                            <div className="absolute -right-4 -top-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                                <Star size={120} fill="currentColor" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                        {getRouteIcon(route.type)}
                                    </div>
                                    <button 
                                        onClick={() => togglePopular(route)}
                                        className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <MapPin size={14} className="text-blue-600" />
                                            <div className="w-0.5 h-4 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                            <Navigation size={14} className="text-green-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{route.fromCity}</span>
                                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{route.toCity}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Price</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                <span className="uppercase text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mr-2">{route.type}</span>
                                                ₹{route.price}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{route.travelTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
