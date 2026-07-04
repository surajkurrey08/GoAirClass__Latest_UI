import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, UserX, AlertCircle, 
    Terminal, Lock, Eye, 
    MoreHorizontal, Loader2, Search,
    RefreshCw, Filter, Ban, CheckCircle, Info
} from 'lucide-react';
import { fetchFraudAlerts, processFraudAction } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function FraudAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const res = await fetchFraudAlerts();
            if (res.success) setAlerts(res.alerts);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this alert?`)) return;
        try {
            const res = await processFraudAction(id, action);
            if (res.success) {
                toast.success(`Action '${action}' processed successfully`);
                loadAlerts();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getRiskStyle = (level) => {
        switch (level) {
            case 'High': return 'bg-red-500 text-white shadow-red-500/20';
            case 'Medium': return 'bg-amber-500 text-white shadow-amber-500/20';
            default: return 'bg-blue-500 text-white shadow-blue-500/20';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/40">
                            <ShieldAlert size={24} />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Fraud Analytics</h1>
                    </div>
                    <p className="text-slate-400 font-medium max-w-lg">Monitoring suspicious transaction patterns and protecting the platform integrity through real-time heuristic triggers.</p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <button 
                    onClick={loadAlerts}
                    className="relative z-10 flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-3xl text-sm font-black transition-all backdrop-blur-xl border border-white/10 active:scale-95"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Scan Network
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
                        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Encrypted Scan in Progress</p>
                        <p className="text-[10px] text-slate-300 font-medium animate-pulse italic">Scanning Device IDs, IP Signatures, and Booking Frequency...</p>
                    </div>
                </div>
            ) : alerts.length === 0 ? (
                <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle size={48} className="text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Network Secure</h3>
                    <p className="text-slate-400 font-medium">No suspicious activity detected in the current booking cycle.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {alerts.map((alert) => (
                        <div key={alert._id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all">
                            <div className="p-8 flex-grow space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className={`p-2 w-fit rounded-xl shadow-lg mb-4 ${getRiskStyle(alert.riskLevel)}`}>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{alert.riskLevel} Risk Alert</span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">#{alert.booking?.pnrNumber || 'N/A'}</h3>
                                        <p className="text-xs font-bold text-slate-500">{alert.user?.name || 'Anonymous User'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            alert.status === 'Open' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-50 dark:border-slate-800 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-white dark:bg-slate-900 rounded-xl text-red-500 shadow-sm">
                                            <AlertCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-red-500">Threat Identified</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{alert.reason}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">IP Address</p>
                                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 text-center font-mono">192.168.1.1</p>
                                        </div>
                                        <div className="border-l border-slate-200 dark:border-slate-700">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Payment</p>
                                            <p className="text-[11px] font-black text-slate-700 dark:text-slate-300 text-center">₹{alert.booking?.totalFare || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                <button 
                                    onClick={() => handleAction(alert._id, 'ignore')}
                                    className="flex-grow py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                                >
                                    False Positive
                                </button>
                                <button 
                                    onClick={() => handleAction(alert._id, 'block')}
                                    className="flex-grow py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95"
                                >
                                    Block & Terminate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Legend/Info */}
            <div className="flex items-center gap-4 text-slate-400 p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                <Info size={24} />
                <p className="text-xs font-medium italic">
                    Risk levels are calculated based on velocity checks, session consistency, and historical payment failure rates. High risk alerts require immediate manual review.
                </p>
            </div>
        </div>
    );
}
