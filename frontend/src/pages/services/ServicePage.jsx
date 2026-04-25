// src/pages/services/ServicePage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronUp, Star } from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getHeroImages } from '../../services/heroImageService'
import { searchResults } from '../../data/mockData'
import './ServicePage.css'

export default function ServicePage({ type }) {
  const navigate = useNavigate()
  const [bgImage, setBgImage]   = useState(null)
  const [from, setFrom]         = useState('')
  const [to, setTo]             = useState('')
  const [date, setDate]         = useState('')
  const [guests, setGuests]     = useState('1')
  const [showAll, setShowAll]   = useState(false)
  const [sortBy, setSortBy]     = useState('price')
  const [maxPrice, setMaxPrice] = useState(50000)

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
  }, [type])

  const handleSearch = () => {
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

    toast.success('Searching...')
    setShowAll(true)
    setTimeout(() => {
      document.getElementById('svc-results')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  // Filter + sort
  const allItems = (searchResults[type] || []).filter(item => item.price <= maxPrice)
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

            <button className="svc-search-btn" style={{ background: cfg.color }} onClick={handleSearch}>
              Search {cfg.emoji}
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
          <div className="svc-results__header">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
              <div className="tag">🔥 {showAll ? 'All' : 'Popular'} {cfg.title}</div>
              <h2>{showAll ? `All ${cfg.title}` : 'Top Picks for You'}</h2>
              <p>{showAll ? `${sorted.length} results found` : 'Hand-picked options with the best prices'}</p>
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

          <div className="svc-samples__grid">
            {displayItems.length === 0 ? (
              <div className="svc-empty">
                <p>{cfg.emoji} No results found within ₹{maxPrice.toLocaleString()}. Try increasing the price range.</p>
              </div>
            ) : (
              displayItems.map((item, i) => (
                <SampleCard key={item.id || i} item={item} type={type} color={cfg.color} navigate={navigate} />
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
    </div>
  )
}

/* ── Card Component ── */
function SampleCard({ item, type, color, navigate }) {
  const handleBook = (e) => {
    e.stopPropagation()
    if (type === 'buses') navigate(`/bus-selection/${item.id}`)
    else navigate(`/booking/${item.id}?type=${type.replace(/s$/, '')}`)
  }

  if (type === 'hotels') return (
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
  )

  if (type === 'flights') return (
    <div className="svc-card svc-card--row" onClick={handleBook}>
      <div className="svc-card__airline-logo" style={{ background: color }}>{item.airline[0]}</div>
      <div className="svc-card__body">
        <h3>{item.airline} · {item.code}</h3>
        <p>{item.from} → {item.to} · {item.depart} - {item.arrive} · {item.duration} · {item.stops}</p>
        <div className="svc-card__meta">
          <Star size={13} fill="#F59E0B" color="#F59E0B" />
          <span>{item.rating} · {item.seats} seats left</span>
        </div>
      </div>
      <div className="svc-card__foot">
        <div className="svc-card__price" style={{ color }}>₹{item.price.toLocaleString()}</div>
        <button className="svc-card__btn" style={{ background: color }} onClick={handleBook}>Book Now</button>
      </div>
    </div>
  )

  if (type === 'trains') return (
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
  )

  return (
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
  )
}