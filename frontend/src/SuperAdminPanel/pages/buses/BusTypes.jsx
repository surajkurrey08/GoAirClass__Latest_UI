import React, { useState, useEffect } from 'react';
import { 
    Settings2, Plus, Trash2, Loader2, AlertCircle, 
    Layers, Layout, Info, CheckCircle2
} from 'lucide-react';
import { fetchBusTypes, createBusType, deleteBusType } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function BusTypes() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', seatLayout: '2+2' });

    const loadTypes = async () => {
        setLoading(true);
        try {
            const res = await fetchBusTypes();
            if (res.success) setTypes(res.types);
        } catch (error) {
            toast.error(error.message || 'Failed to load bus types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTypes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createBusType(formData);
            if (res.success) {
                toast.success('Bus type created successfully');
                setIsModalOpen(false);
                setFormData({ name: '', description: '', seatLayout: '2+2' });
                loadTypes();
            }
        } catch (error) {
            toast.error(error.message || 'Creation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this bus type? This might affect existing buses.')) return;
        try {
            const res = await deleteBusType(id);
            if (res.success) {
                toast.success('Bus type deleted');
                loadTypes();
            }
        } catch (error) {
            toast.error(error.message || 'Deletion failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-blue-600/10 flex items-center justify-center text-blue-600">
                        <Settings2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bus Categories</h1>
                        <p className="text-slate-500 font-medium mt-1">Configure service types and seating configurations</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 text-sm"
                >
                    <Plus size={18} /> New Category
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {types.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200">
                            <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">No categories defined yet</p>
                        </div>
                    ) : (
                        types.map((type) => (
                            <div key={type._id} className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white dark:border-slate-800 hover:border-blue-200 transition-all">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                                        <Layers size={24} />
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(type._id)}
                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{type.name}</h3>
                                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">{type.description || 'No description provided'}</p>
                                
                                <div className="flex items-center gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full">
                                        <Layout size={14} />
                                        {type.seatLayout} Layout
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        <CheckCircle2 size={12} className="text-green-500" />
                                        Active
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden border border-slate-100 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Bus Type</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Type Name</label>
                                <input 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. AC Sleeper Plus"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Seat Layout</label>
                                <select 
                                    value={formData.seatLayout}
                                    onChange={e => setFormData({...formData, seatLayout: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-bold appearance-none"
                                >
                                    <option value="2+2">2+2 Configuration</option>
                                    <option value="2+1">2+1 Configuration</option>
                                    <option value="1+2">1+2 Configuration</option>
                                    <option value="1+1">1+1 Super Luxury</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Description</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Describe features, amenities etc."
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-600/20 transition-all font-medium h-32"
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
