
import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit2, Trash2, Search, Coffee, 
    Upload, Globe, Download, MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    getMealMaster, deleteMealMaster,
    getAirlines 
} from '../../../../services/flightApi';
import { toast } from 'react-toastify';

const MealMasterList = () => {
    const navigate = useNavigate();
    const [meals, setMeals] = useState([]);
    const [airlines, setAirlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAirline, setFilterAirline] = useState('');
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [mealsRes, airlinesRes] = await Promise.all([
                getMealMaster(),
                getAirlines()
            ]);
            if (mealsRes.success) setMeals(mealsRes.meals);
            if (airlinesRes.success) setAirlines(airlinesRes.airlines);
        } catch (err) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent delete? This will affect mapped flights.")) return;
        try {
            await deleteMealMaster(id);
            toast.success("Meal deleted");
            fetchInitialData();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const filteredMeals = meals.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             m.mealCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !filterType || m.type === filterType;
        const matchesAirline = !filterAirline || m.applicableAirlines?.some(a => a._id === filterAirline);
        return matchesSearch && matchesType && matchesAirline;
    });

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Meal <span className="text-blue-600">Inventory</span></h1>
                    <p className="text-slate-500 font-medium">Manage global meal blueprints and GDS mapping</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Export
                    </button>
                    <button 
                        onClick={() => navigate('/super-admin/flights/ancillaries/add-meals')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-blue-600/25"
                    >
                        <Plus size={20} /> Create New Meal
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Meals" value={meals.length} color="blue" />
                <StatCard label="Veg Options" value={meals.filter(m => m.type === 'Veg').length} color="green" />
                <StatCard label="International" value={meals.filter(m => m.tripType !== 'Domestic').length} color="purple" />
                <StatCard label="Active Status" value={meals.filter(m => m.status).length} color="emerald" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by meal name or code (AVML, NVML...)" 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-600/20 transition-all outline-none font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select 
                        className="px-4 py-3 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-600 outline-none focus:bg-white transition-all"
                        value={filterAirline}
                        onChange={(e) => setFilterAirline(e.target.value)}
                    >
                        <option value="">All Airlines</option>
                        {airlines.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                    <select 
                        className="px-4 py-3 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-600 outline-none focus:bg-white transition-all"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Jain">Jain</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Meal Details</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Pricing / GDS</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Applicable Airlines</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">Loading inventory...</td></tr>
                        ) : filteredMeals.length === 0 ? (
                            <tr><td colSpan="5" className="p-20 text-center font-bold text-slate-400">No meals found matching your filters</td></tr>
                        ) : (
                            filteredMeals.map(meal => (
                                <tr key={meal._id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 ${meal.type === 'Veg' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                <Coffee size={24} />
                                                <span className="text-[8px] font-black uppercase mt-1">{meal.type}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-black text-slate-800 text-lg">{meal.name}</span>
                                                    <span className="bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest">{meal.mealCode}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Globe size={14} className="text-blue-500" />
                                                    {meal.tripType} Sector • {meal.applicableFor?.join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-800 text-lg">{meal.currency} {meal.basePrice?.toLocaleString()}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${meal.taxIncluded ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {meal.taxIncluded ? 'TAX INCLUDED' : 'TAX EXTRA'}
                                            </span>
                                            {meal.externalMealCode && (
                                                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                    GDS: {meal.externalMealCode}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex -space-x-3">
                                            {meal.applicableAirlines?.slice(0, 4).map(a => (
                                                <div key={a._id} className="w-10 h-10 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center overflow-hidden shadow-md group-hover:-translate-y-1 transition-transform" title={a.name}>
                                                    <img src={a.logo} alt="" className="w-6 h-6 object-contain" />
                                                </div>
                                            ))}
                                            {meal.applicableAirlines?.length > 4 && (
                                                <div className="w-10 h-10 rounded-full bg-slate-800 text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-50 shadow-md">
                                                    +{meal.applicableAirlines.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button 
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 transition-all ${
                                                meal.status ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                            }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${meal.status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                            {meal.status ? 'Live' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => navigate(`/super-admin/flights/ancillaries/edit-meal/${meal._id}`)}
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-600 rounded-xl transition-all shadow-sm"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(meal._id)}
                                                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-600 rounded-xl transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
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
    );
};

const StatCard = ({ label, value, color }) => {
    const colors = {
        blue: 'bg-blue-600/10 text-blue-600',
        green: 'bg-green-600/10 text-green-600',
        purple: 'bg-purple-600/10 text-purple-600',
        emerald: 'bg-emerald-600/10 text-emerald-600'
    };
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${colors[color].split(' ')[1]}`}>{value}</p>
        </div>
    );
};

export default MealMasterList;
