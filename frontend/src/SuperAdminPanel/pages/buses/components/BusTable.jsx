import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, MoreVertical, Eye, Edit2, Trash2, 
    CheckCircle, XCircle, AlertCircle, Ban, Loader2,
    Bus as BusIcon, ShieldCheck, MapPin, Users,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { fetchAllBuses, updateBusStatus, deleteAdminBus } from '../../../../services/adminBus';
import { toast } from 'react-toastify';
import { useAdmin } from '../../../../context/AdminContext.jsx';

const BusTable = ({ statusFilter = '', operatorId = '' }) => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const { refreshPendingCount, user } = useAdmin();
    const isAdmin = user?.role === 'admin';
    const isSuperAdmin = user?.role === 'superadmin';

    const fetchBusesData = async () => {
        setLoading(true);
        try {
            const params = {
                status: statusFilter,
                search: searchTerm,
                operatorId: operatorId
            };
            const res = await fetchAllBuses(params);
            if (res.success) {
                setBuses(res.buses);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load buses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusesData();
    }, [statusFilter]);

    // Simple debounce for search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBusesData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            const res = await updateBusStatus(id, action);
            if (res.success) {
                toast.success(res.message);
                // Refresh list AND global badge count
                fetchBusesData();
                refreshPendingCount();
            }
        } catch (error) {
            toast.error(error.message || 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bus?')) return;
        try {
            const res = await deleteAdminBus(id);
            if (res.success) {
                toast.success('Bus deleted successfully');
                fetchBusesData();
                refreshPendingCount();
            }
        } catch (error) {
            toast.error(error.message || 'Deletion failed');
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            active: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400',
            live: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400',
            approved: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400',
            pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400',
            under_review: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400',
            suspended: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400',
            rejected: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400',
            draft: 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-500/10 dark:text-slate-500'
        };
        return styles[(status || 'pending').toLowerCase()] || styles.pending;
    };

    if (loading && buses.length === 0) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
                    Scanning Global Fleet...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Table Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative group w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by bus name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 shadow-sm w-full transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white/50 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Bus Details</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Operator</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {buses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <AlertCircle size={48} className="mb-4 opacity-20" />
                                            <p className="text-lg font-bold">No buses found in this hangar</p>
                                            <p className="text-sm font-medium">Try adjusting your filters or search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                buses.map((bus) => (
                                    <tr key={bus._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                    <BusIcon size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{bus.busName}</p>
                                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">{bus.busNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                                                <ShieldCheck size={16} className="text-blue-500" />
                                                <span className="text-sm truncate max-w-[150px]">{bus.operator?.companyName || 'Unknown Operator'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                {bus.busType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(bus.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {bus.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                {/* Super Admin Actions */}
                                                {isSuperAdmin && (['pending', 'under_review'].includes(bus.status)) && (
                                                    <button 
                                                        onClick={() => handleAction(bus._id, 'approve')}
                                                        className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                        title="Final Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}

                                                {/* Admin Action: Submit for approval */}
                                                {isAdmin && bus.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAction(bus._id, 'submit_for_approval')}
                                                        className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                        title="Submit for Approval"
                                                    >
                                                        <ShieldCheck size={18} />
                                                    </button>
                                                )}

                                                {/* Final Reject (Super Admin Only) */}
                                                {isSuperAdmin && bus.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAction(bus._id, 'reject')}
                                                        className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                        title="Reject Request"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}

                                                {/* Suspend Action (Super Admin Only) */}
                                                {isSuperAdmin && (['approved', 'live', 'active'].includes(bus.status.toLowerCase())) && (
                                                    <button 
                                                        onClick={() => handleAction(bus._id, 'suspend')}
                                                        className="p-3 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                        title="Suspend Bus"
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                )}

                                                {/* Activate Action (Super Admin Only) */}
                                                {isSuperAdmin && bus.status.toLowerCase() === 'suspended' && (
                                                    <button 
                                                        onClick={() => handleAction(bus._id, 'activate')}
                                                        className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                        title="Re-activate Bus"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}

                                                <button 
                                                    className="p-3 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                <button 
                                                    className="p-3 bg-slate-50 text-slate-400 cursor-not-allowed rounded-2xl border border-dashed border-slate-200"
                                                    title="Edit (Coming Soon)"
                                                >
                                                    <Edit2 size={18} />
                                                </button>

                                                {isSuperAdmin && (
                                                    <button 
                                                        onClick={() => handleDelete(bus._id)}
                                                        className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm"
                                                        title="Delete (Super Admin only)"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                
                                                {isAdmin && (
                                                    <div className="p-3 bg-slate-50 text-slate-300 rounded-2xl cursor-help opacity-50" title="Only Super Admin can delete">
                                                        <Trash2 size={18} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {buses.length > 0 && (
                    <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing {buses.length} dynamic fleet units</p>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-blue-600 transition-all shadow-sm">
                                <ChevronLeft size={16} />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-blue-600 transition-all shadow-sm">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusTable;
