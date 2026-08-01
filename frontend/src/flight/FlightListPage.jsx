import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plane, Calendar, Users, Briefcase, ArrowLeft, ArrowLeftRight, Clock, Shield, AlertCircle, Compass, HelpCircle, Check, Filter, RotateCcw, Luggage } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchFlights } from '../services/flightApi';
import { toast } from 'react-toastify';

export default function FlightListPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Parse URL params
    const fromVal = searchParams.get('from') || 'Bangalore (BLR)';
    const toVal = searchParams.get('to') || 'Mumbai (BOM)';
    const dateVal = searchParams.get('date') || '';
    const cabinVal = searchParams.get('cabin') || 'Economy';
    const travellersVal = searchParams.get('travellers') || '1 Adult';

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Selected flight detail states
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [previewFlight, setPreviewFlight] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const fetchedRef = useRef('');


    // Filter and Sort states
    const [sortBy, setSortBy] = useState('price_low');
    const [selectedAirlines, setSelectedAirlines] = useState([]);
    const [allAirlinesChecked, setAllAirlinesChecked] = useState(true);
    const [showAllAirlines, setShowAllAirlines] = useState(false);
    const [maxStops, setMaxStops] = useState('all');
    const [filterRefundable, setFilterRefundable] = useState(false);
    const [filterNonRefundable, setFilterNonRefundable] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [maxPriceLimit, setMaxPriceLimit] = useState(100000);
    const [maxDepHour, setMaxDepHour] = useState(24);
    const [maxArrHour, setMaxArrHour] = useState(24);

    const getAirlineLogo = (code) => {
        return `https://images.kiwi.com/airlines/64/${code}.png`;
    };

    // Helper functions to parse values
    const getAirportCode = (cityStr) => {
        const match = cityStr.match(/\(([^)]+)\)/);
        return match ? match[1] : cityStr;
    };

    const formatDateToDDMMYYYY = (dateStr) => {
        if (!dateStr) return '';
        // If already DD/MM/YYYY
        if (dateStr.includes('/')) return dateStr;
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const getPaxCount = (travellersStr) => {
        const count = parseInt(travellersStr);
        return isNaN(count) ? 1 : count;
    };

    const getCabinType = (cabinStr) => {
        if (!cabinStr) return 'ECONOMY';
        const lower = cabinStr.toLowerCase();
        if (lower.includes('business')) return 'BUSINESS';
        if (lower.includes('first')) return 'FIRST';
        return 'ECONOMY';
    };

    const fetchFlightsData = async () => {
        setLoading(true);
        setError(null);
        try {
            const formattedDate = formatDateToDDMMYYYY(dateVal);
            const originCode = getAirportCode(fromVal);
            const destCode = getAirportCode(toVal);
            const paxCount = getPaxCount(travellersVal);
            const cabinType = getCabinType(cabinVal);

            // Cleartrip search payload format
            const payload = {
                searchCriteria: {
                    sellingCountryCode: "IN",
                    sellingCurrencyCode: "INR",
                    maxRequiredFlightOptions: 25,
                    fareLimitingStrategyList: ["PRICE"],
                    flightOptionFilter: [],
                    responseVersion: "VERSION_V6",
                    fareTypes: ["RETAIL"]
                },
                searchIntents: {
                    sectors: [
                        {
                            index: 1,
                            origin: originCode,
                            destination: destCode,
                            departDate: formattedDate || "31/07/2026",
                            cabinType: cabinType,
                            paxInfos: [
                                {
                                    paxType: "ADT",
                                    paxCount: paxCount,
                                    paxFareType: "DEFAULT"
                                }
                            ]
                        }
                    ]
                }
            };

            const response = await searchFlights(payload);
            
             if (response.success && response.data) {
                // Denormalize Cleartrip v6 response
                const processed = [];
                const travelOptionsJ1 = response.data.travelOptions?.J1 || [];
                const flightsDict = response.data.flights || {};
                const subTravelOptionsDict = response.data.subTravelOptions || {};
                const faresDict = response.data.fares || {};
                const airlinesDict = response.data.metaData?.airlineDetail?.airlines || {};
                const baggageAllowancesDict = response.data.baggageAllowances || {};

                for (const option of travelOptionsJ1) {
                    const association = option.defaultFare?.associations?.[0];
                    if (!association) continue;

                    const subTravelOption = subTravelOptionsDict[association.subTravelOptionId];
                    if (!subTravelOption) continue;

                     const fare = faresDict[association.fareId];
                    const price = fare?.pricing?.totalPrice || 0;
                    const isRefundable = fare?.refundable;
                    const flightFares = fare?.subTravelOptionFare?.[0]?.flightFare || [];

                    const benefitIds = fare?.benefitIds || [];
                    const benefitsDict = response.data.benefits || {};
                    const resolvedBenefits = benefitIds
                        .map(id => benefitsDict[id])
                        .filter(Boolean)
                        .map(b => ({
                            type: b.benefitType,
                            value: b.value,
                            description: b.description || b.shortDescription || b.benefitType
                        }));
                    console.log(`[Benefits Debug] Option ID ${option.travelOptionId} has benefitIds:`, benefitIds, "Resolved benefits:", resolvedBenefits);


                    const sequenceToFlightIdMap = subTravelOption.sequenceToFlightIdMap || {};
                    const sortedSequenceKeys = Object.keys(sequenceToFlightIdMap).sort((a, b) => Number(a) - Number(b));
                    const segments = sortedSequenceKeys.map(key => {
                        const flightId = sequenceToFlightIdMap[key];
                        const flt = flightsDict[flightId] || {};
                        const airlineCode = flt.airlineCode;
                        const airlineName = airlinesDict[airlineCode]?.name || airlineCode;

                        const flightFare = flightFares.find(ff => ff.flightId === flightId) || {};
                        const baggageId = flightFare.baggageAllowances?.[0]?.baggageAllowanceId;
                        const baggage = baggageAllowancesDict[baggageId] || [];
                        const cabinBag = baggage.find(b => b.type === 'BAGGAGE_CABIN')?.allowedBaggages?.[0];
                        const checkInBag = baggage.find(b => b.type === 'BAGGAGE_CHECK_IN')?.allowedBaggages?.[0];

                        return {
                            flightNumber: flt.fltNo ? `${airlineCode}-${flt.fltNo}` : flightId,
                            airlineCode,
                            airlineName,
                            origin: flt.departureAirport?.code,
                            destination: flt.arrivalAirport?.code,
                            departureDateTime: flt.departureAirport?.time,
                            arrivalDateTime: flt.arrivalAirport?.time,
                            cabinType: flightFare.identifiers?.cabinType || 'ECONOMY',
                            brandName: flightFare.identifiers?.brandName || '',
                            availableSeats: flightFare.identifiers?.availableSeatCount || null,
                            cabinBaggage: cabinBag ? `${cabinBag.quantity} ${cabinBag.unit}` : '7 KG',
                            checkInBaggage: checkInBag ? `${checkInBag.quantity} ${checkInBag.unit}` : '15 KG',
                        };
                    });

                    if (segments.length === 0) continue;

                    processed.push({
                        id: option.travelOptionId,
                        segments,
                        price,
                        isRefundable,
                        airlineName: segments[0].airlineName,
                        airlineCode: segments[0].airlineCode,
                        stopsCount: segments.length - 1,
                        benefits: resolvedBenefits,
                    });
                }
                setFlights(processed);
                const prices = processed.map(f => f.price);
                if (prices.length > 0) {
                    const minP = Math.min(...prices);
                    const maxP = Math.max(...prices);
                    setMinPrice(minP);
                    setMaxPrice(maxP);
                    setMaxPriceLimit(maxP);
                }
            } else {
                setFlights([]);
                setError('No flights found for this route and date.');
            }
        } catch (err) {
            console.error('Error fetching flights:', err);
            const rawMsg = err.response?.data?.message;
            let displayMsg = 'Failed to connect to search service. Please try again.';
            if (rawMsg) {
                if (typeof rawMsg === 'object') {
                    displayMsg = rawMsg.errorMessage || rawMsg.message || JSON.stringify(rawMsg);
                } else {
                    displayMsg = rawMsg;
                }
            }
            setError(displayMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const searchKey = searchParams.toString();
        if (fetchedRef.current === searchKey) return;
        fetchedRef.current = searchKey;
        fetchFlightsData();
    }, [searchParams]);

    // Unique airlines for filters
    const uniqueAirlines = [...new Set(flights.map(f => f.airlineName || 'Airline'))];

    // Helper to extract hour from date string
    const getHour = (dateTimeStr) => {
        if (!dateTimeStr) return 0;
        try {
            return new Date(dateTimeStr).getHours();
        } catch (e) {
            return 0;
        }
    };

    // Filter and Sort flight list
    const filteredFlights = flights.filter(f => {
        const airlineName = f.airlineName || 'Airline';
        
        // Airline filter
        if (!allAirlinesChecked && selectedAirlines.length > 0 && !selectedAirlines.includes(airlineName)) {
            return false;
        }

        // Stops filter
        const stopsCount = f.stopsCount || 0;
        if (maxStops !== 'all') {
            if (maxStops === '0' && stopsCount > 0) return false;
            if (maxStops === '1' && stopsCount > 1) return false;
            if (maxStops === '2+' && stopsCount < 2) return false;
        }

        // Fare Type checkboxes filter
        if (filterRefundable && !filterNonRefundable && !f.isRefundable) return false;
        if (filterNonRefundable && !filterRefundable && f.isRefundable) return false;

        // Price Filter
        if (f.price > maxPrice) return false;

        // Departure Hour Filter
        const depHour = getHour(f.segments[0]?.departureDateTime);
        if (depHour > maxDepHour) return false;

        // Arrival Hour Filter
        const lastSeg = f.segments[f.segments.length - 1];
        const arrHour = getHour(lastSeg?.arrivalDateTime);
        if (arrHour > maxArrHour) return false;

        return true;
    }).sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;

        if (sortBy === 'price_low') return priceA - priceB;
        if (sortBy === 'price_high') return priceB - priceA;
        
        // Duration sort
        const getDuration = (flt) => {
            if (!flt.segments || flt.segments.length === 0) return 0;
            const start = new Date(flt.segments[0].departureDateTime);
            const end = new Date(flt.segments[flt.segments.length - 1].arrivalDateTime);
            return end - start;
        };
        if (sortBy === 'duration') return getDuration(a) - getDuration(b);

        return 0;
    });

    const handleAirlineToggle = (airline) => {
        setAllAirlinesChecked(false);
        if (selectedAirlines.includes(airline)) {
            const next = selectedAirlines.filter(item => item !== airline);
            setSelectedAirlines(next);
            if (next.length === 0) {
                setAllAirlinesChecked(true);
            }
        } else {
            setSelectedAirlines([...selectedAirlines, airline]);
        }
    };

    const handleAllAirlinesToggle = () => {
        if (allAirlinesChecked) {
            setAllAirlinesChecked(false);
            setSelectedAirlines([]);
        } else {
            setAllAirlinesChecked(true);
            setSelectedAirlines([]);
        }
    };

    const handleBooking = (flight) => {
        toast.success(`Redirecting to payment for flight ${flight.airlineName} ${flight.segments?.[0]?.flightNumber}...`);
        // Navigate to payment or detail page
        navigate('/payment', { state: { flight } });
    };

    const handleCardClick = (flight) => {
        setPreviewFlight(flight);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            setPreviewFlight(null);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pt-16">
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); }
                    to { transform: translateX(100%); }
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeOutOverlay {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                .animate-slide-in-right {
                    animation: slideInRight 1.0s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-slide-out-right {
                    animation: slideOutRight 1.0s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in-overlay {
                    animation: fadeInOverlay 1.0s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-out-overlay {
                    animation: fadeOutOverlay 1.0s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            <Navbar />
            
            {/* Search Overview Banner */}
            <div className="bg-[#0b0f19] text-white py-3 px-[5%] border-b-[2px] border-[#b89565]">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-1.5">
                    <button 
                        className="self-start flex items-center gap-1.5 bg-transparent border border-[#b89565]/40 text-[#b89565] px-3 py-1 rounded-md text-xs font-semibold hover:bg-[#b89565] hover:text-[#0b0f19] transition-all"
                        onClick={() => navigate('/flights')}
                    >
                        <ArrowLeft size={14} /> Back to Search
                    </button>
                    <div>
                        <h2 className="font-serif text-xl md:text-2xl font-bold mb-1.5 uppercase tracking-wider text-slate-100 flex items-center gap-2">
                            {fromVal} <span className="text-[#b89565] font-normal">⇆</span> {toVal}
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            <span className="bg-[#121b2d] border border-[#b89565]/40 text-slate-300 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5">
                                <Calendar size={12} className="text-[#b89565]" /> {dateVal}
                            </span>
                            <span className="bg-[#121b2d] border border-[#b89565]/40 text-slate-300 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5">
                                <Users size={12} className="text-[#b89565]" /> {travellersVal}
                            </span>
                            <span className="bg-[#121b2d] border border-[#b89565]/40 text-slate-300 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1.5">
                                <Briefcase size={12} className="text-[#b89565]" /> {cabinVal}
                            </span>
                        </div>
                    </div>
                </div>
            </div>            {/* Clean 2-Column Responsive Layout */}
            <div className="max-w-[1200px] mx-auto my-8 px-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
                
                {/* ==================================================
                    LEFT SIDEBAR (Sticky Filters)
                   ================================================== */}
                <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                    <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <Filter size={16} className="text-slate-700" /> Filters
                        </h3>
                        {(selectedAirlines.length > 0 || !allAirlinesChecked || maxStops !== 'all' || filterRefundable || filterNonRefundable || maxPrice < maxPriceLimit || maxDepHour < 24 || maxArrHour < 24) && (
                            <button 
                                className="text-xs font-semibold text-[#b89565] hover:text-[#9c7b4f] flex items-center gap-1 transition-colors"
                                onClick={() => { 
                                    setSelectedAirlines([]); 
                                    setAllAirlinesChecked(true);
                                    setMaxStops('all'); 
                                    setFilterRefundable(false);
                                    setFilterNonRefundable(false);
                                    setMaxPrice(maxPriceLimit);
                                    setMaxDepHour(24);
                                    setMaxArrHour(24);
                                }}
                            >
                                Reset All
                            </button>
                        )}
                    </div>

                    {/* Stops Filter */}
                    <div className="mb-5">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Stops</h4>
                        <div className="flex flex-col gap-2">
                            {[
                                { label: `All Flights (${flights.length})`, value: 'all' },
                                { label: `Non-stop (${flights.filter(f => f.stopsCount === 0).length})`, value: '0' },
                                { label: `1 Stop (${flights.filter(f => f.stopsCount === 1).length})`, value: '1' },
                                { label: `2+ Stops (${flights.filter(f => f.stopsCount >= 2).length})`, value: '2+' }
                            ].map(stopOpt => (
                                <label key={stopOpt.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#b89565] cursor-pointer transition-colors">
                                    <input 
                                        type="radio" 
                                        name="stops-filter"
                                        checked={maxStops === stopOpt.value} 
                                        onChange={() => setMaxStops(stopOpt.value)} 
                                        className="accent-[#b89565] w-4 h-4"
                                    />
                                    <span>{stopOpt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Airlines Filter */}
                    <div className="mb-5">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Airlines</h4>
                        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                            <label className="flex items-center gap-2 text-xs text-slate-700 font-bold hover:text-[#b89565] cursor-pointer transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={allAirlinesChecked}
                                    onChange={handleAllAirlinesToggle}
                                    className="accent-[#b89565] w-4 h-4"
                                />
                                <span>All Airlines</span>
                            </label>
                            {uniqueAirlines.length === 0 ? (
                                <p className="text-xs text-slate-400">No airlines found</p>
                            ) : (
                                (showAllAirlines ? uniqueAirlines : uniqueAirlines.slice(0, 5)).map(airline => (
                                    <label key={airline} className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#b89565] cursor-pointer transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedAirlines.includes(airline)}
                                            onChange={() => handleAirlineToggle(airline)}
                                            className="accent-[#b89565] w-4 h-4"
                                        />
                                        <span>{airline} ({flights.filter(f => f.airlineName === airline).length})</span>
                                    </label>
                                ))
                            )}
                            {uniqueAirlines.length > 5 && (
                                <button 
                                    className="self-start text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-1" 
                                    onClick={() => setShowAllAirlines(!showAllAirlines)}
                                >
                                    {showAllAirlines ? 'Show Less' : 'Show More'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Fare Type Filter */}
                    <div className="mb-5">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Fare Type</h4>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#b89565] cursor-pointer transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={filterRefundable}
                                    onChange={(e) => setFilterRefundable(e.target.checked)}
                                    className="accent-[#b89565] w-4 h-4"
                                />
                                <span>Refundable</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#b89565] cursor-pointer transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={filterNonRefundable}
                                    onChange={(e) => setFilterNonRefundable(e.target.checked)}
                                    className="accent-[#b89565] w-4 h-4"
                                />
                                <span>Non Refundable</span>
                            </label>
                        </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-5">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price Range</h4>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>₹{minPrice.toLocaleString()}</span>
                            <span className="text-[#b89565] text-xs">₹{maxPrice.toLocaleString()}</span>
                        </div>
                        <input 
                            type="range" 
                            min={minPrice} 
                            max={maxPriceLimit} 
                            value={maxPrice} 
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full accent-[#b89565] cursor-pointer"
                        />
                    </div>

                    {/* Departure Time Filter */}
                    <div className="mb-5">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Departure Time</h4>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>00:00 - {maxDepHour < 10 ? `0${maxDepHour}` : maxDepHour}:00</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="24" 
                            value={maxDepHour} 
                            onChange={(e) => setMaxDepHour(Number(e.target.value))}
                            className="w-full accent-[#b89565] cursor-pointer"
                        />
                    </div>

                    {/* Arrival Time Filter */}
                    <div className="mb-2">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Arrival Time</h4>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>00:00 - {maxArrHour < 10 ? `0${maxArrHour}` : maxArrHour}:00</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="24" 
                            value={maxArrHour} 
                            onChange={(e) => setMaxArrHour(Number(e.target.value))}
                            className="w-full accent-[#b89565] cursor-pointer"
                        />
                    </div>
                </div>

                {/* ==================================================
                    CENTER (Flight Result List)
                   ================================================== */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="flex justify-between items-center bg-white p-3.5 px-5 rounded-md border border-slate-200 shadow-sm">
                        <span className="text-sm font-semibold text-slate-900">
                            {loading ? 'Searching flights...' : `${filteredFlights.length} Flights found`}
                        </span>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <label>Sort By:</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                className="p-1 px-2.5 rounded border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer focus:border-[#b89565]"
                            >
                                <option value="price_low">Price (Lowest First)</option>
                                <option value="price_high">Price (Highest First)</option>
                                <option value="duration">Duration (Shortest First)</option>
                            </select>
                        </div>
                    </div>

                    {/* Loader Skeleton */}
                    {loading && (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(n => (
                                <div key={n} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm animate-pulse">
                                    <div className="h-4 bg-slate-100 rounded w-36 mb-4"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-8 bg-slate-100 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <div className="bg-white rounded-lg p-10 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                            <AlertCircle size={40} className="text-red-500 mb-3" />
                            <h3 className="text-base font-bold text-slate-900 mb-1">No Flights Available</h3>
                            <p className="text-xs text-slate-500 mb-4">{error}</p>
                            <button 
                                className="bg-[#0b0f19] text-white border border-[#b89565] px-5 py-2 rounded-lg text-xs font-semibold hover:bg-[#b89565] hover:text-[#0b0f19] transition-all"
                                onClick={fetchFlightsData}
                            >
                                Retry Search
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && filteredFlights.length === 0 && (
                        <div className="bg-white rounded-lg p-10 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                            <Compass size={40} className="text-[#b89565] mb-3" />
                            <h3 className="text-base font-bold text-slate-900 mb-1">No Flights Match Your Filters</h3>
                            <p className="text-xs text-slate-500">Try adjusting your stops or airlines criteria.</p>
                        </div>
                    )}

                    {/* Results Cards */}
                    {!loading && !error && filteredFlights.map((flight, idx) => {
                        const segments = flight.segments || [];
                        const primarySegment = segments[0] || {};
                        const lastSegment = segments[segments.length - 1] || primarySegment;
                        const airlineName = flight.airlineName || 'Airline';

                        const getFormattedTime = (dateStr) => {
                            if (!dateStr) return '--:--';
                            const date = new Date(dateStr);
                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        };

                        const getDurationMinutes = (departureStr, arrivalStr) => {
                            if (!departureStr || !arrivalStr) return 0;
                            return Math.floor((new Date(arrivalStr) - new Date(departureStr)) / (1000 * 60));
                        };

                        const totalDurationMins = getDurationMinutes(primarySegment.departureDateTime, lastSegment.arrivalDateTime);
                        
                        const formatDuration = (mins) => {
                            const hrs = Math.floor(mins / 60);
                            const m = mins % 60;
                            return `${hrs}h ${m}m`;
                        };

                        const price = flight.price || 0;

                        return (
                            <div 
                                key={flight.id || idx} 
                                className="bg-white rounded-md border border-slate-200 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#b89565]/40 cursor-pointer"
                                onClick={() => handleCardClick(flight)}
                            >
                                <div className="grid grid-cols-[1.2fr_2fr_1fr] items-center p-6 gap-4">
                                    {/* Airline Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                                            <img 
                                                src={getAirlineLogo(flight.airlineCode)} 
                                                alt={airlineName} 
                                                className="w-8 h-8 object-contain"
                                                onError={(e) => { e.target.src = 'https://images.kiwi.com/airlines/64/AI.png'; }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">{airlineName}</h4>
                                            <span className="text-xs text-slate-500 font-medium">{primarySegment.flightNumber}</span>
                                            <div className="text-[11px] text-[#b89565] font-semibold mt-0.5 uppercase tracking-wider">Holiday Fare</div>
                                        </div>
                                    </div>

                                    {/* Journey Timing */}
                                    <div className="flex items-center justify-around px-2 gap-2">
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-slate-950">{getFormattedTime(primarySegment.departureDateTime)}</h3>
                                            <span className="text-xs text-slate-500 font-semibold uppercase">{primarySegment.origin}</span>
                                        </div>

                                        <div className="flex flex-col items-center w-24 md:w-32 shrink-0">
                                            <span className="text-[10px] text-slate-400 mb-0.5">{formatDuration(totalDurationMins)}</span>
                                            <div className="relative w-full h-[1px] bg-slate-300 my-1">
                                                <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-[#b89565] -translate-y-1/2"></div>
                                                {segments.length > 1 && (
                                                    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#b89565] -translate-x-1/2 -translate-y-1/2"></div>
                                                )}
                                                <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-[#b89565] -translate-y-1/2"></div>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-650">
                                                {segments.length === 1 ? 'Non-stop' : `${segments.length - 1} Stop(s)`}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <h3 className="text-lg font-bold text-slate-950">{getFormattedTime(lastSegment.arrivalDateTime)}</h3>
                                            <span className="text-xs text-slate-500 font-semibold uppercase">{lastSegment.destination}</span>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="border-l border-slate-100 pl-6 text-center flex flex-col gap-1.5 justify-center items-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl font-bold text-slate-950">₹{price.toLocaleString()}</span>
                                            <span className="text-[11px] text-emerald-600 font-semibold">{flight.isRefundable ? 'Refundable' : 'Non-Refundable'}</span>
                                        </div>
                                        <button 
                                            className="bg-[#b89565] hover:bg-[#9d7d51] text-white py-2 px-6 rounded text-sm font-semibold transition-all mt-1 w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBooking(flight);
                                            }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>

                                {/* Compact Bottom Badges */}
                                <div className="flex justify-between items-center bg-slate-50/70 border-t border-slate-100 px-6 py-2.5 text-[11px]">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                            {primarySegment.cabinType} • Holiday Fare
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                                            🧳 Cabin: <strong>{primarySegment.cabinBaggage}</strong>
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                                            𛄄 Check-in: <strong>{primarySegment.checkInBaggage}</strong>
                                        </span>
                                    </div>
                                    <div>
                                        {primarySegment.availableSeats && (
                                            <span className="border border-red-200 text-red-650 bg-red-50/50 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                ⚠️ {primarySegment.availableSeats} seat(s) left
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ==================================================
                SLIDE-OVER DRAWER (Covers 70% width, animates from right)
               ================================================== */}
            {previewFlight && (
                <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Background Overlay */}
                        <div 
                            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm ${isDrawerOpen ? 'animate-fade-in-overlay' : 'animate-fade-out-overlay'}`}
                            onClick={closeDrawer}
                        ></div>

                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <div className="pointer-events-auto w-screen max-w-[70vw]">
                                <div className={`flex h-full flex-col overflow-y-scroll bg-white shadow-2xl border-l border-slate-200 ${isDrawerOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'}`}>
                                    {/* Close Button Header */}
                                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                                        <h2 className="text-base font-bold text-slate-900" id="slide-over-title">Flight Details / Preview</h2>
                                        <button 
                                            type="button" 
                                            className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" 
                                            onClick={closeDrawer}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Scrollable details panel */}
                                    <div className="p-8 flex flex-col gap-6">
                                        {/* 1. Header Row */}
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-150">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={getAirlineLogo(previewFlight.airlineCode)} 
                                                    alt={previewFlight.airlineName} 
                                                    className="w-10 h-10 object-contain"
                                                    onError={(e) => { e.target.src = 'https://images.kiwi.com/airlines/64/AI.png'; }}
                                                />
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900">{previewFlight.airlineName} | {previewFlight.segments?.[0]?.flightNumber}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Aircraft: {previewFlight.segments?.[0]?.brandName || 'Boeing 737'}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded text-xs font-bold ${previewFlight.isRefundable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                                {previewFlight.isRefundable ? 'Refundable' : 'Non-Refundable'}
                                            </span>
                                        </div>

                                        {/* 2. Flight Timeline Summary */}
                                        <div className="flex items-center justify-between bg-slate-50/50 p-4 border border-slate-100 rounded-md">
                                            <div className="text-left">
                                                <h3 className="text-2xl font-bold text-slate-900">{new Date(previewFlight.segments?.[0]?.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                                <span className="text-sm font-bold text-slate-700 uppercase">{previewFlight.segments?.[0]?.origin}</span>
                                            </div>

                                            <div className="flex flex-col items-center flex-1 max-w-[240px] px-4">
                                                <span className="text-xs text-slate-400 font-medium mb-1">
                                                    {Math.floor(Math.floor((new Date(previewFlight.segments?.[previewFlight.segments.length - 1]?.arrivalDateTime) - new Date(previewFlight.segments?.[0]?.departureDateTime)) / (1000 * 60)) / 60)}h {Math.floor((new Date(previewFlight.segments?.[previewFlight.segments.length - 1]?.arrivalDateTime) - new Date(previewFlight.segments?.[0]?.departureDateTime)) / (1000 * 60)) % 60}m
                                                </span>
                                                <div className="relative w-full h-[1px] bg-slate-300">
                                                    <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-[#b89565] -translate-y-1/2"></div>
                                                    {previewFlight.segments.length > 1 && (
                                                        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#b89565] -translate-x-1/2 -translate-y-1/2"></div>
                                                    )}
                                                    <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-[#b89565] -translate-y-1/2"></div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 mt-1">
                                                    {previewFlight.segments.length === 1 ? 'Non-stop' : `${previewFlight.segments.length - 1} Stop(s)`}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <h3 className="text-2xl font-bold text-slate-900">{new Date(previewFlight.segments?.[previewFlight.segments.length - 1]?.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h3>
                                                <span className="text-sm font-bold text-slate-700 uppercase">{previewFlight.segments?.[previewFlight.segments.length - 1]?.destination}</span>
                                            </div>
                                        </div>

                                        {/* 3. Flight Information Grid */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Flight Information</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/20 border border-slate-100 rounded-md p-4">
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Airline</span>
                                                    <strong className="text-xs text-slate-800 font-semibold">{previewFlight.airlineName}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Flight Number</span>
                                                    <strong className="text-xs text-slate-800 font-semibold">{previewFlight.segments?.[0]?.flightNumber}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Aircraft</span>
                                                    <strong className="text-xs text-slate-800 font-semibold">{previewFlight.segments?.[0]?.brandName || 'Boeing 737'}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cabin Class</span>
                                                    <strong className="text-xs text-slate-800 font-semibold">{previewFlight.segments?.[0]?.cabinType || 'Economy'}</strong>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fare Type</span>
                                                    <strong className="text-xs text-slate-800 font-semibold">PUBLISHED</strong>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Trip Type</span>
                                                    <strong className="text-xs text-slate-800 font-semibold">One Way</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4. Segment Route Details */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Route Details</h4>
                                            <div className="border border-slate-150 rounded-md p-4 flex flex-col gap-4">
                                                {previewFlight.segments.map((seg, sIdx) => (
                                                    <div key={sIdx} className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <span className="text-sm font-bold text-slate-900">{seg.origin}</span>
                                                            <span className="block text-xs font-bold text-slate-850">{new Date(seg.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span className="block text-[10px] text-slate-500 mt-0.5">{new Date(seg.departureDateTime).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span className="block text-[10px] text-slate-400 mt-0.5">{seg.originAirportName || 'Kempegowda Intl Airport, Bangalore'}</span>
                                                        </div>

                                                        <div className="flex flex-col items-center justify-center pt-2">
                                                            <span className="text-[10px] text-slate-400 font-medium">{seg.duration || '2h 0m'}</span>
                                                            <div className="w-[100px] h-[1px] bg-slate-200 my-1 relative">
                                                                <div className="absolute top-1/2 left-0 w-1 h-1 rounded-full bg-[#b89565] -translate-y-1/2"></div>
                                                                <div className="absolute top-1/2 right-0 w-1 h-1 rounded-full bg-[#b89565] -translate-y-1/2"></div>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-[#b89565] uppercase tracking-wide">{seg.cabinType}</span>
                                                        </div>

                                                        <div className="flex-1 text-right">
                                                            <span className="text-sm font-bold text-slate-900">{seg.destination}</span>
                                                            <span className="block text-xs font-bold text-slate-855">{new Date(seg.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span className="block text-[10px] text-slate-500 mt-0.5">{new Date(seg.arrivalDateTime).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span className="block text-[10px] text-slate-400 mt-0.5">{seg.destinationAirportName || 'Chhatrapati Shivaji Maharaj Intl Airport, Mumbai'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 5. Fare Summary & Benefits Split View */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-150">
                                            {/* Fare Summary */}
                                            <div className="flex flex-col gap-2.5">
                                                <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider mb-1">Fare Summary</h4>
                                                <div className="flex justify-between text-xs text-slate-600">
                                                    <span>Base Fare</span>
                                                    <span>₹{Math.round(previewFlight.price * 0.82).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-600">
                                                    <span>Taxes</span>
                                                    <span>₹{Math.round(previewFlight.price * 0.18).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-600">
                                                    <span>Fees</span>
                                                    <span>₹0</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-600">
                                                    <span>Discount</span>
                                                    <span className="text-emerald-500 font-bold">₹0</span>
                                                </div>
                                                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-3.5 mt-2">
                                                    <span>Total Payable</span>
                                                    <span className="text-emerald-650 font-bold">₹{previewFlight.price.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Benefits (Fare Rules) */}
                                            <div className="flex flex-col gap-2 bg-slate-50/50 p-4 border border-slate-100 rounded-md">
                                                <h4 className="text-xs font-bold text-slate-855 uppercase tracking-wider mb-1.5">Benefits (Fare Rules)</h4>
                                                
                                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[180px] pr-1 mb-4">
                                                    {previewFlight.benefits && previewFlight.benefits.length > 0 ? (
                                                        previewFlight.benefits.map((benefit, bIdx) => (
                                                            <div key={bIdx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100/70 text-slate-600">
                                                                <span className="capitalize font-medium">{benefit.type.toLowerCase().replace('_', ' ')}</span>
                                                                <strong className="text-slate-855 text-right max-w-[60%] truncate" title={benefit.description || benefit.value || 'Included'}>
                                                                    {benefit.description || benefit.value || 'Included'}
                                                                </strong>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-xs text-slate-400 py-4 text-center">No benefits information returned from Cleartrip B2B.</div>
                                                    )}
                                                </div>

                                                <button 
                                                    className="bg-[#b89565] hover:bg-[#9d7d51] text-white py-2.5 rounded text-sm font-bold tracking-wide uppercase transition-all mt-auto w-full"
                                                    onClick={() => handleBooking(previewFlight)}
                                                >
                                                    Continue
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
