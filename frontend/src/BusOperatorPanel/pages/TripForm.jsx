import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Save, 
    Bus as BusIcon, 
    MapPin, 
    Calendar,
    Clock,
    IndianRupee,
    Plus,
    X,
    Navigation,
    MoreHorizontal
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    fetchTripById, 
    createTrip, 
    updateTrip, 
    fetchMyBuses, 
    fetchRoutes 
} from '../../services/auth';
import { toast } from 'react-toastify';

const TripForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        bus: '',
        route: '',
        departureTime: '',
        arrivalTime: '',
        startDate: '',
        ticketPrice: '',
        boardingPoints: [{ location: '', time: '' }],
        droppingPoints: [{ location: '', time: '' }],
    });

    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [busesData, routesData] = await Promise.all([
                fetchMyBuses(),
                fetchRoutes()
            ]);
            setBuses(busesData || []);
            setRoutes(routesData || []);

            if (isEdit) {
                const trip = await fetchTripById(id);
                setFormData({
                    bus: trip.bus?._id || trip.bus,
                    route: trip.route?._id || trip.route,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
                    ticketPrice: trip.ticketPrice,
                    boardingPoints: trip.boardingPoints || [{ location: '', time: '' }],
                    droppingPoints: trip.droppingPoints || [{ location: '', time: '' }],
                });
            }
        } catch (error) {
            console.error("Fetch Trip Data Error:", error);
            toast.error("Failed to load trip details");
        }
    };

    const addPoint = (type) => {
        const field = type === 'boarding' ? 'boardingPoints' : 'droppingPoints';
        setFormData({
            ...formData,
            [field]: [...formData[field], { location: '', time: '' }]
        });
    };

    const updatePoint = (type, index, field, value) => {
        const listField = type === 'boarding' ? 'boardingPoints' : 'droppingPoints';
        const newList = [...formData[listField]];
        newList[index][field] = value;
        setFormData({ ...formData, [listField]: newList });
    };

    const removePoint = (type, index) => {
        const field = type === 'boarding' ? 'boardingPoints' : 'droppingPoints';
        setFormData({
            ...formData,
            [field]: formData[field].filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await updateTrip(id, formData);
                toast.success("Trip updated successfully");
            } else {
                await createTrip(formData);
                toast.success("Trip scheduled successfully");
            }
            navigate('/bus-operator/trips');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/bus-operator/trips')}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            {isEdit ? 'Modify Schedule' : 'New Trip Schedule'}
                        </h1>
                        <p className="text-slate-500 font-medium">Coordinate your fleet and routes into active journeys.</p>
                    </div>
                </div>
                <button 
                    form="trip-form"
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50"
                >
                    <Save size={20} />
                    {loading ? 'Scheduling...' : (isEdit ? 'Update Schedule' : 'Activate Trip')}
                </button>
            </div>

            <form id="trip-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Core Config */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                        <h2 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Trip Parameters</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Vehicle</label>
                                <select 
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.bus}
                                    onChange={(e) => setFormData({...formData, bus: e.target.value})}
                                >
                                    <option value="">Select Bus</option>
                                    {buses.map(b => <option key={b._id} value={b._id}>{b.busName} ({b.busNumber})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Route</label>
                                <select 
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.route}
                                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                                >
                                    <option value="">Select Route</option>
                                    {routes.map(r => <option key={r._id} value={r._id}>{r.fromCity} → {r.toCity}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                <input 
                                    type="date"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure Time</label>
                                <input 
                                    type="time"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.departureTime}
                                    onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Time</label>
                                <input 
                                    type="time"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.arrivalTime}
                                    onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ticket Fare</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                        value={formData.ticketPrice}
                                        onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Points Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Boarding Points */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Boarding Points</h2>
                                <button type="button" onClick={() => addPoint('boarding')} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.boardingPoints.map((p, i) => (
                                    <div key={i} className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input 
                                            type="text" placeholder="Location" 
                                            className="flex-grow bg-transparent border-none text-xs font-bold focus:ring-0"
                                            value={p.location}
                                            onChange={(e) => updatePoint('boarding', i, 'location', e.target.value)}
                                        />
                                        <input 
                                            type="time" 
                                            className="w-24 bg-transparent border-none text-xs font-bold focus:ring-0"
                                            value={p.time}
                                            onChange={(e) => updatePoint('boarding', i, 'time', e.target.value)}
                                        />
                                        <button type="button" onClick={() => removePoint('boarding', i)} className="text-slate-300 hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dropping Points */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Dropping Points</h2>
                                <button type="button" onClick={() => addPoint('dropping')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.droppingPoints.map((p, i) => (
                                    <div key={i} className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <input 
                                            type="text" placeholder="Location" 
                                            className="flex-grow bg-transparent border-none text-xs font-bold focus:ring-0"
                                            value={p.location}
                                            onChange={(e) => updatePoint('dropping', i, 'location', e.target.value)}
                                        />
                                        <input 
                                            type="time" 
                                            className="w-24 bg-transparent border-none text-xs font-bold focus:ring-0"
                                            value={p.time}
                                            onChange={(e) => updatePoint('dropping', i, 'time', e.target.value)}
                                        />
                                        <button type="button" onClick={() => removePoint('dropping', i)} className="text-slate-300 hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary / Status */}
                <div className="space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-6 shadow-2xl shadow-slate-900/20">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Journey Preview</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500">Departure</p>
                                    <p className="text-sm font-bold">{formData.departureTime || '--:--'}</p>
                                </div>
                            </div>
                            <div className="ml-5 h-8 border-l border-white/10 flex items-center px-4">
                                <Navigation size={14} className="text-slate-600" />
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-green-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500">Arrival (Est)</p>
                                    <p className="text-sm font-bold">{formData.arrivalTime || '--:--'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-500">Ticket Price</span>
                                <span className="text-xl font-black text-blue-400">₹{formData.ticketPrice || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TripForm;
