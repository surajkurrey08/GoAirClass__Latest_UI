import React, { useState, useEffect } from 'react';
import { 
    Plus, Bus, ShieldCheck, MapPin, Settings2, 
    Image as ImageIcon, Loader2, Save, Trash2, 
    PlusCircle, Info, Layout
} from 'lucide-react';
import { fetchAllOperators, fetchBusTypes, createAdminBus } from '../../../services/adminBus';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AddBus() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [operators, setOperators] = useState([]);
    const [busTypes, setBusTypes] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);

    const [formData, setFormData] = useState({
        busName: '',
        busType: '',
        busNumber: '',
        totalSeats: '',
        operator: '',
        amenities: [],
        images: [],
        seatLayout: [],
        status: 'active'
    });

    const [currentAmenity, setCurrentAmenity] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [opsRes, typesRes] = await Promise.all([
                    fetchAllOperators(),
                    fetchBusTypes()
                ]);
                if (opsRes.success) setOperators(opsRes.operators);
                if (typesRes.success) setBusTypes(typesRes.types);
            } catch (error) {
                toast.error('Failed to load selection data');
            } finally {
                setFetchingData(false);
            }
        };
        loadInitialData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.operator || !formData.busType) {
            return toast.error('Please select both operator and bus type');
        }

        setLoading(true);
        try {
            const res = await createAdminBus({
                ...formData,
                totalSeats: parseInt(formData.totalSeats)
            });
            if (res.success) {
                toast.success('Bus added to fleet successfully');
                navigate('/super-admin/buses/all');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add bus');
        } finally {
            setLoading(false);
        }
    };

    const addAmenity = () => {
        if (currentAmenity.trim() && !formData.amenities.includes(currentAmenity.trim())) {
            setFormData({
                ...formData, 
                amenities: [...formData.amenities, currentAmenity.trim()]
            });
            setCurrentAmenity('');
        }
    };

    const removeAmenity = (index) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.filter((_, i) => i !== index)
        });
    };

    if (fetchingData) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
                    Preparing Hangar Assets...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expand the Fleet</h1>
                <p className="text-slate-500 font-medium mt-2">Initialize a new bus registration with operator and type configuration</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                                <Bus size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bus Core Identity</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Brand / Bus Name</label>
                                <input 
                                    required
                                    value={formData.busName}
                                    onChange={e => setFormData({...formData, busName: e.target.value})}
                                    placeholder="e.g. Scania Multiaxle"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Registration Number</label>
                                <input 
                                    required
                                    value={formData.busNumber}
                                    onChange={e => setFormData({...formData, busNumber: e.target.value})}
                                    placeholder="MH-12-AS-1234"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Total Seats</label>
                                <input 
                                    required
                                    type="number"
                                    value={formData.totalSeats}
                                    onChange={e => setFormData({...formData, totalSeats: e.target.value})}
                                    placeholder="36"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Seating Config</label>
                                <select 
                                    required
                                    value={formData.busType}
                                    onChange={e => setFormData({...formData, busType: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-bold appearance-none"
                                >
                                    <option value="">Select Type</option>
                                    {busTypes.map(type => (
                                        <option key={type._id} value={type.name}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-600">
                                <Info size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Amenities & Comfort</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input 
                                    value={currentAmenity}
                                    onChange={e => setCurrentAmenity(e.target.value)}
                                    placeholder="Add amenity (e.g. WiFi, Blanket)"
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                    className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
                                />
                                <button 
                                    type="button"
                                    onClick={addAmenity}
                                    className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <PlusCircle size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.amenities.map((amenity, index) => (
                                    <span key={index} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
                                        {amenity}
                                        <button onClick={() => removeAmenity(index)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Submit */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ownership</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Target Operator</label>
                                <select 
                                    required
                                    value={formData.operator}
                                    onChange={e => setFormData({...formData, operator: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-bold appearance-none"
                                >
                                    <option value="">Choose Company</option>
                                    {operators.map(op => (
                                        <option key={op._id} value={op._id}>{op.companyName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex gap-3">
                                    <ImageIcon size={16} className="text-slate-400 mt-1 shrink-0" />
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        Multi-image upload and seat layout configuration available after initial registration.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                        Confirm Registration
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all uppercase tracking-widest text-xs"
                    >
                        Discard Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
