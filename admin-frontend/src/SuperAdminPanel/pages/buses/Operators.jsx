import React, { useState, useEffect } from 'react';
import { 
    Users, UserPlus, Search, Filter, Mail, Phone, 
    ShieldCheck, MoreVertical, Ban, CheckCircle, 
    Loader2, AlertCircle, Building2, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllOperators } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function Operators() {
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadOperators = async () => {
        setLoading(true);
        try {
            const res = await fetchAllOperators();
            if (res.success) setOperators(res.operators);
        } catch (error) {
            toast.error(error.message || 'Failed to load operators');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOperators();
    }, []);

    const filteredOperators = operators.filter(op => 
        op.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
                    Accessing Operator Registry...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                        <Building2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bus Operators</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage partner companies and their system access</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find by company or name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 shadow-sm w-full md:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOperators.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-slate-100 dark:border-slate-800 border shadow-sm">
                        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No operators matched your search</p>
                    </div>
                ) : (
                    filteredOperators.map((operator) => (
                        <div key={operator._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white dark:border-slate-800 overflow-hidden group hover:border-indigo-200 transition-all duration-300">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                        {operator.companyName.charAt(0)}
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        operator.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                        {operator.status}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{operator.companyName}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{operator.name}</p>

                                <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <Mail size={16} />
                                        <span className="text-sm font-semibold truncate">{operator.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <Phone size={16} />
                                        <span className="text-sm font-semibold">{operator.contactNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-gray-500">
                                <Link 
                                    to={`/super-admin/buses/operators/${operator._id}/fleet`}
                                    className="text-xs font-black uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-2"
                                >
                                    View Fleet <ChevronRight size={14} />
                                </Link>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><Ban size={16} /></button>
                                    <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><MoreVertical size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
