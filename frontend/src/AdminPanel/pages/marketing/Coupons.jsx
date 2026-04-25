import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Tag, Calendar, Edit3, Trash2, Loader2, AlertCircle, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { adminListCoupons, deleteCoupon } from '../../../services/couponService';
import { toast } from 'react-toastify';

export default function Coupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const data = await adminListCoupons();
            setCoupons(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await deleteCoupon(id);
            toast.success('Coupon deleted successfully');
            loadCoupons();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Tag size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Promotional Coupons</h1>
                        <p className="text-slate-500 font-medium mt-1">Design and manage visual banner coupons for the platform</p>
                    </div>
                </div>
                
                <Link 
                    to="/admin/marketing/coupons/create"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-sm"
                >
                    <Plus size={18} /> Create New Banner
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by code or title..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 px-6 py-4 rounded-[1.5rem] shadow-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
                    <Filter size={20} /> Filters
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading your promotional campaigns...</p>
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 text-center px-6">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-slate-300">
                        <Tag size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Coupons Found</h3>
                    <p className="text-slate-500 max-w-sm mt-2 font-medium">Get started by creating your first visual banner coupon to drive more sales.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCoupons.map((coupon) => (
                        <div key={coupon._id} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 relative overflow-hidden">
                            <div className="flex gap-6">
                                {/* Banner Thumbnail */}
                                <div className="w-32 h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 relative">
                                    {coupon.image ? (
                                        <img src={coupon.image} alt={coupon.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Tag size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                                        {coupon.code}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{coupon.title || 'Untitled Campaign'}</h3>
                                            <p className="text-sm text-slate-500 font-medium truncate">{coupon.subtitle}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            coupon.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {coupon.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center gap-4">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl">
                                            <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg">{coupon.discountText || `${coupon.discountValue}% OFF`}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Until</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {new Date(coupon.validTill).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center gap-3">
                                        <button 
                                            onClick={() => navigate(`/admin/marketing/coupons/edit/${coupon._id}`)}
                                            className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(coupon._id)}
                                            className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="flex-1" />
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Created {new Date(coupon.createdAt).toLocaleDateString()}</span>
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
