import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Save, 
    MapPin, 
    Navigation, 
    TrendingUp, 
    Clock,
    ArrowLeftRight,
    Plus,
    X,
    Map
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    fetchMyRouteById, 
    createMyRoute, 
    updateMyRoute 
} from '../../services/operatorService';
import { fetchCities } from '../../services/busService';
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
        stops: [],
        isActive: true
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
            const route = await fetchMyRouteById(id);
            setFormData({
                fromCity: route.fromCity,
                toCity: route.toCity,
                distance: route.distance,
                travelTime: route.travelTime,
                stops: route.stops || [],
                isActive: route.isActive ?? true
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

    const addStop = () => {
        setFormData({
            ...formData,
            stops: [...formData.stops, { city: '', arrivalTime: '', departureTime: '' }]
        });
    };

    const updateStop = (index, field, value) => {
        const newStops = [...formData.stops];
        newStops[index][field] = value;
        setFormData({ ...formData, stops: newStops });
    };

    const removeStop = (index) => {
        setFormData({
            ...formData,
            stops: formData.stops.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.fromCity === formData.toCity) {
            return toast.error("Origin and Destination cannot be the same");
        }

        if (Number(formData.distance) <= 0) {
            return toast.error("Distance must be greater than 0");
        }

        setLoading(true);

        try {
            if (isEdit) {
                await updateMyRoute(id, formData);
                toast.success("Route updated successfully");
            } else {
                await createMyRoute(formData);
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Core Details Card */}
                <div className="bg-white p-12 rounded-[48px] border border-slate-50 shadow-[0_20px_70px_rgba(0,0,0,0.03)] space-y-12">
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
                </div>

                {/* Stops Section Card */}
                <div className="bg-white p-12 rounded-[48px] border border-slate-50 shadow-[0_20px_70px_rgba(0,0,0,0.03)] space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                <Map size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Intermediate Stops</h2>
                                <p className="text-xs text-slate-400 font-medium">Add cities where the bus will stop along this route.</p>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={addStop}
                            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            <Plus size={18} />
                            Add Stop
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.stops.length === 0 ? (
                            <div className="py-12 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-slate-300 gap-2">
                                <Map size={32} className="opacity-20" />
                                <p className="text-sm font-bold">No stops added yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {formData.stops.map((stop, index) => (
                                    <div key={index} className="group relative bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-blue-600/5 border border-transparent hover:border-blue-100 p-6 rounded-[32px] transition-all flex flex-col md:flex-row gap-6 items-center animate-fadeIn">
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stop City</label>
                                                <input 
                                                    type="text"
                                                    required
                                                    placeholder="City Name"
                                                    className="w-full px-5 py-3 bg-white/50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                                    value={stop.city}
                                                    onChange={(e) => updateStop(index, 'city', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Time</label>
                                                <input 
                                                    type="time"
                                                    required
                                                    className="w-full px-5 py-3 bg-white/50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                                    value={stop.arrivalTime}
                                                    onChange={(e) => updateStop(index, 'arrivalTime', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure Time</label>
                                                <input 
                                                    type="time"
                                                    required
                                                    className="w-full px-5 py-3 bg-white/50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                                    value={stop.departureTime}
                                                    onChange={(e) => updateStop(index, 'departureTime', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeStop(index)}
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer section */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${formData.isActive ? 'bg-green-500' : 'bg-slate-200'}`} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.isActive ? 'right-1' : 'left-1'}`} />
                            </div>
                            <span className="text-sm font-bold text-slate-600">Route Active</span>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="md:min-w-[280px] flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[28px] font-black shadow-2xl shadow-slate-900/20 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
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

