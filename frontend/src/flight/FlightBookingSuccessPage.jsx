import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Plane, Download, Home, User, Mail, Ticket, ShieldCheck, BookOpen, FileText, Armchair, Headphones, Smartphone, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchTripDetailsApi } from '../services/flightApi';

export default function FlightBookingSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Mock data for visual testing / direct access fallback
    const mockFlight = {
        airlineCode: '6E',
        airlineName: 'IndiGo',
        flightNumber: '6E-6269',
        segments: [{
            airlineCode: '6E',
            airlineName: 'IndiGo',
            flightNumber: '6E-6269',
            origin: 'BLR',
            originCity: 'Bangalore',
            departureTime: '02:45 am',
            departureDateTime: '2025-08-05T02:45:00',
            destination: 'MAA',
            destinationCity: 'Chennai',
            arrivalTime: '03:45 am',
            arrivalDateTime: '2025-08-05T03:45:00'
        }],
        duration: '2h 15m'
    };
    const mockPassenger = {
        title: 'MR',
        firstName: 'Ajay',
        lastName: 'Dhayatidak',
        selectedSeat: 'Assigned at Check-in',
        email: 'rdhayatidak@gmail.com'
    };

    const stateToUse = location.state || {
        flight: mockFlight,
        passenger: mockPassenger,
        pnr: 'Q260803968312',
        bookingId: 'Q260803968312'
    };

    // Data passed from Payment page or Cleartrip /book response
    const { bookingData, holdData, flight, passenger, pnr, bookingId } = stateToUse;

    const primarySegment = flight?.segments?.[0] || {};
    const lastSegment = flight?.segments?.[flight?.segments?.length - 1] || primarySegment;

    // Extract Cleartrip tripId from hold response or book response (e.g. "Q260803968284")
    const fallbackConfirmId = React.useMemo(() => `CT-GAC-${Date.now().toString().slice(-6)}`, []);
    const fallbackPnr = React.useMemo(() => `PNR-${Math.floor(100000 + Math.random() * 900000)}`, []);

    const confirmId = bookingId
        || holdData?.booking_details?.trip_id
        || holdData?.booking_details?.tripId
        || holdData?.data?.booking_details?.trip_id
        || holdData?.data?.booking_details?.tripId
        || holdData?.trip_id
        || holdData?.tripId
        || bookingData?.booking_details?.trip_id
        || bookingData?.booking_details?.tripId
        || bookingData?.data?.booking_details?.trip_id
        || bookingData?.data?.booking_details?.tripId
        || bookingData?.trip_id
        || bookingData?.tripId
        || bookingData?.bookingId
        || bookingData?.data?.tripId
        || bookingData?.data?.itineraryId
        || bookingData?.data?.bookingId
        || fallbackConfirmId;

    // Bug 5 fix: pnrNumber should NOT fall through to trip_id — that's the booking ID, not airline PNR.
    // The real airline PNR comes from booking_infos[].pnr in the Cleartrip trip-details response.
    // If we only have trip_id from navigation state, show 'Pending' — resolveTripDetails will extract the real PNR.
    const pnrNumber = pnr 
        || bookingData?.pnr 
        || bookingData?.data?.pnr 
        || holdData?.pnr
        || '';

    const [liveDetails, setLiveDetails] = useState(null);
    const [loadingLive, setLoadingLive] = useState(false);

    useEffect(() => {
        if (!confirmId || confirmId.startsWith('CT-GAC-')) return;

        const loadLiveDetails = async () => {
            setLoadingLive(true);
            try {
                const res = await fetchTripDetailsApi(confirmId);
                if (res.success && res.data) {
                    const rawData = res.data.data || res.data;
                    setLiveDetails(rawData);
                }
            } catch (err) {
                console.warn('[Success Page] Failed to fetch live trip details from Cleartrip API:', err.message);
            } finally {
                setLoadingLive(false);
            }
        };

        loadLiveDetails();
    }, [confirmId]);

    // Bug 3 fix: Format epoch timestamp in a specific timezone (from Cleartrip airport metadata)
    // instead of relying on browser's local timezone which corrupts airport-local times.
    const formatTimeInTZ = (epochMs, timeZone, fallback = '') => {
        if (!epochMs) return fallback;
        try {
            const d = new Date(epochMs);
            if (isNaN(d.getTime())) return fallback;
            const tz = timeZone || 'Asia/Kolkata'; // Default to IST for Indian domestic flights
            return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz });
        } catch (e) {
            return fallback;
        }
    };

    const formatDateInTZ = (epochMs, timeZone, fallback = '') => {
        if (!epochMs) return fallback;
        try {
            const d = new Date(epochMs);
            if (isNaN(d.getTime())) return fallback;
            const tz = timeZone || 'Asia/Kolkata';
            return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: tz });
        } catch (e) {
            return fallback;
        }
    };

    // Bug 4 fix: Calculate flight duration from departure and arrival timestamps
    const calculateDuration = (depMs, arrMs) => {
        if (!depMs || !arrMs) return '';
        const diffMs = arrMs - depMs;
        if (diffMs <= 0) return '';
        const totalMinutes = Math.round(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    // Parse dynamic fields from Cleartrip API response
    const resolveTripDetails = (data) => {
        if (!data) return null;

        // Support for new booking_details wrapper from Cleartrip API
        const details = data.booking_details || data;

        // 1. Status Mapping
        let rawStatus = details.booking_status || details.tripStatus || details.status || details.statusDescription || 'Confirmed';
        let status = 'Confirmed';
        if (rawStatus === 'P' || rawStatus === 'CONFIRMED' || rawStatus === 'Ticketed') {
            status = 'Confirmed';
        } else if (rawStatus === 'Z' || rawStatus === 'PI' || rawStatus === 'H') {
            status = 'Pending';
        } else if (rawStatus === 'F' || rawStatus === 'PF' || rawStatus === 'Q') {
            status = 'Cancelled';
        } else {
            status = rawStatus;
        }

        // Extract segments & meta
        let segments = [];
        let travellers = [];
        let airlinesMeta = {};
        let airportsMeta = {};

        if (details.journey_details) {
            const jd = details.journey_details;
            travellers = jd.traveller_details || [];
            airlinesMeta = jd.meta_data?.airlines || {};
            airportsMeta = jd.meta_data?.airports || {};
            // Extract segments from flight_details
            if (Array.isArray(jd.flight_details)) {
                segments = jd.flight_details.flatMap(fd => fd.segment_details || []);
            }
        }

        // Bug 5 fix: Extract REAL airline PNR from booking_infos, not trip_id
        // Cleartrip returns airline PNR in segment_details[].booking_infos[].pnr
        const allBookingInfos = segments.flatMap(s => s.booking_infos || []);
        const pnrVal = allBookingInfos[0]?.pnr ||
            allBookingInfos[0]?.gds_pnr ||
            details.pnr ||
            details.pnrNumber ||
            details.airlinePnr ||
            ''; // DO NOT fall through to trip_id or bookingId

        // Bug 6 fix: Build a map of pax_info_id → seat_number from booking_infos
        const seatMap = {};
        allBookingInfos.forEach(bi => {
            if (bi.pax_info_id && bi.seat_number) {
                seatMap[bi.pax_info_id] = bi.seat_number;
            }
        });

        // Bug 2 fix: Extract included baggage allowance from segment_details[].baggage
        const firstSegBaggage = segments[0]?.baggage || {};
        const adtBaggage = firstSegBaggage.ADT || firstSegBaggage.adt || {};
        const includedCabinBag = adtBaggage.cab || adtBaggage.cabin_baggage || '';
        const includedCheckinBag = adtBaggage.cib || adtBaggage.checkin_baggage || '';

        // 3. Passengers — now includes seat number and baggage
        let mappedPassengers = [];
        if (travellers.length > 0) {
            mappedPassengers = travellers.map((traveller, tIdx) => {
                const paxId = traveller.pax_info_id;
                const ticketInfo = allBookingInfos.find(b => b.pax_info_id === paxId);
                // Bug 6: Use actual seat from booking_infos if available, fall back to selected seat from stateToUse
                const fallbackSeat = stateToUse.passengers?.[tIdx]?.selectedSeat || stateToUse.passengers?.[tIdx]?.seatNumber || (tIdx === 0 ? (stateToUse.passenger?.selectedSeat || stateToUse.passenger?.seatNumber) : '') || '';
                const seatNumber = seatMap[paxId] || ticketInfo?.seat_number || fallbackSeat || '';
                return {
                    title: traveller.title || 'Mr.',
                    firstName: traveller.fn || 'Traveller',
                    lastName: traveller.ln || '',
                    type: traveller.type || 'ADT',
                    ticketNumber: ticketInfo?.ticket_number || 'Ticketed',
                    email: details.user_details?.email || '',
                    seatNumber: seatNumber, // Bug 6: actual seat from Cleartrip/fallback
                    includedCabinBag, // Bug 2: included baggage
                    includedCheckinBag // Bug 2: included baggage
                };
            });
        }

        // 4. Flights / Segments — now with timezone-safe times and calculated duration
        let mappedFlights = [];
        if (segments.length > 0) {
            mappedFlights = segments.map(seg => {
                const depEpoch = seg.dd || null;
                const arrEpoch = seg.ad || null;
                // Use airport timezone from Cleartrip metadata if available
                const depTZ = airportsMeta[seg.dep]?.time_zone || airportsMeta[seg.dep]?.timezone || 'Asia/Kolkata';
                const arrTZ = airportsMeta[seg.arr]?.time_zone || airportsMeta[seg.arr]?.timezone || 'Asia/Kolkata';

                return {
                    airlineCode: seg.al || 'FL',
                    airlineName: airlinesMeta[seg.al]?.name || seg.al || 'Airline',
                    flightNumber: `${seg.al}-${seg.fn}`,
                    origin: seg.dep || 'BLR',
                    originCity: airportsMeta[seg.dep]?.city || seg.dep || 'Departure',
                    originAirportName: airportsMeta[seg.dep]?.name || '',
                    destination: seg.arr || 'BOM',
                    destinationCity: airportsMeta[seg.arr]?.city || seg.arr || 'Arrival',
                    destinationAirportName: airportsMeta[seg.arr]?.name || '',
                    depDate: formatDateInTZ(depEpoch, depTZ),
                    depTime: formatTimeInTZ(depEpoch, depTZ),
                    arrDate: formatDateInTZ(arrEpoch, arrTZ),
                    arrTime: formatTimeInTZ(arrEpoch, arrTZ),
                    duration: calculateDuration(depEpoch, arrEpoch) // Bug 4: real duration
                };
            });
        }

        return {
            tripId: details.trip_id || details.tripId || details.bookingId || '',
            status,
            pnr: pnrVal,
            passengers: mappedPassengers,
            flights: mappedFlights
        };
    };

    const resolved = resolveTripDetails(liveDetails);

    // Bug 5: Show resolved airline PNR (from Cleartrip API), fall back to state PNR, never show trip_id as PNR
    const displayPnr = resolved?.pnr || pnrNumber || 'Pending';
    const displayStatus = resolved?.status || 'Confirmed';

    // Helper for formatting date — Bug 3 fix: use IST timezone explicitly
    const getFormattedDate = (dateStr, fallback = '') => {
        if (!dateStr) return fallback;
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return fallback;
            // Use Asia/Kolkata timezone to match Indian domestic flights
            return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
        } catch (e) {
            return fallback;
        }
    };

    // Helper for formatting time — Bug 3 fix: extract from ISO string directly or use IST timezone
    const getFormattedTime = (dateStr, fallback = '') => {
        if (!dateStr) return fallback;
        try {
            // If it's an ISO string with time component, extract the local time directly
            // This avoids browser timezone conversion on strings like "2026-08-09T20:30:00+05:30"
            if (typeof dateStr === 'string' && dateStr.includes('T')) {
                const timePart = dateStr.split('T')[1]; // "20:30:00+05:30" or "20:30:00"
                const [hourMinSec] = timePart.split(/[+\-Z]/); // "20:30:00"
                const [hStr, mStr] = hourMinSec.split(':');
                const h = parseInt(hStr, 10);
                const m = parseInt(mStr, 10);
                if (!isNaN(h) && !isNaN(m)) {
                    const period = h >= 12 ? 'pm' : 'am';
                    const h12 = h % 12 || 12;
                    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
                }
            }
            // Fallback: use Date with explicit timezone
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return fallback;
            return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
        } catch (e) {
            return fallback;
        }
    };

    // Helper: calculate duration from two datetime strings — Bug 4 fix
    const getStateDuration = (depStr, arrStr) => {
        if (!depStr || !arrStr) return '';
        try {
            const dep = new Date(depStr);
            const arr = new Date(arrStr);
            if (isNaN(dep.getTime()) || isNaN(arr.getTime())) return '';
            const diffMs = arr - dep;
            if (diffMs <= 0) return '';
            const totalMin = Math.round(diffMs / 60000);
            const h = Math.floor(totalMin / 60);
            const m = totalMin % 60;
            if (h === 0) return `${m}m`;
            if (m === 0) return `${h}h`;
            return `${h}h ${m}m`;
        } catch (e) {
            return '';
        }
    };

    // Resolved flight & passenger data
    const displayFlightsList = resolved?.flights && resolved.flights.length > 0
        ? resolved.flights
        : (stateToUse.flight?.segments && stateToUse.flight.segments.length > 0
            ? stateToUse.flight.segments.map(seg => ({
                airlineCode: seg.airlineCode || stateToUse.flight?.airlineCode || 'FL',
                airlineName: seg.airlineName || stateToUse.flight?.airlineName || 'Partner Airline',
                flightNumber: seg.flightNumber || 'N/A',
                origin: seg.origin || 'BLR',
                originCity: seg.originCity || seg.originAirportName?.split(',')[0] || seg.origin || 'Departure',
                originAirportName: seg.originAirportName || seg.originAirport || '',
                destination: seg.destination || 'BOM',
                destinationCity: seg.destinationCity || seg.destinationAirportName?.split(',')[0] || seg.destination || 'Arrival',
                destinationAirportName: seg.destinationAirportName || seg.destinationAirport || '',
                depTime: getFormattedTime(seg.departureDateTime),
                depDate: getFormattedDate(seg.departureDateTime),
                arrTime: getFormattedTime(seg.arrivalDateTime),
                arrDate: getFormattedDate(seg.arrivalDateTime),
                duration: getStateDuration(seg.departureDateTime, seg.arrivalDateTime)
            }))
            : [
                {
                    airlineCode: flight?.airlineCode || primarySegment?.airlineCode || 'FL',
                    airlineName: flight?.airlineName || primarySegment?.airlineName || 'Partner Airline',
                    flightNumber: flight?.segments?.map(s => s.flightNumber).join(' → ') || primarySegment?.flightNumber || flight?.flightNumber || 'N/A',
                    origin: primarySegment?.origin || 'BLR',
                    originCity: primarySegment?.originCity || 'Departure',
                    originAirportName: primarySegment?.originAirportName || primarySegment?.originAirport || '',
                    depTime: getFormattedTime(primarySegment?.departureDateTime) || primarySegment?.departureTime || '',
                    depDate: getFormattedDate(primarySegment?.departureDateTime || flight?.departureDate || flight?.date),
                    destination: lastSegment?.destination || 'BOM',
                    destinationCity: lastSegment?.destinationCity || 'Arrival',
                    destinationAirportName: lastSegment?.destinationAirportName || lastSegment?.destinationAirport || '',
                    arrTime: getFormattedTime(lastSegment?.arrivalDateTime) || lastSegment?.arrivalTime || '',
                    arrDate: getFormattedDate(lastSegment?.arrivalDateTime || flight?.arrivalDate || flight?.date),
                    duration: getStateDuration(primarySegment?.departureDateTime, lastSegment?.arrivalDateTime) || flight?.duration || ''
                }
            ]
        );

    const isRoundTripBooking = displayFlightsList.length > 1 && 
        displayFlightsList[0].origin === displayFlightsList[displayFlightsList.length - 1].destination;

    const displayPassengersList = resolved?.passengers && resolved.passengers.length > 0
        ? resolved.passengers
        : (stateToUse.passengers && stateToUse.passengers.length > 0
            ? stateToUse.passengers
            : (stateToUse.passenger ? [stateToUse.passenger] : [mockPassenger]));

    const handlePrint = () => {
        window.print();
    };

    if (!flight && !bookingData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-[75px]">
                <Navbar />
                <div className="max-w-md mx-auto px-4 py-20 text-center">
                    <Ticket className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">No Booking Details Found</h2>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Please start a new flight booking from search.</p>
                    <button
                        onClick={() => navigate('/flights/list')}
                        className="bg-[#b89565] hover:bg-[#a38053] text-white font-bold py-3 px-6 transition-all"
                    >
                        Back to Flight Search
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-[75px] font-sans print:pt-0 print:bg-white">
            <div className="print:hidden">
                <Navbar />
            </div>

            <main className="max-w-2xl mx-auto px-4 py-8 w-full print:py-0 print:px-0">
                {/* Boarding Pass Ticket Container */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden relative print:border-slate-300 print:shadow-none">
                    
                    {/* Compact Success Header Banner inside the ticket */}
                    <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white px-6 py-5 text-center relative overflow-hidden print:bg-emerald-700">
                        {/* Subtle background graphics */}
                        <div className="absolute right-0 top-0 bottom-0 opacity-15 w-1/3 pointer-events-none">
                            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-white">
                                <circle cx="80" cy="50" r="40" stroke="currentColor" strokeWidth="2" />
                                <circle cx="80" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
                            </svg>
                        </div>
                        
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10 shadow-inner">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="4.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Flight Booking Confirmed!</h1>
                                <p className="text-emerald-100 text-xs mt-0.5 font-medium">Your ticket is confirmed. E-ticket sent to your email.</p>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Body Content */}
                    <div className="p-5 sm:p-6 relative space-y-5">
                        
                        {/* Cleartrip Status, PNR & Booking ID Strip */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100/80">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Airline PNR:</span>
                                <span className="text-sm font-black text-emerald-600 tracking-wide">{displayPnr}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking ID:</span>
                                <span className="text-sm font-bold text-slate-700">{confirmId}</span>
                            </div>
                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {displayStatus}
                            </span>
                        </div>

                        {/* Flight Route & Details (Compact) */}
                        <div className="space-y-6">
                            {displayFlightsList.map((f, idx) => {
                                const isReturnLeg = isRoundTripBooking && idx >= Math.ceil(displayFlightsList.length / 2);
                                return (
                                    <div key={idx} className={`space-y-3 ${idx > 0 ? 'pt-4 border-t border-slate-100/80' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] bg-slate-900 text-white font-extrabold px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                                                {isRoundTripBooking
                                                    ? (isReturnLeg ? '🔄 Return Flight' : '✈️ Outbound Flight')
                                                    : (idx === 0 ? '✈️ Outbound Flight' : `✈️ Connection Flight ${idx}`)}
                                            </span>
                                        </div>

                                        {/* Airline Header */}
                                        <div className="flex items-center justify-between pb-3 border-b border-slate-100/60">
                                            <div className="flex items-center gap-2">
                                                <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-extrabold text-xs shrink-0">
                                                    {f.airlineCode}
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-slate-800 text-sm leading-none">{f.airlineName}</h3>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Flight {f.flightNumber}</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200/50 flex items-center gap-1">
                                                <Armchair className="w-3 h-3 text-slate-500" /> Economy
                                            </div>
                                        </div>

                                        {/* Origin / Destination Grid */}
                                        <div className="grid grid-cols-3 items-center gap-2 pt-2 pb-1">
                                            {/* Origin */}
                                            <div>
                                                <p className="text-2.5xl font-black text-slate-800 tracking-tight leading-none">{f.origin}</p>
                                                <p className="text-[11px] text-slate-800 font-black mt-1.5 truncate">{f.originCity}</p>
                                                {f.originAirportName && (
                                                    <p className="text-xs text-slate-700 font-bold mt-0.5 leading-snug" title={f.originAirportName}>{f.originAirportName}</p>
                                                )}
                                                <p className="text-xs font-black text-emerald-600 mt-2">{f.depTime}</p>
                                                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{f.depDate}</p>
                                            </div>

                                            {/* Route illustration */}
                                            <div className="flex flex-col items-center justify-center relative">
                                                <span className="text-[10px] text-slate-450 font-bold mb-1">{f.duration || ''}</span>
                                                <div className="w-full flex items-center relative py-1">
                                                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-200"></div>
                                                    <div className="w-1 h-1 rounded-full bg-emerald-600 absolute left-0 top-1/2 -translate-y-1/2 z-10"></div>
                                                    <div className="mx-auto w-7 h-7 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center z-20 shadow-sm">
                                                        <Plane className="w-3.5 h-3.5 rotate-90 text-emerald-600" />
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-emerald-600 absolute right-0 top-1/2 -translate-y-1/2 z-10"></div>
                                                </div>
                                                <span className="text-[9px] text-emerald-650 font-extrabold tracking-wider mt-1 uppercase">{displayFlightsList.length <= 1 ? 'Direct' : `${displayFlightsList.length - 1} Stop(s)`}</span>
                                            </div>

                                            {/* Destination */}
                                            <div className="text-right">
                                                <p className="text-2.5xl font-black text-slate-800 tracking-tight leading-none">{f.destination}</p>
                                                <p className="text-[11px] text-slate-800 font-black mt-1.5 truncate">{f.destinationCity}</p>
                                                {f.destinationAirportName && (
                                                    <p className="text-xs text-slate-700 font-bold mt-0.5 leading-snug" title={f.destinationAirportName}>{f.destinationAirportName}</p>
                                                )}
                                                <p className="text-xs font-black text-emerald-600 mt-2">{f.arrTime}</p>
                                                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{f.arrDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Dashed divider line with ticket cutout punches */}
                        <div className="relative py-2 -mx-5 sm:-mx-6 print:py-1">
                            {/* Left cutout */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 border-r border-slate-200/60 rounded-full z-10"></div>
                            {/* Dotted border line */}
                            <div className="border-t border-dashed border-slate-250 w-full"></div>
                            {/* Right cutout */}
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 border-l border-slate-200/60 rounded-full z-10"></div>
                        </div>

                        {/* Passenger Details Row(s) */}
                        <div className="space-y-4 py-1 text-left">
                            <div className="border-b border-slate-100 pb-1 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                                    Passengers, Seats & Perks
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold block">
                                    {displayPassengersList.length} Traveller(s)
                                </span>
                            </div>
                            {displayPassengersList.map((p, idx) => {
                                const resolvePassengerMealDisplay = () => {
                                    if (p.confirmedMealTitle) {
                                        return { text: `🍱 ${p.confirmedMealTitle}`, class: 'text-emerald-600 font-bold' };
                                    }

                                    const selMealObj = p.selectedMealObj || p.selectedMeals?.[0];
                                    const selMealTitle = typeof selMealObj === 'object' 
                                        ? (selMealObj.description || selMealObj.title || selMealObj.mealId) 
                                        : (p.selectedMeal && p.selectedMeal !== 'None' ? p.selectedMeal : null);

                                    const holdStatus = p.mealHoldStatus || 'PENDING';

                                    if (selMealTitle) {
                                        const mealPriceStr = (typeof selMealObj === 'object' && selMealObj.price) ? ` (+₹${selMealObj.price})` : '';
                                        if (holdStatus === 'FAILED') {
                                            return { text: `🍱 ${selMealTitle}${mealPriceStr} (Not Confirmed)`, class: 'text-rose-600 font-bold' };
                                        } else {
                                            return { text: `🍱 ${selMealTitle}${mealPriceStr}`, class: 'text-emerald-600 font-bold' };
                                        }
                                    }

                                    const hasFareBenefit = stateToUse.hasFareMealBenefit || stateToUse.flight?.benefits?.some(b => 
                                        (b.type || b.benefitType || '').toUpperCase() === 'MEAL' ||
                                        (b.description || b.value || '').toLowerCase().includes('meal')
                                    );

                                    if (hasFareBenefit) {
                                        return { text: '🍱 Complimentary Meal Included', class: 'text-emerald-700 font-semibold' };
                                    }

                                    return { text: '🍱 Not Selected', class: 'text-slate-400 font-normal' };
                                };

                                const mealDisplay = resolvePassengerMealDisplay();

                                return (
                                    <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 items-start border-b border-slate-50 last:border-0 last:pb-0">
                                        <div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Passenger {idx + 1}</span>
                                            <span className="text-xs font-black text-slate-800 mt-0.5 block truncate">
                                                {p.title || 'Mr.'} {p.firstName} {p.lastName}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Seat</span>
                                            <span className={`text-xs font-black mt-0.5 block truncate ${(p.seatNumber || p.selectedSeat) ? 'text-emerald-600' : 'text-slate-400'}`} title={p.seatNumber || p.selectedSeat || 'Pending'}>
                                                {p.seatNumber || p.selectedSeat || 'Pending'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Baggage</span>
                                            <span className="text-xs font-semibold text-slate-700 mt-0.5 block truncate" title={`Cabin: ${p.includedCabinBag || p.cabinBag || 'Included'} • Check-in: ${p.includedCheckinBag || p.checkinBag || 'Included'}`}>
                                                🧳 {p.includedCabinBag || p.cabinBag || 'Included'} + {p.includedCheckinBag || p.checkinBag || 'Included'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Meal Selection</span>
                                            <span className={`text-xs mt-0.5 block truncate ${mealDisplay.class}`} title={mealDisplay.text}>
                                                {mealDisplay.text}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Simulated Barcode */}
                        <div className="pt-3 border-t border-slate-100 flex flex-col items-center justify-center gap-1.5 print:pt-2">
                            <div className="flex items-center justify-center gap-[2px] opacity-75 h-7">
                                <div className="w-[1.5px] h-full bg-slate-800"></div>
                                <div className="w-[3px] h-full bg-slate-800"></div>
                                <div className="w-[1px] h-full bg-slate-800"></div>
                                <div className="w-[2px] h-full bg-slate-800"></div>
                                <div className="w-[4px] h-full bg-slate-800"></div>
                                <div className="w-[1px] h-full bg-slate-800"></div>
                                <div className="w-[3px] h-full bg-slate-800"></div>
                                <div className="w-[1.5px] h-full bg-slate-800"></div>
                                <div className="w-[1px] h-full bg-slate-800"></div>
                                <div className="w-[4px] h-full bg-slate-800"></div>
                                <div className="w-[2.5px] h-full bg-slate-800"></div>
                                <div className="w-[1px] h-full bg-slate-800"></div>
                                <div className="w-[3.5px] h-full bg-slate-800"></div>
                                <div className="w-[1.5px] h-full bg-slate-800"></div>
                                <div className="w-[2.5px] h-full bg-slate-800"></div>
                                <div className="w-[1.5px] h-full bg-slate-800"></div>
                                <div className="w-[4px] h-full bg-slate-800"></div>
                                <div className="w-[1px] h-full bg-slate-800"></div>
                                <div className="w-[2px] h-full bg-slate-800"></div>
                                <div className="w-[3px] h-full bg-slate-800"></div>
                                <div className="w-[1.5px] h-full bg-slate-800"></div>
                                <div className="w-[1px] h-full bg-slate-800"></div>
                                <div className="w-[4px] h-full bg-slate-800"></div>
                                <div className="w-[2px] h-full bg-slate-800"></div>
                                <div className="w-[3px] h-full bg-slate-800"></div>
                            </div>
                            <span className="text-[9px] font-bold tracking-widest text-slate-400">{confirmId}</span>
                        </div>

                    </div>
                </div>

                {/* Compact Trust Badges (Horizontal single row) */}
                <div className="bg-white rounded-2xl border border-slate-150 shadow-[0_4px_15px_rgba(0,0,0,0.02)] p-4.5 mt-5">
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="flex flex-col items-center">
                            <Ticket className="w-4 h-4 text-emerald-600" />
                            <span className="text-[9px] font-extrabold text-slate-800 mt-1">Verified Ticket</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-slate-100">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-[9px] font-extrabold text-slate-800 mt-1">Secure Booking</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-slate-100">
                            <Headphones className="w-4 h-4 text-emerald-600" />
                            <span className="text-[9px] font-extrabold text-slate-800 mt-1">24x7 Help</span>
                        </div>
                        <div className="flex flex-col items-center border-l border-slate-100">
                            <Smartphone className="w-4 h-4 text-emerald-600" />
                            <span className="text-[9px] font-extrabold text-slate-800 mt-1">E-Ticket Ready</span>
                        </div>
                    </div>
                </div>

                {/* Print/Home Buttons */}
                <div className="flex items-center justify-between gap-4 mt-6 print:hidden">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-750 font-extrabold py-3 px-6 rounded-xl transition-all cursor-pointer text-xs"
                    >
                        <Home className="w-4 h-4" /> Go to Home
                    </button>
                    <button
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-1.5 bg-[#b89565] hover:bg-[#a38053] text-white font-extrabold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-xs"
                    >
                        <Download className="w-4 h-4" /> Print / Download
                    </button>
                </div>
            </main>

            <div className="print:hidden">
                <Footer />
            </div>
        </div>
    );
}
