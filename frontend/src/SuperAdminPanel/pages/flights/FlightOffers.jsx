import React from 'react';
import { Tag, Calendar, Users, Plus, Trash2, Search, Percent } from 'lucide-react';

const CouponCard = ({ code, discount, expiry, usage, status, type }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden group">
        <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600">
                    <Tag size={20} />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                    {status}
                </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                {code}
            </h3>
            <p className="text-sm font-bold text-slate-500 mb-4">{type} Discount</p>
            
            <div className="space-y-3 mb-6 text-xs font-bold">
                <div className="flex items-center justify-between">
                    <span className="text-slate-400">Discount</span>
                    <span className="text-slate-700 dark:text-slate-200">{discount}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expiry</span>
                    <span className="text-slate-700 dark:text-slate-200">{expiry}</span>
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-all">
                    Edit
                </button>
            </div>
        </div>
    </div>
);

export default function FlightOffers() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Flight Offers & Coupons</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create discount codes and promotional campaigns.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <Plus size={18} /> Create New Coupon
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <CouponCard code="FLYINDIGO20" discount="20% OFF" expiry="31 DEC 2026" usage="500/1000" status="Active" type="Airline Specific" />
                <CouponCard code="WELCOMEGAC" discount="₹500 OFF" expiry="Ongoing" usage="Unlimited" status="Active" type="First Booking" />
            </div>
        </div>
    );
}
