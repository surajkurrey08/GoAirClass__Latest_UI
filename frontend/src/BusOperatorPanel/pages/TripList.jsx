import React, { useState, useEffect } from 'react';
import {
    Plus,
    Calendar,
    Clock,
    Bus as BusIcon,
    MapPin,
    IndianRupee,
    UserCheck,
    Search,
    ChevronRight,
    ArrowRight,
    Navigation,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    fetchTrips,
    deleteTrip
} from '../../services/auth';
import { toast } from 'react-toastify';

const TripList = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const getTrips = async () => {
        try {
            setLoading(true);
            const data = await fetchTrips();
            setTrips(data);
        } catch (error) {
            console.error("Fetch Trips Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTrips();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete trip on bus ${name}?`)) return;
        try {
            await deleteTrip(id);
            toast.success("Trip deleted successfully");
            getTrips();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Trip Schedules</h1>
                    <p className="text-slate-500 font-medium">Coordinate your fleet deployment and set up ticket pricing.</p>
                </div>
                <button
                    onClick={() => navigate('/bus-operator/trips/add')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                    Schedule New Trip
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.length === 0 ? (
                        <div className="bg-white p-20 rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                                <Calendar size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">No active trips</h3>
                            <p className="text-slate-500 max-w-xs mt-2 font-medium">You haven't scheduled any bus trips yet. Start by creating your first trip.</p>
                        </div>
                    ) : (
                        trips.map((trip) => (
                            <div key={trip._id} className="bg-white group p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8 items-center">
                                {/* Time & Status */}
                                <div className="flex flex-col items-center justify-center min-w-[120px] py-4 bg-slate-50 rounded-2xl px-6">
                                    <span className="text-2xl font-black text-slate-800 leading-none">{trip.departureTime}</span>
                                    <span className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Departure</span>
                                    <div className="w-full h-px bg-slate-200 my-3"></div>
                                    <span className="text-sm font-bold text-slate-600">{trip.arrivalTime}</span>
                                    <span className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">Arrival</span>
                                    
                                    {/* Schedule/Trip Status Badge */}
                                    <div className="mt-4 flex flex-col items-center gap-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                            trip.status === 'active' ? 'bg-green-50 text-green-600' : 
                                            trip.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                                            'bg-slate-50 text-slate-400'
                                        }`}>
                                            {trip.status || 'pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Trip Details */}
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                            <MapPin size={12} />
                                            {trip.route?.fromCity}
                                        </div>
                                        <ArrowRight size={14} className="text-slate-300" />
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                            <Navigation size={12} />
                                            {trip.route?.toCity}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                <BusIcon size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bus Assigned</p>
                                                <p className="text-sm font-black text-slate-800">{trip.bus?.busName} <span className="text-slate-400 font-medium ml-1">({trip.bus?.busNumber})</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
                                                <p className="text-sm font-black text-slate-800">{new Date(trip.startDate).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & Seats */}
                                <div className="flex items-center gap-4 min-w-fit">
                                    <div className="text-right px-6 border-l border-slate-100">
                                        <div className="flex items-center justify-end gap-1 text-slate-400 mb-1">
                                            <IndianRupee size={12} />
                                            <span className="text-[10px] uppercase font-black tracking-widest">Ticket Price</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">₹{trip.ticketPrice}</p>
                                        <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-tight text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                            <UserCheck size={12} />
                                            {trip.availableSeats} Seats Left
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/bus-operator/trips/edit/${trip._id}`)}
                                        className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all group-hover:scale-105 active:scale-95"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default TripList;
