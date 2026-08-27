import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, User, Shield, ArrowLeft, Check, Luggage, Briefcase, Clock, Calendar, Mail, Phone, CreditCard, ChevronRight, ChevronDown, Lock, MapPin, Receipt, Info, Sparkles, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createFlightSession, previewFlightApi, fetchAncillariesApi, fetchBenefitsApi } from '../services/flightApi';
import { toast } from 'react-toastify';
import FlightItineraryTimeline from './FlightItineraryTimeline';
import { formatFlightTime, formatFlightDate } from './FlightListPage';

// Cache to prevent duplicate preview API calls in React StrictMode
const previewCache = new Map();

export default function FlightBookingDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Data passed from FlightListPage via navigate state
    const {
        flight,
        searchId,
        dataId,
        sessionId: initialSessionId,
        flightPreview: initialPreview,
        ancillaries: initialAncillaries,
        adultsCount = 1,
        childrenCount = 0,
        infantsCount = 0
    } = location.state || {};

    const searchParamsStored = localStorage.getItem('flightSearchParams');
    const parsedSearchParams = searchParamsStored ? JSON.parse(searchParamsStored) : {};
    const storedCabinClass = parsedSearchParams.travelClass || "ECONOMY";

    // Live state updated asynchronously in background
    const [liveSessionId, setLiveSessionId] = useState(initialSessionId || null);
    const [livePreview, setLivePreview] = useState(initialPreview || null);
    const [liveAncillaries, setLiveAncillaries] = useState(initialAncillaries || null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [benefitsData, setBenefitsData] = useState(null);
    const [loadingBenefits, setLoadingBenefits] = useState(false);
    const [showDetailsMap, setShowDetailsMap] = useState({});
    const [activeLegIndex, setActiveLegIndex] = useState(0);

    // 40% Slide-Over Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerData, setDrawerData] = useState(null);

    const openDrawer = (segments, title = 'Flight Itinerary Details', secFlight = null) => {
        setDrawerData({ segments, title, secFlight });
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
    };

    // Primary flight & segment details
    const primarySegment = flight?.segments?.[0] || {};
    const lastSegment = flight?.segments?.[flight?.segments?.length - 1] || primarySegment;

    // Form inputs state
    const [passengers, setPassengers] = useState(() => {
        const getDobDefault = (type) => {
            const today = new Date();
            if (type === 'CHD') {
                today.setFullYear(today.getFullYear() - 6);
            } else if (type === 'INF') {
                today.setFullYear(today.getFullYear() - 1);
            } else {
                today.setFullYear(today.getFullYear() - 25);
            }
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const d = String(today.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const list = [];
        for (let i = 0; i < adultsCount; i++) {
            list.push({
                title: 'Mr',
                firstName: '',
                lastName: '',
                gender: 'MALE',
                type: 'ADT',
                dob: getDobDefault('ADT'),
                studentId: '',
                armedForcesId: '',
                passportNumber: '',
                nationality: 'IN',
                passportExpiry: '',
                label: `Adult ${i + 1}`,
                id: `adult-${i}`
            });
        }
        for (let i = 0; i < childrenCount; i++) {
            list.push({
                title: 'Mstr',
                firstName: '',
                lastName: '',
                gender: 'MALE',
                type: 'CHD',
                dob: getDobDefault('CHD'),
                studentId: '',
                armedForcesId: '',
                passportNumber: '',
                nationality: 'IN',
                passportExpiry: '',
                label: `Child ${i + 1}`,
                id: `child-${i}`
            });
        }
        for (let i = 0; i < infantsCount; i++) {
            list.push({
                title: 'Mstr',
                firstName: '',
                lastName: '',
                gender: 'MALE',
                type: 'INF',
                dob: getDobDefault('INF'),
                studentId: '',
                armedForcesId: '',
                passportNumber: '',
                nationality: 'IN',
                passportExpiry: '',
                label: `Infant ${i + 1}`,
                id: `infant-${i}`
            });
        }
        return list;
    });

    const handlePassengerChange = (index, field, value) => {
        setPassengers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const [countryCode, setCountryCode] = useState('+91');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const countryCodes = [
        { code: "+91", label: "+91 (IN)" },
        { code: "+1", label: "+1 (US)" },
        { code: "+44", label: "+44 (UK)" },
        { code: "+971", label: "+971 (AE)" },
        { code: "+65", label: "+65 (SG)" },
        { code: "+61", label: "+61 (AU)" },
        { code: "+966", label: "+966 (SA)" },
        { code: "+974", label: "+974 (QA)" },
        { code: "+968", label: "+968 (OM)" },
        { code: "+973", label: "+973 (BH)" },
        { code: "+880", label: "+880 (BD)" },
        { code: "+977", label: "+977 (NP)" },
        { code: "+94", label: "+94 (LK)" },
        { code: "+60", label: "+60 (MY)" },
        { code: "+66", label: "+66 (TH)" },
        { code: "+49", label: "+49 (DE)" },
        { code: "+33", label: "+33 (FR)" }
    ];

    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [needGst, setNeedGst] = useState(false);
    const [gstNumber, setGstNumber] = useState('');
    const [gstCompany, setGstCompany] = useState('');

    // Ancillary selections
    const [selectedSeat, setSelectedSeat] = useState('1A');
    const [selectedMeal, setSelectedMeal] = useState('MEAL_VEG_SANDWICH');
    const [selectedBaggage, setSelectedBaggage] = useState('BAG_STD_15');

    // Run session creation, flight preview, and ancillaries in background (0ms UI delay)
    useEffect(() => {
        let isMounted = true;
        const runBackgroundPipeline = async () => {
            if (!flight || !searchId) return;
            try {
                if (isMounted) setIsVerifying(true);
                // 1. Session API - Reuse session created during ticket selection, or create fresh if missing
                let activeSId = initialSessionId || liveSessionId || flight?.sessionId || sessionStorage.getItem('flight_session_id');
                if (!activeSId) {
                    console.log(`[Booking Details] No active sessionId found, creating fresh session for searchId: ${searchId}`);
                    const sessionRes = await createFlightSession(searchId);
                    if (sessionRes.success && sessionRes.data?.sessionId) {
                        activeSId = sessionRes.data.sessionId;
                        sessionStorage.setItem('flight_session_id', activeSId);
                        if (isMounted) setLiveSessionId(activeSId);
                    }
                } else {
                    if (isMounted && !liveSessionId) setLiveSessionId(activeSId);
                    sessionStorage.setItem('flight_session_id', activeSId);
                }

                // 2. Flight Preview API
                if (activeSId && !livePreview) {
                    const cacheKey = `${searchId}_${flight.rawOption?.travelOptionId || flight.id}`;
                    if (!previewCache.has(cacheKey)) {
                        const paxInfosList = [
                            { paxType: "ADT", paxCount: adultsCount, paxFareType: "DEFAULT" },
                            childrenCount > 0 ? { paxType: "CHD", paxCount: childrenCount, paxFareType: "DEFAULT" } : null,
                            infantsCount > 0 ? { paxType: "INF", paxCount: infantsCount, paxFareType: "DEFAULT" } : null
                        ].filter(Boolean);

                        if (flight?.isMultiCityCombined) {
                            // Multi-City: Cleartrip requires SEPARATE preview call per leg, each with only J1 + 1 sector
                            const selectedSectorsList = flight.selectedSectorsList || [];
                            const apiCall = (async () => {
                                const allPreviews = [];
                                const previewsMap = [];
                                for (let sIdx = 0; sIdx < selectedSectorsList.length; sIdx++) {
                                    const secFlight = selectedSectorsList[sIdx];
                                    const optId = secFlight.rawOption?.travelOptionId || secFlight.id;
                                    const subOptId = secFlight.rawOption?.subTravelOptionId || secFlight.id;
                                    const fareId = secFlight.rawOption?.fareId || "";
                                    const price = secFlight.price || 0;

                                    // Ensure each flight leg ALWAYS gets its own distinct, dedicated session ID
                                    let legSessionId = sessionStorage.getItem(`flight_session_id_${sIdx}`) || (sIdx === 0 ? (secFlight.sessionId || activeSId) : null);
                                    if (!legSessionId || (sIdx > 0 && legSessionId === activeSId)) {
                                        try {
                                            console.log(`[Multi-City Leg ${sIdx + 1}] Creating fresh dedicated session...`);
                                            const sRes = await createFlightSession(searchId);
                                            if (sRes.success && sRes.data?.sessionId) {
                                                legSessionId = sRes.data.sessionId;
                                                sessionStorage.setItem(`flight_session_id_${sIdx}`, legSessionId);
                                            }
                                        } catch (sErr) {
                                            console.warn(`[Multi-City Leg ${sIdx + 1}] Session creation error:`, sErr.message);
                                        }
                                    }
                                    if (sIdx === 0 && legSessionId) {
                                        sessionStorage.setItem(`flight_session_id_0`, legSessionId);
                                    }
                                    console.log(`[Multi-City Leg ${sIdx + 1}] Final Dedicated Session ID: ${legSessionId}`);

                                    const pSeg = secFlight.segments[0];
                                    const lSeg = secFlight.segments[secFlight.segments.length - 1];

                                    const legSectorIndex = secFlight.searchSectorIndex || (sIdx + 1);
                                    const legSectorKey = secFlight.searchSectorKey || `J${legSectorIndex}`;
                                    const legSearchId = secFlight.searchId || searchId;

                                    const legPayload = {
                                        searchId: legSearchId,
                                        dataId: dataId || "",
                                        flightPreviewCriteria: { isMultiFareRequest: false, maxFareCount: 0, sellingCountryCode: "IN", sellingCurrencyCode: "INR" },
                                        searchIntents: {
                                            sectors: [{
                                                index: legSectorIndex,
                                                origin: pSeg.origin,
                                                destination: lSeg.destination,
                                                departDate: pSeg.departureDateTime
                                                    ? new Date(pSeg.departureDateTime).toLocaleDateString('en-GB')
                                                    : new Date().toLocaleDateString('en-GB'),
                                                cabinType: pSeg.cabinType || storedCabinClass,
                                                paxInfos: paxInfosList
                                            }]
                                        },
                                        travelOptions: {
                                            [legSectorKey]: {
                                                travelOptionId: optId,
                                                price: price,
                                                subTravelOptions: [{ subTravelOptionId: subOptId, fareId: fareId }]
                                            }
                                        }
                                    };

                                    try {
                                        const res = await previewFlightApi(legSessionId, legPayload);
                                        if (res.success && res.data) {
                                            const previewRoot = res.data.data || res.data;
                                            const travelOptions = previewRoot?.travelOptions || {};
                                            let previewLeg = null;
                                            if (travelOptions) {
                                                if (Array.isArray(travelOptions)) {
                                                    previewLeg = travelOptions[0];
                                                } else if (typeof travelOptions === 'object') {
                                                    const firstVal = Object.values(travelOptions)[0];
                                                    if (Array.isArray(firstVal)) {
                                                        previewLeg = firstVal[0];
                                                    } else if (firstVal && typeof firstVal === 'object') {
                                                        previewLeg = firstVal;
                                                    }
                                                }
                                            }

                                            const subTravelOpts = previewLeg?.subTravelOptions || [];
                                            let subOptObj = null;
                                            if (Array.isArray(subTravelOpts)) {
                                                subOptObj = subTravelOpts[0];
                                            } else if (subTravelOpts && typeof subTravelOpts === 'object') {
                                                subOptObj = Object.values(subTravelOpts)[0];
                                            }

                                            const previewOptionId = previewLeg?.travelOptionId || previewLeg?.id || optId;
                                            const previewSubOptionId = subOptObj?.subTravelOptionId || subOptObj?.id || subOptId;
                                            const previewFareId = subOptObj?.fareId || previewLeg?.fareId || fareId;
                                            const previewId = previewRoot?.flightPreviewId || previewRoot?.id || "";

                                            console.log(`[Multi-City Ticket Leg ${sIdx + 1}] Created SessionId: ${legSessionId}, previewId: ${previewId}, optionId: ${previewOptionId}`);

                                            previewsMap[sIdx] = {
                                                optionId: previewOptionId,
                                                subOptionId: previewSubOptionId,
                                                fareId: previewFareId,
                                                previewId,
                                                sessionId: legSessionId,
                                                searchId: legSearchId
                                            };
                                            if (previewId) {
                                                sessionStorage.setItem(`flight_preview_id_${sIdx}`, previewId);
                                            }
                                            if (legSessionId) {
                                                sessionStorage.setItem(`flight_session_id_${sIdx}`, legSessionId);
                                            }
                                            allPreviews.push(res.data);
                                        } else {
                                            previewsMap[sIdx] = { optionId: optId, subOptionId: subOptId, fareId, previewId: "", sessionId: legSessionId };
                                            allPreviews.push(null);
                                        }
                                    } catch (legErr) {
                                        console.warn(`[Multi-City Preview] Leg ${sIdx + 1} failed:`, legErr.message);
                                        previewsMap[sIdx] = { optionId: optId, subOptionId: subOptId, fareId, previewId: "", sessionId: legSessionId };
                                        allPreviews.push(null);
                                    }
                                }
                                sessionStorage.setItem('multi_city_previews_map', JSON.stringify(previewsMap.filter(Boolean)));
                                // Return first successful preview (primary) + store all
                                const firstValid = allPreviews.find(p => p !== null);
                                if (firstValid) {
                                    firstValid._multiCityPreviews = allPreviews;
                                    return firstValid;
                                }
                                throw new Error('All multi-city preview calls failed');
                            })();
                            previewCache.set(cacheKey, apiCall);
                        } else if (flight?.isRoundTripCombined) {
                            // Round-trip: send both J1 and J2 in a single call
                            const outOptId = flight.outboundRawOption?.travelOptionId || flight.outboundTravelId || flight.id;
                            const outSubOptId = flight.outboundRawOption?.subTravelOptionId || flight.id;
                            const outFareId = flight.outboundRawOption?.fareId || "";
                            const outPrice = flight.outboundRawOption?.price || 0;

                            const retOptId = flight.returnRawOption?.travelOptionId || flight.returnTravelId || flight.id;
                            const retSubOptId = flight.returnRawOption?.subTravelOptionId || flight.id;
                            const retFareId = flight.returnRawOption?.fareId || "";
                            const retPrice = flight.returnRawOption?.price || 0;

                            const outboundSeg = flight.segments[0];
                            const returnSeg = flight.segments[flight.segments.length - 1];

                            const previewPayload = {
                                searchId,
                                dataId: dataId || "",
                                flightPreviewCriteria: { isMultiFareRequest: false, maxFareCount: 0, sellingCountryCode: "IN", sellingCurrencyCode: "INR" },
                                searchIntents: {
                                    sectors: [
                                        {
                                            index: 1,
                                            origin: outboundSeg.origin,
                                            destination: outboundSeg.destination,
                                            departDate: outboundSeg.departureDateTime
                                                ? new Date(outboundSeg.departureDateTime).toLocaleDateString('en-GB')
                                                : new Date().toLocaleDateString('en-GB'),
                                            cabinType: outboundSeg.cabinType || storedCabinClass,
                                            paxInfos: paxInfosList
                                        },
                                        {
                                            index: 2,
                                            origin: returnSeg.origin,
                                            destination: returnSeg.destination,
                                            departDate: returnSeg.departureDateTime
                                                ? new Date(returnSeg.departureDateTime).toLocaleDateString('en-GB')
                                                : new Date().toLocaleDateString('en-GB'),
                                            cabinType: returnSeg.cabinType || storedCabinClass,
                                            paxInfos: paxInfosList
                                        }
                                    ]
                                },
                                travelOptions: {
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
                                }
                            };

                            const apiCall = previewFlightApi(activeSId, previewPayload).then(res => {
                                if (res.success && res.data) return res.data;
                                throw new Error(res.message || 'Preview failed');
                            });
                            previewCache.set(cacheKey, apiCall);
                        } else {
                            // One-way: standard J1 only
                            const previewPayload = {
                                searchId,
                                dataId: dataId || "",
                                flightPreviewCriteria: { isMultiFareRequest: false, maxFareCount: 0, sellingCountryCode: "IN", sellingCurrencyCode: "INR" },
                                searchIntents: {
                                    sectors: [{
                                        index: 1,
                                        origin: primarySegment.origin || "BLR",
                                        destination: lastSegment.destination || "BOM",
                                        departDate: primarySegment.departureDateTime ? new Date(primarySegment.departureDateTime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                                        cabinType: primarySegment.cabinType || storedCabinClass,
                                        paxInfos: paxInfosList
                                    }]
                                },
                                travelOptions: {
                                    J1: {
                                        travelOptionId: flight.rawOption?.travelOptionId || flight.id,
                                        price: flight.price,
                                        subTravelOptions: [{
                                            subTravelOptionId: flight.rawOption?.subTravelOptionId || flight.rawOption?.travelOptionId || flight.id,
                                            fareId: flight.rawOption?.fareId || flight.fareId || flight.selectedFareId || ""
                                        }]
                                    }
                                }
                            };

                            const apiCall = previewFlightApi(activeSId, previewPayload).then(res => {
                                if (res.success && res.data) return res.data;
                                throw new Error(res.message || 'Preview failed');
                            });
                            previewCache.set(cacheKey, apiCall);
                        }
                    }

                    try {
                        const flightPreviewResult = await previewCache.get(cacheKey);
                        if (isMounted) {
                            const previewId = flightPreviewResult.flightPreviewId ||
                                flightPreviewResult.id ||
                                flightPreviewResult.data?.flightPreviewId ||
                                flightPreviewResult.data?.id || "";
                            sessionStorage.setItem('flight_preview_id', previewId);
                            setLivePreview(flightPreviewResult);
                        }
                    } catch (cacheErr) {
                        previewCache.delete(cacheKey);
                        console.warn('[Booking Details] Preview validation failed, continuing to benefits:', cacheErr.message);
                    }
                }

                // 3. Fetch Standard Benefits API
                if (activeSId && flight) {
                    try {
                        if (isMounted) setLoadingBenefits(true);
                        const benefitsTravelOptions = {};

                        if (flight?.isMultiCityCombined) {
                            const selectedSectorsList = flight.selectedSectorsList || [];
                            selectedSectorsList.forEach((secFlight, sIdx) => {
                                const key = `J${sIdx + 1}`;
                                const optId = secFlight.rawOption?.travelOptionId || secFlight.id;
                                const subOptId = secFlight.rawOption?.subTravelOptionId || secFlight.id;
                                const fareId = secFlight.rawOption?.fareId || "";
                                const primarySeg = secFlight.segments[0];
                                const lastSeg = secFlight.segments[secFlight.segments.length - 1];
                                const sectorKey = `${primarySeg.origin}_${lastSeg.destination}`;

                                benefitsTravelOptions[key] = {
                                    travelOptionId: optId,
                                    subTravelOptions: [{
                                        subTravelOptionId: subOptId,
                                        fareIds: fareId ? [fareId] : [],
                                        subTravelOptionKey: sectorKey,
                                        isInternational: secFlight.isInternational || false
                                    }]
                                };
                            });
                        } else {
                            const subTravelOptionId = flight.rawOption?.subTravelOptionId || flight.rawOption?.travelOptionId || flight.id;
                            const fareId = flight.rawOption?.fareId || "";
                            const sectorKey = `${primarySegment.origin}_${lastSegment.destination}`;

                            benefitsTravelOptions['J1'] = {
                                travelOptionId: flight.rawOption?.travelOptionId || flight.id,
                                subTravelOptions: [{
                                    subTravelOptionId,
                                    fareIds: fareId ? [fareId] : [],
                                    subTravelOptionKey: sectorKey,
                                    isInternational: flight.isInternational || false
                                }]
                            };
                        }

                        const benefitsPayload = {
                            searchId,
                            sessionId: activeSId,
                            requiredBenefitTypes: ["BAGGAGE", "PENALTIES", "FARE_BENEFITS"],
                            travelOptionId: flight.isMultiCityCombined ? flight.selectedSectorsList[0].id : (flight.rawOption?.travelOptionId || flight.id),
                            travelOptions: benefitsTravelOptions,
                            paxInfos: [{ paxType: "ADULT", paxCount: 1 }]
                        };

                        const benResponse = await fetchBenefitsApi(benefitsPayload);
                        if (benResponse.success && benResponse.data && isMounted) {
                            const benData = benResponse.data;
                            setBenefitsData(benData);

                            // Merge fareBenefits with livePreview fares
                            const benRoot = benData.data?.data || benData.data || benData;
                            const fareBenefitsMap = benRoot.fareBenefits || benRoot.fares || {};

                            setLivePreview(prevPreview => {
                                if (!prevPreview) return prevPreview;
                                const prevFares = prevPreview.fares || prevPreview.data?.fares || {};
                                const mergedFares = { ...prevFares };

                                Object.entries(fareBenefitsMap).forEach(([fareId, benObj]) => {
                                    if (mergedFares[fareId]) {
                                        mergedFares[fareId] = {
                                            ...mergedFares[fareId],
                                            ...benObj,
                                            fareBenefits: benObj,
                                            subTravelOptionBenefits: benObj.subTravelOptionBenefits || mergedFares[fareId].subTravelOptionBenefits,
                                            benefitIds: benObj.benefitIds || benObj.benefits?.benefitIds || mergedFares[fareId].benefitIds || []
                                        };
                                    } else {
                                        mergedFares[fareId] = benObj;
                                    }
                                });

                                return {
                                    ...prevPreview,
                                    fares: mergedFares,
                                    fareBenefits: fareBenefitsMap,
                                    baggageAllowances: { ...(prevPreview.baggageAllowances || {}), ...(benRoot.baggageAllowances || {}) },
                                    penalties: { ...(prevPreview.penalties || {}), ...(benRoot.penalties || {}) },
                                    benefits: { ...(prevPreview.benefits || {}), ...(benRoot.benefits || {}) }
                                };
                            });
                        }
                    } catch (benErr) {
                        console.warn('[Booking Details] Failed to fetch benefits:', benErr.message);
                    } finally {
                        if (isMounted) setLoadingBenefits(false);
                    }
                }
            } catch (err) {
                console.warn('Background validation note:', err.message);
            } finally {
                if (isMounted) setIsVerifying(false);
            }
        };

        runBackgroundPipeline();
        return () => { isMounted = false; };
    }, [flight, searchId]);

    // Validation rules from flightPreview API
    const validations = livePreview?.fieldValidations || {};

    const NATIONALITY_OPTIONS = [
        { code: 'IN', label: 'India (IN)' },
        { code: 'US', label: 'United States (US)' },
        { code: 'GB', label: 'United Kingdom (GB)' },
        { code: 'AE', label: 'United Arab Emirates (AE)' },
        { code: 'SG', label: 'Singapore (SG)' },
        { code: 'AU', label: 'Australia (AU)' },
        { code: 'CA', label: 'Canada (CA)' },
        { code: 'SA', label: 'Saudi Arabia (SA)' },
        { code: 'QA', label: 'Qatar (QA)' },
        { code: 'OM', label: 'Oman (OM)' },
        { code: 'KW', label: 'Kuwait (KW)' },
        { code: 'BH', label: 'Bahrain (BH)' },
        { code: 'TH', label: 'Thailand (TH)' },
        { code: 'MY', label: 'Malaysia (MY)' },
        { code: 'NP', label: 'Nepal (NP)' },
        { code: 'BD', label: 'Bangladesh (BD)' },
        { code: 'LK', label: 'Sri Lanka (LK)' },
        { code: 'DE', label: 'Germany (DE)' },
        { code: 'FR', label: 'France (FR)' },
    ];

    // Extract dynamic Cleartrip fieldValidations, fieldAssociations, and preview data directly from live API
    const previewDataRoot = livePreview?.data?.data || livePreview?.data || livePreview || {};
    const dynamicFieldValidations = previewDataRoot.fieldValidations || flight?.fieldValidations || {};
    const dynamicFieldAssociations = previewDataRoot.fieldAssociations || flight?.fieldAssociations || {};

    // Dynamic checks from Cleartrip API fareId
    const fareIdString = flight?.rawOption?.fareId || flight?.fareId || '';
    const fareIdParts = typeof fareIdString === 'string' ? fareIdString.split('__') : [];
    const isInternationalFromFareId = fareIdParts.some(part => /^(INT|INTL|INTERNATIONAL)$/i.test(part));
    const isStudentFromFareId = fareIdParts.some(part => /STUDENT/i.test(part));
    const isArmedForcesFromFareId = fareIdParts.some(part => /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(part));

    // Dynamic check from airport zoneIds and countryCodes in live API response
    const isNonIndianZone = (zoneId) => zoneId && typeof zoneId === 'string' && !zoneId.includes('Kolkata') && !zoneId.includes('Calcutta');
    const isNonIndianCountry = (countryCode) => countryCode && typeof countryCode === 'string' && countryCode.trim().toUpperCase() !== 'IN';

    const isInternationalFromAirports = Boolean(
        isNonIndianCountry(primarySegment?.departureAirport?.countryCode) ||
        isNonIndianCountry(lastSegment?.arrivalAirport?.countryCode) ||
        isNonIndianCountry(primarySegment?.originCountryCode) ||
        isNonIndianCountry(lastSegment?.destinationCountryCode) ||
        isNonIndianZone(primarySegment?.departureZoneId || primarySegment?.departureAirport?.zoneId) ||
        isNonIndianZone(lastSegment?.arrivalZoneId || lastSegment?.arrivalAirport?.zoneId) ||
        (flight?.segments && flight.segments.some(s =>
            isNonIndianCountry(s.departureAirport?.countryCode) ||
            isNonIndianCountry(s.arrivalAirport?.countryCode) ||
            isNonIndianCountry(s.originCountryCode) ||
            isNonIndianCountry(s.destinationCountryCode) ||
            isNonIndianZone(s.departureZoneId || s.departureAirport?.zoneId) ||
            isNonIndianZone(s.arrivalZoneId || s.arrivalAirport?.zoneId)
        ))
    );

    const isStudentFare = Boolean(
        dynamicFieldValidations?.STUDENT_ID ||
        dynamicFieldAssociations?.STUDENT_ID ||
        isStudentFromFareId ||
        /STUDENT/i.test(flight?.brandName || '') ||
        /STUDENT/i.test(primarySegment?.brandName || '') ||
        /STUDENT/i.test(flight?.cabinType || '') ||
        /STUDENT/i.test(flight?.fareType || '') ||
        /STUDENT/i.test(flight?.rawOption?.brandName || '') ||
        /STUDENT/i.test(sessionStorage.getItem('flight_special_fare') || '') ||
        (flight?.specialFare && /STUDENT/i.test(flight.specialFare))
    );

    const isArmedForcesFare = Boolean(
        dynamicFieldValidations?.ARMED_FORCES_ID ||
        dynamicFieldAssociations?.ARMED_FORCES_ID ||
        isArmedForcesFromFareId ||
        /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(flight?.brandName || '') ||
        /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(primarySegment?.brandName || '') ||
        /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(flight?.cabinType || '') ||
        /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(flight?.fareType || '') ||
        /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(flight?.rawOption?.brandName || '') ||
        /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(sessionStorage.getItem('flight_special_fare') || '') ||
        (flight?.specialFare && /ARMED|DEFENCE|DEFENSE|MILITARY/i.test(flight.specialFare))
    );

    const isInternationalJourney = Boolean(
        dynamicFieldValidations?.PASSPORT_NUMBER ||
        dynamicFieldValidations?.NATIONALITY ||
        dynamicFieldAssociations?.PASSPORT_NUMBER ||
        previewDataRoot.journeyType === 'INTERNATIONAL' ||
        previewDataRoot.isInternational ||
        flight?.isInternational ||
        isInternationalFromFareId ||
        isInternationalFromAirports
    );

    // Helper function to resolve Cleartrip B2B Standard Benefits mappings on Booking Details Page
    const getResolvedBookingBenefits = () => {
        const sourceData = benefitsData || livePreview;
        if (!sourceData || !flight) return null;

        const rootData = sourceData.data?.data || sourceData.data || sourceData;
        const fareBenefitsMap = rootData.fareBenefits || rootData.fares || {};
        const selectedFareId = flight.rawOption?.fareId || flight.fareId;

        // Find the fare details in fareBenefits map (direct match, substring match, or first available)
        let fareInfo = fareBenefitsMap[selectedFareId];
        if (!fareInfo && selectedFareId) {
            const matchedKey = Object.keys(fareBenefitsMap).find(k => k.includes(selectedFareId) || selectedFareId.includes(k));
            if (matchedKey) fareInfo = fareBenefitsMap[matchedKey];
        }
        if (!fareInfo) {
            fareInfo = Object.values(fareBenefitsMap)[0];
        }
        if (!fareInfo) return null;

        const sectorKey = `${primarySegment.origin}_${lastSegment.destination}`;
        const subTravelOptionBenefits = fareInfo.subTravelOptionBenefits?.[sectorKey] || Object.values(fareInfo.subTravelOptionBenefits || {})[0];
        const benefitsInfo = subTravelOptionBenefits?.benefits || subTravelOptionBenefits || {};

        // 1. Resolve baggage allowances
        const baggageList = [];
        const baggageAllowancesMap = rootData.baggageAllowances || {};

        const flightBenefits = benefitsInfo.flightBenefits || {};
        Object.values(flightBenefits).forEach(segBenefit => {
            const allowances = segBenefit.baggageAllowances || [];
            allowances.forEach(allowance => {
                const bId = allowance.baggageAllowanceId || allowance.id;
                const bDetails = baggageAllowancesMap[bId];
                if (bDetails) {
                    const list = Array.isArray(bDetails) ? bDetails : [bDetails];
                    list.forEach(b => {
                        const bagType = b.type === 'BAGGAGE_CABIN' || b.type === 'Cabin' ? 'Cabin' : 'Check-in';
                        const spec = b.allowedBaggages?.[0] || {};
                        const pieceStr = spec.piece ? ` (${spec.piece} Piece${spec.piece > 1 ? 's' : ''})` : '';
                        const weight = spec.quantity !== undefined ? `${spec.quantity} ${spec.unit || 'KG'}${pieceStr}` : 'Policy Info';
                        baggageList.push({ type: bagType, weight });
                    });
                }
            });
        });

        // 2. Resolve cancellation and rescheduling penalties
        const penaltiesList = [];
        const seenPenaltyTypes = new Set();
        const penaltiesMap = rootData.penalties || {};
        const penaltyIds = benefitsInfo.penaltyIds || [];
        penaltyIds.forEach(id => {
            const penalty = penaltiesMap[id];
            if (penalty) {
                let typeLabel = 'Amend / Reschedule';
                const pType = String(penalty.penaltyType || '').toUpperCase();
                if (pType.includes('CANCEL')) {
                    typeLabel = 'Cancellation';
                } else if (pType === 'AMEND_SAME_FARE' || pType.includes('SAME_FARE')) {
                    typeLabel = 'Reschedule (Same Fare)';
                } else if (pType === 'AMEND_HIGHER_FARE' || pType.includes('HIGHER_FARE')) {
                    typeLabel = 'Reschedule (Higher Fare)';
                } else if (pType) {
                    typeLabel = pType.replace(/_/g, ' ');
                }

                if (seenPenaltyTypes.has(typeLabel)) return;
                seenPenaltyTypes.add(typeLabel);

                const timelines = penalty.timeLines || [];
                const timelineDetails = timelines.map(t => {
                    const permitted = t.permitted === true;
                    const permittedLabel = permitted ? 'Allowed' : 'Not Allowed';
                    const chargeInfo = t.passengerFareRuleCharges?.ADT?.charges?.[0] || {};
                    let amountStr = chargeInfo.amount !== undefined ? `₹${chargeInfo.amount.toLocaleString()} ${chargeInfo.currency || 'INR'}` : '';
                    if (!permitted) {
                        amountStr = 'Not Allowed';
                    } else if (!amountStr) {
                        amountStr = permittedLabel;
                    }
                    const timeLabel = t.endTime ? `${t.endTime.replace('PT', '').replace('H', ' hours')}` : 'departure';
                    return { permittedLabel, amountStr, timeLabel };
                });
                penaltiesList.push({ type: typeLabel, penaltyType: penalty.penaltyType, timelines: timelineDetails, raw: penalty });
            }
        });

        // 3. Resolve seat and meal services
        const benefitsList = [];
        const benefitsMap = rootData.benefits || {};
        const benefitIds = benefitsInfo.benefitIds || [];
        benefitIds.forEach(id => {
            const ben = benefitsMap[id];
            if (ben) {
                benefitsList.push({
                    type: ben.benefitType || '',
                    description: ben.description || ben.shortDescription || '',
                    value: ben.value || 'PAID'
                });
            }
        });

        const uniqueBaggage = Array.from(new Map(baggageList.map(item => [item.type + item.weight, item])).values());

        return { baggageList: uniqueBaggage, penaltiesList, benefitsList };
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Validate all passengers
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            if (!p.firstName || !p.firstName.trim() || !p.lastName || !p.lastName.trim()) {
                toast.error(`Please enter First and Last Name for ${p.label}`);
                return;
            }

            if (isStudentFare && p.type === 'ADT') {
                if (!p.studentId || !p.studentId.trim()) {
                    toast.error(`Please enter valid Student ID for ${p.label}`);
                    return;
                }
                if (!/^[A-Za-z0-9]+$/.test(p.studentId.trim())) {
                    toast.error(`Student ID for ${p.label} must be alphanumeric (letters and numbers only)`);
                    return;
                }
            }

            if (isArmedForcesFare && p.type === 'ADT') {
                if (!p.armedForcesId || !p.armedForcesId.trim()) {
                    toast.error(`Please enter Armed Forces ID for ${p.label}`);
                    return;
                }
                if (!/^[A-Za-z0-9]+$/.test(p.armedForcesId.trim())) {
                    toast.error(`Armed Forces ID for ${p.label} must be alphanumeric (letters and numbers only)`);
                    return;
                }
            }

            if (isInternationalJourney) {
                if (!p.passportNumber || !p.passportNumber.trim()) {
                    toast.error(`Please enter Passport Number for ${p.label}`);
                    return;
                }
                if (!/^[A-Za-z0-9]+$/.test(p.passportNumber.trim())) {
                    toast.error(`Passport Number for ${p.label} must be alphanumeric`);
                    return;
                }
                if (!p.nationality || !/^[A-Za-z]{2}$/.test(p.nationality.trim())) {
                    toast.error(`Please select 2-letter ISO Nationality for ${p.label}`);
                    return;
                }
                if (!p.passportExpiry) {
                    toast.error(`Please enter Passport Expiry Date for ${p.label}`);
                    return;
                }
            }
        }

        if (!email.trim() || !phone.trim()) {
            toast.error('Please enter Contact Email and Mobile Number');
            return;
        }

        let activePreview = livePreview;
        let activeSId = liveSessionId || sessionStorage.getItem('flight_session_id');

        // Guarantee Session ID and Flight Preview ID are generated before proceeding
        if (!activeSId && searchId) {
            try {
                toast.info('Initiating Cleartrip Session...');
                const sRes = await createFlightSession(searchId);
                if (sRes.success && sRes.data?.sessionId) {
                    activeSId = sRes.data.sessionId;
                    setLiveSessionId(activeSId);
                    sessionStorage.setItem('flight_session_id', activeSId);
                }
            } catch (sErr) {
                console.warn('Session init error:', sErr.message);
            }
        }

        if (!activePreview && activeSId && searchId) {
            try {
                toast.info('Verifying Live Rate with Cleartrip...');
                let previewTravelOptions = {};
                let searchIntentsSectors = [];

                const paxInfosList = [
                    { paxType: "ADT", paxCount: adultsCount, paxFareType: "DEFAULT" },
                    childrenCount > 0 ? { paxType: "CHD", paxCount: childrenCount, paxFareType: "DEFAULT" } : null,
                    infantsCount > 0 ? { paxType: "INF", paxCount: infantsCount, paxFareType: "DEFAULT" } : null
                ].filter(Boolean);

                if (flight?.isRoundTripCombined) {
                    const outOptId = flight.outboundRawOption?.travelOptionId || flight.outboundTravelId || flight.id;
                    const outSubOptId = flight.outboundRawOption?.subTravelOptionId || flight.id;
                    const outFareId = flight.outboundRawOption?.fareId || "";
                    const outPrice = flight.outboundRawOption?.price || 0;

                    const retOptId = flight.returnRawOption?.travelOptionId || flight.returnTravelId || flight.id;
                    const retSubOptId = flight.returnRawOption?.subTravelOptionId || flight.id;
                    const retFareId = flight.returnRawOption?.fareId || "";
                    const retPrice = flight.returnRawOption?.price || 0;

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
                            cabinType: outboundSeg.cabinType || storedCabinClass,
                            paxInfos: paxInfosList
                        },
                        {
                            index: 2,
                            origin: returnSeg.origin,
                            destination: returnSeg.destination,
                            departDate: returnSeg.departureDateTime
                                ? new Date(returnSeg.departureDateTime).toLocaleDateString('en-GB')
                                : new Date().toLocaleDateString('en-GB'),
                            cabinType: returnSeg.cabinType || storedCabinClass,
                            paxInfos: paxInfosList
                        }
                    ];
                } else {
                    previewTravelOptions = {
                        J1: {
                            travelOptionId: flight.rawOption?.travelOptionId || flight.id,
                            price: flight.price,
                            subTravelOptions: [{
                                subTravelOptionId: flight.rawOption?.subTravelOptionId || flight.rawOption?.travelOptionId || flight.id,
                                fareId: flight.rawOption?.fareId || ""
                            }]
                        }
                    };

                    searchIntentsSectors = [{
                        index: 1,
                        origin: primarySegment.origin || "BLR",
                        destination: lastSegment.destination || "BOM",
                        departDate: primarySegment.departureDateTime ? new Date(primarySegment.departureDateTime).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                        cabinType: primarySegment.cabinType || storedCabinClass,
                        paxInfos: paxInfosList
                    }];
                }

                const previewPayload = {
                    searchId,
                    dataId: dataId || "",
                    flightPreviewCriteria: { isMultiFareRequest: false, maxFareCount: 0, sellingCountryCode: "IN", sellingCurrencyCode: "INR" },
                    searchIntents: {
                        sectors: searchIntentsSectors
                    },
                    travelOptions: previewTravelOptions
                };

                const previewRes = await previewFlightApi(activeSId, previewPayload);
                if (previewRes.success && previewRes.data) {
                    activePreview = previewRes.data;
                    const pId = activePreview.flightPreviewId || activePreview.id || activePreview.data?.flightPreviewId || activePreview.data?.id || "";
                    if (pId) sessionStorage.setItem('flight_preview_id', pId);
                    setLivePreview(activePreview);
                }
            } catch (pErr) {
                console.warn('Preview verification note:', pErr.message);
            }
        }

        const hasFareMealBenefit = (flight?.benefits || benefitsData?.benefits || activePreview?.benefits || []).some(b =>
            (b.type || b.benefitType || '').toUpperCase() === 'MEAL' ||
            (b.description || b.value || '').toLowerCase().includes('meal')
        );

        const bookingPayload = {
            flight,
            searchId,
            dataId,
            sessionId: activeSId,
            flightPreview: activePreview,
            passengers,
            passenger: passengers[0], // fallback compatibility
            contact: {
                email,
                phone: phone.replace(/\D/g, ''),
                countryCode: countryCode.replace('+', ''),
                gstNumber: needGst ? gstNumber : null,
                gstCompany: needGst ? gstCompany : null
            },
            hasFareMealBenefit
        };

        toast.success('Passenger info saved! Next: Select Seats & Meals');
        navigate('/flight/seat-selection', { state: bookingPayload });
    };

    if (!flight) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-[75px]">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Plane className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">No Flight Selected</h2>
                    <p className="text-sm text-slate-500 mt-2 mb-6">Please select a flight from the search list to view booking details.</p>
                    <button
                        onClick={() => navigate('/flights/list')}
                        className="bg-[#d8942f] hover:bg-[#b9791f] text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md"
                    >
                        Back to Flight Search
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const renderFlightCards = () => {
        if (flight.isMultiCityCombined && flight.selectedSectorsList && flight.selectedSectorsList.length > 0) {
            const sectorsToRender = activeLegIndex === 'ALL'
                ? flight.selectedSectorsList.map((sec, idx) => ({ sec, idx }))
                : [{ sec: flight.selectedSectorsList[activeLegIndex] || flight.selectedSectorsList[0], idx: activeLegIndex === 'ALL' ? 0 : (activeLegIndex < flight.selectedSectorsList.length ? activeLegIndex : 0) }];

            return (
                <div>
                    {/* Leg / Sector Tab Selector */}
                    <div className="bg-white border border-[#c9dcff] p-3.5 mb-5 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#00206B] mr-1 flex items-center gap-1.5">
                                <Plane className="w-4 h-4 text-[#d8942f]" /> Select Leg / Sector:
                            </span>
                            {flight.selectedSectorsList.map((sec, sIdx) => {
                                const pSeg = sec.segments?.[0] || {};
                                const lSeg = sec.segments?.[sec.segments.length - 1] || pSeg;
                                const isActive = activeLegIndex === sIdx;
                                return (
                                    <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => setActiveLegIndex(sIdx)}
                                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border ${isActive
                                            ? 'bg-[#00206B] text-white border-[#00206B] shadow-md ring-1 ring-[#d8942f]'
                                            : 'bg-white text-slate-700 border-slate-300 hover:border-[#d8942f] hover:bg-amber-50/30'
                                            }`}
                                    >
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-[#d8942f] text-[#00206B]' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {sIdx + 1}
                                        </span>
                                        <span>Leg {sIdx + 1}: {pSeg.origin} ➔ {lSeg.destination}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveLegIndex(activeLegIndex === 'ALL' ? 0 : 'ALL')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${activeLegIndex === 'ALL'
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#d8942f] hover:bg-amber-50/30'
                                }`}
                        >
                            {activeLegIndex === 'ALL' ? 'Single Leg View' : `View All (${flight.selectedSectorsList.length} Legs)`}
                        </button>
                    </div>

                    {/* Render Selected Leg Card(s) */}
                    {sectorsToRender.map(({ sec: secFlight, idx }) => {
                        if (!secFlight) return null;
                        const pSeg = secFlight.segments[0];
                        const lSeg = secFlight.segments[secFlight.segments.length - 1];
                        return (
                            <div key={idx} className="bg-white border border-[#c9dcff] rounded-lg shadow-sm overflow-hidden mb-5">
                                <div className="bg-[#00206B] text-white px-6 py-3.5 flex justify-between items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-[#d8942f] flex items-center justify-center text-[#00206B] font-black shadow-sm">
                                            {secFlight.airlineCode || 'FL'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white">
                                                Leg {idx + 1}: {secFlight.airlineName} • {secFlight.segments?.map(s => s.flightNumber).join(' → ') || pSeg.flightNumber}
                                            </h3>
                                            <span className="text-[11px] text-white/65 font-medium">{pSeg.aircraft}</span>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-white/14 text-white border border-white/15 shadow-sm">
                                        Sector {idx + 1} of {flight.selectedSectorsList.length}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        {/* Departure */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-black text-slate-950">{pSeg.origin}</span>
                                                {pSeg.departureTerminal && (
                                                    <span className="text-[10px] font-extrabold text-[#00206B] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shadow-2xs">
                                                        {pSeg.departureTerminal}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="block text-xs font-semibold text-slate-600 mt-0.5">
                                                {pSeg.originAirportName}{pSeg.departureTerminal ? ` • ${pSeg.departureTerminal}` : ''}
                                            </span>
                                            <span className="block text-sm font-bold text-slate-900 mt-1">
                                                {formatFlightTime(pSeg.departureDateTime)}
                                            </span>
                                            <span className="block text-xs text-slate-500">
                                                {formatFlightDate(pSeg.departureDateTime, 'full')}
                                            </span>
                                        </div>

                                        {/* Duration */}
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-[#d8942f]" /> {pSeg.duration}
                                            </span>
                                            <div className="w-32 h-[1px] bg-slate-300 my-2 relative">
                                                <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-[#1d4fbd] -translate-y-1/2"></div>
                                                <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-[#1d4fbd] -translate-y-1/2"></div>
                                            </div>
                                            <span className="text-xs font-bold text-[#00206B]">
                                                {secFlight.segments?.length === 1 ? 'Non-stop' : `${secFlight.segments?.length - 1} Stop(s)`}
                                            </span>
                                        </div>

                                        {/* Arrival */}
                                        <div className="flex-1 text-left sm:text-right">
                                            <div className="flex items-center sm:justify-end gap-2">
                                                {lSeg.arrivalTerminal && (
                                                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shadow-2xs">
                                                        {lSeg.arrivalTerminal}
                                                    </span>
                                                )}
                                                <span className="text-2xl font-black text-slate-950">{lSeg.destination}</span>
                                            </div>
                                            <span className="block text-xs font-semibold text-slate-600 mt-0.5">
                                                {lSeg.destinationAirportName}{lSeg.arrivalTerminal ? ` • ${lSeg.arrivalTerminal}` : ''}
                                            </span>
                                            <span className="block text-sm font-bold text-slate-900 mt-1">
                                                {formatFlightTime(lSeg.arrivalDateTime)}
                                            </span>
                                            <span className="block text-xs text-slate-500">
                                                {formatFlightDate(lSeg.arrivalDateTime, 'full')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Baggage Strip */}
                                    <div className="mt-6 pt-4 flex flex-wrap gap-6 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
                                        {(() => {
                                            const resolved = getResolvedBookingBenefits();
                                            const cabin = resolved?.baggageList.find(b => b.type === 'Cabin')?.weight || pSeg.cabinBaggage || '7 KG (1 Piece)';
                                            const checkIn = resolved?.baggageList.find(b => b.type === 'Check-in')?.weight || pSeg.checkInBaggage || '15 KG (1 Piece)';
                                            return (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Luggage className="w-4 h-4 text-[#d8942f]" />
                                                        <span>Cabin Baggage: <strong className="text-slate-900">{cabin}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-[#d8942f]" />
                                                        <span>Check-in Baggage: <strong className="text-slate-900">{checkIn}</strong></span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* View Detailed Information Slide-Over Drawer Button */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                                        <button
                                            type="button"
                                            onClick={() => openDrawer(secFlight.segments, `Leg ${idx + 1}: ${secFlight.airlineName}`, secFlight)}
                                            className="text-[#00206B] hover:text-[#001548] font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <span>View detailed information ➔</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="bg-white border border-[#c9dcff] rounded-lg shadow-sm overflow-hidden">
                <div className="bg-[#00206B] text-white px-6 py-3.5 flex justify-between items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#d8942f] flex items-center justify-center text-[#00206B] font-black shadow-sm">
                            {flight.airlineCode || 'FL'}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-white">{flight.airlineName} • {flight.segments?.map(s => s.flightNumber).join(' → ') || primarySegment.flightNumber}</h3>
                            <span className="text-[11px] text-white/65 font-medium">{primarySegment.aircraft}</span>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border shadow-sm ${isVerifying ? 'bg-[#ff9d3c]/20 text-[#ffc45a] border-[#ff9d3c]/40 animate-pulse' : 'bg-emerald-400/15 text-emerald-300 border-emerald-300/40'}`}>
                        {isVerifying ? '⚡ Verifying Live Rate...' : '✓ Price Verified'}
                    </span>
                </div>

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        {/* Departure */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-slate-950">{primarySegment.origin}</span>
                                {primarySegment.departureTerminal && (
                                    <span className="text-[10px] font-extrabold text-[#00206B] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shadow-2xs">
                                        {primarySegment.departureTerminal}
                                    </span>
                                )}
                            </div>
                            <span className="block text-xs font-semibold text-slate-600 mt-0.5">
                                {primarySegment.originAirportName}{primarySegment.departureTerminal ? ` • ${primarySegment.departureTerminal}` : ''}
                            </span>
                            <span className="block text-sm font-bold text-slate-900 mt-1">
                                {formatFlightTime(primarySegment.departureDateTime)}
                            </span>
                            <span className="block text-xs text-slate-500">
                                {formatFlightDate(primarySegment.departureDateTime, 'full')}
                            </span>
                        </div>

                        {/* Duration */}
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#d8942f]" /> {primarySegment.duration}
                            </span>
                            <div className="w-32 h-[1px] bg-slate-300 my-2 relative">
                                <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-[#1d4fbd] -translate-y-1/2"></div>
                                <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-[#1d4fbd] -translate-y-1/2"></div>
                            </div>
                            <span className="text-xs font-bold text-[#00206B]">
                                {flight.segments?.length === 1 ? 'Non-stop' : `${flight.segments?.length - 1} Stop(s)`}
                            </span>
                        </div>

                        {/* Arrival */}
                        <div className="flex-1 text-left sm:text-right">
                            <div className="flex items-center sm:justify-end gap-2">
                                {lastSegment.arrivalTerminal && (
                                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shadow-2xs">
                                        {lastSegment.arrivalTerminal}
                                    </span>
                                )}
                                <span className="text-2xl font-black text-slate-950">{lastSegment.destination}</span>
                            </div>
                            <span className="block text-xs font-semibold text-slate-600 mt-0.5">
                                {lastSegment.destinationAirportName}{lastSegment.arrivalTerminal ? ` • ${lastSegment.arrivalTerminal}` : ''}
                            </span>
                            <span className="block text-sm font-bold text-slate-900 mt-1">
                                {formatFlightTime(lastSegment.arrivalDateTime)}
                            </span>
                            <span className="block text-xs text-slate-500">
                                {formatFlightDate(lastSegment.arrivalDateTime, 'full')}
                            </span>
                        </div>
                    </div>

                    {/* Baggage Strip */}
                    <div className="mt-6 pt-4 flex flex-wrap gap-6 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
                        {(() => {
                            const resolved = getResolvedBookingBenefits();
                            const cabin = resolved?.baggageList.find(b => b.type === 'Cabin')?.weight || primarySegment.cabinBaggage || '7 KG (1 Piece)';
                            const checkIn = resolved?.baggageList.find(b => b.type === 'Check-in')?.weight || primarySegment.checkInBaggage || '15 KG (1 Piece)';
                            return (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Luggage className="w-4 h-4 text-[#d8942f]" />
                                        <span>Cabin Baggage: <strong className="text-slate-900">{cabin}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#d8942f]" />
                                        <span>Check-in Baggage: <strong className="text-slate-900">{checkIn}</strong></span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* View Detailed Information Slide-Over Drawer Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                        <button
                            type="button"
                            onClick={() => openDrawer(flight.segments, 'Flight Itinerary Details')}
                            className="text-[#00206B] hover:text-[#001548] font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <span>View detailed information ➔</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    {/* 1.5 Important Information (Always visible with dynamic API constraints and essential airline guidelines) */}
    const renderImportantInformation = () => {
        const previewDataRoot = livePreview?.data?.data || livePreview?.data || livePreview || initialPreview?.data || initialPreview || {};
        const constraintAssociations = previewDataRoot.constraintAssociations || previewDataRoot.constraints || flight?.constraintAssociations || null;
        const fieldValidations = previewDataRoot.fieldValidations || flight?.fieldValidations || null;
        const fieldAssociations = previewDataRoot.fieldAssociations || flight?.fieldAssociations || null;

        const rawList = [];
        if (constraintAssociations) {
            if (Array.isArray(constraintAssociations)) {
                rawList.push(...constraintAssociations);
            } else if (typeof constraintAssociations === 'object') {
                Object.entries(constraintAssociations).forEach(([catKey, val]) => {
                    if (Array.isArray(val)) {
                        val.forEach(item => {
                            if (typeof item === 'object' && item !== null) {
                                rawList.push({ ...item, categoryKey: catKey });
                            } else if (typeof item === 'string' && item.trim()) {
                                rawList.push({ description: item, categoryKey: catKey });
                            }
                        });
                    } else if (typeof val === 'object' && val !== null) {
                        rawList.push({ ...val, categoryKey: catKey });
                    } else if (typeof val === 'string' && val.trim()) {
                        rawList.push({ description: val, categoryKey: catKey });
                    }
                });
            }
        }

        const infoMessages = [];
        const seen = new Set();

        const addMessage = (msg, icon = 'ℹ️') => {
            if (!msg || typeof msg !== 'string') return;
            const trimmed = msg.trim();
            if (trimmed && !seen.has(trimmed.toLowerCase())) {
                seen.add(trimmed.toLowerCase());
                infoMessages.push({ text: trimmed, icon });
            }
        };

        // 1. Process dynamic constraintAssociations rules from Cleartrip API
        rawList.forEach((c) => {
            if (!c) return;

            // Age constraints
            const minAge = c.includeMinAge ?? c.minAge;
            const maxAge = c.includeMaxAge ?? c.maxAge;
            const paxType = c.paxType || c.categoryKey;
            const paxName = paxType === 'ADT' ? 'Adult traveller' : paxType === 'CHD' ? 'Child traveller' : paxType === 'INF' ? 'Infant' : 'Passenger';

            if (minAge !== undefined && maxAge !== undefined) {
                addMessage(`${paxName} must be between ${minAge} and ${maxAge} years old.`, '🎂');
            } else if (minAge !== undefined) {
                addMessage(`${paxName} must be at least ${minAge} years old.`, '🎂');
            } else if (maxAge !== undefined) {
                addMessage(`${paxName} must be under ${maxAge} years old.`, '🎂');
            }

            // Name & Regex constraints
            const fRegex = c.firstNameRegex || c.nameRegex;
            const lRegex = c.lastNameRegex;
            const minLen = c.minCharLength || c.minLength;
            const maxLen = c.maxCharLength || c.maxLength;

            if (fRegex || lRegex) {
                let msg = 'Passenger first and last name must contain only English alphabets (no special characters or numbers).';
                if (minLen && maxLen) {
                    msg += ` Name length must be between ${minLen} and ${maxLen} characters.`;
                }
                addMessage(msg, '🔤');
            } else if (minLen && maxLen) {
                addMessage(`Passenger name length must be between ${minLen} and ${maxLen} characters.`, '🔤');
            }

            if (c.allowSingleName === false || c.singleNameAllowed === false) {
                addMessage('Both First Name and Last Name are required. Single names or initials only are not allowed.', '👤');
            }

            if (c.allowSpecialCharacters === false || c.specialCharactersAllowed === false) {
                addMessage('Special characters (e.g., @, #, $, -, _) and numeric digits are not permitted in passenger names.', '🚫');
            }

            // Document / ID Verification constraints
            const docType = (c.documentType || c.mandatoryDocument || c.type || '').toUpperCase();
            if (docType.includes('STUDENT') || c.categoryKey === 'STUDENT') {
                addMessage('A valid Student ID card issued by a recognized educational institution is mandatory and must be presented at the airport counter.', '🎓');
            } else if (docType.includes('ARMED') || docType.includes('DEFENCE') || docType.includes('MILITARY')) {
                addMessage('Valid Military / Armed Forces official service ID is mandatory and must be presented at airline check-in.', '🎖️');
            } else if (docType.includes('PASSPORT') || c.categoryKey === 'PASSPORT' || c.isPassportRequired) {
                addMessage('A valid Passport is mandatory for all passengers traveling on international flights.', '🌍');
            }

            if (c.passportValidityMonths || c.minPassportValidityMonths) {
                const months = c.passportValidityMonths || c.minPassportValidityMonths;
                addMessage(`Passport must have a minimum remaining validity of at least ${months} months from the travel date.`, '📅');
            }

            // Passenger Ratio & Requirements
            if (c.maxInfantPerAdult || c.infantsPerAdult) {
                addMessage(`Maximum ${c.maxInfantPerAdult || c.infantsPerAdult} infant allowed per accompanying adult traveller.`, '👶');
            }
            if (c.leadPaxMinAge || c.primaryPaxMinAge) {
                addMessage(`The primary / lead booking passenger must be at least ${c.leadPaxMinAge || c.primaryPaxMinAge} years old.`, '🧑');
            }
            if (c.unaccompaniedMinorAllowed === false) {
                addMessage('Unaccompanied minors are not permitted to travel under this fare class.', '⚠️');
            }
            if (c.dobRequired || c.isDobMandatory) {
                addMessage('Date of birth is mandatory for all travellers as per airline ticketing regulations.', '🗓️');
            }

            // Clean custom API descriptions / rules (stripping COPY, IDs, regex syntax)
            const rawDescription = c.description || c.message || c.rule || c.condition || c.ruleText;
            if (typeof rawDescription === 'string' && rawDescription.trim()) {
                let cleaned = rawDescription
                    .replace(/\bCOPY\b/gi, '')
                    .replace(/\bID:[a-zA-Z0-9_-]+\b/gi, '')
                    .replace(/\^[A-Za-z0-9\\^$.*+?()[\]{}|]+\$/g, 'valid format')
                    .replace(/[_]/g, ' ')
                    .trim();

                if (cleaned.length > 5 && !cleaned.startsWith('{') && !cleaned.startsWith('[')) {
                    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                    if (!cleaned.endsWith('.')) cleaned += '.';
                    addMessage(cleaned, '📌');
                }
            }
        });

        // 2. Process fieldValidations from live API
        if (fieldValidations || fieldAssociations) {
            if (fieldValidations?.STUDENT_ID || fieldAssociations?.STUDENT_ID) {
                addMessage('A valid Student ID card is mandatory for student fare verification at airline check-in.', '🎓');
            }
            if (fieldValidations?.ARMED_FORCES_ID || fieldAssociations?.ARMED_FORCES_ID) {
                addMessage('Valid Military / Armed Forces official service ID is mandatory for defence personnel verification.', '🎖️');
            }
            if (fieldValidations?.PASSPORT_NUMBER || fieldAssociations?.PASSPORT_NUMBER) {
                addMessage('A valid Passport is mandatory for all passengers traveling on international flights.', '🌍');
            }
            if (fieldValidations?.NATIONALITY || fieldAssociations?.NATIONALITY) {
                addMessage('Nationality as per valid passport is mandatory for international booking.', '🌐');
            }
        }

        // 100% Pure Dynamic: If no API constraints exist, hide section completely
        if (infoMessages.length === 0) return null;

        return (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-200/60">
                    <div className="w-6 h-6 rounded bg-[#d8942f] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        <Info className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                            Important Information
                        </h4>
                        <p className="text-[11px] text-amber-800/80 font-medium">
                            Mandatory airline &amp; fare requirements for this booking
                        </p>
                    </div>
                </div>

                <ul className="space-y-2">
                    {infoMessages.map((item, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-2.5 text-xs text-amber-950 font-medium leading-relaxed">
                            <span className="shrink-0 text-sm mt-0.5">{item.icon}</span>
                            <span>{item.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-body pt-[75px]">
            <style>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    .animate-slide-in-right {
                        animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}</style>
            <Navbar />

            {/* Top Stepper Header */}
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
                                <span>{primarySegment.origin}</span>
                                <span className="text-white/80 font-semibold">→</span>
                                <span>{lastSegment.destination}</span>
                                <span className="bg-white/14 border border-white/15 text-white px-2 py-0.5 rounded text-[10px] font-semibold shadow-sm">
                                    {flight.segments?.length === 1 ? 'Non-stop' : `${flight.segments?.length - 1} Stop(s)`}
                                </span>
                            </h1>
                            <div className="flex gap-1.5 flex-wrap items-center mt-1.5">
                                <span className="bg-white/14 border border-white/15 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                                    <User size={11} className="text-[#ff9d3c]" /> Booking Details
                                </span>
                                <span className="bg-white/14 border border-white/15 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                                    <Lock size={11} className="text-[#ff9d3c]" /> Session: {liveSessionId ? `${liveSessionId.substring(0, 12)}...` : (isVerifying ? 'Creating…' : 'Active')}
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
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-6 h-6 rounded-md bg-[#d8942f] text-[#00206B] flex items-center justify-center font-bold shadow-sm">2</div>
                            <span className="underline decoration-[#ff9d3c] underline-offset-4">Passenger Details</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                        <div className="flex items-center gap-2 text-white/55">
                            <div className="w-6 h-6 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">3</div>
                            <span className="hidden sm:inline">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Flight Summary & Passenger Form */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. Confirmed Flight Banner */}
                        {renderFlightCards()}

                        {/* 1.5 Important Information (Dynamic from constraintAssociations) */}
                        {renderImportantInformation()}

                        {/* 2. Passenger Details Form (Driven by flightPreview Validations) */}
                        <form onSubmit={handleFormSubmit} className="bg-white border border-[#c9dcff] rounded-lg shadow-sm p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-md bg-blue-50 text-[#00206B] flex items-center justify-center font-bold">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-slate-900">Passenger Information</h3>
                                        <p className="text-xs text-slate-500">Please enter traveller names as per Government ID</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamically render traveller form for each passenger */}
                            {passengers.map((p, idx) => (
                                <div key={p.id} className="space-y-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-200">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            👤 {p.label} ({p.type === 'ADT' ? 'Adult' : p.type === 'CHD' ? 'Child' : 'Infant'})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        {/* Title */}
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Title *</label>
                                            <select
                                                value={p.title}
                                                onChange={(e) => handlePassengerChange(idx, 'title', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#d8942f]"
                                            >
                                                {p.type === 'ADT' ? (
                                                    <>
                                                        <option value="Mr">Mr</option>
                                                        <option value="Mrs">Mrs</option>
                                                        <option value="Ms">Ms</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Mstr">Mstr</option>
                                                        <option value="Miss">Miss</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        {/* First Name */}
                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">First Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Rahul"
                                                value={p.firstName}
                                                onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#d8942f]"
                                            />
                                        </div>

                                        {/* Last Name */}
                                        <div className="md:col-span-5">
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Last Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Sharma"
                                                value={p.lastName}
                                                onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#d8942f]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                        {/* Gender */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Gender *</label>
                                            <select
                                                value={p.gender}
                                                onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#d8942f]"
                                            >
                                                <option value="MALE">Male</option>
                                                <option value="FEMALE">Female</option>
                                            </select>
                                        </div>

                                        {/* Date of Birth */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date of Birth *</label>
                                            <input
                                                type="date"
                                                value={p.dob || ''}
                                                onChange={(e) => handlePassengerChange(idx, 'dob', e.target.value)}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#d8942f]"
                                            />
                                        </div>
                                    </div>

                                    {/* Student Fare ID Field */}
                                    {isStudentFare && p.type === 'ADT' && (
                                        <div className="bg-amber-50/70 border border-amber-200/90 rounded-md p-3.5 mt-2 shadow-2xs">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-sm">🎓</span>
                                                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Student Fare Verification</span>
                                                <span className="text-[10px] text-amber-700 font-semibold">(Student ID Required)</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student ID Card Number *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. STU123456"
                                                        value={p.studentId || ''}
                                                        onChange={(e) => handlePassengerChange(idx, 'studentId', e.target.value.toUpperCase())}
                                                        required
                                                        className="w-full bg-white border border-amber-300 rounded-md p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#d8942f]"
                                                    />
                                                </div>
                                                <div className="text-[11px] text-amber-800 font-medium leading-tight">
                                                    ℹ️ Valid student ID card must be presented at airline check-in counter.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Armed Forces / Defence Fare ID Field */}
                                    {isArmedForcesFare && p.type === 'ADT' && (
                                        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-md p-3.5 mt-2 shadow-2xs">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-sm">🎖️</span>
                                                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Armed Forces Verification</span>
                                                <span className="text-[10px] text-emerald-700 font-semibold">(Service ID Required)</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Armed Forces Service ID *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. AF987654"
                                                        value={p.armedForcesId || ''}
                                                        onChange={(e) => handlePassengerChange(idx, 'armedForcesId', e.target.value.toUpperCase())}
                                                        required
                                                        className="w-full bg-white border border-emerald-300 rounded-md p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#d8942f]"
                                                    />
                                                </div>
                                                <div className="text-[11px] text-emerald-800 font-medium leading-tight">
                                                    ℹ️ Valid military/armed forces official service ID required at airport check-in.
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* International Journey: Passport & Nationality Details */}
                                    {isInternationalJourney && (
                                        <div className="bg-blue-50/70 border border-blue-200/90 rounded-md p-3.5 mt-2 shadow-2xs">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-sm">🌍</span>
                                                <span className="text-xs font-bold text-[#00206B] uppercase tracking-wider">International Travel Documentation</span>
                                                <span className="text-[10px] text-blue-700 font-semibold">(Mandatory for International Flights)</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Passport Number *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Z1234567"
                                                        value={p.passportNumber || ''}
                                                        onChange={(e) => handlePassengerChange(idx, 'passportNumber', e.target.value.toUpperCase())}
                                                        required
                                                        className="w-full bg-white border border-blue-300 rounded-md p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00206B]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nationality *</label>
                                                    <select
                                                        value={p.nationality || 'IN'}
                                                        onChange={(e) => handlePassengerChange(idx, 'nationality', e.target.value)}
                                                        required
                                                        className="w-full bg-white border border-blue-300 rounded-md p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00206B]"
                                                    >
                                                        {NATIONALITY_OPTIONS.map(nat => (
                                                            <option key={nat.code} value={nat.code}>{nat.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Passport Expiry Date *</label>
                                                    <input
                                                        type="date"
                                                        value={p.passportExpiry || ''}
                                                        onChange={(e) => handlePassengerChange(idx, 'passportExpiry', e.target.value)}
                                                        required
                                                        className="w-full bg-white border border-blue-300 rounded-md p-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00206B]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Contact Details section */}
                            <div className="border-t border-slate-200 pt-6 space-y-4">
                                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                                    📞 Contact Details (For updates & tickets)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address *</label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="email"
                                                placeholder="rahul@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 pl-9 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#d8942f]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile Number *</label>
                                        <div className="flex gap-0">
                                            <div className="relative w-28 shrink-0" ref={dropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="w-full h-[46px] bg-slate-50 border border-slate-200 border-r-0 rounded-l-md px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#d8942f] flex items-center justify-between cursor-pointer"
                                                >
                                                    <span>{countryCode}</span>
                                                    <span className="text-[9px] text-slate-500">▼</span>
                                                </button>

                                                {isDropdownOpen && (
                                                    <div className="absolute left-0 top-[47px] w-48 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl z-50 rounded-md scrollbar-thin">
                                                        {countryCodes.map((item) => (
                                                            <div
                                                                key={item.code}
                                                                onClick={() => {
                                                                    setCountryCode(item.code);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/60 hover:text-[#00206B] cursor-pointer border-b border-slate-100/40 last:border-0"
                                                            >
                                                                {item.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="relative flex-1">
                                                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="tel"
                                                    placeholder="9876543210"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-r-md p-3 pl-9 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#d8942f] h-[46px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* GST Checkbox Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={needGst}
                                        onChange={(e) => setNeedGst(e.target.checked)}
                                        className="w-4 h-4 accent-[#00206B] border-slate-300 rounded focus:ring-0"
                                    />
                                    <span className="text-xs font-bold text-slate-700">Add GST Details (Optional for Business Travellers)</span>
                                </label>

                                {needGst && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">GSTIN Number</label>
                                            <input
                                                type="text"
                                                placeholder="29AAAAA0000A1Z5"
                                                value={gstNumber}
                                                onChange={(e) => setGstNumber(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-xs font-semibold text-slate-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                placeholder="Company Name Pvt Ltd"
                                                value={gstCompany}
                                                onChange={(e) => setGstCompany(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-xs font-semibold text-slate-900"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Form Button */}
                            <div className="pt-4 border-t border-slate-200">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-br from-[#f4b33e] to-[#f15a18] hover:from-[#ffc45a] hover:to-[#e94d10] text-white py-4 rounded-md font-extrabold text-sm tracking-wider uppercase transition-all shadow-[0_6px_14px_rgba(241,90,24,0.18)] flex items-center justify-center gap-2 active:scale-[0.99]"
                                >
                                    Next: Select Seats & In-Flight Meals <ChevronRight className="w-4 h-4" />
                                </button>
                                <p className="text-[11px] text-center text-slate-400 mt-2">
                                    🔒 Step 2 of 4 • Cleartrip Verified Passenger Registration
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Fare Summary & Cleartrip Verified Rules */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Fare Breakdown Card */}
                        {(() => {
                            const isMultiCity = flight?.isMultiCityCombined || (flight?.selectedSectorsList && flight.selectedSectorsList.length > 1);
                            const isRoundTrip = flight?.isRoundTripCombined;
                            const sectors = flight?.selectedSectorsList || [];

                            let price = flight?.price || 0;
                            let baseFare = flight?.baseFare || 0;
                            let taxes = flight?.taxes || 0;

                            if (isMultiCity && sectors.length > 0) {
                                // Sum up all sector prices for multi-city
                                const totalSectorsPrice = sectors.reduce((sum, s) => sum + (s.price || 0), 0);
                                if (totalSectorsPrice > 0) price = totalSectorsPrice;

                                const totalSectorsBase = sectors.reduce((sum, s) => sum + (s.baseFare || 0), 0);
                                baseFare = totalSectorsBase > 0 ? totalSectorsBase : Math.round(price * 0.82);

                                const totalSectorsTaxes = sectors.reduce((sum, s) => sum + (s.taxes || 0), 0);
                                taxes = totalSectorsTaxes > 0 ? totalSectorsTaxes : (price - baseFare);
                            } else if (isRoundTrip) {
                                price = flight?.price || ((flight?.outboundRawOption?.price || 0) + (flight?.returnRawOption?.price || 0));
                                baseFare = flight?.baseFare || Math.round(price * 0.82);
                                taxes = flight?.taxes || (price - baseFare);
                            } else {
                                const previewData = livePreview?.data?.data || livePreview?.data || livePreview;
                                const faresMap = previewData?.fares || {};
                                const activeFareId = flight.rawOption?.fareId || flight.fareId || flight.selectedFareId;
                                
                                let resolvedFare = null;
                                if (activeFareId && faresMap) {
                                    if (faresMap[activeFareId]) {
                                        resolvedFare = faresMap[activeFareId];
                                    } else {
                                        const matchedKey = Object.keys(faresMap).find(k => k === activeFareId || k.includes(activeFareId) || (activeFareId && activeFareId.includes(k)));
                                        if (matchedKey) resolvedFare = faresMap[matchedKey];
                                    }
                                }
                                if (!resolvedFare && faresMap && Object.keys(faresMap).length > 0) {
                                    resolvedFare = Object.values(faresMap)[0];
                                }

                                price = resolvedFare?.pricing?.totalPrice || resolvedFare?.pricing?.totalFare || flight.price;
                                baseFare = resolvedFare?.pricing?.totalBaseFare || resolvedFare?.pricing?.baseFare || flight.baseFare || Math.round(price * 0.82);
                                taxes = resolvedFare?.pricing?.totalTax || resolvedFare?.pricing?.tax || flight.taxes || (price - baseFare);
                            }

                            return (
                                <div className="bg-white border border-[#c9dcff] rounded-lg shadow-sm p-6">
                                    <div className="flex items-center gap-2 text-[#00206B] font-bold text-xs uppercase tracking-wider mb-4">
                                        <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                                            <Receipt className="w-3.5 h-3.5 text-[#00206B]" />
                                        </div>
                                        <span>FARE BREAKDOWN</span>
                                    </div>

                                    <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
                                        {isMultiCity && sectors.length > 1 ? (
                                            <>
                                                {sectors.map((sec, sIdx) => {
                                                    const seg = sec.segments?.[0] || {};
                                                    const legOrig = seg.origin || sec.origin || `Origin ${sIdx + 1}`;
                                                    const legDest = seg.destination || sec.destination || `Dest ${sIdx + 1}`;
                                                    const airline = seg.airlineName || sec.airlineName || `Leg ${sIdx + 1}`;
                                                    return (
                                                        <div key={sIdx} className="flex justify-between items-center py-0.5">
                                                            <span className="font-medium text-slate-700">
                                                                Leg {sIdx + 1}: {legOrig} ➔ {legDest} <span className="text-[10px] text-slate-400">({airline})</span>
                                                            </span>
                                                            <span className="font-semibold text-slate-900">₹{(sec.price || 0).toLocaleString()}</span>
                                                        </div>
                                                    );
                                                })}
                                                <div className="border-t border-dashed border-slate-200 my-2 pt-2"></div>
                                                <div className="flex justify-between">
                                                    <span>Total Base Fare ({adultsCount > 1 ? `${adultsCount} Adults` : 'Adult 1'})</span>
                                                    <span className="font-semibold text-slate-800">₹{baseFare.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Taxes & Government Fees</span>
                                                    <span className="font-semibold text-slate-800">₹{taxes.toLocaleString()}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between">
                                                    <span>Base Fare ({adultsCount > 1 ? `${adultsCount} Adults` : 'Adult 1'})</span>
                                                    <span className="font-semibold text-slate-800">₹{baseFare.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Taxes & Government Fees</span>
                                                    <span className="font-semibold text-slate-800">₹{taxes.toLocaleString()}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between">
                                            <span>B2B Convenience Partner Fee</span>
                                            <span className="text-emerald-600 font-bold">FREE</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Seat & Meal Selection</span>
                                            <span className="text-emerald-600 font-bold">INCLUDED</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <div>
                                            <span className="block text-xs font-bold text-slate-500 uppercase">Total Amount</span>
                                            <span className="text-xs text-emerald-600 font-bold">✓ Guaranteed Rate</span>
                                        </div>
                                        <span className="text-2xl font-black text-slate-950">₹{price.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Cleartrip Verified Flight Rules */}
                        <div className="bg-white border border-[#c9dcff] rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-2 text-[#00206B] font-bold text-xs uppercase tracking-wider mb-3">
                                <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                                    <Shield className="w-3.5 h-3.5 text-[#00206B]" />
                                </div>
                                <span>CANCELLATION &amp; FARE RULES</span>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-600">
                                <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span>Ticket Type</span>
                                    <strong className="text-emerald-600">{flight.isRefundable ? 'Refundable' : 'Non-Refundable'}</strong>
                                </div>

                                {loadingBenefits && (
                                    <div className="text-[11px] text-[#a86612] italic animate-pulse py-1">
                                        🔄 Loading live fare rules...
                                    </div>
                                )}

                                {(() => {
                                    const resolved = getResolvedBookingBenefits();
                                    if (!resolved) {
                                        return (
                                            <>
                                                <div className="flex justify-between py-1 border-b border-slate-100">
                                                    <span>Cancellation Penalty</span>
                                                    <span className="text-slate-800 font-semibold">As per Airline Policy</span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span>Date Change Fee</span>
                                                    <span className="text-slate-800 font-semibold">Standard Reschedule Fee</span>
                                                </div>
                                            </>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 pt-2">
                                            {/* Render Penalties */}
                                            {resolved.penaltiesList.map((pen, pIdx) => (
                                                <div key={pIdx} className="bg-slate-50/70 p-2.5 border border-slate-200/60 rounded-lg">
                                                    <div className="font-bold text-xs text-[#00206B] mb-1.5 flex items-center gap-1">
                                                        <span>{pen.type === 'Cancellation' ? '❌' : '🔄'} {pen.type} Rules</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                                                        {pen.timelines.map((time, tIdx) => (
                                                            <div key={tIdx} className="flex justify-between border-b border-slate-200/60 pb-0.5 last:border-0 last:pb-0">
                                                                <span>Within {time.timeLabel}:</span>
                                                                <span className="font-bold text-slate-900">{time.permittedLabel} ({time.amountStr})</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Render In-Flight Services */}
                                            {resolved.benefitsList.length > 0 && (
                                                <div className="bg-slate-50/70 p-2.5 border border-slate-200/60 rounded-lg">
                                                    <div className="font-bold text-xs text-[#00206B] mb-1.5 uppercase tracking-wider">
                                                        ⚡ In-Flight Services
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                                                        {resolved.benefitsList.map((ben, idx) => (
                                                            <span key={idx} className="block">
                                                                {ben.type === 'MEAL' ? '🍽️' : '💺'} {ben.description}: <strong className="font-bold text-slate-900">{ben.value}</strong>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Customer Support Trust Badge */}
                        <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 text-xs text-[#00206B] flex items-start gap-3">
                            <Award className="w-5 h-5 text-[#00206B] shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block">Instant Cleartrip E-Ticket</strong>
                                <span className="text-[11px] text-[#00206B]/80 mt-0.5 block">
                                    Your PNR will be issued immediately upon payment confirmation.
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* Slide-Over Drawer from Right (40% Width on Desktop) */}
            {isDrawerOpen && drawerData && (
                <div className="fixed inset-0 z-[999999] overflow-hidden" aria-labelledby="drawer-title" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Background Overlay */}
                        <div
                            className="absolute inset-0 touch-none bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
                            onClick={closeDrawer}
                        ></div>

                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <div className="pointer-events-auto w-screen max-w-[40vw] min-w-[360px] md:min-w-[440px]">
                                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl border-l border-slate-200 animate-slide-in-right">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 py-4 bg-[#00206B] text-white">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-md bg-[#d8942f] flex items-center justify-center text-[#00206B] font-black text-xs">
                                                ✈
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-bold text-white uppercase tracking-wider" id="drawer-title">
                                                    {drawerData.title}
                                                </h2>
                                                <span className="text-[11px] text-white/65 font-medium">Itinerary View • GoAirClass</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="rounded-md p-1.5 text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
                                            onClick={closeDrawer}
                                        >
                                            <span className="sr-only">Close panel</span>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Drawer Content Body */}
                                    <div className="p-6 flex flex-col gap-6">
                                        {/* Itinerary Timeline */}
                                        <FlightItineraryTimeline segments={drawerData.segments} />

                                        {/* Additional Policy Info */}
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                                <Info className="w-4 h-4 text-[#00206B]" /> Baggage &amp; Fare Policy
                                            </h4>
                                            {(() => {
                                                // Resolve live fare details from livePreview if available
                                                const previewData = livePreview?.data || livePreview;
                                                const faresMap = previewData?.fares || {};
                                                const activeFareId = drawerData.secFlight?.rawOption?.fareId || flight.rawOption?.fareId;
                                                const resolvedFare = faresMap[activeFareId] || Object.values(faresMap)[0];

                                                const resolvedBenefits = getResolvedBookingBenefits();
                                                const cabinBaggage = resolvedBenefits?.baggageList.find(b => b.type === 'Cabin')?.weight || drawerData.segments?.[0]?.cabinBaggage || '7 KG (1 Piece)';
                                                const checkInBaggage = resolvedBenefits?.baggageList.find(b => b.type === 'Check-in')?.weight || drawerData.segments?.[0]?.checkInBaggage || '15 KG (1 Piece)';

                                                let isRefundable = flight.isRefundable;
                                                if (resolvedFare && resolvedFare.refundable !== undefined) {
                                                    isRefundable = resolvedFare.refundable;
                                                }

                                                return (
                                                    <div className="text-xs text-slate-600 space-y-2">
                                                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                                                            <span>Cabin Baggage:</span>
                                                            <strong className="text-slate-900 font-bold">{cabinBaggage}</strong>
                                                        </div>
                                                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                                                            <span>Check-in Baggage:</span>
                                                            <strong className="text-slate-900 font-bold">{checkInBaggage}</strong>
                                                        </div>
                                                        <div className="flex justify-between py-1">
                                                            <span>Fare Type:</span>
                                                            <strong className="text-slate-900 font-bold uppercase">{isRefundable ? 'Refundable' : 'Non-Refundable'}</strong>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Bottom Action */}
                                    <div className="mt-auto p-4 bg-slate-50 border-t border-slate-200 text-right">
                                        <button
                                            type="button"
                                            onClick={closeDrawer}
                                            className="w-full bg-[#00206B] hover:bg-[#001548] text-white font-bold py-2.5 px-4 rounded-md text-xs uppercase tracking-wider transition-all cursor-pointer"
                                        >
                                            Close Details
                                        </button>
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
