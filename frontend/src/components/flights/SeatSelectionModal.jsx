
import React, { useState, useEffect, useMemo } from 'react';
import { X, Info, Check, User, Luggage, ShieldCheck, Clock, Coffee, Utensils } from 'lucide-react';
import dayjs from 'dayjs';
import { getFlightSeats } from '../../services/flightApi';
import './SeatSelectionModal.css';

const SeatSelectionModal = ({ isOpen, onClose, flightId, passengers, onSelectionComplete, session }) => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [activeTab, setActiveTab] = useState('Seats');
    const [mealMapping, setMealMapping] = useState(null);
    const [selectedMeals, setSelectedMeals] = useState([]); // [{ passengerIdx: 0, mealCode: 'AVML', price: 100 }]
    const [activePassengerIdx, setActivePassengerIdx] = useState(0);
    const [vegOnly, setVegOnly] = useState(false);

    const flight = session?.flightId || {};
    const fare = session?.priceSnapshot || {};

    useEffect(() => {
        if (isOpen && flightId) {
            fetchSeats();
            fetchMealMapping();
        }
    }, [isOpen, flightId]);

    const fetchMealMapping = async () => {
        try {
            const res = await fetch(`/api/meals/flight/${flightId}`).then(r => r.json());
            if (res.success) setMealMapping(res.mapping);
        } catch (err) {
            console.error("Failed to fetch meals:", err);
        }
    };

    const fetchSeats = async () => {
        if (!flightId) {
            console.error("No flightId provided to SeatSelectionModal");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching seats for flightId:", flightId);
            const res = await getFlightSeats(flightId);
            if (res.success) {
                setSeats(res.seats);
            } else {
                setError(res.message || "Failed to load seats");
            }
        } catch (err) {
            console.error("Failed to fetch seats:", err);
            setError(err.message || "Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const rows = useMemo(() => {
        const rowMap = {};
        seats.forEach(seat => {
            const rowMatch = seat.seatNumber.match(/^(\d+)/);
            if (rowMatch) {
                const rowNum = rowMatch[1];
                if (!rowMap[rowNum]) rowMap[rowNum] = [];
                rowMap[rowNum].push(seat);
            }
        });
        return Object.entries(rowMap).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    }, [seats]);

    const handleSeatClick = (seat) => {
        if (seat.status === 'Booked' || seat.isBooked || (seat.isLocked && seat.lockedBy !== 'me')) return;

        const existingIdx = selectedSeats.findIndex(s => s.seatNumber === seat.seatNumber);
        if (existingIdx !== -1) {
            const newSelected = selectedSeats.filter(s => s.seatNumber !== seat.seatNumber);
            setSelectedSeats(newSelected);
            return;
        }

        const newSelected = [...selectedSeats];
        const passIdx = newSelected.findIndex(s => s.passengerIdx === activePassengerIdx);

        if (passIdx !== -1) {
            newSelected[passIdx] = { passengerIdx: activePassengerIdx, seatNumber: seat.seatNumber, price: seat.price };
        } else {
            if (selectedSeats.length < passengers.length) {
                newSelected.push({ passengerIdx: activePassengerIdx, seatNumber: seat.seatNumber, price: seat.price });
            }
        }
        setSelectedSeats(newSelected);
    };

    const getSeatStatus = (seat) => {
        const isSelectedByMe = selectedSeats.find(s => s.seatNumber === seat.seatNumber);
        if (isSelectedByMe) return 'Selected';
        if (seat.isBooked || seat.status === 'Booked') return 'Booked';
        if (seat.isLocked) return 'Blocked';
        return 'Available';
    };

    const seatTotalPrice = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

    if (!isOpen) return null;

    return (
        <div className="seat-modal-overlay ixigo-style">
            <div className="seat-modal-content">
                {/* Top Nav Tabs */}
                <div className="ixigo-nav-tabs">
                    <div className="tabs-left">
                        <button
                            className={`tab-btn ${activeTab === 'Seats' ? 'active' : ''}`}
                            onClick={() => setActiveTab('Seats')}
                        >
                            Seat
                        </button>
                        {mealMapping?.mealAvailable && (
                            <button
                                className={`tab-btn ${activeTab === 'Meals' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Meals')}
                            >
                                Meal <span className="badge-new">NEW</span>
                            </button>
                        )}
                        <button className="tab-btn">Insurance <span className="badge-new">New</span></button>
                    </div>
                    <button className="skip-link" onClick={onClose}>Skip to Payment &gt;</button>
                </div>

                <div className="ixigo-modal-body">
                    {/* Left Sidebar */}
                    <aside className="ixigo-sidebar">
                        <div className="sidebar-section">
                            <h3>Your Flight</h3>
                            <div className="mini-flight-info">
                                <div className="date">{dayjs(flight.departureTime).format('ddd, DD MMM')}</div>
                                <div className="times-row">
                                    <div className="time-block">
                                        <strong>{dayjs(flight.departureTime).format('HH:mm')}</strong>
                                        <span>{flight.fromAirport?.city || flight.from}</span>
                                    </div>
                                    <div className="duration-line">
                                        <span>{flight.duration}</span>
                                        <div className="line"></div>
                                        <span>Non-stop</span>
                                    </div>
                                    <div className="time-block">
                                        <strong>{dayjs(flight.arrivalTime).format('HH:mm')}</strong>
                                        <span>{flight.toAirport?.city || flight.to}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h3>Travellers</h3>
                            <div className="traveller-pills">
                                {passengers.map((p, idx) => {
                                    const seat = selectedSeats.find(s => s.passengerIdx === idx);
                                    const meal = selectedMeals.find(m => m.passengerIdx === idx);
                                    return (
                                        <div
                                            key={idx}
                                            className={`pass-pill ${activePassengerIdx === idx ? 'active' : ''} ${(seat || meal) ? 'selected' : ''}`}
                                            onClick={() => setActivePassengerIdx(idx)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[11px]">{idx + 1}. {p.title} {p.firstName}</span>
                                                {meal && <span className="text-[9px] text-blue-600 font-black uppercase">{meal.mealCode}</span>}
                                            </div>
                                            {seat && <span className="seat-code">{seat.seatNumber}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="sidebar-section assured-box">
                            <div className="assured-head">
                                <ShieldCheck size={18} color="#059669" />
                                <strong>Assured</strong>
                            </div>
                            <p>Fully secured with Assured</p>
                            <ul>
                                <li>✓ Instant refund of ₹{fare.total?.toLocaleString()}</li>
                                <li>✓ Cancel up to 24hrs before departure</li>
                                <li>✓ No-questions-asked refund</li>
                            </ul>
                        </div>

                        <div className="sidebar-section fare-summary">
                            <h3>Fare Summary</h3>
                            <div className="fare-row"><span>Base Fare</span><span>₹{(fare.baseFare || 0).toLocaleString()}</span></div>
                            {selectedSeats.length > 0 && <div className="fare-row"><span>Seats</span><span>₹{seatTotalPrice.toLocaleString()}</span></div>}
                            {selectedMeals.length > 0 && <div className="fare-row"><span>Meals</span><span>₹{selectedMeals.reduce((acc, m) => acc + m.price, 0).toLocaleString()}</span></div>}
                            <div className="fare-row"><span>Assured Fee*</span><span>₹899</span></div>
                            <div className="fare-row"><span>Taxes & Fees</span><span>₹{(fare.taxes || 0).toLocaleString()}</span></div>
                            <div className="fare-row discount"><span>Instant Off</span><span>-₹600</span></div>
                            <div className="total-row">
                                <span>Total Amount</span>
                                <strong>₹{(fare.total + seatTotalPrice + selectedMeals.reduce((acc, m) => acc + m.price, 0) + 899 - 600).toLocaleString()}</strong>
                            </div>
                            <p className="note">*Non-refundable charges</p>
                        </div>
                    </aside>

                    {/* Right Map Area */}
                    <div className="ixigo-map-area overflow-hidden">
                        <div className={`tab-slide-container ${activeTab === 'Meals' ? 'show-meals' : ''}`}>
                            {/* SEATS PANE */}
                            <div className="tab-pane">
                                <div className="legend-strip">
                                    <div className="legend-item"><span className="box free"></span> Free</div>
                                    <div className="legend-item"><span className="box mid"></span> ₹435 - ₹675</div>
                                    <div className="legend-item"><span className="box high"></span> ₹725 - ₹945</div>
                                </div>

                                <div className="aircraft-scroller">
                                    <div className="aircraft-nose-h">
                                        <span className="nose-label">FRONT</span>
                                    </div>

                                    <div className="seat-grid-horizontal">
                                        <div className="labels-row">
                                            <span>F</span><span>E</span><span>D</span>
                                            <div className="aisle-label"></div>
                                            <span>C</span><span>B</span><span>A</span>
                                        </div>

                                        <div className="columns-container">
                                            {loading ? (
                                                <div className="map-loading">Loading seats...</div>
                                            ) : error ? (
                                                <div className="map-error">{error}</div>
                                            ) : seats.length === 0 ? (
                                                <div className="map-empty">No seats found for this flight</div>
                                            ) : (
                                                rows.map(([rowNum, rowSeats]) => (
                                                    <div key={rowNum} className="seat-column">
                                                        <div className="row-number">{rowNum}</div>
                                                        {['F', 'E', 'D'].map(l => {
                                                            const seat = rowSeats.find(s => s.seatNumber.endsWith(l));
                                                            const status = seat ? getSeatStatus(seat) : 'Empty';
                                                            return (
                                                                <div key={l} className={`seat-icon ${status.toLowerCase()} ${seat?.class === 'Business' ? 'premium' : ''}`} onClick={() => seat && handleSeatClick(seat)}>
                                                                    <div className="armrest left"></div>
                                                                    <div className="seat-body">
                                                                        <div className="backrest"></div>
                                                                        <div className="cushion">
                                                                            {status === 'Booked' && <X size={10} />}
                                                                            {status === 'Selected' && <Check size={10} />}
                                                                        </div>
                                                                    </div>
                                                                    <div className="armrest right"></div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="aisle-spacer"></div>
                                                        {['C', 'B', 'A'].map(l => {
                                                            const seat = rowSeats.find(s => s.seatNumber.endsWith(l));
                                                            const status = seat ? getSeatStatus(seat) : 'Empty';
                                                            return (
                                                                <div key={l} className={`seat-icon ${status.toLowerCase()} ${seat?.class === 'Business' ? 'premium' : ''}`} onClick={() => seat && handleSeatClick(seat)}>
                                                                    <div className="armrest left"></div>
                                                                    <div className="seat-body">
                                                                        <div className="backrest"></div>
                                                                        <div className="cushion">
                                                                            {status === 'Booked' && <X size={10} />}
                                                                            {status === 'Selected' && <Check size={10} />}
                                                                        </div>
                                                                    </div>
                                                                    <div className="armrest right"></div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="active-pass-info">
                                    <div className="pill">
                                        {passengers[activePassengerIdx]?.firstName || 'Passenger'}
                                        <span className="dot"></span>
                                        {selectedSeats.find(s => s.passengerIdx === activePassengerIdx)?.seatNumber || 'Select Seat'}
                                    </div>
                                </div>
                            </div>

                            {/* MEALS PANE */}
                            <div className="tab-pane">
                                <div className="meals-selection-area p-8 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-black text-slate-800">Select Meals for {passengers[activePassengerIdx]?.firstName}</h2>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                            Passenger {activePassengerIdx + 1} of {passengers.length}
                                        </div>
                                    </div>
                                    <div className="veg-toggle-bar">
                                        <div className="veg-toggle-text">
                                            <div className="veg-indicator"></div>
                                            Veg only
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={vegOnly}
                                                onChange={() => setVegOnly(!vegOnly)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                    <div className="meals-grid no-scrollbar flex-1">
                                        {mealMapping?.meals
                                            .filter(m => m.available && (!vegOnly || m.type === 'Veg' || m.type === 'Jain' || m.type === 'Vegan'))
                                            .map(meal => {
                                                const isSelected = selectedMeals.some(sm => sm.passengerIdx === activePassengerIdx && sm.mealCode === meal.mealCode);
                                                const isVeg = ['Veg', 'Jain', 'Vegan'].includes(meal.type);
                                                return (
                                                    <div
                                                        key={meal.mealCode}
                                                        className={`meal-card-indigo ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            const newMeals = [...selectedMeals];
                                                            const idx = newMeals.findIndex(sm => sm.passengerIdx === activePassengerIdx);
                                                            if (idx !== -1) {
                                                                if (newMeals[idx].mealCode === meal.mealCode) {
                                                                    newMeals.splice(idx, 1);
                                                                } else {
                                                                    newMeals[idx] = { passengerIdx: activePassengerIdx, mealCode: meal.mealCode, price: meal.price };
                                                                }
                                                            } else {
                                                                newMeals.push({ passengerIdx: activePassengerIdx, mealCode: meal.mealCode, price: meal.price });
                                                            }
                                                            setSelectedMeals(newMeals);
                                                        }}
                                                    >
                                                        <div className="meal-image-container">
                                                            <img
                                                                src={meal.image ? `${window.location.origin}${meal.image}` : 'https://cdn-icons-png.flaticon.com/512/3081/3081986.png'}
                                                                alt={meal.name}
                                                            />
                                                        </div>
                                                        <div className="meal-info-indigo">
                                                            <div className="indicator-box mb-1">
                                                                <div className={isVeg ? 'veg-indicator' : 'non-veg-indicator'}></div>
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{meal.mealCode}</span>
                                                            </div>
                                                            <h4 className="meal-name-indigo">{meal.name}</h4>
                                                            <div className="meal-meta-indigo">
                                                                <span className="meal-price-indigo">₹{meal.price}</span>
                                                                <button className={`meal-add-btn ${isSelected ? 'selected' : ''}`}>
                                                                    {isSelected ? 'Added' : 'Add'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="ixigo-bottom-bar">
                    <div className="total-box">
                        <span className="price">₹{(fare.total + seatTotalPrice + selectedMeals.reduce((acc, m) => acc + m.price, 0) + 899 - 600).toLocaleString()}</span>
                        <span className="old-price">₹{(fare.total + seatTotalPrice + selectedMeals.reduce((acc, m) => acc + m.price, 0) + 899 - 600 + 600).toLocaleString()}</span>
                    </div>
                    {activeTab === 'Seats' ? (
                        <button
                            className="meal-btn"
                            disabled={selectedSeats.length < passengers.length}
                            onClick={() => setActiveTab('Meals')}
                        >
                            Proceed to Meal &gt;
                        </button>
                    ) : (
                        <button
                            className="meal-btn"
                            disabled={selectedSeats.length < passengers.length}
                            onClick={() => onSelectionComplete({ selectedSeats, selectedMeals })}
                        >
                            Proceed to Payment &gt;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeatSelectionModal;
