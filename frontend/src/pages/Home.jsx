// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star, Phone, CheckCircle, Play, ChevronRight, Plane, TrainFront, Bus as BusIcon, Globe, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import HeroSlider from '../components/HeroSlider'
import OfferSlider from '../components/OfferSlider'
import Footer from '../components/Footer'
import { destinations, offers, features, testimonials } from '../data/mockData'
import { fetchPopularRoutes } from '../services/busService'
import { fetchPublicCoupons } from '../services/couponService'
import { fetchPublicDestinations } from '../services/destinationService.js'
import { fetchVideoContent } from '../services/videoContentService'
import { fetchPublicTestimonials } from '../services/reviewService'
import { searchFlightsPost, searchFlightsWithBudget } from '../services/flightApi'
import './Home.css'

const HERO_FEATURES = [
  { icon: '🛡️', title: 'Professional Drivers', desc: 'Refreshing rides, panoramic screen' },
  { icon: '📶', title: 'Anytime Connectivity', desc: '• WiFi  • Chargers' },
  { icon: '⭐', title: 'Exclusive Service', desc: '• Sommelier perks  • Extra' },
]

export default function Home() {
  const navigate = useNavigate()
  const observerRef = useRef(null)

  // Search state
  const [from, setFrom] = useState('')
  const [destination, setDestination] = useState('')
  const [budget, setBudget] = useState('')
  const [travelDate, setTravelDate] = useState('')

  // Dynamic data state
  const [popularRoutes, setPopularRoutes] = useState([])
  const [activeCoupons, setActiveCoupons] = useState([])
  const [activeDestinations, setActiveDestinations] = useState([])
  const [activeReviews, setActiveReviews] = useState([])
  const [videoContent, setVideoContent] = useState({
    title: 'Your Story Begins the Moment You Decide to Travel',
    subtitle: 'At GoAirClass, we craft personalized trips that go beyond the ordinary — so you can focus on what truly matters: the experience.',
    points: ['Handpicked destinations worldwide', 'Best price guarantee', 'Dedicated travel support', 'Seamless booking experience'],
    buttonText: 'Start Exploring',
    videoUrl: ''
  })

  // Validation
  const isValid = from.trim() !== '' && destination.trim() !== '' && travelDate !== ''

  const handleSearch = async () => {
    if (!from.trim()) { toast.error('Please enter departure city'); return }
    if (!destination.trim()) { toast.error('Please enter destination city'); return }
    if (!travelDate) { toast.error('Please select travel date'); return }

    try {
      const payload = {
        from: from.trim(),
        to: destination.trim(),
        date: travelDate,
        budget: budget ? Number(budget) : undefined
      }

      let response;
      if (budget) {
        response = await searchFlightsWithBudget(payload);
      } else {
        response = await searchFlightsPost(payload);
      }

      if (response.success) {
        navigate('/flights', {
          state: {
            from: from.trim(),
            to: destination.trim(),
            date: travelDate,
            budget: budget ? Number(budget) : undefined,
            flights: response.flights
          }
        });
      } else {
        toast.error(response.message || 'Search failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Search failed. Please try again.');
    }
  }

  const getRouteIcon = (type) => {
    switch (type) {
      case 'flight': return <Plane size={24} className="text-blue-500" />
      case 'train': return <TrainFront size={24} className="text-emerald-500" />
      case 'bus': return <BusIcon size={24} className="text-amber-500" />
      default: return <Globe size={24} className="text-slate-500" />
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [routes, coupons, dests, vContent, reviews] = await Promise.all([
          fetchPopularRoutes(),
          fetchPublicCoupons(),
          fetchPublicDestinations(),
          fetchVideoContent(),
          fetchPublicTestimonials()
        ])
        setPopularRoutes(routes || [])
        setActiveCoupons(coupons || [])
        setActiveDestinations(dests || [])
        setActiveReviews(reviews || [])
        if (vContent) setVideoContent(vContent)
      } catch (error) {
        console.error('Home Load Error:', error)
      }
    }
    loadData()

    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className="home">
      <Navbar />

      {/* ══════ HERO ══════ */}
      <section className="gac-hero">
        <HeroSlider>
          <div className="gac-hero__search-panel">
            <div className="gac-search-row">

              <div className="gac-search-field">
                <label>From *</label>
                <input
                  type="text"
                  placeholder="Departure city"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && isValid && handleSearch()}
                />
              </div>

              <div className="gac-search-divider" />

              <div className="gac-search-field">
                <label>Destination *</label>
                <input
                  type="text"
                  placeholder="Where do you want to go?"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && isValid && handleSearch()}
                />
              </div>

              <div className="gac-search-divider" />

              <div className="gac-search-field">
                <label>Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000 (optional)"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  min="0"
                />
              </div>

              <div className="gac-search-divider" />

              <div className="gac-search-field">
                <label>Travel Date *</label>
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setTravelDate(e.target.value)}
                />
              </div>

              <div className="gac-search-divider" />

              <button
                className="gac-search-btn"
                onClick={handleSearch}
                disabled={!isValid}
                style={{
                  opacity: isValid ? 1 : 0.5,
                  cursor: isValid ? 'pointer' : 'not-allowed',
                }}
              >
                Search
              </button>

            </div>
          </div>

          <div className="gac-hero__tagline">
            <h1>GoAirClass: आपकी यात्रा, आपकी पसंद.</h1>
          </div>
        </HeroSlider>

        <div className="gac-hero__features">
          {HERO_FEATURES.map((f, i) => (
            <div className="gac-hero__feat" key={i}>
              <span className="gac-hero__feat-icon">{f.icon}</span>
              <div>
                <div className="gac-hero__feat-title">{f.title}</div>
                <div className="gac-hero__feat-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ POPULAR ROUTES ══════ */}
      <section className="section" id="routes">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">🔥 Trending Now</div>
            <h2>Popular Routes</h2>
            <p>Most searched travel routes with best prices</p>
          </div>
          <div className="routes-grid reveal">
            {popularRoutes.map((r, i) => (
              <button
                key={i}
                className="route-chip"
                onClick={() => {
                  const searchType = r.type === 'flight' ? 'flights' : r.type === 'train' ? 'trains' : 'buses'
                  navigate(`/search?type=${searchType}&from=${r.fromCity || r.from}&to=${r.toCity || r.to}`)
                }}
              >
                <span className="route-chip__icon">{getRouteIcon(r.type)}</span>
                <div className="route-chip__info">
                  <span className="route-chip__route">{r.fromCity || r.from} → {r.toCity || r.to}</span>
                  <span className="route-chip__meta">{r.travelTime || r.duration}</span>
                </div>
                <div className="route-chip__right">
                  <span className="route-chip__price">₹{Number(r.price).toLocaleString()}</span>
                  <span className={`badge badge-${r.type === 'flight' ? 'blue' : r.type === 'train' ? 'green' : 'orange'}`}>{r.type}</span>
                </div>
                <ChevronRight size={16} className="route-chip__arrow" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURED OFFERS ══════ */}
      <section className="section section--gray" id="offers">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">💸 Best Deals</div>
            <h2>Featured Offers</h2>
            <p>Get the best offers & discounts on your bookings</p>
          </div>
          <div className="reveal">
            <OfferSlider offers={offers} activeCoupons={activeCoupons} />
          </div>
        </div>
      </section>

      {/* ══════ DESTINATIONS ══════ */}
      <section className="section" id="destinations">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">🌍 Explore More</div>
            <h2>Top Destinations</h2>
            <p>Discover the world's most beautiful places and start planning your dream trip</p>
          </div>
          <div className="destinations-grid reveal">
            {(activeDestinations.length > 0 ? activeDestinations : destinations).map((dest) => (
              <div key={dest._id || dest.id} className="dest-card"
                onClick={() => navigate(`/search?to=${dest.name}&budget=${dest.price || ''}`)}>
                <div className="dest-card__img-wrap">
                  <img src={dest.image} alt={dest.name} className="dest-card__img" />
                  <div className="dest-card__overlay" />
                </div>
                <div className="dest-card__content">
                  <div className="dest-card__flag">{dest.flag || '📍'}</div>
                  <h3>{dest.name}</h3>
                  <p>{dest.country}</p>
                  <div className="dest-card__meta">
                    <span>{dest.destinations} Destinations</span>
                    <span>{dest.hotels} Hotels</span>
                  </div>
                  <div className="dest-card__footer">
                    <span className="dest-card__price">from ₹{Number(dest.price).toLocaleString()}</span>
                    <button className="dest-card__btn">Explore <ChevronRight size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WHY CHOOSE US ══════ */}
      <section className="section section--gray" id="about">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">✨ Why GoAirClass</div>
            <h2>Everything You Need for a Perfect Trip</h2>
            <p>We provide end-to-end travel solutions with the best features in the industry</p>
          </div>
          <div className="features-grid reveal">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ VIDEO ══════ */}
      <section className="video-section reveal">
        <div className="container">
          <div className="video-section__inner">
            <div className="video-section__text">
              <div className="tag">📽 Our Story</div>
              <h2>{videoContent.title}</h2>
              <p>{videoContent.subtitle}</p>
              <ul className="video-section__list">
                {videoContent.points.map((item, i) => (
                  <li key={i}><CheckCircle size={16} color="#10b981" />{item}</li>
                ))}
              </ul>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>
                {videoContent.buttonText} <ArrowRight size={16} />
              </button>
            </div>
            <div className="video-section__media">
              {videoContent.videoUrl ? (
                <video src={videoContent.videoUrl} autoPlay loop muted playsInline className="video-section__video" />
              ) : (
                <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=80" alt="travel" />
              )}
              <button className="play-btn"><Play size={24} fill="#fff" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="section testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">💬 Reviews</div>
            <h2>Trusted by Travelers Worldwide</h2>
            <p>Join thousands of satisfied travelers who book with us every day</p>
          </div>
          <div className="testimonials-grid reveal">
            {(activeReviews.length > 0 ? activeReviews : testimonials).map((t, i) => (
              <div key={t._id || t.id} className={`testimonial-card ${i === 1 ? 'testimonial-card--featured' : ''}`}>
                <img src={t.image || t.avatar} alt={t.name} className="testimonial-card__avatar" />
                <div className="testimonial-card__stars">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <h4>{t.name}</h4>
                <p className="testimonial-card__role">{t.role}</p>
                <p className="testimonial-card__review">"{t.reviewText || t.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="cta-section reveal">
        <div className="container">
          <div className="cta-section__inner">
            <div className="cta-section__bg" />
            <div className="cta-section__content">
              <h2>Ready for Your Next Adventure?</h2>
              <p>Join 8 million+ travelers and book your dream trip today.</p>
              <div className="cta-section__actions">
                <button className="btn btn-white" onClick={() => navigate('/search')}>
                  Book Now <ArrowRight size={16} />
                </button>
                <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
                  <Phone size={16} /> Talk to an Expert
                </button>
              </div>
              <p className="cta-section__note">✓ No booking fees &nbsp;&nbsp; ✓ Free cancellation &nbsp;&nbsp; ✓ Best price guarantee</p>
            </div>
            <div className="cta-section__img">
              <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500&q=80" alt="travel" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}