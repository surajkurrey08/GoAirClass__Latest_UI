import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Edit3, Trash2, Loader2, Star, Globe, Navigation } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { adminListDestinations, deleteDestination, updateDestination } from '../../../../services/destinationService.js';
import { toast } from 'react-toastify';

export default function AllDestinations() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadDestinations();
    }, []);

    const loadDestinations = async () => {
        setLoading(true);
        try {
            const data = await adminListDestinations();
            setDestinations(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination?')) return;
        try {
            await deleteDestination(id);
            toast.success('Deleted successfully');
            loadDestinations();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleStatus = async (dest) => {
        try {
            await updateDestination(dest._id, { status: !dest.status });
            toast.success(`Destination ${!dest.status ? 'activated' : 'deactivated'}`);
            loadDestinations();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filtered = destinations.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.to.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Top Destinations</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage featured destination cards for homepage</p>
                    </div>
                </div>
                
                <Link 
                    to="/admin/marketing/destinations/create"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={18} /> Add Destination
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text"
                    placeholder="Search destinations..."
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading destinations...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200">
                    <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900">No Destinations Found</h3>
                    <p className="text-slate-500">Start by adding a new featured destination.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((dest) => (
                        <div key={dest._id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
                            <div className="relative h-48">
                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold">
                                        <Navigation size={12} /> {dest.from} → {dest.to}
                                    </div>
                                </div>
                                {dest.isPopular && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                        <Star size={10} fill="currentColor" /> Popular
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</span>
                                        <span className="text-sm font-bold text-slate-700">{dest.distance} KM</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                        <button 
                                            onClick={() => toggleStatus(dest)}
                                            className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                dest.status ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {dest.status ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-slate-50 dark:border-slate-700">
                                    <button 
                                        onClick={() => navigate(`/admin/marketing/destinations/edit/${dest._id}`)}
                                        className="flex-1 py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(dest._id)}
                                        className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
