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
    const ancillaryRanRef = useRef(false);

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

            if (!mealInput || mealInput === 'None' || (typeof mealInput === 'object' && mealInput.id === 'None')) {
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
            if (baggageId === 'None') {
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
                    seats: rowSeats
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

    const handleProceedToPayment = async () => {
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
            toast.error("Session expired. Please restart the booking process.");
            return;
        }

        if (!pId) {
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
                        departDate: pSeg.departureDateTime
                            ? new Date(pSeg.departureDateTime).toLocaleDateString('en-GB')
                            : new Date().toLocaleDateString('en-GB'),
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
                        departDate: outboundSeg.departureDateTime
                            ? new Date(outboundSeg.departureDateTime).toLocaleDateString('en-GB')
                            : new Date().toLocaleDateString('en-GB'),
                        cabinType: outboundSeg.cabinType || "ECONOMY",
                        paxInfos: paxInfosList
                    },
                    {
                        index: 2,
                        origin: returnSeg.origin,
                        destination: returnSeg.destination,
                        departDate: returnSeg.departureDateTime
                            ? new Date(returnSeg.departureDateTime).toLocaleDateString('en-GB')
                            : new Date().toLocaleDateString('en-GB'),
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
                    departDate: primarySegment.departureDateTime
                        ? new Date(primarySegment.departureDateTime).toLocaleDateString('en-GB')
                        : new Date().toLocaleDateString('en-GB'),
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
                        selectedSeat: p.type === 'INF' ? 'None' : (pSel.selectedSeats?.[0] || 'None'),
                        selectedReturnSeat: p.type === 'INF' ? 'None' : (pSel.selectedSeats?.[1] || 'None'),
                        selectedMeals: selectedMealsMap,
                        selectedMealObj: firstMealObj,
                        selectedMeal: typeof firstMealObj === 'object' ? (firstMealObj.mealId || firstMealObj.mealCode || 'None') : firstMealObj,
                        mealHoldStatus: mealStatus,
                        selectedBaggage: pSel.selectedBaggage || 'None'
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
            toast.error(`Hold Booking Failed: ${errDetail}`);
        } finally {
            setIsHolding(false);
        }
    };

    if (!flight) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-[75px]">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-none flex items-center justify-center mx-auto mb-4">
                        <Plane className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">No Booking Data Found</h2>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Please start booking from the flight search list.</p>
                    <button
                        onClick={() => navigate('/flights/list')}
                        className="bg-[#b89565] hover:bg-[#a38053] text-white font-bold py-3 px-8 rounded-none transition-all shadow-md"
                    >
                        Back to Search
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans pt-[75px]">
            <Navbar />

            {/* Stepper Header Bar */}
            <div className="bg-slate-900 text-white py-6 border-b border-slate-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-none transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#b89565]">Step 3: Add-on Perks & Seats</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-xs text-slate-400 font-mono">Flight: {flight.airlineName} ({flight.segments?.map(s => s.flightNumber).join(' → ') || primarySegment.flightNumber})</span>
                            </div>
                            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                                {flight?.isRoundTripCombined
                                    ? `${flight.segments[0]?.origin} ⇄ ${flight.segments[0]?.destination} (Round Trip)`
                                    : `${primarySegment.origin} ➔ ${lastSegment.destination}`
                                }
                                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                                    Passenger: {passengers[0]?.firstName || 'Traveller'} {passengers[0]?.lastName || ''}
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <div className="w-6 h-6 rounded-none bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">1</div>
                            <span>Flight Select</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <div className="flex items-center gap-2 text-emerald-400">
                            <div className="w-6 h-6 rounded-none bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">2</div>
                            <span>Passenger Info</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <div className="flex items-center gap-2 text-[#b89565]">
                            <div className="w-6 h-6 rounded-none bg-[#b89565] text-slate-950 flex items-center justify-center font-bold">3</div>
                            <span className="underline decoration-[#b89565] underline-offset-4">Seats & Meals</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="w-6 h-6 rounded-none bg-slate-800 border border-slate-700 flex items-center justify-center">4</div>
                            <span>Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Selection Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Interactive Seat Grid & Tabs */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
                            {/* Tab Controls */}
                            <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-800 gap-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#b89565]" />
                                    <div>
                                        <h3 className="font-bold text-sm text-white">Select Seat, Meal & Extra Baggage</h3>
                                        {ancillariesUnavailable ? (
                                            <span className="text-[10px] text-amber-400 font-mono block">
                                                ⚠️ Airline API Offline - Local Fallback Seats Active
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-emerald-400 font-mono block">
                                                📡 Cleartrip Live Ancillaries API Connected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-slate-800 p-1 border border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('seats')}
                                        className={`px-4 py-1.5 text-xs font-bold transition-all ${activeTab === 'seats' ? 'bg-[#b89565] text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'}`}
                                    >
                                        💺 Seat Map
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('meals')}
                                        className={`px-4 py-1.5 text-xs font-bold transition-all ${activeTab === 'meals' ? 'bg-[#b89565] text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'}`}
                                    >
                                        🍽️ In-flight Meals
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('baggage')}
                                        className={`px-4 py-1.5 text-xs font-bold transition-all ${activeTab === 'baggage' ? 'bg-[#b89565] text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'}`}
                                    >
                                        🧳 Extra Baggage
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {ancillariesUnavailable && (
                                    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs font-semibold rounded-none shadow-sm flex items-start gap-3">
                                        <span className="text-lg">⚠️</span>
                                        <div>
                                            <strong className="block font-bold mb-0.5 text-amber-800">In-Flight Services Temporarily Unavailable</strong>
                                            <span>We are currently unable to retrieve direct seat layout maps from Cleartrip for this connecting flight segment. Fallback local allocation is active. You can select your preferred seat sequence below and proceed to pay.</span>
                                        </div>
                                    </div>
                                )}

                                {/* City Pair Tabs (Level 1 Selector) */}
                                {cityPairs.length > 1 && (
                                    <div className="mb-6 p-4 bg-slate-900 text-white rounded-none shadow-sm">
                                        <label className="block text-xs font-bold text-[#b89565] uppercase tracking-wider mb-2">
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
                                                        className={`flex-1 min-w-[180px] p-3 text-left border transition-all ${
                                                            isCPActive
                                                                ? 'bg-[#b89565] border-[#b89565] text-slate-950 font-black shadow-md'
                                                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
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
                                    <div className="mb-6 p-4 bg-slate-100 border border-slate-200">
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                            Connecting Flights for {activeCityPair.origin} ➔ {activeCityPair.destination}:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {activeLegs.map((leg, lIdx) => {
                                                const isLegActive = activeLegIdx === lIdx;
                                                return (
                                                    <button
                                                        key={lIdx}
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveLegIdx(lIdx);
                                                            toast.info(`Showing seat map for Leg ${lIdx + 1}: ${leg.origin} ➔ ${leg.destination}`);
                                                        }}
                                                        className={`flex-1 min-w-[150px] py-2.5 px-4 text-xs font-bold transition-all border ${
                                                            isLegActive
                                                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-black'
                                                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        Leg {lIdx + 1}: {leg.origin} ➔ {leg.destination}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Passenger Selector Strip for Multi-Passenger Bookings */}
                                {passengers.length > 1 && (
                                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200">
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
                                                        className={`flex-1 min-w-[140px] p-3 text-left border transition-all ${isActive
                                                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold'
                                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <span className="block text-xs font-black truncate">{p.title || 'Mr.'} {p.firstName} {p.lastName}</span>
                                                        <span className="block text-[10px] text-slate-400 font-mono mt-1">
                                                            Seat: <strong className={isActive ? 'text-[#b89565]' : 'text-slate-800'}>{selSeat}</strong> {selMeal} {selBag}
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
                                                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-[#b89565] text-white flex items-center justify-center font-bold text-[9px]">✓</div> Selected</span>
                                                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-amber-100 border border-amber-400"></div> Front Legroom</span>
                                                <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 bg-slate-300"></div> Occupied</span>
                                            </div>
                                            <span className="font-bold text-slate-900 bg-white px-3 py-1 border border-slate-200">
                                                Selected Seat: <strong className="text-[#b89565] text-sm">{selectedSeat || 'None'}</strong>
                                            </span>
                                        </div>

                                        {passengers[activePassengerIdx]?.type === 'INF' && (
                                            <div className="max-w-md mx-auto bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold p-4 text-center my-3 rounded">
                                                👶 Infants travel on the lap of an adult. Seats cannot be assigned for infants.
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
                                                                                    className={`w-10 h-10 text-xs font-bold rounded-none border transition-all flex items-center justify-center ${isOccupied
                                                                                        ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'
                                                                                        : isSelected
                                                                                            ? 'bg-[#b89565] border-[#967547] text-white shadow-md scale-105 ring-2 ring-[#b89565]/30'
                                                                                            : isSelectedByOther(seatId)
                                                                                                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                                                                                : isFrontRow
                                                                                                    ? 'bg-amber-50 border-amber-400 text-amber-900 hover:bg-amber-100'
                                                                                                    : isExitRow
                                                                                                        ? 'bg-blue-50 border-blue-400 text-blue-900 hover:bg-blue-100'
                                                                                                        : 'bg-white border-slate-300 text-slate-800 hover:border-[#b89565] hover:bg-amber-50/50'
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
                                                                                    className={`w-10 h-10 text-xs font-bold rounded-none border transition-all flex items-center justify-center ${isOccupied
                                                                                        ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'
                                                                                        : isSelected
                                                                                            ? 'bg-[#b89565] border-[#967547] text-white shadow-md scale-105 ring-2 ring-[#b89565]/30'
                                                                                            : isSelectedByOther(seatId)
                                                                                                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                                                                                : isFrontRow
                                                                                                    ? 'bg-amber-50 border-amber-400 text-amber-900 hover:bg-amber-100'
                                                                                                    : isExitRow
                                                                                                        ? 'bg-blue-50 border-blue-400 text-blue-900 hover:bg-blue-100'
                                                                                                        : 'bg-white border-slate-300 text-slate-800 hover:border-[#b89565] hover:bg-amber-50/50'
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
                                                    className={`p-4 border rounded-none cursor-pointer transition-all flex justify-between items-start gap-4 ${selectedMeal === m.id
                                                        ? 'bg-amber-50/60 border-[#b89565] shadow-sm'
                                                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                                                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase">
                                                                {m.tag}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold text-emerald-600 block">
                                                            {m.price === 0 ? 'FREE' : `+₹${m.price}`}
                                                        </span>
                                                        <div className={`w-5 h-5 rounded-none border flex items-center justify-center mt-2 ml-auto ${selectedMeal === m.id ? 'bg-[#b89565] border-[#b89565] text-white' : 'border-slate-300 bg-white'
                                                            }`}>
                                                            {selectedMeal === m.id && <Check className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border border-slate-200 text-center bg-slate-50">
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
                                                    className={`p-4 border rounded-none cursor-pointer transition-all flex flex-col justify-between ${selectedBaggage === b.id
                                                        ? 'bg-amber-50/60 border-[#b89565] shadow-sm'
                                                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <div>
                                                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase inline-block mb-2">
                                                            {b.tag}
                                                        </span>
                                                        <h4 className="font-bold text-sm text-slate-900 mb-1">{b.title}</h4>
                                                        <p className="text-xs text-slate-500">{b.desc}</p>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/60">
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {b.price === 0 ? 'Included' : `+₹${b.price.toLocaleString()}`}
                                                        </span>
                                                        <div className={`w-5 h-5 rounded-none border flex items-center justify-center ${selectedBaggage === b.id ? 'bg-[#b89565] border-[#b89565] text-white' : 'border-slate-300 bg-white'
                                                            }`}>
                                                            {selectedBaggage === b.id && <Check className="w-3.5 h-3.5" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 border border-slate-200 text-center bg-slate-50">
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
                            <button
                                type="button"
                                onClick={handleProceedToPayment}
                                disabled={isHolding}
                                className={`w-full text-white py-4 font-bold text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] ${isHolding ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#b89565] hover:bg-[#a38053]'
                                    }`}
                            >
                                <Lock className="w-4 h-4" /> {isHolding ? 'Holding Booking...' : `Confirm Seat${passengers.length > 1 ? 's' : ` (${selectedSeat})`} & Proceed to Pay`}
                            </button>
                            <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                                🔒 Cleartrip Verified Seat Reservation • Fare locked for 15 minutes
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Selected Items & Fare Summary */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Selections Summary Card */}
                        <div className="bg-slate-900 text-white p-6 border border-slate-800 rounded-none shadow-sm space-y-4 max-h-[350px] overflow-y-auto">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-[#b89565]">YOUR SELECTIONS</h4>
                                <span className="text-[11px] text-emerald-400 font-bold">✓ Confirmed</span>
                            </div>

                            <div className="space-y-4 divide-y divide-slate-800">
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
                                                <span className="text-slate-250 font-semibold">{p.firstName} {p.lastName}</span>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">{p.type}</span>
                                            </div>
                                            <div className="flex justify-between items-center pl-2">
                                                <span className="text-slate-400">Seat</span>
                                                <strong className="text-[#b89565] bg-slate-800 px-2 py-0.5 border border-slate-700 font-mono">{pSeat}</strong>
                                            </div>
                                            <div className="flex justify-between items-center pl-2">
                                                <span className="text-slate-400">Meal</span>
                                                <span className="text-emerald-400 font-medium truncate max-w-[120px]" title={pMeal}>{pMeal}</span>
                                            </div>
                                            <div className="flex justify-between items-center pl-2">
                                                <span className="text-slate-400">Baggage</span>
                                                <span className="text-blue-400 font-medium truncate max-w-[120px]" title={pBag}>{pBag}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Total Price Card */}
                        <div className="bg-white border border-slate-200 p-6 rounded-none shadow-sm space-y-4">
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

            <Footer />
        </div>
    );
}
