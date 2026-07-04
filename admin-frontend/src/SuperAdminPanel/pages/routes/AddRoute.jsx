import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Save, MapPin, Navigation, 
    TrendingUp, Clock, Info, ArrowLeftRight 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchGlobalCities, createGlobalRoute, updateGlobalRoute, fetchGlobalRoutes } from '../../../services/adminBus';
import { toast } from 'react-toastify';
import SearchableCityInput from '../../components/inputs/SearchableCityInput';

export default function AddRoute() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        fromCity: '',
        toCity: '',
        distance: '',
        travelTime: '',
        isPopular: false
    });
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const citiesData = await fetchGlobalCities();
                setCities(citiesData || []);

                if (isEdit) {
                    const res = await fetchGlobalRoutes({ id });
                    if (res.success && res.routes.length > 0) {
                        const route = res.routes[0];
                        setFormData({
                            fromCity: route.fromCity,
                            toCity: route.toCity,
                            distance: route.distance,
                            travelTime: route.travelTime,
                            isPopular: route.isPopular
                        });
                    }
                }
            } catch (error) {
                toast.error("Failed to load cities");
            }
        };
        loadInitialData();
    }, [id]);

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
        
        // Basic Validation
        if (formData.fromCity === formData.toCity) {
            return toast.error("Origin and Destination cannot be the same");
        }

        setLoading(true);
        try {
            if (isEdit) {
                await updateGlobalRoute(id, formData);
                toast.success("Route updated successfully");
            } else {
                await createGlobalRoute(formData);
                toast.success("Route defined and activated");
            }
            navigate('/super-admin/buses/routes/all');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {isEdit ? 'Edit Connection' : 'Define New Route'}
                        </h1>
                        <p className="text-slate-500 font-medium">Establish a verified travel path for your network</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-12">
                    
                    {/* City Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 relative">
                        {/* Swap Button */}
                        <div className="hidden md:flex absolute left-1/2 top-[55px] -translate-x-1/2 z-10">
                            <button 
                                type="button"
                                onClick={handleSwap}
                                className={`p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-lg text-slate-400 hover:text-blue-600 transition-all active:scale-95 duration-500 ${isSwapping ? 'rotate-180' : ''}`}
                            >
                                <ArrowLeftRight size={18} />
                            </button>
                        </div>

                        <SearchableCityInput 
                            label="Origin City"
                            placeholder="e.g. Mumbai"
                            icon={MapPin}
                            value={formData.fromCity}
                            onChange={(val) => setFormData({...formData, fromCity: val})}
                            cities={cities}
                        />

                        <SearchableCityInput 
                            label="Destination City"
                            placeholder="e.g. Pune"
                            icon={Navigation}
                            value={formData.toCity}
                            onChange={(val) => setFormData({...formData, toCity: val})}
                            cities={cities}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Distance & Time */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <TrendingUp size={12} /> Distance (KM)
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. 450 KM"
                                    value={formData.distance}
                                    onChange={(e) => setFormData({...formData, distance: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-2 focus:ring-blue-600/10 outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <Clock size={12} /> Estimated Duration
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. 8h 30m"
                                    value={formData.travelTime}
                                    onChange={(e) => setFormData({...formData, travelTime: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-2 focus:ring-blue-600/10 outline-none"
                                />
                            </div>
                        </div>

                        {/* Popular Toggle & Info */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] flex flex-col justify-between space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">Mark as Popular</p>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Highlight this route in search results</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, isPopular: !formData.isPopular})}
                                    className={`w-14 h-8 rounded-full transition-all relative ${formData.isPopular ? 'bg-amber-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.isPopular ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex gap-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-white dark:border-slate-800">
                                <Info size={20} className="text-blue-500 shrink-0" />
                                <p className="text-[10px] leading-relaxed text-slate-500 font-medium italic">
                                    Predefined routes ensure that all operators use validated travel paths, improving search accuracy and platform consistency.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end pt-8 border-t border-slate-50 dark:border-slate-800">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 dark:bg-blue-600 text-white px-12 py-5 rounded-[28px] font-black shadow-2xl shadow-slate-900/20 hover:-translate-y-1 transition-all disabled:opacity-50"
                        >
                            <Save size={22} className={loading ? 'animate-pulse' : ''} />
                            {loading ? 'Processing...' : (isEdit ? 'Update Route Network' : 'Activate Route connection')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
