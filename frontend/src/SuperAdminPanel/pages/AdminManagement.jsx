import React, { useEffect, useState } from 'react';
import { 
    Users, ShieldCheck, Mail, Phone, 
    MoreHorizontal, Search, Trash2, 
    UserPlus, Loader2, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchAllAdmins, deleteAdmin } from '../../services/auth';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const data = await fetchAllAdmins();
            if (data.success) {
                setAdmins(data.admins);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch administrator directory');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (adminId, name) => {
        if (!window.confirm(`Are you sure you want to revoke access and delete administrator "${name}"?`)) {
            return;
        }

        try {
            const response = await deleteAdmin(adminId);
            if (response.success) {
                toast.success(response.message || 'Admin access revoked');
                // Update local state to remove the admin
                setAdmins(admins.filter(admin => admin._id !== adminId));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to revoke admin access');
        }
    };

    const filteredAdmins = admins.filter(admin => 
        admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.adminUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.mobileNumber.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
                    Accessing Admin Directory...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage active system administrators and their permissions</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                    <UserPlus size={18} /> Add New Admin
                </button>
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-3">
                <div className="relative group flex-1 max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name, username or mobile..." 
                        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Admins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdmins.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center">
                        <ShieldAlert size={48} className="text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900">No Administrators Found</h3>
                        <p className="text-slate-400 max-w-xs mt-1">Try adjusting your search or add a new administrator to the system.</p>
                    </div>
                ) : (
                    filteredAdmins.map((admin) => (
                        <div key={admin._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-blue-500/5 hover:border-blue-100 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[80px] -translate-y-2 translate-x-2 group-hover:scale-110 transition-transform" />
                            
                            <div className="flex items-start justify-between mb-6 relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-lg">
                                    <div className="w-full h-full rounded-[0.8rem] bg-white flex items-center justify-center text-blue-600 font-bold text-2xl uppercase">
                                        {admin.fullName.charAt(0)}
                                    </div>
                                </div>
                                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 leading-tight">{admin.fullName}</h4>
                                    <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">
                                        @{admin.adminUsername || 'no-username'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <Mail size={16} className="text-slate-300" />
                                        <span className="text-sm font-medium truncate">{admin.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <Phone size={16} className="text-slate-300" />
                                        <span className="text-sm font-medium">{admin.mobileNumber}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                        <ShieldCheck size={12} /> Active Admin
                                    </div>
                                    <button 
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors" 
                                        title="Revoke Access"
                                        onClick={() => handleDelete(admin._id, admin.fullName)}
                                    >
                                        <Trash2 size={18} />
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
