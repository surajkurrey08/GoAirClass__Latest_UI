import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Star, SlidersHorizontal, ArrowUpDown, AlertCircle, Bus, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import SearchForm from '../components/SearchForm'
import Footer from '../components/Footer'
import { searchResults } from '../data/mockData'
import { searchBusSchedules } from '../services/auth'
import { getHeroImages } from '../services/heroImageService'
import './Search.css'

const TYPE_CONFIG = {
  flights: { label: 'Flights', emoji: '✈️', color: '#1d4ed8' },
  trains:  { label: 'Trains',  emoji: '🚆', color: '#065f46' },
  buses:   { label: 'Buses',   emoji: '🚌', color: '#92400e' },
}

/* ── Hero ── */
function SearchHero({ type, params, isSmartMode }) {
  const [bgImage, setBgImage] = useState(null)
  const config = TYPE_CONFIG[type] || { label: 'Travel', emoji: '🌍', color: '#1d4ed8' }

  useEffect(() => {
    const typeMap = { flights: 'flight', hotels: 'hotel', trains: 'train', buses: 'bus' }
    getHeroImages(typeMap[type] || 'flight').then(imgs => {
      if (imgs?.length > 0) setBgImage(imgs[0].url)
    })
  }, [type])

  const title = params.get('from') && params.get('to')
    ? `${params.get('from')} → ${params.get('to')}`
    : isSmartMode ? 'Smart Travel Search' : `Search ${config.label}`

  return (
    <div className="search-hero">
      {bgImage ? (
        <div className="search-hero__bg">
          <img src={bgImage} alt={config.label} className="search-hero__img" />
          <div className="search-hero__overlay" />
        </div>
      ) : (
        <div className="search-hero__fallback" style={{ background: `linear-gradient(135deg, ${config.color} 0%, #0a1628 100%)` }} />
      )}
      <div className="search-hero__content container">
        <p className="search-hero__breadcrumb">
          Home / {isSmartMode ? 'All Options' : config.label}
        </p>
        <div className="search-hero__title-row">
          <span className="search-hero__emoji">{isSmartMode ? '🌍' : config.emoji}</span>
          <h1 className="search-hero__title">{title}</h1>
        </div>
        {isSmartMode && params.get('budget') && (
          <div className="search-hero__budget-tag">
            💰 Budget: ₹{parseInt(params.get('budget')).toLocaleString()}
          </div>
        )}
        {/* Search Form Removed */}
      </div>
    </div>
  )
}

/* ── Smart Mode — flights, trains, buses only with Pune → Delhi routing ── */
function SmartSearchResults({ params, navigate }) {
  const budget = parseInt(params.get('budget') || '50000')
  const from = params.get('from') || 'Pune'
  const to   = params.get('to')   || 'Delhi'

  // Filter and map results for Pune → Delhi route
  const flights = searchResults.flights
    .filter(f => f.price <= budget)
    .map(f => ({
      ...f,
      from: 'Pune (PNQ)',
      to: 'Delhi (DEL)',
      depart: f.depart || '06:00',
      arrive: f.arrive || '08:30',
      duration: f.duration || '2h 30m'
    }))
  
  const trains = searchResults.trains
    .filter(t => t.price <= budget)
    .map(t => ({
      ...t,
      from: 'Pune Junction',
      to: 'New Delhi',
      depart: t.depart || '20:00',
      arrive: t.arrive || '08:00',
      duration: '12h 00m'
    }))
  
  const buses = searchResults.buses
    .filter(b => b.price <= budget)
    .map(b => ({
      ...b,
      from: 'Pune',
      to: 'Delhi',
      depart: b.depart || '18:00',
      arrive: b.arrive || '08:00',
      duration: '14h 00m'
    }))

  const sections = [
    { key: 'flights', label: 'Flights', emoji: '✈️', color: '#2563eb', data: flights },
    { key: 'trains',  label: 'Trains',  emoji: '🚆', color: '#059669', data: trains  },
    { key: 'buses',   label: 'Buses',   emoji: '🚌', color: '#d97706', data: buses   },
  ]

  return (
    <div className="smart-results">
      <div className="route-banner" style={{marginBottom: '24px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', textAlign: 'center'}}>
        <strong>📍 Showing results for: Pune → Delhi</strong>
      </div>
      {sections.map(sec => (
        <div key={sec.key} className="smart-section">
          <div className="smart-section__header" style={{ borderColor: sec.color }}>
            <div className="smart-section__title">
              <span className="smart-section__emoji">{sec.emoji}</span>
              <h2>{sec.label}</h2>
              <span className="smart-section__count" style={{ background: sec.color }}>
                {sec.data.length} found
              </span>
            </div>
            <button
              className="smart-section__view-all"
              style={{ color: sec.color }}
              onClick={() => navigate(`/${sec.key}?from=Pune&to=Delhi`)}
            >
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

  const handleClick = () => navigate(`/${type}?from=Pune&to=Delhi`)

  return (
    <div className="smart-card" onClick={handleClick}>
      <div className="smart-card__body">
        {type === 'flights' && (
          <>
            <div className="smart-card__row">
              <div className="airline-logo" style={{ background: color }}>{item.airline[0]}</div>
              <div>
                <div className="flight-name">{item.airline} · {item.code}</div>
                <div className="smart-card__times">Pune → Delhi · {item.depart} → {item.arrive} · {item.duration}</div>
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
                <div className="smart-card__times">Pune → Delhi · {item.depart} → {item.arrive} · {item.duration}</div>
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
                <div className="smart-card__times">Pune → Delhi · {item.depart} → {item.arrive} · {item.duration}</div>
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

/* ── Main ── */
export default function Search() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const type = params.get('type') || ''
  const isSmartMode = !type || type === 'all'

  const [sortBy, setSortBy]         = useState('price')
  const [priceRange, setPriceRange] = useState([0, 50000])
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
          const sp = { from: 'Pune', to: 'Delhi', date: params.get('date') || new Date().toISOString().split('T')[0] }
          const apiData = await searchBusSchedules(sp)
          const mappedBuses = apiData.map(schedule => {
            const getDuration = (start, end) => {
              if (!start || !end) return '14h 00m'
              try {
                const s = start.split(':').map(Number)
                const e = end.split(':').map(Number)
                let diff = (e[0]*60+e[1]) - (s[0]*60+s[1])
                if (diff < 0) diff += 1440
                return `${Math.floor(diff/60)}h ${diff%60}m`
              } catch { return '14h 00m' }
            }
            return {
              id: schedule._id,
              operator: schedule.bus?.busName || 'Premium Bus',
              type: schedule.bus?.busType || 'A/C Sleeper',
              depart: schedule.departureTime,
              arrive: schedule.arrivalTime,
              from: 'Pune',
              to: 'Delhi',
              duration: getDuration(schedule.departureTime, schedule.arrivalTime),
              price: schedule.finalPrice || schedule.ticketPrice,
              seats: schedule.bus?.totalSeats || 36,
              rating: schedule.operator?.rating || 4.5,
              amenities: schedule.bus?.amenities || [],
              coupon: schedule.coupon,
            }
          })
          setResults(mappedBuses)
        } else {
          await new Promise(r => setTimeout(r, 800))
          let data = searchResults[type] || searchResults.flights
          // Force Pune → Delhi route for all results
          data = data.map(item => ({
            ...item,
            from: 'Pune',
            to: 'Delhi'
          }))
          setResults(data)
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

  return (
    <div className="search-page">
      <Navbar />
      <SearchHero type={type || 'flights'} params={params} isSmartMode={isSmartMode} />

      <div className="container">
        {isSmartMode ? (
          <SmartSearchResults params={params} navigate={navigate} />
        ) : (
          <div className="search-page__body">
            <aside className="filters">
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
                  {['IndiGo', 'Air India', 'Vistara', 'SpiceJet'].map(a => (
                    <label key={a} className="filter-check"><input type="checkbox" defaultChecked /> {a}</label>
                  ))}
                </div>
              )}
              {type === 'hotels' && (
                <div className="filter-group">
                  <h4>Star Rating</h4>
                  {[5,4,3,2,1].map(s => (
                    <label key={s} className="filter-check">
                      <input type="checkbox" defaultChecked={s >= 4} />{'⭐'.repeat(s)} ({s} Star)
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
              <div className="results__header">
                <p className="results__count">{results.length} {type} found</p>
                <div className="results__sort">
                  <ArrowUpDown size={14} />
                  <span>Sort by:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="price">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>

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
                ) : results.length === 0 ? (
                  <div className="search-empty">
                    <Bus size={64}/>
                    <h3>No results found</h3>
                    <p>Try changing dates or route.</p>
                  </div>
                ) : (
                  results.map(item => <ResultCard key={item.id} item={item} type={type} navigate={navigate}/>)
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

/* ── Result Cards with Pune → Delhi routing ── */
function ResultCard({ item, type, navigate }) {
  if (type === 'flights') return (
    <div className="result-card" onClick={() => navigate(`/detail/${item.id}?type=flight`)}>
      <div className="result-card__main">
        <div className="flight-airline">
          <div className="airline-logo">{item.airline[0]}</div>
          <div><div className="flight-name">{item.airline}</div><div className="flight-code">{item.code}</div></div>
        </div>
        <div className="flight-times">
          <div className="flight-time"><span className="time-value">{item.depart || '06:00'}</span><span className="time-city">Pune</span></div>
          <div className="flight-duration">
            <div className="duration-line"><div/><span>✈</span><div/></div>
            <span>{item.duration || '2h 30m'} · Direct</span>
          </div>
          <div className="flight-time"><span className="time-value">{item.arrive || '08:30'}</span><span className="time-city">Delhi</span></div>
        </div>
        <div className="result-card__rating"><Star size={14} fill="#F59E0B" color="#F59E0B"/><span>{item.rating}</span></div>
      </div>
      <div className="result-card__aside">
        <div className="result-card__price">₹{item.price.toLocaleString()}</div>
        <div className="result-card__seats">{item.seats} seats left</div>
        <button className="btn btn-primary" style={{padding:'10px 20px',fontSize:14}}
          onClick={e=>{e.stopPropagation();navigate(`/booking/${item.id}?type=flight`)}}>Book Now</button>
      </div>
    </div>
  )

  if (type === 'hotels') return (
    <div className="result-card result-card--hotel" onClick={() => navigate(`/detail/${item.id}?type=hotel`)}>
      <img src={item.image} alt={item.name} className="hotel-img"/>
      <div className="result-card__main">
        <div>
          <div className="hotel-stars">{'⭐'.repeat(item.stars)}</div>
          <h3 className="hotel-name">{item.name}</h3>
          <p className="hotel-loc">📍 {item.location}</p>
          <div className="hotel-amenities">{item.amenities.map(a=><span key={a} className="amenity-tag">{a}</span>)}</div>
        </div>
        <div className="hotel-reviews"><Star size={14} fill="#F59E0B" color="#F59E0B"/><span>{item.rating}</span><span className="review-count">({item.reviews} reviews)</span></div>
      </div>
      <div className="result-card__aside">
        <div className="result-card__price">₹{item.price.toLocaleString()}</div>
        <div className="result-card__seats">per night</div>
        <button className="btn btn-primary" style={{padding:'10px 20px',fontSize:14}}
          onClick={e=>{e.stopPropagation();navigate(`/booking/${item.id}?type=hotel`)}}>Book Now</button>
      </div>
    </div>
  )

  if (type === 'trains') return (
    <div className="result-card" onClick={() => navigate(`/detail/${item.id}?type=train`)}>
      <div className="result-card__main">
        <div><h3 className="train-name">{item.name}</h3><span className="train-number">#{item.number}</span></div>
        <div className="flight-times">
          <div className="flight-time"><span className="time-value">{item.depart || '20:00'}</span><span className="time-city">Pune</span></div>
          <div className="flight-duration"><div className="duration-line"><div/><span>🚆</span><div/></div><span>{item.duration || '12h 00m'}</span></div>
          <div className="flight-time"><span className="time-value">{item.arrive || '08:00'}</span><span className="time-city">Delhi</span></div>
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
    <div className="bus-card" onClick={() => navigate(`/bus-selection/${item.id}`)}>
      <div className="bus-card__header">
        <div className="badge-primo">Primo <span>★</span></div>
        {item.coupon && <div className="badge-discount">{item.coupon.discountValue}{item.coupon.discountType==='percentage'?'%':''} OFF</div>}
      </div>
      <div className="bus-card__body">
        <div className="bus-card__id-row">
          <span className="reg-tag">MH12C1234</span>
          <span className="status-badge">STARTING</span>
          <span className="route-stops">Pune → Delhi</span>
        </div>
        <div className="bus-card__times">
          <div className="bus-time-group">
            <div className="bus-time-val">{item.depart || '18:00'} — {item.arrive || '08:00'}</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'4px'}}>
              <span className="bus-duration-val">{item.duration || '14h 00m'}</span>
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