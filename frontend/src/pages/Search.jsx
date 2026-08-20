import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Star, SlidersHorizontal, AlertCircle, Bus, ChevronRight,
  MapPin, Heart, CheckCircle2, Sparkles, Navigation2,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { searchResults } from '../data/mockData'
import { searchBusSchedules } from '../services/busService'
import './Search.css'

const TYPE_CONFIG = {
  flights: { label: 'Flights', emoji: '✈️', color: '#1d4ed8' },
  hotels:  { label: 'Hotels',  emoji: '🏨', color: '#c8972a' },
  trains:  { label: 'Trains',  emoji: '🚆', color: '#065f46' },
  buses:   { label: 'Buses',   emoji: '🚌', color: '#92400e' },
}

const SORT_OPTIONS = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'price',      label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'rating',     label: 'Rating: High to Low' },
]

const formatDate = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

const sortResults = (list, sortBy) => {
  const arr = [...list]
  if (sortBy === 'price') arr.sort((a, b) => a.price - b.price)
  else if (sortBy === 'price_desc') arr.sort((a, b) => b.price - a.price)
  else if (sortBy === 'rating') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  return arr
}

/* ── Sticky Search Summary Bar ── */
function SearchSummaryBar({ type, params, navigate, isSmartMode }) {
  const to = params.get('to') || ''
  const from = params.get('from') || ''
  const guests = params.get('guests') || '1'

  let pills
  if (isSmartMode) {
    pills = [
      { label: 'From', value: from || 'Anywhere' },
      { label: 'To', value: to || 'Anywhere' },
    ]
  } else if (type === 'hotels') {
    pills = [
      { label: 'City, Area or Property', value: to || '—' },
      { label: 'Check-in', value: formatDate(params.get('checkin')) },
      { label: 'Check-out', value: formatDate(params.get('checkout')) },
      { label: 'Rooms & Guests', value: `1 Room, ${guests} Guest${guests > 1 ? 's' : ''}` },
    ]
  } else if (type === 'flights') {
    pills = [
      { label: 'From', value: from || '—' },
      { label: 'To', value: to || '—' },
      { label: 'Depart', value: formatDate(params.get('date')) },
      { label: 'Travelers & Class', value: `${params.get('travelers') || '1'} · ${params.get('class') || 'Economy'}` },
    ]
  } else {
    pills = [
      { label: 'From', value: from || '—' },
      { label: 'To', value: to || '—' },
      { label: 'Date', value: formatDate(params.get('date')) },
    ]
  }

  return (
    <div className="search-bar">
      <div className="search-bar__inner container">
        <div className="search-bar__pills">
          {pills.map((p, i) => (
            <div className="search-bar__pill" key={i}>
              <span className="search-bar__pill-label">{p.label}</span>
              <span className="search-bar__pill-value">{p.value}</span>
            </div>
          ))}
        </div>
        <button className="search-bar__modify" onClick={() => navigate('/')}>
          <SlidersHorizontal size={14} /> Modify Search
        </button>
      </div>
    </div>
  )
}

/* ── Title Row ── */
function SearchTitleBar({ type, params, isSmartMode, count }) {
  const config = TYPE_CONFIG[type] || { label: 'Travel', emoji: '🌍' }
  const to = params.get('to')
  const from = params.get('from')
  const title = from && to
    ? `${from} → ${to}`
    : isSmartMode ? 'Smart Travel Search' : `${config.label}${to ? ` in ${to}` : ''}`

  return (
    <div className="search-titlebar container">
      <p className="search-titlebar__crumb">
        Home <ChevronRight size={12} /> {isSmartMode ? 'All Options' : config.label}{to && !from ? ` in ${to}` : ''}
      </p>
      <div className="search-titlebar__row">
        <h1 className="search-titlebar__title">
          {!isSmartMode && typeof count === 'number' && <span className="search-titlebar__count">{count} </span>}
          {title}
        </h1>
        {isSmartMode && params.get('budget') && (
          <span className="search-titlebar__budget">💰 Budget: ₹{parseInt(params.get('budget')).toLocaleString()}</span>
        )}
      </div>
    </div>
  )
}

/* ── Rewards banner ── */
function RewardsBanner() {
  return (
    <div className="rewards-banner">
      <span className="rewards-banner__icon"><Sparkles size={20} /></span>
      <div>
        <strong>GoAirClass Rewards</strong>
        <p>Earn reward points on this booking and redeem them for instant discounts next time.</p>
      </div>
    </div>
  )
}

/* ── Sort tabs ── */
function SortTabs({ sortBy, setSortBy }) {
  return (
    <div className="sort-tabs">
      {SORT_OPTIONS.map(opt => (
        <button
          key={opt.key}
          className={`sort-tabs__btn ${sortBy === opt.key ? 'active' : ''}`}
          onClick={() => setSortBy(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ── Smart Mode ── */
function SmartSearchResults({ params, navigate }) {
  const budget = parseInt(params.get('budget') || '50000')
  const from = params.get('from') || ''
  const to   = params.get('to')   || ''

  const flights = searchResults.flights.filter(f => f.price <= budget).map(f => ({ ...f, from: `${from} (Airport)`, to: `${to} (Airport)` }))
  const trains  = searchResults.trains.filter(t  => t.price <= budget).map(t => ({ ...t, from, to }))
  const buses   = searchResults.buses.filter(b   => b.price <= budget).map(b => ({ ...b, from, to }))

  const sections = [
    { key: 'flights', label: 'Flights', emoji: '✈️', color: '#00206B', data: flights },
    { key: 'trains',  label: 'Trains',  emoji: '🚆', color: '#0d9488', data: trains  },
    { key: 'buses',   label: 'Buses',   emoji: '🚌', color: '#c8972a', data: buses   },
  ]

  return (
    <div className="smart-results">
      {from && to && (
        <div style={{marginBottom:'24px',padding:'12px',background:'#f0f9ff',borderRadius:'8px',textAlign:'center'}}>
          <strong>📍 Showing results for: {from} → {to}</strong>
        </div>
      )}
      {sections.map(sec => (
        <div key={sec.key} className="smart-section">
          <div className="smart-section__header" style={{ borderColor: sec.color }}>
            <div className="smart-section__title">
              <span className="smart-section__emoji">{sec.emoji}</span>
              <h2>{sec.label}</h2>
              <span className="smart-section__count" style={{ background: sec.color }}>{sec.data.length} found</span>
            </div>
            <button className="smart-section__view-all" style={{ color: sec.color }}
              onClick={() => navigate(`/${sec.key}?from=${from}&to=${to}`)}>
              View All <ChevronRight size={16} />
            </button>
          </div>

          {sec.data.length === 0 ? (
            <div className="smart-section__empty">
              <p>No {sec.label.toLowerCase()} found within ₹{budget.toLocaleString()} budget.</p>
            </div>
          ) : (
            <div className="smart-section__cards">
              {sec.data.slice(0, 2).map(item => (
                <SmartCard key={item.id} item={item} type={sec.key} navigate={navigate} color={sec.color} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Smart Card ── */
function SmartCard({ item, type, navigate, color }) {
  const handleBook = (e) => {
    e.stopPropagation()
    if (type === 'buses') navigate(`/bus-selection/${item.id}`)
    else navigate(`/booking/${item.id}?type=${type.replace(/s$/, '')}`)
  }

  return (
    <div className="smart-card" onClick={() => navigate(`/${type}`)}>
      <div className="smart-card__body">
        {type === 'flights' && (
          <>
            <div className="smart-card__row">
              <div className="airline-logo" style={{ background: color }}>{item.airline[0]}</div>
              <div>
                <div className="flight-name">{item.airline} · {item.code}</div>
                <div className="smart-card__times">{item.from} → {item.to} · {item.depart} → {item.arrive} · {item.duration}</div>
              </div>
            </div>
            <div className="smart-card__meta">
              <Star size={12} fill="#F59E0B" color="#F59E0B" />
              <span>{item.rating}</span>
              <span className="sc-seats">{item.seats} seats left</span>
            </div>
          </>
        )}
        {type === 'trains' && (
          <>
            <div className="smart-card__row">
              <span className="sc-icon">🚆</span>
              <div>
                <div className="flight-name">{item.name} #{item.number}</div>
                <div className="smart-card__times">{item.from} → {item.to} · {item.depart} → {item.arrive} · {item.duration}</div>
              </div>
            </div>
            <div className="smart-card__meta">
              <span className="badge badge-green">{item.class}</span>
              <span className="sc-seats">{item.seats} seats</span>
            </div>
          </>
        )}
        {type === 'buses' && (
          <>
            <div className="smart-card__row">
              <span className="sc-icon">🚌</span>
              <div>
                <div className="flight-name">{item.operator}</div>
                <div className="smart-card__times">{item.from} → {item.to} · {item.depart} → {item.arrive} · {item.duration} · {item.type}</div>
              </div>
            </div>
            <div className="smart-card__meta">
              <Star size={12} fill="#F59E0B" color="#F59E0B" />
              <span>{item.rating}</span>
              <span className="sc-seats">{item.seats} seats left</span>
            </div>
          </>
        )}
      </div>
      <div className="smart-card__aside">
        <div className="smart-card__price" style={{ color }}>₹{item.price.toLocaleString()}</div>
        <button className="smart-card__btn" style={{ background: color }} onClick={handleBook}>Book</button>
      </div>
    </div>
  )
}

/* ── Flight result card ── */
function FlightCard({ item, navigate }) {
  return (
    <div className="flight-card2" onClick={() => navigate(`/detail/${item.id}?type=flight`)}>
      <div className="flight-card2__top">
        <div className="flight-card2__airline">
          <span className="flight-card2__logo">{item.airline[0]}</span>
          <div>
            <div className="flight-card2__name">{item.airline}</div>
            <div className="flight-card2__code">{item.code}</div>
          </div>
        </div>
        <span className="flight-card2__stops">{item.stops}</span>
      </div>

      <div className="flight-card2__times">
        <div className="flight-card2__time">
          <strong>{item.depart}</strong>
          <span>{(item.from || '').split('(')[0].trim()}</span>
        </div>
        <div className="flight-card2__line">
          <i />
          <em>{item.duration}</em>
          <i />
        </div>
        <div className="flight-card2__time flight-card2__time--end">
          <strong>{item.arrive}</strong>
          <span>{(item.to || '').split('(')[0].trim()}</span>
        </div>
      </div>

      <div className="flight-card2__footer">
        <span className="flight-card2__rating"><Star size={13} fill="#f0aa38" color="#f0aa38" /> {item.rating}</span>
        <span className="flight-card2__seats">{item.seats} seats left</span>
        <div className="flight-card2__priceblock">
          <span className="flight-card2__price">₹{item.price.toLocaleString()}</span>
          <button
            className="flight-card2__btn"
            onClick={e => { e.stopPropagation(); navigate(`/booking/${item.id}?type=flight`) }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Hotel result card ── */
function HotelCard({ item, navigate }) {
  const [liked, setLiked] = useState(false)
  const ratingLabel = item.rating >= 4.6 ? 'Excellent' : item.rating >= 4.2 ? 'Very Good' : item.rating >= 3.5 ? 'Good' : 'Fair'

  return (
    <div className="hotel-card2" onClick={() => navigate(`/detail/${item.id}?type=hotel`)}>
      <div className="hotel-card2__imgwrap">
        <img src={item.image} alt={item.name} />
        <button
          className="hotel-card2__like"
          onClick={e => { e.stopPropagation(); setLiked(l => !l) }}
          aria-label="Save hotel"
        >
          <Heart size={16} fill={liked ? '#e11d48' : 'none'} color={liked ? '#e11d48' : '#fff'} />
        </button>
      </div>

      <div className="hotel-card2__body">
        <div className="hotel-card2__stars">
          {Array.from({ length: item.stars }).map((_, i) => (
            <Star key={i} size={13} fill="#f0aa38" color="#f0aa38" />
          ))}
        </div>
        <h3 className="hotel-card2__name">{item.name}</h3>
        <p className="hotel-card2__loc"><MapPin size={13} /> {item.location}</p>
        <div className="hotel-card2__checks">
          {item.amenities.slice(0, 3).map(a => (
            <span key={a} className="hotel-card2__check"><CheckCircle2 size={13} /> {a}</span>
          ))}
        </div>
      </div>

      <div className="hotel-card2__aside">
        <span className="hotel-card2__ratingbadge">
          {ratingLabel} <strong>{item.rating}</strong>
        </span>
        <span className="hotel-card2__reviews">({item.reviews.toLocaleString()} Ratings)</span>
        <div className="hotel-card2__price">
          ₹{item.price.toLocaleString()}<span> /night</span>
        </div>
        <button
          className="hotel-card2__btn"
          onClick={e => { e.stopPropagation(); navigate(`/booking/${item.id}?type=hotel`) }}
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function Search() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const type        = params.get('type') || ''
  const isSmartMode = !type || type === 'all'
  const womenOnly   = params.get('women') === 'true'

  const [sortBy, setSortBy]         = useState('popularity')
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedAirlines, setSelectedAirlines] = useState([])
  const [selectedStars, setSelectedStars]       = useState([])
  const [loading, setLoading]       = useState(!isSmartMode)
  const [results, setResults]       = useState([])
  const [error, setError]           = useState(null)

  useEffect(() => {
    if (isSmartMode) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        if (type === 'buses') {
          const searchParams = {
            from: params.get('from'),
            to:   params.get('to'),
            date: params.get('date')
          }
          const apiData = await searchBusSchedules(searchParams)
          let mappedBuses = apiData.map(schedule => {
            const getDuration = (start, end) => {
              if (!start || !end) return '6h 30m'
              try {
                const s = start.split(':').map(Number)
                const e = end.split(':').map(Number)
                let diff = (e[0]*60+e[1]) - (s[0]*60+s[1])
                if (diff < 0) diff += 1440
                return `${Math.floor(diff/60)}h ${diff%60}m`
              } catch { return '6h 30m' }
            }
            return {
              id: schedule._id,
              operator: schedule.bus?.busName || 'Premium Bus',
              type: schedule.bus?.busType || 'A/C Sleeper',
              depart: schedule.departureTime,
              arrive: schedule.arrivalTime,
              from: schedule.route?.fromCity || params.get('from'),
              to: schedule.route?.toCity || params.get('to'),
              duration: getDuration(schedule.departureTime, schedule.arrivalTime),
              price: schedule.finalPrice || schedule.ticketPrice,
              seats: schedule.bus?.totalSeats || 36,
              rating: schedule.operator?.rating || 4.5,
              amenities: schedule.bus?.amenities || [],
              coupon: schedule.coupon,
              operatorId: schedule.operator?._id || schedule.operator,
              routeId: schedule.route?._id || schedule.route,
              regNo: schedule.bus?.busNumber || 'N/A',
              hasLadiesSeats: true,
            }
          })
          if (womenOnly) mappedBuses = mappedBuses.filter(b => b.hasLadiesSeats)
          setResults(mappedBuses)
        } else {
          await new Promise(r => setTimeout(r, 800))
          setResults(searchResults[type] || searchResults.flights)
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch results.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [type, params, isSmartMode])

  // Reset filter selections whenever a fresh result set comes in
  useEffect(() => {
    if (type === 'flights') setSelectedAirlines([...new Set(results.map(r => r.airline))])
    if (type === 'hotels') setSelectedStars([...new Set(results.map(r => r.stars))])
  }, [results, type])

  const toggleAirline = (a) => setSelectedAirlines(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  const toggleStar    = (s) => setSelectedStars(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const airlineCounts = type === 'flights'
    ? results.reduce((acc, f) => { acc[f.airline] = (acc[f.airline] || 0) + 1; return acc }, {})
    : {}
  const starCounts = type === 'hotels'
    ? results.reduce((acc, h) => { acc[h.stars] = (acc[h.stars] || 0) + 1; return acc }, {})
    : {}

  let filtered = results.filter(r => r.price <= priceRange[1])
  if (type === 'flights') filtered = filtered.filter(r => selectedAirlines.length === 0 || selectedAirlines.includes(r.airline))
  if (type === 'hotels') filtered = filtered.filter(r => selectedStars.length === 0 || selectedStars.includes(r.stars))
  const displayResults = sortResults(filtered, sortBy)

  return (
    <div className="search-page">
      <Navbar />

      <SearchSummaryBar type={type || 'flights'} params={params} navigate={navigate} isSmartMode={isSmartMode} />
      <SearchTitleBar type={type} params={params} isSmartMode={isSmartMode} count={isSmartMode ? undefined : displayResults.length} />

      <div className="container">
        {isSmartMode ? (
          <SmartSearchResults params={params} navigate={navigate} />
        ) : (
          <div className="search-page__body">
            <aside className="filters">
              {type === 'hotels' && (
                <div className="filters__map">
                  <span className="filters__map-icon"><Navigation2 size={20} /></span>
                  <span>Explore on Map</span>
                </div>
              )}

              <div className="filters__header">
                <SlidersHorizontal size={18} color="var(--primary)" />
                <h3>Filters</h3>
              </div>
              <div className="filter-group">
                <h4>Price Range</h4>
                <input type="range" min="0" max="50000" value={priceRange[1]}
                  onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="range-input" />
                <div className="filter-group__range-labels">
                  <span>₹0</span><span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
              {type === 'flights' && (
                <div className="filter-group">
                  <h4>Airlines</h4>
                  {Object.keys(airlineCounts).map(a => (
                    <label key={a} className="filter-check">
                      <input type="checkbox" checked={selectedAirlines.includes(a)} onChange={() => toggleAirline(a)} />
                      {a} <span className="filter-check__count">({airlineCounts[a]})</span>
                    </label>
                  ))}
                </div>
              )}
              {type === 'hotels' && (
                <div className="filter-group">
                  <h4>Star Rating</h4>
                  {Object.keys(starCounts).sort((a, b) => b - a).map(s => (
                    <label key={s} className="filter-check">
                      <input type="checkbox" checked={selectedStars.includes(Number(s))} onChange={() => toggleStar(Number(s))} />
                      {'⭐'.repeat(Number(s))} ({s} Star) <span className="filter-check__count">({starCounts[s]})</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="filter-group">
                <h4>Departure Time</h4>
                {['Early Morning (0-6)','Morning (6-12)','Afternoon (12-18)','Evening (18-24)'].map(t => (
                  <label key={t} className="filter-check"><input type="checkbox" defaultChecked /> {t}</label>
                ))}
              </div>
            </aside>

            <div className="results">
              <SortTabs sortBy={sortBy} setSortBy={setSortBy} />

              <RewardsBanner />

              <div className="results__list">
                {loading ? (
                  Array.from({length:3}).map((_,i) => (
                    <div key={i} className="result-skeleton">
                      <div className="skeleton" style={{height:40,width:'30%',marginBottom:8}}/>
                      <div className="skeleton" style={{height:20,width:'60%',marginBottom:6}}/>
                      <div className="skeleton" style={{height:20,width:'45%'}}/>
                    </div>
                  ))
                ) : error ? (
                  <div className="search-error">
                    <AlertCircle size={48}/>
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                  </div>
                ) : displayResults.length === 0 ? (
                  <div className="search-empty">
                    <Bus size={64}/>
                    <h3>No results found</h3>
                    <p>Try changing dates, route or filters.</p>
                  </div>
                ) : type === 'flights' ? (
                  displayResults.map(item => <FlightCard key={item.id} item={item} navigate={navigate} />)
                ) : type === 'hotels' ? (
                  displayResults.map(item => <HotelCard key={item.id} item={item} navigate={navigate} />)
                ) : (
                  displayResults.map(item => (
                    <ResultCard key={item.id} item={item} type={type} navigate={navigate} travelDate={params.get('date')} params={params} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

/* ── Train / Bus result cards (unchanged layout, rebranded via CSS vars) ── */
function ResultCard({ item, type, navigate, travelDate, params }) {
  if (type === 'trains') return (
    <div className="result-card" onClick={() => navigate(`/detail/${item.id}?type=train`)}>
      <div className="result-card__main">
        <div><h3 className="train-name">{item.name}</h3><span className="train-number">#{item.number}</span></div>
        <div className="flight-times">
          <div className="flight-time"><span className="time-value">{item.depart}</span><span className="time-city">{item.from}</span></div>
          <div className="flight-duration"><div className="duration-line"><div/><span>🚆</span><div/></div><span>{item.duration}</span></div>
          <div className="flight-time"><span className="time-value">{item.arrive}</span><span className="time-city">{item.to}</span></div>
        </div>
        <span className="badge badge-green">{item.class}</span>
      </div>
      <div className="result-card__aside">
        <div className="result-card__price">₹{item.price.toLocaleString()}</div>
        <div className="result-card__seats">{item.seats} seats</div>
        <button className="btn btn-primary" style={{padding:'10px 20px',fontSize:14}}
          onClick={e=>{e.stopPropagation();navigate(`/booking/${item.id}?type=train`)}}>Book Now</button>
      </div>
    </div>
  )

  return (
    <div className="bus-card" onClick={() => {
      const womenParam = params.get('women') === 'true' ? '&women=true' : '';
      navigate(`/bus-selection/${item.id}${travelDate ? `?date=${travelDate}` : ''}${womenParam}`);
    }}>
      {/* Brand Header */}
      <div className="bus-card__header">
        <div className="badge-primo">Primo <span>★</span></div>
        {item.coupon && (
          <div className="badge-discount">
            {item.coupon.rules?.lastMinute ? 'Last min ' : 'Special '}
            {item.coupon.discountValue}{item.coupon.discountType === 'percentage' ? '%' : ''} OFF
          </div>
        )}
        {item.hasLadiesSeats && <div className="badge-ladies">👩 Ladies seats available</div>}
      </div>
      <div className="bus-card__body">
        <div className="bus-card__id-row">
          <span className="reg-tag">{item.regNo || 'N/A'}</span>
          <span className="status-badge">STARTING</span>
          <span className="route-stops">From: {item.from} → {item.to}</span>
        </div>
        <div className="bus-card__times">
          <div className="bus-time-group">
            <div className="bus-time-val">{item.depart} — {item.arrive}</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'4px'}}>
              <span className="bus-duration-val">{item.duration}</span>
              <span className="bus-seats-val">{item.seats} Seats</span>
            </div>
          </div>
          <div className="bus-card__price-col">
            <div className="bus-price-row">
              <span className="bus-original-price">₹{Math.floor(item.price*1.1)}</span>
              <span className="bus-final-price">₹{item.price.toLocaleString()}</span>
            </div>
            <span className="onwards">Onwards</span>
          </div>
        </div>
      </div>
      <div className="bus-card__footer">
        <div className="operator-info">
          <div className="operator-name">{item.operator}</div>
          <div className="bus-type-desc">{item.type}</div>
        </div>
        <div className="rating-badge">
          <div className="rating-val"><Star size={12} fill="#fff"/> {item.rating}</div>
        </div>
      </div>
    </div>
  )
}
