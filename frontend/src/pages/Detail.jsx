import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Star, MapPin, Wifi, Coffee, Car, Shield, Clock, Users, ArrowLeft, Heart, Share2, Loader2, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchTripById } from '../services/auth'
import './Detail.css'

const detailData = {
  flight: {
    title: 'IndiGo 6E-204',
    subtitle: 'Mumbai (BOM) → Delhi (DEL)',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
    rating: 4.5, reviews: 1200,
    price: 2499,
    highlights: ['Non-stop flight', '2h 10m duration', '25kg baggage allowed', 'In-flight meals available'],
    amenities: [{ icon: '🍽️', label: 'Meals' }, { icon: '💺', label: 'Reclining Seats' }, { icon: '🔌', label: 'USB Charging' }, { icon: '📺', label: 'Entertainment' }],
    description: 'Fly comfortably with IndiGo airlines from Mumbai to Delhi. Known for on-time performance and excellent service, this flight offers a seamless travel experience with modern aircraft and friendly cabin crew.',
  },
  hotel: {
    title: 'The Leela Palace',
    subtitle: 'New Delhi, India',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
    rating: 4.9, reviews: 2341,
    price: 8500,
    highlights: ['5-Star Luxury Hotel', 'Free Breakfast Included', 'Free Cancellation', 'Pool & Spa Access'],
    amenities: [{ icon: '🏊', label: 'Swimming Pool' }, { icon: '💪', label: 'Fitness Center' }, { icon: '🌿', label: 'Spa & Wellness' }, { icon: '🍴', label: 'Fine Dining' }, { icon: '📶', label: 'Free WiFi' }, { icon: '🅿️', label: 'Free Parking' }],
    description: 'The Leela Palace New Delhi is an iconic luxury hotel blending Mughal architecture with contemporary elegance. Located in Chanakyapuri, it offers world-class amenities, multiple dining outlets, and impeccable service.',
  },
  train: {
    title: 'Rajdhani Express',
    subtitle: 'Mumbai Central → New Delhi',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80',
    rating: 4.3, reviews: 890,
    price: 1450,
    highlights: ['AC 2-Tier Class', 'Meals Included', '15h 35m Journey', 'Confirmed Berths'],
    amenities: [{ icon: '🍽️', label: 'Meals Included' }, { icon: '❄️', label: 'Air Conditioned' }, { icon: '🛏️', label: 'Sleeping Berths' }, { icon: '🔒', label: 'Safe & Secure' }],
    description: 'Rajdhani Express is one of India\'s premier train services connecting major cities directly to the national capital. Experience comfortable air-conditioned travel with complimentary meals included.',
  }
}

export default function Detail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || 'flight'
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        if (type === 'bus') {
          const schedule = await fetchTripById(id)
          
          // Map schedule to UI data
          const mappedData = {
            title: schedule.bus?.busName || 'Premium Bus',
            subtitle: `${schedule.operator?.name || 'Bus Operator'} • ${schedule.route?.fromCity} → ${schedule.route?.toCity}`,
            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
            rating: schedule.operator?.rating || 4.4,
            reviews: Math.floor(Math.random() * 500) + 100,
            price: schedule.ticketPrice || 899,
            highlights: [
              schedule.bus?.busType || 'AC Sleeper',
              `Departure: ${schedule.departureTime}`,
              `Arrival: ${schedule.arrivalTime}`,
              'Verified Operator',
              'Instant Booking'
            ],
            amenities: (schedule.bus?.amenities || []).map(a => ({
              icon: a.toLowerCase().includes('wifi') ? '📶' : 
                    a.toLowerCase().includes('ac') ? '❄️' : 
                    a.toLowerCase().includes('charge') ? '🔌' : '🚌',
              label: a
            })),
            description: `${schedule.operator?.name} provides a reliable and comfortable travel service from ${schedule.route?.fromCity} to ${schedule.route?.toCity}. This ${schedule.bus?.busType} coach is equipped with modern features to ensure a smooth journey.`
          }
          setData(mappedData)
        } else {
          // Use static mock data
          setData(detailData[type] || detailData.flight)
        }
      } catch (err) {
        console.error("Detail Fetch Error:", err)
        setError("Failed to load details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, type])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Fetching details...</p>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
      <p className="text-slate-500 text-center max-w-sm mb-6">{error || "The link you followed may be broken or the page may have been removed."}</p>
      <button className="btn btn-primary px-8" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  )

  return (
    <div>
      <Navbar />
      <div style={{paddingTop: 68}}>
        <div className="detail-hero">
          <img src={data.image} alt={data.title} className="detail-hero__img" />
          <div className="detail-hero__overlay"/>
          <div className="container detail-hero__content">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={16}/> Back
            </button>
            <div className="detail-hero__info">
              <h1>{data.title}</h1>
              <p>{data.subtitle}</p>
              <div className="detail-hero__rating">
                <Star size={16} fill="#F59E0B" color="#F59E0B"/>
                <span>{data.rating}</span>
                <span className="rating-count">({data.reviews} reviews)</span>
              </div>
            </div>
            <div className="detail-hero__actions">
              <button className="icon-action"><Heart size={18}/></button>
              <button className="icon-action"><Share2 size={18}/></button>
            </div>
          </div>
        </div>

        <div className="container detail-body">
          <div className="detail-main">
            <section className="detail-section">
              <h2>About</h2>
              <p>{data.description}</p>
            </section>

            <section className="detail-section">
              <h2>Highlights</h2>
              <div className="highlights-grid">
                {data.highlights.map((h, i) => (
                  <div key={i} className="highlight-item">
                    <Shield size={16} color="var(--accent-green)"/> {h}
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2>Amenities</h2>
              <div className="amenities-grid">
                {data.amenities?.map((a, i) => (
                  <div key={i} className="amenity-item">
                    <span className="amenity-icon">{a.icon}</span>
                    <span>{a.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2>Reviews</h2>
              <div className="reviews-list">
                {[
                  { name: 'Raj Kumar', rating: 5, text: 'Excellent experience! Everything was perfect.', date: '2 weeks ago' },
                  { name: 'Priya Singh', rating: 4, text: 'Very comfortable and smooth journey. Would recommend.', date: '1 month ago' },
                ].map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-avatar">{r.name[0]}</div>
                    <div className="review-content">
                      <div className="review-header">
                        <strong>{r.name}</strong>
                        <span className="review-date">{r.date}</span>
                      </div>
                      <div className="review-stars">
                        {Array.from({length:r.rating}).map((_,j) => <Star key={j} size={12} fill="#F59E0B" color="#F59E0B"/>)}
                      </div>
                      <p>{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="detail-aside">
            <div className="booking-widget">
              <div className="booking-widget__price">
                <span className="price-main">₹{data.price.toLocaleString()}</span>
                <span className="price-label">{type === 'hotels' ? '/ night' : '/ person'}</span>
              </div>
              <div className="booking-widget__rating">
                <Star size={14} fill="#F59E0B" color="#F59E0B"/>
                <span>{data.rating} · {data.reviews} reviews</span>
              </div>
              <div className="booking-widget__fields">
                <div className="booking-field">
                  <label>Date</label>
                  <input type="date" className="booking-input" />
                </div>
                <div className="booking-field">
                  <label>Passengers</label>
                  <select className="booking-input">
                    <option>1 Adult</option>
                    <option>2 Adults</option>
                    <option>Family</option>
                  </select>
                </div>
              </div>
              <div className="booking-widget__total">
                <span>Total</span>
                <span className="total-price">₹{data.price.toLocaleString()}</span>
              </div>
              <button 
                className="btn btn-primary" 
                style={{width:'100%',padding:'14px',fontSize:16}} 
                onClick={() => type === 'bus' ? navigate(`/bus-selection/${id}`) : navigate(`/booking/${id}?type=${type}`)}
              >
                Book Now →
              </button>
              <p className="booking-note">✓ Free cancellation &nbsp; ✓ Instant confirmation</p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}
