import React, { useState, useEffect } from 'react';
import {
    Users as UsersIcon, UserCheck, Mail, Phone,
    Search, Filter, MoreHorizontal, Trash2,
    Edit, CheckCircle, XCircle, Loader2,
    Building2, Hotel as HotelIcon, Bus as BusIcon,
    Plus, Send, ExternalLink, Activity, ShieldAlert,
    ShieldCheck, Ban, Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchDirectoryStats,
    fetchDirectoryUsers,
    fetchDirectoryOperators,
    updateDirectoryStatus,
    manualCreateOperator,
    deleteDirectoryRecord,
    updateDirectoryRecord,
    toggleUserBlock
} from '../../services/auth';

const StatCard = ({ title, value, subValue, icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass} opacity-[0.03] rounded-bl-[80px] -translate-y-2 translate-x-2 group-hover:scale-110 transition-transform`} />
        <div className="flex items-start justify-between relative">
            <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center`}>
                    <Icon className={colorClass.replace('bg-', 'text-').replace('/10', '')} size={24} />
                </div>
                <div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
                    {subValue && (
                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-tight">
                            {subValue}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default function Users() {
    const [activeTab, setActiveTab] = useState('app-users'); // app-users, web-users
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
    }, [activeTab, searchTerm, statusFilter]);

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
            if (activeTab === 'web-users') {
                res = await fetchDirectoryUsers('web-user', searchTerm, statusFilter === 'all' ? '' : statusFilter);
                if (res.success) setData(res.users);
            } else {
                res = await fetchDirectoryUsers('user', searchTerm, statusFilter === 'all' ? '' : statusFilter);
                if (res.success) setData(res.users);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleManualCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await manualCreateOperator(newOperator);
            if (res.success) {
                toast.success("Operator created successfully!");
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

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to deactivate ${name}? This will remove them from the active list.`)) return;
        try {
            const type = activeTab === 'web-users' ? 'web-user' : 'user';
            const res = await deleteDirectoryRecord(id, type);
            if (res.success) {
                toast.success("User deactivated successfully");
                loadData();
                loadStats();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            const type = activeTab === 'web-users' ? 'web-user' : 'user';
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
            const res = await updateDirectoryStatus(id, type, newStatus);
            if (res.success) {
                toast.success(`Status updated to ${newStatus}`);
                loadData();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSuspend = async (id) => {
        if (!window.confirm("Are you sure you want to suspend this user? They will lose access immediately.")) return;
        try {
            const type = activeTab === 'web-users' ? 'web-user' : 'user';
            const res = await updateDirectoryStatus(id, type, 'Suspended');
            if (res.success) {
                toast.warning("User suspended");
                loadData();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditData({
            fullName: item.fullName || item.name || '',
            email: item.email || '',
            mobileNumber: item.mobileNumber || item.contactNumber || item.phone || '',
            companyName: ''
        });
        setShowEditModal(true);
    };

    const handleToggleBlock = async (id, currentBlocked, name) => {
        const action = currentBlocked ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} ${name}?`)) return;
        try {
            const res = await toggleUserBlock(id, !currentBlocked);
            if (res.success) {
                toast.success(`User ${action}ed successfully`);
                loadData();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const type = activeTab === 'web-users' ? 'web-user' : 'user';
            const res = await updateDirectoryRecord(editingItem._id, type, editData);
            if (res.success) {
                toast.success("Profile updated!");
                setShowEditModal(false);
                loadData();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Directory</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage app users and website users.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="App Users"
                    value={stats?.appUsersCount || 0}
                    icon={UsersIcon}
                    colorClass="bg-blue-600/10"
                />
                <StatCard
                    title="Website Users"
                    value={stats?.webUsersCount || 0}
                    icon={UsersIcon}
                    colorClass="bg-amber-600/10"
                />
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={UsersIcon}
                    colorClass="bg-indigo-600/10"
                />
            </div>

            {/* Main Tabs */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 w-fit shadow-sm">
                {[
                    { id: 'app-users', label: 'App Users', icon: UsersIcon },
                    { id: 'web-users', label: 'Website Users', icon: UsersIcon },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setStatusFilter('all'); }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters & Content */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black px-4 py-2 text-slate-600"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile & Identity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activities</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
                                        <p className="text-slate-400 font-bold mt-4 animate-pulse">Syncing Directory...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="text-slate-300" size={24} />
                                        </div>
                                        <p className="text-slate-500 font-bold italic">No records found matching your criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center font-bold text-orange-500 border border-orange-100 dark:border-slate-700">
                                                    {(item.fullName || item.name || 'U').charAt(0)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.fullName || item.name}</span>
                                                    <span className="text-[11px] font-medium text-slate-400 truncate">{item.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Phone size={12} className="text-slate-400" />
                                                    <span className="text-xs font-medium text-slate-700">{item.mobileNumber || item.contactNumber || item.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Activity size={12} className="text-slate-300" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wide">Last active today</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.bookingCount || 0}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Orders</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${item.isBlocked
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                                : ['approved', 'active'].includes((item.status || 'Active').toLowerCase())
                                                    ? 'bg-green-50 text-green-600 dark:bg-green-500/10'
                                                    : (item.status || '').toLowerCase() === 'suspended'
                                                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 border border-orange-200'
                                                        : (item.status || '').toLowerCase() === 'pending'
                                                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                                                            : 'bg-red-50 text-red-600 dark:bg-red-500/10'
                                                }`}>
                                                {item.isBlocked ? 'Blocked' : (item.status || 'Active')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 transition-opacity">
                                                <button
                                                    className={`p-2 transition-all rounded-xl ${item.isBlocked ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                                    title={item.isBlocked ? 'Unblock User' : 'Block User'}
                                                    onClick={() => handleToggleBlock(item._id, item.isBlocked, item.fullName || item.name)}
                                                >
                                                    {item.isBlocked ? <ShieldCheck size={16} /> : <Ban size={16} />}
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all rounded-xl"
                                                    title="Edit Profile"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-xl"
                                                    title="Deactivate User"
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
            </div>

            {/* Add Operator Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Create Operator</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <XCircle className="text-slate-400" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleManualCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                <button type="button" onClick={() => setNewOperator({ ...newOperator, operatorType: 'bus' })}
                                    className={`py-2 rounded-xl text-xs font-black transition-all ${newOperator.operatorType === 'bus' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-lg' : 'text-slate-500'}`}>
                                    BUS SERVICE
                                </button>
                                <button type="button" onClick={() => setNewOperator({ ...newOperator, operatorType: 'hotel' })}
                                    className={`py-2 rounded-xl text-xs font-black transition-all ${newOperator.operatorType === 'hotel' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-500'}`}>
                                    HOTEL PARTNER
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input required type="text" placeholder="e.g. Rahul Sharma"
                                        value={newOperator.fullName} onChange={(e) => setNewOperator({ ...newOperator, fullName: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input required type="email" placeholder="rahul@example.com"
                                        value={newOperator.email} onChange={(e) => setNewOperator({ ...newOperator, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <input required type="tel" placeholder="9876543210"
                                        value={newOperator.mobileNumber} onChange={(e) => setNewOperator({ ...newOperator, mobileNumber: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                GENERATE ACCOUNT
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 dark:border-slate-800">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Edit Profile</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <XCircle className="text-slate-400" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input required type="text"
                                        value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input required type="email"
                                        value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <input required type="tel"
                                        value={editData.mobileNumber} onChange={(e) => setEditData({ ...editData, mobileNumber: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                {activeTab === 'operators' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                        <input required type="text"
                                            value={editData.companyName} onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={submitting}
                                className="w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                SAVE CHANGES
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Activation Link Modal */}
            {activationLink && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 p-10 text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CheckCircle className="text-green-600" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Operator Created!</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Share this secure activation link with the operator to let them set their password.</p>

                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 mb-8">
                            <div className="flex-1 text-left truncate text-blue-600 font-bold text-sm">
                                {activationLink}
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(activationLink);
                                    toast.success("Link copied to clipboard!");
                                }}
                                className="p-3 bg-white dark:bg-slate-700 text-slate-600 rounded-xl hover:bg-blue-50 transition-all active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => setActivationLink('')}
                            className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
