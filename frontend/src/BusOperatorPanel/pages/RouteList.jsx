import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MapPin,
    Navigation,
    Clock,
    Edit,
    Trash2,
    Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    fetchMyRoutes,
    deleteMyRoute
} from '../../services/operatorService';
import { toast } from 'react-toastify';

const RouteList = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const getRoutes = async () => {
        try {
            setLoading(true);
            const data = await fetchMyRoutes();
            setRoutes(data);
        } catch (error) {
            console.error("Fetch Routes Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRoutes();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this route?")) return;
        try {
            await deleteMyRoute(id);
            toast.success("Route deleted successfully");
            getRoutes();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.fromCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.toCity.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Route Network</h1>
                    <p className="text-slate-500 font-medium">Define your travel paths and optimize trip durations.</p>
                </div>
                <button
                    onClick={() => navigate('/bus-operator/routes/add')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                    Define New Route
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search cities..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_60px_rgba(0,0,0,0.02)] overflow-hidden animate-fadeIn">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-20">#</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Route Origin</th>
                                    <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-10"></th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Destination</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Distance</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stops</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRoutes.length > 0 ? filteredRoutes.map((route, index) => (
                                    <tr key={route._id} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-400 tabular-nums">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                                                    <MapPin size={18} />
                                                </div>
                                                <span className="text-base font-black text-slate-800 tracking-tight">{route.fromCity}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-center">
                                            <div className="flex items-center justify-center text-slate-200 group-hover:text-blue-200 transition-colors">
                                                ➔
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors">
                                                    <Navigation size={18} />
                                                </div>
                                                <span className="text-base font-black text-slate-800 tracking-tight">{route.toCity}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800">{route.distance} KM</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={10} /> {route.travelTime}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {[...Array(Math.min(route.stops?.length || 0, 3))].map((_, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                                                            <Map size={10} />
                                                        </div>
                                                    ))}
                                                    {(route.stops?.length || 0) > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">
                                                            +{route.stops.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">
                                                    {route.stops?.length || 0} Stops
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    route.isActive 
                                                        ? 'bg-green-50 text-green-600' 
                                                        : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {route.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {!route.operatorId && (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        Global
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {route.operatorId && (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => navigate(`/bus-operator/routes/edit/${route._id}`)}
                                                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg rounded-2xl transition-all"
                                                        title="Edit Route"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(route._id)}
                                                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg rounded-2xl transition-all"
                                                        title="Delete Route"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                    <Search size={32} />
                                                </div>
                                                <p className="text-slate-400 font-bold">No routes found matching your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default RouteList;
