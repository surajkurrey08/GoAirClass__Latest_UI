import React, { useState, useEffect } from 'react';
import { fetchBusTypes, createBusType, deleteBusType } from '../../../services/adminBus';
import { LayoutGrid, Plus, Layers, Trash2, Loader2, Info } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BusTypes() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const getTypes = async () => {
        try {
            const res = await fetchBusTypes();
            if (res.success) setTypes(res.types);
        } catch (err) {
            toast.error('Failed to load bus categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTypes();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createBusType({ name });
            if (res.success) {
                toast.success('Category added successfully');
                setName('');
                getTypes();
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            const res = await deleteBusType(id);
            if (res.success) {
                toast.success('Category removed');
                getTypes();
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Categorizing Fleet Standards...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Fleet Standards</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage transport categories and service class definitions</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Category Form */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white/50 dark:border-slate-800 h-fit">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 tracking-tight">Define New Type</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                            <input 
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Premium Scania AC"
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            {submitting ? 'Processing...' : <><Plus size={18} /> Add Category</>}
                        </button>
                    </form>
                    <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl flex items-start gap-4">
                        <Info size={18} className="text-blue-600 shrink-0 mt-1" />
                        <p className="text-xs text-blue-800/70 dark:text-blue-400/70 font-medium leading-relaxed">
                            These categories will appear as options for operators when registering new units. Ensure accuracy for travel search filters.
                        </p>
                    </div>
                </div>

                {/* Categories List */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white/50 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 tracking-tight">Active Definitions</h3>
                    <div className="space-y-3">
                        {types.map((type) => (
                            <div key={type._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group border border-transparent hover:border-blue-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm">
                                        <LayoutGrid size={16} />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{type.name}</span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(type._id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {types.length === 0 && (
                            <div className="py-20 text-center opacity-30">
                                <Layers size={48} className="mx-auto mb-4" />
                                <p className="font-bold">No categories defined yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
