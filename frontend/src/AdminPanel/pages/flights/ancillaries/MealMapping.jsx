
import React, { useState, useEffect } from 'react';
import { Search, Save, Utensils, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import { getFlightInventory, getMealMaster, getFlightMealMapping, saveFlightMealMapping } from '../../../../services/flightApi';
import { toast } from 'react-toastify';

const MealMapping = () => {
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [mealMaster, setMealMaster] = useState([]);
    const [mapping, setMapping] = useState({
        mealAvailable: false,
        meals: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [flightsRes, mealsRes] = await Promise.all([
                getFlightInventory(),
                getMealMaster()
            ]);
            if (flightsRes.success) setFlights(flightsRes.flights || []);
            if (mealsRes.success) setMealMaster(mealsRes.meals || []);
        } catch (err) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleFlightSelect = async (flight) => {
        setSelectedFlight(flight);
        setLoading(true);
        try {
            const res = await getFlightMealMapping(flight._id);
            if (res.success && res.mapping) {
                setMapping(res.mapping);
            } else {
                setMapping({ mealAvailable: false, meals: [] });
            }
        } catch (err) {
            toast.error("Failed to load flight mapping");
        } finally {
            setLoading(false);
        }
    };

    const addMealToMapping = (meal) => {
        if (mapping.meals.find(m => m.mealCode === meal.mealCode)) {
            toast.warning("Meal already added");
            return;
        }
        const newMeal = {
            mealCode: meal.mealCode,
            name: meal.name,
            image: meal.image,
            type: meal.type,
            price: meal.basePrice || 0,
            stock: 100,
            available: true
        };
        setMapping({ ...mapping, meals: [...mapping.meals, newMeal] });
    };

    const removeMeal = (code) => {
        setMapping({ ...mapping, meals: mapping.meals.filter(m => m.mealCode !== code) });
    };

    const updateMealField = (code, field, value) => {
        const updatedMeals = mapping.meals.map(m => 
            m.mealCode === code ? { ...m, [field]: value } : m
        );
        setMapping({ ...mapping, meals: updatedMeals });
    };

    const handleSave = async () => {
        if (!selectedFlight) return;
        setSaving(true);
        try {
            await saveFlightMealMapping(selectedFlight._id, mapping);
            toast.success("Meal mapping saved successfully");
        } catch (err) {
            toast.error("Failed to save mapping");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !selectedFlight) return <div className="p-10 text-center">Loading flights...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Meal Mapping</h1>
                    <p className="text-slate-500 text-sm">Configure available meals and pricing for specific flights</p>
                </div>
                {selectedFlight && (
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Configuration</>}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Flight List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search flights..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-600/10 outline-none"
                            />
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
                            {flights
                                .filter(f => 
                                    f.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    f.fromAirport?.city?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    f.toAirport?.city?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(f => (
                                <div 
                                    key={f._id}
                                    onClick={() => handleFlightSelect(f)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                                        selectedFlight?._id === f._id ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-black text-blue-600">{f.flightNumber}</span>
                                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold uppercase">{f.airlineId?.name}</span>
                                    </div>
                                    <div className="text-sm font-bold text-slate-800">{f.fromAirport?.city} → {f.toAirport?.city}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold">{f.departureTime ? new Date(f.departureTime).toLocaleDateString() : 'N/A'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mapping Config */}
                <div className="lg:col-span-2">
                    {!selectedFlight ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[400px]">
                            <Utensils size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Select a flight to start mapping</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Toggle Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-800">Meal Availability</h3>
                                        <p className="text-xs text-slate-500">Allow passengers to book meals for this flight</p>
                                    </div>
                                    <button 
                                        onClick={() => setMapping({...mapping, mealAvailable: !mapping.mealAvailable})}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${mapping.mealAvailable ? 'bg-blue-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${mapping.mealAvailable ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            {mapping.mealAvailable && (
                                <div className="space-y-4">
                                    {/* Add Meal Master List */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Available in Master</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {mealMaster.map(m => (
                                                <button 
                                                    key={m._id}
                                                    onClick={() => addMealToMapping(m)}
                                                    className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2"
                                                >
                                                    <Plus size={14} /> {m.name} ({m.mealCode})
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selected Meals Config */}
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Mapped Meals</h3>
                                        {mapping.meals.length === 0 && (
                                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm font-semibold">
                                                No meals mapped yet. Add from the list above.
                                            </div>
                                        )}
                                        {mapping.meals.map(meal => (
                                            <div key={meal.mealCode} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-6">
                                                <div className="flex-1 min-w-[150px]">
                                                    <div className="text-xs font-black text-blue-600 uppercase mb-0.5">{meal.mealCode}</div>
                                                    <div className="text-sm font-bold text-slate-800">{meal.name}</div>
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Price (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        value={meal.price}
                                                        onChange={(e) => updateMealField(meal.mealCode, 'price', parseInt(e.target.value))}
                                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-600/10 outline-none"
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Stock</label>
                                                    <input 
                                                        type="number" 
                                                        value={meal.stock}
                                                        onChange={(e) => updateMealField(meal.mealCode, 'stock', parseInt(e.target.value))}
                                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-600/10 outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 ml-auto">
                                                    <button 
                                                        onClick={() => updateMealField(meal.mealCode, 'available', !meal.available)}
                                                        className={`p-2 rounded-lg transition-all ${meal.available ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                                                    >
                                                        {meal.available ? <Check size={18} /> : <X size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => removeMeal(meal.mealCode)}
                                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Plus = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export default MealMapping;
