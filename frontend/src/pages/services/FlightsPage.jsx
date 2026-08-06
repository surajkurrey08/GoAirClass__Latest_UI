// src/pages/services/FlightsPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Calendar, Users, Briefcase, Mail, Phone, Shield, Clock, Compass, Award, Star, MapPin, Search, ChevronDown, ArrowLeftRight, Ticket, CreditCard } from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { searchAirports, getFareCalendar } from '../../services/flightApi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './FlightsPage.css'

gsap.registerPlugin(ScrollTrigger)

// Import assets
import bgImg from '../../assets/Flight img 3.png'
import planeImg from '../../assets/ChatGPT Image Jul 30, 2026, 04_32_04 PM.png'
import roadmapBg from '../../assets/background img flight .png'

const FLEET_DATA = [
    {
        id: 'light-jet',
        name: 'Phenom 300E',
        category: 'Light Jet',
        image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=600&auto=format&fit=crop',
        desc: 'The fastest and longest-ranged single-pilot jet in production, featuring a spacious cabin.',
        seats: '6-8 Passengers',
        range: '2,010 nm',
        speed: '464 ktas',
        luggage: '74 cu ft',
        price: '₹2,50,000'
    },
    {
        id: 'midsize-jet',
        name: 'Praetor 500',
        category: 'Midsize Jet',
        image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=600&auto=format&fit=crop',
        desc: 'A corner-to-corner business jet delivering incredible speed and unmatched range.',
        seats: '7-9 Passengers',
        range: '3,340 nm',
        speed: '466 ktas',
        luggage: '150 cu ft',
        price: '₹4,20,000'
    },
    {
        id: 'heavy-jet',
        name: 'Gulfstream G650ER',
        category: 'Ultra Long Range',
        image: 'https://images.unsplash.com/photo-1520437358207-3dbf69998d53?q=80&w=600&auto=format&fit=crop',
        desc: 'The gold standard of business aviation. Clean air, quiet cabin, and maximum comfort.',
        seats: '13-19 Passengers',
        range: '7,500 nm',
        speed: '516 ktas',
        luggage: '195 cu ft',
        price: '₹7,80,000'
    }
]

const AIRPORTS = [
    { city: 'Bangalore (BLR)', name: 'Kempegowda Intl. Airport' },
    { city: 'Mumbai (BOM)', name: 'Chhatrapati Shivaji Maharaj Intl.' },
    { city: 'Delhi (DEL)', name: 'Indira Gandhi Intl. Airport' },
    { city: 'Pune (PNQ)', name: 'Pune Airport' },
    { city: 'Goa (GOI)', name: 'Dabolim Airport' },
    { city: 'Kolkata (CCU)', name: 'Netaji Subhash Chandra Bose Intl.' },
    { city: 'Chennai (MAA)', name: 'Chennai Intl. Airport' },
    { city: 'Hyderabad (HYD)', name: 'Rajiv Gandhi Intl. Airport' },
    { city: 'Ahmedabad (AMD)', name: 'Sardar Vallabhbhai Patel Intl.' },
    { city: 'Jaipur (JAI)', name: 'Jaipur Intl. Airport' },
    { city: 'Lucknow (LKO)', name: 'Chaudhary Charan Singh Intl.' },
    { city: 'Kochi (COK)', name: 'Cochin Intl. Airport' },
    { city: 'Guwahati (GAU)', name: 'Lokpriya Gopinath Bordoloi Intl.' },
    { city: 'Amritsar (ATQ)', name: 'Sri Guru Ram Dass Jee Intl.' },
    { city: 'Srinagar (SXR)', name: 'Sheikh ul-Alam Intl. Airport' },
    { city: 'Patna (PAT)', name: 'Jay Prakash Narayan Airport' },
    { city: 'Bhubaneswar (BBI)', name: 'Biju Patnaik Airport' },
    { city: 'Indore (IDR)', name: 'Devi Ahilyabai Holkar Airport' },
    { city: 'Chandigarh (IXC)', name: 'Chandigarh Airport' },
    { city: 'Visakhapatnam (VTZ)', name: 'Visakhapatnam Airport' },
    { city: 'Coimbatore (CJB)', name: 'Coimbatore Airport' },
    { city: 'Nagpur (NAG)', name: 'Dr. Babasaheb Ambedkar Intl.' },
    { city: 'London (LHR)', name: 'Heathrow Airport' },
    { city: 'Dubai (DXB)', name: 'Dubai Intl. Airport' },
    { city: 'Singapore (SIN)', name: 'Changi Airport' },
    { city: 'New York (JFK)', name: 'John F. Kennedy Intl.' },
    { city: 'Bangkok (BKK)', name: 'Suvarnabhumi Airport' }
]

const getTodayDateString = () => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

const getFutureDateString = (daysToAdd) => {
    const date = new Date()
    date.setDate(date.getDate() + daysToAdd)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

export default function FlightsPage() {
    const navigate = useNavigate()
    const [tripType, setTripType] = useState('oneWay')
    const [fromCity, setFromCity] = useState('Bangalore (BLR)')
    const [fromAirport, setFromAirport] = useState('Kempegowda Intl. Airport')
    const [toCity, setToCity] = useState('Mumbai (BOM)')
    const [toAirport, setToAirport] = useState('Chhatrapati Shivaji Maharaj Intl.')
    const [departureDate, setDepartureDate] = useState(getTodayDateString())
    const [returnDate, setReturnDate] = useState(getFutureDateString(5))
    const [cabinClass, setCabinClass] = useState('Economy')
    const [adultsCount, setAdultsCount] = useState(1)
    const [childrenCount, setChildrenCount] = useState(0)
    const [infantsCount, setInfantsCount] = useState(0)

    // UI Toggles
    const [showFromSuggestions, setShowFromSuggestions] = useState(false)
    const [showToSuggestions, setShowToSuggestions] = useState(false)
    const [showTravellersDropdown, setShowTravellersDropdown] = useState(false)
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
    const [showReturnDatePicker, setShowReturnDatePicker] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const [loading, setLoading] = useState(false)

    // Dynamic Airport Autocomplete states
    const [fromSuggestions, setFromSuggestions] = useState([])
    const [toSuggestions, setToSuggestions] = useState([])
    const [loadingFrom, setLoadingFrom] = useState(false)
    const [loadingTo, setLoadingTo] = useState(false)

    useEffect(() => {
        if (!fromCity || fromCity.length < 2) {
            setFromSuggestions([])
            return
        }
        if (fromCity.includes('(')) return

        const delayDebounceFn = setTimeout(async () => {
            setLoadingFrom(true)
            try {
                const res = await searchAirports(fromCity)
                if (res.success && res.data) {
                    setFromSuggestions(res.data)
                }
            } catch (e) {
                console.error("Error fetching from suggestions:", e)
            } finally {
                setLoadingFrom(false)
            }
        }, 400)

        return () => clearTimeout(delayDebounceFn)
    }, [fromCity])

    useEffect(() => {
        if (!toCity || toCity.length < 2) {
            setToSuggestions([])
            return
        }
        if (toCity.includes('(')) return

        const delayDebounceFn = setTimeout(async () => {
            setLoadingTo(true)
            try {
                const res = await searchAirports(toCity)
                if (res.success && res.data) {
                    setToSuggestions(res.data)
                }
            } catch (e) {
                console.error("Error fetching to suggestions:", e)
            } finally {
                setLoadingTo(false)
            }
        }, 400)

        return () => clearTimeout(delayDebounceFn)
    }, [toCity])

    // Fare Calendar State & Integration
    const [fareCalendar, setFareCalendar] = useState(null)
    const [loadingCalendar, setLoadingCalendar] = useState(false)

    useEffect(() => {
        const fetchCalendarData = async () => {
            const extractCode = (str) => {
                if (!str) return 'DEL';
                const match = str.match(/\(([^)]+)\)/);
                return match ? match[1] : str.slice(0, 3).toUpperCase();
            };
            const originCode = extractCode(fromCity);
            const destCode = extractCode(toCity);

            setLoadingCalendar(true);
            try {
                const res = await getFareCalendar({ origin: originCode, destination: destCode });
                if (res.success && res.data && res.data.fares) {
                    setFareCalendar(res.data.fares);
                }
            } catch (err) {
                console.error("Fare calendar load error:", err);
            } finally {
                setLoadingCalendar(false);
            }
        };

        fetchCalendarData();
    }, [fromCity, toCity])

    useEffect(() => {
        // 1. Initial 3D Cinematic entry animation on page load
        const entryTl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } })

        entryTl.fromTo('.flights-hero-tag',
            { opacity: 0, rotationY: -180, scale: 0.5, y: -50 },
            { opacity: 1, rotationY: 0, scale: 1, y: 0, duration: 1.5 }
        )
        entryTl.fromTo('.flights-hero-title',
            { opacity: 0, rotationX: -70, transformOrigin: 'top center', z: -150 },
            { opacity: 1, rotationX: 0, z: 0, duration: 1.6, ease: 'power4.out' },
            '-=1.0'
        )
        entryTl.fromTo('.flights-hero-desc',
            { opacity: 0, x: -120, skewX: -20 },
            { opacity: 1, x: 0, skewX: 0, duration: 1.4, ease: 'power3.out' },
            '-=1.2'
        )
        entryTl.fromTo('.flights-hero-content .btn-flynext-primary',
            { opacity: 0, x: 120, scale: 0.8 },
            { opacity: 1, x: 0, scale: 1, duration: 1.3 },
            '-=1.0'
        )

        // 2. Loop Timeline: Synchronizes plane flight and automatic text adjustment/reaction (Gold theme)
        const loopTl = gsap.timeline({ repeat: -1 })

        // Plane flies from left to right across the screen (duration 22s)
        loopTl.fromTo('.hero-animating-plane',
            { x: '-50vw', y: '30vh', scale: 0.7, rotation: 12, opacity: 1 },
            {
                x: '110vw',
                y: '-10vh',
                scale: 1.8,
                rotation: -4,
                opacity: 1,
                duration: 22,
                ease: 'power2.out'
            },
            0 // Start flight at time 0s
        )

        // Text shifts down, scales, and tilts when plane approaches center (starts fast, so reaches center earlier around 6s)
        loopTl.to('.flights-hero-content',
            {
                y: 35,
                scale: 0.94,
                skewX: -6,
                rotation: -2,
                duration: 2.2,
                ease: 'power2.out'
            },
            5.8 // Trigger when plane is close to the text (earlier due to power2.out)
        )

        // Title glows/highlights as the jet wash passes
        loopTl.to('.flights-hero-title',
            {
                color: '#b89565',
                textShadow: '0 0 25px rgba(184, 149, 101, 0.85)',
                duration: 1.5,
                yoyo: true,
                repeat: 1
            },
            7.2
        )

        // Text dynamically recovers and springs back to normal after plane passes
        loopTl.to('.flights-hero-content',
            {
                y: 0,
                scale: 1,
                skewX: 0,
                rotation: 0,
                duration: 3.5,
                ease: 'elastic.out(1, 0.6)'
            },
            10.5
        )

        // 3. Parallax effect on the hero background image as user scrolls
        gsap.to('.hero-bg-img', {
            yPercent: 20,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: {
                trigger: '.flights-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        })

        // 4. Booking Roadmap ScrollTrigger entrance animations
        gsap.fromTo('.roadmap-header',
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.roadmap-section',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        )

        gsap.fromTo('.roadmap-step',
            { opacity: 0, y: 60, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: 0.2,
                ease: 'back.out(1.5)',
                scrollTrigger: {
                    trigger: '.roadmap-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        )

        // 5. Parallax effect on the Booking Roadmap background map image as user scrolls
        gsap.to('.roadmap-bg-map', {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
                trigger: '.roadmap-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        })

        // 6. Floating parallax effect on the Flight Search card (charter-enquiry-form) as user scrolls
        gsap.to('.flight-search-container', {
            y: -60,
            ease: 'none',
            scrollTrigger: {
                trigger: '.flights-hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        })
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        const totalPax = adultsCount + childrenCount + infantsCount;
        const paxStr = `${totalPax} Traveller${totalPax > 1 ? 's' : ''}`;
        const fromParam = encodeURIComponent(fromCity)
        const toParam = encodeURIComponent(toCity)
        const dateParam = encodeURIComponent(departureDate)
        const returnParam = encodeURIComponent(returnDate)
        const tripParam = encodeURIComponent(tripType)
        const cabinParam = encodeURIComponent(cabinClass)
        const travellersParam = encodeURIComponent(paxStr)
        navigate(`/flights/list?from=${fromParam}&to=${toParam}&date=${dateParam}&returnDate=${returnParam}&tripType=${tripParam}&cabin=${cabinParam}&travellers=${travellersParam}&adults=${adultsCount}&children=${childrenCount}&infants=${infantsCount}`)
    }

    const swapLocations = () => {
        const tempCity = fromCity
        const tempAirport = fromAirport
        setFromCity(toCity)
        setFromAirport(toAirport)
        setToCity(tempCity)
        setToAirport(tempAirport)
    }

    return (
        <div className="flights-page-container">
            <Navbar />

            {/* Hero Header */}
            <header className="flights-hero" style={{ position: 'relative', overflow: 'hidden', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0e14' }}>
                {/* Background Image */}
                <img
                    src={bgImg}
                    alt="Background"
                    className="hero-bg-img"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, pointerEvents: 'none', opacity: 1 }}
                />

                {/* Animating Plane */}
                <img
                    src={planeImg}
                    alt="Flying Private Jet"
                    className="hero-animating-plane"
                    style={{ position: 'absolute', top: '10%', left: 0, width: '640px', height: 'auto', pointerEvents: 'none', zIndex: 999999, opacity: 1 }}
                />

                <div className="flights-hero-content">
                    <span className="flights-hero-tag">FLY SMART WITH GOAIRCLASS</span>
                    <h1 className="flights-hero-title">Explore the World with GoAirClass</h1>
                    <p className="flights-hero-desc">
                        Book one-way, round-trip, and multi-city flights with the best deals from leading airlines. Travel smarter with GoAirClass.
                    </p>
                    <a href="#charter-enquiry-form" className="btn-flynext-primary">
                        <Plane size={18} /> Search Flights Now
                    </a>
                </div>
            </header>

            {/* Booking Form Section (Commercial Flight Search) */}
            <section className="flight-search-container" id="charter-enquiry-form">
                {/* Tabs & Travellers Header Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flight-tabs mb-0 flex items-center gap-1">
                        <button
                            type="button"
                            className={`flight-tab ${tripType === 'oneWay' ? 'active' : ''}`}
                            onClick={() => setTripType('oneWay')}
                        >
                            ✈️ One Way
                        </button>
                        <button
                            type="button"
                            className={`flight-tab ${tripType === 'roundTrip' ? 'active' : ''}`}
                            onClick={() => setTripType('roundTrip')}
                        >
                            ⇄ Round Trip
                        </button>
                        <button
                            type="button"
                            className={`flight-tab ${tripType === 'multiCity' ? 'active' : ''}`}
                            onClick={() => setTripType('multiCity')}
                        >
                            ☍ Multi City
                        </button>

                        {/* Travellers & Cabin Class Selector (Directly Inside Tab Row Next to Multi City) */}
                        <div className="relative border-l border-slate-300/60 pl-2 ml-1">
                            <button
                                type="button"
                                onClick={() => setShowTravellersDropdown(!showTravellersDropdown)}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
                            >
                                <Users size={15} className="text-[#b89565]" />
                                <span>{adultsCount + childrenCount + infantsCount} Traveller(s), {cabinClass}</span>
                                <ChevronDown size={14} className="text-slate-500" />
                            </button>

                            {/* Full MakeMyTrip / Cleartrip Style Modal Dropdown */}
                            {showTravellersDropdown && (
                                <div className="absolute top-[110%] right-0 z-[999999] bg-white border border-slate-300 rounded-none shadow-2xl p-3.5 w-[330px]" onClick={(e) => e.stopPropagation()}>
                                    
                                    {/* Adults Counter */}
                                    <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                                        <div>
                                            <div className="font-bold text-slate-800 text-xs">Adults</div>
                                            <div className="text-[10px] text-slate-400 font-medium">12+ Years</div>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                                                disabled={adultsCount <= 1}
                                                className="w-7 h-7 rounded-none border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
                                            >-</button>
                                            <span className="font-bold text-slate-800 text-xs w-4 text-center">{adultsCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setAdultsCount(Math.min(9, adultsCount + 1))}
                                                className="w-7 h-7 rounded-none border border-blue-600 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-50"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Children Counter */}
                                    <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                                        <div>
                                            <div className="font-bold text-slate-800 text-xs">Children</div>
                                            <div className="text-[10px] text-slate-400 font-medium">2 - 12 yrs</div>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                                                disabled={childrenCount <= 0}
                                                className="w-7 h-7 rounded-none border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
                                            >-</button>
                                            <span className="font-bold text-slate-800 text-xs w-4 text-center">{childrenCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setChildrenCount(Math.min(6, childrenCount + 1))}
                                                className="w-7 h-7 rounded-none border border-blue-600 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-50"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Infants Counter */}
                                    <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                                        <div>
                                            <div className="font-bold text-slate-800 text-xs">Infants</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Below 2 yrs</div>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setInfantsCount(Math.max(0, infantsCount - 1))}
                                                disabled={infantsCount <= 0}
                                                className="w-7 h-7 rounded-none border border-slate-300 flex items-center justify-center font-bold text-slate-600 hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
                                            >-</button>
                                            <span className="font-bold text-slate-800 text-xs w-4 text-center">{infantsCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setInfantsCount(Math.min(adultsCount, infantsCount + 1))}
                                                className="w-7 h-7 rounded-none border border-blue-600 text-blue-600 flex items-center justify-center font-bold hover:bg-blue-50"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Cabin Class Options */}
                                    <div className="mb-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cabin Class</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Economy', 'Premium Economy', 'Business', 'First Class'].map((cls) => (
                                                <button
                                                    key={cls}
                                                    type="button"
                                                    onClick={() => setCabinClass(cls)}
                                                    className={`px-2.5 py-1 rounded-none text-xs font-semibold border transition-all ${cabinClass === cls
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                                                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                                                        }`}
                                                >
                                                    {cls}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowTravellersDropdown(false)}
                                        className="w-full bg-[#b89565] hover:bg-[#a38053] text-white font-bold py-1.5 rounded-none text-xs uppercase tracking-wider transition-all shadow-sm"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSearch}>
                    {/* Fields Grid */}
                    <div className="search-fields-grid">

                        {/* From Field */}
                        <div className="search-field-box" onClick={() => { setShowFromSuggestions(true); setShowToSuggestions(false); }}>
                            <label>From</label>
                            <input
                                type="text"
                                value={fromCity}
                                onChange={(e) => setFromCity(e.target.value)}
                                placeholder="Departure City"
                            />
                            <div className="field-sub">{fromAirport}</div>
                            {showFromSuggestions && (
                                <div className="city-suggestions-dropdown">
                                    {loadingFrom && <div className="p-3 text-xs text-[#b89565] font-semibold animate-pulse">Searching airports...</div>}
                                    {fromSuggestions.length > 0 ? (
                                        fromSuggestions.map((ap, i) => (
                                            <div
                                                key={i}
                                                className="city-suggestion-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFromCity(`${ap.airportCity} (${ap.airportCode})`);
                                                    setFromAirport(ap.airportName);
                                                    setShowFromSuggestions(false);
                                                }}
                                            >
                                                <span className="city-name-bold">{ap.airportCity} ({ap.airportCode})</span>
                                                <span className="city-airport-sub">{ap.airportName}</span>
                                            </div>
                                        ))
                                    ) : (
                                        !loadingFrom && AIRPORTS.filter(ap =>
                                            ap.city.toLowerCase().includes(fromCity.toLowerCase()) ||
                                            ap.name.toLowerCase().includes(fromCity.toLowerCase())
                                        ).map((ap, i) => (
                                            <div
                                                key={i}
                                                className="city-suggestion-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFromCity(ap.city);
                                                    setFromAirport(ap.name);
                                                    setShowFromSuggestions(false);
                                                }}
                                            >
                                                <span className="city-name-bold">{ap.city}</span>
                                                <span className="city-airport-sub">{ap.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Swap Button */}
                        <div className="swap-btn-container">
                            <button type="button" className="swap-btn-circle" onClick={swapLocations}>
                                <ArrowLeftRight size={18} />
                            </button>
                        </div>

                        {/* To Field */}
                        <div className="search-field-box" onClick={() => { setShowToSuggestions(true); setShowFromSuggestions(false); }}>
                            <label>To</label>
                            <input
                                type="text"
                                value={toCity}
                                onChange={(e) => setToCity(e.target.value)}
                                placeholder="Destination City"
                            />
                            <div className="field-sub">{toAirport}</div>
                            {showToSuggestions && (
                                <div className="city-suggestions-dropdown">
                                    {loadingTo && <div className="p-3 text-xs text-[#b89565] font-semibold animate-pulse">Searching airports...</div>}
                                    {toSuggestions.length > 0 ? (
                                        toSuggestions.map((ap, i) => (
                                            <div
                                                key={i}
                                                className="city-suggestion-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setToCity(`${ap.airportCity} (${ap.airportCode})`);
                                                    setToAirport(ap.airportName);
                                                    setShowToSuggestions(false);
                                                }}
                                            >
                                                <span className="city-name-bold">{ap.airportCity} ({ap.airportCode})</span>
                                                <span className="city-airport-sub">{ap.airportName}</span>
                                            </div>
                                        ))
                                    ) : (
                                        !loadingTo && AIRPORTS.filter(ap =>
                                            ap.city.toLowerCase().includes(toCity.toLowerCase()) ||
                                            ap.name.toLowerCase().includes(toCity.toLowerCase())
                                        ).map((ap, i) => (
                                            <div
                                                key={i}
                                                className="city-suggestion-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setToCity(ap.city);
                                                    setToAirport(ap.name);
                                                    setShowToSuggestions(false);
                                                }}
                                            >
                                                <span className="city-name-bold">{ap.city}</span>
                                                <span className="city-airport-sub">{ap.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Custom Interactive DatePicker with Cleartrip Prices inside Calendar Grid */}
                        <div className="search-field-box relative cursor-pointer" onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}>
                            <label>Departure Date</label>
                            <div className="text-base font-bold text-slate-800 flex items-center justify-between mt-0.5">
                                <span>{new Date(departureDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                <Calendar size={16} className="text-[#b89565]" />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="field-sub text-[11px] font-semibold text-slate-500">
                                    {new Date(departureDate).toLocaleDateString('en-IN', { weekday: 'long' })}
                                </span>
                                {fareCalendar && fareCalendar[departureDate] && (
                                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        ₹{fareCalendar[departureDate].price ? fareCalendar[departureDate].price.toLocaleString('en-IN') : '3,200'}
                                    </span>
                                )}
                            </div>

                            {/* Cleartrip Custom Calendar Modal Grid */}
                            {showCustomDatePicker && (
                                <div className="absolute top-[105%] left-0 z-[999999] bg-white border border-slate-300 rounded-lg shadow-2xl p-4 w-[340px]" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-3 border-b pb-2 border-slate-100">
                                        <span className="font-bold text-slate-800 text-sm">
                                            {new Date(departureDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button type="button" onClick={() => setShowCustomDatePicker(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded">Close</button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                                        <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {(() => {
                                            const baseDate = new Date(departureDate);
                                            const year = baseDate.getFullYear();
                                            const monthIndex = baseDate.getMonth();
                                            const firstDayWeekday = new Date(year, monthIndex, 1).getDay();
                                            const offset = (firstDayWeekday + 6) % 7;
                                            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                                            const monthStr = String(monthIndex + 1).padStart(2, '0');

                                            return [
                                                ...Array.from({ length: offset }).map((_, idx) => (
                                                    <div key={`empty-${idx}`} className="p-1.5" />
                                                )),
                                                ...Array.from({ length: daysInMonth }).map((_, i) => {
                                                    const dayNum = i + 1;
                                                    const curDateStr = `${year}-${monthStr}-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                                                    const fareItem = fareCalendar ? fareCalendar[curDateStr] : null;
                                                    const priceVal = fareItem ? fareItem.price : null;
                                                    const isSelected = departureDate === curDateStr;

                                                    return (
                                                        <div
                                                            key={i}
                                                            onClick={() => {
                                                                setDepartureDate(curDateStr);
                                                                setShowCustomDatePicker(false);
                                                            }}
                                                            className={`p-1.5 text-center rounded border transition-all cursor-pointer ${isSelected
                                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                                    : 'bg-white border-slate-100 hover:border-[#b89565] hover:bg-amber-50/40 text-slate-700'
                                                                }`}
                                                        >
                                                            <div className="font-bold text-xs">{dayNum}</div>
                                                            <div className={`text-[9px] font-semibold leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                {priceVal ? `₹${priceVal.toLocaleString('en-IN')}` : '-'}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ];
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Return Date with Cleartrip Prices inside Calendar Grid */}
                        {tripType === 'roundTrip' && (
                            <div className="search-field-box relative cursor-pointer" onClick={() => setShowReturnDatePicker(!showReturnDatePicker)}>
                                <label>Return Date</label>
                                <div className="text-base font-bold text-slate-800 flex items-center justify-between mt-0.5">
                                    <span>{returnDate ? new Date(returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Select Date'}</span>
                                    <Calendar size={16} className="text-[#b89565]" />
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="field-sub text-[11px] font-semibold text-slate-500">
                                        {returnDate ? new Date(returnDate).toLocaleDateString('en-IN', { weekday: 'long' }) : 'Select return date'}
                                    </span>
                                    {fareCalendar && fareCalendar[returnDate] && (
                                        <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                            ₹{fareCalendar[returnDate].price ? fareCalendar[returnDate].price.toLocaleString('en-IN') : '3,480'}
                                        </span>
                                    )}
                                </div>

                                {/* Cleartrip Custom Return Calendar Modal Grid */}
                                {showReturnDatePicker && (
                                    <div className="absolute top-[105%] right-0 z-[999999] bg-white border border-slate-300 rounded-lg shadow-2xl p-4 w-[340px]" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-between items-center mb-3 border-b pb-2 border-slate-100">
                                            <span className="font-bold text-slate-800 text-sm">
                                                {new Date(returnDate || departureDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <button type="button" onClick={() => setShowReturnDatePicker(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded">Close</button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                                            <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {(() => {
                                                const baseDate = new Date(returnDate || departureDate);
                                                const year = baseDate.getFullYear();
                                                const monthIndex = baseDate.getMonth();
                                                const firstDayWeekday = new Date(year, monthIndex, 1).getDay();
                                                const offset = (firstDayWeekday + 6) % 7;
                                                const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                                                const monthStr = String(monthIndex + 1).padStart(2, '0');

                                                return [
                                                    ...Array.from({ length: offset }).map((_, idx) => (
                                                        <div key={`empty-${idx}`} className="p-1.5" />
                                                    )),
                                                    ...Array.from({ length: daysInMonth }).map((_, i) => {
                                                        const dayNum = i + 1;
                                                        const curDateStr = `${year}-${monthStr}-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                                                        const fareItem = fareCalendar ? fareCalendar[curDateStr] : null;
                                                        const priceVal = fareItem ? fareItem.price : null;
                                                        const isSelected = returnDate === curDateStr;

                                                        return (
                                                            <div
                                                                key={i}
                                                                onClick={() => {
                                                                    setReturnDate(curDateStr);
                                                                    setShowReturnDatePicker(false);
                                                                }}
                                                                className={`p-1.5 text-center rounded border transition-all cursor-pointer ${isSelected
                                                                        ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                                                                        : 'bg-white border-slate-100 hover:border-[#b89565] hover:bg-amber-50/40 text-slate-700'
                                                                    }`}
                                                            >
                                                                <div className="font-bold text-xs">{dayNum}</div>
                                                                <div className={`text-[9px] font-semibold leading-tight ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                                                                    {priceVal ? `₹${priceVal.toLocaleString('en-IN')}` : '-'}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ];
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}



                    </div>



                    {/* Search Button */}
                    <button type="submit" className="btn-search-flights-submit" disabled={loading}>
                        <Search size={18} /> {loading ? 'Searching...' : 'Search Flights'}
                    </button>
                </form>
            </section>

            {/* Booking Roadmap Section */}
            <section className="roadmap-section" style={{ '--roadmap-bg-url': `url(${roadmapBg})` }}>
                <div className="roadmap-header">
                    <span className="roadmap-subtitle">Booking Roadmap</span>
                    <h2 className="roadmap-title">4 Easy Steps to Your Destination</h2>
                </div>

                <div className="roadmap-grid">
                    {/* Step 1 */}
                    <div className="roadmap-step">
                        <div className="roadmap-icon-outer">
                            <div className="roadmap-icon-inner">
                                <Search />
                            </div>
                        </div>
                        <h3 className="roadmap-step-title">Search Flights</h3>
                        <p className="roadmap-step-desc">
                            Enter your origin, destination, and travel dates to find the best available flight deals.
                        </p>
                        <button className="roadmap-arrow-btn">»</button>
                    </div>

                    {/* Step 2 */}
                    <div className="roadmap-step">
                        <div className="roadmap-icon-outer">
                            <div className="roadmap-icon-inner">
                                <Plane />
                            </div>
                        </div>
                        <h3 className="roadmap-step-title">Compare & Choose</h3>
                        <p className="roadmap-step-desc">
                            Filter by flight duration, airfares, cabin classes, and select your preferred carrier.
                        </p>
                        <button className="roadmap-arrow-btn">»</button>
                    </div>

                    {/* Step 3 */}
                    <div className="roadmap-step">
                        <div className="roadmap-icon-outer">
                            <div className="roadmap-icon-inner">
                                <Users />
                            </div>
                        </div>
                        <h3 className="roadmap-step-title">Passenger Info</h3>
                        <p className="roadmap-step-desc">
                            Fill in traveller details, pick seats, pre-order meals, and add baggage requirements.
                        </p>
                        <button className="roadmap-arrow-btn">»</button>
                    </div>

                    {/* Step 4 */}
                    <div className="roadmap-step">
                        <div className="roadmap-icon-outer">
                            <div className="roadmap-icon-inner">
                                <CreditCard />
                            </div>
                        </div>
                        <h3 className="roadmap-step-title">Quick Booking</h3>
                        <p className="roadmap-step-desc">
                            Make secure payments via multi-channel gateways and get instant tickets.
                        </p>
                        <button className="roadmap-arrow-btn">»</button>
                    </div>
                </div>
            </section>

            {/* Features/Benefits Section */}
            <section className="benefits-section">
                <div className="benefits-inner">
                    <div className="section-title-wrapper" style={{ marginBottom: '50px' }}>
                        <span className="section-subtitle" style={{ color: '#82b440' }}>Flynext Benefits</span>
                        <h2 className="section-main-title" style={{ color: '#1a2744' }}>Why Choose Private Jet Charter?</h2>
                    </div>

                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <Shield />
                            </div>
                            <h3 className="benefit-title">Safety First</h3>
                            <p className="benefit-desc">Our partner aircraft operate under the highest global safety standards, audited regularly.</p>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <Clock />
                            </div>
                            <h3 className="benefit-title">Absolute Flexibility</h3>
                            <p className="benefit-desc">Set your own flight schedules. Arrive just 15 minutes before departure time.</p>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <Compass />
                            </div>
                            <h3 className="benefit-title">Global Reach</h3>
                            <p className="benefit-desc">Access to thousands of regional airports not served by commercial airlines.</p>
                        </div>

                        <div className="benefit-card">
                            <div className="benefit-icon-wrapper">
                                <Award />
                            </div>
                            <h3 className="benefit-title">VIP Luxury</h3>
                            <p className="benefit-desc">Gourmet inflight catering, premium champagne, and personalized concierges.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
