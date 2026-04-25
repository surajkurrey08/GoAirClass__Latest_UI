import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Tag, Image as ImageIcon, Sparkles, Calendar, Target, 
    ArrowLeft, Loader2, Save, RefreshCw, Globe
} from 'lucide-react';
import { createCoupon } from '../../../services/couponService';
import { toast } from 'react-toastify';

export default function CreateCoupon() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        title: 'Book Your Journey',
        subtitle: 'Experience comfort and luxury',
        discountText: '10% OFF',
        buttonText: 'Book Now',
        discountType: 'percentage',
        discountValue: 10,
        minBookingAmount: 0,
        totalUsageLimit: 1000,
        validFrom: new Date().toISOString().split('T')[0],
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
        applicableOn: 'All',
        isGlobal: true
    });

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

    const generateCode = () => {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        setFormData(prev => ({ ...prev, code }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (imageFile) data.append('image', imageFile);
            await createCoupon(data);
            toast.success('Banner created!');
            navigate('/admin/marketing/coupons');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Simple Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Coupon Banner</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Side */}
                <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                    {/* Content Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <Tag className="text-blue-600" size={20} /> Banner Content
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Coupon Code</label>
                                <div className="relative">
                                    <input name="code" value={formData.code} onChange={handleInputChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold" placeholder="GOAIR20" required />
                                    <button type="button" onClick={generateCode} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600"><RefreshCw size={16} /></button>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Discount Text</label>
                                <input name="discountText" value={formData.discountText} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Flat 200 OFF" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Title</label>
                                <input name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subtitle</label>
                                <input name="subtitle" value={formData.subtitle} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div className="space-y-1 pt-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Background Image</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                                <ImageIcon size={24} className="text-slate-400 mb-2" />
                                <span className="text-xs font-medium text-slate-500">Upload Banner Image</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <Target className="text-blue-600" size={20} /> Settings & Validity
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Valid From</label>
                                <input type="date" name="validFrom" value={formData.validFrom} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Valid Till</label>
                                <input type="date" name="validTill" value={formData.validTill} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl" />
                            </div>
                            <div className="flex items-center gap-8 col-span-2 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.isGlobal} onChange={(e) => setFormData(prev => ({ ...prev, isGlobal: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                                    <span className="text-sm font-bold text-slate-600">Show on Home Page</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.status === 'Active'} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Inactive' }))} className="w-4 h-4 text-emerald-600 rounded" />
                                    <span className="text-sm font-bold text-slate-600">Status Active</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {loading ? 'Creating...' : 'Publish Banner'}
                    </button>
                </form>

                {/* Preview Side */}
                <div className="lg:col-span-5">
                    <div className="sticky top-6 space-y-4">
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-white/10">
                            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-400" /> Live Preview
                            </h3>

                            {/* Banner Mockup */}
                            <div className="relative aspect-[16/10] w-full rounded-3xl bg-slate-800 overflow-hidden flex flex-col shadow-2xl border border-white/5">
                                {imagePreview ? (
                                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Preview" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                
                                <div className="relative mt-auto p-6 space-y-3">
                                    <div className="inline-block px-2 py-0.5 bg-amber-400 text-slate-900 rounded-md text-[9px] font-black uppercase">LIVE OFFER</div>
                                    <h2 className="text-xl font-black text-white leading-tight">{formData.title}</h2>
                                    <p className="text-white/60 text-xs font-medium">{formData.subtitle}</p>
                                    <div className="text-2xl font-black text-white tracking-tighter">{formData.discountText}</div>
                                    
                                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-white/40 uppercase">Code</span>
                                            <span className="text-amber-400 font-bold text-sm tracking-widest uppercase">{formData.code || 'XXXXXX'}</span>
                                        </div>
                                        <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30">
                                            {formData.buttonText}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest px-2">
                                <span>Home Page: {formData.isGlobal ? 'Yes' : 'No'}</span>
                                <span>Status: {formData.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
