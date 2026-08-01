import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Users, MapPin, Search, Star, Share2, ChevronDown, SlidersHorizontal, ArrowUpDown, Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { searchHotelsByLocation } from '../services/hotelApi'

export default function HotelListPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Search parameters state (synced with URL)
    const [destination, setDestination] = useState('Pune, Maharashtra, India');
    const [checkIn, setCheckIn] = useState('2026-07-20');
    const [checkOut, setCheckOut] = useState('2026-07-23');
    const [roomsCount, setRoomsCount] = useState(1);
    const [adultsCount, setAdultsCount] = useState(2);
    const [childrenCount, setChildrenCount] = useState(0);

    // Live Hotels & Loading state
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
    const guestsRef = useRef(null);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [dealFilters, setDealFilters] = useState({ exclusive: false, popular: false });
    const [starFilters, setStarFilters] = useState({ 5: false, 4: false, 3: false, 2: false, 1: false, 0: false });
    const [maxPrice, setMaxPrice] = useState(143996);
    const [sortBy, setSortBy] = useState('star-desc');

    // Parse URL query params and fetch hotels
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const dest = queryParams.get('destination') || 'Pune, Maharashtra, India';
        const checkI = queryParams.get('checkIn') || '2026-07-20';
        const checkO = queryParams.get('checkOut') || '2026-07-23';
        const rms = parseInt(queryParams.get('rooms')) || 1;
        const adults = parseInt(queryParams.get('adults')) || parseInt(queryParams.get('guests')) || 2;
        const kids = parseInt(queryParams.get('children')) || 0;

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
                    guests: adults + kids
                });
                if (data && data.success) {
                    setHotels(data.hotels || []);
                }
            } catch (err) {
                console.error("Error fetching live hotels:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveHotels();
    }, [location.search]);

    // Click outside listener for guests dropdown
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (guestsRef.current && !guestsRef.current.contains(e.target)) {
                setShowGuestsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const clearAllFilters = () => {
        setSearchQuery('');
        setDealFilters({ exclusive: false, popular: false });
        setStarFilters({ 5: false, 4: false, 3: false });
        setMaxPrice(143996);
        setSortBy('star-desc');
    };

    const getNightsCount = () => {
        if (!checkIn || !checkOut) return 3;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 3;
    };

    const nights = getNightsCount();

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const totalGuests = adultsCount + childrenCount;
        navigate(`/hotels/list?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${roomsCount}&adults=${adultsCount}&children=${childrenCount}&guests=${totalGuests}`);
    };

    const filteredHotels = hotels.filter(hotel => {
        if (searchQuery.trim() !== '') {
            const match = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hotel.address.toLowerCase().includes(searchQuery.toLowerCase());
            if (!match) return false;
        }
        const activeStars = Object.keys(starFilters).filter(key => starFilters[key]);
        if (activeStars.length > 0) {
            if (!starFilters[hotel.stars]) return false;
        }
        const activeDeals = Object.keys(dealFilters).filter(key => dealFilters[key]);
        if (activeDeals.length > 0) {
            if (dealFilters.exclusive && hotel.dealType !== 'exclusive') return false;
            if (dealFilters.popular && hotel.dealType !== 'popular') return false;
        }
        const totalPrice = hotel.pricePerNight * nights;
        if (totalPrice > maxPrice) return false;

        return true;
    }).sort((a, b) => {
        if (sortBy === 'star-desc') return b.stars - a.stars;
        if (sortBy === 'star-asc') return a.stars - b.stars;
        if (sortBy === 'price-asc') return a.pricePerNight - b.pricePerNight;
        if (sortBy === 'price-desc') return b.pricePerNight - a.pricePerNight;
        return 0;
    });

    return (
        <div className="min-h-screen bg-[#f1f3f6] font-sans text-slate-800 antialiased pt-[70px]">
            <Navbar />

            {/* ── Top Cleartrip Style Search Bar (Sticky at top-0 above Navbar) ── */}
            <div className="bg-white border-b border-slate-200 pt-2.5 pb-3 shadow-md sticky top-0 z-[1001]">
                <div className="mx-auto max-w-7xl px-4">
                    {/* Breadcrumb */}
                    <div className="text-[11px] flex items-center space-x-1 mb-2.5">
                        <span className="cursor-pointer text-[#ff5a3d] hover:underline font-medium" onClick={() => navigate('/')}>Home</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-400 font-normal">Hotel List</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">

                        {/* Location Input Box */}
                        <div className="md:col-span-4 relative border border-slate-300 rounded px-3 py-1 bg-white hover:border-slate-400 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500">
                            <span className="block text-[10px] font-semibold text-slate-400 leading-none">Hotel name/city*</span>
                            <div className="flex items-center mt-1">
                                <MapPin className="h-4 w-4 text-slate-300 mr-2 shrink-0" />
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full text-sm font-medium text-slate-800 focus:outline-none placeholder-slate-400 bg-transparent"
                                    placeholder="Enter location"
                                />
                            </div>
                        </div>

                        {/* Check-in box */}
                        <div className="md:col-span-3 border border-slate-300 rounded px-3 py-1 bg-white flex items-center justify-between hover:border-slate-400 focus-within:border-slate-500">
                            <div className="w-1/2">
                                <span className="block text-[10px] font-semibold text-slate-400 leading-none">Check-in*</span>
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full text-xs font-semibold text-slate-800 mt-1 focus:outline-none bg-transparent"
                                />
                            </div>

                            {/* Nights Badge */}
                            <div className="text-[10px] text-red-500 font-bold border border-red-200 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {nights} Night(s)
                            </div>

                            <div className="w-1/2 text-right pl-2">
                                <span className="block text-[10px] font-semibold text-slate-400 leading-none">Check-out*</span>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full text-xs font-semibold text-slate-800 mt-1 focus:outline-none text-right bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Rooms and guests */}
                        <div className="md:col-span-3 relative border border-slate-300 rounded px-3 py-1 bg-white hover:border-slate-400 focus-within:border-slate-500" ref={guestsRef}>
                            <span className="block text-[10px] font-semibold text-slate-400 leading-none">Rooms and guests*</span>
                            <div
                                className="flex items-center justify-between cursor-pointer mt-1"
                                onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                            >
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 text-slate-300 mr-2" />
                                    <span className="text-sm font-semibold text-slate-700">
                                        {roomsCount} Room(s), {adultsCount + childrenCount} Guest(s)
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </div>

                            {showGuestsDropdown && (
                                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-xl z-40">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-semibold text-slate-700">Rooms</span>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                                                className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold text-slate-800 w-4 text-center">{roomsCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setRoomsCount(roomsCount + 1)}
                                                className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-semibold text-slate-700">Adults</span>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                                                className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold text-slate-800 w-4 text-center">{adultsCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setAdultsCount(adultsCount + 1)}
                                                className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-semibold text-slate-700">Children</span>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                                                className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold text-slate-800 w-4 text-center">{childrenCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setChildrenCount(childrenCount + 1)}
                                                className="h-7 w-7 rounded-full border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowGuestsDropdown(false)}
                                        className="mt-3 w-full rounded bg-orange-500 py-1.5 text-center text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <div className="md:col-span-2">
                            <button
                                type="button"
                                onClick={handleSearchSubmit}
                                className="w-full bg-[#fca5a5] hover:bg-[#f87171] text-white font-bold py-2.5 rounded transition-all text-center text-sm shadow-sm"
                            >
                                Search
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Main Container ── */}
            <main className="mx-auto max-w-7xl px-4 py-4">



                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* ── Sidebar Filters ── */}
                    <aside
                        className="lg:col-span-3 bg-white p-4 rounded border border-slate-200 h-fit"
                        style={{ fontFamily: 'InterRegular, Arial, sans-serif' }}
                    >
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                            <span className="text-sm font-bold text-slate-800">Filters</span>
                            <button
                                onClick={clearAllFilters}
                                className="text-[11px] font-bold text-red-500 hover:text-red-600"
                            >
                                Clear all
                            </button>
                        </div>

                        {/* Keyword Search */}
                        <div className="mb-4">
                            <span className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Search by</span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by hotel name, location"
                                    className="w-full rounded border border-slate-300 py-1.5 pl-2 pr-8 text-xs focus:border-slate-400 focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        {/* Deals check */}
                        <div className="mb-4 border-t border-slate-100 pt-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Hotel deals</span>
                                <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">NEW</span>
                            </div>
                            <div className="space-y-2 text-xs text-slate-600">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={dealFilters.exclusive}
                                        onChange={(e) => setDealFilters({ ...dealFilters, exclusive: e.target.checked })}
                                        className="h-3.5 w-3.5 border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                    />
                                    <span>AgentBox Exclusive Deal</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={dealFilters.popular}
                                        onChange={(e) => setDealFilters({ ...dealFilters, popular: e.target.checked })}
                                        className="h-3.5 w-3.5 border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                    />
                                    <span>Popular Choice</span>
                                </label>
                            </div>
                        </div>

                        {/* Price Slider */}
                        <div className="mb-4 border-t border-slate-100 pt-3" style={{ fontFamily: 'InterMedium, Inter, sans-serif' }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Price</span>
                                <span className="text-[11px] font-bold text-[#ff5a3d] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-none">
                                    Up to ₹{maxPrice.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1659"
                                max="143996"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-none appearance-none cursor-pointer accent-[#ff5a3d]"
                            />
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1.5">
                                <span>₹1,659</span>
                                <span>₹1,43,996</span>
                            </div>
                        </div>

                        {/* Star ratings */}
                        <div
                            className="mb-2 border-t border-slate-100 pt-3"
                            style={{ fontFamily: 'InterMedium, Inter, sans-serif' }}
                        >
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[11px] font-medium text-slate-500 uppercase">Star rating</span>
                                <span className="text-[10px] text-slate-400 cursor-pointer hover:underline font-medium">-Show less</span>
                            </div>
                            <div className="space-y-2 text-xs text-slate-600">
                                {[5, 4, 3, 2, 1, 0].map((star) => (
                                    <label key={star} className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={!!starFilters[star]}
                                                onChange={(e) => setStarFilters({ ...starFilters, [star]: e.target.checked })}
                                                className="h-3.5 w-3.5 border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                            />
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                {star > 0 ? (
                                                    Array.from({ length: star }).map((_, i) => (
                                                        <Star key={i} className="h-3 w-3 fill-current" />
                                                    ))
                                                ) : (
                                                    <Star className="h-3 w-3 text-slate-300 fill-none" />
                                                )}
                                                <span className="ml-1 text-slate-700 font-medium" style={{ fontFamily: 'InterMedium, Inter, sans-serif' }}>{star} Star</span>
                                            </div>
                                        </div>
                                        <span className="text-slate-400 text-[10px] font-medium">
                                            {hotels.filter(h => (h.stars || 0) === star).length}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </aside>

                    {/* ── Hotel Listings ── */}
                    <div className="lg:col-span-9 space-y-3">

                        {/* Listings Header */}
                        <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                            <div>
                                Showing <strong className="text-slate-800 font-black">{filteredHotels.length}</strong> hotels
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">Sort by</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 font-bold focus:outline-none cursor-pointer"
                                    >
                                        <option value="star-desc">Star - High To Low</option>
                                        <option value="star-asc">Star - Low To High</option>
                                        <option value="price-asc">Price - Low To High</option>
                                        <option value="price-desc">Price - High To Low</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => alert("Link Copied to Clipboard!")}
                                    className="flex items-center gap-1 border border-slate-300 rounded px-2.5 py-1 hover:bg-slate-50 text-slate-700 font-bold"
                                >
                                    <Share2 className="h-3 w-3 text-slate-400" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Hotels Grid list */}
                        <div className="space-y-3">
                            {loading ? (
                                // Beautiful Skeleton Loader
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded border border-slate-200 p-4 flex flex-col md:flex-row gap-4 animate-pulse">
                                        <div className="md:w-[260px] h-36 bg-slate-200 rounded shrink-0"></div>
                                        <div className="flex-1 space-y-3 py-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse"></div>
                                            <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                                            <div className="h-6 bg-slate-200 rounded w-1/3 mt-4 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredHotels.length > 0 ? (
                                filteredHotels.map((hotel, index) => {
                                    const totalPrice = hotel.pricePerNight * nights;

                                    return (
                                        <div
                                            key={hotel.id}
                                            className="p-3.5 min-h-[170px] bg-white rounded-none border border-slate-200 overflow-hidden flex flex-col md:flex-row relative group hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out gap-4"
                                        >
                                            {/* Watermark Diagonal/Repeating layout matching user screenshot */}
                                            <div className="absolute inset-0 grid grid-cols-3 gap-8 p-12 pointer-events-none select-none overflow-hidden opacity-[0.03] z-0">
                                                {Array.from({ length: 9 }).map((_, i) => (
                                                    <div key={i} className="text-slate-900 font-black text-xs tracking-widest -rotate-45 whitespace-nowrap">
                                                        SBA53850
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Image panel with square corners */}
                                            <div className="relative md:w-[225px] h-44 overflow-hidden shrink-0 z-10 rounded-none">
                                                <img
                                                    src={hotel.image}
                                                    alt={hotel.name}
                                                    className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                                                    }}
                                                />
                                                <button className="absolute top-2 right-2 h-7 w-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow text-slate-400 hover:text-red-500 transition-colors">
                                                    <Heart className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            {/* Description & Details info */}
                                            <div className="flex-1 flex flex-col md:flex-row justify-between gap-4 z-10 w-full">

                                                {/* Hotel Meta description */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[18px] text-[rgb(0,0,0)] leading-snug tracking-tight font-['InterMedium','Inter',sans-serif] font-medium">
                                                        {hotel.name}
                                                    </h3>
                                                    <span className="text-[14px] text-[rgb(102,102,102)] block mt-0.5 mb-1 font-['InterRegular','Inter',sans-serif]">{hotel.city}</span>

                                                    {/* Stars display */}
                                                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                                                        {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                                                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                        ))}
                                                    </div>

                                                    {/* Address details */}
                                                    <p className="text-[14px] text-[rgb(102,102,102)] leading-relaxed max-w-xl font-['InterRegular','Inter',sans-serif]">
                                                        {hotel.address && hotel.address !== 'Lucknow, India' && hotel.address !== 'Pune, India' && hotel.address.length > 20 ? hotel.address : 'GATE NO 1, behind METRO, Cash and Pay Colony, Charbagh, Lucknow, Uttar Pradesh 226004'}
                                                    </p>

                                                    {/* Dynamic Badge matching screenshot style */}
                                                    {(hotel.dealType === 'popular' || index % 2 === 0) ? (
                                                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#f97316]/40 text-[#ea580c] text-[11px] font-semibold bg-[#fff7ed]">
                                                            <span className="text-[11px] font-bold">%</span>
                                                            <span>Monsoon Mega Deals</span>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#22c55e]/40 text-[#16a34a] text-[11px] font-semibold bg-[#f0fdf4]">
                                                            <span className="text-[11px] font-bold">%</span>
                                                            <span>Popular Choice</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price Details on Right */}
                                                <div className="flex flex-col justify-between items-end shrink-0 md:border-l border-slate-100 md:pl-4 min-w-[140px] text-right mt-2 md:mt-0">
                                                    <div>
                                                        <div className="text-[18px] text-[rgb(51,51,51)] font-['InterMedium','Inter',sans-serif] font-medium leading-none">
                                                            <span className="text-[12px] font-medium text-[rgb(102,102,102)] mr-1">INR</span>
                                                            {totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-[11px] text-[rgb(102,102,102)] font-['InterRegular','Inter',sans-serif] mt-1 text-right">
                                                            For {nights} night(s)
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => navigate(`/hotels/detail/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${roomsCount}&adults=${adultsCount}&children=${childrenCount}&guests=${adultsCount + childrenCount}&city=${hotel.city}`)}
                                                        className="bg-[#ff5a3d] hover:bg-[#e0452a] text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition-all tracking-wider shadow-sm mt-4 w-full md:w-auto text-center"
                                                    >
                                                        Choose room
                                                    </button>
                                                </div>

                                            </div>

                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white rounded border border-slate-200 p-12 text-center text-slate-400">
                                    <SlidersHorizontal className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <span className="block font-bold text-slate-700 text-sm">Not found data</span>
                                    <span className="text-xs">Try searching for another destination or dates.</span>
                                </div>
                            )}
                        </div>

                    </div>

                </div>

            </main>

            <Footer />
        </div>
    )
}
