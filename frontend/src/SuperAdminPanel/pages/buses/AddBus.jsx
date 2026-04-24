import React, { useState, useEffect } from 'react';
import { 
    Plus, Bus, ShieldCheck, MapPin, Settings2, 
    Image as ImageIcon, Loader2, Save, Trash2, 
    PlusCircle, Info, Layout
} from 'lucide-react';
import { fetchAllOperators, fetchBusTypes, createAdminBus } from '../../../services/adminBus';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AddBus() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [operators, setOperators] = useState([]);
    const [busTypes, setBusTypes] = useState([]);
    const [fetchingData, setFetchingData] = useState(true);

    const [formData, setFormData] = useState({
        busName: '',
        busType: '',
        busNumber: '',
        totalSeats: '',
        operator: '',
        amenities: [],
        images: [],
        seatLayout: [],
        status: 'active'
    });

    const [currentAmenity, setCurrentAmenity] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [opsRes, typesRes] = await Promise.all([
                    fetchAllOperators(),
                    fetchBusTypes()
                ]);
                if (opsRes.success) setOperators(opsRes.operators);
                if (typesRes.success) setBusTypes(typesRes.types);
            } catch (error) {
                toast.error('Failed to load selection data');
            } finally {
                setFetchingData(false);
            }
        };
        loadInitialData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.operator || !formData.busType) {
            return toast.error('Please select both operator and bus type');
        }

        setLoading(true);
        try {
            const res = await createAdminBus({
                ...formData,
                totalSeats: parseInt(formData.totalSeats)
            });
            if (res.success) {
                toast.success('Bus added to fleet successfully');
                navigate('/super-admin/buses/all');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add bus');
        } finally {
            setLoading(false);
        }
    };

    const addAmenity = () => {
        if (currentAmenity.trim() && !formData.amenities.includes(currentAmenity.trim())) {
            setFormData({
                ...formData, 
                amenities: [...formData.amenities, currentAmenity.trim()]
            });
            setCurrentAmenity('');
        }
    };

    const removeAmenity = (index) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.filter((_, i) => i !== index)
        });
    };

    const [layoutType, setLayoutType] = useState('');
    const [basePrice, setBasePrice] = useState('');

    const generateLayout = () => {
        if (!layoutType || !formData.totalSeats) {
            return toast.warning('Please set total seats and select a layout template first');
        }

        const count = parseInt(formData.totalSeats);
        const newLayout = [];
        const price = parseInt(basePrice) || 0;

        if (layoutType === '2x2 Seater') {
            const rows = Math.ceil(count / 4);
            for (let r = 1; r <= rows; r++) {
                for (let c = 1; c <= 4; c++) {
                    const idx = (r - 1) * 4 + c;
                    if (idx <= count) {
                        newLayout.push({
                            seatNo: idx.toString(),
                            row: r,
                            col: c,
                            type: 'seater',
                            deck: 'lower',
                            side: c <= 2 ? 'left' : 'right',
                            price: price
                        });
                    }
                }
            }
        } else if (layoutType === '2x1 Sleeper' || layoutType === '1x2 Sleeper') {
            // Sleeper layout usually 3 seats per row across the bus
            // Let's assume 15 lower, 15 upper = 30 seats
            const seatsPerDeck = Math.ceil(count / 2);
            ['lower', 'upper'].forEach(deck => {
                const rows = Math.ceil(seatsPerDeck / 3);
                for (let r = 1; r <= rows; r++) {
                    for (let c = 1; c <= 3; c++) {
                        const idxInDeck = (r - 1) * 3 + c;
                        if (idxInDeck <= seatsPerDeck) {
                            const globalIdx = deck === 'lower' ? idxInDeck : idxInDeck + seatsPerDeck;
                            if (globalIdx <= count) {
                                newLayout.push({
                                    seatNo: `${deck === 'upper' ? 'U' : 'L'}${idxInDeck}`,
                                    row: r,
                                    col: c,
                                    type: 'sleeper',
                                    deck: deck,
                                    side: layoutType === '2x1 Sleeper' ? (c <= 2 ? 'left' : 'right') : (c === 1 ? 'left' : 'right'),
                                    price: price + (deck === 'upper' ? 200 : 0)
                                });
                            }
                        }
                    }
                }
            });
        }

        setFormData({ ...formData, seatLayout: newLayout });
        toast.success(`Generated ${newLayout.length} seats based on ${layoutType} template`);
    };

    const updateSeat = (index, field, value) => {
        const updated = [...formData.seatLayout];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, seatLayout: updated });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">Fleet Architect</h1>
                    <p className="text-slate-500 font-medium mt-2">Design custom seating layouts and comfort configurations</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                            <p className="text-sm font-bold text-slate-700">Validated Schema</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Section: Config */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Bus Identity Card */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-slate-50">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                <Bus size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Core Specifications</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Bus Brand Name</label>
                                <input 
                                    required
                                    value={formData.busName}
                                    onChange={e => setFormData({...formData, busName: e.target.value})}
                                    placeholder="Scania / Volvo Multiaxle"
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm focus:ring-2 focus:ring-blue-600/10 transition-all font-bold placeholder:text-slate-300"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Plate Number</label>
                                <input 
                                    required
                                    value={formData.busNumber}
                                    onChange={e => setFormData({...formData, busNumber: e.target.value})}
                                    placeholder="MH-12-PQ-0001"
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm focus:ring-2 focus:ring-blue-600/10 transition-all font-black placeholder:text-slate-300 uppercase"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Passenger Capacity</label>
                                <input 
                                    required
                                    type="number"
                                    value={formData.totalSeats}
                                    onChange={e => setFormData({...formData, totalSeats: e.target.value})}
                                    placeholder="e.g. 36"
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm focus:ring-2 focus:ring-blue-600/10 transition-all font-black placeholder:text-slate-300"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Vehicle Category</label>
                                <select 
                                    required
                                    value={formData.busType}
                                    onChange={e => setFormData({...formData, busType: e.target.value})}
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm focus:ring-2 focus:ring-blue-600/10 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    {busTypes.map(type => (
                                        <option key={type._id} value={type.name}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Layout Architect Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <Layout size={120} />
                        </div>

                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                    <Settings2 size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Seat Layout Designer</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Dynamic Mapping System</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <select 
                                    className="px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-600/10"
                                    value={layoutType}
                                    onChange={e => setLayoutType(e.target.value)}
                                >
                                    <option value="">Template Type</option>
                                    <option value="2x2 Seater">2x2 Seater</option>
                                    <option value="2x1 Sleeper">2x1 Sleeper</option>
                                    <option value="1x2 Sleeper">1x2 Sleeper</option>
                                    <option value="Custom">Custom Blank</option>
                                </select>
                                <input 
                                    type="number"
                                    placeholder="Base Price"
                                    value={basePrice}
                                    onChange={e => setBasePrice(e.target.value)}
                                    className="w-28 px-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black placeholder:text-slate-300"
                                />
                                <button 
                                    type="button"
                                    onClick={generateLayout}
                                    className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        {formData.seatLayout.length > 0 ? (
                            <div className="space-y-8">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-4 py-4">No.</th>
                                                <th className="px-4 py-4">Row/Col</th>
                                                <th className="px-4 py-4">Type</th>
                                                <th className="px-4 py-4">Deck</th>
                                                <th className="px-4 py-4">Side</th>
                                                <th className="px-4 py-4">Price</th>
                                                <th className="px-4 py-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {formData.seatLayout.map((seat, idx) => (
                                                <tr key={idx} className="group hover:bg-white transition-colors">
                                                    <td className="px-4 py-3">
                                                        <input 
                                                            value={seat.seatNo}
                                                            onChange={e => updateSeat(idx, 'seatNo', e.target.value)}
                                                            className="w-12 bg-transparent font-black text-slate-700 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <input type="number" value={seat.row} onChange={e => updateSeat(idx, 'row', parseInt(e.target.value))} className="w-8 bg-transparent text-slate-500 font-bold" />
                                                            <span className="text-slate-300">/</span>
                                                            <input type="number" value={seat.col} onChange={e => updateSeat(idx, 'col', parseInt(e.target.value))} className="w-8 bg-transparent text-slate-500 font-bold" />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select 
                                                            value={seat.type}
                                                            onChange={e => updateSeat(idx, 'type', e.target.value)}
                                                            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none"
                                                        >
                                                            <option value="seater">Seater</option>
                                                            <option value="sleeper">Sleeper</option>
                                                            <option value="ladies">Ladies</option>
                                                            <option value="ladies-sleeper">L.Sleeper</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${seat.deck === 'upper' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {seat.deck}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{seat.side}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center text-slate-700 font-bold">
                                                            <span className="text-slate-300 mr-1">₹</span>
                                                            <input 
                                                                type="number"
                                                                value={seat.price}
                                                                onChange={e => updateSeat(idx, 'price', parseInt(e.target.value))}
                                                                className="w-16 bg-transparent focus:outline-none"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const filtered = formData.seatLayout.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, seatLayout: filtered });
                                                            }}
                                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-center">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, seatLayout: [...formData.seatLayout, { seatNo: '?', row: 0, col: 0, type: 'seater', deck: 'lower', side: 'left', price: parseInt(basePrice) || 0 }] })}
                                        className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                                    >
                                        <Plus size={14} /> Add Single Seat
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm">
                                    <Layout size={40} />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 font-bold">No Layout Defined</p>
                                    <p className="text-slate-400 text-xs mt-1">Select a template above to auto-generate coordinates</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Meta & Submit */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-slate-50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Assignment</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Operator Partner</label>
                                <select 
                                    required
                                    value={formData.operator}
                                    onChange={e => setFormData({...formData, operator: e.target.value})}
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm focus:ring-2 focus:ring-blue-600/10 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Select Company</option>
                                    {operators.map(op => (
                                        <option key={op._id} value={op._id}>{op.companyName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Comfort Features</label>
                                <div className="flex gap-2">
                                    <input 
                                        value={currentAmenity}
                                        onChange={e => setCurrentAmenity(e.target.value)}
                                        placeholder="AC, WiFi..."
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                        className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600/10"
                                    />
                                    <button type="button" onClick={addAmenity} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {formData.amenities.map((a, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 flex items-center gap-2 shadow-sm uppercase tracking-tighter">
                                            {a}
                                            <button onClick={() => removeAmenity(i)} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 space-y-4">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-lg hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            DEPLOY TO FLEET
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full py-4 text-slate-400 font-black hover:text-slate-600 transition-all uppercase tracking-[0.2em] text-[10px]"
                        >
                            Cancel Deployment
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
