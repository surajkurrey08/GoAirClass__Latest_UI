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

export default function FlightsPage() {
    const navigate = useNavigate()
    const [tripType, setTripType] = useState('oneWay')
    const [fromCity, setFromCity] = useState('Bangalore (BLR)')
    const [fromAirport, setFromAirport] = useState('Kempegowda Intl. Airport')
    const [toCity, setToCity] = useState('Mumbai (BOM)')
    const [toAirport, setToAirport] = useState('Chhatrapati Shivaji Maharaj Intl.')
    const [departureDate, setDepartureDate] = useState('2026-07-31')
    const [cabinClass, setCabinClass] = useState('Economy')
    const [travellersCount, setTravellersCount] = useState('1 Adult')

    // UI Toggles
    const [showFromSuggestions, setShowFromSuggestions] = useState(false)
    const [showToSuggestions, setShowToSuggestions] = useState(false)
    const [showTravellersDropdown, setShowTravellersDropdown] = useState(false)
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
        const fromParam = encodeURIComponent(fromCity)
        const toParam = encodeURIComponent(toCity)
        const dateParam = encodeURIComponent(departureDate)
        const cabinParam = encodeURIComponent(cabinClass)
        const travellersParam = encodeURIComponent(travellersCount)
        navigate(`/flights/list?from=${fromParam}&to=${toParam}&date=${dateParam}&cabin=${cabinParam}&travellers=${travellersParam}`)
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
                {/* Tabs */}
                <div className="flight-tabs">
                    <button
                        className={`flight-tab ${tripType === 'oneWay' ? 'active' : ''}`}
                        onClick={() => setTripType('oneWay')}
                    >
                        ✈️ One Way
                    </button>
                    <button
                        className={`flight-tab ${tripType === 'roundTrip' ? 'active' : ''}`}
                        onClick={() => setTripType('roundTrip')}
                    >
                        ⇄ Round Trip
                    </button>
                    <button
                        className={`flight-tab ${tripType === 'multiCity' ? 'active' : ''}`}
                        onClick={() => setTripType('multiCity')}
                    >
                        ☍ Multi City
                    </button>
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

                        {/* Departure Date */}
                        <div className="search-field-box">
                            <label>Departure Date</label>
                            <input
                                type="date"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                            <div className="field-sub">
                                {new Date(departureDate).toLocaleDateString('en-IN', { weekday: 'long' })}
                            </div>
                        </div>

                        {/* Cabin Class */}
                        <div className="search-field-box">
                            <label>Cabin Class</label>
                            <select
                                className="cabin-class-select"
                                value={cabinClass}
                                onChange={(e) => setCabinClass(e.target.value)}
                            >
                                <option value="Economy">Economy</option>
                                <option value="Premium Economy">Premium Economy</option>
                                <option value="Business">Business</option>
                                <option value="First Class">First Class</option>
                            </select>
                            <div className="field-sub">Select preferred class</div>
                        </div>

                    </div>

                    {/* Lowest Fare Calendar Bar (Cleartrip B2B Integration) */}
                    {fareCalendar && (
                        <div style={{ margin: '15px 0 5px 0', padding: '12px 16px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} color="#b89565" /> Lowest Fare Calendar ({fromCity.split(' ')[0]} ➔ {toCity.split(' ')[0]})
                                </span>
                                {loadingCalendar && <span style={{ fontSize: '11px', color: '#b89565', fontWeight: '600' }}>Updating fares...</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'thin' }}>
                                {Object.entries(fareCalendar).slice(0, 10).map(([dateStr, item]) => {
                                    const dateObj = new Date(dateStr);
                                    const isSelected = departureDate === dateStr;
                                    const formattedDay = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                                    return (
                                        <div
                                            key={dateStr}
                                            onClick={() => setDepartureDate(dateStr)}
                                            style={{
                                                minWidth: '85px',
                                                padding: '8px 10px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                border: isSelected ? '2px solid #b89565' : '1px solid #cbd5e1',
                                                background: isSelected ? '#fffbeb' : '#ffffff',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ fontSize: '11px', fontWeight: '600', color: isSelected ? '#b89565' : '#64748b' }}>{formattedDay}</div>
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: isSelected ? '#92400e' : '#0f172a', marginTop: '2px' }}>
                                                ₹{item.price ? item.price.toLocaleString('en-IN') : 'N/A'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Travellers Row */}
                    <div className="travellers-row">
                        <div className="search-field-box" onClick={() => setShowTravellersDropdown(!showTravellersDropdown)}>
                            <label>Travellers</label>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                                {travellersCount}
                            </div>
                            <div className="field-sub">ADT</div>
                            {showTravellersDropdown && (
                                <div className="city-suggestions-dropdown" style={{ padding: '10px' }}>
                                    {['1 Adult', '2 Adults', '3 Adults', '4 Adults', '5+ Adults'].map((tc) => (
                                        <div
                                            key={tc}
                                            className="city-suggestion-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTravellersCount(tc);
                                                setShowTravellersDropdown(false);
                                            }}
                                        >
                                            <span className="city-name-bold">{tc}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
