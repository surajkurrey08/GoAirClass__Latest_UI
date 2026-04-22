import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star, Shield, Zap, Phone, Globe, Tag, CheckCircle, Play, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import SearchForm from '../components/SearchForm'
import Footer from '../components/Footer'
import { destinations, popularRoutes, offers, features, testimonials } from '../data/mockData'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const observerRef = useRef(null)

  useEffect(() => {
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

      {/* HERO */}
      <section className="hero">
        <div className="hero__bg">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90" alt="hero" className="hero__img" />
          <div className="hero__overlay" />
        </div>

        <div className="hero__content container animate-fadeInUp">
          <div className="hero__badge animate-fadeInUp animate-delay-1">
            <span>🌟</span> Trusted by 8M+ Travelers
          </div>
          <h1 className="hero__title animate-fadeInUp animate-delay-2">
            Online Booking.<br />
            <span className="hero__title-accent">Save Time & Money!</span>
          </h1>
          <p className="hero__subtitle animate-fadeInUp animate-delay-3">
            Flights, Hotels, Trains & Buses — all in one place.
          </p>

          <div className="hero__search animate-fadeInUp animate-delay-4">
            <SearchForm variant="hero" />
          </div>
        </div>

        <div className="hero__stats animate-fadeInUp animate-delay-4">
          <div className="container">
            <div className="hero__stats-inner">
              {[
                { icon: '⭐', value: '4.8/5', label: '1575 Reviews' },
                { icon: '🎁', value: 'Free', label: 'Complementary Perks' },
                { icon: '👥', value: '8M+', label: 'Travelers' },
                { icon: '🕐', value: '24×7', label: 'Support' },
              ].map((s, i) => (
                <div key={i} className="hero__stat">
                  <span className="hero__stat-icon">{s.icon}</span>
                  <div>
                    <div className="hero__stat-value">{s.value}</div>
                    <div className="hero__stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR ROUTES */}
      <section className="section" id="routes">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">🔥 Trending Now</div>
            <h2>Popular Routes</h2>
            <p>Most searched travel routes with best prices</p>
          </div>
          <div className="routes-grid reveal">
            {popularRoutes.map((r, i) => (
              <button key={i} className="route-chip" onClick={() => navigate(`/search?type=${r.type}&from=${r.from}&to=${r.to}`)}>
                <span className="route-chip__icon">{r.icon}</span>
                <div className="route-chip__info">
                  <span className="route-chip__route">{r.from} → {r.to}</span>
                  <span className="route-chip__meta">{r.duration}</span>
                </div>
                <div className="route-chip__right">
                  <span className="route-chip__price">₹{r.price.toLocaleString()}</span>
                  <span className={`badge badge-${r.type === 'flight' ? 'blue' : r.type === 'train' ? 'green' : 'orange'}`}>{r.type}</span>
                </div>
                <ChevronRight size={16} className="route-chip__arrow" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED OFFERS */}
      <section className="section section--gray" id="offers">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">💸 Best Deals</div>
            <h2>Featured Offers</h2>
            <p>Get the best offers & discounts on your bookings</p>
          </div>
          <div className="offers-grid reveal">
            {offers.map((offer) => (
              <div key={offer.id} className={`offer-card ${offer.isLight ? 'offer-card--light' : ''}`}
                style={{ background: offer.isLight ? '#fff' : offer.color }}>
                {offer.image && <img src={offer.image} alt={offer.title} className="offer-card__bg" />}
                {!offer.isLight && <div className="offer-card__overlay" />}
                <div className="offer-card__content">
                  <span className="offer-card__badge">{offer.badge}</span>
                  <h3>{offer.title}</h3>
                  <p>{offer.subtitle}</p>
                  <div className="offer-card__discount">{offer.discount}</div>
                  <button className="offer-card__cta">
                    {offer.tag} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="section" id="destinations">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">🌍 Explore More</div>
            <h2>Top Destinations</h2>
            <p>Discover the world's most beautiful places and start planning your dream trip</p>
          </div>
          <div className="destinations-grid reveal">
            {destinations.map((dest) => (
              <div key={dest.id} className="dest-card" onClick={() => navigate(`/search?type=hotels&to=${dest.name}`)}>
                <div className="dest-card__img-wrap">
                  <img src={dest.image} alt={dest.name} className="dest-card__img" />
                  <div className="dest-card__overlay" />
                </div>
                <div className="dest-card__content">
                  <div className="dest-card__flag">{dest.flag}</div>
                  <h3>{dest.name}</h3>
                  <p>{dest.country}</p>
                  <div className="dest-card__meta">
                    <span>{dest.destinations} Destinations</span>
                    <span>{dest.hotels} Hotels</span>
                  </div>
                  <div className="dest-card__footer">
                    <span className="dest-card__price">from ₹{dest.price.toLocaleString()}</span>
                    <button className="dest-card__btn">Explore <ChevronRight size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
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

      {/* VIDEO SECTION */}
      <section className="video-section reveal">
        <div className="container">
          <div className="video-section__inner">
            <div className="video-section__text">
              <div className="tag">📽 Our Story</div>
              <h2>Your Story Begins the Moment You Decide to Travel</h2>
              <p>At GoAirClass, we craft personalized trips that go beyond the ordinary — so you can focus on what truly matters: the experience.</p>
              <ul className="video-section__list">
                {['Handpicked destinations worldwide', 'Best price guarantee', 'Dedicated travel support', 'Seamless booking experience'].map((item, i) => (
                  <li key={i}><CheckCircle size={16} color="var(--accent-green)"/>{item}</li>
                ))}
              </ul>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>
                Start Exploring <ArrowRight size={16}/>
              </button>
            </div>
            <div className="video-section__media">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=80" alt="travel" />
              <button className="play-btn animate-float">
                <Play size={24} fill="#fff" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header reveal">
            <div className="tag">💬 Reviews</div>
            <h2>Trusted by Travelers Worldwide</h2>
            <p>Join thousands of satisfied travelers who book with us every day</p>
          </div>
          <div className="testimonials-grid reveal">
            {testimonials.map((t, i) => (
              <div key={t.id} className={`testimonial-card ${i === 1 ? 'testimonial-card--featured' : ''}`}>
                <img src={t.avatar} alt={t.name} className="testimonial-card__avatar" />
                <div className="testimonial-card__stars">
                  {Array.from({length: t.rating}).map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B"/>)}
                </div>
                <h4>{t.name}</h4>
                <p className="testimonial-card__role">{t.role}</p>
                <p className="testimonial-card__review">"{t.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal">
        <div className="container">
          <div className="cta-section__inner">
            <div className="cta-section__bg" />
            <div className="cta-section__content">
              <h2>Ready for Your Next Adventure?</h2>
              <p>Join 8 million+ travelers and book your dream trip today. Get exclusive deals and offers!</p>
              <div className="cta-section__actions">
                <button className="btn btn-white" onClick={() => navigate('/search')}>
                  Book Now <ArrowRight size={16}/>
                </button>
                <button className="btn btn-outline" style={{borderColor:'rgba(255,255,255,0.5)',color:'#fff'}}>
                  <Phone size={16}/> Talk to an Expert
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
