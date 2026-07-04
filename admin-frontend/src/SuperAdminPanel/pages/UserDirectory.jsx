import React, { useState, useEffect } from 'react';
import {
    Users, UserCheck, ShieldCheck, Mail, Phone,
    Search, Filter, MoreHorizontal, Trash2,
    Edit, CheckCircle, XCircle, Loader2,
    Building2, Hotel as HotelIcon, Bus as BusIcon,
    ArrowUpRight, ArrowDownRight, Activity,
    Calendar, MapPin, ExternalLink, Plus,
    FileText, Send, UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchDirectoryStats,
    fetchDirectoryUsers,
    fetchDirectoryOperators,
    updateDirectoryStatus,
    deleteAdmin,
    fetchOperatorRequests,
    approveOperatorRequest,
    manualCreateOperator,
    deleteDirectoryRecord,
    updateDirectoryRecord
} from '../../services/auth';

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-[0.03] rounded-bl-[80px] -translate-y-2 translate-x-2 group-hover:scale-110 transition-transform`} />
        <div className="flex items-start justify-between relative">
            <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${colorClass.replace('bg-', 'bg-').replace('/10', '/10')} flex items-center justify-center`}>
                    <Icon className={colorClass.replace('bg-', 'text-').replace('/10', '')} size={24} />
                </div>
                <div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
                    {subValue && (
                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-tight">
                            {subValue}
                        </p>
                    )}
                </div>
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
    </div>
);

export default function UserDirectory() {
    const [activeTab, setActiveTab] = useState('admins'); // admins, users, operators, requests
    const [operatorType, setOperatorType] = useState('bus'); // bus, hotel
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [newOperator, setNewOperator] = useState({ fullName: '', email: '', mobileNumber: '', operatorType: 'bus' });
    const [submitting, setSubmitting] = useState(false);
    const [activationLink, setActivationLink] = useState('');

    // Edit Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editData, setEditData] = useState({ fullName: '', email: '', mobileNumber: '', companyName: '' });

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        loadData();
    }, [activeTab, operatorType, searchTerm, statusFilter]);

    const loadStats = async () => {
        try {
            const res = await fetchDirectoryStats();
            if (res.success) setStats(res.stats);
        } catch (error) {
            console.error(error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === 'requests') {
                res = await fetchOperatorRequests();
                if (res.success) {
                    // Filter based on searchTerm and status if needed (client side for simplicity or backend)
                    let filtered = res.requests;
                    if (searchTerm) {
                        filtered = filtered.filter(r =>
                            r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.email.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                    }
                    if (statusFilter !== 'all') {
                        filtered = filtered.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
                    }
                    setData(filtered);
                }
            } else if (activeTab === 'operators') {
                res = await fetchDirectoryOperators(operatorType, searchTerm, statusFilter === 'all' ? '' : statusFilter);
                if (res.success) setData(res.operators);
            } else {
                res = await fetchDirectoryUsers(activeTab === 'admins' ? 'admin' : 'user', searchTerm, statusFilter === 'all' ? '' : statusFilter);
                if (res.success) setData(res.users);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            const res = await approveOperatorRequest(requestId);
            if (res.success) {
                toast.success("Request approved!");
                setActivationLink(res.setPasswordLink);
                loadData();
                loadStats();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleManualCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await manualCreateOperator(newOperator);
            if (res.success) {
                toast.success("Operator created!");
                setActivationLink(res.setPasswordLink);
                setShowAddModal(false);
                loadData();
                loadStats();
                setNewOperator({ fullName: '', email: '', mobileNumber: '', operatorType: 'bus' });
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAdmin = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete admin "${name}"?`)) return;
        try {
            const res = await deleteAdmin(id);
            if (res.success) {
                toast.success("Admin removed");
                loadData();
                loadStats();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id, name, typeOverride = null) => {
        const typeMap = {
            admins: 'admin',
            users: 'user',
            operators: operatorType === 'bus' ? 'bus-operator' : 'hotel-operator',
            requests: 'request'
        };
        const type = typeOverride || typeMap[activeTab];

        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            try {
                const res = await deleteDirectoryRecord(id, type);
                if (res.success) {
                    toast.success("Record deleted successfully");
                    loadData();
                    loadStats();
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditData({
            fullName: item.fullName || item.name || '',
            email: item.email || '',
            mobileNumber: item.mobileNumber || item.contactNumber || item.phone || '',
            companyName: item.companyName || ''
        });
        setShowEditModal(true);
    };

    const processUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const typeMap = {
                admins: 'admin',
                users: 'user',
                operators: operatorType === 'bus' ? 'bus-operator' : 'hotel-operator',
                requests: 'request'
            };
            const type = typeMap[activeTab];

            const res = await updateDirectoryRecord(editingItem._id, type, editData);
            if (res.success) {
                toast.success("Record updated successfully");
                setShowEditModal(false);
                loadData();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-50 text-green-600 border-green-100';
            case 'approved': return 'bg-green-50 text-green-600 border-green-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'inactive': return 'bg-slate-50 text-slate-400 border-slate-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Centralized management for all system entities</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 shadow-blue-600/20 active:scale-95"
                    >
                        <UserPlus size={18} />
                        Add Operator
                    </button>
                </div>
            </div>

            {/* Activation Link Alert (Temporary UI for Dev) */}
            {activationLink && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                            <ExternalLink size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm italic">Immediate Action Required</h4>
                            <p className="text-xs text-slate-500 font-medium">Send this activation link to the operator to set their password:</p>
                            <code className="text-[10px] font-mono bg-white px-2 py-1 rounded-md border border-amber-100 mt-1 inline-block text-amber-700 break-all max-w-[500px]">
                                {activationLink}
                            </code>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(activationLink);
                            toast.info("Copied to clipboard!");
                        }}
                        className="px-4 py-2 bg-white border border-amber-200 text-amber-600 rounded-xl text-xs font-black hover:bg-amber-100 transition-all shrink-0 ml-4"
                    >
                        COPY LINK
                    </button>
                    <button onClick={() => setActivationLink('')} className="ml-4 text-slate-400 hover:text-slate-900">
                        <XCircle size={18} />
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            {/* Same as before */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Admins"
                    value={stats?.totalAdmins || 0}
                    icon={UserCheck}
                    colorClass="bg-blue-600/10"
                    trend={12}
                />
                <StatCard
                    title="Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    colorClass="bg-indigo-600/10"
                    trend={8}
                />
                <StatCard
                    title="Operators"
                    value={stats?.totalOperators || 0}
                    subValue={`${stats?.operatorsBreakdown?.bus || 0} Bus • ${stats?.operatorsBreakdown?.hotel || 0} Hotel`}
                    icon={Building2}
                    colorClass="bg-amber-600/10"
                    trend={-2}
                />
            </div>

            {/* Main Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-100 flex items-center gap-2 w-fit shadow-sm">
                {[
                    { id: 'admins', label: 'Admins', icon: ShieldCheck },
                    { id: 'users', label: 'Users', icon: Users },
                    { id: 'operators', label: 'Operators', icon: Building2 },
                    { id: 'requests', label: 'Requests', icon: FileText },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setStatusFilter('all'); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                {/* Filtering Bar within Container */}
                <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative group max-w-sm flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search by name, email or mobile...`}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {activeTab === 'operators' && (
                            <div className="bg-white border border-slate-100 p-1 rounded-xl flex gap-1 shadow-sm">
                                <button
                                    onClick={() => setOperatorType('bus')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${operatorType === 'bus' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Bus
                                </button>
                                <button
                                    onClick={() => setOperatorType('hotel')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${operatorType === 'hotel' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Hotel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto relative">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] z-20">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">Filtering Records...</p>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Profile & Identity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Contact Info</th>
                                {activeTab === 'admins' && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Handle</th>}
                                {activeTab === 'users' && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Service Activity</th>}
                                {activeTab === 'operators' && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Venture Details</th>}
                                {activeTab === 'requests' && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category</th>}
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan="10" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Users size={48} className="text-slate-300 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-900">No matching search results</h3>
                                            <p className="text-sm font-medium">Try adjusting your filters or search keywords</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                        {/* Profile Column */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all ${activeTab === 'admins' ? 'bg-blue-600 text-white' :
                                                        activeTab === 'users' ? 'bg-indigo-600 text-white' :
                                                            activeTab === 'requests' ? 'bg-slate-900 text-white' :
                                                                operatorType === 'bus' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                                                    }`}>
                                                    {(item.fullName || item.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-900 truncate">{item.fullName || item.name}</span>
                                                    <span className="text-[11px] font-medium text-slate-400 truncate">{item.email || 'guest@system.com'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact Column */}
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone size={12} className="text-slate-400" />
                                                    <span className="text-xs font-bold">{item.mobileNumber || item.contactNumber || item.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Activity size={12} className="text-slate-300" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide">Last active today</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Context Specific Column */}
                                        <td className="px-6 py-5">
                                            {activeTab === 'admins' && (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">
                                                    @{item.adminUsername || 'ADMIN'}
                                                </div>
                                            )}
                                            {activeTab === 'users' && (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-700">{item.bookingCount || 0}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Orders</span>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'operators' && (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <Building2 size={12} className="text-slate-400" />
                                                        <span className="text-xs font-black truncate max-w-[150px]">{item.companyName || 'Private Venture'}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {activeTab === 'requests' && (
                                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block ${item.operatorType === 'bus' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {item.operatorType} OPERATOR
                                                </div>
                                            )}
                                        </td>

                                        {/* Status Column */}
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${getStatusStyles(item.status || 'Active')}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' || item.status === 'approved' ? 'bg-green-500' : item.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                                {item.status || 'Active'}
                                            </div>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {activeTab === 'requests' && item.status?.toLowerCase() === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(item._id)}
                                                            className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                                            title="Approve Request"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                                            title="Reject Request"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* Only show Edit if NOT in requests tab */}
                                                {activeTab !== 'requests' && (
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl"
                                                        title="Edit Record"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                )}

                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl"
                                                    title="Delete Record"
                                                    onClick={() => handleDelete(item._id, item.fullName || item.name)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between px-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing <span className="text-slate-900">{data.length}</span> entries in {activeTab} directory
                    </p>
                </div>
            </div>

            {/* Add Operator Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white max-w-lg w-full rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-blue-600 p-8 text-white relative">
                            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                            <UserPlus size={40} className="mb-4 opacity-50" />
                            <h2 className="text-3xl font-black tracking-tight leading-none text-white">New Operator</h2>
                            <p className="text-blue-100 text-sm mt-2 font-medium">Quickly onboard a new fleet or hotel partner.</p>
                        </div>

                        <form onSubmit={handleManualCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${newOperator.operatorType === 'bus' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 text-slate-400 grayscale hover:grayscale-0'}`}>
                                    <input type="radio" className="hidden" checked={newOperator.operatorType === 'bus'} onChange={() => setNewOperator({ ...newOperator, operatorType: 'bus' })} />
                                    <BusIcon size={24} />
                                    <span className="text-[10px] font-black uppercase">Bus Service</span>
                                </label>
                                <label className={`p-4 rounded-3xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${newOperator.operatorType === 'hotel' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-50 text-slate-400 grayscale hover:grayscale-0'}`}>
                                    <input type="radio" className="hidden" checked={newOperator.operatorType === 'hotel'} onChange={() => setNewOperator({ ...newOperator, operatorType: 'hotel' })} />
                                    <HotelIcon size={24} />
                                    <span className="text-[10px] font-black uppercase">Hotel Partner</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <ModalInput label="Full Name" placeholder="Business or personal name" value={newOperator.fullName} onChange={v => setNewOperator({ ...newOperator, fullName: v })} />
                                <ModalInput label="Official Email" placeholder="email@company.com" type="email" value={newOperator.email} onChange={v => setNewOperator({ ...newOperator, email: v })} />
                                <ModalInput label="Mobile Number" placeholder="+91 0000000000" value={newOperator.mobileNumber} onChange={v => setNewOperator({ ...newOperator, mobileNumber: v })} />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <>Create & Generate Link <Plus size={16} /></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Record Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white max-w-lg w-full rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                            <Edit size={40} className="mb-4 opacity-50 text-blue-400" />
                            <h2 className="text-3xl font-black tracking-tight leading-none text-white">Edit Record</h2>
                            <p className="text-slate-400 text-sm mt-2 font-medium">Update profile information for this {activeTab.slice(0, -1)}.</p>
                        </div>

                        <form onSubmit={processUpdate} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <ModalInput label="Full Name" placeholder="Name" value={editData.fullName} onChange={v => setEditData({ ...editData, fullName: v })} />
                                <ModalInput label="Email Address" placeholder="email@example.com" type="email" value={editData.email} onChange={v => setEditData({ ...editData, email: v })} />
                                <ModalInput label="Mobile Number" placeholder="Phone" value={editData.mobileNumber} onChange={v => setEditData({ ...editData, mobileNumber: v })} />
                                {activeTab === 'operators' && (
                                    <ModalInput label="Company Name" placeholder="Business Name" value={editData.companyName} onChange={v => setEditData({ ...editData, companyName: v })} />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <>Save Changes <Plus size={16} /></>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ModalInput({ label, placeholder, type = "text", value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-bold placeholder:text-slate-300"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}
