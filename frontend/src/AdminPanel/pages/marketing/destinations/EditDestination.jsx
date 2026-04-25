import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    MapPin, Image as ImageIcon, Sparkles, Navigation, 
    ArrowLeft, Loader2, Save, Star
} from 'lucide-react';
import { adminListDestinations, updateDestination } from '../../../../services/destinationService.js';
import { toast } from 'react-toastify';

export default function EditDestination() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        distance: '',
        duration: '',
        description: '',
        isPopular: false,
        status: true
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setFetching(true);
        try {
            const all = await adminListDestinations();
            const dest = all.find(d => d._id === id);
            if (!dest) {
                toast.error('Destination not found');
                navigate('/admin/marketing/destinations');
                return;
            }
            setFormData(dest);
            if (dest.image) setImagePreview(dest.image);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (!['_id', 'createdAt', 'updatedAt', '__v'].includes(key)) {
                    data.append(key, formData[key]);
                }
            });
            if (imageFile) data.append('image', imageFile);

            await updateDestination(id, data);
            toast.success('Destination updated successfully!');
            navigate('/admin/marketing/destinations');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading destination details...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Destination</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-blue-600">
                            <MapPin size={20} /> Route Details
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">

                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Destination Name</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Distance (KM)</label>
                                <input type="number" name="distance" value={formData.distance} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Travel Time</label>
                                <input name="duration" value={formData.duration} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div className="space-y-1 pt-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Change Image</label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative">
                                {imagePreview && (
                                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Preview" />
                                )}
                                <div className="relative flex flex-col items-center">
                                    <ImageIcon size={32} className="text-slate-400 mb-2" />
                                    <span className="text-xs font-bold text-slate-500">{imagePreview ? 'Update Image' : 'Upload Image'}</span>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-blue-600">
                            <Sparkles size={20} /> Visibility & Extras
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl cursor-pointer">
                                <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded-lg" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">Popular Destination</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Show Star Badge</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl cursor-pointer">
                                <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} className="w-5 h-5 text-emerald-600 rounded-lg" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">Active Status</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visible to Users</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>

                <div className="lg:col-span-5">
                    <div className="sticky top-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-white/10 overflow-hidden">
                            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-400" /> Card Appearance
                            </h3>

                            <div className="relative aspect-[4/5] w-64 mx-auto rounded-[2rem] bg-slate-800 overflow-hidden flex flex-col shadow-2xl border border-white/5">
                                {imagePreview ? (
                                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                                
                                <div className="relative mt-auto p-6 space-y-2">
                                    {formData.isPopular && (
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-900 rounded-full text-[8px] font-black uppercase tracking-wider">
                                            <Star size={8} fill="currentColor" /> POPULAR
                                        </div>
                                    )}
                                    <h2 className="text-xl font-black text-white leading-tight">{formData.name}</h2>
                                    <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold">
                                        <Navigation size={10} /> {formData.name}
                                    </div>
                                    <div className="pt-2 flex items-center justify-between">
                                        <span className="text-white font-black text-sm">{formData.distance} KM</span>
                                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white text-[10px] font-bold">
                                            Explore
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
