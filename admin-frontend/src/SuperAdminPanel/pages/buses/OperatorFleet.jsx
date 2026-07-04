import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Building2, Bus, MapPin, 
    ShieldCheck, Loader2, AlertCircle, Phone, Mail
} from 'lucide-react';
import { fetchOperatorById } from '../../../services/adminBus';
import BusTable from './components/BusTable';
import { toast } from 'react-toastify';

export default function OperatorFleet() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [operator, setOperator] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOperator = async () => {
            try {
                const res = await fetchOperatorById(id);
                if (res.success) setOperator(res.operator);
            } catch (error) {
                toast.error(error.message);
                navigate('/super-admin/buses/operators');
            } finally {
                setLoading(false);
            }
        };
        loadOperator();
    }, [id]);

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
                    Retrieving Fleet Data...
                </p>
            </div>
        );
    }

    if (!operator) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 text-2xl font-black">
                            {operator.companyName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {operator.companyName}
                                </h1>
                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 text-[10px] font-black uppercase tracking-widest">
                                    Trusted Partner
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-blue-500" />
                                    {operator.name}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest border-l pl-4 border-slate-200">
                                    <Phone size={14} className="text-indigo-500" />
                                    {operator.contactNumber}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest border-l pl-4 border-slate-200">
                                    <Mail size={14} className="text-rose-500" />
                                    {operator.email}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fleet View */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-8">
                    <Bus size={20} className="text-blue-600" />
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Live Operational Fleet</h2>
                </div>
                
                <BusTable operatorId={id} />
            </div>
        </div>
    );
}
