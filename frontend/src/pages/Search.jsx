import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Filter, Star, Clock, Wifi, Dumbbell, Waves, ChevronRight, SlidersHorizontal, ArrowUpDown, AlertCircle, Bus, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import SearchForm from '../components/SearchForm'
import Footer from '../components/Footer'
import { searchResults } from '../data/mockData'
import { searchBusSchedules } from '../services/auth'
import './Search.css'

export default function Search() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const type = params.get('type') || 'flights'
  const [sortBy, setSortBy] = useState('price')
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        if (type === 'buses') {
          const searchParams = {
            from: params.get('from'),
            to: params.get('to'),
            date: params.get('date')
          }
          const apiData = await searchBusSchedules(searchParams)
          
          // Map API data to UI format
          const mappedBuses = apiData.map(schedule => {
            // Simple duration calculation helper
            const getDuration = (start, end) => {
              if (!start || !end) return '6h 30m'
              try {
                const s = start.split(':').map(Number)
                const e = end.split(':').map(Number)
                let diff = (e[0] * 60 + e[1]) - (s[0] * 60 + s[1])
                if (diff < 0) diff += 1440 // Over midnight
                return `${Math.floor(diff / 60)}h ${diff % 60}m`
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
              amenities: schedule.bus?.amenities || []
            }
          })
          setResults(mappedBuses)
        } else {
          // Keep mock data for other types
          await new Promise(resolve => setTimeout(resolve, 800))
          setResults(searchResults[type] || searchResults.flights)
        }
      } catch (err) {
        console.error("Search API Error:", err)
        setError(err.message || 'Failed to fetch search results. Please try again.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type, params])

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-page__header">
        <div className="container">
          <div style={{paddingTop: 80}}>
            <p className="search-page__breadcrumb">Home / Search / {type.charAt(0).toUpperCase()+type.slice(1)}</p>
            <h1 style={{fontSize:28,marginBottom:20}}>
              {params.get('from') && params.get('to')
                ? `${params.get('from')} → ${params.get('to')}`
                : `Search ${type.charAt(0).toUpperCase()+type.slice(1)}`}
            </h1>
            <SearchForm variant="page" />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="search-page__body">
          {/* Filters Sidebar */}
          <aside className="filters">
            <div className="filters__header">
              <SlidersHorizontal size={18} color="var(--primary)"/>
              <h3>Filters</h3>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <input type="range" min="0" max="50000" value={priceRange[1]}
                onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                className="range-input" />
              <div className="filter-group__range-labels">
                <span>₹0</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {type === 'flights' && (
              <div className="filter-group">
                <h4>Airlines</h4>
                {['IndiGo', 'Air India', 'Vistara', 'SpiceJet'].map(a => (
                  <label key={a} className="filter-check">
                    <input type="checkbox" defaultChecked /> {a}
                  </label>
                ))}
              </div>
            )}

            {type === 'hotels' && (
              <div className="filter-group">
                <h4>Star Rating</h4>
                {[5,4,3,2,1].map(s => (
                  <label key={s} className="filter-check">
                    <input type="checkbox" defaultChecked={s >= 4} />
                    {'⭐'.repeat(s)} ({s} Star)
                  </label>
                ))}
              </div>
            )}

            <div className="filter-group">
              <h4>Departure Time</h4>
              {['Early Morning (0-6)', 'Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)'].map(t => (
                <label key={t} className="filter-check">
                  <input type="checkbox" defaultChecked /> {t}
                </label>
              ))}
            </div>
          </aside>

          {/* Results */}
          <div className="results">
            <div className="results__header">
              <p className="results__count">{results.length} {type} found</p>
              <div className="results__sort">
                <ArrowUpDown size={14}/>
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
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <h3>Oops! Something went wrong</h3>
                  <p>{error}</p>
                  <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Retry Search</button>
                </div>
              ) : results.length === 0 ? (
                <div className="search-empty text-center py-20">
                  <Bus size={64} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-xl font-bold text-slate-400">No buses found for this route</h3>
                  <p className="text-slate-400">Try changing your dates or origin/destination.</p>
                </div>
              ) : (
                results.map(item => (
                  <ResultCard key={item.id} item={item} type={type} navigate={navigate} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function ResultCard({ item, type, navigate }) {
  if (type === 'flights') return (
    <div className="result-card" onClick={() => navigate(`/detail/${item.id}?type=flight`)}>
      <div className="result-card__main">
        <div className="flight-airline">
          <div className="airline-logo">{item.airline[0]}</div>
          <div>
            <div className="flight-name">{item.airline}</div>
            <div className="flight-code">{item.code}</div>
          </div>
        </div>
        <div className="flight-times">
          <div className="flight-time">
            <span className="time-value">{item.depart}</span>
            <span className="time-city">{item.from.split('(')[0]}</span>
          </div>
          <div className="flight-duration">
            <div className="duration-line"><div/><span>✈</span><div/></div>
            <span>{item.duration} · {item.stops}</span>
          </div>
          <div className="flight-time">
            <span className="time-value">{item.arrive}</span>
            <span className="time-city">{item.to.split('(')[0]}</span>
          </div>
        </div>
        <div className="result-card__rating">
          <Star size={14} fill="#F59E0B" color="#F59E0B"/>
          <span>{item.rating}</span>
        </div>
      </div>
      <div className="result-card__aside">
        <div className="result-card__price">₹{item.price.toLocaleString()}</div>
        <div className="result-card__seats">{item.seats} seats left</div>
        <button className="btn btn-primary" style={{padding:'10px 20px',fontSize:14}} onClick={e => { e.stopPropagation(); navigate(`/booking/${item.id}?type=flight`) }}>
          Book Now
        </button>
      </div>
    </div>
  )

  if (type === 'hotels') return (
    <div className="result-card result-card--hotel" onClick={() => navigate(`/detail/${item.id}?type=hotel`)}>
      <img src={item.image} alt={item.name} className="hotel-img" />
      <div className="result-card__main">
        <div>
          <div className="hotel-stars">{'⭐'.repeat(item.stars)}</div>
          <h3 className="hotel-name">{item.name}</h3>
          <p className="hotel-loc">📍 {item.location}</p>
          <div className="hotel-amenities">
            {item.amenities.map(a => <span key={a} className="amenity-tag">{a}</span>)}
          </div>
        </div>
        <div className="hotel-reviews">
          <Star size={14} fill="#F59E0B" color="#F59E0B"/>
          <span>{item.rating}</span>
          <span className="review-count">({item.reviews} reviews)</span>
        </div>
      </div>
      <div className="result-card__aside">
        <div className="result-card__price">₹{item.price.toLocaleString()}</div>
        <div className="result-card__seats">per night</div>
        <button className="btn btn-primary" style={{padding:'10px 20px',fontSize:14}} onClick={e => { e.stopPropagation(); navigate(`/booking/${item.id}?type=hotel`) }}>
          Book Now
        </button>
      </div>
    </div>
  )

  if (type === 'trains') return (
    <div className="result-card" onClick={() => navigate(`/detail/${item.id}?type=train`)}>
      <div className="result-card__main">
        <div>
          <h3 className="train-name">{item.name}</h3>
          <span className="train-number">#{item.number}</span>
        </div>
        <div className="flight-times">
          <div className="flight-time">
            <span className="time-value">{item.depart}</span>
            <span className="time-city">{item.from}</span>
          </div>
          <div className="flight-duration">
            <div className="duration-line"><div/><span>🚆</span><div/></div>
            <span>{item.duration}</span>
          </div>
          <div className="flight-time">
            <span className="time-value">{item.arrive}</span>
            <span className="time-city">{item.to}</span>
          </div>
        </div>
        <span className="badge badge-green">{item.class}</span>
      </div>
      <div className="result-card__aside">
        <div className="result-card__price">₹{item.price.toLocaleString()}</div>
        <div className="result-card__seats">{item.seats} seats</div>
        <button className="btn btn-primary" style={{padding:'10px 20px',fontSize:14}} onClick={e => { e.stopPropagation(); navigate(`/booking/${item.id}?type=train`) }}>
          Book Now
        </button>
      </div>
    </div>
  )

  return (
    <div className="bus-card" onClick={() => navigate(`/detail/${item.id}?type=bus`)}>
      {/* Brand Header */}
      <div className="bus-card__header">
        <div className="badge-primo">
          Primo <span>★</span>
        </div>
        <div className="badge-discount">
          {Math.random() > 0.5 ? 'Last min. 7.5% OFF' : 'Try new 5.0% OFF'}
        </div>
      </div>

      <div className="bus-card__body">
        {/* Identity & Route */}
        <div className="bus-card__id-row">
          <span className="reg-tag">
            {item.regNo || `MH${Math.floor(10 + Math.random() * 89)}C${Math.floor(1000 + Math.random() * 8999)}`}
          </span>
          <span className="status-badge">STARTING</span>
          <span className="route-stops">
            From: {item.from} → {item.to} • {Math.floor(5 + Math.random() * 15)} Other Stops
          </span>
        </div>

        {/* Times & Price */}
        <div className="bus-card__times">
          <div className="bus-time-group">
            <div className="bus-time-val">{item.depart} — {item.arrive}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span className="bus-duration-val">{item.duration}</span>
              <span className="bus-seats-val">{item.seats} Seats</span>
            </div>
          </div>

          <div className="bus-card__price-col">
            <div className="bus-price-row">
              <span className="bus-original-price">₹{Math.floor(item.price * 1.1)}</span>
              <span className="bus-final-price">₹{item.price.toLocaleString()}</span>
            </div>
            <span className="onwards">Onwards</span>
          </div>
        </div>
      </div>

      {/* Operator Footer */}
      <div className="bus-card__footer">
        <div className="operator-info">
          <div className="operator-name">
            {item.operator} 
            <span style={{ color: '#9ca3af' }}><MapPin size={14} /></span>
          </div>
          <div className="bus-type-desc">{item.type} (2+1)</div>
        </div>

        <div className="rating-badge">
          <div className="rating-val">
            <Star size={12} fill="#fff" /> {item.rating}
          </div>
          <span className="rating-count">{Math.floor(50 + Math.random() * 200)}</span>
        </div>
      </div>
    </div>
  )
}
