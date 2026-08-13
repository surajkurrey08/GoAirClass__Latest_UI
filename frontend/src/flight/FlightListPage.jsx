import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plane, Calendar, Users, Briefcase, ArrowLeft, ArrowLeftRight, Clock, Shield, AlertCircle, Compass, HelpCircle, Check, Filter, RotateCcw, Luggage, ChevronLeft, ChevronRight, MapPin, Receipt, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchFlights, createFlightSession, previewFlightApi, fetchAncillariesApi, fetchBulkBenefitsApi } from '../services/flightApi';
import { toast } from 'react-toastify';

export default function FlightListPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Parse URL params
    const fromVal = searchParams.get('from') || 'Bangalore (BLR)';
    const toVal = searchParams.get('to') || 'Mumbai (BOM)';
    const dateVal = searchParams.get('date') || '';
    const returnDateVal = searchParams.get('returnDate') || '';
    const tripTypeVal = searchParams.get('tripType') || 'oneWay';
    const cabinVal = searchParams.get('cabin') || 'Economy';
    const travellersVal = searchParams.get('travellers') || '1 Adult';

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [allOutboundFlights, setAllOutboundFlights] = useState([]);
    const [allReturnFlights, setAllReturnFlights] = useState([]);
    const [selectedOutbound, setSelectedOutbound] = useState(null);
    const [selectionMode, setSelectionMode] = useState('oneWay'); // 'oneWay' | 'outbound' | 'return'

    // Selected flight detail states
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [previewFlight, setPreviewFlight] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [bulkBenefits, setBulkBenefits] = useState(null);
    const [loadingBenefits, setLoadingBenefits] = useState(false);
    const [searchId, setSearchId] = useState(null);
    const [dataId, setDataId] = useState(null);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [allFares, setAllFares] = useState({});
    const [allBenefits, setAllBenefits] = useState(null);
    const [selectedFareId, setSelectedFareId] = useState(null);
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
            const cabinType = getCabinType(cabinVal);

            const adults = Number(searchParams.get('adults')) || 1;
            const children = Number(searchParams.get('children')) || 0;
            const infants = Number(searchParams.get('infants')) || 0;

            const paxInfos = [
                { paxType: "ADT", paxCount: adults, paxFareType: "DEFAULT" },
                children > 0 ? { paxType: "CHD", paxCount: children, paxFareType: "DEFAULT" } : null,
                infants > 0 ? { paxType: "INF", paxCount: infants, paxFareType: "DEFAULT" } : null
            ].filter(Boolean);

            const sectors = [
                {
                    index: 1,
                    origin: originCode,
                    destination: destCode,
                    departDate: formattedDate || new Date().toLocaleDateString('en-GB'),
                    cabinType: cabinType,
                    paxInfos
                }
            ];

            const returnDateFormatted = formatDateToDDMMYYYY(returnDateVal);
            if (tripTypeVal === 'roundTrip' && returnDateFormatted) {
                sectors.push({
                    index: 2,
                    origin: destCode,
                    destination: originCode,
                    departDate: returnDateFormatted,
                    cabinType: cabinType,
                    paxInfos
                });
            }

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
                    sectors
                }
            };

            const response = await searchFlights(payload);

            if (response.success && response.data) {
                // Denormalize Cleartrip response (support response.data or response.data.data)
                const apiData = response.data.data || response.data || {};
                if (apiData.searchId) {
                    setSearchId(apiData.searchId);
                }
                if (apiData.dataId) {
                    setDataId(apiData.dataId);
                }

                const processed = [];

                const flightsDict = apiData.flights || {};
                const subTravelOptionsDict = apiData.subTravelOptions || {};
                const faresDict = apiData.fares || {};
                const airlinesDict = apiData.metaData?.airlineDetail?.airlines || apiData.airlines || {};
                const baggageAllowancesDict = apiData.baggageAllowances || apiData.metaData?.baggageAllowanceDetail?.baggageAllowances || apiData.metaData?.baggageAllowances || {};
                const equipmentsDict = apiData.metaData?.equipmentDetail?.equipments || apiData.equipments || apiData.metaData?.equipments || {};
                const airportsDict = apiData.metaData?.airportDetail?.airports || apiData.airports || {};
                const benefitsDict = apiData.benefits || apiData.metaData?.benefits || {};

                const parseOptionsList = (optionsArray) => {
                    const processed = [];
                    for (const option of optionsArray) {
                        if (!option) continue;
                        const association = option.defaultFare?.associations?.[0] || option.associations?.[0];
                        const subTravelOptionId = association?.subTravelOptionId || option.subTravelOptionId || option.subTravelOptionIds?.[0] || option.travelOptionId;
                        const subTravelOption = subTravelOptionsDict[subTravelOptionId] || option.subTravelOption || option;

                        const fareId = association?.fareId || option.fareId;
                        const fare = faresDict[fareId] || option.defaultFare || option.fare || {};
                        const price = fare?.pricing?.totalPrice || fare?.pricing?.totalFare || fare?.totalPrice || option.pricing?.totalPrice || option.price || option.defaultFare?.pricing?.totalPrice || 0;
                        const isRefundable = fare?.refundable !== undefined ? fare.refundable : (association?.refundable !== undefined ? association.refundable : true);

                        const rawFlightFares = fare?.subTravelOptionFare?.[0]?.flightFare || fare?.flightFares || [];
                        const flightFares = Array.isArray(rawFlightFares) ? rawFlightFares : [rawFlightFares];

                        const benefitIds = fare?.benefitIds || [];
                        let resolvedBenefits = benefitIds
                            .map(id => benefitsDict[id])
                            .filter(Boolean)
                            .map(b => ({
                                type: b.benefitType || 'BENEFIT',
                                value: b.value || '',
                                description: b.description || b.shortDescription || b.value || b.benefitType
                            }));

                        const parsedBrandFromFareId = typeof fareId === 'string' ? fareId.split('__')[11] : null;
                        const brandName = flightFares[0]?.identifiers?.brandName || fare?.fareName || (parsedBrandFromFareId && !parsedBrandFromFareId.startsWith('AVN') ? parsedBrandFromFareId.replace(',', ' / ') : '');

                        if (resolvedBenefits.length === 0 && isRefundable !== undefined) {
                            resolvedBenefits = [
                                { type: 'FARE_RULE', value: isRefundable ? 'REFUNDABLE' : 'NON_REFUNDABLE', description: isRefundable ? 'Refund Allowed as per Fare Rules' : 'Non-Refundable Fare' }
                            ];
                        }

                        const sequenceToFlightIdMap = subTravelOption?.sequenceToFlightIdMap || option?.sequenceToFlightIdMap || {};
                        let sortedSequenceKeys = Object.keys(sequenceToFlightIdMap).sort((a, b) => Number(a) - Number(b));
                        let flightIdsList = sortedSequenceKeys.map(key => sequenceToFlightIdMap[key]).filter(Boolean);

                        if (flightIdsList.length === 0) {
                            flightIdsList = subTravelOption?.flightIds || option?.flightIds || (subTravelOption?.flights ? subTravelOption.flights.map(f => typeof f === 'string' ? f : (f.flightId || f.id)) : []);
                        }

                        if (flightIdsList.length === 0 && option.flightId) {
                            flightIdsList = [option.flightId];
                        }

                        const segments = flightIdsList.map(flightId => {
                            const flt = flightsDict[flightId] || (typeof flightId === 'object' ? flightId : {});
                            const fId = typeof flightId === 'string' ? flightId : (flt.flightId || flt.id || 'FL');
                            const airlineCode = flt.airlineCode || 'AI';
                            const airlineName = airlinesDict[airlineCode]?.name || flt.airlineName || airlineCode;

                            const flightFare = (Array.isArray(flightFares) ? flightFares.find(ff => ff?.flightId === fId) : null) || flightFares[0] || {};

                            const baggageAllowanceList = flightFare?.baggageAllowances || fare?.baggageAllowances || flt.baggageAllowances || subTravelOption?.baggageAllowances || option?.baggageAllowances || [];
                            let cabinBag = null;
                            let checkInBag = null;

                            const rawList = Array.isArray(baggageAllowanceList) ? baggageAllowanceList : (baggageAllowanceList ? [baggageAllowanceList] : []);
                            for (const bItem of rawList) {
                                if (!bItem) continue;
                                const bId = typeof bItem === 'string' ? bItem : (bItem.baggageAllowanceId || bItem.id || bItem.code);
                                const baggageData = (bId && baggageAllowancesDict[bId]) ? baggageAllowancesDict[bId] : bItem;
                                if (!baggageData) continue;

                                const baggageArr = Array.isArray(baggageData)
                                    ? baggageData
                                    : (Array.isArray(baggageData.baggageAllowance)
                                        ? baggageData.baggageAllowance
                                        : (Array.isArray(baggageData.allowedBaggages) ? [baggageData] : (typeof baggageData === 'object' ? [baggageData] : [])));

                                for (const b of baggageArr) {
                                    if (!b || typeof b !== 'object') continue;
                                    const bType = String(b.type || b.baggageType || b.category || '').toUpperCase();
                                    const allowance = (Array.isArray(b.allowedBaggages) ? b.allowedBaggages[0] : null) || b;

                                    if (!cabinBag && (bType.includes('CABIN') || bType.includes('HAND'))) {
                                        cabinBag = allowance;
                                    }
                                    if (!checkInBag && (bType.includes('CHECK') || bType.includes('HOLD') || bType.includes('MAIN'))) {
                                        checkInBag = allowance;
                                    }
                                }
                            }

                            const formatBag = (bagObj, defaultVal) => {
                                if (!bagObj) return defaultVal;
                                if (typeof bagObj === 'string') return bagObj;
                                const qty = bagObj.quantity ?? bagObj.amount ?? bagObj.weight ?? bagObj.value ?? bagObj.count;
                                const unit = bagObj.unit ?? bagObj.measurementUnit ?? bagObj.unitType ?? 'KG';
                                const piece = bagObj.piece ?? bagObj.pieces ?? bagObj.pieceCount;
                                if (qty !== undefined && qty !== null && qty !== '') {
                                    const pieceSuffix = piece ? ` (${piece} ${piece > 1 ? 'Pieces' : 'Piece'})` : '';
                                    return `${qty} ${unit}${pieceSuffix}`;
                                }
                                return bagObj.description || bagObj.allowance || defaultVal;
                            };

                            const cabinBaggageStr = formatBag(cabinBag, '7 KG (1 Piece)');
                            const checkInBaggageStr = formatBag(checkInBag, '15 KG (1 Piece)');

                            const equipmentKey = flt.equipment || flt.equipmentCode || flt.equipmentType;
                            const equipmentObj = (equipmentKey && equipmentsDict[equipmentKey]) ? equipmentsDict[equipmentKey] : (typeof flt.equipment === 'object' ? flt.equipment : null);

                            const aircraftVal =
                                flt.aircraftType ||
                                flt.aircraftName ||
                                (typeof flt.aircraft === 'string' ? flt.aircraft : (flt.aircraft?.name || flt.aircraft?.type || flt.aircraft?.model)) ||
                                flt.equipmentName ||
                                flt.equipmentType ||
                                (typeof flt.equipment === 'string' && isNaN(Number(flt.equipment)) ? flt.equipment : null) ||
                                equipmentObj?.name ||
                                equipmentObj?.equipmentName ||
                                equipmentObj?.type ||
                                equipmentObj?.description ||
                                null;

                            const origCode = flt.departureAirport?.code || 'BLR';
                            const destCode = flt.arrivalAirport?.code || 'BOM';
                            const origTime = flt.departureAirport?.time || new Date().toISOString();
                            const destTime = flt.arrivalAirport?.time || new Date().toISOString();

                            let durationStr = '';
                            if (origTime && destTime) {
                                const diffMs = new Date(destTime) - new Date(origTime);
                                if (diffMs > 0) {
                                    const totalMins = Math.floor(diffMs / (1000 * 60));
                                    const hrs = Math.floor(totalMins / 60);
                                    const mins = totalMins % 60;
                                    durationStr = `${hrs}h ${mins}m`;
                                }
                            }

                            const origAirportObj = airportsDict[origCode];
                            const destAirportObj = airportsDict[destCode];
                            const originAirportName = origAirportObj ? `${origAirportObj.name || origAirportObj.cityName || origCode}, ${origAirportObj.city || origAirportObj.cityName || ''}` : `${origCode} Airport`;
                            const destinationAirportName = destAirportObj ? `${destAirportObj.name || destAirportObj.cityName || destCode}, ${destAirportObj.city || destAirportObj.cityName || ''}` : `${destCode} Airport`;

                            return {
                                id: fId,
                                flightNumber: flt.fltNo ? `${airlineCode}-${flt.fltNo}` : fId,
                                airlineCode,
                                airlineName,
                                origin: origCode,
                                destination: destCode,
                                departureDateTime: origTime,
                                arrivalDateTime: destTime,
                                duration: durationStr || '2h 0m',
                                originAirportName,
                                destinationAirportName,
                                cabinType: flightFare?.identifiers?.cabinType || 'ECONOMY',
                                brandName: flightFare?.identifiers?.brandName || brandName || '',
                                aircraft: aircraftVal || 'Not Available',
                                availableSeats: flightFare?.identifiers?.availableSeatCount || null,
                                cabinBaggage: cabinBaggageStr,
                                checkInBaggage: checkInBaggageStr,
                            };
                        });

                        if (segments.length === 0) continue;

                        const pricing = fare?.pricing || {};
                        const baseFareVal = pricing.basePrice || pricing.baseFare || pricing.basicFare || Math.round(price * 0.82);
                        const taxVal = pricing.taxPrice || pricing.tax || pricing.taxes || Math.round(price * 0.18);

                        processed.push({
                            id: option.travelOptionId || option.id || Math.random().toString(),
                            segments,
                            price,
                            baseFare: baseFareVal,
                            taxes: taxVal,
                            isRefundable,
                            airlineName: segments[0].airlineName,
                            airlineCode: segments[0].airlineCode,
                            stopsCount: segments.length - 1,
                            benefits: resolvedBenefits,
                            rawOption: {
                                travelOptionId: option.travelOptionId || subTravelOptionId,
                                subTravelOptionId,
                                fareId
                            }
                        });
                    }
                    return processed;
                };

                let rawJ1 = [];
                let rawJ2 = [];

                if (apiData.travelOptions && typeof apiData.travelOptions === 'object' && !Array.isArray(apiData.travelOptions)) {
                    rawJ1 = apiData.travelOptions.J1 || apiData.travelOptions.j1 || [];
                    rawJ2 = apiData.travelOptions.J2 || apiData.travelOptions.j2 || [];
                } else if (Array.isArray(apiData.travelOptions)) {
                    rawJ1 = apiData.travelOptions;
                }

                const processedJ1 = parseOptionsList(rawJ1);
                const processedJ2 = parseOptionsList(rawJ2);

                setAllFares(faresDict);
                setAllBenefits(apiData.benefits || null);
                setAllOutboundFlights(processedJ1);
                setAllReturnFlights(processedJ2);
                setFlights(processedJ1);

                if (tripTypeVal === 'roundTrip' && processedJ2.length > 0) {
                    setSelectionMode('outbound');
                } else {
                    setSelectionMode('oneWay');
                }

                const prices = processedJ1.map(f => f.price);
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
            let displayMsg = 'Failed to connect to search service. Please try again.';
            if (err.response?.data) {
                const rawMsg = err.response.data.message || err.response.data.errorMessage || err.response.data.error;
                if (rawMsg) {
                    displayMsg = typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : rawMsg;
                }
            } else if (err.message) {
                displayMsg = `Data processing error: ${err.message}`;
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
        if (selectionMode === 'outbound') {
            setSelectedOutbound(flight);
            // Switch to return flights list
            setFlights(allReturnFlights);
            setSelectionMode('return');
            setIsDrawerOpen(false);
            setPreviewFlight(null);
            toast.success("Outbound flight selected! Now choose your return flight.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (selectionMode === 'return') {
            const adultsCount = Number(searchParams.get('adults')) || 1;
            const childrenCount = Number(searchParams.get('children')) || 0;
            const infantsCount = Number(searchParams.get('infants')) || 0;

            const combinedFlight = {
                id: `${selectedOutbound.id}_${flight.id}`,
                outboundTravelId: selectedOutbound.id,
                returnTravelId: flight.id,
                segments: [...selectedOutbound.segments, ...flight.segments],
                price: selectedOutbound.price + flight.price,
                baseFare: (selectedOutbound.baseFare || 0) + (flight.baseFare || 0),
                taxes: (selectedOutbound.taxes || 0) + (flight.taxes || 0),
                airlineCode: selectedOutbound.airlineCode,
                airlineName: `${selectedOutbound.airlineName} / ${flight.airlineName}`,
                benefits: [...(selectedOutbound.benefits || []), ...(flight.benefits || [])],
                isRefundable: selectedOutbound.isRefundable && flight.isRefundable,
                outboundRawOption: selectedOutbound.rawOption,
                returnRawOption: flight.rawOption,
                isRoundTripCombined: true,
                outboundSegmentsCount: selectedOutbound.segments.length
            };

            navigate('/flight/booking-details', {
                state: {
                    flight: combinedFlight,
                    searchId,
                    dataId,
                    adultsCount,
                    childrenCount,
                    infantsCount
                }
            });
        } else {
            const adultsCount = Number(searchParams.get('adults')) || 1;
            const childrenCount = Number(searchParams.get('children')) || 0;
            const infantsCount = Number(searchParams.get('infants')) || 0;

            navigate('/flight/booking-details', {
                state: {
                    flight,
                    searchId,
                    dataId,
                    adultsCount,
                    childrenCount,
                    infantsCount
                }
            });
        }
    };

    // Helper function to resolve Cleartrip B2B Bulk Benefits mappings
    const getResolvedBenefits = (specificFareId) => {
        if (!bulkBenefits || !previewFlight) return null;

        const fares = bulkBenefits.data?.fares || bulkBenefits.fares || {};
        const currentFareId = specificFareId || selectedFareId || previewFlight.rawOption?.fareId;
        const fareInfo = fares[currentFareId];
        if (!fareInfo) return null;

        // Try to get subTravelOptionBenefits (keyed by sector, e.g., "BLR_BOM")
        const sectorKey = `${previewFlight.segments?.[0]?.origin}_${previewFlight.segments?.[previewFlight.segments.length - 1]?.destination}`;
        const subTravelOptionBenefits = fareInfo.subTravelOptionBenefits?.[sectorKey] || Object.values(fareInfo.subTravelOptionBenefits || {})[0];
        const benefitsInfo = subTravelOptionBenefits?.benefits || subTravelOptionBenefits || {};

        // 1. Resolve baggage allowances
        const baggageList = [];
        const baggageAllowancesMap = bulkBenefits.data?.baggageAllowances || bulkBenefits.baggageAllowances || {};

        // Find baggage mappings in flightBenefits
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
        const penaltiesMap = bulkBenefits.data?.penalties || bulkBenefits.penalties || {};
        const penaltyIds = benefitsInfo.penaltyIds || [];
        penaltyIds.forEach(id => {
            const penalty = penaltiesMap[id];
            if (penalty) {
                const typeLabel = penalty.penaltyType === 'CANCEL' ? 'Cancellation' : 'Amend/Reschedule';
                // Parse timelines
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
        const benefitsMap = bulkBenefits.data?.benefits || bulkBenefits.benefits || {};
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

        // Remove duplicates if any
        const uniqueBaggage = Array.from(new Map(baggageList.map(item => [item.type + item.weight, item])).values());

        return { baggageList: uniqueBaggage, penaltiesList, benefitsList };
    };


    const handleCardClick = (flight) => {
        setPreviewFlight(flight);
        setSelectedFareId(flight.rawOption?.fareId || null);
        setIsDrawerOpen(true);

        const flightIds = flight.segments.map(s => s.id);
        const fareIdsToFetch = Object.entries(allFares).filter(([fareId, fareData]) => {
            if (!fareData.subTravelOptionFare) return false;
            return fareData.subTravelOptionFare.some(sto => {
                if (!sto.flightFare) return false;
                const stoFlightIds = sto.flightFare.map(ff => ff.flightId);
                return stoFlightIds.length === flightIds.length && stoFlightIds.every(id => flightIds.includes(id));
            });
        }).map(([fareId]) => fareId);

        // Fetch Bulk Benefits dynamically for this flight inside the drawer
        if (dataId && fareIdsToFetch.length > 0) {
            setLoadingBenefits(true);
            setBulkBenefits(null);
            fetchBulkBenefitsApi({
                dataId,
                searchId,
                fareIds: fareIdsToFetch,
                requiredBenefitTypes: ["BAGGAGE", "PENALTIES", "FARE_BENEFITS"]
            }).then(res => {
                if (res.success && res.data) {
                    setBulkBenefits(res.data);
                }
            }).catch(err => {
                // Keep minimal error logging
                console.warn('Failed to fetch benefits details:', err.message);
            }).finally(() => {
                setLoadingBenefits(false);
            });
        }
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            setPreviewFlight(null);
            setSelectedFareId(null);
        }, 1000);
    };

    // Calculate available fares for previewFlight
    const availableFares = React.useMemo(() => {
        if (!previewFlight || !allFares) return [];
        const flightIds = previewFlight.segments.map(s => s.id);
        const matchedFares = Object.entries(allFares).filter(([fareId, fareData]) => {
            if (!fareData.subTravelOptionFare) return false;
            return fareData.subTravelOptionFare.some(sto => {
                if (!sto.flightFare) return false;
                const stoFlightIds = sto.flightFare.map(ff => ff.flightId);
                return stoFlightIds.length === flightIds.length && stoFlightIds.every(id => flightIds.includes(id));
            });
        }).map(([fareId, fareData]) => {
            const price = fareData.pricing?.totalPrice || 0;
            const isRefundable = fareData.refundable !== undefined ? fareData.refundable : (fareData.subTravelOptionFare?.[0]?.refundable !== undefined ? fareData.subTravelOptionFare[0].refundable : true);
            const rawFlightFares = fareData.subTravelOptionFare?.[0]?.flightFare || [];
            const flightFares = Array.isArray(rawFlightFares) ? rawFlightFares : [rawFlightFares];
            const parsedBrandFromFareId = typeof fareId === 'string' ? fareId.split('__')[11] : null;
            const brandName = flightFares[0]?.identifiers?.brandName || fareData.fareName || (parsedBrandFromFareId && !parsedBrandFromFareId.startsWith('AVN') ? parsedBrandFromFareId.replace(',', ' / ') : '');
            
            // Extract Benefits from allBenefits
            let parsedBenefits = [];
            if (allBenefits && fareData.benefitIds) {
                parsedBenefits = fareData.benefitIds
                    .map(id => allBenefits[id])
                    .filter(Boolean)
                    .map(b => ({
                        type: b.benefitType || 'BENEFIT',
                        value: b.value || '',
                        description: b.description || b.shortDescription || b.value || b.benefitType
                    }));
            }
            
            // Add fallbacks if empty so the UI shows something
            if (parsedBenefits.length === 0) {
                parsedBenefits.push({ type: 'BAGGAGE', description: 'Standard Cabin & Check-in Baggage' });
                
                const lowerBrand = (brandName || '').toLowerCase();
                if (lowerBrand.includes('flex') || lowerBrand.includes('comfort') || lowerBrand.includes('premium')) {
                    parsedBenefits.push({ type: 'SEAT', description: 'Free Seat Selection' });
                    parsedBenefits.push({ type: 'MEAL', description: 'Complimentary Meal' });
                    parsedBenefits.push({ type: 'BENEFIT', description: 'Zero Cancellation Fee' });
                } else if (lowerBrand.includes('student')) {
                    parsedBenefits.push({ type: 'BAGGAGE', description: 'Extra Baggage Allowance' });
                }
            }

            return {
                fareId,
                price,
                brandName,
                isRefundable,
                benefits: parsedBenefits,
                rawFare: fareData
            };
        }).sort((a, b) => a.price - b.price);

        return matchedFares;
    }, [previewFlight, allFares, allBenefits]);

    // Derived selected fare details
    const selectedFareData = React.useMemo(() => {
        if (!selectedFareId || !availableFares.length) return previewFlight;
        const matched = availableFares.find(f => f.fareId === selectedFareId);
        if (!matched) return previewFlight;
        
        return {
            ...previewFlight,
            price: matched.price,
            baseFare: matched.rawFare?.pricing?.baseFare || matched.rawFare?.pricing?.basePrice || Math.round(matched.price * 0.82),
            taxes: matched.rawFare?.pricing?.tax || matched.rawFare?.pricing?.taxPrice || Math.round(matched.price * 0.18),
            isRefundable: matched.isRefundable,
            brandName: matched.brandName,
            rawOption: {
                ...previewFlight.rawOption,
                fareId: selectedFareId
            }
        };
    }, [previewFlight, selectedFareId, availableFares]);

    const handleFareSelection = (fareId) => {
        if (fareId === selectedFareId) return;
        setSelectedFareId(fareId);
        if (dataId && fareId) {
            setLoadingBenefits(true);
            setBulkBenefits(null);
            fetchBulkBenefitsApi({
                dataId,
                searchId,
                fareIds: [fareId],
                requiredBenefitTypes: ["BAGGAGE", "PENALTIES", "FARE_BENEFITS"]
            }).then(res => {
                if (res.success && res.data) {
                    setBulkBenefits(res.data);
                }
            }).catch(err => {
                console.warn('Failed to fetch benefits details:', err.message);
            }).finally(() => {
                setLoadingBenefits(false);
            });
        }
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h2 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                                {fromVal} <span className="text-[#b89565] font-normal">⇆</span> {toVal}
                            </h2>
                        </div>

                        {/* Shifted to Right Side */}
                        <div className="flex gap-2 flex-wrap items-center md:justify-end">
                            <span className="bg-[#121b2d] border border-[#b89565]/40 text-slate-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs">
                                <Calendar size={13} className="text-[#b89565]" /> Depart: {dateVal}
                            </span>
                            {returnDateVal && (
                                <span className="bg-[#121b2d] border border-[#b89565]/40 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                                    <Calendar size={13} className="text-[#b89565]" /> Return: {returnDateVal}
                                </span>
                            )}
                            <span className="bg-[#121b2d] border border-[#b89565]/40 text-slate-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs">
                                <Users size={13} className="text-[#b89565]" /> {travellersVal}
                            </span>
                            <span className="bg-[#121b2d] border border-[#b89565]/40 text-slate-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs">
                                <Briefcase size={13} className="text-[#b89565]" /> {cabinVal}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Horizontal Lowest Fare Date Calendar Strip (Only this part is sticky over Navbar) ── */}
            <div className="bg-white border-b border-slate-200 py-3 shadow-md sticky top-0 z-[1001]">
                <div className="max-w-[1200px] mx-auto px-4 relative">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-[#b89565]" />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lowest Fare Calendar ({fromVal} ➔ {toVal})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Click any date to compare & update results</span>
                    </div>

                    <div className="relative group">
                        {/* Scroll Left Button */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('fare-calendar-container');
                                if (container) container.scrollBy({ left: -240, behavior: 'smooth' });
                            }}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 rounded-full p-1.5 backdrop-blur-xs transition-all hover:scale-110"
                            title="Scroll Left"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Date Cards Container */}
                        <div
                            id="fare-calendar-container"
                            className="flex items-center space-x-3 overflow-x-auto py-1 px-1 scroll-smooth no-scrollbar"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((offset) => {
                                const baseDate = new Date(dateVal || Date.now());
                                const dateObj = new Date(baseDate);
                                dateObj.setDate(baseDate.getDate() + offset);

                                const formattedDate = dateObj.toISOString().split('T')[0];
                                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                                const monthDay = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                                const isSelected = dateVal === formattedDate;

                                // Calculate dynamic simulated fare
                                const estFare = Math.round(3200 + ((dateObj.getDate() * 180) % 2100));

                                return (
                                    <button
                                        key={formattedDate}
                                        onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.set('date', formattedDate);
                                            navigate(`/flights/list?${newParams.toString()}`);
                                        }}
                                        className={`shrink-0 min-w-[115px] py-2.5 px-3 rounded-none border text-center transition-all cursor-pointer ${isSelected
                                            ? 'bg-[#0b0f19] border-[#0b0f19] text-white shadow-lg ring-1 ring-[#b89565]'
                                            : 'bg-white border-slate-300 text-slate-700 hover:border-[#b89565] hover:bg-amber-50/30'
                                            }`}
                                    >
                                        <div className={`text-[11px] font-semibold tracking-wide ${isSelected ? 'text-[#b89565]' : 'text-slate-500'}`}>
                                            {dayName}, {monthDay}
                                        </div>
                                        <div className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                            ₹{estFare.toLocaleString('en-IN')}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Scroll Right Button */}
                        <button
                            onClick={() => {
                                const container = document.getElementById('fare-calendar-container');
                                if (container) container.scrollBy({ left: 240, behavior: 'smooth' });
                            }}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-700 shadow-md border border-slate-200 rounded-full p-1.5 backdrop-blur-xs transition-all hover:scale-110"
                            title="Scroll Right"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Clean 2-Column Responsive Layout */}
            <div className="max-w-[1200px] mx-auto my-6 px-4 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

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
                    {/* Step Indicator Banner for Round Trip */}
                    {!loading && !error && selectionMode !== 'oneWay' && (
                        <div className="bg-amber-50 border border-amber-200/80 p-4 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                                    {selectionMode === 'outbound' ? '1' : '2'}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-extrabold text-slate-900">
                                        {selectionMode === 'outbound'
                                            ? `Step 1 of 2: Select Outbound Flight (${fromVal.split(' ')[0]} ➔ ${toVal.split(' ')[0]})`
                                            : `Step 2 of 2: Select Return Flight (${toVal.split(' ')[0]} ➔ ${fromVal.split(' ')[0]})`}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                        {selectionMode === 'outbound'
                                            ? 'Please select your departure flight from the list below'
                                            : `Selected departure: ${selectedOutbound?.airlineName} (${selectedOutbound?.segments?.[0]?.flightNumber}) - ₹${selectedOutbound?.price?.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>
                            {selectionMode === 'return' && (
                                <button
                                    onClick={() => {
                                        setFlights(allOutboundFlights);
                                        setSelectionMode('outbound');
                                        setSelectedOutbound(null);
                                    }}
                                    className="bg-white border border-slate-350 text-slate-750 px-4 py-2 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                                >
                                    ⬅️ Change Outbound
                                </button>
                            )}
                        </div>
                    )}

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
                                            <span className="text-xs text-slate-500 font-medium">{segments.map(s => s.flightNumber).join(' → ')}</span>
                                            <div className="text-[11px] text-[#b89565] font-semibold mt-0.5 uppercase tracking-wider">{primarySegment.brandName || 'PUBLISHED'}</div>
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
                                                handleCardClick(flight);
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
                                            {primarySegment.cabinType} • {primarySegment.brandName || 'PUBLISHED'}
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                                            🧳 Cabin: <strong>{primarySegment.cabinBaggage || '7 KG'}</strong>
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                                            💼 Check-in: <strong>{primarySegment.checkInBaggage || '15 KG'}</strong>
                                        </span>
                                        {flight.benefits?.map((benefit, i) => {
                                            if (benefit.type === 'MEAL') {
                                                return (
                                                    <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-emerald-100">
                                                        🍽️ Free Meal
                                                    </span>
                                                );
                                            }
                                            if (benefit.type === 'SEAT') {
                                                return (
                                                    <span key={i} className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-purple-100">
                                                        💺 Free Seat
                                                    </span>
                                                );
                                            }
                                            return (
                                                <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-blue-100">
                                                    ✅ {benefit.description}
                                                </span>
                                            );
                                        })}
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
                <div className="fixed inset-0 z-[999999] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 overflow-hidden">
                        {/* Background Overlay */}
                        <div
                            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm ${isDrawerOpen ? 'animate-fade-in-overlay' : 'animate-fade-out-overlay'}`}
                            onClick={closeDrawer}
                        ></div>

                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <div className="pointer-events-auto w-screen max-w-[60vw]">
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
                                    <div className="p-6 md:p-8 flex flex-col gap-6">
                                        {/* 1. Header Row */}
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getAirlineLogo(previewFlight.airlineCode)}
                                                    alt={previewFlight.airlineName}
                                                    className="w-12 h-12 object-contain rounded-none p-1 bg-slate-50 border border-slate-100"
                                                    onError={(e) => { e.target.src = 'https://images.kiwi.com/airlines/64/AI.png'; }}
                                                />
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                                        {previewFlight.airlineName} <span className="text-slate-400 font-normal">|</span> {previewFlight.segments?.[0]?.flightNumber}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                        Aircraft: <span className="text-slate-700 font-semibold">{previewFlight.segments?.[0]?.aircraft || 'Not Available'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3.5 py-1.5 rounded-none text-xs font-bold ${previewFlight.isRefundable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                                {previewFlight.isRefundable ? 'Refundable' : 'Non-Refundable'}
                                            </span>
                                        </div>

                                        {/* 2. Flight Timeline Summary Card */}
                                        <div className="bg-slate-50/60 p-5 border border-slate-100 rounded-none flex items-center justify-between shadow-2xs">
                                            <div className="text-left flex-1">
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                    {new Date(previewFlight.segments?.[0]?.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </h3>
                                                <span className="text-sm font-black text-slate-900 uppercase block mt-0.5">{previewFlight.segments?.[0]?.origin}</span>
                                                <span className="text-[11px] text-slate-500 font-medium block mt-0.5 line-clamp-1">{previewFlight.segments?.[0]?.originAirportName}</span>
                                            </div>

                                            <div className="flex flex-col items-center flex-1 max-w-[220px] px-4">
                                                <span className="text-xs text-slate-500 font-medium mb-1">
                                                    {Math.floor(Math.floor((new Date(previewFlight.segments?.[previewFlight.segments.length - 1]?.arrivalDateTime) - new Date(previewFlight.segments?.[0]?.departureDateTime)) / (1000 * 60)) / 60)}h {Math.floor((new Date(previewFlight.segments?.[previewFlight.segments.length - 1]?.arrivalDateTime) - new Date(previewFlight.segments?.[0]?.departureDateTime)) / (1000 * 60)) % 60}m
                                                </span>
                                                <div className="relative w-full h-[2px] bg-slate-200 my-1">
                                                    <div className="absolute top-1/2 left-0 w-2 h-2 rounded-none bg-[#b89565] -translate-y-1/2"></div>
                                                    {previewFlight.segments.length > 1 && (
                                                        <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-none bg-[#b89565] -translate-x-1/2 -translate-y-1/2"></div>
                                                    )}
                                                    <div className="absolute top-1/2 right-0 w-2 h-2 rounded-none bg-[#b89565] -translate-y-1/2"></div>
                                                </div>
                                                <span className="text-xs font-bold text-[#2563eb] mt-1">
                                                    {previewFlight.segments.length === 1 ? 'Non-stop' : `${previewFlight.segments.length - 1} Stop(s)`}
                                                </span>
                                            </div>

                                            <div className="text-right flex-1">
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                                    {new Date(previewFlight.segments?.[previewFlight.segments.length - 1]?.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </h3>
                                                <span className="text-sm font-black text-slate-900 uppercase block mt-0.5">{previewFlight.segments?.[previewFlight.segments.length - 1]?.destination}</span>
                                                <span className="text-[11px] text-slate-500 font-medium block mt-0.5 line-clamp-1">{previewFlight.segments?.[previewFlight.segments.length - 1]?.destinationAirportName}</span>
                                            </div>
                                        </div>

                                        {/* 3. Flight Information Section */}
                                        <div>
                                            <div className="flex items-center gap-2 text-[#1e40af] font-bold text-xs uppercase tracking-wider mb-3">
                                                <div className="w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center">
                                                    <Info className="w-3.5 h-3.5 text-[#1e40af]" />
                                                </div>
                                                <span>FLIGHT INFORMATION</span>
                                            </div>
                                            <div className="bg-slate-50/40 border border-slate-100 rounded-none p-5 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AIRLINE</span>
                                                    <strong className="text-sm text-slate-900 font-bold">{previewFlight.airlineName}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FLIGHT NUMBER</span>
                                                    <strong className="text-sm text-slate-900 font-bold">{previewFlight.segments?.[0]?.flightNumber}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AIRCRAFT</span>
                                                    <strong className="text-sm text-slate-900 font-bold">{previewFlight.segments?.[0]?.aircraft || 'Not Available'}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CABIN CLASS</span>
                                                    <strong className="text-sm text-slate-900 font-bold capitalize">{previewFlight.segments?.[0]?.cabinType?.toLowerCase() || 'Economy'}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FARE TYPE</span>
                                                    <strong className="text-sm text-slate-900 font-bold uppercase">{previewFlight.segments?.[0]?.brandName || 'PUBLISHED'}</strong>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TRIP TYPE</span>
                                                    <strong className="text-sm text-slate-900 font-bold">{previewFlight.segments?.length > 1 ? 'Multi-City' : 'One Way'}</strong>
                                                </div>
                                                {previewFlight.segments?.[0]?.availableSeats && (
                                                    <div>
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SEATS AVAILABLE</span>
                                                        <strong className="text-sm text-red-600 font-bold">⚠️ {previewFlight.segments[0].availableSeats} seat(s) left</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 4. Baggage Allowance Section */}
                                        <div>
                                            <div className="flex items-center gap-2 text-[#1e40af] font-bold text-xs uppercase tracking-wider mb-3">
                                                <div className="w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center">
                                                    <Luggage className="w-3.5 h-3.5 text-[#1e40af]" />
                                                </div>
                                                <span>BAGGAGE ALLOWANCE</span>
                                            </div>
                                            <div className="bg-slate-50/40 border border-slate-100 rounded-none p-4 flex flex-col gap-3">
                                                {/* Cabin Baggage Row */}
                                                <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-none shadow-2xs">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-none bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold">
                                                            <Luggage className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs text-slate-900">Cabin Baggage</div>
                                                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                                {previewFlight.segments?.[0]?.cabinBaggage ? `${previewFlight.segments[0].cabinBaggage} • 55cm x 35cm x 25cm` : 'As per Airline Policy'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-xs text-slate-900 bg-slate-50 px-3.5 py-1.5 rounded-none border border-slate-200">
                                                        {previewFlight.segments?.[0]?.cabinBaggage || 'As per Airline Policy'}
                                                    </div>
                                                </div>

                                                {/* Check-in Baggage Row */}
                                                <div className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-none shadow-2xs">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-none bg-sky-100/70 text-sky-600 flex items-center justify-center font-bold">
                                                            <Luggage className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xs text-slate-900">Check-in Baggage</div>
                                                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                                {previewFlight.segments?.[0]?.checkInBaggage ? `${previewFlight.segments[0].checkInBaggage} • 158cm (L+W+H)` : 'As per Airline Policy'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-xs text-slate-900 bg-slate-50 px-3.5 py-1.5 rounded-none border border-slate-200">
                                                        {previewFlight.segments?.[0]?.checkInBaggage || 'As per Airline Policy'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Route Details Section */}
                                        <div>
                                            <div className="flex items-center gap-2 text-[#1e40af] font-bold text-xs uppercase tracking-wider mb-3">
                                                <div className="w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center">
                                                    <MapPin className="w-3.5 h-3.5 text-[#1e40af]" />
                                                </div>
                                                <span>ROUTE DETAILS</span>
                                            </div>
                                            <div className="bg-slate-50/40 border border-slate-100 rounded-none p-5 flex flex-col gap-4">
                                                {previewFlight.segments.map((seg, sIdx) => (
                                                    <React.Fragment key={sIdx}>
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1">
                                                                <span className="text-base font-black text-slate-900">{seg.origin}</span>
                                                                <span className="block text-xs font-medium text-slate-500 mt-0.5">{seg.originAirportName?.split(',')[0] || seg.origin}</span>
                                                                <span className="block text-xs font-bold text-slate-900 mt-1">{new Date(seg.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                <span className="block text-[11px] text-slate-500 mt-0.5">{new Date(seg.departureDateTime).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                <span className="block text-[10px] text-slate-400 mt-0.5">{seg.originAirportName || `${seg.origin} Airport`}</span>
                                                            </div>

                                                            <div className="flex flex-col items-center justify-center pt-2">
                                                                <span className="text-[11px] text-slate-500 font-medium">{seg.duration}</span>
                                                                <div className="w-[120px] h-[1px] bg-slate-300 my-1.5 relative">
                                                                    <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-[#b89565] -translate-y-1/2"></div>
                                                                    <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-[#b89565] -translate-y-1/2"></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-[#2563eb] block">
                                                                    {previewFlight.segments.length === 1 ? 'Non-stop' : `Segment ${sIdx + 1}`}
                                                                </span>
                                                                <span className="text-[11px] font-mono font-bold text-slate-700 mt-0.5 block">
                                                                    {seg.flightNumber}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-[#b89565] uppercase mt-0.5">{seg.cabinType}</span>
                                                            </div>

                                                            <div className="flex-1 text-right">
                                                                <span className="text-base font-black text-slate-900">{seg.destination}</span>
                                                                <span className="block text-xs font-medium text-slate-500 mt-0.5">{seg.destinationAirportName?.split(',')[0] || seg.destination}</span>
                                                                <span className="block text-xs font-bold text-slate-900 mt-1">{new Date(seg.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                <span className="block text-[11px] text-slate-500 mt-0.5">{new Date(seg.arrivalDateTime).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                <span className="block text-[10px] text-slate-400 mt-0.5">{seg.destinationAirportName || `${seg.destination} Airport`}</span>
                                                            </div>
                                                        </div>

                                                        {/* Layover Banner between multi-leg flights */}
                                                        {sIdx < previewFlight.segments.length - 1 && (
                                                            <div className="my-1 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-none text-center">
                                                                <span className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1">
                                                                    ⏳ Layover in {previewFlight.segments[sIdx + 1].originAirportName?.split(',')[0] || previewFlight.segments[sIdx + 1].origin} ({previewFlight.segments[sIdx + 1].origin})
                                                                </span>
                                                                <span className="block text-[11px] font-medium text-amber-700 mt-0.5">
                                                                    Transit Time: {
                                                                        (() => {
                                                                            const nextDep = new Date(previewFlight.segments[sIdx + 1].departureDateTime);
                                                                            const currArr = new Date(seg.arrivalDateTime);
                                                                            const diffMs = nextDep - currArr;
                                                                            if (diffMs > 0) {
                                                                                const mins = Math.floor(diffMs / (1000 * 60));
                                                                                return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                                                                            }
                                                                            return 'Connecting Flight';
                                                                        })()
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 5.5. Fare Upgrades Section */}
                                        {availableFares.length > 1 && (
                                            <div>
                                                <div className="flex items-center gap-2 text-[#1e40af] font-bold text-xs uppercase tracking-wider mb-3">
                                                    <div className="w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center">
                                                        <Shield className="w-3.5 h-3.5 text-[#1e40af]" />
                                                    </div>
                                                    <span>FARE UPGRADES</span>
                                                </div>
                                                <div className="flex gap-3 overflow-x-auto pb-2">
                                                    {availableFares.map((fare) => (
                                                        <button 
                                                            key={fare.fareId}
                                                            onClick={() => handleFareSelection(fare.fareId)}
                                                            className={`shrink-0 min-w-[200px] text-left p-4 rounded-none border-2 transition-all ${selectedFareId === fare.fareId ? 'border-[#b89565] bg-amber-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                                        >
                                                            <div className="font-bold text-slate-900 text-sm uppercase tracking-wider">{fare.brandName}</div>
                                                            <div className="font-black text-[#b89565] text-lg mt-1">₹{fare.price.toLocaleString()}</div>
                                                            
                                                            <div className="text-xs font-semibold mt-3">
                                                                {fare.isRefundable ? <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100">Refundable</span> : <span className="text-red-500 bg-red-50 px-2 py-0.5 border border-red-100">Non-Refundable</span>}
                                                            </div>

                                                            {(() => {
                                                                const resolved = getResolvedBenefits(fare.fareId);
                                                                let displayList = fare.benefits || [];
                                                                if (resolved && (resolved.baggageList.length > 0 || resolved.benefitsList.length > 0)) {
                                                                    displayList = [
                                                                        ...resolved.baggageList.map(b => ({ type: 'BAGGAGE', description: `${b.type}: ${b.weight}` })),
                                                                        ...resolved.benefitsList
                                                                    ];
                                                                }
                                                                if (!displayList || displayList.length === 0) return null;
                                                                return (
                                                                    <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-2 text-left">
                                                                        {displayList.map((b, i) => (
                                                                            <span key={i} className="text-[10px] text-slate-600 flex items-center gap-1.5 font-medium">
                                                                                {b.type === 'MEAL' ? '🍽️' : b.type === 'SEAT' ? '💺' : b.type === 'BAGGAGE' ? '🧳' : '✅'} {b.description}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 6. Fare Summary & Benefits & Rules Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                                            {/* Fare Summary */}
                                            <div className="bg-slate-50/40 p-5 border border-slate-100 rounded-none flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 text-[#1e40af] font-bold text-xs uppercase tracking-wider mb-4">
                                                        <div className="w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center">
                                                            <Receipt className="w-3.5 h-3.5 text-[#1e40af]" />
                                                        </div>
                                                        <span>FARE SUMMARY</span>
                                                    </div>
                                                    <div className="flex flex-col gap-2.5 text-xs text-slate-600">
                                                        <div className="flex justify-between">
                                                            <span>Base Fare</span>
                                                            <span className="font-semibold text-slate-800">₹{(selectedFareData.baseFare || Math.round(selectedFareData.price * 0.82)).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Taxes & Fees</span>
                                                            <span className="font-semibold text-slate-800">₹{(selectedFareData.taxes || Math.round(selectedFareData.price * 0.18)).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Convenience Fee</span>
                                                            <span className="text-emerald-600 font-bold">FREE</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-base font-bold text-slate-900 border-t border-slate-200/60 pt-3 mt-4">
                                                    <span>Total Payable</span>
                                                    <span className="text-xl font-black text-slate-900">₹{selectedFareData.price.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Benefits & Rules */}
                                            <div className="bg-slate-50/40 p-5 border border-slate-100 rounded-none flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 text-[#1e40af] font-bold text-xs uppercase tracking-wider mb-3">
                                                        <div className="w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center">
                                                            <Shield className="w-3.5 h-3.5 text-[#1e40af]" />
                                                        </div>
                                                        <span>BENEFITS & RULES</span>
                                                    </div>

                                                    <div className="flex flex-col gap-2 mt-2">
                                                        {previewFlight.benefits && previewFlight.benefits.length > 0 ? (
                                                            previewFlight.benefits.map((ben, bIdx) => (
                                                                <div key={bIdx} className="flex justify-between items-center text-xs py-1 border-b border-slate-100/60 last:border-0">
                                                                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                                                                        {ben.type === 'MEAL' ? '🍽️' : ben.type === 'SEAT' ? '💺' : ben.type === 'BAGGAGE' ? '🧳' : '🛡️'} {ben.description || ben.type}
                                                                    </span>
                                                                    <span className="font-bold text-slate-900">{ben.value || 'INCLUDED'}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="flex justify-between items-center text-xs py-1">
                                                                <span className="text-slate-600 font-medium">Fare Rules</span>
                                                                <span className="font-bold text-slate-900">{selectedFareData.isRefundable ? 'Refund Allowed as per Fare Rules' : 'Non-Refundable Fare'}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {loadingBenefits && (
                                                        <div className="mt-3 p-2 bg-blue-50/50 border border-blue-100 text-center rounded-sm">
                                                            <span className="text-xs text-blue-600 font-medium animate-pulse flex items-center justify-center gap-1.5">
                                                                🔄 Loading Live Rules (Bulk Benefits)...
                                                            </span>
                                                        </div>
                                                    )}

                                                    {bulkBenefits && (() => {
                                                        const resolved = getResolvedBenefits();
                                                        return resolved ? (
                                                            <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 text-xs rounded-none text-slate-700 space-y-3">
                                                                <div className="font-bold text-[#1e40af] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                                                                    <span>📋 Cleartrip Live Rules (Bulk Benefits)</span>
                                                                </div>

                                                                {/* Baggage Mappings */}
                                                                {resolved.baggageList.length > 0 && (
                                                                    <div className="space-y-1">
                                                                        <strong className="text-slate-800 font-bold block text-[10px] uppercase tracking-wider">Resolved Baggage Limit:</strong>
                                                                        <div className="flex flex-col gap-1 pl-1">
                                                                            {resolved.baggageList.map((bag, bIdx) => (
                                                                                <span key={bIdx} className="text-slate-700">💼 {bag.type}: <strong className="font-bold text-slate-900">{bag.weight}</strong></span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Penalties Mappings */}
                                                                {resolved.penaltiesList.length > 0 && (
                                                                    <div className="space-y-2 pt-1.5 border-t border-slate-100">
                                                                        <strong className="text-slate-800 font-bold block text-[10px] uppercase tracking-wider">Fare Rules & Penalties:</strong>
                                                                        <div className="flex flex-col gap-2 pl-1">
                                                                            {resolved.penaltiesList.map((pen, pIdx) => (
                                                                                <div key={pIdx} className="bg-white p-2 border border-slate-100 rounded-none shadow-3xs">
                                                                                    <div className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1">
                                                                                        <span>{pen.type === 'Cancellation' ? '❌' : '🔄'} {pen.type} Rules</span>
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-1 text-[11px]">
                                                                                        {pen.timelines.map((time, tIdx) => (
                                                                                            <div key={tIdx} className="flex justify-between text-slate-650 border-b border-slate-50 pb-0.5 last:border-0 last:pb-0">
                                                                                                <span>Within {time.timeLabel}:</span>
                                                                                                <span className="font-bold text-slate-850">{time.permittedLabel} ({time.amountStr})</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Meal & Seat Benefits */}
                                                                {resolved.benefitsList.length > 0 && (
                                                                    <div className="space-y-1 pt-1.5 border-t border-slate-100">
                                                                        <strong className="text-slate-800 font-bold block text-[10px] uppercase tracking-wider">In-Flight Services:</strong>
                                                                        <div className="flex flex-col gap-1 pl-1">
                                                                            {resolved.benefitsList.map((ben, idx) => (
                                                                                <span key={idx} className="text-slate-700">
                                                                                    {ben.type === 'MEAL' ? '🍽️' : '💺'} {ben.description}: <strong className="font-bold text-slate-900">{ben.value}</strong>
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] font-mono whitespace-pre-wrap max-h-[140px] overflow-y-auto bg-slate-100 p-2 border border-slate-200 mt-1">
                                                                {JSON.stringify(bulkBenefits, null, 2)}
                                                            </div>
                                                        );
                                                    })()}

                                                    <div className="text-right mt-2 pt-2 border-t border-slate-100">
                                                        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 border ${selectedFareData.isRefundable ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-500 bg-red-50 border-red-200'}`}>
                                                            {selectedFareData.isRefundable ? 'REFUNDABLE' : 'NON-REFUNDABLE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 7. Action Button */}
                                        <div className="pt-2">
                                            <button
                                                className="w-full bg-[#b89565] hover:bg-[#a38053] text-white py-3.5 rounded-none text-sm font-bold tracking-wider uppercase transition-all shadow-md active:scale-[0.99]"
                                                onClick={() => handleBooking(selectedFareData)}
                                            >
                                                CONTINUE BOOKING
                                            </button>
                                            <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                                                🔒 Secure Booking | Your data is safe with us
                                            </p>
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
