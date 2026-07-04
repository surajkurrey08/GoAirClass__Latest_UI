
import React, { useState, useEffect } from 'react';
import { Search, Save, Layout, Grid, Info, Check } from 'lucide-react';
import { getFlightInventory, getFlightSeatMapping, saveFlightSeatMapping } from '../../../../services/flightApi';
import { toast } from 'react-toastify';

const SeatMapping = () => {
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [seatConfig, setSeatConfig] = useState([
        { type: 'Standard', color: 'bg-blue-100', price: 0, rows: '5-25' },
        { type: 'Emergency Exit', color: 'bg-amber-100', price: 900, rows: '12-13' },
        { type: 'Extra Legroom', color: 'bg-purple-100', price: 1500, rows: '1' },
        { type: 'Prime', color: 'bg-emerald-100', price: 450, rows: '2-4' }
    ]);

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
            const res = await getFlightSeatMapping(flight._id);
            if (res.success && res.mapping) {
                setSeatConfig(res.mapping.seatTiers);
            } else {
                // Default config if none exists
                setSeatConfig([
                    { type: 'Standard', color: 'bg-blue-100', price: 0, rows: '5-25' },
                    { type: 'Emergency Exit', color: 'bg-amber-100', price: 900, rows: '12-13' },
                    { type: 'Extra Legroom', color: 'bg-purple-100', price: 1500, rows: '1' },
                    { type: 'Prime', color: 'bg-emerald-100', price: 450, rows: '2-4' }
                ]);
            }
        } catch (err) {
            console.error("Error fetching seat mapping:", err);
        }
    };

    const updateSeatField = (index, field, value) => {
        const newConfig = [...seatConfig];
        newConfig[index][field] = value;
        setSeatConfig(newConfig);
    };

    const handleSave = async () => {
        if (!selectedFlight) return;
        setSaving(true);
        try {
            const res = await saveFlightSeatMapping(selectedFlight._id, {
                aircraftType: selectedFlight.aircraftType || 'Airbus A320',
                seatTiers: seatConfig
            });
            if (res.success) {
                toast.success("Seat pricing template applied to flight");
            }
        } catch (err) {
            toast.error("Failed to save seat configuration");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Initializing Cabin Layouts...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Seat <span className="text-blue-600">Mapping</span></h1>
                    <p className="text-slate-500 text-sm">Define seat pricing tiers and cabin configuration</p>
                </div>
                {selectedFlight && (
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-blue-600/20"
                    >
                        {saving ? 'Applying...' : <><Save size={18} /> Save Seat Template</>}
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
                                placeholder="Search flight..." 
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
                                        <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase">{f.aircraftType || 'A320'}</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-500">{f.fromAirport?.city} → {f.toAirport?.city}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Seat Configuration */}
                <div className="lg:col-span-2">
                    {!selectedFlight ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[400px]">
                            <Layout size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Select a flight to map seat tiers</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Aircraft Preview */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-slate-800">Cabin Configuration</h3>
                                        <p className="text-xs text-slate-500">Selected Aircraft: {selectedFlight.aircraftType || 'Airbus A320'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                                        <Grid size={14} /> 3-3 Configuration
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {seatConfig.map((tier, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className={`w-3 h-3 rounded ${tier.color} border border-slate-200`}></div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase">{tier.type}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {seatConfig.map((tier, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 hover:border-blue-600/30 transition-all group">
                                            <div className={`w-12 h-12 rounded-xl ${tier.color} flex items-center justify-center text-slate-500`}>
                                                <Layout size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-slate-400 uppercase">Seat Tier</div>
                                                <div className="font-bold text-slate-800">{tier.type}</div>
                                            </div>
                                            <div className="w-24">
                                                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Rows</div>
                                                <input 
                                                    value={tier.rows} 
                                                    onChange={(e) => updateSeatField(idx, 'rows', e.target.value)}
                                                    className="w-full bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold font-mono" 
                                                />
                                            </div>
                                            <div className="w-24">
                                                <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Price (₹)</div>
                                                <input 
                                                    type="number" 
                                                    value={tier.price} 
                                                    onChange={(e) => updateSeatField(idx, 'price', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-slate-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold" 
                                                />
                                            </div>
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Check size={18} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                <Info className="text-blue-600 shrink-0" size={20} />
                                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                    The seat map will be automatically generated based on the aircraft type and row mappings defined above. Passengers will see these tiers during the seat selection phase of booking.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeatMapping;
