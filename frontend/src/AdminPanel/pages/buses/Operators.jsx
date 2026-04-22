import React, { useState, useEffect } from 'react';
import { fetchAllOperators } from '../../../services/adminBus';
import { Users, Mail, Phone, BadgeCheck, ShieldAlert, Loader2, Search } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Operators() {
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const getOperatorsData = async () => {
            try {
                const res = await fetchAllOperators();
                if (res.success) setOperators(res.operators);
            } catch (err) {
                toast.error('Failed to load operator cohort');
            } finally {
                setLoading(false);
            }
        };
        getOperatorsData();
    }, []);

    const filteredOperators = operators.filter(op => 
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Accessing Partner Network...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Partner Cohort</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage transport operators assigned to your administrative sector</p>
                    </div>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search partners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 shadow-sm w-full transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOperators.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200">
                        <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No assigned operators found</p>
                    </div>
                ) : (
                    filteredOperators.map((op) => (
                        <div key={op._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-white/50 dark:border-slate-800 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform" />
                            
                            <div className="relative space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl border-2 border-white/50">
                                        {op.companyName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{op.companyName}</h3>
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">{op.name}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                        <Mail size={16} className="text-indigo-400" />
                                        {op.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                        <Phone size={16} className="text-indigo-400" />
                                        {op.contactNumber}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${op.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {op.status}
                                    </div>
                                    <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                                        View Fleet
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
