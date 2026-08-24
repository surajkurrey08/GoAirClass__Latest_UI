import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Users,
    MapPin,
    Search,
    Star,
    ChevronDown,
    SlidersHorizontal,
    Heart,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    PhoneCall,
    ClipboardCheck,
    RefreshCcw,
    Wifi,
    Coffee,
    Waves,
    Car,
    Dumbbell,
    Building2,
} from 'lucide-react';
import Footer from '../components/Footer';
import { searchHotelsByLocation } from '../services/hotelApi';

const MAX_PRICE = 1400000;

const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const getFutureDateString = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const safeDate = (value) => {
    if (!value) return new Date();
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? new Date() : d;
};

const formatSlashDate = (value) => {
    const d = safeDate(value);
    return d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });
};

const formatWeekday = (value) =>
    safeDate(value).toLocaleDateString('en-US', { weekday: 'short' });

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const hotelHasAmenity = (hotel, aliases) => {
    const source = Array.isArray(hotel?.amenities)
        ? hotel.amenities.join(' ')
        : `${hotel?.amenities || ''} ${hotel?.facilities || ''}`;
    const text = normalizeText(source);
    if (!text) return true; // don't hide hotels when provider does not return amenity metadata
    return aliases.some((alias) => text.includes(alias));
};

export default function HotelListPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [destination, setDestination] = useState('Pune, Maharashtra, India');
    const [checkIn, setCheckIn] = useState(getTodayDateString());
    const [checkOut, setCheckOut] = useState(getFutureDateString(3));
    const [roomsCount, setRoomsCount] = useState(1);
    const [adultsCount, setAdultsCount] = useState(2);
    const [childrenCount, setChildrenCount] = useState(0);

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
    const guestsRef = useRef(null);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [checkOutOpen, setCheckOutOpen] = useState(false);
    const checkInRef = useRef(null);
    const checkOutRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [dealFilters, setDealFilters] = useState({
        exclusive: false,
        freeCancellation: false,
    });
    const [starFilters, setStarFilters] = useState({
        5: false,
        4: false,
        3: false,
        2: false,
        1: false,
        0: false,
    });
    const [guestRating, setGuestRating] = useState('any');
    const [amenityFilters, setAmenityFilters] = useState({
        wifi: false,
        breakfast: false,
        pool: false,
        parking: false,
        gym: false,
    });
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
    const [sortBy, setSortBy] = useState('star-desc');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const dest = queryParams.get('destination') || 'Pune, Maharashtra, India';
        const checkI = queryParams.get('checkIn') || getTodayDateString();
        const checkO = queryParams.get('checkOut') || getFutureDateString(3);
        const rms = parseInt(queryParams.get('rooms'), 10) || 1;
        const adults =
            parseInt(queryParams.get('adults'), 10) ||
            parseInt(queryParams.get('guests'), 10) ||
            2;
        const kids = parseInt(queryParams.get('children'), 10) || 0;

        setDestination(dest);
        setCheckIn(checkI);
        setCheckOut(checkO);
        setRoomsCount(rms);
        setAdultsCount(adults);
        setChildrenCount(kids);

        const fetchLiveHotels = async () => {
            try {
                setLoading(true);
                const data = await searchHotelsByLocation({
                    destination: dest,
                    checkIn: checkI,
                    checkOut: checkO,
                    rooms: rms,
                    guests: adults + kids,
                });

                if (data?.success) {
                    setHotels(Array.isArray(data.hotels) ? data.hotels : []);
                } else {
                    setHotels([]);
                }
            } catch (err) {
                console.error('Error fetching live hotels:', err);
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveHotels();
    }, [location.search]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (guestsRef.current && !guestsRef.current.contains(e.target)) {
                setShowGuestsDropdown(false);
            }
            if (checkInRef.current && !checkInRef.current.contains(e.target)) {
                setCheckInOpen(false);
            }
            if (checkOutRef.current && !checkOutRef.current.contains(e.target)) {
                setCheckOutOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const getNightsCount = () => {
        if (!checkIn || !checkOut) return 1;
        const start = safeDate(checkIn);
        const end = safeDate(checkOut);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff || 1);
    };

    const nights = getNightsCount();

    const cityLabel = useMemo(() => {
        if (!destination) return 'Destination';
        return destination.split(',')[0].trim() || destination;
    }, [destination]);

    const minHotelPrice = useMemo(() => {
        const values = hotels
            .map((hotel) => Number(hotel?.pricePerNight || hotel?.price || 0))
            .filter((value) => Number.isFinite(value) && value > 0);
        return values.length ? Math.min(...values) : 2890;
    }, [hotels]);

    const clearAllFilters = () => {
        setSearchQuery('');
        setDealFilters({ exclusive: false, freeCancellation: false });
        setStarFilters({ 5: false, 4: false, 3: false, 2: false, 1: false, 0: false });
        setGuestRating('any');
        setAmenityFilters({ wifi: false, breakfast: false, pool: false, parking: false, gym: false });
        setMaxPrice(MAX_PRICE);
        setSortBy('star-desc');
    };

    const handleCheckInChange = (value) => {
        setCheckIn(value);
        if (!checkOut || safeDate(checkOut) <= safeDate(value)) {
            const next = safeDate(value);
            next.setDate(next.getDate() + 1);
            setCheckOut(next.toISOString().split('T')[0]);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const totalGuests = adultsCount + childrenCount;
        navigate(
            `/hotels/list?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${roomsCount}&adults=${adultsCount}&children=${childrenCount}&guests=${totalGuests}`
        );
    };

    const filteredHotels = useMemo(() => {
        return hotels
            .filter((hotel) => {
                const hotelName = normalizeText(hotel?.name);
                const hotelAddress = normalizeText(hotel?.address);
                const query = normalizeText(searchQuery);

                if (query && !hotelName.includes(query) && !hotelAddress.includes(query)) {
                    return false;
                }

                const activeStars = Object.keys(starFilters).filter((key) => starFilters[key]);
                if (activeStars.length > 0) {
                    const stars = Number(hotel?.stars || 0);
                    if (!starFilters[stars]) return false;
                }

                if (dealFilters.exclusive && hotel?.dealType !== 'exclusive') return false;

                if (dealFilters.freeCancellation) {
                    const cancellationText = normalizeText(
                        hotel?.cancellationPolicy || hotel?.cancellation || ''
                    );
                    const isFree =
                        hotel?.freeCancellation === true ||
                        cancellationText.includes('free cancellation') ||
                        cancellationText.includes('free cancel');
                    if (!isFree) return false;
                }

                const nightly = Number(hotel?.pricePerNight || hotel?.price || 0);
                if (nightly > maxPrice) return false;

                const rating = Number(hotel?.guestRating || hotel?.rating || hotel?.reviewScore || 0);
                if (guestRating !== 'any' && rating > 0 && rating < Number(guestRating)) {
                    return false;
                }

                if (amenityFilters.wifi && !hotelHasAmenity(hotel, ['wifi', 'wi-fi', 'wireless'])) return false;
                if (amenityFilters.breakfast && !hotelHasAmenity(hotel, ['breakfast'])) return false;
                if (amenityFilters.pool && !hotelHasAmenity(hotel, ['pool', 'swimming'])) return false;
                if (amenityFilters.parking && !hotelHasAmenity(hotel, ['parking'])) return false;
                if (amenityFilters.gym && !hotelHasAmenity(hotel, ['gym', 'fitness'])) return false;

                return true;
            })
            .sort((a, b) => {
                const aStars = Number(a?.stars || 0);
                const bStars = Number(b?.stars || 0);
                const aPrice = Number(a?.pricePerNight || a?.price || 0);
                const bPrice = Number(b?.pricePerNight || b?.price || 0);

                if (sortBy === 'star-desc') return bStars - aStars;
                if (sortBy === 'star-asc') return aStars - bStars;
                if (sortBy === 'price-asc') return aPrice - bPrice;
                if (sortBy === 'price-desc') return bPrice - aPrice;
                return 0;
            });
    }, [
        hotels,
        searchQuery,
        starFilters,
        dealFilters,
        guestRating,
        amenityFilters,
        maxPrice,
        sortBy,
    ]);

    const starCount = (star) => hotels.filter((hotel) => Number(hotel?.stars || 0) === star).length;

    const ratingCount = (threshold) => {
        if (threshold === 'any') return hotels.length;
        return hotels.filter((hotel) => {
            const rating = Number(hotel?.guestRating || hotel?.rating || hotel?.reviewScore || 0);
            return rating >= Number(threshold);
        }).length;
    };

    const amenityCount = (aliases, fallbackRatio) => {
        const actual = hotels.filter((hotel) => {
            const source = Array.isArray(hotel?.amenities)
                ? hotel.amenities.join(' ')
                : `${hotel?.amenities || ''} ${hotel?.facilities || ''}`;
            const text = normalizeText(source);
            return aliases.some((alias) => text.includes(alias));
        }).length;
        return actual || Math.round(hotels.length * fallbackRatio);
    };


    const amenityItems = [
        { key: 'wifi', label: 'Free Wi-Fi', icon: Wifi, aliases: ['wifi', 'wi-fi'], ratio: 0.82 },
        { key: 'breakfast', label: 'Breakfast Included', icon: Coffee, aliases: ['breakfast'], ratio: 0.64 },
        { key: 'pool', label: 'Pool', icon: Waves, aliases: ['pool'], ratio: 0.24 },
        { key: 'parking', label: 'Free Parking', icon: Car, aliases: ['parking'], ratio: 0.44 },
        { key: 'gym', label: 'Gym', icon: Dumbbell, aliases: ['gym', 'fitness'], ratio: 0.18 },
    ];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] font-sans text-[#13233f] antialiased">
            {/* No Navbar on this page, as requested */}

            <div className="mx-auto w-full max-w-[1460px] px-2.5 pb-7 pt-2.5 sm:px-4 sm:pt-3 md:px-5 lg:px-6">
                {/* Search panel */}
                <section className="rounded-[8px] border border-[#edf1f7] bg-white px-3 py-3 shadow-[0_5px_18px_rgba(19,35,63,0.06)] sm:px-4 lg:px-5">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="mb-2.5 inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-[#dce3ed] bg-white px-3 text-[10px] font-extrabold text-[#244a82] shadow-sm transition hover:border-[#bfcde0] hover:bg-[#f6f9fd]"
                    >
                        <ArrowLeft size={14} strokeWidth={2.4} /> Back
                    </button>

                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                        <div className="sm:col-span-2 lg:col-span-4">
                            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#61708a]">
                                Destination / Hotel Name
                            </label>
                            <div className="flex h-[44px] items-center gap-2 rounded-[6px] border border-[#dce3ed] bg-white px-3 focus-within:border-[#2f6fed] focus-within:ring-2 focus-within:ring-blue-100">
                                <MapPin size={17} className="shrink-0 text-[#315f9d]" />
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[12px] font-semibold text-[#22324e] outline-none placeholder:text-slate-400 sm:text-[13px]"
                                    placeholder="Enter destination or hotel"
                                />
                                {destination && (
                                    <button
                                        type="button"
                                        onClick={() => setDestination('')}
                                        className="text-lg leading-none text-slate-300 transition-colors hover:text-slate-500"
                                        aria-label="Clear destination"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 relative" ref={checkInRef}>
                            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#61708a]">Check-in</label>
                            <div 
                                className="relative flex h-[44px] cursor-pointer items-center gap-2 rounded-[6px] border border-[#dce3ed] bg-white px-3 hover:border-[#bfcadc]"
                                onClick={() => { setCheckInOpen(!checkInOpen); setCheckOutOpen(false); }}
                            >
                                <Calendar size={16} className="text-[#315f9d]" />
                                <div className="min-w-0">
                                    <div className="whitespace-nowrap text-[13px] font-bold leading-tight text-[#22324e]">{formatSlashDate(checkIn)}</div>
                                    <div className="text-[10px] font-semibold text-[#ff5a16]">{formatWeekday(checkIn)}</div>
                                </div>
                            </div>
                            {checkInOpen && (
                                <MiniCalendar
                                    value={checkIn}
                                    min={getTodayDateString()}
                                    onSelect={(d) => { handleCheckInChange(d); setCheckInOpen(false); }}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-2 relative" ref={checkOutRef}>
                            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#61708a]">Check-out</label>
                            <div 
                                className="relative flex h-[44px] cursor-pointer items-center gap-2 rounded-[6px] border border-[#dce3ed] bg-white px-3 hover:border-[#bfcadc]"
                                onClick={() => { setCheckOutOpen(!checkOutOpen); setCheckInOpen(false); }}
                            >
                                <Calendar size={16} className="text-[#315f9d]" />
                                <div className="min-w-0">
                                    <div className="whitespace-nowrap text-[13px] font-bold leading-tight text-[#22324e]">{formatSlashDate(checkOut)}</div>
                                    <div className="text-[10px] font-semibold text-[#f04c39]">{formatWeekday(checkOut)}</div>
                                </div>
                            </div>
                            {checkOutOpen && (
                                <MiniCalendar
                                    value={checkOut}
                                    min={checkIn}
                                    onSelect={(d) => { setCheckOut(d); setCheckOutOpen(false); }}
                                />
                            )}
                        </div>

                        <div ref={guestsRef} className="relative lg:col-span-2">
                            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-[#61708a]">Rooms & Guests</label>
                            <button
                                type="button"
                                onClick={() => setShowGuestsDropdown((prev) => !prev)}
                                className="flex h-[44px] w-full items-center justify-between rounded-[6px] border border-[#dce3ed] bg-white px-3 text-left transition-colors hover:border-[#bfcadc]"
                            >
                                <span className="flex min-w-0 items-center gap-2">
                                    <Users size={17} className="shrink-0 text-[#315f9d]" />
                                    <span className="min-w-0 truncate text-[11px] font-semibold leading-tight text-[#22324e] sm:text-[12px]">
                                        {roomsCount} Room, {adultsCount + childrenCount} Guest{adultsCount + childrenCount !== 1 ? 's' : ''}
                                    </span>
                                </span>
                                <ChevronDown size={16} className="text-[#76849a]" />
                            </button>

                            {showGuestsDropdown && (
                                <div className="absolute right-0 top-full z-50 mt-2 w-[min(290px,calc(100vw-2rem))] rounded-[8px] border border-[#dce3ed] bg-white p-4 shadow-[0_18px_40px_rgba(19,35,63,0.16)]">
                                    {[
                                        ['Rooms', roomsCount, () => setRoomsCount(Math.max(1, roomsCount - 1)), () => setRoomsCount(roomsCount + 1)],
                                        ['Adults', adultsCount, () => setAdultsCount(Math.max(1, adultsCount - 1)), () => setAdultsCount(adultsCount + 1)],
                                        ['Children', childrenCount, () => setChildrenCount(Math.max(0, childrenCount - 1)), () => setChildrenCount(childrenCount + 1)],
                                    ].map(([label, value, minus, plus]) => (
                                        <div key={label} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                                            <span className="text-sm font-semibold text-[#263550]">{label}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={minus} className="h-8 w-8 rounded-full border border-[#d6deea] text-lg font-semibold text-slate-600 hover:bg-slate-50">−</button>
                                                <span className="w-5 text-center text-sm font-bold">{value}</span>
                                                <button type="button" onClick={plus} className="h-8 w-8 rounded-full border border-[#d6deea] text-lg font-semibold text-slate-600 hover:bg-slate-50">+</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setShowGuestsDropdown(false)}
                                        className="mt-3 w-full rounded-[6px] bg-[#ff650d] py-2.5 text-sm font-bold text-white hover:bg-[#ef5700]"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex h-[44px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-[6px] bg-[#ff650d] px-4 text-[13px] font-extrabold text-white shadow-[0_5px_14px_rgba(255,101,13,0.20)] transition-all hover:bg-[#ef5700] active:translate-y-px sm:col-span-2 lg:col-span-2"
                        >
                            <Search size={16} /> Search Hotels
                        </button>
                    </form>
                </section>


                {/* Mobile/tablet filter control */}
                <button
                    type="button"
                    onClick={() => setMobileFiltersOpen((prev) => !prev)}
                    className="mt-3 flex h-11 w-full items-center justify-between rounded-[8px] border border-[#dfe6ef] bg-white px-4 text-[12px] font-extrabold text-[#244a82] shadow-sm lg:hidden"
                >
                    <span className="flex items-center gap-2">
                        <SlidersHorizontal size={16} />
                        {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                    </span>
                    <ChevronDown size={16} className={mobileFiltersOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>

                {/* Desktop: filter stays sticky under calendar. Mobile/tablet: normal page flow. */}
                <div className="mt-3 grid grid-cols-1 items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
                    {/* Filters */}
                    <aside className={`${mobileFiltersOpen ? "flex" : "hidden"} h-fit flex-col overflow-hidden rounded-[8px] border border-[#e3e8f0] bg-white shadow-[0_4px_16px_rgba(19,35,63,0.05)] lg:sticky lg:top-[96px] lg:flex lg:max-h-[calc(100vh-108px)]`}>
                        <div className="shrink-0 border-b border-[#eef1f5] bg-white px-4 py-3 shadow-[0_4px_10px_rgba(19,35,63,0.035)]">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="mb-2.5 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#24558f] transition hover:text-[#143c70]"
                            >
                                <ArrowLeft size={15} strokeWidth={2.5} /> Back
                            </button>
                            <div className="flex items-center justify-between">
                                <h2 className="text-[18px] font-extrabold text-[#17243b]">Filters</h2>
                                <button onClick={clearAllFilters} className="text-[11px] font-bold text-[#ff4a28] hover:underline">Clear all</button>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5 lg:overflow-y-auto lg:overscroll-auto lg:[scrollbar-gutter:stable] lg:[scrollbar-width:thin]">
                            <div className="border-b border-[#eef1f5] pb-5">
                                <div className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-[#334461]">Search by</div>
                                <div className="relative">
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by hotel name, location"
                                        className="h-10 w-full rounded-[5px] border border-[#d8e0eb] bg-white pl-3 pr-9 text-[12px] text-[#334461] outline-none focus:border-[#2f6fed]"
                                    />
                                    <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#60718d]" />
                                </div>
                            </div>

                            <div className="border-b border-[#eef1f5] py-5">
                                <div className="mb-4 text-[10px] font-extrabold uppercase tracking-wide text-[#334461]">Popular filters</div>
                                <div className="space-y-3">
                                    <label className="flex cursor-pointer items-center justify-between gap-3 text-[13px] text-[#4b5971] [overflow-wrap:anywhere]">
                                        <span className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={dealFilters.exclusive}
                                                onChange={(e) => setDealFilters((prev) => ({ ...prev, exclusive: e.target.checked }))}
                                                className="h-4 w-4 rounded border-slate-300 accent-[#2f6fed]"
                                            />
                                            Agoda Exclusive Deal
                                        </span>
                                        <span className="rounded-[3px] bg-[#f02020] px-1.5 py-0.5 text-[9px] font-extrabold text-white">NEW</span>
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#4b5971]">
                                        <input
                                            type="checkbox"
                                            checked={dealFilters.freeCancellation}
                                            onChange={(e) => setDealFilters((prev) => ({ ...prev, freeCancellation: e.target.checked }))}
                                            className="h-4 w-4 rounded border-slate-300 accent-[#2f6fed]"
                                        />
                                        Free Cancellation
                                    </label>
                                </div>
                            </div>

                            <div className="border-b border-[#eef1f5] py-5">
                                <div className="mb-1 flex items-baseline gap-1 text-[10px] font-extrabold uppercase tracking-wide text-[#334461]">
                                    Price range <span className="normal-case font-medium text-[9px] text-[#8a96aa]">(per night)</span>
                                </div>
                                <div className="mb-4 mt-3 text-[15px] font-extrabold text-[#17243b]">
                                    ₹0 - ₹{maxPrice.toLocaleString('en-IN')}
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={MAX_PRICE}
                                    step="1000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="h-1.5 w-full cursor-pointer accent-[#ff650d]"
                                />
                                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[#5c6b82]">
                                    <span>₹0</span>
                                    <span>₹{MAX_PRICE.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="border-b border-[#eef1f5] py-5">
                                <div className="mb-4 text-[10px] font-extrabold uppercase tracking-wide text-[#334461]">Star rating</div>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 0].map((star) => (
                                        <label key={star} className="flex cursor-pointer items-center justify-between gap-3">
                                            <span className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={!!starFilters[star]}
                                                    onChange={(e) => setStarFilters((prev) => ({ ...prev, [star]: e.target.checked }))}
                                                    className="h-4 w-4 rounded border-slate-300 accent-[#2f6fed]"
                                                />
                                                {star === 0 ? (
                                                    <span className="text-[12px] font-medium text-[#59677f]">Unrated</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[#ff7213]">
                                                        {Array.from({ length: star }).map((_, i) => (
                                                            <Star key={i} size={13} className="fill-current" />
                                                        ))}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-[11px] font-semibold text-[#718097]">{starCount(star)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="border-b border-[#eef1f5] py-5">
                                <div className="mb-4 text-[10px] font-extrabold uppercase tracking-wide text-[#334461]">Guest rating</div>
                                <div className="space-y-2.5">
                                    {[
                                        ['4', '4.0+  Excellent'],
                                        ['3', '3.0+  Very Good'],
                                        ['2', '2.0+  Good'],
                                        ['any', 'Any Rating'],
                                    ].map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setGuestRating(value)}
                                            className={`flex h-9 w-full items-center justify-between rounded-[4px] border px-3 text-left text-[11px] font-semibold transition-colors ${
                                                guestRating === value
                                                    ? 'border-[#2f6fed] bg-blue-50 text-[#214b9a]'
                                                    : 'border-[#d8e0eb] bg-white text-[#40506a] hover:bg-slate-50'
                                            }`}
                                        >
                                            <span>{label}</span>
                                            <span>{ratingCount(value)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-5">
                                <div className="mb-4 text-[10px] font-extrabold uppercase tracking-wide text-[#334461]">Amenities</div>
                                <div className="space-y-3">
                                    {(showAllAmenities ? amenityItems : amenityItems.slice(0, 5)).map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <label key={item.key} className="flex cursor-pointer items-center justify-between gap-3 text-[12px] text-[#4d5b72] [overflow-wrap:anywhere]">
                                                <span className="flex items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={amenityFilters[item.key]}
                                                        onChange={(e) => setAmenityFilters((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                                                        className="h-4 w-4 rounded border-slate-300 accent-[#2f6fed]"
                                                    />
                                                    <Icon size={14} className="text-[#6d7d95]" />
                                                    {item.label}
                                                </span>
                                                <span className="rounded bg-[#f1f4f8] px-1.5 py-0.5 text-[10px] font-semibold text-[#59677f]">
                                                    {amenityCount(item.aliases, item.ratio)}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAllAmenities((prev) => !prev)}
                                    className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#1567d8]"
                                >
                                    {showAllAmenities ? 'Show less' : 'Show more'} <ChevronDown size={13} className={showAllAmenities ? 'rotate-180' : ''} />
                                </button>
                            </div>
                        </div>

                    </aside>

                    {/* Results */}
                    <section className="min-w-0">
                        <div className="z-20 flex flex-col justify-between gap-3 rounded-[8px] border border-[#e7ebf2] bg-white px-3 py-3 shadow-[0_4px_12px_rgba(19,35,63,0.05)] sm:flex-row sm:flex-wrap sm:items-center sm:px-4 lg:sticky lg:top-[96px]">
                            <div className="text-[12px] text-[#5c6a7f]">
                                Showing <strong className="font-extrabold text-[#334461]">{filteredHotels.length}</strong> hotels
                            </div>
                            <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-[#68768b]">
                                <span>Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="h-9 w-full min-w-0 rounded-[5px] border border-[#dce3ed] bg-white px-3 text-[11px] font-semibold text-[#44536b] outline-none sm:w-auto sm:min-w-[170px]"
                                >
                                    <option value="star-desc">Star - High to Low</option>
                                    <option value="star-asc">Star - Low to High</option>
                                    <option value="price-asc">Price - Low to High</option>
                                    <option value="price-desc">Price - High to Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-3 space-y-3">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="grid min-h-[220px] animate-pulse grid-cols-1 overflow-hidden rounded-[7px] border border-[#e3e8f0] bg-white p-3 sm:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
                                        <div className="h-[170px] rounded-[4px] bg-slate-200 sm:h-full sm:min-h-[200px]" />
                                        <div className="flex-1 space-y-4 p-5">
                                            <div className="h-5 w-1/2 rounded bg-slate-200" />
                                            <div className="h-3 w-1/4 rounded bg-slate-200" />
                                            <div className="h-3 w-2/3 rounded bg-slate-200" />
                                            <div className="h-3 w-1/2 rounded bg-slate-200" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredHotels.length > 0 ? (
                                filteredHotels.map((hotel, index) => {
                                    const nightly = Number(hotel?.pricePerNight || hotel?.price || 0);
                                    const displayPrice = nightly > 0 ? nightly * nights : 0;
                                    const starValue = Math.max(0, Math.min(5, Number(hotel?.stars || 0)));
                                    const address = hotel?.address || `${hotel?.city || cityLabel}, India`;

                                    return (
                                        <article
                                            key={hotel?.id || hotel?._id || `${hotel?.name}-${index}`}
                                            className="group grid min-h-[225px] grid-cols-1 overflow-hidden rounded-[7px] border border-[#e0e6ee] bg-white shadow-[0_4px_14px_rgba(19,35,63,0.035)] transition-all duration-200 hover:border-[#ccd6e4] hover:shadow-[0_10px_28px_rgba(19,35,63,0.09)] lg:grid-cols-[220px_minmax(0,1fr)_170px] xl:grid-cols-[250px_minmax(0,1fr)_190px]"
                                        >
                                            <div className="relative h-[180px] overflow-hidden bg-slate-100 sm:h-[220px] lg:h-full lg:min-h-[225px]">
                                                <img
                                                    src={hotel?.image || hotel?.imageUrl}
                                                    alt={hotel?.name || 'Hotel'}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#a6b0bf] shadow-md transition hover:text-[#ff5a43]"
                                                    aria-label="Save hotel"
                                                >
                                                    <Heart size={18} />
                                                </button>
                                            </div>

                                            <div className="flex min-w-0 flex-col px-4 py-4 sm:px-5">
                                                <h3 className="break-words text-[16px] font-extrabold leading-[1.25] text-[#17243b] sm:text-[18px]">{hotel?.name || 'Hotel'}</h3>
                                                <div className="mt-1 break-words text-[12px] leading-5 text-[#7b879a]">{hotel?.city || cityLabel}</div>
                                                <div className="mt-2 flex items-center gap-1 text-[#ff7213]">
                                                    {starValue > 0 ? Array.from({ length: starValue }).map((_, i) => (
                                                        <Star key={i} size={13} className="fill-current" />
                                                    )) : <span className="text-[11px] text-slate-400">Unrated</span>}
                                                </div>

                                                <p className="mt-4 max-w-[560px] break-words text-[12px] leading-5 text-[#69778d]">{address}</p>

                                                <div className="mt-auto pt-5">
                                                    <span className="inline-flex max-w-full items-center whitespace-normal rounded-[4px] bg-[#fff3e9] px-2.5 py-1.5 text-[10px] font-bold leading-4 text-[#ef6b1d]">
                                                        %&nbsp; Monsoon Mega Deals
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-end border-t border-[#eef1f5] px-4 py-4 text-left sm:px-5 sm:text-right lg:border-l lg:border-t-0">
                                                <div>
                                                    <div className="whitespace-nowrap text-[18px] font-extrabold leading-tight text-[#17243b] sm:text-[20px]">
                                                        ₹ {displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="mt-1 text-[11px] text-[#6e7d92]">For {nights} night{nights !== 1 ? 's' : ''}</div>
                                                    <div className="mt-1 text-[10px] text-[#8d98a9]">Includes taxes & fees</div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/hotels/detail/${hotel?.id || hotel?._id}?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${roomsCount}&adults=${adultsCount}&children=${childrenCount}&guests=${adultsCount + childrenCount}&city=${encodeURIComponent(hotel?.city || cityLabel)}`)}
                                                    className="mt-5 h-11 w-full rounded-[5px] bg-[#ff650d] text-[12px] font-extrabold text-white transition-colors hover:bg-[#ef5700]"
                                                >
                                                    Choose Room
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-[8px] border border-[#e3e8f0] bg-white px-6 py-20 text-center shadow-[0_4px_12px_rgba(19,35,63,0.03)]">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f8ff] text-[#2572e4]">
                                        <Building2 size={32} />
                                    </div>
                                    <h3 className="mb-2 text-[16px] font-extrabold text-[#17243b]">No hotels found</h3>
                                    <p className="max-w-[300px] text-[13px] leading-5 text-[#69778d]">
                                        We couldn't find any hotels matching your search. Try adjusting your dates, destination, or filters.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <section className="mt-5 grid grid-cols-1 overflow-hidden rounded-[8px] border border-[#dce4ef] bg-white sm:grid-cols-2 xl:mt-7 xl:grid-cols-4">
                    {[
                        [ShieldCheck, 'Secure Booking', 'Your data is safe with us'],
                        [PhoneCall, '24x7 Customer Support', 'We are here to help you'],
                        [ClipboardCheck, 'Instant Confirmation', 'Get instant booking confirmation'],
                        [RefreshCcw, 'Flexible Cancellation', 'On most of the hotels'],
                    ].map(([Icon, title, subtitle], index) => (
                        <div key={title} className={`flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5 ${index > 0 ? 'border-t sm:border-l sm:border-t-0' : ''} border-[#eef2f6]`}>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f8ff] text-[#2572e4]">
                                <Icon size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-extrabold text-[#2f4363]">{title}</div>
                                <div className="mt-1 text-[9px] text-[#7a879a]">{subtitle}</div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            <Footer />
        </div>
    );
}

function MiniCalendar({ value, min, onSelect, openUp, fares = {} }) {
    const initial = value ? new Date(`${value}T00:00:00`) : (min ? new Date(`${min}T00:00:00`) : new Date());
    const [viewYear, setViewYear] = useState(initial.getFullYear());
    const [viewMonth, setViewMonth] = useState(initial.getMonth());

    const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const offset = (firstDayWeekday + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const minDate = min ? new Date(`${min}T00:00:00`) : null;

    const goPrev = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); };
    const goNext = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); };

    return (
        <div className={`mini-cal ${openUp ? 'mini-cal--up' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
            <div className="mini-cal__header">
                <button type="button" onClick={goPrev}><ChevronLeft size={15} /></button>
                <span>{new Date(viewYear, viewMonth, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <button type="button" onClick={goNext}><ChevronRight size={15} /></button>
            </div>
            <div className="mini-cal__weekdays">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="mini-cal__grid">
                {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${viewYear}-${monthStr}-${String(day).padStart(2, '0')}`;
                    const dateObj = new Date(viewYear, viewMonth, day);
                    const isDisabled = minDate && dateObj < minDate;
                    const isSelected = value === dateStr;
                    const fareObj = fares[dateStr];
                    const price = fareObj ? (fareObj.price || fareObj.fare || (typeof fareObj === 'number' ? fareObj : null)) : null;

                    return (
                        <button
                            type="button"
                            key={i}
                            disabled={isDisabled}
                            className={`mini-cal__day ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelect(dateStr)}
                        >
                            <div className="mini-cal__day-num">{day}</div>
                            {price && !isDisabled && <div className="mini-cal__day-fare">₹{price}</div>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}