import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Bus as BusIcon,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    fetchMyBuses,
    updateBus,
    deleteBus
} from '../../services/auth';
import { toast } from 'react-toastify';

const BusList = () => {
    const navigate = useNavigate();
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const getBusesData = async () => {
        try {
            setLoading(true);
            const data = await fetchMyBuses();
            setBuses(data);
        } catch (error) {
            console.error("Fetch Buses Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBusesData();
    }, []);

    const handleStatusToggle = async (id, currentStatus) => {
        // Stop operator from self-approving if in review flow
        if (['pending', 'under_review', 'suspended', 'rejected', 'draft'].includes(currentStatus)) {
            toast.info(`Status cannot be manually toggled while ${currentStatus.replace('_', ' ')}. Please contact Admin.`);
            return;
        }

        try {
            const newStatus = currentStatus === 'active' || currentStatus === 'live' || currentStatus === 'approved' ? 'inactive' : 'active';
            await updateBus(id, { status: newStatus });
            toast.success(`Bus ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            getBusesData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteBus = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await deleteBus(id);
            toast.success("Bus deleted successfully");
            getBusesData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredBuses = buses.filter(bus =>
        bus.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Fleet Management</h1>
                    <p className="text-slate-500 font-medium">Manage your buses, amenities, and operational status.</p>
                </div>
                <button
                    onClick={() => navigate('/bus-operator/buses/add')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                    Add New Bus
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or plate number..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 transition-all">
                    <Filter size={20} />
                </button>
            </div>

            {/* Table List */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plate Number</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Seats</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredBuses.map((bus) => (
                                <tr key={bus._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                                                {bus.images?.[0] ? (
                                                    <img src={bus.images[0]} alt={bus.busName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <BusIcon size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800">{bus.busName}</h3>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mt-0.5">
                                                    <Info size={10} className="text-blue-500" />
                                                    {(bus.amenities || []).length} Amenities Onboard
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wider">
                                            {bus.busNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                            {bus.busType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-black text-slate-700">{bus.totalSeats}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {(() => {
                                                const status = bus.status || 'draft';
                                                const statusStyles = {
                                                    active: 'bg-green-50 text-green-600',
                                                    live: 'bg-emerald-50 text-emerald-600',
                                                    approved: 'bg-indigo-50 text-indigo-600',
                                                    pending: 'bg-amber-50 text-amber-600',
                                                    under_review: 'bg-blue-50 text-blue-600',
                                                    suspended: 'bg-red-50 text-red-600',
                                                    rejected: 'bg-rose-50 text-rose-600',
                                                    inactive: 'bg-slate-50 text-slate-400',
                                                    draft: 'bg-slate-50 text-slate-400'
                                                };
                                                return (
                                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${statusStyles[status] || 'bg-slate-50 text-slate-400'}`}>
                                                        {['active', 'live', 'approved'].includes(status) ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                        {status.replace('_', ' ')}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/bus-operator/buses/edit/${bus._id}`)}
                                                className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-md shadow-slate-900/10"
                                                title="Edit Bus"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusToggle(bus._id, bus.status)}
                                                disabled={['pending', 'under_review', 'suspended', 'rejected'].includes(bus.status)}
                                                className={`p-2.5 rounded-xl border border-slate-100 transition-all ${['pending', 'under_review', 'suspended', 'rejected'].includes(bus.status) 
                                                    ? 'opacity-20 cursor-not-allowed grayscale' 
                                                    : (['active', 'live', 'approved'].includes(bus.status) ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50')
                                                }`}
                                                title={['active', 'live', 'approved'].includes(bus.status) ? 'Deactivate' : 'Activate (Subject to Approval)'}
                                            >
                                                {['active', 'live', 'approved'].includes(bus.status) ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBus(bus._id, bus.busName)}
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
                                                title="Delete Bus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredBuses.length === 0 && (
                        <div className="p-20 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <BusIcon size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800">No buses found</h3>
                            <p className="text-sm text-slate-500 max-w-xs mt-1">Try adjusting your search terms to find your vehicle.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BusList;
