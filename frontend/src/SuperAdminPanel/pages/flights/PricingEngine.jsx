import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Tag, Plus, Search, Filter, MoreVertical, 
    Edit2, Trash2, Globe, Plane, Navigation,
    ArrowRight, Percent, DollarSign, ShieldCheck
} from 'lucide-react';
import { getPricingRules, deletePricingRule } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const RuleCard = ({ rule, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                    rule.applyOn === 'Global' ? 'bg-indigo-50 text-indigo-600' :
                    rule.applyOn === 'Airline' ? 'bg-blue-50 text-blue-600' :
                    'bg-emerald-50 text-emerald-600'
                }`}>
                    {rule.applyOn === 'Global' ? <Globe size={20} /> :
                     rule.applyOn === 'Airline' ? <Plane size={20} /> :
                     <Navigation size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{rule.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Applied on {rule.applyOn}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                    <Edit2 size={16} />
                </button>
                <button 
                    onClick={() => onDelete(rule._id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <span className="text-xs font-bold text-slate-500">MARKUP</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                    {rule.markupType === 'Percentage' ? `${rule.markupValue}%` : `₹${rule.markupValue}`}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Conv. Fee</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">₹{rule.convenienceFee}</p>
                </div>
                <div className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Service Fee</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">₹{rule.serviceFee}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{rule.userType}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                    rule.status ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                    {rule.status ? 'ACTIVE' : 'INACTIVE'}
                </span>
            </div>
        </div>
    </div>
);

export default function PricingEngine() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await getPricingRules();
            setRules(data.rules);
        } catch (error) {
            toast.error('Failed to load pricing rules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this pricing rule?')) {
            try {
                await deletePricingRule(id);
                toast.success('Rule deleted');
                fetchRules();
            } catch (error) {
                toast.error('Failed to delete rule');
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Engine</h1>
                    <p className="text-slate-500 dark:text-slate-400">Configure global markups, fees and dynamic pricing rules.</p>
                </div>
                <Link 
                    to="/super-admin/flights/add-pricing"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} /> New Pricing Rule
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
                    ))
                ) : rules.length > 0 ? (
                    rules.map(rule => (
                        <RuleCard key={rule._id} rule={rule} onDelete={handleDelete} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Tag size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Pricing Rules Found</h2>
                        <p className="text-slate-500 max-w-sm mx-auto">Click the button above to create your first pricing rule for flights.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
