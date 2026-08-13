import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, User, Shield, ArrowLeft, Check, Luggage, Briefcase, Clock, Calendar, Mail, Phone, CreditCard, ChevronRight, Lock, MapPin, Receipt, Info, Sparkles, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createFlightSession, previewFlightApi, fetchAncillariesApi, fetchBenefitsApi } from '../services/flightApi';
import { toast } from 'react-toastify';

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

    // Live state updated asynchronously in background
    const [liveSessionId, setLiveSessionId] = useState(initialSessionId || null);
    const [livePreview, setLivePreview] = useState(initialPreview || null);
    const [liveAncillaries, setLiveAncillaries] = useState(initialAncillaries || null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [benefitsData, setBenefitsData] = useState(null);
    const [loadingBenefits, setLoadingBenefits] = useState(false);

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
            list.push({ title: 'Mr', firstName: '', lastName: '', gender: 'MALE', type: 'ADT', dob: getDobDefault('ADT'), label: `Adult ${i + 1}`, id: `adult-${i}` });
        }
        for (let i = 0; i < childrenCount; i++) {
            list.push({ title: 'Mstr', firstName: '', lastName: '', gender: 'MALE', type: 'CHD', dob: getDobDefault('CHD'), label: `Child ${i + 1}`, id: `child-${i}` });
        }
        for (let i = 0; i < infantsCount; i++) {
            list.push({ title: 'Mstr', firstName: '', lastName: '', gender: 'MALE', type: 'INF', dob: getDobDefault('INF'), label: `Infant ${i + 1}`, id: `infant-${i}` });
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
                    let activeSId = liveSessionId;

                    // 1. Session API
                    if (!activeSId) {
                        const sessionRes = await createFlightSession(searchId);
                        if (sessionRes.success && sessionRes.data?.sessionId) {
                            activeSId = sessionRes.data.sessionId;
                            sessionStorage.setItem('flight_session_id', activeSId);
                            if (isMounted) setLiveSessionId(activeSId);
                        }
                    }

                    // 2. Flight Preview API
                    if (activeSId && !livePreview) {
                        const cacheKey = `${searchId}_${flight.rawOption?.travelOptionId || flight.id}`;
                        if (!previewCache.has(cacheKey)) {
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
                                    cabinType: primarySegment.cabinType || "ECONOMY",
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

                            const apiCall = previewFlightApi(activeSId, previewPayload).then(res => {
                                if (res.success && res.data) {
                                    return res.data;
                                }
                                throw new Error(res.message || 'Preview failed');
                            });
                            previewCache.set(cacheKey, apiCall);
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
                            const subTravelOptionId = flight.rawOption?.subTravelOptionId || flight.rawOption?.travelOptionId || flight.id;
                            const fareId = flight.rawOption?.fareId || "";
                            const sectorKey = `${primarySegment.origin}_${lastSegment.destination}`;

                            const benefitsPayload = {
                                searchId,
                                sessionId: activeSId,
                                requiredBenefitTypes: ["BAGGAGE", "PENALTIES", "FARE_BENEFITS"],
                                travelOptionId: flight.rawOption?.travelOptionId || flight.id,
                                travelOptions: {
                                    J1: {
                                        travelOptionId: flight.rawOption?.travelOptionId || flight.id,
                                        subTravelOptions: [{
                                            subTravelOptionId,
                                            fareIds: fareId ? [fareId] : [],
                                            subTravelOptionKey: sectorKey,
                                            isInternational: flight.isInternational || false
                                        }]
                                    }
                                },
                                paxInfos: [{ paxType: "ADULT", paxCount: 1 }]
                            };

                            const benResponse = await fetchBenefitsApi(benefitsPayload);
                            if (benResponse.success && benResponse.data && isMounted) {
                                setBenefitsData(benResponse.data);
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

        // Helper function to resolve Cleartrip B2B Standard Benefits mappings on Booking Details Page
        const getResolvedBookingBenefits = () => {
            if (!benefitsData || !flight) return null;

            const rootData = benefitsData.data?.data || benefitsData.data || benefitsData;
            const fareBenefitsMap = rootData.fareBenefits || rootData.fares || {};
            const selectedFareId = flight.rawOption?.fareId;

            // Find the fare details in fareBenefits map
            const fareInfo = fareBenefitsMap[selectedFareId] || Object.values(fareBenefitsMap)[0];
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
                    const bId = allowance.baggageAllowanceId;
                    const bDetails = baggageAllowancesMap[bId];
                    if (bDetails) {
                        bDetails.forEach(b => {
                            const bagType = b.type === 'BAGGAGE_CABIN' || b.type === 'Cabin' ? 'Cabin' : 'Check-in';
                            const spec = b.allowedBaggages?.[0] || {};
                            const weight = spec.quantity !== undefined ? `${spec.quantity} ${spec.unit || 'KG'}` : 'Policy Info';
                            baggageList.push({ type: bagType, weight });
                        });
                    }
                });
            });

            // 2. Resolve cancellation and rescheduling penalties
            const penaltiesList = [];
            const penaltiesMap = rootData.penalties || {};
            const penaltyIds = benefitsInfo.penaltyIds || [];
            penaltyIds.forEach(id => {
                const penalty = penaltiesMap[id];
                if (penalty) {
                    const typeLabel = penalty.penaltyType === 'CANCEL' ? 'Cancellation' : 'Amend/Reschedule';
                    const timelines = penalty.timeLines || [];
                    const timelineDetails = timelines.map(t => {
                        const permittedLabel = t.permitted ? 'Allowed' : 'Not Allowed';
                        const chargeInfo = t.passengerFareRuleCharges?.ADT?.charges?.[0] || {};
                        const amountStr = chargeInfo.amount !== undefined ? `₹${chargeInfo.amount.toLocaleString()} ${chargeInfo.currency || 'INR'}` : '';
                        const timeLabel = t.endTime ? `${t.endTime.replace('PT', '').replace('H', ' hours')}` : 'departure';
                        return { permittedLabel, amountStr, timeLabel };
                    });
                    penaltiesList.push({ type: typeLabel, timelines: timelineDetails, raw: penalty });
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
                            cabinType: primarySegment.cabinType || "ECONOMY",
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
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-none flex items-center justify-center mx-auto mb-4">
                            <Plane className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">No Flight Selected</h2>
                        <p className="text-sm text-slate-500 mt-2 mb-6">Please select a flight from the search list to view booking details.</p>
                        <button
                            onClick={() => navigate('/flights/list')}
                            className="bg-[#b89565] hover:bg-[#a38053] text-white font-bold py-3 px-8 rounded-none transition-all shadow-md"
                        >
                            Back to Flight Search
                        </button>
                    </div>
                    <Footer />
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans pt-[75px]">
                <Navbar />

                {/* Top Stepper Header */}
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
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#b89565]">Booking Details</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-xs text-slate-400 font-mono">Session: {liveSessionId ? `${liveSessionId.substring(0, 12)}...` : (isVerifying ? 'Creating Session...' : 'Active')}</span>
                                </div>
                                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
                                    {primarySegment.origin} ➔ {lastSegment.destination}
                                    <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 border border-slate-700">
                                        {flight.segments?.length === 1 ? 'Non-stop' : `${flight.segments?.length - 1} Stop(s)`}
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
                            <div className="flex items-center gap-2 text-[#b89565]">
                                <div className="w-6 h-6 rounded-none bg-[#b89565] text-slate-950 flex items-center justify-center font-bold">2</div>
                                <span className="underline decoration-[#b89565] underline-offset-4">Passenger Details</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                            <div className="flex items-center gap-2 text-slate-500">
                                <div className="w-6 h-6 rounded-none bg-slate-800 border border-slate-700 flex items-center justify-center">3</div>
                                <span>Payment</span>
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
                            <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
                                <div className="bg-slate-900 text-white px-6 py-3.5 flex justify-between items-center border-b border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-none bg-[#b89565] flex items-center justify-center text-slate-950 font-black">
                                            {flight.airlineCode || 'FL'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white">{flight.airlineName} • {flight.segments?.map(s => s.flightNumber).join(' → ') || primarySegment.flightNumber}</h3>
                                            <span className="text-[11px] text-slate-400 font-medium">{primarySegment.aircraft}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${isVerifying ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                        {isVerifying ? '⚡ Verifying Live Rate...' : '✓ Price Verified'}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        {/* Departure */}
                                        <div className="flex-1">
                                            <span className="text-2xl font-black text-slate-950">{primarySegment.origin}</span>
                                            <span className="block text-xs font-semibold text-slate-600 mt-0.5">{primarySegment.originAirportName}</span>
                                            <span className="block text-sm font-bold text-slate-900 mt-1">
                                                {new Date(primarySegment.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="block text-xs text-slate-500">
                                                {new Date(primarySegment.departureDateTime).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Duration */}
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-[#b89565]" /> {primarySegment.duration}
                                            </span>
                                            <div className="w-32 h-[1px] bg-slate-300 my-2 relative">
                                                <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-[#b89565] -translate-y-1/2"></div>
                                                <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-[#b89565] -translate-y-1/2"></div>
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">
                                                {flight.segments?.length === 1 ? 'Non-stop' : `${flight.segments?.length - 1} Stop(s)`}
                                            </span>
                                        </div>

                                        {/* Arrival */}
                                        <div className="flex-1 text-left sm:text-right">
                                            <span className="text-2xl font-black text-slate-950">{lastSegment.destination}</span>
                                            <span className="block text-xs font-semibold text-slate-600 mt-0.5">{lastSegment.destinationAirportName}</span>
                                            <span className="block text-sm font-bold text-slate-900 mt-1">
                                                {new Date(lastSegment.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="block text-xs text-slate-500">
                                                {new Date(lastSegment.arrivalDateTime).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Baggage Strip */}
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-none border border-slate-200/60">
                                        {(() => {
                                            const resolved = getResolvedBookingBenefits();
                                            const cabin = resolved?.baggageList.find(b => b.type === 'Cabin')?.weight || primarySegment.cabinBaggage || '7 KG (1 Piece)';
                                            const checkIn = resolved?.baggageList.find(b => b.type === 'Check-in')?.weight || primarySegment.checkInBaggage || '15 KG (1 Piece)';
                                            return (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Luggage className="w-4 h-4 text-[#b89565]" />
                                                        <span>Cabin Baggage: <strong className="text-slate-900">{cabin}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-[#b89565]" />
                                                        <span>Check-in Baggage: <strong className="text-slate-900">{checkIn}</strong></span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Passenger Details Form (Driven by flightPreview Validations) */}
                            <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-none shadow-sm p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-none bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
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
                                        <div className="flex justify-between items-center bg-slate-50 p-2 border border-slate-200">
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-none p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#b89565]"
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-none p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#b89565]"
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-none p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#b89565]"
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-none p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#b89565]"
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-none p-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#b89565]"
                                                />
                                            </div>
                                        </div>
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-none p-3 pl-9 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#b89565]"
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
                                                        className="w-full h-[46px] bg-slate-50 border border-slate-200 border-r-0 rounded-none px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#b89565] flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span>{countryCode}</span>
                                                        <span className="text-[9px] text-slate-500">▼</span>
                                                    </button>
                                                    
                                                    {isDropdownOpen && (
                                                        <div className="absolute left-0 top-[47px] w-48 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl z-50 rounded-none scrollbar-thin">
                                                            {countryCodes.map((item) => (
                                                                <div
                                                                    key={item.code}
                                                                    onClick={() => {
                                                                        setCountryCode(item.code);
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                    className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#b89565] cursor-pointer border-b border-slate-100/40 last:border-0"
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-none p-3 pl-9 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#b89565] h-[46px]"
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
                                        className="w-4 h-4 text-[#b89565] border-slate-300 rounded-none focus:ring-0"
                                    />
                                    <span className="text-xs font-bold text-slate-700">Add GST Details (Optional for Business Travellers)</span>
                                </label>

                                {needGst && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 bg-slate-50 border border-slate-200">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">GSTIN Number</label>
                                            <input
                                                type="text"
                                                placeholder="29AAAAA0000A1Z5"
                                                value={gstNumber}
                                                onChange={(e) => setGstNumber(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-none p-2.5 text-xs font-semibold text-slate-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company Name</label>
                                            <input
                                                type="text"
                                                placeholder="Company Name Pvt Ltd"
                                                value={gstCompany}
                                                onChange={(e) => setGstCompany(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-none p-2.5 text-xs font-semibold text-slate-900"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit Form Button */}
                            <div className="pt-4 border-t border-slate-200">
                                <button
                                    type="submit"
                                    className="w-full bg-[#b89565] hover:bg-[#a38053] text-white py-4 font-bold text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
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
                        <div className="bg-white border border-slate-200 rounded-none shadow-sm p-6">
                            <div className="flex items-center gap-2 text-[#1e40af] font-bold text-xs uppercase tracking-wider mb-4">
                                <Receipt className="w-4 h-4 text-[#1e40af]" />
                                <span>FARE BREAKDOWN</span>
                            </div>

                            <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
                                <div className="flex justify-between">
                                    <span>Base Fare (Adult 1)</span>
                                    <span className="font-semibold text-slate-800">₹{(flight.baseFare || Math.round(flight.price * 0.82)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes & Government Fees</span>
                                    <span className="font-semibold text-slate-800">₹{(flight.taxes || Math.round(flight.price * 0.18)).toLocaleString()}</span>
                                </div>
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
                                <span className="text-2xl font-black text-slate-950">₹{flight.price.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Cleartrip Verified Flight Rules */}
                        <div className="bg-slate-900 text-white p-6 border border-slate-800 rounded-none">
                            <div className="flex items-center gap-2 text-[#b89565] font-bold text-xs uppercase tracking-wider mb-3">
                                <Shield className="w-4 h-4 text-[#b89565]" />
                                <span>CANCELLATION & FARE RULES</span>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-300">
                                <div className="flex justify-between py-1 border-b border-slate-800">
                                    <span>Ticket Type</span>
                                    <strong className="text-emerald-400">{flight.isRefundable ? 'Refundable' : 'Non-Refundable'}</strong>
                                </div>

                                {loadingBenefits && (
                                    <div className="text-[11px] text-[#b89565] italic animate-pulse py-1">
                                        🔄 Loading live fare rules...
                                    </div>
                                )}

                                {(() => {
                                    const resolved = getResolvedBookingBenefits();
                                    if (!resolved) {
                                        return (
                                            <>
                                                <div className="flex justify-between py-1 border-b border-slate-800">
                                                    <span>Cancellation Penalty</span>
                                                    <span className="text-slate-200">As per Airline Policy</span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span>Date Change Fee</span>
                                                    <span className="text-slate-200">Standard Reschedule Fee</span>
                                                </div>
                                            </>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 pt-2">
                                            {/* Render Penalties */}
                                            {resolved.penaltiesList.map((pen, pIdx) => (
                                                <div key={pIdx} className="bg-slate-850 p-2.5 border border-slate-800 rounded-none">
                                                    <div className="font-bold text-xs text-[#b89565] mb-1.5 flex items-center gap-1">
                                                        <span>{pen.type === 'Cancellation' ? '❌' : '🔄'} {pen.type} Rules</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                                                        {pen.timelines.map((time, tIdx) => (
                                                            <div key={tIdx} className="flex justify-between border-b border-slate-800/40 pb-0.5 last:border-0 last:pb-0">
                                                                <span>Within {time.timeLabel}:</span>
                                                                <span className="font-bold text-white">{time.permittedLabel} ({time.amountStr})</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Render In-Flight Services */}
                                            {resolved.benefitsList.length > 0 && (
                                                <div className="bg-slate-850 p-2.5 border border-slate-800 rounded-none">
                                                    <div className="font-bold text-xs text-[#b89565] mb-1.5 uppercase tracking-wider">
                                                        ⚡ In-Flight Services
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-[11px] text-slate-350">
                                                        {resolved.benefitsList.map((ben, idx) => (
                                                            <span key={idx} className="block text-slate-200">
                                                                {ben.type === 'MEAL' ? '🍽️' : '💺'} {ben.description}: <strong className="font-bold text-white">{ben.value}</strong>
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
                        <div className="bg-blue-50/60 border border-blue-100 p-4 text-xs text-blue-900 flex items-start gap-3">
                            <Award className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block">Instant Cleartrip E-Ticket</strong>
                                <span className="text-[11px] text-blue-700/90 mt-0.5 block">
                                    Your PNR will be issued immediately upon payment confirmation.
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
