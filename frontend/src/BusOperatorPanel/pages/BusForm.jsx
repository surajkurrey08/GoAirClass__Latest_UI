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
} from '../../services/auth';
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

    const [seatLayout, setSeatLayout] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);

    useEffect(() => {
        if (isEdit) {
            fetchBusDetails();
        } else {
            generateDefaultLayout(40);
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
                images: [], // Keep empty for new uploads
            });
            setSeatLayout(bus.seatLayout || []);
            if (bus.images) setPreviewImages(bus.images);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const generateDefaultLayout = (count) => {
        const layout = [];
        for (let i = 1; i <= count; i++) {
            layout.push({
                seatNo: `S${i}`,
                type: 'seater',
                deck: 'lower',
                price: 0
            });
        }
        setSeatLayout(layout);
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
        newLayout[index][field] = value;
        setSeatLayout(newLayout);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/bus-operator/buses')}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </h1>
                        <p className="text-slate-500 font-medium">Configure your bus amenities and seating arrangements.</p>
                    </div>
                </div>
                <button
                    form="bus-form"
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50"
                >
                    <Save size={20} />
                    {loading ? 'Processing...' : (isEdit ? 'Update Details' : 'Register Bus')}
                </button>
            </div>

            <form id="bus-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: General Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <h2 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">General Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bus Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    placeholder="e.g. Garib Rath Express"
                                    value={formData.busName}
                                    onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Plate Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    placeholder="e.g. MH 12 AB 1234"
                                    value={formData.busNumber}
                                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Type</label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.busType}
                                    onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
                                >
                                    <option value="Sleeper">Sleeper AC</option>
                                    <option value="Seater">Semi-Sleeper / Seater</option>
                                    <option value="Sleeper + Seater">Hybrid (Sleeper + Seater)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Capacity</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.totalSeats}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setFormData({ ...formData, totalSeats: val });
                                        generateDefaultLayout(val);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-4 pt-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Onboard Amenities</label>
                            <div className="flex flex-wrap gap-3">
                                {AMENITIES_OPTIONS.map((item) => {
                                    const isActive = formData.amenities.includes(item.label);
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => toggleAmenity(item.label)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${isActive
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-blue-600'
                                                }`}
                                        >
                                            <item.icon size={16} />
                                            {item.label}
                                            {isActive && <Check size={14} className="ml-1" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Seat Layout Builder */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                            <h2 className="text-lg font-black text-slate-800">Seat Grid Configuration</h2>
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {seatLayout.length} Total Nodes
                            </span>
                        </div>

                        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {seatLayout.map((seat, idx) => (
                                <div key={idx} className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const types = ['seater', 'sleeper', 'ladies'];
                                            const nextType = types[(types.indexOf(seat.type) + 1) % types.length];
                                            updateSeat(idx, 'type', nextType);
                                        }}
                                        className={`w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${seat.type === 'seater' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                                seat.type === 'sleeper' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    'bg-pink-50 text-pink-600 border-pink-200'
                                            }`}
                                    >
                                        {seat.seatNo}
                                    </button>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="w-full text-[8px] p-1 bg-slate-50 border-none rounded text-center font-bold focus:ring-1 focus:ring-blue-600/20"
                                        value={seat.price || ''}
                                        onChange={(e) => updateSeat(idx, 'price', parseInt(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4 text-[10px] items-center text-slate-400 font-bold uppercase tracking-widest pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded"></div> Seater</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div> Sleeper</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-pink-50 border border-pink-200 rounded"></div> Ladies</div>
                        </div>
                    </div>
                </div>

                {/* Right: Media & Status */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <h2 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Gallery</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {previewImages.map((src, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl bg-slate-100 relative group overflow-hidden">
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            setPreviewImages(previewImages.filter((_, i) => i !== idx));
                                            setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) });
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-blue-600 hover:text-blue-600 cursor-pointer transition-all">
                                <Upload size={24} />
                                <span className="text-[10px] font-black uppercase mt-2">Upload</span>
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <h2 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Availability</h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800">Operational</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Bus is active in system</span>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-600/20"
                                    checked={formData.status === 'active'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BusForm;
