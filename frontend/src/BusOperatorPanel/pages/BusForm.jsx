import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Upload,
    Wifi,
    Battery,
    Tv,
    Monitor,
    Snowflake,
    Coffee,
    Plus,
    X,
    Save,
    LayoutGrid,
    Check
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    fetchBusById, 
    createBus, 
    updateBus 
} from '../../services/operatorService';
import { toast } from 'react-toastify';

const AMENITIES_OPTIONS = [
    { label: 'WiFi', icon: Wifi },
    { label: 'Charging Port', icon: Battery },
    { label: 'LED TV', icon: Monitor },
    { label: 'AC', icon: Snowflake },
    { label: 'Refreshments', icon: Coffee },
    { label: 'Water Bottle', icon: X },
    { label: 'Blanket', icon: X }
];

const BusForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        busName: '',
        busNumber: '',
        busType: 'Sleeper',
        totalSeats: 40,
        amenities: [],
        status: 'active',
        images: [],
    });

    const [layoutType, setLayoutType] = useState('');
    const [basePrice, setBasePrice] = useState('0');
    const [seatLayout, setSeatLayout] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]); // Mixed blobs and URLs
    const [existingImages, setExistingImages] = useState([]); // Only server URLs

    useEffect(() => {
        if (isEdit) {
            fetchBusDetails();
        }
    }, [id]);

    const fetchBusDetails = async () => {
        try {
            const bus = await fetchBusById(id);
            setFormData({
                busName: bus.busName,
                busNumber: bus.busNumber,
                busType: bus.busType,
                totalSeats: bus.totalSeats,
                amenities: bus.amenities || [],
                status: bus.status,
                images: [],
            });
            setSeatLayout(bus.seatLayout || []);
            if (bus.images) {
                setPreviewImages(bus.images);
                setExistingImages(bus.images);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const generateLayout = () => {
        if (!layoutType || !formData.totalSeats) {
            return toast.warning('Please set capacity and select a layout template');
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
                            isLadies: false,
                            deck: 'lower',
                            side: c <= 2 ? 'left' : 'right',
                            price: price
                        });
                    }
                }
            }
        } else if (layoutType === '2x1 Sleeper' || layoutType === '1x2 Sleeper') {
            const seatsPerDeck = Math.ceil(count / 2);
            ['lower', 'upper'].forEach(deck => {
                const rows = Math.ceil(seatsPerDeck / 3);
                for (let r = 1; r <= rows; r++) {
                    for (let c = 1; c <= 3; c++) {
                        const idxInDeck = (r - 1) * 3 + c;
                        const globalIdx = deck === 'lower' ? idxInDeck : idxInDeck + seatsPerDeck;
                        if (globalIdx <= count && idxInDeck <= seatsPerDeck) {
                            newLayout.push({
                                seatNo: `${deck === 'upper' ? 'U' : 'L'}${idxInDeck}`,
                                row: r,
                                col: c,
                                type: 'sleeper',
                                isLadies: false,
                                deck: deck,
                                side: layoutType === '2x1 Sleeper' ? (c <= 2 ? 'left' : 'right') : (c === 1 ? 'left' : 'right'),
                                price: price + (deck === 'upper' ? 200 : 0)
                            });
                        }
                    }
                }
            });
        }
        setSeatLayout(newLayout);
        toast.success(`Generated ${newLayout.length} seats`);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
        
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...previews]);
    };

    const toggleAmenity = (label) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(label)
                ? prev.amenities.filter(a => a !== label)
                : [...prev.amenities, label]
        }));
    };

    const updateSeat = (index, field, value) => {
        const newLayout = [...seatLayout];
        newLayout[index] = { ...newLayout[index], [field]: value };
        setSeatLayout(newLayout);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (seatLayout.length === 0) return toast.error("Please generate seat layout first");
        
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'images') {
                    formData.images.forEach(file => data.append('images', file));
                } else if (Array.isArray(formData[key])) {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });
            data.append('seatLayout', JSON.stringify(seatLayout));
            data.append('existingImages', JSON.stringify(existingImages));

            if (isEdit) {
                await updateBus(id, data);
                toast.success("Bus updated successfully");
            } else {
                await createBus(data);
                toast.success("Bus created successfully");
            }
            navigate('/bus-operator/buses');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/bus-operator/buses')}
                        className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {isEdit ? 'Vehicle Configuration' : 'Register New Fleet'}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Define seat mappings and onboard comfort features.</p>
                    </div>
                </div>
                <button
                    form="bus-form"
                    disabled={loading}
                    className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    <Save size={24} />
                    {loading ? 'Processing...' : (isEdit ? 'Update Vehicle' : 'Confirm Registration')}
                </button>
            </div>

            <form id="bus-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left: General Info & Layout */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-200/20 space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <LayoutGrid size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Core Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Vehicle Identity</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all"
                                    placeholder="e.g. Scania Multiaxle"
                                    value={formData.busName}
                                    onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Registration Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-black focus:ring-2 focus:ring-blue-600/10 transition-all uppercase"
                                    placeholder="MH 12 AB 1234"
                                    value={formData.busNumber}
                                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Seating Type</label>
                                <select
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer"
                                    value={formData.busType}
                                    onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                                >
                                    <option value="Sleeper">Sleeper AC</option>
                                    <option value="Seater">Seater / Semi-Sleeper</option>
                                    <option value="Hybrid">Hybrid (Sleeper + Seater)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Max Capacity</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] text-sm font-black focus:ring-2 focus:ring-blue-600/10 transition-all"
                                    value={formData.totalSeats}
                                    onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Onboard Comforts</label>
                            <div className="flex flex-wrap gap-4">
                                {AMENITIES_OPTIONS.map((item) => {
                                    const isActive = formData.amenities.includes(item.label);
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => toggleAmenity(item.label)}
                                            className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-xs font-black transition-all border ${isActive
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-blue-600 hover:text-blue-600'
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                            {isActive && <Check size={16} className="ml-1" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Seat Layout Builder */}
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-xl shadow-slate-200/20 space-y-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <LayoutGrid size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Layout Architect</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <select 
                                    className="px-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
                                    value={layoutType}
                                    onChange={e => setLayoutType(e.target.value)}
                                >
                                    <option value="">Choose Template</option>
                                    <option value="2x2 Seater">2x2 Seater</option>
                                    <option value="2x1 Sleeper">2x1 Sleeper</option>
                                    <option value="1x2 Sleeper">1x2 Sleeper</option>
                                </select>
                                <input 
                                    type="number"
                                    placeholder="Price"
                                    value={basePrice}
                                    onChange={e => setBasePrice(e.target.value)}
                                    className="w-24 px-4 py-4 bg-slate-50 border-none rounded-2xl text-xs font-black placeholder:text-slate-300"
                                />
                                <button 
                                    type="button"
                                    onClick={generateLayout}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                                >
                                    Map Seats
                                </button>
                            </div>
                        </div>

                        {seatLayout.length > 0 ? (
                            <div className="overflow-x-auto rounded-[2rem] border border-slate-100 bg-slate-50/50">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-6 py-6">Seat No</th>
                                            <th className="px-6 py-6">Pos (R/C)</th>
                                            <th className="px-6 py-6">Type</th>
                                            <th className="px-6 py-6">Deck</th>
                                            <th className="px-6 py-6">Side</th>
                                            <th className="px-6 py-6">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {seatLayout.map((seat, idx) => (
                                            <tr key={idx} className="hover:bg-white transition-colors">
                                                <td className="px-6 py-4">
                                                    <input 
                                                        value={seat.seatNo}
                                                        onChange={e => updateSeat(idx, 'seatNo', e.target.value)}
                                                        className="w-12 bg-transparent font-black text-slate-700 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 font-bold text-slate-500">
                                                        <input type="number" value={seat.row} onChange={e => updateSeat(idx, 'row', parseInt(e.target.value))} className="w-8 bg-transparent" />
                                                        <span className="text-slate-300">/</span>
                                                        <input type="number" value={seat.col} onChange={e => updateSeat(idx, 'col', parseInt(e.target.value))} className="w-8 bg-transparent" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select 
                                                        value={seat.type}
                                                        onChange={e => updateSeat(idx, 'type', e.target.value)}
                                                        className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                                                    >
                                                        <option value="seater">Seater</option>
                                                        <option value="sleeper">Sleeper</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${seat.deck === 'upper' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {seat.deck}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{seat.side}</span>
                                                </td>
                                                <td className="px-6 py-4">
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm">
                                    <LayoutGrid size={40} />
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-500 font-bold">No Mapping Generated</p>
                                    <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Select a template above to initialize coordinates</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Media & Status */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-200/20 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Upload size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Fleet Gallery</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {previewImages.map((src, idx) => {
                                const isExisting = existingImages.includes(src);
                                return (
                                    <div key={idx} className="aspect-square rounded-[1.5rem] bg-slate-100 relative group overflow-hidden shadow-sm">
                                        <img src={src.startsWith('blob') ? src : `${import.meta.env.VITE_API_URL || ''}${src}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                setPreviewImages(prev => prev.filter((_, i) => i !== idx));
                                                if (isExisting) {
                                                    setExistingImages(prev => prev.filter(img => img !== src));
                                                } else {
                                                    // It's a new file, find its index in formData.images
                                                    // This is tricky because previewImages and formData.images indices don't match 1:1 if we have mixed existing
                                                    // Easier to just keep track of new files separately or use a more robust state
                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        images: prev.images.filter((_, i) => {
                                                            // Calculate index in new images array
                                                            const newFilesBefore = previewImages.slice(0, idx).filter(s => s.startsWith('blob')).length;
                                                            return i !== newFilesBefore;
                                                        }) 
                                                    }));
                                                }
                                            }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                            <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-blue-600 hover:text-blue-600 cursor-pointer transition-all hover:bg-blue-50/30">
                                <Plus size={24} />
                                <span className="text-[10px] font-black uppercase mt-2">Add Photo</span>
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-200/20 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Check size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Publishing</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] cursor-pointer group hover:bg-slate-100/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 tracking-tight">Active Mode</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Visible to passengers</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-600/10 cursor-pointer"
                                    checked={formData.status === 'active'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50">
                         <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest text-center px-4">
                            Ensure mapping is generated before deployment to maintain seat availability accuracy.
                         </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BusForm;
