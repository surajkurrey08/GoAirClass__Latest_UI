
import React, { useState, useEffect } from 'react';
import { Search, Save, Luggage, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { getFlightInventory, getFlightBaggageMapping, saveFlightBaggageMapping } from '../../../../services/flightApi';
import { toast } from 'react-toastify';

const BaggageMapping = () => {
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [mapping, setMapping] = useState({
        cabinBaggage: '7 kg',
        checkInBaggage: '15 kg',
        isExtraAllowed: true,
        extraTiers: [
            { code: 'XB5', label: 'Extra 5kg', weight: 5, price: 2500 },
            { code: 'XB10', label: 'Extra 10kg', weight: 10, price: 4500 }
        ]
    });

    useEffect(() => {
        fetchFlights();
    }, []);

    const fetchFlights = async () => {
        try {
            const res = await getFlightInventory();
            if (res.success) setFlights(res.flights || []);
        } catch (err) {
            toast.error("Failed to load flights");
        } finally {
            setLoading(false);
        }
    };

    const handleFlightSelect = async (flight) => {
        setSelectedFlight(flight);
        try {
            const res = await getFlightBaggageMapping(flight._id);
            if (res.success && res.mapping) {
                setMapping(res.mapping);
            } else {
                setMapping({
                    cabinBaggage: '7 kg',
                    checkInBaggage: '15 kg',
                    isExtraAllowed: true,
                    extraTiers: [
                        { code: 'XB5', label: 'Extra 5kg', weight: 5, price: 2500 },
                        { code: 'XB10', label: 'Extra 10kg', weight: 10, price: 4500 }
                    ]
                });
            }
        } catch (err) {
            console.error("Error loading baggage mapping:", err);
        }
    };

    const handleSave = async () => {
        if (!selectedFlight) return;
        setSaving(true);
        try {
            const res = await saveFlightBaggageMapping(selectedFlight._id, mapping);
            if (res.success) {
                toast.success("Baggage policy updated for this flight");
            }
        } catch (err) {
            toast.error("Failed to save baggage policy");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Fleet...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Baggage <span className="text-blue-600">Mapping</span></h1>
                    <p className="text-slate-500 text-sm">Configure weight limits and extra baggage pricing per flight</p>
                </div>
                {selectedFlight && (
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-blue-600/20"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Update Policy</>}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Flight Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search flight number..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600/10"
                            />
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
                            {flights
                                .filter(f => f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(f => (
                                <div 
                                    key={f._id}
                                    onClick={() => handleFlightSelect(f)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                        selectedFlight?._id === f._id ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-black text-slate-800">{f.flightNumber}</span>
                                        <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-slate-100 uppercase">{f.airlineId?.name}</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-500">{f.fromAirport?.city} → {f.toAirport?.city}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Baggage Configuration */}
                <div className="lg:col-span-2">
                    {!selectedFlight ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[400px]">
                            <Luggage size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Select a flight to configure baggage policy</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Standard Allowance */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <ShieldCheck className="text-blue-600" size={20} /> Standard Allowance
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cabin Baggage</label>
                                        <select 
                                            value={mapping.cabinBaggage}
                                            onChange={e => setMapping({...mapping, cabinBaggage: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-600/20"
                                        >
                                            <option>7 kg</option>
                                            <option>10 kg</option>
                                            <option>Not Allowed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-in Baggage</label>
                                        <select 
                                            value={mapping.checkInBaggage}
                                            onChange={e => setMapping({...mapping, checkInBaggage: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-600/20"
                                        >
                                            <option>15 kg</option>
                                            <option>20 kg</option>
                                            <option>25 kg</option>
                                            <option>30 kg</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Extra Baggage Tiers */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-black text-slate-800">Additional Baggage Tiers</h3>
                                    <button className="text-blue-600 font-black text-xs uppercase flex items-center gap-1 hover:underline">
                                        <Plus size={14} /> Add Tier
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {mapping.extraTiers.map((rule, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-blue-600 uppercase">{rule.code}</div>
                                                <div className="font-bold text-slate-800">{rule.label}</div>
                                            </div>
                                            <div className="w-32">
                                                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Price (₹)</div>
                                                <input 
                                                    type="number" 
                                                    value={rule.price} 
                                                    onChange={e => {
                                                        const newTiers = [...mapping.extraTiers];
                                                        newTiers[idx].price = parseInt(e.target.value) || 0;
                                                        setMapping({...mapping, extraTiers: newTiers});
                                                    }}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold" 
                                                />
                                            </div>
                                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BaggageMapping;
