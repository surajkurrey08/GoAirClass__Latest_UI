import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Tag,
    Search,
    Calendar,
    Percent,
    BarChart3,
    Trash2,
    ToggleLeft as Toggle,
    Info,
    ArrowUpRight,
    MousePointer2,
    Clock
} from 'lucide-react';
import {
    fetchMyCoupons,
    deleteCoupon
} from '../../services/operatorService';
import { toast } from 'react-toastify';

const CouponList = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const getCoupons = async () => {
        try {
            setLoading(true);
            const data = await fetchMyCoupons();
            // Handle both direct array and wrapped object responses
            setCoupons(Array.isArray(data) ? data : (data.coupons || []));
        } catch (error) {
            console.error("Fetch Coupons Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCoupons();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await deleteCoupon(id);
            toast.success("Coupon deleted");
            getCoupons();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredCoupons = (Array.isArray(coupons) ? coupons : []).filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Coupons & Offers</h1>
                    <p className="text-slate-500 font-medium">Create targeted discounts to drive higher booking volume.</p>
                </div>
                <button 
                    onClick={() => navigate('create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                    Create New Coupon
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by coupon code..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCoupons.map((coupon) => (
                        <div key={coupon._id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                            {/* Card Header */}
                            <div className="p-6 pb-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight">{coupon.code}</h3>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${coupon.status === 'Active' ? 'text-green-500' : 'text-red-500'
                                                }`}>
                                                {coupon.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-slate-800">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discount</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <Info size={14} className="text-slate-300" />
                                        {coupon.description || 'No description provided'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                        <Calendar size={14} className="text-slate-300" />
                                        Till {new Date(coupon.validTill).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Strip */}
                            <div className="bg-slate-50 px-6 py-4 flex gap-4 border-t border-b border-slate-100">
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Uses</p>
                                    <p className="text-sm font-black text-slate-700">{coupon.analytics?.totalTimesUsed || 0}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-black text-slate-700">₹{coupon.analytics?.revenueGenerated || 0}</span>
                                        <ArrowUpRight size={12} className="text-green-500" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversion</p>
                                    <p className="text-sm font-black text-slate-700">
                                        {coupon.analytics?.totalTimesUsed > 0 ? ((coupon.analytics.totalTimesUsed / coupon.totalUsageLimit) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 flex gap-2">
                                <button className="flex-grow py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                                    Edit Rules
                                </button>
                                <button
                                    onClick={() => handleDelete(coupon._id)}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl border border-slate-50"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CouponList;
