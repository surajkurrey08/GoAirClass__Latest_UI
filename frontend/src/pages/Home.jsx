// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowLeftRight, ChevronRight, ChevronDown, ChevronLeft, Calendar, Users,
  BadgePercent, ShieldCheck, Headphones, FileCheck, Plane, TrendingDown,
  ClipboardCheck, Mail, BedDouble, Luggage, Globe, Star, Clock, MapPin, X
} from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { searchAirports } from '../services/flightApi'
import API from '../services/axios'
import './Home.css'

const HERO_IMAGE = '/hero2.png'

const TABS = [
  { key: 'flights', label: 'Flights', icon: Plane },
  { key: 'hotels', label: 'Hotels', icon: BedDouble },
  { key: 'holidays', label: 'Holidays', icon: Luggage },
]

const TRUST_ITEMS = [
  { icon: BadgePercent, title: 'Best Price Guarantee', desc: 'Get the best fares or we match it' },
  { icon: ShieldCheck, title: 'Secure Booking', desc: '100% secure payments with multiple options' },
  { icon: Headphones, title: '24/7 Customer Support', desc: "We're here to help you anytime" },
  { icon: FileCheck, title: 'Easy Cancellation', desc: 'Hassle-free cancellations on selected bookings' },
]

const WHY_ITEMS = [
  { icon: Plane, title: 'Wide Choice', desc: '500+ Airlines & 1M+ Routes' },
  { icon: TrendingDown, title: 'Lowest Fares', desc: 'We compare, you save more' },
  { icon: Users, title: 'Trusted by Millions', desc: '10,00,000+ Happy Travelers' },
  { icon: ClipboardCheck, title: 'Easy Booking', desc: 'Book in minutes with ease' },
]

const IMG = {
  goa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Goa_beautiful_beach.JPG/960px-Goa_beautiful_beach.JPG',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
  singapore: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Marina_Bay_Sands%2C_Singapore_1.jpg/960px-Marina_Bay_Sands%2C_Singapore_1.jpg',
  london: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Big_Ben_Elizabeth_Tower_London_2023_01.jpg/960px-Big_Ben_Elizabeth_Tower_London_2023_01.jpg',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
  andaman: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Radhanagar_beach%2C_Havelock_islands%2C_Andaman_and_Nicobar.JPG/960px-Radhanagar_beach%2C_Havelock_islands%2C_Andaman_and_Nicobar.JPG',
  kerala: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kerala_backwaters%2C_Vembanad_Lake%2C_Houseboats%2C_India.jpg/960px-Kerala_backwaters%2C_Vembanad_Lake%2C_Houseboats%2C_India.jpg',
  himachal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Himalayan_mountains_as_seen_from_Kasol.jpg/960px-Himalayan_mountains_as_seen_from_Kasol.jpg',
  jaipur: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hawa_Mahal_Jaipur.jpg/960px-Hawa_Mahal_Jaipur.jpg',
  udaipur: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/City_Palace_by_lake_Pichola%2C_Udaipur.jpg/960px-City_Palace_by_lake_Pichola%2C_Udaipur.jpg',
  maldives: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  delhi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/India_Gate_Sunset.jpg/960px-India_Gate_Sunset.jpg',
  mumbai: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Mumbai_Skyline_Marine_Drive_Night.jpg/960px-Mumbai_Skyline_Marine_Drive_Night.jpg',
  bangalore: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Vidhana_Soudha_Bangalore.jpg/960px-Vidhana_Soudha_Bangalore.jpg',
  newyork: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Statue_of_liberty_and_nyc_skyline.jpg/960px-Statue_of_liberty_and_nyc_skyline.jpg',
  bangkok: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Bangkok_Wat_Arun_P1130114.JPG/960px-Bangkok_Wat_Arun_P1130114.JPG',
  planeSky: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Commercial_flight_DL2870_LGA_to_FLL_airplane_N388DA_Boeing_737-832.jpg/960px-Commercial_flight_DL2870_LGA_to_FLL_airplane_N388DA_Boeing_737-832.jpg',
  waterVilla: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/The_Residence_MALDIVES_water_villas.jpg/960px-The_Residence_MALDIVES_water_villas.jpg',
  resortPool: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Blumen_Resort_Swimming_Pool.JPG/960px-Blumen_Resort_Swimming_Pool.JPG',
}

const POPULAR_DESTINATIONS = [
  { name: 'Goa', price: 2499, image: IMG.goa },
  { name: 'Dubai', price: 7999, image: IMG.dubai },
  { name: 'Bali', price: 12999, image: IMG.bali },
  { name: 'Singapore', price: 8499, image: IMG.singapore },
  { name: 'London', price: 18999, image: IMG.london },
  { name: 'Paris', price: 19999, image: IMG.paris },
]

const TOP_OFFERS = [
  { title: 'Domestic Sale', discount: '30%', desc: 'On Bookings', image: IMG.planeSky, className: 'offer-tile--navy' },
  { title: 'International Sale', discount: '15%', desc: 'On Bookings', image: IMG.waterVilla, className: 'offer-tile--blue' },
  { title: 'Weekend Getaway', discount: '20%', desc: 'On Hotels', image: IMG.resortPool, className: 'offer-tile--sky' },
  { title: 'Holiday Packages', discount: '25%', desc: 'On Packages', image: IMG.maldives, className: 'offer-tile--teal' },
]

const TOP_DESTINATIONS = {
  Domestic: [
    { name: 'Manali', price: 3599, image: IMG.manali },
    { name: 'Andaman', price: 4999, image: IMG.andaman },
    { name: 'Kerala', price: 3299, image: IMG.kerala },
    { name: 'Himachal', price: 3899, image: IMG.himachal },
    { name: 'Jaipur', price: 2699, image: IMG.jaipur },
    { name: 'Udaipur', price: 2999, image: IMG.udaipur },
  ],
  International: [
    { name: 'Dubai', price: 7999, image: IMG.dubai },
    { name: 'Bali', price: 12999, image: IMG.bali },
    { name: 'Singapore', price: 8499, image: IMG.singapore },
    { name: 'Paris', price: 19999, image: IMG.paris },
    { name: 'Maldives', price: 22999, image: IMG.maldives },
    { name: 'London', price: 18999, image: IMG.london },
  ],
  Trending: [
    { name: 'Goa', price: 2499, image: IMG.goa },
    { name: 'Manali', price: 3599, image: IMG.manali },
    { name: 'Dubai', price: 7999, image: IMG.dubai },
    { name: 'Bali', price: 12999, image: IMG.bali },
    { name: 'Andaman', price: 4999, image: IMG.andaman },
    { name: 'Paris', price: 19999, image: IMG.paris },
  ],
}

const POPULAR_ROUTES = [
  { fromCity: 'Delhi', fromCode: 'DEL', fromImg: IMG.delhi, toCity: 'Mumbai', toCode: 'BOM', toImg: IMG.mumbai, duration: '2h 10m', airline: 'IndiGo', price: 3499, rating: 4.7, reviews: '12.3K', color: 'blue' },
  { fromCity: 'Mumbai', fromCode: 'BOM', fromImg: IMG.mumbai, toCity: 'Dubai', toCode: 'DXB', toImg: IMG.dubai, duration: '3h 15m', airline: 'Emirates', price: 15999, rating: 4.8, reviews: '8.7K', color: 'teal' },
  { fromCity: 'Delhi', fromCode: 'DEL', fromImg: IMG.delhi, toCity: 'London', toCode: 'LHR', toImg: IMG.london, duration: '9h 25m', airline: 'British Airways', price: 42999, rating: 4.6, reviews: '9.2K', color: 'purple' },
  { fromCity: 'Bangalore', fromCode: 'BLR', fromImg: IMG.bangalore, toCity: 'Singapore', toCode: 'SIN', toImg: IMG.singapore, duration: '4h 40m', airline: 'Singapore Airlines', price: 18999, rating: 4.8, reviews: '6.5K', color: 'orange' },
  { fromCity: 'Delhi', fromCode: 'DEL', fromImg: IMG.delhi, toCity: 'New York', toCode: 'JFK', toImg: IMG.newyork, duration: '15h 30m', airline: 'Air India', price: 55999, rating: 4.7, reviews: '7.1K', color: 'indigo' },
  { fromCity: 'Mumbai', fromCode: 'BOM', fromImg: IMG.mumbai, toCity: 'Bangkok', toCode: 'BKK', toImg: IMG.bangkok, duration: '4h 05m', airline: 'Thai Airways', price: 12999, rating: 4.6, reviews: '5.8K', color: 'pink' },
  { fromCity: 'Mumbai', fromCode: 'BOM', fromImg: IMG.mumbai, toCity: 'Singapore', toCode: 'SIN', toImg: IMG.singapore, duration: '5h 30m', airline: 'Vistara', price: 21999, rating: 4.8, reviews: '4.9K', color: 'blue' },
  { fromCity: 'Delhi', fromCode: 'DEL', fromImg: IMG.delhi, toCity: 'Paris', toCode: 'CDG', toImg: IMG.paris, duration: '9h 05m', airline: 'Air France', price: 46999, rating: 4.7, reviews: '5.6K', color: 'teal' },
]

const ROUTES_TRUST = [
  { icon: Plane, title: 'Top Rated Airlines', desc: 'Fly with trusted airlines' },
  { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Your safety is our priority' },
  { icon: Globe, title: '200+ Destinations', desc: 'Across the world' },
  { icon: Headphones, title: '24/7 Support', desc: "We're here to help" },
]

const emptySector = () => ({ fromCity: '', fromAirport: '', toCity: '', toAirport: '', date: '' })

/* ── City / airport autocomplete field ────────────────── */
function CityAutocomplete({ label, value, onChange, onSelect, placeholder, fetchSuggestions, icon: Icon = MapPin, wide }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const handleChange = (e) => {
    const val = e.target.value
    onChange(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }
    setOpen(true)
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(val.trim())
        setSuggestions(results || [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  return (
    <div className="search2__field" style={wide ? { flex: 1.6 } : undefined} ref={wrapRef}>
      <label>{label}</label>
      <div className="search2__field-icon">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => value.trim().length >= 2 && setOpen(true)}
          autoComplete="off"
        />
        <Icon size={15} />
      </div>
      {open && (
        <div className="search2__suggestions">
          {loading ? (
            <div className="search2__suggestion-loading">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <div
                key={i}
                className="search2__suggestion-item"
                onMouseDown={() => { onSelect(s); setOpen(false) }}
              >
                <MapPin size={13} className="search2__suggestion-icon" />
                <div>
                  <span className="search2__suggestion-main">{s.main}</span>
                  {s.sub && <span className="search2__suggestion-sub">{s.sub}</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="search2__suggestion-loading">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Mini calendar popover ────────────────────────────── */
function MiniCalendar({ value, min, onSelect, openUp }) {
  const initial = value ? new Date(`${value}T00:00:00`) : (min ? new Date(`${min}T00:00:00`) : new Date())
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const offset = (firstDayWeekday + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const monthStr = String(viewMonth + 1).padStart(2, '0')
  const minDate = min ? new Date(`${min}T00:00:00`) : null

  const goPrev = () => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1) }
  const goNext = () => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1) }

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
          const day = i + 1
          const dateStr = `${viewYear}-${monthStr}-${String(day).padStart(2, '0')}`
          const dateObj = new Date(viewYear, viewMonth, day)
          const isDisabled = minDate && dateObj < minDate
          const isSelected = value === dateStr
          return (
            <button
              type="button"
              key={i}
              disabled={isDisabled}
              className={`mini-cal__day ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(dateStr)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Date field (dd/mm/yyyy display, custom calendar) ──── */
function DateField({ label, value, onChange, min, disabled, placeholder = 'dd/mm/yyyy' }) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleOpen = () => {
    if (disabled) return
    setOpen((wasOpen) => {
      const willOpen = !wasOpen
      if (willOpen && ref.current) {
        // The search card intentionally overlaps the section below it, so
        // "room below" is unreliable regardless of scroll position — open
        // upward (into the hero image) unless the field is right at the
        // top of the viewport, where there'd be nowhere else to go.
        const rect = ref.current.getBoundingClientRect()
        setOpenUp(rect.top > 160)
      }
      return willOpen
    })
  }

  const displayVal = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''

  return (
    <div className={`search2__field ${disabled ? 'search2__field--disabled' : ''}`} ref={ref}>
      <label>{label}</label>
      <div className="search2__field-icon search2__datebox" onClick={toggleOpen}>
        <input type="text" readOnly placeholder={placeholder} value={displayVal} disabled={disabled} />
        <Calendar size={15} />
      </div>
      {open && !disabled && (
        <MiniCalendar value={value} min={min} openUp={openUp} onSelect={(d) => { onChange(d); setOpen(false) }} />
      )}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  // Search widget state
  const [activeTab, setActiveTab] = useState('flights')
  const [tripType, setTripType] = useState('oneway')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travelers, setTravelers] = useState(1)
  const [travelClass, setTravelClass] = useState('Economy')
  const [travelersOpen, setTravelersOpen] = useState(false)
  const [searchingFlights, setSearchingFlights] = useState(false)
  const [multiCitySectors, setMultiCitySectors] = useState([emptySector(), emptySector()])

  // Destinations tab
  const [destTab, setDestTab] = useState('Domestic')

  // Newsletter
  const [email, setEmail] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const swapCities = () => { setFrom(to); setTo(from) }

  const fetchAirportSuggestions = async (query) => {
    const res = await searchAirports(query)
    if (res?.success && res.data?.length) {
      return res.data.map(ap => ({ main: `${ap.airportCity} (${ap.airportCode})`, sub: ap.airportName }))
    }
    return []
  }

  const getHotelSuggestionText = (item) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    return item.name || item.displayName || item.cityName || item.label || ''
  }

  const fetchHotelSuggestions = async (query) => {
    const res = await API.get(`/hotels/locations?query=${encodeURIComponent(query)}`)
    if (res.data?.success) {
      return (res.data.locations || []).map(item => ({ main: getHotelSuggestionText(item), sub: '' })).filter(s => s.main)
    }
    return []
  }

  // Resolves a plain city name (as typed on the home widget) to the
  // "City (CODE)" format the real flights search (/flights/list) expects,
  // using the same airport-search API the /flights page itself uses.
  const resolveAirport = async (cityQuery) => {
    const query = cityQuery.trim()
    if (query.includes('(')) return query
    try {
      const res = await searchAirports(query)
      const match = res?.success && res.data?.length ? res.data[0] : null
      return match ? `${match.airportCity} (${match.airportCode})` : query
    } catch {
      return query
    }
  }

  const updateSector = (index, patch) => {
    setMultiCitySectors(prev => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const addSector = () => {
    if (multiCitySectors.length >= 5) { toast.warn('Maximum 5 flights allowed in Multi City'); return }
    const last = multiCitySectors[multiCitySectors.length - 1]
    setMultiCitySectors(prev => [...prev, { fromCity: last.toCity || '', fromAirport: last.toAirport || '', toCity: '', toAirport: '', date: '' }])
  }

  const removeSector = (index) => {
    if (multiCitySectors.length <= 2) { toast.warn('Minimum 2 flights required for Multi City'); return }
    setMultiCitySectors(prev => prev.filter((_, i) => i !== index))
  }

  const handleSearch = async () => {
    if (activeTab === 'flights') {
      if (tripType === 'multicity') {
        for (let i = 0; i < multiCitySectors.length; i++) {
          const sec = multiCitySectors[i]
          if (!sec.fromCity.trim() || !sec.toCity.trim()) { toast.error(`Please select departure and destination cities for Flight ${i + 1}`); return }
          if (!sec.date) { toast.error(`Please select a date for Flight ${i + 1}`); return }
        }
        setSearchingFlights(true)
        try {
          const resolvedSectors = await Promise.all(multiCitySectors.map(async (s) => ({
            fromCity: await resolveAirport(s.fromCity),
            fromAirport: s.fromAirport || '',
            toCity: await resolveAirport(s.toCity),
            toAirport: s.toAirport || '',
            date: s.date,
          })))
          const travellersLabel = `${travelers} Traveller${travelers > 1 ? 's' : ''}`
          navigate(
            `/flights/list?tripType=multiCity&sectors=${encodeURIComponent(JSON.stringify(resolvedSectors))}` +
            `&cabin=${encodeURIComponent(travelClass)}&travellers=${encodeURIComponent(travellersLabel)}&adults=${travelers}&children=0&infants=0`
          )
        } finally {
          setSearchingFlights(false)
        }
        return
      }

      if (!from.trim()) { toast.error('Please enter departure city'); return }
      if (!to.trim()) { toast.error('Please enter destination city'); return }
      if (!departDate) { toast.error('Please select departure date'); return }
      if (tripType === 'roundtrip' && !returnDate) { toast.error('Please select return date'); return }

      setSearchingFlights(true)
      try {
        const [fromResolved, toResolved] = await Promise.all([resolveAirport(from), resolveAirport(to)])
        const flightTripType = tripType === 'roundtrip' ? 'roundTrip' : 'oneWay'
        const travellersLabel = `${travelers} Traveller${travelers > 1 ? 's' : ''}`
        navigate(
          `/flights/list?from=${encodeURIComponent(fromResolved)}&to=${encodeURIComponent(toResolved)}` +
          `&date=${encodeURIComponent(departDate)}&returnDate=${encodeURIComponent(flightTripType === 'roundTrip' ? returnDate : '')}` +
          `&tripType=${flightTripType}&cabin=${encodeURIComponent(travelClass)}&travellers=${encodeURIComponent(travellersLabel)}` +
          `&adults=${travelers}&children=0&infants=0`
        )
      } finally {
        setSearchingFlights(false)
      }
    } else if (activeTab === 'hotels') {
      if (!to.trim()) { toast.error('Please enter a destination'); return }
      if (!departDate) { toast.error('Please select check-in date'); return }
      navigate(
        `/hotels/list?destination=${encodeURIComponent(to.trim())}&checkIn=${departDate}&checkOut=${returnDate}` +
        `&rooms=1&adults=${travelers}&children=0&guests=${travelers}`
      )
    } else {
      if (!to.trim()) { toast.error('Please enter a destination'); return }
      if (!departDate) { toast.error('Please select travel date'); return }
      navigate(`/search?type=hotels&to=${to.trim()}&date=${departDate}&travelers=${travelers}`)
    }
  }

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email'); return }
    toast.success('Subscribed! Watch your inbox for exclusive deals.')
    setEmail('')
  }

  const isMultiCityOpen = activeTab === 'flights' && tripType === 'multicity'

  return (
    <div className="home">
      <Navbar />

      {/* ══════ HERO ══════ */}
      <section className={`hero2 ${isMultiCityOpen ? 'hero2--multicity' : ''}`}>
        <img src={HERO_IMAGE} alt="Travel beyond boundaries" className="hero2__img" />
        <div className="hero2__overlay" />

        {!isMultiCityOpen && (
          <div className="hero2__content container">
            <span className="hero2__eyebrow">Explore. Book. Travel.</span>
            <h1>Travel Beyond<br /><span className="hero2__accent">Boundaries</span></h1>
            <p>Book flights, hotels and holiday packages<br />to explore the world with ease.</p>

            <div className="hero2__trust">
              {TRUST_ITEMS.map((t, i) => (
                <div className="hero2__trust-item" key={i}>
                  <span className="hero2__trust-icon"><t.icon size={32} /></span>
                  <div>
                    <div className="hero2__trust-title">{t.title}</div>
                    <div className="hero2__trust-desc">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search widget */}
        <div className={`search2 container ${isMultiCityOpen ? 'search2--flow' : ''}`}>
          <div className="search2__tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`search2__tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </div>

          <div className="search2__panel">
            {activeTab === 'flights' && (
              <div className="search2__triptype">
                {['oneway', 'roundtrip', 'multicity'].map(tt => (
                  <label key={tt} className="search2__radio">
                    <input type="radio" name="tripType" checked={tripType === tt} onChange={() => setTripType(tt)} />
                    {tt === 'oneway' ? 'One Way' : tt === 'roundtrip' ? 'Round Trip' : 'Multi City'}
                  </label>
                ))}
              </div>
            )}

            <div className={`search2__fields ${isMultiCityOpen ? 'search2__fields--stacked' : ''}`}>
              {activeTab === 'flights' && !isMultiCityOpen && (
                <>
                  <CityAutocomplete
                    label="From"
                    value={from}
                    onChange={setFrom}
                    onSelect={(s) => setFrom(s.main)}
                    placeholder="Select origin"
                    fetchSuggestions={fetchAirportSuggestions}
                  />

                  <button className="search2__swap" onClick={swapCities} title="Swap">
                    <ArrowLeftRight size={15} />
                  </button>

                  <CityAutocomplete
                    label="To"
                    value={to}
                    onChange={setTo}
                    onSelect={(s) => setTo(s.main)}
                    placeholder="Select destination"
                    fetchSuggestions={fetchAirportSuggestions}
                  />

                  <DateField label="Depart" value={departDate} min={today} onChange={setDepartDate} />

                  <DateField
                    label="Return"
                    value={returnDate}
                    min={departDate || today}
                    onChange={setReturnDate}
                    disabled={tripType !== 'roundtrip'}
                  />

                  <div className="search2__field search2__field--travelers">
                    <label>Travelers &amp; Class</label>
                    <button className="search2__travelers-btn" onClick={() => setTravelersOpen(o => !o)}>
                      {travelers} Traveler{travelers > 1 ? 's' : ''}, {travelClass}
                      <ChevronDown size={13} />
                    </button>
                    {travelersOpen && (
                      <div className="search2__travelers-pop">
                        <div className="search2__travelers-row">
                          <span>Travelers</span>
                          <div className="search2__stepper">
                            <button onClick={() => setTravelers(t => Math.max(1, t - 1))}>-</button>
                            <span>{travelers}</span>
                            <button onClick={() => setTravelers(t => Math.min(9, t + 1))}>+</button>
                          </div>
                        </div>
                        <div className="search2__travelers-row search2__travelers-row--classes">
                          {['Economy', 'Premium Economy', 'Business', 'First'].map(c => (
                            <button
                              key={c}
                              className={`search2__class-chip ${travelClass === c ? 'active' : ''}`}
                              onClick={() => setTravelClass(c)}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        <button className="search2__travelers-done" onClick={() => setTravelersOpen(false)}>Done</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {isMultiCityOpen && (
                <>
                  <div className="search2__multicity">
                    {multiCitySectors.map((sector, idx) => (
                      <div className="search2__sector-row" key={idx}>
                        <span className="search2__sector-badge">Flight {idx + 1}</span>

                        <CityAutocomplete
                          label="From"
                          value={sector.fromCity}
                          onChange={(v) => updateSector(idx, { fromCity: v })}
                          onSelect={(s) => updateSector(idx, { fromCity: s.main, fromAirport: s.sub })}
                          placeholder="Select origin"
                          fetchSuggestions={fetchAirportSuggestions}
                        />

                        <button
                          type="button"
                          className="search2__swap search2__swap--sector"
                          onClick={() => updateSector(idx, { fromCity: sector.toCity, fromAirport: sector.toAirport, toCity: sector.fromCity, toAirport: sector.fromAirport })}
                          title="Swap"
                        >
                          <ArrowLeftRight size={13} />
                        </button>

                        <CityAutocomplete
                          label="To"
                          value={sector.toCity}
                          onChange={(v) => updateSector(idx, { toCity: v })}
                          onSelect={(s) => updateSector(idx, { toCity: s.main, toAirport: s.sub })}
                          placeholder="Select destination"
                          fetchSuggestions={fetchAirportSuggestions}
                        />

                        <DateField
                          label="Date"
                          value={sector.date}
                          min={idx > 0 ? (multiCitySectors[idx - 1].date || today) : today}
                          onChange={(d) => updateSector(idx, { date: d })}
                        />

                        {multiCitySectors.length > 2 && (
                          <button type="button" className="search2__sector-remove" onClick={() => removeSector(idx)} title="Remove flight">
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ))}

                    <button type="button" className="search2__sector-add" onClick={addSector}>+ Add Flight</button>
                  </div>

                  <div className="search2__field search2__field--travelers">
                    <label>Travelers &amp; Class</label>
                    <button className="search2__travelers-btn" onClick={() => setTravelersOpen(o => !o)}>
                      {travelers} Traveler{travelers > 1 ? 's' : ''}, {travelClass}
                      <ChevronDown size={13} />
                    </button>
                    {travelersOpen && (
                      <div className="search2__travelers-pop">
                        <div className="search2__travelers-row">
                          <span>Travelers</span>
                          <div className="search2__stepper">
                            <button onClick={() => setTravelers(t => Math.max(1, t - 1))}>-</button>
                            <span>{travelers}</span>
                            <button onClick={() => setTravelers(t => Math.min(9, t + 1))}>+</button>
                          </div>
                        </div>
                        <div className="search2__travelers-row search2__travelers-row--classes">
                          {['Economy', 'Premium Economy', 'Business', 'First'].map(c => (
                            <button
                              key={c}
                              className={`search2__class-chip ${travelClass === c ? 'active' : ''}`}
                              onClick={() => setTravelClass(c)}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        <button className="search2__travelers-done" onClick={() => setTravelersOpen(false)}>Done</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'hotels' && (
                <>
                  <CityAutocomplete
                    label="Destination"
                    value={to}
                    onChange={setTo}
                    onSelect={(s) => setTo(s.main)}
                    placeholder="City or hotel name"
                    fetchSuggestions={fetchHotelSuggestions}
                    wide
                  />
                  <DateField label="Check-in" value={departDate} min={today} onChange={setDepartDate} />
                  <DateField label="Check-out" value={returnDate} min={departDate || today} onChange={setReturnDate} />
                  <div className="search2__field search2__field--travelers">
                    <label>Guests &amp; Rooms</label>
                    <button className="search2__travelers-btn" onClick={() => setTravelersOpen(o => !o)}>
                      {travelers} Guest{travelers > 1 ? 's' : ''}
                      <ChevronDown size={13} />
                    </button>
                    {travelersOpen && (
                      <div className="search2__travelers-pop">
                        <div className="search2__travelers-row">
                          <span>Guests</span>
                          <div className="search2__stepper">
                            <button onClick={() => setTravelers(t => Math.max(1, t - 1))}>-</button>
                            <span>{travelers}</span>
                            <button onClick={() => setTravelers(t => Math.min(9, t + 1))}>+</button>
                          </div>
                        </div>
                        <button className="search2__travelers-done" onClick={() => setTravelersOpen(false)}>Done</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'holidays' && (
                <>
                  <div className="search2__field" style={{ flex: 1.6 }}>
                    <label>Destination</label>
                    <input type="text" placeholder="Where do you want to go?" value={to} onChange={e => setTo(e.target.value)} />
                  </div>
                  <DateField label="Travel Date" value={departDate} min={today} onChange={setDepartDate} />
                  <div className="search2__field search2__field--travelers">
                    <label>Travelers</label>
                    <button className="search2__travelers-btn" onClick={() => setTravelersOpen(o => !o)}>
                      {travelers} Traveler{travelers > 1 ? 's' : ''}
                      <ChevronDown size={13} />
                    </button>
                    {travelersOpen && (
                      <div className="search2__travelers-pop">
                        <div className="search2__travelers-row">
                          <span>Travelers</span>
                          <div className="search2__stepper">
                            <button onClick={() => setTravelers(t => Math.max(1, t - 1))}>-</button>
                            <span>{travelers}</span>
                            <button onClick={() => setTravelers(t => Math.min(9, t + 1))}>+</button>
                          </div>
                        </div>
                        <button className="search2__travelers-done" onClick={() => setTravelersOpen(false)}>Done</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button className="search2__btn" onClick={handleSearch} disabled={searchingFlights}>
                {searchingFlights
                  ? 'Searching...'
                  : `Search ${activeTab === 'flights' ? 'Flights' : activeTab === 'hotels' ? 'Hotels' : 'Packages'}`}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ WHY CHOOSE US ══════ */}
      <section className="whyrow">
        <div className="container whyrow__inner">
          <h2 className="whyrow__title">Why Choose<br />GoAirClass?</h2>
          <div className="whyrow__items">
            {WHY_ITEMS.map((w, i) => (
              <div key={i} className="whyrow__item">
                <span className="whyrow__icon"><w.icon size={30} /></span>
                <div>
                  <div className="whyrow__item-title">{w.title}</div>
                  <div className="whyrow__item-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ POPULAR DESTINATIONS ══════ */}
      <section className="section2">
        <div className="container">
          <div className="section2__header">
            <h2>Popular Destinations</h2>
            <a href="#top-destinations" className="section2__link">View all destinations <ChevronRight size={14} /></a>
          </div>
          <div className="pd-grid">
            {POPULAR_DESTINATIONS.slice(0, 5).map((d, i) => (
              <div key={i} className="pd-card" onClick={() => navigate(`/search?type=flights&to=${d.name}`)}>
                <img src={d.image} alt={d.name} />
                <div className="pd-card__overlay" />
                <div className="pd-card__info">
                  <span className="pd-card__name">{d.name}</span>
                  <span className="pd-card__price">from ₹{d.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TOP OFFERS ══════ */}
      <section className="section2" id="offers">
        <div className="container">
          <div className="section2__header section2__header--left">
            <h2>Top Offers For You</h2>
            <a href="#" className="section2__link">View all offers <ChevronRight size={14} /></a>
          </div>
          <div className="offers2-grid">
            {TOP_OFFERS.map((o, i) => (
              <div key={i} className={`offer-tile ${o.className}`}>
                <div className="offer-tile__content">
                  <span className="offer-tile__title">{o.title}</span>
                  <span className="offer-tile__up">Up to</span>
                  <span className="offer-tile__discount">{o.discount} OFF</span>
                  <span className="offer-tile__desc">{o.desc}</span>
                  <button className="offer-tile__btn" onClick={() => navigate('/search')}>Book Now</button>
                </div>
                <div className="offer-tile__imgwrap">
                  <img src={o.image} alt={o.title} className="offer-tile__bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TOP DESTINATIONS ══════ */}
      <section className="section2" id="top-destinations">
        <div className="container">
          <div className="section2__header section2__header--left">
            <div>
              <h2>Top Destinations</h2>
              <div className="dest-tabs dest-tabs--left">
                {Object.keys(TOP_DESTINATIONS).map(tab => (
                  <button
                    key={tab}
                    className={`dest-tabs__btn ${destTab === tab ? 'active' : ''}`}
                    onClick={() => setDestTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <a href="#" className="section2__link">View all destinations <ChevronRight size={14} /></a>
          </div>
          <div className="pd-grid">
            {TOP_DESTINATIONS[destTab].slice(0, 5).map((d, i) => (
              <div key={i} className="pd-card" onClick={() => navigate(`/search?type=flights&to=${d.name}`)}>
                <img src={d.image} alt={d.name} />
                <div className="pd-card__overlay" />
                <div className="pd-card__info">
                  <span className="pd-card__name">{d.name}</span>
                  <span className="pd-card__price">from ₹{d.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ POPULAR ROUTES ══════ */}
      <section className="routes2">
        <span className="routes2__decoplane routes2__decoplane--left"><Plane size={18} /></span>
        <span className="routes2__decoplane routes2__decoplane--right"><Plane size={18} /></span>
        <div className="container">
          <div className="section2__header">
            <span className="section2__tag"><Plane size={13} /> Popular Routes</span>
            <h2>Fly with the World's Best</h2>
            <p className="section2__subtitle">Top rated airlines connecting you to the most loved destinations around the globe.</p>
            <div className="routes2__divider"><span /><i>+</i><span /></div>
          </div>
          <div className="routes2-grid">
            {POPULAR_ROUTES.slice(0, 8).map((r, i) => (
              <div key={i} className={`route-card2 route-card2--${r.color}`} onClick={() => navigate(`/search?type=flights&from=${r.fromCity}&to=${r.toCity}`)}>
                <div className="route-card2__imgs">
                  <div className="route-card2__imghalf route-card2__imghalf--left">
                    <img src={r.fromImg} alt={r.fromCity} />
                    <div className="route-card2__imgoverlay" />
                    <div className="route-card2__citylabel route-card2__citylabel--left">
                      <strong>{r.fromCity.toUpperCase()}</strong>
                      <span>{r.fromCode}</span>
                    </div>
                  </div>
                  <div className="route-card2__imghalf route-card2__imghalf--right">
                    <img src={r.toImg} alt={r.toCity} />
                    <div className="route-card2__imgoverlay" />
                    <div className="route-card2__citylabel route-card2__citylabel--right">
                      <strong>{r.toCity.toUpperCase()}</strong>
                      <span>{r.toCode}</span>
                    </div>
                  </div>
                  <span className="route-card2__badge"><Plane size={17} /></span>
                </div>
                <div className="route-card2__body">
                  <div className="route-card2__col">
                    <span className="route-card2__duration"><Clock size={13} /> {r.duration}</span>
                    <span className="route-card2__airline">{r.airline}</span>
                  </div>
                  <span className="route-card2__divider" />
                  <div className="route-card2__col route-card2__col--price">
                    <span className="route-card2__from">from</span>
                    <strong>₹{r.price.toLocaleString()}</strong>
                  </div>
                  <span className="route-card2__divider" />
                  <div className="route-card2__col route-card2__col--rating">
                    <span className="route-card2__rating"><Star size={13} /> {r.rating}</span>
                    <span className="route-card2__reviews">({r.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="routes2__explore-btn" onClick={() => navigate('/search?type=flights')}>
            <Plane size={16} /> Explore All Routes <ChevronRight size={15} />
          </button>
          <div className="routes2__trust">
            {ROUTES_TRUST.map((t, i) => (
              <div key={i} className="routes2__trust-item">
                <span className="routes2__trust-icon"><t.icon size={18} /></span>
                <div>
                  <div className="routes2__trust-title">{t.title}</div>
                  <div className="routes2__trust-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ NEWSLETTER ══════ */}
      <section className="newsletter2">
        <img src="/deals%20&%20offer.png" alt="" className="newsletter2__bg" />
        <div className="container newsletter2__inner">
          <div className="newsletter2__text">
            <h2>Get Exclusive Deals &amp; Offers</h2>
            <p>Subscribe to our newsletter and never miss any updates!</p>
            <div className="newsletter2__form">
              <div className="newsletter2__input">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                />
              </div>
              <button onClick={handleSubscribe}>Subscribe <ArrowRight size={15} /></button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
