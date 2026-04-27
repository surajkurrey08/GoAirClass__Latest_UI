import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
    Bus, MapPin, Clock, Calendar,
    ChevronRight, Armchair, CheckCircle2,
    Info, CreditCard, ArrowRight,
    Loader2, Ticket, Star, X,
    ChevronLeft, Camera, ShieldCheck,
    Navigation, Trash2
} from 'lucide-react';
import { getBusSeatLayout } from '../services/busService';
import { toast } from 'react-toastify';

export default function SeatSelection() {
    const { scheduleId } = useParams();
    const [searchParams] = useSearchParams();
    const travelDate = searchParams.get('date');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [busData, setBusData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [pendingSeat, setPendingSeat] = useState(null);
    const [boardingPoint, setBoardingPoint] = useState('');
    const [droppingPoint, setDroppingPoint] = useState('');
    const [activeTab, setActiveTab] = useState('seats'); // seats, points, info
    const [activeDetailTab, setActiveDetailTab] = useState('highlights');
    const [activeDeck, setActiveDeck] = useState('lower');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchLayout = async () => {
            try {
                const data = await getBusSeatLayout(scheduleId, travelDate);
                
                const isSleeper = data.busType?.toLowerCase().includes('sleeper');
                const hasCoordinates = data.seatLayout.some(s => s.row !== undefined && s.col !== undefined);
                if (!hasCoordinates) {
                    const seatsPerRow = isSleeper ? 3 : 4;
                    data.seatLayout = data.seatLayout.map((seat, index) => {
                        const row = Math.floor(index / seatsPerRow) + 1;
                        const posInRow = index % seatsPerRow;
                        let col;
                        if (isSleeper) {
                            // 2+1 layout: Col 1, 2 (Left) and Col 4 (Right)
                            col = posInRow < 2 ? posInRow + 1 : 4;
                        } else {
                            // 2+2 layout: Col 1, 2 and Col 4, 5
                            col = posInRow < 2 ? posInRow + 1 : posInRow + 2;
                        }
                        return { ...seat, row, col };
                    });
                }

                setBusData(data);
                if (data.boardingPoints?.length > 0) setBoardingPoint(data.boardingPoints[0].location);
                if (data.droppingPoints?.length > 0) setDroppingPoint(data.droppingPoints[0].location);

                // Auto-detect deck
                const hasLower = data.seatLayout.some(s => (s.deck || 'lower') === 'lower');
                if (!hasLower) setActiveDeck('upper');
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLayout();
    }, [scheduleId, travelDate]);

    const toggleSeat = (seatNo, status, seat) => {
        if (status === 'Booked') return;

        const isWomenPreference = searchParams.get('women') === 'true';
        const currentGender = isWomenPreference ? 'female' : (user.gender?.toLowerCase() || 'male');

        // 1. Strict Rule: Ladies reserved seats
        const isLadiesSeat = seat.type?.toLowerCase() === 'ladies' ||
            seat.type?.toLowerCase() === 'ladies-sleeper' ||
            seat.isLadies === true;

        // 2. Adjacent Rule: Lady is sitting next to this seat
        const isNextToLady = busData.seatLayout.some(s =>
            s.status?.toLowerCase() === 'booked' &&
            s.bookedGender?.toLowerCase() === 'female' &&
            s.row === seat.row &&
            s.deck === seat.deck &&
            Math.abs(s.col - seat.col) === 1
        );

        if ((isLadiesSeat || isNextToLady) && currentGender === 'male') {
            toast.error("Only for ladies. Please select other seat.");
            return;
        }

        performSeatToggle(seatNo);
    };

    const performSeatToggle = (seatNo) => {
        if (selectedSeats.includes(seatNo)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNo));
        } else {
            if (selectedSeats.length >= 6) {
                toast.warning("Maximum 6 seats allowed per booking");
                return;
            }
            setSelectedSeats([...selectedSeats, seatNo]);
            // Automatically switch to boarding/dropping points tab
            setActiveTab('points');
        }
    };

    const confirmAdjacentBooking = () => {
        if (pendingSeat) {
            performSeatToggle(pendingSeat.seatNo);
            setPendingSeat(null);
            setShowWarningModal(false);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, seatNo) => {
        const seat = busData?.seatLayout.find(s => s.seatNo === seatNo);
        return sum + (seat?.price || busData?.ticketPrice || 0);
    }, 0);

    const handleProceed = () => {
        if (selectedSeats.length === 0) {
            toast.error("Please select at least one seat");
            return;
        }
        if (!boardingPoint || !droppingPoint) {
            setActiveTab('points');
            toast.info("Please confirm your boarding and dropping points");
            return;
        }

        navigate(`/booking/${scheduleId}?type=bus`, {
            state: {
                selectedSeats,
                selectedSeatDetails: selectedSeats.map(seatNo => {
                    const seat = busData.seatLayout.find(s => s.seatNo === seatNo);
                    const isNextToLady = busData.seatLayout.some(s =>
                        s.status === 'Booked' &&
                        s.bookedGender?.toLowerCase() === 'female' &&
                        s.row === seat.row &&
                        s.deck === seat.deck &&
                        Math.abs(s.col - seat.col) === 1
                    );
                    return { ...seat, isNextToLady };
                }),
                totalPrice,
                boardingPoint,
                droppingPoint,
                busId: busData.busId || busData._id,
                operatorId: busData.operatorId || busData.operator?._id,
                routeId: busData.routeId || busData.route?._id,
                busName: busData.busName,
                busType: busData.busType,
                departureTime: busData.departureTime,
                arrivalTime: busData.arrivalTime,
                travelDate: travelDate,
                boardingTime: busData.boardingPoints?.find(p => p.location === boardingPoint)?.time || busData.departureTime,
                droppingTime: busData.droppingPoints?.find(p => p.location === droppingPoint)?.time || busData.arrivalTime
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            </div>
        );
    }

    if (!busData) return <div className="p-20 text-center">Error loading bus data.</div>;

    const hasUpperDeck = busData.seatLayout.some(s => s.deck === 'upper');
    const filteredSeats = busData.seatLayout.filter(s => (s.deck || 'lower') === activeDeck);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-outfit">
            {/* Premium Glass Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100]">
                <div className="container mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-white hover:shadow-md rounded-xl transition-all border border-slate-100 text-slate-400 hover:text-red-500"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black tracking-tight text-slate-800">
                                    {busData.fromCity} <span className="text-red-500 mx-1">→</span> {busData.toCity}
                                </h2>
                                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-red-100">
                                    {travelDate ? new Date(travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                {busData.busName} • {busData.busType}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation Tabs */}
                    <nav className="hidden md:flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                        {[
                            { id: 'seats', label: 'Select Seats', icon: <Armchair size={14} /> },
                            { id: 'points', label: 'Boarding & Dropping', icon: <MapPin size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-white text-red-600 shadow-sm shadow-slate-200 scale-100'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Support</span>
                            <span className="text-xs font-black text-slate-600">+91 888 222 1111</span>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <Info size={20} className="text-slate-400" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl p-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT SECTION: SEAT MAP or POINTS SELECTION */}
                    <div className="w-full lg:col-span-8">
                        {activeTab === 'seats' ? (
                            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
                                {/* Lower Deck Container */}
                                <div className="w-[320px] bg-white rounded-[3rem] shadow-sm border border-slate-200 p-8 relative min-h-[600px]">
                                    <div className="flex justify-between items-center mb-8 px-2">
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Lower deck</h3>
                                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 flex items-center justify-center text-slate-200">
                                            <Navigation size={20} className="rotate-45" />
                                        </div>
                                    </div>

                                    {/* Seats Grid (Lower) */}
                                    <div className="space-y-4">
                                        {renderIntegratedGrid(busData, toggleSeat, selectedSeats, busData.seatLayout.filter(s => (s.deck || 'lower') === 'lower'))}
                                    </div>
                                </div>

                                {/* Upper Deck Container (Conditional) */}
                                {hasUpperDeck && (
                                    <div className="w-[320px] bg-white rounded-[3rem] shadow-sm border border-slate-200 p-8 relative min-h-[600px]">
                                        <div className="flex justify-between items-center mb-8 px-2">
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Upper deck</h3>
                                            <div className="w-10 h-10"></div> {/* Spacer to match Lower Deck alignment */}
                                        </div>

                                        {/* Seats Grid (Upper) */}
                                        <div className="space-y-4">
                                            {renderIntegratedGrid(busData, toggleSeat, selectedSeats, busData.seatLayout.filter(s => s.deck === 'upper'))}
                                        </div>
                                    </div>
                                )}

                                <div className="w-full flex gap-6 mt-4 bg-white/50 backdrop-blur-sm px-8 py-4 rounded-[2rem] border border-slate-200/50 justify-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md border-2 border-green-500 bg-white"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-pink-50 border-2 border-pink-500 flex items-center justify-center">
                                            <span className="text-[10px]">👩</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Female Only</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-[#fee2e2] flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-300"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sold</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-green-500"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Points Selection UI (Side by Side) */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                {/* Boarding Column */}
                                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-lg font-black text-slate-800">Boarding points</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Select your pickup location</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {busData.boardingPoints?.map((point, idx) => (
                                            <label key={idx} className={`flex items-center justify-between p-6 cursor-pointer transition-colors hover:bg-slate-50 ${boardingPoint === point.location ? 'bg-red-50/30' : ''}`}>
                                                <div className="flex gap-4">
                                                    <span className="text-sm font-black text-slate-400 w-12">{point.time}</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{point.location}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{point.landmark || "Pickup point"}</p>
                                                        {boardingPoint === point.location && (
                                                            <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase tracking-wider">Your selected pickup</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="boarding"
                                                    checked={boardingPoint === point.location}
                                                    onChange={() => setBoardingPoint(point.location)}
                                                    className="w-5 h-5 border-2 border-slate-300 text-red-500 focus:ring-red-500"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Dropping Column */}
                                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-lg font-black text-slate-800">Dropping points</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Select your drop location</p>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {busData.droppingPoints?.map((point, idx) => (
                                            <label key={idx} className={`flex items-center justify-between p-6 cursor-pointer transition-colors hover:bg-slate-50 ${droppingPoint === point.location ? 'bg-red-50/30' : ''}`}>
                                                <div className="flex gap-4">
                                                    <span className="text-sm font-black text-slate-400 w-12">{point.time}</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{point.location}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{point.landmark || "Drop point"}</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="dropping"
                                                    checked={droppingPoint === point.location}
                                                    onChange={() => setDroppingPoint(point.location)}
                                                    className="w-5 h-5 border-2 border-slate-300 text-red-500 focus:ring-red-500"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION: BUS DETAILS - Hide when in Points Tab for Full Width */}
                    {activeTab === 'seats' && (
                        <div className="flex-1 space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {busData.isPrimo && <span className="text-blue-600 text-xs font-black italic tracking-tighter">Primo</span>}
                                                    <h3 className="text-xl font-bold">{busData.operator?.name || busData.busName || "Premium Fleet"}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-0.5">
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-wider">
                                                        {busData.busType || "Bus"}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{busData.departureTime} - {busData.arrivalTime}</span>
                                                    <span>•</span>
                                                    <span>{travelDate ? new Date(travelDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Today'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                                                <Star size={10} fill="currentColor" />
                                                <span>{busData.rating || '4.5'}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 mt-1">{busData.reviewCount || '469'} reviews</span>
                                        </div>
                                    </div>

                                    {/* Premium Gallery Layout */}
                                    <div className="grid grid-cols-12 gap-3 h-[320px]">
                                        {busData.images?.length > 0 ? (
                                            <>
                                                {/* Featured Image */}
                                                <div className="col-span-8 h-full bg-slate-100 rounded-2xl overflow-hidden relative group cursor-pointer">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL || ''}${busData.images[0]}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        alt="Featured Bus"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                </div>

                                                {/* Side Grid */}
                                                <div className="col-span-4 flex flex-col gap-3 h-full">
                                                    {[1, 2].map(idx => {
                                                        const img = busData.images[idx];
                                                        return (
                                                            <div key={idx} className="flex-1 bg-slate-100 rounded-2xl overflow-hidden relative group cursor-pointer">
                                                                {img ? (
                                                                    <>
                                                                        <img
                                                                            src={`${import.meta.env.VITE_API_URL || ''}${img}`}
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                            alt="Bus Interior"
                                                                        />
                                                                        {idx === 2 && busData.images.length > 3 && (
                                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-lg">
                                                                                +{busData.images.length - 3}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                        <Camera size={24} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            /* Fallback Placeholder Grid */
                                            <div className="col-span-12 grid grid-cols-3 gap-3 h-full">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 relative overflow-hidden">
                                                        <Camera size={32} />
                                                        <div className="absolute inset-0 flex items-center justify-center text-4xl font-black uppercase opacity-10 truncate px-4">
                                                            {(busData.operator?.name || busData.busName || "BUS").split(' ')[0]}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Secondary Tabs */}
                                    <div className="border-b border-slate-100 -mx-8 px-8">
                                        <div className="flex gap-8">
                                            {[
                                                { id: 'highlights', label: 'Highlights' },
                                                { id: 'cancellation', label: 'Cancellation policy' },
                                                { id: 'reschedule', label: 'Reschedule Policy' },
                                                { id: 'boarding', label: 'Boarding point' },
                                                { id: 'dropping', label: 'Dropping point' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveDetailTab(tab.id)}
                                                    className={`relative py-4 text-xs font-bold transition-colors ${activeDetailTab === tab.id ? 'text-red-500' : 'text-slate-500 hover:text-slate-800'}`}
                                                >
                                                    {tab.label}
                                                    {activeDetailTab === tab.id && (
                                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500"></div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Detail Content */}
                                    <div className="mt-6">
                                        {activeDetailTab === 'boarding' || activeDetailTab === 'dropping' ? (
                                            <div className="space-y-4">
                                                {(activeDetailTab === 'boarding' ? busData.boardingPoints : busData.droppingPoints)?.map((point, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-red-200 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-red-500 transition-colors">
                                                                <MapPin size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{point.location}</p>
                                                                <p className="text-xs text-slate-500">{point.landmark || "Nearby Landmark"}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-slate-900">{point.time}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrival</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : activeDetailTab === 'highlights' ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {busData.amenities?.map((amenity, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                                                            <CheckCircle2 size={14} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{amenity}</span>
                                                    </div>
                                                ))}
                                                {(!busData.amenities || busData.amenities.length === 0) && (
                                                    <div className="col-span-2 text-center py-8 text-slate-400 text-sm italic">
                                                        No specific highlights available for this fleet.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 flex items-center justify-center opacity-40">
                                                        <Info size={32} strokeWidth={1} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 capitalize">{activeDetailTab.replace('-', ' ')}</p>
                                                        <p className="text-xs text-slate-500">Standard policy applied by {busData.operator?.name || busData.busName}.</p>
                                                    </div>
                                                </div>
                                                <button className="text-blue-600 text-xs font-bold hover:underline">View Full Details</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-[100] animate-fadeInUp">
                    <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seats Selected</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-slate-900">{selectedSeats.length} seat</span>
                                    <div className="flex gap-1">
                                        {selectedSeats.map(s => (
                                            <span key={s} className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold border border-slate-200">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-slate-100"></div>

                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl font-black text-slate-900">₹{totalPrice.toLocaleString()}</span>
                                    <button className="p-1 hover:bg-slate-50 rounded text-slate-400">
                                        <Info size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleProceed}
                            className="px-12 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {activeTab === 'points' ? 'Fill passenger details' : 'PROCEED TO SELECT POINT'} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Integrated Grid Rendering (Matching Screenshot)
 * Includes coordinate fallback for dynamic bus data
 */
function renderIntegratedGrid(busData, toggleSeat, selectedSeats, seats) {
    if (!busData || !seats) return null;

    const defaultPrice = busData.ticketPrice || 0;

    // Coordinates are now normalized in useEffect

    const maxRow = Math.max(...seats.map(s => s.row || 0), 1);
    const rows = Array.from({ length: maxRow }, (_, i) => i + 1);

    return (
        <div className="flex flex-col gap-6">
            {rows.map(rowNum => {
                const rowSeats = seats.filter(s => s.row === rowNum);
                if (rowSeats.length === 0) return null;

                return (
                    <div key={rowNum} className="flex justify-between gap-4">
                        {/* Column 1 & 2 */}
                        <div className="flex gap-4">
                            {[1, 2].map(colNum => {
                                const seat = rowSeats.find(s => s.col === colNum);
                                return seat ? (
                                    <IntegratedSeat
                                        key={seat.seatNo}
                                        seat={seat}
                                        isSelected={selectedSeats.includes(seat.seatNo)}
                                        isNextToLady={busData.seatLayout.some(s =>
                                            s.status?.toLowerCase() === 'booked' &&
                                            s.bookedGender?.toLowerCase() === 'female' &&
                                            s.row === seat.row &&
                                            s.deck === seat.deck &&
                                            Math.abs(s.col - seat.col) === 1
                                        )}
                                        onToggle={() => toggleSeat(seat.seatNo, seat.status, seat)}
                                        defaultPrice={defaultPrice}
                                        busType={busData.busType}
                                    />
                                ) : <div key={colNum} className="w-12 h-14"></div>;
                            })}
                        </div>

                        {/* Aisle Spacer */}
                        <div className="w-8 flex justify-center">
                            <div className="w-px h-full bg-slate-100/50"></div>
                        </div>

                        {/* Column 4 & 5 */}
                        <div className="flex gap-4">
                            {[4, 5].map(colNum => {
                                const seat = rowSeats.find(s => s.col === colNum);
                                return seat ? (
                                    <IntegratedSeat
                                        key={seat.seatNo}
                                        seat={seat}
                                        isSelected={selectedSeats.includes(seat.seatNo)}
                                        isNextToLady={busData.seatLayout.some(s =>
                                            s.status?.toLowerCase() === 'booked' &&
                                            s.bookedGender?.toLowerCase() === 'female' &&
                                            s.row === seat.row &&
                                            s.deck === seat.deck &&
                                            Math.abs(s.col - seat.col) === 1
                                        )}
                                        onToggle={() => toggleSeat(seat.seatNo, seat.status, seat)}
                                        defaultPrice={defaultPrice}
                                        busType={busData.busType}
                                    />
                                ) : <div key={colNum} className="w-12 h-14"></div>;
                            })}
                        </div>
                    </div>
                );
            })}
            <div className="flex gap-6 mt-4 justify-center border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white border-2 border-green-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-pink-50 border-2 border-pink-500 flex items-center justify-center">
                        <span className="text-[10px]">👩</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Female Only</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-green-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected</span>
                </div>
            </div>
        </div>
    );
}

const IntegratedSeat = ({ seat, isSelected, onToggle, defaultPrice, busType, isNextToLady }) => {
    const isBooked = seat.status === 'Booked';
    const price = seat.price || defaultPrice || 0;
    const isLadies = (isBooked)
        ? (seat.bookedGender?.toLowerCase() === 'female')
        : (seat.type?.toLowerCase() === 'ladies' ||
            seat.type?.toLowerCase() === 'ladies-sleeper' ||
            seat.isLadies === true ||
            isNextToLady);

    // Check if it's a sleeper seat (Bus level override for consistency)
    const isSleeperBus = busType?.toLowerCase().includes('sleeper');
    const isSleeper = isSleeperBus ||
        seat.type?.toLowerCase().includes('sleeper') ||
        (seat.seatNo?.toLowerCase().startsWith('s') && !seat.type?.toLowerCase().includes('seater'));

    return (
        <div
            onClick={onToggle}
            className={`
                relative transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 group
                ${isSleeper ? 'w-12 h-24' : 'w-12 h-14'}
                ${isBooked ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            `}
        >
            <div className={`
                w-full h-full rounded-lg border-2 transition-all flex flex-col items-center justify-center
                ${isBooked
                    ? 'bg-[#fee2e2] border-transparent'
                    : isSelected
                        ? 'bg-green-500 border-green-500 text-white shadow-md'
                        : isLadies
                            ? 'bg-pink-50 border-pink-500 text-pink-600'
                            : 'bg-white border-green-500 hover:bg-green-50 text-slate-800'}
            `}>
                {/* Top Lip of the seat / Pillow for sleeper */}
                <div className={`
                    absolute left-1.5 right-1.5 h-1.5 rounded-t-sm border-2 border-b-0 transition-colors
                    ${isSleeper ? 'top-1.5' : '-top-1'}
                    ${isBooked
                        ? 'border-transparent bg-red-200'
                        : isSelected
                            ? 'border-green-500 bg-green-500'
                            : isLadies
                                ? 'border-pink-500 bg-pink-100'
                                : 'border-green-500 bg-white'}
                `}></div>

                {isBooked ? (
                    <div className="flex flex-col items-center justify-center">
                        {isLadies ? (
                            <span className="text-pink-300 text-sm mb-1">👩</span>
                        ) : (
                            <div className={`rounded-full bg-red-300 mb-1 ${isSleeper ? 'w-3 h-3' : 'w-2 h-2'}`}></div>
                        )}
                        <span className="text-[9px] font-black uppercase text-red-400">Sold</span>
                    </div>
                ) : (
                    <>
                        {isLadies && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <span className="text-xl">👩</span>
                            </div>
                        )}

                        {isSleeper ? (
                            <div className="flex flex-col items-center justify-between h-full py-4 relative z-10">
                                <div className={`w-8 h-3 rounded-sm ${isSelected ? 'bg-white/20' : isLadies ? 'bg-pink-200' : 'bg-green-100'}`}></div>
                                {isLadies && !isSelected && (
                                    <span className="text-pink-500 text-[10px] -mt-1">👩</span>
                                )}
                                <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>{seat.seatNo}</span>
                                <span className={`text-[9px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>₹{price}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center relative z-10">
                                {isLadies && !isSelected ? (
                                    <span className="text-pink-500 text-sm mb-1">👩</span>
                                ) : (
                                    <Armchair size={14} strokeWidth={3} className={isSelected ? 'text-white' : 'text-green-500 opacity-60'} />
                                )}
                                <span className={`text-[9px] font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>{seat.seatNo}</span>
                                <span className={`text-[8px] font-bold ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>₹{price}</span>
                            </div>
                        )}

                        {isLadies && !isSelected && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                                Female only
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Selection Check */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 bg-white text-green-600 rounded-full p-0.5 shadow-md z-10">
                    <CheckCircle2 size={10} strokeWidth={4} />
                </div>
            )}
        </div>
    );
};
