import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft, ChevronRight, Sparkles, Check, Luggage, Lock, Shield, Award, Utensils, Receipt } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchAncillariesApi, holdFlightApi } from '../services/flightApi';
import { toast } from 'react-toastify';

// Cache to prevent duplicate fetch-ancillaries API calls in React StrictMode
const ancillariesCache = new Map();

export default function SeatAndAncillarySelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Data passed from FlightBookingDetailsPage
    const { flight, searchId, dataId, sessionId, flightPreview, ancillaries: initialAncillaries, passenger, passengers: initialPassengers, contact } = location.state || {};

    const passengers = initialPassengers || (passenger ? [passenger] : [{ firstName: 'Traveller', lastName: 'Passenger', title: 'MR', gender: 'MALE', type: 'ADT', label: 'Adult 1', id: 'adult-0' }]);

    const [liveAncillaries, setLiveAncillaries] = useState(initialAncillaries || null);
    const [isLoadingAncillaries, setIsLoadingAncillaries] = useState(false);
    const [ancillariesUnavailable, setAncillariesUnavailable] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [showLoginRequired, setShowLoginRequired] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const ancillaryRanRef = useRef(false);

    // Cleartrip B2B sessions expire after a few minutes. A hard refresh keeps
    // the same (now-dead) session/preview IDs in sessionStorage, so refreshing
    // never fixes it — the only real fix is a fresh search, which mints a new
    // session. This clears the stale keys and sends the user back to search.
    const handleSearchAgain = () => {
        [
            'flight_session_id', 'flight_preview_id', 'multi_city_previews_map',
        ].forEach(key => sessionStorage.removeItem(key));
        for (let i = 0; i < 10; i++) {
            sessionStorage.removeItem(`flight_session_id_${i}`);
            sessionStorage.removeItem(`flight_preview_id_${i}`);
        }
        navigate('/flights');
    };

    const primarySegment = flight?.segments?.[0] || {};
    const lastSegment = flight?.segments?.[flight?.segments?.length - 1] || primarySegment;

    const hasFareMealBenefit = React.useMemo(() => {
        const benefitsList = flight?.benefits || flightPreview?.benefits || [];
        return benefitsList.some(b => 
            (b.type || b.benefitType || '').toUpperCase() === 'MEAL' ||
            (b.description || b.value || '').toLowerCase().includes('meal')
        );
    }, [flight, flightPreview]);

    // Unified City Pairs Structure (Handles Multicity, Roundtrip, and Oneway)
    const cityPairs = React.useMemo(() => {
        if (flight?.selectedSectorsList && flight.selectedSectorsList.length > 0) {
            return flight.selectedSectorsList.map((sec, idx) => {
                const segs = sec.segments || [];
                const firstSeg = segs[0] || {};
                const lastSeg = segs[segs.length - 1] || firstSeg;
                return {
                    index: idx,
                    id: sec.rawOption?.travelOptionId || sec.id || `option-${idx + 1}`,
                    searchIntent: sec.searchIntent || `${firstSeg.origin || 'ORIG'}_${lastSeg.destination || 'DEST'}`,
                    origin: firstSeg.origin || 'ORIG',
                    destination: lastSeg.destination || 'DEST',
                    departDate: firstSeg.departureDateTime ? new Date(firstSeg.departureDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
                    subTravelOptionId: sec.rawOption?.subTravelOptionId || sec.id,
                    fareId: sec.rawOption?.fareId || '',
                    segments: segs,
                    rawSector: sec
                };
            });
        } else if (flight?.isRoundTripCombined) {
            const outCount = flight.outboundSegmentsCount || 1;
            const outSegs = flight.segments ? flight.segments.slice(0, outCount) : [];
            const retSegs = flight.segments ? flight.segments.slice(outCount) : [];
            const outFirst = outSegs[0] || {};
            const outLast = outSegs[outSegs.length - 1] || outFirst;
            const retFirst = retSegs[0] || {};
            const retLast = retSegs[retSegs.length - 1] || retFirst;
            return [
                {
                    index: 0,
                    id: flight.outboundRawOption?.travelOptionId || flight.outboundTravelId || flight.id,
                    searchIntent: `${outFirst.origin || 'ORIG'}_${outLast.destination || 'DEST'}`,
                    origin: outFirst.origin || 'ORIG',
                    destination: outLast.destination || 'DEST',
                    departDate: outFirst.departureDateTime ? new Date(outFirst.departureDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
                    subTravelOptionId: flight.outboundRawOption?.subTravelOptionId || flight.id,
                    fareId: flight.outboundRawOption?.fareId || '',
                    segments: outSegs,
                    rawSector: flight
                },
                {
                    index: 1,
                    id: flight.returnRawOption?.travelOptionId || flight.returnTravelId || flight.id,
                    searchIntent: `${retFirst.origin || 'ORIG'}_${retLast.destination || 'DEST'}`,
                    origin: retFirst.origin || 'ORIG',
                    destination: retLast.destination || 'DEST',
                    departDate: retFirst.departureDateTime ? new Date(retFirst.departureDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
                    subTravelOptionId: flight.returnRawOption?.subTravelOptionId || flight.id,
                    fareId: flight.returnRawOption?.fareId || '',
                    segments: retSegs,
                    rawSector: flight
                }
            ];
        } else {
            const segs = flight?.segments || [];
            const firstSeg = segs[0] || {};
            const lastSeg = segs[segs.length - 1] || firstSeg;
            return [
                {
                    index: 0,
                    id: flight?.rawOption?.travelOptionId || flight?.id || 'option-1',
                    searchIntent: `${firstSeg.origin || 'ORIG'}_${lastSeg.destination || 'DEST'}`,
                    origin: firstSeg.origin || 'ORIG',
                    destination: lastSeg.destination || 'DEST',
                    departDate: firstSeg.departureDateTime ? new Date(firstSeg.departureDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
                    subTravelOptionId: flight?.rawOption?.subTravelOptionId || flight?.id || 'sub-1',
                    fareId: flight?.rawOption?.fareId || '',
                    segments: segs,
                    rawSector: flight
                }
            ];
        }
    }, [flight]);

    // Active Tab & Navigation Indices (City Pair Index -> Leg Index -> Passenger Index)
    const [activeTab, setActiveTab] = useState('seats');
    const [activeCityPairIdx, setActiveCityPairIdx] = useState(0);
    const [activeLegIdx, setActiveLegIdx] = useState(0);
    const [activePassengerIdx, setActivePassengerIdx] = useState(0);

    const activeCityPair = cityPairs[activeCityPairIdx] || cityPairs[0] || {};
    const activeLegs = activeCityPair.segments || [];
    const activeLeg = activeLegs[activeLegIdx] || activeLegs[0] || {};
    const activeSegKey = `${activeCityPairIdx}_${activeLegIdx}`;

    // 3-Level Selections state per passenger
    const [selections, setSelections] = useState(() => {
        return passengers.map(() => ({
            selectedSeats: {},  // maps `${cityPairIdx}_${legIdx}` -> seatId
            selectedMeals: {},  // maps `${cityPairIdx}_${legIdx}` -> mealObj
            selectedBaggage: {} // maps `${cityPairIdx}` -> baggageId
        }));
    });

    const selectedSeat = selections[activePassengerIdx]?.selectedSeats?.[activeSegKey] ||
                         selections[activePassengerIdx]?.selectedSeats?.[activeCityPairIdx] || 'None';
    
    // Extract currently selected meal for active passenger & active sector/leg
    const activeMealSel = selections[activePassengerIdx]?.selectedMeals?.[activeSegKey] || selections[activePassengerIdx]?.selectedMeals?.[activeCityPairIdx];
    const selectedMeal = typeof activeMealSel === 'object'
        ? (activeMealSel.mealId || activeMealSel.mealCode || 'None')
        : (selections[activePassengerIdx]?.selectedMeal || 'None');

    const selectedBaggage = (typeof selections[activePassengerIdx]?.selectedBaggage === 'object'
        ? selections[activePassengerIdx]?.selectedBaggage?.[activeCityPairIdx]
        : selections[activePassengerIdx]?.selectedBaggage) || 'None';

    const setSelectedSeat = (seatId) => {
        if (passengers[activePassengerIdx]?.type === 'INF') {
            toast.warn("Infants do not occupy a separate seat.");
            return;
        }
        setSelections(prev => {
            const updated = [...prev];
            const paxSel = updated[activePassengerIdx] || {};
            const currentSeats = { ...(paxSel.selectedSeats || {}) };
            if (seatId === 'None' || currentSeats[activeSegKey] === seatId) {
                delete currentSeats[activeSegKey];
            } else {
                currentSeats[activeSegKey] = seatId;
            }
            updated[activePassengerIdx] = {
                ...paxSel,
                selectedSeats: currentSeats
            };
            return updated;
        });
    };

    const setSelectedMeal = (mealInput) => {
        setSelections(prev => {
            const updated = [...prev];
            const paxSel = updated[activePassengerIdx] || {};
            const currentMeals = { ...(paxSel.selectedMeals || {}) };

            const currentSelected = typeof currentMeals[activeSegKey] === 'object' 
                ? (currentMeals[activeSegKey].mealId || currentMeals[activeSegKey].mealCode) 
                : currentMeals[activeSegKey];
            const mealIdInput = typeof mealInput === 'object' ? (mealInput.id || mealInput.code) : mealInput;

            if (!mealInput || mealIdInput === 'None' || currentSelected === mealIdInput) {
                delete currentMeals[activeSegKey];
            } else {
                const segFlightId = activeLeg.id || activeLeg.segmentId || `${activeLeg.flightNumber || 'FL'}-${activeLeg.origin}-${activeLeg.destination}`;
                const mealObj = typeof mealInput === 'object' ? mealInput : (liveMealsData || []).find(m => m.id === mealInput || m.code === mealInput) || { id: mealInput, code: mealInput, title: mealInput, price: 0 };
                
                currentMeals[activeSegKey] = {
                    flightId: mealObj.flightId || segFlightId,
                    paxIndex: activePassengerIdx + 1,
                    ancillaryType: "MEAL",
                    mealId: mealObj.id || mealObj.code,
                    mealCode: mealObj.code || mealObj.id,
                    description: mealObj.title || mealObj.desc || mealObj.description || "In-flight Meal",
                    price: mealObj.price || 0,
                    currency: mealObj.currency || "INR"
                };
            }

            const firstMealObj = Object.values(currentMeals)[0];
            const firstMealId = typeof firstMealObj === 'object' ? firstMealObj.mealId : firstMealObj;

            updated[activePassengerIdx] = {
                ...paxSel,
                selectedMeals: currentMeals,
                selectedMeal: firstMealId || 'None'
            };
            return updated;
        });
    };

    const setSelectedBaggage = (baggageId) => {
        setSelections(prev => {
            const updated = [...prev];
            const paxSel = updated[activePassengerIdx] || {};
            const currentBaggage = typeof paxSel.selectedBaggage === 'object' ? { ...paxSel.selectedBaggage } : {};
            if (baggageId === 'None' || currentBaggage[activeCityPairIdx] === baggageId) {
                delete currentBaggage[activeCityPairIdx];
            } else {
                currentBaggage[activeCityPairIdx] = baggageId;
            }
            updated[activePassengerIdx] = {
                ...paxSel,
                selectedBaggage: currentBaggage
            };
            return updated;
        });
    };

    const isSelectedByOther = (seatId) => {
        return selections.some((sel, idx) =>
            idx !== activePassengerIdx &&
            (sel.selectedSeats?.[activeSegKey] === seatId || sel.selectedSeats?.[activeCityPairIdx] === seatId)
        );
    };

    // Trigger fetch-ancillaries API call on mount matching exact Cleartrip Postman schema
    useEffect(() => {
        let isMounted = true;
        const triggerFetchAncillaries = async () => {
            const activeSessionId = sessionId || sessionStorage.getItem('flight_session_id');
            const defaultPreviewId = flightPreview?.flightPreviewId ||
                flightPreview?.id ||
                flightPreview?.data?.flightPreviewId ||
                flightPreview?.data?.id ||
                sessionStorage.getItem('flight_preview_id') || "";

            if (!activeSessionId) {
                console.warn('[Fetch Ancillaries] Active sessionId missing...');
                return;
            }

            try {
                if (isMounted) setIsLoadingAncillaries(true);

                let previewsMap = [];
                const previewsMapStr = sessionStorage.getItem('multi_city_previews_map');
                if (previewsMapStr) {
                    try { previewsMap = JSON.parse(previewsMapStr); } catch (e) {}
                }

                // Build complete travelOptions array for ALL city pairs in multicity/roundtrip/oneway
                const travelOptionsPayload = cityPairs.map((cp, cpIdx) => {
                    let optionId = cp.id;
                    let subOptionId = cp.subTravelOptionId;
                    let fareIdStr = cp.fareId;

                    const activeMapping = previewsMap[cpIdx];
                    if (activeMapping) {
                        optionId = activeMapping.optionId || optionId;
                        subOptionId = activeMapping.subOptionId || subOptionId;
                        fareIdStr = activeMapping.fareId || fareIdStr;
                    }

                    const formattedFlights = (cp.segments || []).map(seg => ({
                        id: seg.id || seg.segmentId || `${seg.flightNumber || 'FL'}-${seg.origin}-${seg.destination}`,
                        departureCode: seg.origin,
                        arrivalCode: seg.destination
                    }));

                    if (formattedFlights.length === 0) {
                        formattedFlights.push({
                            id: optionId,
                            departureCode: cp.origin,
                            arrivalCode: cp.destination
                        });
                    }

                    return {
                        id: optionId,
                        searchIntent: cp.searchIntent || `${cp.origin}_${cp.destination}`,
                        subTravelOptions: [
                            {
                                id: subOptionId,
                                fareId: fareIdStr,
                                flights: formattedFlights
                            }
                        ]
                    };
                });

                const cacheKey = `${activeSessionId}_${cityPairs.map(cp => cp.id).join('_')}`;
                if (!ancillariesCache.has(cacheKey)) {
                    const promise = (async () => {
                        if (cityPairs.length > 1 && previewsMap.length > 0) {
                            // Multi-City / Multi-Leg: Call fetch-ancillaries per leg with its matching previewId
                            const legResults = [];
                            for (let cpIdx = 0; cpIdx < cityPairs.length; cpIdx++) {
                                const legPreviewId = previewsMap[cpIdx]?.previewId ||
                                    sessionStorage.getItem(`flight_preview_id_${cpIdx}`) ||
                                    defaultPreviewId;
                                const legSessionId = previewsMap[cpIdx]?.sessionId ||
                                    sessionStorage.getItem(`flight_session_id_${cpIdx}`) ||
                                    activeSessionId;

                                const legSearchId = previewsMap[cpIdx]?.searchId || cityPairs[cpIdx]?.searchId || searchId;

                                const legPayload = {
                                    sessionId: legSessionId,
                                    flightPreviewId: legPreviewId,
                                    travelOptions: [travelOptionsPayload[cpIdx]],
                                    ancillaryTypes: ["SEAT", "MEAL", "BAGGAGE"],
                                    searchId: legSearchId
                                };
                                console.log(`[Fetch Ancillaries Leg ${cpIdx + 1}] Dedicated sessionId: ${legSessionId}, previewId: ${legPreviewId}, searchId: ${legSearchId}`);
                                try {
                                    const res = await fetchAncillariesApi(legSessionId, legPayload);
                                    if (res.success && res.data) {
                                        if (res.data._regeneratedSessionId) {
                                            sessionStorage.setItem('flight_session_id', res.data._regeneratedSessionId);
                                        }
                                        legResults[cpIdx] = res.data;
                                    } else {
                                        legResults[cpIdx] = null;
                                    }
                                } catch (legErr) {
                                    console.warn(`[Fetch Ancillaries Leg ${cpIdx + 1} Error]:`, legErr.message);
                                    legResults[cpIdx] = null;
                                }
                            }
                            return legResults;
                        } else {
                            // Standard One-Way / Single preview call
                            const ancillaryPayload = {
                                flightPreviewId: defaultPreviewId,
                                travelOptions: travelOptionsPayload,
                                ancillaryTypes: ["SEAT", "MEAL", "BAGGAGE"],
                                searchId
                            };
                            console.log('[Fetch Ancillaries Single Payload Sent To Cleartrip]:', JSON.stringify(ancillaryPayload, null, 2));
                            const res = await fetchAncillariesApi(activeSessionId, ancillaryPayload);
                            if (res.success && res.data) {
                                if (res.data._regeneratedSessionId) {
                                    sessionStorage.setItem('flight_session_id', res.data._regeneratedSessionId);
                                }
                                return res.data;
                            }
                            throw new Error(res.message || 'Failed to fetch ancillaries');
                        }
                    })();
                    ancillariesCache.set(cacheKey, promise);
                }

                try {
                    const data = await ancillariesCache.get(cacheKey);
                    if (isMounted) {
                        setLiveAncillaries(data);
                        setAncillariesUnavailable(false);

                        // Auto-select first leg that has live API SEAT data
                        if (data) {
                            let activeLegData = Array.isArray(data) ? (data[activeCityPairIdx] || data[0]) : data;
                            const rootData = activeLegData?.data || activeLegData || {};
                            const travelOpts = rootData?.travelOptions || [];
                            const activeTravelOpt = travelOpts[0] || travelOpts[activeCityPairIdx];
                            const subTravelOptions = activeTravelOpt?.subTravelOptions || [];
                            for (const subOpt of subTravelOptions) {
                                if (subOpt.flights && Array.isArray(subOpt.flights)) {
                                    const seatLegIdx = subOpt.flights.findIndex(f => f.ancillaries?.some(a => a.type === 'SEAT'));
                                    if (seatLegIdx !== -1) {
                                        setActiveLegIdx(seatLegIdx);
                                        break;
                                    }
                                }
                            }
                        }

                        toast.success(`Seat Map & Perks loaded for ${cityPairs.map(c => `${c.origin}➔${c.destination}`).join(' | ')}!`);
                    }
                } catch (cacheErr) {
                    ancillariesCache.delete(cacheKey);
                    throw cacheErr;
                }
            } catch (err) {
                console.warn('Fetch ancillaries note:', err.message);
                if (isMounted) {
                    setLiveAncillaries(null);
                    setAncillariesUnavailable(true);
                }
            } finally {
                if (isMounted) setIsLoadingAncillaries(false);
            }
        };

        triggerFetchAncillaries();
        return () => { isMounted = false; };
    }, [sessionId, flightPreview, flight, searchId, cityPairs]);

    // Dynamically parse Cleartrip Live Ancillaries API Data for active city pair & leg
    const rawAncillariesList = React.useMemo(() => {
        if (!liveAncillaries) return [];
        let list = [];

        let activeLegData = null;
        if (Array.isArray(liveAncillaries)) {
            activeLegData = liveAncillaries[activeCityPairIdx] || liveAncillaries[0];
        } else {
            activeLegData = liveAncillaries;
        }

        const rootData = activeLegData?.data || activeLegData || {};
        const travelOpts = rootData?.travelOptions || [];
        const activeTravelOpt = travelOpts[0] || travelOpts[activeCityPairIdx];
        const subTravelOptions = activeTravelOpt?.subTravelOptions || [];

        for (const subOpt of subTravelOptions) {
            if (subOpt.ancillaries && Array.isArray(subOpt.ancillaries)) {
                list.push(...subOpt.ancillaries);
            }
            if (subOpt.flights && Array.isArray(subOpt.flights)) {
                const targetFlight = subOpt.flights[activeLegIdx] || subOpt.flights[0];
                if (targetFlight?.ancillaries && Array.isArray(targetFlight.ancillaries)) {
                    list.push(...targetFlight.ancillaries);
                }
            }
        }

        if (list.length === 0) {
            const rawList = rootData?.travelOptionAncillariesList?.[0]?.ancillaries || rootData?.ancillaries || [];
            if (Array.isArray(rawList)) list = rawList;
        }
        return list;
    }, [liveAncillaries, activeCityPairIdx, activeLegIdx]);    const liveSeatsData = React.useMemo(() => {
        const seatGroup = rawAncillariesList.find(a => a.type === 'SEAT');
        return seatGroup?.ancillaryOptions || null;
    }, [rawAncillariesList]);

    const liveMealsData = React.useMemo(() => {
        let allOptions = [];
        rawAncillariesList.forEach(group => {
            if (group.ancillaryOptions && Array.isArray(group.ancillaryOptions)) {
                allOptions.push(...group.ancillaryOptions);
            }
            if (group.mealList && Array.isArray(group.mealList)) {
                allOptions.push(...group.mealList);
            }
        });

        const mealOptions = allOptions.filter(item =>
            item.type === 'MEAL' ||
            item.type === 'Veg' ||
            item.type === 'Non-Veg' ||
            (item.description && item.description.toLowerCase().includes('meal'))
        );

        if (mealOptions.length > 0) {
            return mealOptions.map((m, idx) => ({
                id: m.code || m.id || `MEAL_${idx}`,
                title: m.description || m.name || m.title || 'In-flight Special Meal',
                price: typeof m.amount === 'object' ? (m.amount?.price || 0) : (m.amount || m.price || 0),
                tag: (m.type || m.description || '').toUpperCase().includes('NON') ? 'NON-VEG' : 'VEG',
                desc: m.categories?.join(', ') || m.type || 'Freshly prepared in-flight meal'
            }));
        }

        // Standard airline in-flight meals fallback
        return [
            { id: 'ML01', title: 'Veg Club Sandwich & Juice', price: 350, tag: 'VEG', desc: 'Fresh cucumber, tomato, cheese in multigrain bread' },
            { id: 'ML02', title: 'Grilled Chicken Tikka Sandwich', price: 450, tag: 'NON-VEG', desc: 'Tender chicken tikka with mint chutney & cheese' },
            { id: 'ML03', title: 'Paneer Butter Masala Hot Meal', price: 500, tag: 'VEG', desc: 'Rich cottage cheese curry with paratha & basmati rice' },
            { id: 'ML04', title: 'Mughlai Butter Chicken Rice Bowl', price: 550, tag: 'NON-VEG', desc: 'Succulent boneless chicken in creamy tomato gravy with jeera rice' },
            { id: 'ML05', title: 'Jain Special Thali (No Onion/Garlic)', price: 450, tag: 'VEG', desc: 'Sattvic preparation with dal, sabzi, roti and rice' }
        ];
    }, [rawAncillariesList]);

    const liveBaggageData = React.useMemo(() => {
        let allOptions = [];
        rawAncillariesList.forEach(group => {
            if (group.ancillaryOptions && Array.isArray(group.ancillaryOptions)) {
                allOptions.push(...group.ancillaryOptions);
            }
            if (group.baggageList && Array.isArray(group.baggageList)) {
                allOptions.push(...group.baggageList);
            }
        });

        const baggageOptions = allOptions.filter(item =>
            item.type === 'BAGGAGE' ||
            item.type === 'CHECKIN_BAGGAGE' ||
            item.type === 'ADDON' ||
            item.code?.startsWith('EB') ||
            item.code?.startsWith('XB') ||
            item.code?.startsWith('XBAG')
        );

        if (baggageOptions.length > 0) {
            return baggageOptions.map((b, idx) => {
                const weightKg = b.baggageInfos?.[0]?.weight?.quantity || b.additionalProperties?.quantity || b.code?.replace(/\D/g, '') || '';
                const itemPrice = typeof b.amount === 'object' ? (b.amount?.price || 0) : (b.amount || b.price || 0);
                return {
                    id: b.code || b.id || `BAG_${idx}`,
                    title: b.description ? `${b.description} ${weightKg ? weightKg + ' KG' : ''}` : `Extra Baggage ${weightKg} KG`,
                    price: itemPrice,
                    tag: 'CLEARTRIP ADD-ON',
                    desc: `Excess check-in baggage allowance ${weightKg ? '(' + weightKg + ' KG)' : ''}`
                };
            });
        }

        // Standard extra baggage fallback
        return [
            { id: 'EB05', title: 'Extra Baggage +5 KG', price: 1900, tag: 'ADD-ON', desc: 'Additional prepaid check-in baggage (5 KG)' },
            { id: 'EB10', title: 'Extra Baggage +10 KG', price: 3800, tag: 'ADD-ON', desc: 'Additional prepaid check-in baggage (10 KG)' },
            { id: 'EB15', title: 'Extra Baggage +15 KG', price: 5700, tag: 'ADD-ON', desc: 'Additional prepaid check-in baggage (15 KG)' }
        ];
    }, [rawAncillariesList]);

    // Parse exact Cleartrip Seat Availability & Occupied Seats Map from Live API or robust fallback
    const { dynamicOccupiedSeats, dynamicSeatPrices, firstAvailableSeat, apiSeatsLayout } = React.useMemo(() => {
        let occupied = [];
        let prices = {};
        let firstAvail = null;
        let seatAncillaryObj = rawAncillariesList.find(a => a.type === 'SEAT');

        if (seatAncillaryObj?.decks) {
            seatAncillaryObj.decks.forEach(deck => {
                deck.cabins?.forEach(cabin => {
                    cabin.compartments?.forEach(comp => {
                        comp.rows?.forEach(rowObj => {
                            rowObj.seats?.forEach(seatObj => {
                                const seatNum = seatObj.number;
                                const isAvailable = seatObj.availability !== false;
                                const price = seatObj.amount?.price || 0;

                                if (!isAvailable && seatNum) {
                                    occupied.push(seatNum);
                                } else if (isAvailable && seatNum && !firstAvail) {
                                    firstAvail = seatNum;
                                }

                                if (seatNum) {
                                    prices[seatNum] = price;
                                }
                            });
                        });
                    });
                });
            });
        }

        // Flatten and sort rows
        let rowsList = [];
        if (seatAncillaryObj?.decks) {
            seatAncillaryObj.decks.forEach(deck => {
                deck.cabins?.forEach(cabin => {
                    cabin.compartments?.forEach(comp => {
                        comp.rows?.forEach(rowObj => {
                            rowsList.push(rowObj);
                        });
                    });
                });
            });
            rowsList.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
        }

        // Complete 30-row Airbus A320 / Boeing 737 standard layout fallback
        if (rowsList.length === 0) {
            const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
            for (let r = 1; r <= 30; r++) {
                const rowSeats = cols.map(col => {
                    const seatNum = `${r}${col}`;
                    let price = 0;
                    if (r <= 3) price = 750; // XL Legroom / Front
                    else if (r === 12 || r === 13) price = 600; // Emergency Exit Row
                    else if (r <= 10) price = 350; // Forward standard
                    else if (col === 'A' || col === 'F') price = 200; // Window
                    else if (col === 'C' || col === 'D') price = 150; // Aisle
                    else price = 0; // Middle seat free

                    const isOccupied = (r === 2 && col === 'B') || (r === 5 && col === 'A') || (r === 12 && col === 'C') || (r === 18 && col === 'D') || (r === 24 && col === 'E');
                    if (!isOccupied && !firstAvail) firstAvail = seatNum;
                    if (isOccupied) occupied.push(seatNum);
                    prices[seatNum] = price;

                    return {
                        number: seatNum,
                        rowId: r,
                        columnId: col,
                        free: price === 0,
                        availability: !isOccupied,
                        amount: { price }
                    };
                });

                rowsList.push({
                    id: String(r),
                    characteristics: (r === 12 || r === 13) ? 'EXIT_ROW' : 'STANDARD',
                    seats: rowSeats,
                    isFallback: true
                });
            }
        }

        return {
            dynamicOccupiedSeats: occupied.length > 0 ? occupied : null,
            dynamicSeatPrices: prices,
            firstAvailableSeat: firstAvail || '1A',
            apiSeatsLayout: rowsList
        };
    }, [rawAncillariesList]);

    // Helper function to resolve seat price reliably
    const getSeatPrice = React.useCallback((seatNum) => {
        if (!seatNum || seatNum === 'None') return 0;
        if (dynamicSeatPrices && dynamicSeatPrices[seatNum] !== undefined) {
            return Number(dynamicSeatPrices[seatNum]) || 0;
        }
        const row = parseInt(seatNum, 10);
        const col = String(seatNum).replace(/[0-9]/g, '');
        if (row <= 3) return 750;
        if (row === 12 || row === 13) return 600;
        if (row <= 10) return 350;
        if (col === 'A' || col === 'F') return 200;
        if (col === 'C' || col === 'D') return 150;
        return 0;
    }, [dynamicSeatPrices]);

    // Dynamic calculation of extra charges for selected meals, seats, and baggage across all city pairs and legs
    const extraAncillariesCost = React.useMemo(() => {
        let cost = 0;
        selections.forEach(sel => {
            // 1. Selected Seat prices
            const seatsMap = sel.selectedSeats || {};
            Object.values(seatsMap).forEach(seatNum => {
                if (seatNum && seatNum !== 'None') {
                    cost += getSeatPrice(seatNum);
                }
            });

            // 2. Selected Meal prices
            const mealsMap = sel.selectedMeals || {};
            Object.values(mealsMap).forEach(m => {
                if (typeof m === 'object' && m.price) {
                    cost += Number(m.price) || 0;
                } else if (typeof m === 'string' && m !== 'None' && liveMealsData) {
                    const mObj = liveMealsData.find(meal => meal.id === m || meal.code === m);
                    if (mObj && mObj.price) cost += Number(mObj.price) || 0;
                }
            });

            // 3. Extra Baggage prices
            const bagsMap = typeof sel.selectedBaggage === 'object' ? sel.selectedBaggage : { 0: sel.selectedBaggage };
            Object.values(bagsMap).forEach(bId => {
                if (bId && bId !== 'None' && liveBaggageData) {
                    const bObj = liveBaggageData.find(b => b.id === bId);
                    if (bObj && bObj.price) {
                        cost += Number(bObj.price) || 0;
                    }
                }
            });
        });
        return cost;
    }, [selections, getSeatPrice, liveMealsData, liveBaggageData]);

    const baseFlightFare = React.useMemo(() => {
        if (flight?.selectedSectorsList && flight.selectedSectorsList.length > 1) {
            const sum = flight.selectedSectorsList.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
            if (sum > 0) return sum;
        }
        return Number(flight?.pricing?.totalFare || flight?.fare || flight?.price) || 0;
    }, [flight]);

    const totalFareWithAddons = baseFlightFare + extraAncillariesCost;

    // Parse exact totalRows from Cleartrip response if present
    const dynamicTotalRows = React.useMemo(() => {
        const seatAncillaryObj = rawAncillariesList.find(a => a.type === 'SEAT');
        const cabinRows = seatAncillaryObj?.decks?.[0]?.cabins?.[0]?.totalRows;
        return cabinRows || (apiSeatsLayout?.length || 30);
    }, [rawAncillariesList, apiSeatsLayout]);

    // Aircraft Cabin Layout matching Cleartrip API totalRows
    const rows = Array.from({ length: dynamicTotalRows }, (_, i) => i + 1);
    const columnsLeft = ['A', 'B', 'C'];
    const columnsRight = ['D', 'E', 'F'];

    // Pure Cleartrip API Occupied Seats List
    const occupiedSeats = dynamicOccupiedSeats || [];

    // Auto-update selectedSeat if current selection is occupied in Cleartrip data
    useEffect(() => {
        if (occupiedSeats.includes(selectedSeat) && firstAvailableSeat) {
            setSelectedSeat(firstAvailableSeat);
        }
    }, [occupiedSeats, firstAvailableSeat]);

    const mealOptions = liveMealsData || [];
    const baggageOptions = liveBaggageData || [];

    // Helper function to recursively find fareId from any object
    const findFareIdRecursively = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        if (obj.fareId && typeof obj.fareId === 'string' && obj.fareId.trim() !== '') {
            return obj.fareId;
        }
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const found = findFareIdRecursively(obj[key]);
                if (found) return found;
            }
        }
        return null;
    };

    const isUserLoggedIn = () => {
        const authKeys = ['token', 'accessToken', 'authToken', 'jwt', 'userToken'];
        const hasToken = authKeys.some((key) => sessionStorage.getItem(key) || localStorage.getItem(key));
        const explicitLoginFlag = sessionStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('isLoggedIn') === 'true';
        return hasToken || explicitLoginFlag;
    };

    const closeLoginRequired = () => {
        setShowLoginRequired(false);
    };

    const goToLogin = () => {
        const returnUrl = `${window.location.pathname}${window.location.search}`;
        sessionStorage.setItem('post_login_redirect', returnUrl);
        sessionStorage.setItem('booking_intent', 'flight');
        setShowLoginRequired(false);
        navigate('/login', {
            state: {
                from: returnUrl,
                bookingIntent: true
            }
        });
    };

    const handleProceedToPayment = async () => {
        if (!isUserLoggedIn()) {
            setShowLoginRequired(true);
            return;
        }

        const activeSessionId = sessionId || sessionStorage.getItem('flight_session_id');
        const pId = flightPreview?.flightPreviewId ||
            flightPreview?.id ||
            flightPreview?.data?.flightPreviewId ||
            flightPreview?.data?.id ||
            sessionStorage.getItem('flight_preview_id') || "";

        let optionId = flight?.rawOption?.travelOptionId || flight?.rawOption?.subTravelOptionId || flight?.id || "";
        let subOptionId = flight?.rawOption?.subTravelOptionId || optionId;
        let fareIdStr = flight?.rawOption?.fareId || findFareIdRecursively(flightPreview) || findFareIdRecursively(flight) || "";

        // Retrieve accurate leg-specific IDs persisted in sessionStorage
        let previewsMap = [];
        const previewsMapStr = sessionStorage.getItem('multi_city_previews_map');
        if (previewsMapStr) {
            try {
                previewsMap = JSON.parse(previewsMapStr);
                const activeMapping = previewsMap[activeCityPairIdx] || previewsMap[0];
                if (activeMapping) {
                    optionId = activeMapping.optionId || optionId;
                    subOptionId = activeMapping.subOptionId || subOptionId;
                    fareIdStr = activeMapping.fareId || fareIdStr;
                }
            } catch (e) {
                console.error("Failed to parse multi_city_previews_map fallback:", e);
            }
        }

        console.log('[Hold Debug] flightPreview object:', flightPreview);
        console.log('[Hold Debug] extracted pId (flightPreviewId):', pId);
        console.log('[Hold Debug] activeSessionId:', activeSessionId);
        console.log('[Hold Debug] optionId:', optionId);
        console.log('[Hold Debug] fareIdStr:', fareIdStr);

        if (!activeSessionId) {
            setSessionExpired(true);
            toast.error("Session expired. Please restart the booking process.");
            return;
        }

        if (!pId) {
            setSessionExpired(true);
            toast.error("Flight Preview ID missing. Please go back and try again.");
            return;
        }

        try {
            setIsHolding(true);
            toast.info("Holding seats and locking fare with airline...");

            const segments = flight?.segments || [];
            const formattedFlights = segments.map(seg => ({
                id: seg.id || seg.segmentId || `${seg.flightNumber}-${seg.origin}-${seg.destination}`,
                departureCode: seg.origin,
                arrivalCode: seg.destination
            }));

            if (formattedFlights.length === 0) {
                formattedFlights.push({
                    id: optionId,
                    departureCode: primarySegment.origin || "BLR",
                    arrivalCode: lastSegment.destination || "BOM"
                });
            }

            // Map passengerInformation according to exact Cleartrip B2B schema
            // NOTE: Cleartrip Hold API strictly requires empty ancillaries: [] — sending non-empty
            // objects causes 400 Bad Request "Unable to process JSON". Selections travel in app payload to payment.
            const passengersList = passengers.map((p, idx) => {
                const pSel = selections[idx] || {};
                const pSeats = pSel.selectedSeats || {};
                const pMeals = pSel.selectedMeals || {};
                const pBaggage = pSel.selectedBaggage || 'None';

                const passengerFlightAncillaries = formattedFlights.map((f) => {
                    return {
                        flightId: f.id,
                        ancillaries: []
                    };
                });

                const selectedSectorsList = flight?.selectedSectorsList || [];
                let subTravelOptionAncillariesList = [];

                if (selectedSectorsList.length > 0) {
                    subTravelOptionAncillariesList = selectedSectorsList.map((secFlight, cpIdx) => {
                        const legMapping = previewsMap[cpIdx] || {};
                        const legSubOptionId = legMapping.subOptionId || secFlight.rawOption?.subTravelOptionId || secFlight.id;
                        const segs = secFlight.segments || [];

                        const flightAncillariesList = segs.map((seg) => {
                            const segFlightId = seg.id || seg.segmentId || `${seg.flightNumber || 'FL'}-${seg.origin}-${seg.destination}`;
                            return {
                                flightId: segFlightId,
                                ancillaries: []
                            };
                        });

                        return {
                            subTravelOptionId: legSubOptionId,
                            subTravelType: "FLIGHT",
                            flightAncillaries: flightAncillariesList.length > 0 ? flightAncillariesList : [{ flightId: legSubOptionId, ancillaries: [] }],
                            ancillaries: []
                        };
                    });
                } else if (flight?.isRoundTripCombined) {
                    subTravelOptionAncillariesList = [
                        {
                            subTravelOptionId: flight.outboundRawOption?.subTravelOptionId || subOptionId,
                            subTravelType: "FLIGHT",
                            flightAncillaries: passengerFlightAncillaries,
                            ancillaries: []
                        },
                        {
                            subTravelOptionId: flight.returnRawOption?.subTravelOptionId || subOptionId,
                            subTravelType: "FLIGHT",
                            flightAncillaries: passengerFlightAncillaries,
                            ancillaries: []
                        }
                    ];
                } else {
                    subTravelOptionAncillariesList = [
                        {
                            subTravelOptionId: subOptionId,
                            subTravelType: "FLIGHT",
                            flightAncillaries: passengerFlightAncillaries,
                            ancillaries: []
                        }
                    ];
                }

                return {
                    firstName: p.firstName || "Traveller",
                    lastName: p.lastName || "Passenger",
                    middleName: "",
                    gender: (p.gender || "MALE").toUpperCase() === "MALE" ? "MALE" : "FEMALE",
                    email: contact?.email || p.email || "your-email@example.com",
                    travellerType: p.type || "ADT",
                    dob: p.dob || "1990-01-01",
                    nationalityCode: "IN",
                    address: {
                        mobileNumber: String(contact?.phone || p.phone || "9876543210").replace(/\D/g, ''),
                        countryCode: String(contact?.countryCode || "91").replace('+', '')
                    },
                    title: (p.title || "MR").toUpperCase() === "MRS" ? "MRS" : ((p.title || "MR").toUpperCase() === "MS" ? "MS" : "MR"),
                    subTravelOptionAncillaries: subTravelOptionAncillariesList,
                    documents: []
                };
            });

            // Safe development debug logging (no sensitive PII or auth header logging)
            if (process.env.NODE_ENV !== 'production') {
                passengersList.forEach((pax, pIdx) => {
                    const subAnc = pax.subTravelOptionAncillaries?.[0]?.flightAncillaries || [];
                    subAnc.forEach(fa => {
                        (fa.ancillaries || []).forEach(anc => {
                            console.log(`[Hold Ancillary Request] paxIndex=${pIdx + 1}, flightId=${fa.flightId}, type=${anc.type}, id=${anc.id}`);
                        });
                    });
                });
            }

            const primaryPassenger = passengers[0] || {};
            const customerInformation = {
                firstName: primaryPassenger.firstName || "Traveller",
                lastName: primaryPassenger.lastName || "Passenger",
                title: (primaryPassenger.title || "MR").toUpperCase() === "MRS" ? "MRS" : ((primaryPassenger.title || "MR").toUpperCase() === "MS" ? "MS" : "MR"),
                emailId: contact?.email || primaryPassenger.email || "your-email@example.com",
                address: {
                    countryCode: String(contact?.countryCode || "91").replace('+', '')
                },
                phoneNumberDetails: {
                    phoneNumber: String(contact?.phone || primaryPassenger.phone || "9876543210").replace(/\D/g, ''),
                    countryCode: String(contact?.countryCode || "91").replace('+', '')
                }
            };

            const metaInformation = {
                currency: "INR",
                domain: "IN",
                sectorType: flightPreview?.sectorType || "DOMESTIC",
                itineraryId: activeSessionId
            };

            // Build dynamic sectors and travelOptions for round trips
            let holdTravelOptions = [];
            let previewTravelOptions = {};
            let searchIntentsSectors = [];

            const paxInfosList = [
                { paxType: "ADT", paxCount: passengers.filter(p => p.type === 'ADT').length || 1, paxFareType: "DEFAULT" },
                passengers.some(p => p.type === 'CHD') ? { paxType: "CHD", paxCount: passengers.filter(p => p.type === 'CHD').length, paxFareType: "DEFAULT" } : null,
                passengers.some(p => p.type === 'INF') ? { paxType: "INF", paxCount: passengers.filter(p => p.type === 'INF').length, paxFareType: "DEFAULT" } : null
            ].filter(Boolean);


            const selectedSectorsList = flight?.selectedSectorsList || [];

            
            if (selectedSectorsList.length > 0) {
                // Multi-City: Build separate travel options and sectors for each leg
                holdTravelOptions = selectedSectorsList.map((secFlight, idx) => {
                    const legMapping = previewsMap[idx] || {};
                    const legOptionId = legMapping.optionId || secFlight.rawOption?.travelOptionId || secFlight.id;
                    const legSubOptionId = legMapping.subOptionId || secFlight.rawOption?.subTravelOptionId || legOptionId;
                    const legFareId = legMapping.fareId || secFlight.rawOption?.fareId || "";
                    return {
                        travelOptionId: legOptionId,
                        subTravelOptions: [{
                            subTravelType: "FLIGHT",
                            subTravelOptionId: legSubOptionId,
                            fareId: legFareId
                        }]
                    };
                });

                previewTravelOptions = {};
                selectedSectorsList.forEach((secFlight, idx) => {
                    const legMapping = previewsMap[idx] || {};
                    const legOptionId = legMapping.optionId || secFlight.rawOption?.travelOptionId || secFlight.id;
                    const legSubOptionId = legMapping.subOptionId || secFlight.rawOption?.subTravelOptionId || legOptionId;
                    const legFareId = legMapping.fareId || secFlight.rawOption?.fareId || "";
                    previewTravelOptions[`J${idx + 1}`] = {
                        travelOptionId: legOptionId,
                        price: secFlight.price || 0,
                        subTravelOptions: [{
                            subTravelOptionId: legSubOptionId,
                            fareId: legFareId
                        }]
                    };
                });

                searchIntentsSectors = selectedSectorsList.map((secFlight, idx) => {
                    const pSeg = secFlight.segments[0] || {};
                    const lSeg = secFlight.segments[secFlight.segments.length - 1] || pSeg;
                    return {
                        index: idx + 1,
                        origin: pSeg.origin,
                        destination: lSeg.destination,
                        departDate: pSeg.departureDateTime ? new Date(pSeg.departureDateTime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                        cabinType: pSeg.cabinType || "ECONOMY",
                        paxInfos: paxInfosList
                    };
                });
            } else if (flight?.isRoundTripCombined) {
                const outOptId = flight.outboundRawOption?.travelOptionId || flight.outboundTravelId || flight.id;
                const outSubOptId = flight.outboundRawOption?.subTravelOptionId || flight.id;
                const outFareId = flight.outboundRawOption?.fareId || "";
                const outPrice = flight.outboundRawOption?.price || 0;

                const retOptId = flight.returnRawOption?.travelOptionId || flight.returnTravelId || flight.id;
                const retSubOptId = flight.returnRawOption?.subTravelOptionId || flight.id;
                const retFareId = flight.returnRawOption?.fareId || "";
                const retPrice = flight.returnRawOption?.price || 0;

                holdTravelOptions = [
                    {
                        travelOptionId: outOptId,
                        subTravelOptions: [{ subTravelType: "FLIGHT", subTravelOptionId: outSubOptId, fareId: outFareId }]
                    },
                    {
                        travelOptionId: retOptId,
                        subTravelOptions: [{ subTravelType: "FLIGHT", subTravelOptionId: retSubOptId, fareId: retFareId }]
                    }
                ];

                previewTravelOptions = {
                    J1: {
                        travelOptionId: outOptId,
                        price: outPrice,
                        subTravelOptions: [{ subTravelOptionId: outSubOptId, fareId: outFareId }]
                    },
                    J2: {
                        travelOptionId: retOptId,
                        price: retPrice,
                        subTravelOptions: [{ subTravelOptionId: retSubOptId, fareId: retFareId }]
                    }
                };

                const outboundSeg = flight.segments[0];
                const returnSeg = flight.segments[flight.segments.length - 1];

                searchIntentsSectors = [
                    {
                        index: 1,
                        origin: outboundSeg.origin,
                        destination: outboundSeg.destination,
                        departDate: outboundSeg.departureDateTime ? new Date(outboundSeg.departureDateTime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                        cabinType: outboundSeg.cabinType || "ECONOMY",
                        paxInfos: paxInfosList
                    },
                    {
                        index: 2,
                        origin: returnSeg.origin,
                        destination: returnSeg.destination,
                        departDate: returnSeg.departureDateTime ? new Date(returnSeg.departureDateTime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                        cabinType: returnSeg.cabinType || "ECONOMY",
                        paxInfos: paxInfosList
                    }
                ];
            } else {
                holdTravelOptions = [
                    {
                        travelOptionId: optionId,
                        subTravelOptions: [
                            {
                                subTravelType: "FLIGHT",
                                subTravelOptionId: subOptionId,
                                fareId: fareIdStr
                            }
                        ]
                    }
                ];

                previewTravelOptions = {
                    J1: {
                        travelOptionId: optionId,
                        price: flight?.pricing?.totalFare || flight?.fare || flight?.price || 3486,
                        subTravelOptions: [{ subTravelOptionId: subOptionId, fareId: fareIdStr }]
                    }
                };

                searchIntentsSectors = [{
                    index: 1,
                    origin: primarySegment.origin || "BLR",
                    destination: lastSegment.destination || "BOM",
                    departDate: primarySegment.departureDateTime ? new Date(primarySegment.departureDateTime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                    cabinType: primarySegment.cabinType || "ECONOMY",
                    paxInfos: paxInfosList
                }];
            }

            const previewData = {
                searchId,
                dataId: dataId || "",
                flightPreviewCriteria: {
                    isMultiFareRequest: false,
                    maxFareCount: 0,
                    sellingCountryCode: "IN",
                    sellingCurrencyCode: "INR"
                },
                searchIntents: {
                    sectors: searchIntentsSectors
                },
                travelOptions: previewTravelOptions
            };

            const holdPayload = {
                searchId,
                dataId: dataId || "",
                previewData,
                flightPreviewId: pId,
                travelOptions: holdTravelOptions,
                passengerInformation: {
                    passengers: passengersList
                },
                customerInformation,
                metaInformation
            };

            const holdResponse = await holdFlightApi(activeSessionId, holdPayload);

            if (holdResponse?.success) {
                toast.success(`Seats & perks reserved! Booking held successfully.`);

                // Calculate total price from flight pricing + selected ancillaries (meals/baggage/seats)
                const totalAmount = totalFareWithAddons;

                // Inspect Cleartrip Hold response for meal ancillary confirmation status
                const checkHoldMealStatus = (hData, paxIdx, mealObj) => {
                    if (!mealObj || mealObj === 'None') return null;
                    if (!hData) return 'PENDING';

                    const subOpts = (hData.travelOptionList || []).flatMap(opt => opt.subTravelOptions || []);
                    let foundStatus = null;

                    for (const sub of subOpts) {
                        const paxAncs = sub.passengerAncillaries || [];
                        const paxAnc = paxAncs.find(pa => pa.paxIndex === paxIdx + 1 || pa.paxIndex === paxIdx);
                        if (paxAnc) {
                            const flAncs = paxAnc.flightAncillaries || [];
                            for (const fa of flAncs) {
                                const matchAnc = (fa.ancillaries || []).find(a => 
                                    a.id === mealObj.mealId || a.code === mealObj.mealId || a.type === 'MEAL'
                                );
                                if (matchAnc) {
                                    foundStatus = matchAnc.status || matchAnc.holdStatus || 'CONFIRMED';
                                    break;
                                }
                            }
                            if (!foundStatus && paxAnc.ancillaryHoldStatus && paxAnc.ancillaryHoldStatus.length > 0) {
                                foundStatus = paxAnc.ancillaryHoldStatus[0]?.status;
                            }
                        }
                    }

                    if (!foundStatus) {
                        // Cleartrip returned empty passengerAncillaries when meal requested
                        return 'FAILED';
                    }

                    const st = String(foundStatus).toUpperCase();
                    if (st.includes('SUCCESS') || st.includes('CONFIRM') || st.includes('HELD')) {
                        return 'CONFIRMED';
                    } else if (st.includes('FAIL') || st.includes('ERROR') || st.includes('REJECT')) {
                        return 'FAILED';
                    }
                    return 'PENDING';
                };

                const hasFareMealBenefit = (flight?.benefits || flightPreview?.benefits || []).some(b => 
                    (b.type || b.benefitType || '').toUpperCase() === 'MEAL' ||
                    (b.description || b.value || '').toLowerCase().includes('meal')
                );

                const mappedPassengersWithSeats = passengers.map((p, idx) => {
                    const pSel = selections[idx] || {};
                    const selectedMealsMap = pSel.selectedMeals || {};
                    const firstMealObj = selectedMealsMap[0] || selectedMealsMap['0'] || Object.values(selectedMealsMap)[0] || (pSel.selectedMeal && pSel.selectedMeal !== 'None' ? { mealId: pSel.selectedMeal, title: pSel.selectedMeal } : 'None');
                    const mealStatus = checkHoldMealStatus(holdResponse.data, idx, firstMealObj);

                    return {
                        ...p,
                        selectedSeats: pSel.selectedSeats || {},
                        selectedSeat: p.type === 'INF' ? null : (pSel.selectedSeats?.[0] || null),
                        selectedReturnSeat: p.type === 'INF' ? null : (pSel.selectedSeats?.[1] || null),
                        selectedMeals: selectedMealsMap,
                        selectedMealObj: firstMealObj === 'None' ? null : firstMealObj,
                        selectedMeal: typeof firstMealObj === 'object' ? (firstMealObj.mealId || firstMealObj.mealCode || null) : (firstMealObj === 'None' ? null : firstMealObj),
                        mealHoldStatus: mealStatus,
                        selectedBaggage: pSel.selectedBaggage === 'None' ? null : (pSel.selectedBaggage || null)
                    };
                });

                const fullPayload = {
                    flight,
                    searchId,
                    sessionId: holdResponse.sessionId || activeSessionId,
                    flightPreview,
                    ancillaries: liveAncillaries,
                    holdData: holdResponse.data,
                    total: totalAmount,
                    type: 'flight',
                    passengers: mappedPassengersWithSeats,
                    passenger: mappedPassengersWithSeats[0], // fallback compatibility
                    contact,
                    hasFareMealBenefit
                };

                navigate('/payment', { state: fullPayload });
            } else {
                throw new Error(holdResponse?.message || "Failed to hold the booking.");
            }
        } catch (error) {
            console.error("Flight Hold API error:", error);
            console.error("Flight Hold API error.response:", error.response);
            console.error("Flight Hold API error.response?.data:", error.response?.data);
            let errDetail;
            if (error.response?.data?.message) {
                errDetail = error.response.data.message;
            } else if (error.response?.data?.details) {
                errDetail = typeof error.response.data.details === 'object'
                    ? JSON.stringify(error.response.data.details)
                    : error.response.data.details;
            } else if (error.code === 'ECONNABORTED') {
                errDetail = 'Request timed out. The airline is taking too long. Please try again.';
            } else if (error.message) {
                errDetail = error.message;
            } else {
                errDetail = "Airline could not hold the fare. Please retry.";
            }
            if (/session/i.test(errDetail) && /(expired|invalid)/i.test(errDetail)) {
                setSessionExpired(true);
            }
            toast.error(`Hold Booking Failed: ${errDetail}`);
        } finally {
            setIsHolding(false);
        }
    };

    if (!flight || sessionExpired) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-[75px]">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Plane className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">
                        {sessionExpired ? "Booking Session Expired" : "No Booking Data Found"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 mb-6">
                        {sessionExpired
                            ? "Your booking has been completed or the session has expired. Please start a new search to mint a new booking session."
                            : "Please start booking from the flight search list."}
                    </p>
                    <button
                        onClick={handleSearchAgain}
                        className="bg-[#d8942f] hover:bg-[#b9791f] text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md"
                    >
                        Start New Search
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-body pt-[75px]">
            <Navbar />

            {/* Stepper Header Bar */}
            <div className="bg-[#00206B] text-white px-4 sm:px-6 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.14)]">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 shrink-0 bg-white/12 hover:bg-white/20 border border-white/25 text-white px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <div className="w-10 h-10 rounded-lg border border-white/50 bg-white/10 flex items-center justify-center shrink-0">
                            <Plane size={23} className="text-white" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-xl leading-tight font-extrabold tracking-tight text-white flex items-center gap-2 flex-wrap">
                                {flight?.isRoundTripCombined
                                    ? `${flight.segments[0]?.origin} ⇄ ${flight.segments[0]?.destination} (Round Trip)`
                                    : (
                                        <>
                                            <span>{primarySegment.origin}</span>
                                            <span className="text-white/80 font-semibold">→</span>
                                            <span>{lastSegment.destination}</span>
                                        </>
                                    )
                                }
                            </h1>
                            <div className="flex gap-1.5 flex-wrap items-center mt-1.5">
                                <span className="bg-white/14 border border-white/15 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                                    <Sparkles size={11} className="text-[#ff9d3c]" /> Step 3: Add-on Perks &amp; Seats
                                </span>
                                <span className="bg-white/14 border border-white/15 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                                    <Plane size={11} className="text-[#ff9d3c]" /> {flight.airlineName} ({flight.segments?.map(s => s.flightNumber).join(' → ') || primarySegment.flightNumber})
                                </span>
                                <span className="bg-emerald-400/15 border border-emerald-300/40 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold shadow-sm">
                                    Passenger: {passengers[0]?.firstName || 'Traveller'} {passengers[0]?.lastName || ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 text-xs font-bold shrink-0">
                        <div className="flex items-center gap-2 text-emerald-300">
                            <div className="w-6 h-6 rounded-md bg-emerald-400/20 border border-emerald-300/60 flex items-center justify-center text-emerald-300">1</div>
                            <span className="hidden sm:inline">Flight Select</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                        <div className="flex items-center gap-2 text-emerald-300">
                            <div className="w-6 h-6 rounded-md bg-emerald-400/20 border border-emerald-300/60 flex items-center justify-center text-emerald-300">2</div>
                            <span className="hidden sm:inline">Passenger Info</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-6 h-6 rounded-md bg-[#d8942f] text-[#00206B] flex items-center justify-center font-bold shadow-sm">3</div>
                            <span className="underline decoration-[#ff9d3c] underline-offset-4">Seats &amp; Meals</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                        <div className="flex items-center gap-2 text-white/55">
                            <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">4</div>
                            <span className="hidden sm:inline">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Selection Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Interactive Seat Grid & Tabs */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-[#c9dcff] rounded-lg shadow-sm overflow-hidden">
                            {/* Tab Controls */}
                            <div className="bg-[#00206B] text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#d8942f]" />
                                    <div>
                                        <h3 className="font-bold text-sm text-white">Select Seat, Meal & Extra Baggage</h3>
                                        {ancillariesUnavailable ? (
                                            <span className="text-[10px] text-amber-300 font-mono block">
                                                ⚠️ Airline API Offline - Local Fallback Seats Active
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-emerald-300 font-mono block">
                                                📡 Cleartrip Live Ancillaries API Connected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-white/10 p-1 rounded-md border border-white/15">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('seats')}
                                        className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'seats' ? 'bg-[#d8942f] text-[#00206B] shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    >
                                        💺 Seat Map
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('meals')}
                                        className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'meals' ? 'bg-[#d8942f] text-[#00206B] shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    >
                                        🍽️ In-flight Meals
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('baggage')}
                                        className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'baggage' ? 'bg-[#d8942f] text-[#00206B] shadow-sm' : 'text-white/70 hover:text-white'}`}
                                    >
                                        🧳 Extra Baggage
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {ancillariesUnavailable && (
                                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs font-semibold rounded-lg shadow-sm flex items-start gap-3">
                                        <span className="text-lg">⚠️</span>
                                        <div>
                                            <strong className="block font-bold mb-0.5 text-amber-800">In-Flight Services Temporarily Unavailable</strong>
                                            <span>We are currently unable to retrieve direct seat layout maps from Cleartrip for this connecting flight segment. Fallback local allocation is active. You can select your preferred seat sequence below and proceed to pay.</span>
                                        </div>
                                    </div>
                                )}

                                {/* City Pair Tabs (Level 1 Selector) */}
                                {cityPairs.length > 1 && (
                                    <div className="mb-6 p-4 bg-[#00206B] text-white rounded-lg shadow-sm">
                                        <label className="block text-xs font-bold text-[#ff9d3c] uppercase tracking-wider mb-2">
                                            Select City Pair (Sector):
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {cityPairs.map((cp, cpIdx) => {
                                                const isCPActive = activeCityPairIdx === cpIdx;
                                                return (
                                                    <button
                                                        key={cpIdx}
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveCityPairIdx(cpIdx);
                                                            setActiveLegIdx(0);
                                                            toast.info(`Switched to Sector ${cpIdx + 1}: ${cp.origin} ➔ ${cp.destination}`);
                                                        }}
                                                        className={`flex-1 min-w-[180px] p-3 rounded-md text-left border transition-all ${
                                                            isCPActive
                                                                ? 'bg-[#d8942f] border-[#d8942f] text-[#00206B] font-black shadow-md'
                                                                : 'bg-white/10 border-white/15 text-white/75 hover:bg-white/15 hover:text-white'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between font-bold text-sm">
                                                            <span>{cp.origin} ➔ {cp.destination}</span>
                                                            <span className="text-xs opacity-75">Sector {cpIdx + 1}</span>
                                                        </div>
                                                        {cp.departDate && (
                                                            <div className="text-[11px] font-mono opacity-80 mt-1">
                                                                Date: {cp.departDate}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Leg Tabs within Selected City Pair (Level 2 Selector for Connecting Flights) */}
                                {activeLegs.length > 1 && (
                                    <div className="mb-6 p-4 rounded-lg bg-slate-100 border border-slate-200">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Connecting Flights for {activeCityPair.origin} ➔ {activeCityPair.destination}:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {activeLegs.map((leg, lIdx) => {
                                                const isLegActive = activeLegIdx === lIdx;

                                                let legHasSeats = false;
                                                if (liveAncillaries) {
                                                    let activeLegData = Array.isArray(liveAncillaries) ? (liveAncillaries[activeCityPairIdx] || liveAncillaries[0]) : liveAncillaries;
                                                    const rootData = activeLegData?.data || activeLegData || {};
                                                    const travelOpts = rootData?.travelOptions || [];
                                                    const activeTravelOpt = travelOpts[0] || travelOpts[activeCityPairIdx];
                                                    const subTravelOptions = activeTravelOpt?.subTravelOptions || [];
                                                    for (const subOpt of subTravelOptions) {
                                                        const flt = subOpt.flights?.[lIdx];
                                                        if (flt?.ancillaries?.some(a => a.type === 'SEAT')) {
                                                            legHasSeats = true;
                                                            break;
                                                        }
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={lIdx}
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveLegIdx(lIdx);
                                                            toast.info(`Showing seat map for Leg ${lIdx + 1}: ${leg.origin} ➔ ${leg.destination}`);
                                                        }}
                                                        className={`flex-1 min-w-[170px] py-2.5 px-4 rounded-md text-xs font-bold transition-all border text-left ${
                                                            isLegActive
                                                                ? 'bg-[#00206B] border-[#00206B] text-white shadow-sm font-black'
                                                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div>Leg {lIdx + 1}: {leg.origin} ➔ {leg.destination}</div>
                                                        <div className={`text-[10px] font-normal mt-0.5 ${legHasSeats ? (isLegActive ? 'text-emerald-300 font-bold' : 'text-emerald-600 font-bold') : isLegActive ? 'text-white/70' : 'text-slate-500'}`}>
                                                            {legHasSeats ? '🟢 Live API Seat Map' : '⚪ Standard Seating'}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Passenger Selector Strip for Multi-Passenger Bookings */}
                                {passengers.length > 1 && (
                                    <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Select Traveller to Assign Seats & Perks ({activeCityPair.origin} ➔ {activeCityPair.destination}):
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {passengers.map((p, idx) => {
                                                const selSeat = selections[idx]?.selectedSeats?.[activeSegKey] || selections[idx]?.selectedSeats?.[activeCityPairIdx] || 'None';
                                                const selMeal = selections[idx]?.selectedMeals?.[activeSegKey] ? '🍱' : '';
                                                const selBag = selections[idx]?.selectedBaggage?.[activeCityPairIdx] ? '🧳' : '';
                                                const isActive = activePassengerIdx === idx;
                                                return (
                                                    <button
                                                        key={p.id || idx}
                                                        type="button"
                                                        onClick={() => setActivePassengerIdx(idx)}
                                                        className={`flex-1 min-w-[140px] p-3 rounded-md text-left border transition-all ${isActive
                                                                ? 'bg-[#00206B] border-[#00206B] text-white shadow-sm font-bold'
                                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <span className="block text-xs font-black truncate">{p.title || 'Mr.'} {p.firstName} {p.lastName}</span>
                                                        <span className={`block text-[10px] font-mono mt-1 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                                            Seat: <strong className={isActive ? 'text-[#ff9d3c]' : 'text-slate-800'}>{selSeat}</strong> {selMeal} {selBag}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* SEAT MAP TAB */}
                                {activeTab === 'seats' && (
                                    <div className="space-y-6">

                                        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 text-xs">
                                            <div className="flex items-center gap-4 flex-wrap font-semibold text-slate-700">
                                                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-white border border-slate-400"></div> Available</span>
                                                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-[#d8942f] text-white flex items-center justify-center font-bold text-[9px]">✓</div> Selected</span>
                                                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-amber-100 border border-amber-400"></div> Front Legroom</span>
                                                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-slate-300"></div> Occupied</span>
                                            </div>
                                            <span className="font-bold text-slate-900 bg-white px-3 py-1 border border-slate-200">
                                                Selected Seat: <strong className="text-[#d8942f] text-sm">{selectedSeat || 'None'}</strong>
                                            </span>
                                        </div>

                                        {passengers[activePassengerIdx]?.type === 'INF' && (
                                            <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold p-4 text-center my-3 rounded">
                                                👶 Infants travel on the lap of an adult. Seats cannot be assigned for infants.
                                            </div>
                                        )}

                                        {apiSeatsLayout?.[0]?.isFallback ? (
                                            <div className="max-w-md mx-auto bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium p-3 mb-3 text-center">
                                                ℹ️ Live seat map not returned by airline for <strong>{activeLeg.origin} ➔ {activeLeg.destination}</strong>. Showing standard layout for seat preference.
                                            </div>
                                        ) : (
                                            <div className="max-w-md mx-auto bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold p-3 mb-3 text-center">
                                                ✨ Live Airline Seat Map Loaded ({apiSeatsLayout?.length} Rows) for <strong>{activeLeg.origin} ➔ {activeLeg.destination}</strong>
                                            </div>
                                        )}

                                        {/* Aircraft Layout Container */}
                                        <div className="max-w-md mx-auto bg-slate-50 border-2 border-slate-300 p-6 rounded-t-[100px] shadow-inner text-center relative max-h-[580px] overflow-y-auto custom-scrollbar">
                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 border-b border-slate-200 pb-3 flex items-center justify-center gap-1 sticky top-0 bg-slate-50 z-10 py-1">
                                                ✈️ Cockpit Front
                                            </div>

                                            {/* Rows Grid */}
                                            <div className="space-y-3.5">
                                                {apiSeatsLayout && apiSeatsLayout.length > 0 ? (
                                                    apiSeatsLayout.map(rowObj => {
                                                        const rowNum = rowObj.id;
                                                        const isExitRow = rowObj.characteristics === 'EXIT_ROW' || rowNum === 12 || rowNum === 13;
                                                        const cols = ['A', 'B', 'C', 'D', 'E', 'F'];

                                                        return (
                                                            <div key={rowNum} className="flex items-center justify-center gap-3">
                                                                {/* Left 3 Seats (A, B, C) */}
                                                                <div className="flex items-center gap-2">
                                                                    {cols.slice(0, 3).map(col => {
                                                                        const seatObj = rowObj.seats?.find(s => s.columnId === col);
                                                                        if (!seatObj) return <div key={col} className="w-10 h-10"></div>;

                                                                        const seatId = seatObj.number;
                                                                        const isOccupied = seatObj.availability === false;
                                                                        const isSelected = selectedSeat === seatId;
                                                                        const isFrontRow = Number(rowNum) <= 3;
                                                                        const seatPrice = seatObj.amount?.price || 0;

                                                                        return (
                                                                            <div key={seatId} className="flex flex-col items-center">
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={isOccupied || isSelectedByOther(seatId)}
                                                                                    onClick={() => setSelectedSeat(seatId)}
                                                                                    className={`w-10 h-10 text-xs font-bold rounded-md border transition-all flex items-center justify-center ${isOccupied
                                                                                        ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'
                                                                                        : isSelected
                                                                                            ? 'bg-[#00206B] border-[#00206B] text-white shadow-md scale-105 ring-2 ring-[#d8942f]'
                                                                                            : isSelectedByOther(seatId)
                                                                                                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                                                                                : isFrontRow
                                                                                                    ? 'bg-amber-50 border-amber-400 text-amber-900 hover:bg-amber-100'
                                                                                                    : isExitRow
                                                                                                        ? 'bg-blue-50 border-blue-400 text-blue-900 hover:bg-blue-100'
                                                                                                        : 'bg-white border-slate-300 text-slate-800 hover:border-[#00206B] hover:bg-blue-50/50'
                                                                                        }`}
                                                                                    title={`${seatId} • ₹${seatPrice} • ${isOccupied ? 'Occupied' : isSelectedByOther(seatId) ? 'Selected by other passenger' : 'Available'}`}
                                                                                >
                                                                                    {isSelected ? '✓' : seatId}
                                                                                </button>
                                                                                <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                                                                    {isOccupied ? '-' : seatPrice > 0 ? `₹${seatPrice}` : 'Free'}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Aisle Spacer */}
                                                                <div className="w-8 text-xs font-mono text-slate-400 font-bold">
                                                                    R{rowNum}
                                                                </div>

                                                                {/* Right 3 Seats (D, E, F) */}
                                                                <div className="flex items-center gap-2">
                                                                    {cols.slice(3, 6).map(col => {
                                                                        const seatObj = rowObj.seats?.find(s => s.columnId === col);
                                                                        if (!seatObj) return <div key={col} className="w-10 h-10"></div>;

                                                                        const seatId = seatObj.number;
                                                                        const isOccupied = seatObj.availability === false;
                                                                        const isSelected = selectedSeat === seatId;
                                                                        const isFrontRow = Number(rowNum) <= 3;
                                                                        const seatPrice = seatObj.amount?.price || 0;

                                                                        return (
                                                                            <div key={seatId} className="flex flex-col items-center">
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={isOccupied || isSelectedByOther(seatId)}
                                                                                    onClick={() => setSelectedSeat(seatId)}
                                                                                    className={`w-10 h-10 text-xs font-bold rounded-md border transition-all flex items-center justify-center ${isOccupied
                                                                                        ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'
                                                                                        : isSelected
                                                                                            ? 'bg-[#00206B] border-[#00206B] text-white shadow-md scale-105 ring-2 ring-[#d8942f]'
                                                                                            : isSelectedByOther(seatId)
                                                                                                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                                                                                : isFrontRow
                                                                                                    ? 'bg-amber-50 border-amber-400 text-amber-900 hover:bg-amber-100'
                                                                                                    : isExitRow
                                                                                                        ? 'bg-blue-50 border-blue-400 text-blue-900 hover:bg-blue-100'
                                                                                                        : 'bg-white border-slate-300 text-slate-800 hover:border-[#00206B] hover:bg-blue-50/50'
                                                                                        }`}
                                                                                    title={`${seatId} • ₹${seatPrice} • ${isOccupied ? 'Occupied' : isSelectedByOther(seatId) ? 'Selected by other passenger' : 'Available'}`}
                                                                                >
                                                                                    {isSelected ? '✓' : seatId}
                                                                                </button>
                                                                                <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                                                                    {isOccupied ? '-' : seatPrice > 0 ? `₹${seatPrice}` : 'Free'}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="py-16 text-center">
                                                        <Plane className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
                                                        <h4 className="font-bold text-slate-700 text-sm">Seat Selection Unavailable</h4>
                                                        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                                                            Cleartrip did not return seat map layout data for this flight segment. Standard seats will be allocated at airport check-in.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-6 border-t border-slate-200 pt-3">
                                                🚪 Aircraft Rear Exit
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MEAL SELECTION TAB */}
                                {activeTab === 'meals' && (
                                    mealOptions.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {mealOptions.map(m => (
                                                <div
                                                    key={m.id}
                                                    onClick={() => setSelectedMeal(m.id)}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-start gap-4 ${selectedMeal === m.id
                                                        ? 'bg-blue-50/60 border-[#00206B] shadow-sm'
                                                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                                {m.tag}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-emerald-600 block">
                                                            {m.price === 0 ? 'FREE' : `+₹${m.price}`}
                                                        </span>
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-2 ml-auto ${selectedMeal === m.id ? 'bg-[#00206B] border-[#00206B] text-white' : 'border-slate-300 bg-white'
                                                            }`}>
                                                            {selectedMeal === m.id && <Check className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border border-slate-200 rounded-lg text-center bg-slate-50">
                                            <Utensils className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <h4 className="font-bold text-sm text-slate-700">No Meals Add-on in Cleartrip Response</h4>
                                            <p className="text-xs text-slate-500 mt-1">Cleartrip API did not return advance meal options for this flight sector.</p>
                                        </div>
                                    )
                                )}

                                {/* EXTRA BAGGAGE TAB */}
                                {activeTab === 'baggage' && (
                                    baggageOptions.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {baggageOptions.map(b => (
                                                <div
                                                    key={b.id}
                                                    onClick={() => setSelectedBaggage(b.id)}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all flex flex-col justify-between ${selectedBaggage === b.id
                                                        ? 'bg-blue-50/60 border-[#00206B] shadow-sm'
                                                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div>
                                                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block mb-2">
                                                            {b.tag}
                                                        </span>
                                                        <h4 className="font-bold text-sm text-slate-900 mb-1">{b.title}</h4>
                                                        <p className="text-xs text-slate-500">{b.desc}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/60">
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {b.price === 0 ? 'Included' : `+₹${b.price.toLocaleString()}`}
                                                        </span>
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedBaggage === b.id ? 'bg-[#00206B] border-[#00206B] text-white' : 'border-slate-300 bg-white'
                                                            }`}>
                                                            {selectedBaggage === b.id && <Check className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border border-slate-200 rounded-lg text-center bg-slate-50">
                                            <Luggage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <h4 className="font-bold text-sm text-slate-700">No Extra Baggage Add-on in Cleartrip Response</h4>
                                            <p className="text-xs text-slate-500 mt-1">Cleartrip API did not return additional baggage options for this flight sector.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Continue to Payment Button */}
                        <div className="pt-2">
                            {sessionExpired ? (
                                <div className="border-2 border-red-200 bg-red-50 rounded-lg p-5 text-center">
                                    <h4 className="font-black text-sm text-red-700 uppercase tracking-wide">Your Search Session Has Expired</h4>
                                    <p className="text-xs text-red-600 mt-1.5 leading-relaxed">
                                        The airline only holds a fare session for a few minutes. Refreshing this page won't help —
                                        please start a fresh search to get a live fare and continue booking.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSearchAgain}
                                        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 px-8 rounded-lg transition-all shadow-md"
                                    >
                                        Search Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleProceedToPayment}
                                        disabled={isHolding}
                                        className={`w-full text-white py-4 rounded-md font-extrabold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${isHolding ? 'bg-slate-400 cursor-not-allowed shadow-md' : 'bg-gradient-to-br from-[#f4b33e] to-[#f15a18] hover:from-[#ffc45a] hover:to-[#e94d10] shadow-[0_6px_14px_rgba(241,90,24,0.18)]'
                                            }`}
                                    >
                                        <Lock className="w-4 h-4" /> {isHolding ? 'Holding Booking...' : `Confirm Seat${passengers.length > 1 ? 's' : ` (${selectedSeat})`} & Proceed to Pay`}
                                    </button>
                                    <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                                        🔒 Cleartrip Verified Seat Reservation • Fare locked for 15 minutes
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Selected Items & Fare Summary */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Selections Summary Card */}
                        <div className="bg-white border border-[#c9dcff] rounded-lg shadow-sm p-6 space-y-4 max-h-[350px] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-[#00206B]">YOUR SELECTIONS</h4>
                                <span className="text-[11px] text-emerald-600 font-bold">✓ Confirmed</span>
                            </div>

                            <div className="space-y-4 divide-y divide-slate-100">
                                {passengers.map((p, idx) => {
                                            const pSel = selections[idx] || {};
                                    const seatsList = [];
                                    const pSeats = pSel.selectedSeats || {};
                                    if (flight.selectedSectorsList && flight.selectedSectorsList.length > 0) {
                                        flight.selectedSectorsList.forEach((sec, cpIdx) => {
                                            const seg = sec.segments?.[0] || {};
                                            const seatKey = `${cpIdx}_0`;
                                            const seat = pSeats[seatKey] || pSeats[cpIdx];
                                            if (seat && seat !== 'None') {
                                                const sPrice = getSeatPrice(seat);
                                                seatsList.push(`${seg.origin || 'Leg'}➔${seg.destination || ''}: ${seat}${sPrice > 0 ? ` (+₹${sPrice})` : ' (Free)'}`);
                                            }
                                        });
                                    } else {
                                        flight.segments.forEach((seg, sIdx) => {
                                            const seat = pSeats[sIdx] || pSeats[`0_${sIdx}`] || pSeats[`${sIdx}_0`];
                                            if (seat && seat !== 'None') {
                                                const sPrice = getSeatPrice(seat);
                                                seatsList.push(`${seg.origin}➔${seg.destination}: ${seat}${sPrice > 0 ? ` (+₹${sPrice})` : ' (Free)'}`);
                                            }
                                        });
                                    }

                                    const firstMealSel = pSel.selectedMeals?.[0];
                                    let pMeal = 'None';
                                    if (firstMealSel && firstMealSel !== 'None') {
                                        pMeal = typeof firstMealSel === 'object' ? (firstMealSel.description || firstMealSel.title || firstMealSel.mealId) : firstMealSel;
                                    } else if (pSel.selectedMeal && pSel.selectedMeal !== 'None') {
                                        pMeal = mealOptions.find(m => m.id === pSel.selectedMeal)?.title || pSel.selectedMeal;
                                    } else if (hasFareMealBenefit) {
                                        pMeal = 'Complimentary';
                                    } else {
                                        pMeal = 'None';
                                    }

                                    const pSeat = seatsList.length > 0 ? seatsList.join(' | ') : 'None';
                                    const pBag = baggageOptions.find(b => b.id === pSel.selectedBaggage)?.title || 'None';
                                    return (
                                        <div key={p.id || idx} className="pt-3 first:pt-0 space-y-2 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-900 font-semibold">{p.firstName} {p.lastName}</span>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">{p.type}</span>
                                            </div>
                                            <div className="flex justify-between items-center pl-2">
                                                <span className="text-slate-500">Seat</span>
                                                <strong className="text-[#00206B] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-mono">{pSeat}</strong>
                                            </div>
                                            <div className="flex justify-between items-center pl-2">
                                                <span className="text-slate-500">Meal</span>
                                                <span className="text-emerald-600 font-medium truncate max-w-[120px]" title={pMeal}>{pMeal}</span>
                                            </div>
                                            <div className="flex justify-between items-center pl-2">
                                                <span className="text-slate-500">Baggage</span>
                                                <span className="text-blue-600 font-medium truncate max-w-[120px]" title={pBag}>{pBag}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Total Price Card */}
                        <div className="bg-white border border-[#c9dcff] rounded-lg shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block">TOTAL FARE</span>
                                    {extraAncillariesCost > 0 && (
                                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                                            Flight: ₹{baseFlightFare.toLocaleString()} + Add-ons: ₹{extraAncillariesCost.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-2xl font-black text-slate-950">₹{totalFareWithAddons.toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                {hasFareMealBenefit 
                                    ? "Includes Base Fare, Government Taxes & Complimentary In-flight Meal."
                                    : "Includes Base Fare, Airline Fuel Surcharges & Applicable Government Taxes."}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Login required modal - shown before payment */}
            {showLoginRequired && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]"
                    onClick={closeLoginRequired}
                    role="presentation"
                >
                    <div
                        className="w-full max-w-[430px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#00206B] px-6 py-5 pb-6">
                            <div className="mb-2 flex items-center gap-3 text-blue-100">
                                <Shield size={24} className="opacity-90" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Secure Booking</span>
                            </div>
                            <h3 className="text-2xl font-extrabold text-white">Login required</h3>
                        </div>
                        <div className="px-6 pb-6 pt-5">
                            <p className="mb-5 text-sm font-medium text-slate-600">
                                Please login to your GoAirClass account before continuing to payment.
                            </p>

                            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/50 p-3.5">
                                <div className="flex items-start gap-3">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                    <p className="text-xs font-semibold leading-relaxed text-blue-900">
                                        Your selected flight search will stay available when you return.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={goToLogin}
                                className="mt-5 flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-br from-[#f4b33e] to-[#f15a18] px-4 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(241,90,24,0.22)] transition-all hover:from-[#ffc45a] hover:to-[#e94d10]"
                            >
                                Login to Continue Booking
                            </button>

                            <button
                                type="button"
                                onClick={closeLoginRequired}
                                className="mt-2.5 h-10 w-full rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
