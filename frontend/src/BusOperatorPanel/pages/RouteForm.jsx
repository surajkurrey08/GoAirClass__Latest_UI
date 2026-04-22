import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Save, 
    MapPin, 
    Navigation, 
    TrendingUp, 
    Clock,
    Search,
    ArrowLeftRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    fetchRouteById, 
    createRoute, 
    updateRoute, 
    fetchCities 
} from '../../services/auth';
import { toast } from 'react-toastify';
import SearchableCityInput from '../components/SearchableCityInput';

const RouteForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        fromCity: '',
        toCity: '',
        distance: '',
        travelTime: '',
    });
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);

    useEffect(() => {
        loadCities();
        if (isEdit) {
            loadRouteDetails();
        }
    }, [id]);

    const loadCities = async () => {
        try {
            const data = await fetchCities();
            setCities(data);
        } catch (error) {
            console.error("Cities Fetch Error:", error);
        }
    };

    const loadRouteDetails = async () => {
        try {
            const route = await fetchRouteById(id);
            setFormData({
                fromCity: route.fromCity,
                toCity: route.toCity,
                distance: route.distance,
                travelTime: route.travelTime,
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSwap = () => {
        setIsSwapping(true);
        setFormData(prev => ({
            ...prev,
            fromCity: prev.toCity,
            toCity: prev.fromCity
        }));
        setTimeout(() => setIsSwapping(false), 500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await updateRoute(id, formData);
                toast.success("Route updated successfully");
            } else {
                await createRoute(formData);
                toast.success("Route defined successfully");
            }
            navigate('/bus-operator/routes');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-12 animate-fadeIn">
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/bus-operator/routes')}
                        className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm hover:shadow-md group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                            {isEdit ? 'Modify Route' : 'Define Route'}
                        </h1>
                        <p className="text-slate-500 font-medium">Create high-performance travel paths for your fleet.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative bg-white p-12 rounded-[48px] border border-slate-50 shadow-[0_20px_70px_rgba(0,0,0,0.03)] space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 relative">
                    
                    {/* Swap Button - Positioned between origin and destination */}
                    <div className="hidden md:flex absolute left-1/2 top-[60px] -translate-x-1/2 z-10">
                        <button 
                            type="button"
                            onClick={handleSwap}
                            className={`p-4 bg-white border border-slate-100 rounded-full shadow-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 ${isSwapping ? 'rotate-180' : ''} duration-500`}
                        >
                            <ArrowLeftRight size={20} />
                        </button>
                    </div>

                    {/* Origin City */}
                    <SearchableCityInput 
                        label="Origin City"
                        placeholder="Where are we starting?"
                        icon={MapPin}
                        value={formData.fromCity}
                        onChange={(val) => setFormData({...formData, fromCity: val})}
                        cities={cities}
                    />

                    {/* Destination City */}
                    <SearchableCityInput 
                        label="Destination City"
                        placeholder="Where are we going?"
                        icon={Navigation}
                        value={formData.toCity}
                        onChange={(val) => setFormData({...formData, toCity: val})}
                        cities={cities}
                        className="text-green-600"
                    />

                    {/* Distance */}
                    <div className="group space-y-3">
                        <div className="flex items-center gap-2 text-slate-500 group-focus-within:text-blue-600 transition-colors">
                            <TrendingUp size={16} className="opacity-70" />
                            <label className="text-[10px] font-black uppercase tracking-[0.2em]">Distance (KM)</label>
                        </div>
                        <input 
                            type="number" 
                            required
                            placeholder="e.g. 450"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:border-blue-600/10 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                            value={formData.distance}
                            onChange={(e) => setFormData({...formData, distance: e.target.value})}
                        />
                    </div>

                    {/* Estimated Duration */}
                    <div className="group space-y-3">
                        <div className="flex items-center gap-2 text-slate-500 group-focus-within:text-blue-600 transition-colors">
                            <Clock size={16} className="opacity-70" />
                            <label className="text-[10px] font-black uppercase tracking-[0.2em]">Estimated Duration</label>
                        </div>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. 8h 30m"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:border-blue-600/10 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                            value={formData.travelTime}
                            onChange={(e) => setFormData({...formData, travelTime: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-50 flex items-center justify-between gap-6">
                    <div className="hidden lg:block">
                        <p className="text-xs text-slate-400 font-medium max-w-xs"> Ensure all fields are accurate before saving. Routes are used for live scheduling. </p>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 md:flex-none md:min-w-[280px] flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[28px] font-black shadow-2xl shadow-slate-900/20 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        <Save size={22} className={loading ? 'animate-pulse' : ''} />
                        {loading ? 'Processing...' : (isEdit ? 'Save Route Changes' : 'Define Route Path')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RouteForm;

