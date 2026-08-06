// src/pages/services/HotelsPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Home, Phone, Star, ArrowRight, Eye, MapPin } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import hotelBannerImg1 from '../../assets/hotel baner img1.png'
import hotelBannerImg2 from '../../assets/hotel baner img 2.png'
import hotelBannerImg3 from '../../assets/hotel baner img 3.png'
import gsap from 'gsap'
import './HotelsPage.css'
import API from '../../services/axios'


import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BANNER_IMAGES = [hotelBannerImg1, hotelBannerImg2, hotelBannerImg3]

export default function HotelsPage() {
    const navigate = useNavigate()

    // Carousel State
    const [currentBgIndex, setCurrentBgIndex] = React.useState(0)

    // Auto slide every 4 seconds
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBgIndex((prevIndex) => (prevIndex + 1) % BANNER_IMAGES.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    // GSAP Landing Animations
    React.useEffect(() => {
        // Hero Section timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        
        tl.fromTo('.stars-container', { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 1.2 })
          .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2 }, '-=0.6')
          .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.5 }, '-=0.9')
          .fromTo('.rooms-suites-btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2 }, '-=0.9')
          .fromTo('.left-side-info', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 1.5 }, '-=1.5')
          .fromTo('.right-side-dots', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1.5 }, '-=1.6')
          .fromTo('.search-bar-wrapper', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.8, ease: 'elastic.out(1, 0.75)' }, '-=1.0')

        // Details Section scroll animations
        gsap.fromTo('.details-text-column', 
            { opacity: 0, x: -60 },
            {
                opacity: 1,
                x: 0,
                duration: 1.8,
                scrollTrigger: {
                    trigger: '.hotels-details-section',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        )

        gsap.fromTo('.offset-down img', 
            { opacity: 0, y: 100 },
            {
                opacity: 1,
                y: 0,
                duration: 1.8,
                scrollTrigger: {
                    trigger: '.hotels-details-section',
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            }
        )

        gsap.fromTo('.offset-up img', 
            { opacity: 0, y: -100 },
            {
                opacity: 1,
                y: 0,
                duration: 1.8,
                scrollTrigger: {
                    trigger: '.hotels-details-section',
                    start: 'top 75%',
                    toggleActions: 'play none none none'
                }
            }
        )

        // Features Grid split animations
        gsap.fromTo('.why-left-content', 
            { opacity: 0, x: -60 },
            {
                opacity: 1,
                x: 0,
                duration: 1.5,
                scrollTrigger: {
                    trigger: '.why-booking-section',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        )

        gsap.fromTo('.feature-card-split', 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.25,
                scrollTrigger: {
                    trigger: '.why-booking-section',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        )

        // Trending Destinations scroll animations
        gsap.fromTo('.destination-card', 
            { opacity: 0, scale: 0.96, y: 30 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.15,
                scrollTrigger: {
                    trigger: '.trending-destinations-section',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        )
    }, [])

    // Search Form State
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

    const [destination, setDestination] = useState('')
    const [checkIn, setCheckIn] = useState(getTodayDateString())
    const [checkOut, setCheckOut] = useState(getFutureDateString(3))
    const [roomsCount, setRoomsCount] = useState(1)
    const [adultsCount, setAdultsCount] = useState(2)
    const [childrenCount, setChildrenCount] = useState(0)
    const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)

    // Autocomplete states
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [suggestionsLoaded, setSuggestionsLoaded] = useState(false)

    // Refs for click outside
    const destinationRef = React.useRef(null)
    const guestsRef = React.useRef(null)
    const suggestionAbortRef = React.useRef(null)
    const suggestionTimerRef = React.useRef(null)

    // Close dropdowns on clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (destinationRef.current && !destinationRef.current.contains(e.target)) {
                setShowSuggestions(false)
            }
            if (guestsRef.current && !guestsRef.current.contains(e.target)) {
                setShowGuestsDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    React.useEffect(() => {
        return () => {
            if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current)
            if (suggestionAbortRef.current) suggestionAbortRef.current.abort()
        }
    }, [])

    const handleDestinationChange = (e) => {
        const value = e.target.value
        setDestination(value)

        if (suggestionTimerRef.current) clearTimeout(suggestionTimerRef.current)
        if (suggestionAbortRef.current) suggestionAbortRef.current.abort()

        if (value.trim().length > 1) {
            setLoadingSuggestions(true)
            setSuggestionsLoaded(false)
            setShowSuggestions(true)

            suggestionTimerRef.current = setTimeout(async () => {
                const controller = new AbortController()
                suggestionAbortRef.current = controller

                try {
                    const response = await API.get(`/hotels/locations?query=${encodeURIComponent(value)}`, {
                        signal: controller.signal,
                        timeout: 35000
                    })
                    if (response.data && response.data.success) {
                        setSuggestions(response.data.locations || [])
                    } else {
                        setSuggestions([])
                    }
                } catch (err) {
                    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return
                    console.error("Error fetching locations:", err)
                    setSuggestions([])
                } finally {
                    if (!controller.signal.aborted) {
                        setLoadingSuggestions(false)
                        setSuggestionsLoaded(true)
                    }
                }
            }, 350)
        } else {
            setSuggestions([])
            setSuggestionsLoaded(false)
            setLoadingSuggestions(false)
            setShowSuggestions(false)
        }
    }

    const getSuggestionText = (item) => {
        if (!item) return ''
        if (typeof item === 'string') return item
        if (item.name) return item.name
        if (item.displayName) return item.displayName
        if (item.cityName) return item.cityName
        if (item.label) return item.label
        return JSON.stringify(item)
    }

    // Derived summary string
    const guestsSummary = `${roomsCount} Room${roomsCount > 1 ? 's' : ''}, ${adultsCount} Adult${adultsCount > 1 ? 's' : ''}${childrenCount > 0 ? `, ${childrenCount} Child${childrenCount > 1 ? 'ren' : ''}` : ''}`

    // Booking Modal State
    const [selectedHotel, setSelectedHotel] = useState(null)
    const [bookingName, setBookingName] = useState('')
    const [bookingEmail, setBookingEmail] = useState('')
    const [bookingPhone, setBookingPhone] = useState('')
    const [bookingSuccess, setBookingSuccess] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(`/hotels/list?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${roomsCount}&adults=${adultsCount}&children=${childrenCount}&guests=${adultsCount + childrenCount}`)
    }

    const handleBookNow = (hotel) => {
        setSelectedHotel(hotel)
        setBookingSuccess(false)
    }

    const handleConfirmBooking = (e) => {
        e.preventDefault()
        setBookingSuccess(true)
        setTimeout(() => {
            setSelectedHotel(null)
            setBookingSuccess(false)
            setBookingName('')
            setBookingEmail('')
            setBookingPhone('')
            alert('Booking Successful! We have sent the details to your email.')
        }, 1500)
    }

    const sampleHotels = [
        {
            id: 1,
            name: 'The Cappa Grand Palace',
            location: 'Manhattan, New York',
            price: '₹14,999',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
            desc: 'Classic elite living with Central Park skyline views, rooftop infinity pools, and personal butler hospitality.'
        },
        {
            id: 2,
            name: 'Viceroy Oceanfront Resort',
            location: 'Miami Beach, Florida',
            price: '₹10,499',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1540548976849-655e2a7f665a?auto=format&fit=crop&w=600&q=80',
            desc: 'Stunning beachside suites offering direct shoreline access, private pool cabanas, and world-class dining.'
        },
        {
            id: 3,
            name: 'Auberge Alpine Chateau',
            location: 'Aspen, Colorado',
            price: '₹12,799',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80',
            desc: 'Cozy stone villas featuring wood-burning fireplaces, private jacuzzis, and direct ski-in slope access.'
        }
    ]

    return (
        <div className="hotels-container">
            <Navbar />

            {/* ── Hero Banner Section ── */}
            <div 
                className="hotel-hero"
                style={{ backgroundImage: `url(${BANNER_IMAGES[currentBgIndex]})` }}
            >

                {/* Left Side Reservation Info */}
                <div className="left-side-info">
                    <span className="reservation-label">Reservation</span>
                    <span className="reservation-number">855 100 4444</span>
                    <div className="phone-icon-circle">
                        <Phone size={16} />
                    </div>
                </div>

                {/* Right Side Carousel Indicators */}
                <div className="right-side-dots">
                    {BANNER_IMAGES.map((_, idx) => (
                        <span 
                            key={idx} 
                            className={`dot-item ${currentBgIndex === idx ? 'active' : ''}`}
                            onClick={() => setCurrentBgIndex(idx)}
                        ></span>
                    ))}
                </div>

                {/* Hero Content */}
                <div className="hotel-hero-content">
                    <div className="stars-container">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                    </div>
                    <div className="hero-subtitle">Luxury Hotel & Best Resort</div>
                    <div className="hero-title-container">
                        <h1 className="hero-title">
                            Enjoy A Luxury<br />Experience
                        </h1>
                    </div>
                    <button className="rooms-suites-btn">Rooms & Suites</button>
                </div>

                {/* Floating Search Bar */}
                <div className="search-bar-wrapper">
                    <form onSubmit={handleSearch} className="search-bar-container">
                        {/* Where are you going? */}
                        <div 
                            className="search-field-box destination-select-box"
                            ref={destinationRef}
                        >
                            <label>Where are you going?</label>
                            <div className="search-input-wrapper">
                                <MapPin size={18} className="field-icon" />
                                <input
                                    type="text"
                                    placeholder="Search city, hotel or area"
                                    value={destination}
                                    onChange={handleDestinationChange}
                                    onFocus={() => destination.trim().length > 1 && setShowSuggestions(true)}
                                    required
                                />
                            </div>

                            {showSuggestions && (suggestions.length > 0 || loadingSuggestions || suggestionsLoaded) && (
                                <div className="suggestions-dropdown-card">
                                    {loadingSuggestions ? (
                                        <div className="suggestion-loading">Loading suggestions...</div>
                                    ) : suggestions.length > 0 ? (
                                        suggestions.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                className="suggestion-item"
                                                onClick={() => {
                                                    setDestination(getSuggestionText(item))
                                                    setShowSuggestions(false)
                                                }}
                                            >
                                                <MapPin size={14} className="suggestion-icon" />
                                                <span>{getSuggestionText(item)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="suggestion-loading">No suggestions found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Check-In */}
                        <div className="search-field-box">
                            <label>Check in</label>
                            <div className="search-input-wrapper">
                                <Calendar size={18} className="field-icon" />
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Check-Out */}
                        <div className="search-field-box">
                            <label>Check out</label>
                            <div className="search-input-wrapper">
                                <Calendar size={18} className="field-icon" />
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Rooms & Guests */}
                        <div 
                            className="search-field-box guests-select-box"
                            onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                            ref={guestsRef}
                        >
                            <label>Rooms & Guests</label>
                            <div className="search-input-wrapper">
                                <Users size={18} className="field-icon" />
                                <span className="guests-display-text">{guestsSummary}</span>
                            </div>

                            {showGuestsDropdown && (
                                <div className="guests-dropdown-card" onClick={(e) => e.stopPropagation()}>
                                    <div className="guest-row">
                                        <span>Rooms</span>
                                        <div className="counter-controls">
                                            <button type="button" onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}>-</button>
                                            <span>{roomsCount}</span>
                                            <button type="button" onClick={() => setRoomsCount(roomsCount + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="guest-row">
                                        <span>Adults</span>
                                        <div className="counter-controls">
                                            <button type="button" onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}>-</button>
                                            <span>{adultsCount}</span>
                                            <button type="button" onClick={() => setAdultsCount(adultsCount + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="guest-row">
                                        <span>Children</span>
                                        <div className="counter-controls">
                                            <button type="button" onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}>-</button>
                                            <span>{childrenCount}</span>
                                            <button type="button" onClick={() => setChildrenCount(childrenCount + 1)}>+</button>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="guests-done-btn" 
                                        onClick={() => setShowGuestsDropdown(false)}
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <button type="submit" className="check-now-btn">
                            Search Hotels
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Details Section (The Cappa Luxury Hotel) ── */}
            <section className="hotels-details-section">
                <div className="details-inner-container">
                    {/* Left Column Content */}
                    <div className="details-text-column">
                        <div className="stars-gold">
                            <Star size={14} fill="#b89565" color="#b89565" />
                            <Star size={14} fill="#b89565" color="#b89565" />
                            <Star size={14} fill="#b89565" color="#b89565" />
                            <Star size={14} fill="#b89565" color="#b89565" />
                            <Star size={14} fill="#b89565" color="#b89565" />
                        </div>
                        <span className="details-subtitle">GOAIRCLASS HOTELS</span>
                        <h2 className="details-title">FIND YOUR PERFECT STAY</h2>
                        <p className="details-paragraph">
                            Discover comfortable, affordable, and premium hotels for every journey with GoAirClass. Whether you are planning a business trip, family vacation, romantic getaway, or a relaxing weekend, find the right hotel based on your destination, dates, budget, and preferences.
                        </p>
                        <p className="details-paragraph">
                            Explore a wide range of verified hotel options with detailed information, amenities, room choices, pricing, and cancellation policies. Search, compare, and book your stay easily through one convenient platform.
                        </p>
                        <p className="details-paragraph">
                            With GoAirClass Hotels, enjoy a simple booking experience, secure payments, instant booking confirmation, and dedicated customer support throughout your journey.
                        </p>
                        <div className="details-reservation">
                            <div className="reservation-icon-box">
                                <Phone size={20} color="#b89565" />
                            </div>
                            <div className="reservation-text-box">
                                <span className="res-label">RESERVATION</span>
                                <span className="res-number">855 100 4444</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column Images */}
                    <div className="details-images-column">
                        <div className="image-wrapper offset-down">
                            <img 
                                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80" 
                                alt="Luxury Dining" 
                            />
                        </div>
                        <div className="image-wrapper offset-up">
                            <img 
                                src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=500&q=80" 
                                alt="Luxury Bedroom" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why Booking with GoAirClass Section ── */}
            <section className="why-booking-section">
                <div className="why-booking-container-split">
                    {/* Left Column */}
                    <div className="why-left-content">
                        <div className="why-plane-wrapper">
                            <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
                                <path d="M10,45 Q55,15 105,30" stroke="#dd6b20" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 5" opacity="0.3" />
                                <path d="M105,30 L95,25 L101,31 L97,37 Z" fill="#dd6b20" />
                            </svg>
                        </div>
                        <span className="why-subtitle">WHY BOOKING WITH GOAIRCLASS?</span>
                        <h2 className="why-title-split">
                            Experience the <br />
                            smart way to <br />
                            <span className="why-highlight">travel</span>
                        </h2>
                        <p className="why-desc-split">
                            GoAirClass is committed to delivering the best hotel booking experience—combining reliability, convenience, and unbeatable value for every traveler.
                        </p>
                        
                        <button className="why-explore-btn">
                            Explore Hotels <span className="arrow">→</span>
                        </button>

                        <div className="why-trust-badges">
                            <div className="trust-badge">
                                <span className="badge-icon icon-blue">🛡</span>
                                <span className="badge-text">Secure Booking</span>
                            </div>
                            <div className="trust-badge">
                                <span className="badge-icon icon-orange">🏷</span>
                                <span className="badge-text">No Hidden Fees</span>
                            </div>
                            <div className="trust-badge">
                                <span className="badge-icon icon-blue-light">🎧</span>
                                <span className="badge-text">Instant Support</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column Grid */}
                    <div className="why-right-grid">
                        {/* Card 1 */}
                        <div className="feature-card-split" style={{ '--accent-color': '#3182ce' }}>
                            <div className="card-top-header">
                                <span className="card-num">01</span>
                                <div className="feature-icon-wrapper-small">
                                    <svg width="60" height="60" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="#ebf8ff" />
                                        <rect x="25" y="30" width="40" height="30" rx="3" fill="#ffffff" stroke="#3182ce" strokeWidth="2.5" />
                                        <line x1="25" y1="38" x2="65" y2="38" stroke="#3182ce" strokeWidth="2" />
                                        <circle cx="33" cy="34" r="2" fill="#3182ce" />
                                        <circle cx="39" cy="34" r="2" fill="#3182ce" />
                                        <path d="M 33 46 L 43 46 M 33 52 L 48 52" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M 45 42 L 53 45 L 48 48 Z" fill="#3182ce" />
                                        <circle cx="62" cy="58" r="10" fill="#ffffff" stroke="#dd6b20" strokeWidth="3" />
                                        <line x1="69" y1="65" x2="78" y2="74" stroke="#dd6b20" strokeWidth="4.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="feature-card-title-split">Easy Search, Great Choices</h3>
                            <p className="feature-card-desc-split">
                                Find the best premium, luxury, and budget hotels – all in one place.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="feature-card-split" style={{ '--accent-color': '#dd6b20' }}>
                            <div className="card-top-header">
                                <span className="card-num">02</span>
                                <div className="feature-icon-wrapper-small">
                                    <svg width="60" height="60" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="#fffaf0" />
                                        <rect x="25" y="40" width="42" height="28" rx="4" fill="#dd6b20" />
                                        <path d="M 29 40 L 29 35 rx 2 M 63 40 L 63 35" stroke="#dd6b20" strokeWidth="2.5" />
                                        <rect x="33" y="32" width="26" height="10" rx="2" fill="#ffffff" stroke="#dd6b20" strokeWidth="2" />
                                        <circle cx="46" cy="54" r="9" fill="#3182ce" />
                                        <path d="M 42 54 L 45 57 L 51 51" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="feature-card-title-split">Best Prices, Always</h3>
                            <p className="feature-card-desc-split">
                                We compare hundreds of hotel deals to bring you the lowest prices guaranteed.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="feature-card-split" style={{ '--accent-color': '#48bb78' }}>
                            <div className="card-top-header">
                                <span className="card-num">03</span>
                                <div className="feature-icon-wrapper-small">
                                    <svg width="60" height="60" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="#f0fff4" />
                                        <path d="M 50 20 L 72 32 L 72 58 C 72 73 50 82 50 82 C 50 82 28 73 28 58 L 28 32 Z" fill="#ffffff" stroke="#48bb78" strokeWidth="2.5" />
                                        <circle cx="50" cy="50" r="18" fill="#ecc94b" />
                                        <polygon points="50,38 53,46 62,46 55,51 58,59 50,54 42,59 45,51 38,46 47,46" fill="#ffffff" />
                                        <path d="M 44 65 L 40 76 L 50 72 L 60 76 L 56 65" fill="#f56565" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="feature-card-title-split">Trusted by Millions</h3>
                            <p className="feature-card-desc-split">
                                Join millions of happy travelers who trust GoAirClass for their hotel bookings.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="feature-card-split" style={{ '--accent-color': '#4299e1' }}>
                            <div className="card-top-header">
                                <span className="card-num">04</span>
                                <div className="feature-icon-wrapper-small">
                                    <svg width="60" height="60" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="#ebf8ff" />
                                        <path d="M 50 24 C 36 24 25 35 25 49 C 25 54 27 59 30 63 L 28 73 L 38 69 C 41 71 45 72 50 72 C 64 72 75 61 75 49 C 75 35 64 24 50 24 Z" fill="#ffffff" stroke="#3182ce" strokeWidth="2.5" />
                                        <circle cx="50" cy="44" r="10" fill="#feebc8" stroke="#dd6b20" strokeWidth="2" />
                                        <path d="M 38 62 C 38 54 43 51 50 51 C 57 51 62 54 62 62 Z" fill="#3182ce" />
                                        <path d="M 58 40 C 60 41 62 44 62 46 C 62 49 59 51 57 49" fill="none" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="feature-card-title-split">24/7 Customer Support</h3>
                            <p className="feature-card-desc-split">
                                Our hotel reservation experts are available 24/7 to assist you anytime, anywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trending Destinations Section ── */}
            <section className="trending-destinations-section">
                <div className="destinations-container">
                    <div className="destinations-header">
                        <h2 className="destinations-title">Trending destinations</h2>
                        <p className="destinations-subtitle">Most popular choices for travellers from India</p>
                    </div>

                    <div className="destinations-grid">
                        {/* New Delhi */}
                        <div className="destination-card dest-new-delhi">
                            <span className="destination-tag">Heritage</span>
                            <img 
                                src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80" 
                                alt="New Delhi" 
                                className="destination-img"
                            />
                            <div className="destination-overlay">
                                <h3 className="destination-name">New Delhi <span className="flag">🇮🇳</span></h3>
                                <p className="destination-desc">Capital of India, rich in heritage, culture & shopping</p>
                            </div>
                        </div>

                        {/* Bengaluru */}
                        <div className="destination-card dest-bengaluru">
                            <span className="destination-tag">Tech Hub</span>
                            <img 
                                src="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80" 
                                alt="Bengaluru" 
                                className="destination-img"
                            />
                            <div className="destination-overlay">
                                <h3 className="destination-name">Bengaluru <span className="flag">🇮🇳</span></h3>
                                <p className="destination-desc">The Silicon Valley of India</p>
                            </div>
                        </div>

                        {/* Mumbai */}
                        <div className="destination-card dest-mumbai">
                            <span className="destination-tag">Metro</span>
                            <img 
                                src="https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=800&q=80" 
                                alt="Mumbai" 
                                className="destination-img"
                            />
                            <div className="destination-overlay">
                                <h3 className="destination-name">Mumbai <span className="flag">🇮🇳</span></h3>
                                <p className="destination-desc">India's financial capital & entertainment hub</p>
                            </div>
                        </div>

                        {/* Chennai */}
                        <div className="destination-card dest-chennai">
                            <span className="destination-tag">Coastal</span>
                            <img 
                                src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80" 
                                alt="Chennai" 
                                className="destination-img"
                            />
                            <div className="destination-overlay">
                                <h3 className="destination-name">Chennai <span className="flag">🇮🇳</span></h3>
                                <p className="destination-desc">Gateway to South India</p>
                            </div>
                        </div>

                        {/* Hyderabad */}
                        <div className="destination-card dest-hyderabad">
                            <span className="destination-tag">Culture</span>
                            <img 
                                src="https://images.unsplash.com/photo-1605007493699-af65834f8a00?auto=format&fit=crop&w=800&q=80" 
                                alt="Hyderabad" 
                                className="destination-img"
                            />
                            <div className="destination-overlay">
                                <h3 className="destination-name">Hyderabad <span className="flag">🇮🇳</span></h3>
                                <p className="destination-desc">City of Pearls & Heritage</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Banner */}
                    <div className="explore-india-banner">
                        <div className="banner-left">
                            <div className="banner-icon-bg">
                                <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                                    <path d="M20,70 L20,60 L30,50 L40,50 L40,65 L50,55 L60,65 L60,50 L70,50 L80,60 L80,70 Z" fill="#f0f4f8" stroke="#4a5568" strokeWidth="2.5" />
                                    <circle cx="50" cy="35" r="10" stroke="#4a5568" strokeWidth="2.5" />
                                    <line x1="50" y1="20" x2="50" y2="25" stroke="#4a5568" strokeWidth="2.5" />
                                    <line x1="15" y1="70" x2="85" y2="70" stroke="#4a5568" strokeWidth="3" />
                                </svg>
                            </div>
                            <div className="banner-text-box">
                                <h4 className="banner-title">Explore India</h4>
                                <p className="banner-desc">Discover more destinations, experiences and stays across India.</p>
                            </div>
                        </div>
                        <button className="banner-explore-btn" onClick={() => navigate('/destinations')}>
                            Explore India <span className="chevron">&gt;</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Hotel Grid Section (Interactive Listings) ── */}
            <section className="hotels-grid-section">
                <div className="grid-inner-container">
                    <span className="grid-subtitle">Luxury Stays</span>
                    <h2 className="grid-title">Our Rooms & Suites</h2>
                    
                    <div className="hotel-cards-list">
                        {sampleHotels.map(hotel => (
                            <div key={hotel.id} className="interactive-hotel-card">
                                <div className="card-image-box">
                                    <img src={hotel.image} alt={hotel.name} />
                                    <span className="card-price-badge">{hotel.price}<span>/night</span></span>
                                </div>
                                <div className="card-details-box">
                                    <div className="card-top-row">
                                        <h3 className="card-hotel-name">{hotel.name}</h3>
                                        <div className="card-rating">
                                            <Star size={14} fill="#b89565" color="#b89565" />
                                            <span>{hotel.rating}</span>
                                        </div>
                                    </div>
                                    <div className="card-location">
                                        <MapPin size={14} color="#b89565" />
                                        <span>{hotel.location}</span>
                                    </div>
                                    <p className="card-description">{hotel.desc}</p>
                                    <button 
                                        className="card-book-btn"
                                        onClick={() => handleBookNow(hotel)}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Booking Modal Popup ── */}
            {selectedHotel && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal-box">
                        <button className="modal-close-btn" onClick={() => setSelectedHotel(null)}>×</button>
                        <h3 className="modal-header">Book Your Stay</h3>
                        <div className="modal-hotel-summary">
                            <img src={selectedHotel.image} alt={selectedHotel.name} />
                            <div>
                                <h4>{selectedHotel.name}</h4>
                                <p className="modal-price">{selectedHotel.price} / night</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleConfirmBooking} className="modal-booking-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your name" 
                                    value={bookingName}
                                    onChange={(e) => setBookingName(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    value={bookingEmail}
                                    onChange={(e) => setBookingEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="Enter phone number" 
                                    value={bookingPhone}
                                    onChange={(e) => setBookingPhone(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-dates-row">
                                <div>
                                    <span className="date-label">Check In</span>
                                    <span className="date-value">{checkIn || 'Today'}</span>
                                </div>
                                <div>
                                    <span className="date-label">Check Out</span>
                                    <span className="date-value">{checkOut || 'Tomorrow'}</span>
                                </div>
                            </div>
                            
                            <button type="submit" className="modal-submit-btn" disabled={bookingSuccess}>
                                {bookingSuccess ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
