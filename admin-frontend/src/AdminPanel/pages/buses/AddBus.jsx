import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Save, X, PlusCircle, LayoutGrid, Info, MapPin } from 'lucide-react';
import { createAdminBus, fetchAllOperators } from '../../../services/adminBus';
import { toast } from 'react-toastify';

export default function AddBus() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [operators, setOperators] = useState([]);
    const [formData, setFormData] = useState({
        busName: '',
        busNumber: '',
        busType: 'AC Sleeper',
        totalSeats: 36,
        operator: '',
        amenities: []
    });

    useEffect(() => {
        const getOperators = async () => {
            try {
                const res = await fetchAllOperators();
                if (res.success) setOperators(res.operators);
            } catch (err) {
                toast.error('Failed to load operators');
            }
        };
        getOperators();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createAdminBus(formData);
            if (res.success) {
                toast.success('Bus added successfully and pending verification');
                navigate('/admin/buses/all');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to create bus');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                        <PlusCircle size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Expand Fleet</h1>
                        <p className="text-slate-500 font-medium mt-1">Register a new transport unit into the management system</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(-1)}
                    className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Body */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white/50 dark:border-slate-800 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Info size={18} className="text-blue-600" />
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-[0.1em] text-xs">Essential Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bus Identification Name</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Scania Multi-Axle"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                                    value={formData.busName}
                                    onChange={(e) => setFormData({...formData, busName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="MH-12-CQ-1234"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                                    value={formData.busNumber}
                                    onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Operator</label>
                                <select 
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                                    value={formData.operator}
                                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                                >
                                    <option value="">Select Operator</option>
                                    {operators.map(op => (
                                        <option key={op._id} value={op._id}>{op.companyName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Total Capacity</label>
                                <input 
                                    type="number" 
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                                    value={formData.totalSeats}
                                    onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info / Meta */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-6">
                        <div className="flex items-center gap-2">
                            <LayoutGrid size={18} className="text-blue-400" />
                            <h3 className="font-bold uppercase tracking-[0.1em] text-xs">Vehicle Configuration</h3>
                        </div>
                        <div className="space-y-4">
                            {['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Luxury Multi-axle'].map(type => (
                                <button 
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, busType: type})}
                                    className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all border ${formData.busType === type ? 'bg-blue-600 border-blue-500 shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Publish Unit</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
