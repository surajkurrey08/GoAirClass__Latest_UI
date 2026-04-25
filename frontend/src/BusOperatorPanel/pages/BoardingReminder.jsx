import React, { useState, useEffect } from 'react';
import { 
    Bell, 
    Bus, 
    User, 
    Phone, 
    ChevronRight, 
    Save, 
    Send, 
    CheckCircle2, 
    MapPin, 
    Calendar,
    Users,
    Eye,
    X,
    Info,
    Clock,
    Zap
} from 'lucide-react';
import { 
    fetchTrips, 
    getTripManifest, 
    updateTripDriverDetails, 
    sendBoardingReminders 
} from '../../services/operatorService';
import { toast } from 'react-toastify';

const BoardingReminder = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [manifest, setManifest] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [autoSend, setAutoSend] = useState(true);
    
    const [formData, setFormData] = useState({
        driverName: '',
        driverPhone: '',
        pickupContactName: '',
        pickupContactPhone: ''
    });

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        try {
            setLoading(true);
            const data = await fetchTrips();
            setTrips(data || []);
        } catch (error) {
            toast.error("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const handleTripSelect = async (tripId) => {
        const trip = trips.find(t => t._id === tripId);
        setSelectedTrip(trip);
        
        if (trip) {
            setFormData({
                driverName: trip.driverName || '',
                driverPhone: trip.driverPhone || '',
                pickupContactName: trip.pickupContactName || '',
                pickupContactPhone: trip.pickupContactPhone || ''
            });

            try {
                const data = await getTripManifest(tripId);
                setManifest(data.manifest || []);
            } catch (error) {
                toast.error("Failed to load passenger manifest");
            }
        }
    };

    const handleSaveDetails = async () => {
        if (!selectedTrip) return;
        setActionLoading(true);
        try {
            await updateTripDriverDetails({
                tripId: selectedTrip._id,
                ...formData
            });
            toast.success("Driver details saved successfully");
            loadTrips(); // Refresh trip data
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendReminders = async () => {
        if (!selectedTrip) return;
        if (!formData.driverName || !formData.driverPhone) {
            return toast.warning("Please fill driver details before sending reminders");
        }

        setActionLoading(true);
        try {
            await sendBoardingReminders(selectedTrip._id);
            toast.success("All reminders sent successfully!");
            // Refresh manifest to show 'Sent' status
            const data = await getTripManifest(selectedTrip._id);
            setManifest(data.manifest || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Modal for Message Preview
    const PreviewModal = () => {
        if (!showPreview || !selectedTrip) return null;

        const firstPassenger = manifest[0] || { name: '{Passenger Name}', boardingPoint: '{Point}' };
        
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <button 
                            onClick={() => setShowPreview(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-black tracking-tight">Message Preview</h3>
                        <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">Sent via SMS/WhatsApp</p>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[32px] border-2 border-slate-100 relative">
                            <div className="absolute -top-3 -left-3 bg-blue-600 text-white p-2 rounded-xl">
                                <Zap size={16} />
                            </div>
                            <div className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                                {`Dear ${firstPassenger.name},

Greetings from ${selectedTrip.bus?.busName || 'GoAirClass'}!

Your bus is scheduled to depart soon.
Bus No: ${selectedTrip.bus?.busNumber || 'N/A'}
PNR: ${firstPassenger.pnr || 'PNR12345'}

Pickup Point: ${firstPassenger.boardingPoint}
Driver: ${formData.driverName || '{Driver}'} (${formData.driverPhone || '{Phone}'})

Have a safe journey!`}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700">
                            <Info size={18} />
                            <p className="text-[10px] font-bold">This message will be personalized for each passenger with their PNR and Pickup Point.</p>
                        </div>

                        <button 
                            onClick={() => setShowPreview(false)}
                            className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black hover:bg-black transition-all"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-50/30">
            <PreviewModal />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        Boarding Reminders
                        <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-600/20">
                            Production Ready
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Manage passenger manifests, driver details and automated boarding alerts.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 p-2 pr-6 rounded-full border transition-all ${autoSend ? 'bg-green-50 border-green-100' : 'bg-slate-100 border-slate-200'}`}>
                        <button 
                            onClick={() => setAutoSend(!autoSend)}
                            className={`w-12 h-6 rounded-full relative transition-all ${autoSend ? 'bg-green-500' : 'bg-slate-400'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoSend ? 'left-7' : 'left-1'}`}></div>
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Auto Send</span>
                            <span className={`text-xs font-black ${autoSend ? 'text-green-600' : 'text-slate-600'}`}>{autoSend ? 'Enabled' : 'Disabled'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Trip Selection & Driver Info */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Select Trip Card */}
                    <div className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/20">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Select Active Trip</label>
                        <select 
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                            onChange={(e) => handleTripSelect(e.target.value)}
                            value={selectedTrip?._id || ''}
                        >
                            <option value="">Choose a trip...</option>
                            {trips.map(t => (
                                <option key={t._id} value={t._id}>
                                    {t.departureTime} | {t.bus?.busName} ({t.bus?.busNumber}) | {t.route?.fromCity} → {t.route?.toCity}
                                </option>
                            ))}
                        </select>
                        
                        {selectedTrip && (
                            <div className="mt-6 p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-600/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Bus size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Active</span>
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-tight">{selectedTrip.bus?.busName}</h4>
                                <p className="text-[10px] font-bold text-blue-100 mt-1">{selectedTrip.bus?.busNumber}</p>
                                <div className="mt-4 flex items-center gap-3 text-blue-100">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold">{new Date(selectedTrip.startDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Driver Details Card */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/20 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Driver Info</h2>
                            <div className="p-2 bg-slate-50 rounded-xl">
                                <User size={16} className="text-slate-400" />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Ramesh Kumar"
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.driverName}
                                    onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <input 
                                    type="text"
                                    placeholder="Driver's Mobile"
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.driverPhone}
                                    onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                                />
                            </div>

                            <div className="h-px bg-slate-100 my-2"></div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pickup Contact</label>
                                <input 
                                    type="text"
                                    placeholder="Point Contact Name"
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.pickupContactName}
                                    onChange={(e) => setFormData({...formData, pickupContactName: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                                <input 
                                    type="text"
                                    placeholder="Point Mobile"
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                                    value={formData.pickupContactPhone}
                                    onChange={(e) => setFormData({...formData, pickupContactPhone: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveDetails}
                            disabled={!selectedTrip || actionLoading}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                        >
                            <Save size={18} />
                            Update Details
                        </button>
                    </div>
                </div>

                {/* Right: Passenger Manifest & Actions */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[40px] border border-slate-200/60 shadow-2xl shadow-slate-200/10 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Passenger Manifest</h2>
                                <span className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {manifest.length} Passengers
                                </span>
                            </div>
                            
                            {selectedTrip && (
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setShowPreview(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all"
                                    >
                                        <Eye size={16} />
                                        Preview Message
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-grow">
                            {!selectedTrip ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-20">
                                    <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8 transform -rotate-6">
                                        <Users size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">No Trip Selected</h3>
                                    <p className="text-slate-400 max-w-xs mt-3 font-bold text-sm uppercase tracking-widest">Select a trip to load the passenger manifest</p>
                                </div>
                            ) : manifest.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-20">
                                    <div className="w-20 h-20 bg-blue-50 rounded-[30px] flex items-center justify-center text-blue-200 mb-8 animate-pulse">
                                        <Zap size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">No Bookings Yet</h3>
                                    <p className="text-slate-500 max-w-xs mt-3 font-medium">Wait for passengers to confirm their journey for this trip.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger Details</th>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seat No.</th>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Boarding Point</th>
                                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {manifest.map((p, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                {p.name.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-slate-900">{p.name}</span>
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <Phone size={10} />
                                                                    <span className="text-[10px] font-bold tracking-wider">{p.phone}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black shadow-sm shadow-blue-600/5">
                                                            {p.seat}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-1.5 bg-slate-50 rounded-lg">
                                                                <MapPin size={12} className="text-slate-400" />
                                                            </div>
                                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{p.boardingPoint}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        {p.status === 'Sent' ? (
                                                            <div className="flex items-center gap-2 text-green-600">
                                                                <CheckCircle2 size={18} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Sent</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Clock size={18} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {selectedTrip && manifest.length > 0 && (
                            <div className="p-10 bg-white border-t border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-slate-50 rounded-3xl">
                                        <Info size={24} className="text-slate-300" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Manual Action</span>
                                        <span className="text-sm font-bold text-slate-800">Dispatch reminders to all passengers now.</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSendReminders}
                                    disabled={actionLoading}
                                    className="flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-[28px] font-black shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Send size={22} />
                                    )}
                                    Send Reminders Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardingReminder;
