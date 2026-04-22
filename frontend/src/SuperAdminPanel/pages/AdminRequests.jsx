import React, { useEffect, useState } from 'react';
import { 
    ShieldCheck, XCircle, Clock, Search, 
    Filter, ExternalLink, Copy, Check, Loader2,
    ShieldAlert, User, Mail, Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAdminRequests, updateAdminRequestStatus } from '../../services/auth';

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [approvalModal, setApprovalModal] = useState({ open: false, link: '', name: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await fetchAdminRequests();
            setRequests(data.requests || []);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch admin requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, status, name) => {
        setActionLoading(requestId);
        try {
            const data = await updateAdminRequestStatus(requestId, status);

            if (data.success) {
                toast.success(`Request ${status} successfully`);
                if (status === 'approved' && data.setPasswordLink) {
                    setApprovalModal({ 
                        open: true, 
                        link: data.setPasswordLink,
                        name: name
                    });
                }
                fetchRequests();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.info('Link copied to clipboard!');
    };

    const filteredRequests = requests.filter(req => 
        req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.mobileNumber.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
                    Accessing Secure Vault...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Requests</h1>
                    <p className="text-slate-500 font-medium mt-1">Review and approve system access requests</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find by name or mobile..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 shadow-sm w-full md:w-64 transition-all"
                        />
                    </div>
                    <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Requested</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <ShieldAlert size={48} className="mb-4 opacity-20" />
                                            <p className="text-lg font-bold">No pending requests found</p>
                                            <p className="text-sm font-medium">System is currently secure</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-lg">
                                                    {req.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 dark:text-white font-bold leading-tight">{req.fullName}</p>
                                                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                                                        {req.requestedRole} Request
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                    <Mail size={14} />
                                                    <span className="text-sm font-medium">{req.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                    <Phone size={14} />
                                                    <span className="text-sm font-medium">{req.mobileNumber}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Clock size={14} />
                                                <span className="text-sm font-medium">
                                                    {new Date(req.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={() => handleAction(req._id, 'approved', req.fullName)}
                                                        disabled={actionLoading === req._id}
                                                        className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-green-500/20 disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        {actionLoading === req._id ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(req._id, 'rejected', req.fullName)}
                                                        disabled={actionLoading === req._id}
                                                        className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-red-500/20 disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Resolved</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approval Link Modal */}
            {approvalModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100px] pointer-events-none" />
                        
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 mb-4">
                                <ShieldCheck size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">{approvalModal.name} Approved!</h2>
                            <p className="text-slate-500 font-medium mt-2">
                                Access granted. Please share this activation link with the user to finalize their admin account.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl break-all">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Activation Link</p>
                                <p className="text-sm font-semibold text-blue-600 leading-relaxed font-mono">
                                    {approvalModal.link}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={() => copyToClipboard(approvalModal.link)}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                                >
                                    <Copy size={20} /> Copy Link
                                </button>
                                <button 
                                    onClick={() => setApprovalModal({ ...approvalModal, open: false })}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold transition-all active:scale-95 text-center"
                                >
                                    Close Window
                                </button>
                            </div>
                            
                            <p className="text-center text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                Warning: Link expires in 10 minutes for security
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const configs = {
        pending: { color: 'amber', icon: Clock, label: 'Pending Review' },
        approved: { color: 'green', icon: ShieldCheck, label: 'Access Granted' },
        rejected: { color: 'red', icon: XCircle, label: 'Denied' }
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-${config.color}-50 text-${config.color}-600 dark:bg-${config.color}-500/10 text-xs font-bold tracking-wide border border-${config.color}-100 dark:border-${config.color}-500/20 uppercase`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}
