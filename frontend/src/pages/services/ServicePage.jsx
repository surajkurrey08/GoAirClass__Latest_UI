// src/pages/services/ServicePage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, ChevronUp, Star } from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getHeroImages } from '../../services/heroImageService'
import { searchFlights as fetchFlightResults, getAirlines, createBookingSession } from '../../services/flightApi'
import { searchResults } from '../../data/mockData'
import FiltersSidebar from '../../flights/components/FiltersSidebar'
import FlightDetailsModal from '../../flights/components/FlightDetailsModal'
import FlightLoader from '../../components/flights/FlightLoader'
import './ServicePage.css'

export default function ServicePage({ type }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location
  
  const [bgImage, setBgImage]   = useState(null)
  const [from, setFrom]         = useState(state?.from || '')
  const [to, setTo]             = useState(state?.to || '')
  const [date, setDate]         = useState(state?.date || '')
  const [guests, setGuests]     = useState('1')
  const [showAll, setShowAll]   = useState(false)
  const [sortBy, setSortBy]     = useState('price')
  const [maxPrice, setMaxPrice] = useState(state?.budget || 50000)
  const [loading, setLoading]   = useState(false)
  const [realResults, setRealResults] = useState(state?.flights || [])
  const [hasSearched, setHasSearched] = useState(!!state?.flights)
  
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: state?.budget || 50000,
    stops: [],
    airlines: [],
    departureTime: [],
    duration: "",
    refundable: false,
    baggage: [],
    layover: [],
    seatClass: ""
  })
  const [availableAirlines, setAvailableAirlines] = useState([])
  const [selectedFlight, setSelectedFlight] = useState(null)

  const CONFIG = {
    flights: {
      title: 'Book Flights', subtitle: 'Fly anywhere, anytime — best prices guaranteed',
      emoji: '✈️', color: '#2563eb',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%)',
      fromLabel: 'From', toLabel: 'To',
      fromPlaceholder: 'Departure city or airport',
      toPlaceholder: 'Arrival city or airport',
      guestLabel: 'Passengers',
      features: ['Non-stop flights', 'Flexible cancellation', 'Instant confirmation'],
      stats: [{ v: '500+', l: 'Destinations' }, { v: '50+', l: 'Airlines' }, { v: '4.8★', l: 'Rating' }],
    },
    hotels: {
      title: 'Book Hotels', subtitle: 'Luxury stays at unbeatable prices',
      emoji: '🏨', color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      fromLabel: 'City / Area', toLabel: 'Check Out',
      fromPlaceholder: 'Where do you want to stay?',
      toPlaceholder: 'Check-out date',
      guestLabel: 'Rooms / Guests',
      features: ['Free cancellation', 'Best price guarantee', 'Instant booking'],
      stats: [{ v: '10K+', l: 'Hotels' }, { v: '200+', l: 'Cities' }, { v: '5★', l: 'Luxury options' }],
    },
    trains: {
      title: 'Book Trains', subtitle: 'Fast, comfortable train journeys across India',
      emoji: '🚆', color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
      fromLabel: 'From Station', toLabel: 'To Station',
      fromPlaceholder: 'Boarding station',
      toPlaceholder: 'Destination station',
      guestLabel: 'Passengers',
      features: ['PNR confirmation', 'Live train status', 'Multiple classes'],
      stats: [{ v: '7000+', l: 'Trains' }, { v: '8000+', l: 'Stations' }, { v: '24/7', l: 'Support' }],
    },
    buses: {
      title: 'Book Buses', subtitle: 'Comfortable bus travel to 1000+ destinations',
      emoji: '🚌', color: '#d97706',
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      fromLabel: 'From', toLabel: 'To',
      fromPlaceholder: 'Departure city',
      toPlaceholder: 'Destination city',
      guestLabel: 'Passengers',
      features: ['AC & Sleeper options', 'Live tracking', 'Easy cancellation'],
      stats: [{ v: '2000+', l: 'Operators' }, { v: '1000+', l: 'Routes' }, { v: '4.5★', l: 'Rating' }],
    },
  }

  const cfg = CONFIG[type] || CONFIG.flights
  const typeMap = { flights: 'flight', hotels: 'hotel', trains: 'train', buses: 'bus' }

  useEffect(() => {
    getHeroImages(typeMap[type] || 'flight').then(imgs => {
      if (imgs?.length > 0) setBgImage(imgs[0].url)
    })
    
    if (type === 'flights') {
      getAirlines().then(res => {
        if (res.success) {
          setAvailableAirlines(res.airlines.map(a => a.airlineName))
        }
      })
    }
  }, [type])

  // Effect for debounced filtering after first search
  useEffect(() => {
    if (hasSearched && type === 'flights') {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filters]);

  const handleSearch = async () => {
    // Validation
    if (!from.trim()) {
      toast.error(`Please enter ${cfg.fromLabel.toLowerCase()}`)
      return
    }
    if (type !== 'hotels' && !to.trim()) {
      toast.error(`Please enter ${cfg.toLabel.toLowerCase()}`)
      return
    }
    if (!date) {
      toast.error('Please select a date')
      return
    }

    if (type === 'flights') {
      try {
        setLoading(true)
        setHasSearched(true)
        // Include filters in the API call
        const params = { 
          from, to, date,
          ...filters
        }
        const res = await fetchFlightResults(params)
        if (res.success) {
          setRealResults(res.flights)
          if (res.flights.length === 0 && !loading) {
            // Only toast if it's not the initial debounced search
            // toast.info('No flights found matching these filters')
          }
        }
      } catch (error) {
        toast.error('Flight search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      toast.success('Searching...')
    }

    setShowAll(true)
    setTimeout(() => {
      if (!hasSearched) {
        document.getElementById('svc-results')?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 300)
  }

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 50000,
      stops: [],
      airlines: [],
      departureTime: [],
      duration: "",
      refundable: false,
      baggage: [],
      layover: [],
      seatClass: ""
    })
  }

  // Filter + sort
  const baseData = (type === 'flights' && hasSearched) ? realResults : (searchResults[type] || [])
  const allItems = baseData.filter(item => item.price <= maxPrice)
  const sorted = [...allItems].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    return 0
  })

  const displayItems = showAll ? sorted : sorted.slice(0, 2)

  return (
    <div className="svc-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="svc-hero">
        {bgImage ? (
          <div className="svc-hero__bg">
            <img src={bgImage} alt={cfg.title} className="svc-hero__img" />
            <div className="svc-hero__overlay" />
          </div>
        ) : (
          <div className="svc-hero__fallback" style={{ background: cfg.gradient }} />
        )}

        <div className="svc-hero__content container">
          <div className="svc-hero__head">
            <span className="svc-hero__emoji">{cfg.emoji}</span>
            <div>
              <h1 className="svc-hero__title">{cfg.title}</h1>
              <p className="svc-hero__subtitle">{cfg.subtitle}</p>
            </div>
          </div>

          <div className="svc-hero__stats">
            {cfg.stats.map((s, i) => (
              <div key={i} className="svc-stat">
                <div className="svc-stat__val">{s.v}</div>
                <div className="svc-stat__label">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Search Box */}
          <div className="svc-search-box">
            <div className="svc-search-field">
              <label>{cfg.fromLabel} *</label>
              <input
                type="text"
                placeholder={cfg.fromPlaceholder}
                value={from}
                onChange={e => setFrom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="svc-search-divider" />

            {type === 'hotels' ? (
              <>
                <div className="svc-search-field">
                  <label>Check In *</label>
                  <input type="date" value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)} />
                </div>
                <div className="svc-search-divider" />
                <div className="svc-search-field">
                  <label>Check Out</label>
                  <input type="text" placeholder="Check-out date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="svc-search-field">
                  <label>{cfg.toLabel} *</label>
                  <input
                    type="text"
                    placeholder={cfg.toPlaceholder}
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="svc-search-divider" />
                <div className="svc-search-field">
                  <label>Date *</label>
                  <input type="date" value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setDate(e.target.value)} />
                </div>
              </>
            )}

            <div className="svc-search-divider" />
            <div className="svc-search-field">
              <label>{cfg.guestLabel}</label>
              <input type="number" min="1" max="20" value={guests} onChange={e => setGuests(e.target.value)} />
            </div>

            <button 
              className="svc-search-btn" 
              style={{ background: cfg.color, opacity: loading ? 0.7 : 1 }} 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : `Search ${cfg.emoji}`}
            </button>
          </div>

          <div className="svc-features">
            {cfg.features.map((f, i) => (
              <span key={i} className="svc-feature-tag">✓ {f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section className="svc-samples section" id="svc-results">
        <div className="container">
          <div className="svc-layout">
            {type === 'flights' && hasSearched && (
              <div className="svc-sidebar-container">
                <FiltersSidebar 
                  filters={filters} 
                  setFilters={setFilters} 
                  airlinesList={availableAirlines}
                  onClear={clearFilters}
                />
              </div>
            )}

            <div className="svc-main-content">
              <div className="svc-results__header">
                <div className="section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
                  <div className="tag">🔥 {hasSearched ? 'Found' : 'Popular'} {cfg.title}</div>
                  <h2>{hasSearched ? (state?.budget ? `Flights under ₹${state.budget.toLocaleString()}` : `Matching ${cfg.title}`) : 'Top Picks for You'}</h2>
                  {hasSearched && (from && to) && <p>📍 Showing results for {from} → {to}</p>}
                  <p>{hasSearched ? `${sorted.length} options available` : 'Hand-picked options with the best prices'}</p>
                </div>

                <div className="svc-results__controls">
                  <div className="svc-filter-group">
                    <label>Max Price: ₹{maxPrice.toLocaleString()}</label>
                    <input type="range" min="500" max="50000" step="500"
                      value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))}
                      style={{ accentColor: cfg.color }} />
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="svc-sort-select">
                    <option value="price">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Best Rating</option>
                  </select>
                </div>
              </div>

              {type === 'flights' && hasSearched && (
                <div className="smart-filters">
                  <button className="smart-chip active">Cheapest</button>
                  <button className="smart-chip">Fastest</button>
                  <button className="smart-chip">Best</button>
                </div>
              )}

              <div className="svc-samples__grid">
                {loading ? (
                  <div className="svc-loading-state">
                    <div className="spinner"></div>
                    <p>Searching for best {cfg.title}...</p>
                  </div>
                ) : displayItems.length === 0 ? (
                  <div className="svc-empty">
                    <p>{cfg.emoji} No results found{state?.budget ? ` under ₹${state.budget.toLocaleString()}` : ''}. Try adjusting your filters{state?.budget ? ' or increasing your budget' : ''}.</p>
                  </div>
                ) : (
                  displayItems.map((item, i) => (
                    <SampleCard 
                      key={item.id || item._id || i} 
                      item={item} 
                      type={type} 
                      color={cfg.color} 
                      navigate={navigate} 
                      onViewDetails={() => setSelectedFlight(item)}
                    />
                  ))
                )}
              </div>

              {sorted.length > 2 && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <button
                    className="svc-toggle-btn"
                    style={{ borderColor: cfg.color, color: cfg.color }}
                    onClick={() => {
                      setShowAll(!showAll)
                      if (showAll) window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    {showAll
                      ? <><ChevronUp size={18}/> Show Less</>
                      : <>View All {sorted.length} {cfg.title} <ChevronRight size={18}/></>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="svc-why section section--gray">
        <div className="container">
          <div className="section-header">
            <div className="tag">✨ Why GoAirClass {cfg.emoji}</div>
            <h2>The Smartest Way to Book {cfg.title}</h2>
          </div>
          <div className="svc-why__grid">
            {[
              { icon: '💰', title: 'Best Price', desc: 'We guarantee the lowest fares. Found cheaper? We match it.' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Get confirmed tickets in seconds. No waiting, no hassle.' },
              { icon: '🔒', title: 'Secure Payment', desc: '100% secure payments with end-to-end encryption.' },
              { icon: '📞', title: '24/7 Support', desc: 'Our travel experts are just a call away anytime.' },
            ].map((w, i) => (
              <div key={i} className="svc-why__card">
                <div className="svc-why__icon" style={{ background: `${cfg.color}18`, color: cfg.color }}>{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {selectedFlight && (
        <FlightDetailsModal 
          flight={selectedFlight} 
          onClose={() => setSelectedFlight(null)} 
        />
      )}

      {loading && <FlightLoader message="Searching for best flights..." />}
    </div>
  )
}

/* ── Card Component ── */
function SampleCard({ item, type, color, navigate, onViewDetails }) {
  const [loading, setLoading] = useState(false);

  const handleBook = async (e) => {
    e.stopPropagation()
    if (type === 'buses') {
      navigate(`/bus-selection/${item.id}`)
      return
    }

    if (type === 'flights') {
      try {
        setLoading(true)
        const res = await createBookingSession({
          flightId: item._id || item.id,
          searchData: {
            from: item.from,
            to: item.to,
            date: item.departureDate || new Date().toISOString()
          }
        })
        
        if (res.success) {
          navigate(`/flight/review?sessionId=${res.sessionId}&fareKey=${res.fareKey}&source=search`)
        }
      } catch (err) {
        console.error(err)
        toast.error(err.message || 'Failed to start booking')
      } finally {
        setLoading(false)
      }
      return
    }

    navigate(`/booking/${item.id || item._id}?type=${type.replace(/s$/, '')}`)
  }

  const handleViewDetails = (e) => {
    e.stopPropagation()
    if (onViewDetails) onViewDetails()
  }

  return (
    <>
      {loading && <FlightLoader message="Initiating your booking..." />}
      {type === 'hotels' ? (
        <div className="svc-card" onClick={handleBook}>
          <img src={item.image} alt={item.name} className="svc-card__img" />
          <div className="svc-card__body">
            <div className="hotel-stars">{'⭐'.repeat(item.stars)}</div>
            <h3>{item.name}</h3>
            <p>📍 {item.location}</p>
            <div className="svc-card__amenities">
              {item.amenities?.map(a => <span key={a} className="amenity-tag">{a}</span>)}
            </div>
            <div className="svc-card__meta">
              <Star size={13} fill="#F59E0B" color="#F59E0B" />
              <span>{item.rating} ({item.reviews} reviews)</span>
            </div>
          </div>
          <div className="svc-card__foot">
            <div className="svc-card__price" style={{ color }}>₹{item.price.toLocaleString()} <span>/night</span></div>
            <button className="svc-card__btn" style={{ background: color }} onClick={handleBook}>Book Now</button>
          </div>
        </div>
      ) : type === 'flights' ? (
        <div className="svc-card flight-card-v2" onClick={handleBook}>
          <div className="flight-body">
            {/* Airline Brand */}
            <div className="airline-brand">
              <div className="logo-wrapper" style={{ '--airline-color': color }}>
                {item.logo ? (
                  <img src={item.logo} alt={item.airline} className="airline-logo" />
                ) : (
                  <div className="logo-text">{item.airline[0]}</div>
                )}
              </div>
              <div className="brand-text">
                <h4 className="airline-name">{item.airline}</h4>
                <span className="flight-code">{item.flightNumber || item.code}</span>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="journey-timeline">
              <div className="checkpoint">
                <span className="time">{item.departureTime || item.depart}</span>
                <span className="city-code">{item.from}</span>
              </div>

              <div className="path-container">
                <span className="duration">{item.duration}</span>
                <div className="path-line">
                  <div className="airplane-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M21,16L21,14L13,9L13,3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5L10,9L2,14L2,16L10,13.5L10,19L8,20.5L8,22L11.5,21L15,22L15,20.5L13,19L13,13.5L21,16Z" />
                    </svg>
                  </div>
                </div>
                <span className="stop-info">{item.stops || 'Non-Stop'}</span>
              </div>

              <div className="checkpoint">
                <span className="time">{item.arrivalTime || item.arrive}</span>
                <span className="city-code">{item.to}</span>
              </div>
            </div>

            {/* Action Area */}
            <div className="price-action">
              <div className="price-display">
                <span className="label">Starts from</span>
                <div className="amount-box">
                  <span className="currency">₹</span>
                  <span className="value">{item.price.toLocaleString()}</span>
                </div>
              </div>
              <button className="premium-book-btn" style={{ '--brand-color': color }} onClick={handleBook}>
                Book Flight
              </button>
              <div className="view-details-link" onClick={handleViewDetails}>
                Flight Details <span>›</span>
              </div>
            </div>
          </div>

          <div className="flight-meta-footer">
            <div className="meta-perks">
              <div className="perk"><span className="icon">🎒</span> 7kg Cabin</div>
              <div className="perk"><span className="icon">💼</span> 15kg Check-in</div>
              <div className="perk"><span className="icon">🍽️</span> Free Meal</div>
            </div>
            <div className="meta-status">
              {item.refundable && <span className="status-tag refundable">Fully Refundable</span>}
              <span className="status-tag seats-left">{item.seats || '12'} Seats Left</span>
            </div>
          </div>
        </div>
      ) : type === 'trains' ? (
        <div className="svc-card svc-card--row" onClick={handleBook}>
          <div className="svc-card__airline-logo" style={{ background: color }}>🚆</div>
          <div className="svc-card__body">
            <h3>{item.name} #{item.number}</h3>
            <p>{item.from} → {item.to} · {item.depart} - {item.arrive} · {item.duration}</p>
            <div className="svc-card__meta">
              <span className="badge badge-green">{item.class}</span>
              <span style={{ marginLeft: 8 }}>{item.seats} seats</span>
            </div>
          </div>
          <div className="svc-card__foot">
            <div className="svc-card__price" style={{ color }}>₹{item.price.toLocaleString()}</div>
            <button className="svc-card__btn" style={{ background: color }} onClick={handleBook}>Book Now</button>
          </div>
        </div>
      ) : (
        <div className="svc-card svc-card--row" onClick={handleBook}>
          <div className="svc-card__airline-logo" style={{ background: color }}>🚌</div>
          <div className="svc-card__body">
            <h3>{item.operator}</h3>
            <p>{item.from} → {item.to} · {item.depart} - {item.arrive} · {item.duration} · {item.type}</p>
            <div className="svc-card__meta">
              <Star size={13} fill="#F59E0B" color="#F59E0B" />
              <span>{item.rating} · {item.seats} seats available</span>
            </div>
          </div>
          <div className="svc-card__foot">
            <div className="svc-card__price" style={{ color }}>₹{item.price.toLocaleString()}</div>
            <button className="svc-card__btn" style={{ background: color }} onClick={handleBook}>Book Now</button>
          </div>
        </div>
      )}
    </>
  );
}