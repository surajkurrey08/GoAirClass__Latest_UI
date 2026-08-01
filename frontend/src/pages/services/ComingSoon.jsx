// src/pages/services/ComingSoon.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { getHeroImages } from '../../services/heroImageService'

const CONFIG = {
  hotels: {
    title: 'Hotels', color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    heroType: 'hotel',
    desc: 'Luxury stays at unbeatable prices',
    fallbackBg: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #0a1628 100%)',
  },
  trains: {
    title: 'Trains', color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #0d9488)',
    heroType: 'train',
    desc: 'Fast & comfortable train journeys across India',
    fallbackBg: 'linear-gradient(135deg, #022c1a 0%, #065f46 50%, #0a1628 100%)',
  },
  buses: {
    title: 'Buses', color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    heroType: 'bus',
    desc: 'Comfortable bus travel to 1000+ destinations',
    fallbackBg: 'linear-gradient(135deg, #1c0a00 0%, #78350f 50%, #0a1628 100%)',
  },
  flights: {
    title: 'Flights', color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    heroType: 'flight',
    desc: 'Fly to your dream destination with premium airlines',
    fallbackBg: 'linear-gradient(135deg, #091e3a 0%, #2f80ed 50%, #0a1628 100%)',
  },
}

export default function ComingSoon({ type }) {
  const navigate = useNavigate()
  const cfg = CONFIG[type] || CONFIG.hotels
  const [bgImage, setBgImage] = useState(null)

  useEffect(() => {
    getHeroImages(cfg.heroType).then(imgs => {
      if (imgs?.length > 0) setBgImage(imgs[0].url)
    }).catch(() => {})
  }, [type])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Full Screen Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 66px)' }}>

        {/* Background */}
        {bgImage ? (
          <>
            <img
              src={bgImage}
              alt={cfg.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,10,25,0.55) 0%, rgba(5,10,25,0.75) 50%, rgba(5,10,25,0.90) 100%)' }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: cfg.fallbackBg }} />
        )}

        {/* Scrollable content on top of bg */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 'calc(100vh - 66px)',
          padding: '80px 24px 60px',
          boxSizing: 'border-box',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 620, width: '100%' }}>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(30,30,30,0.75)', backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#fff', padding: '12px 28px', borderRadius: 99,
              fontSize: 16, fontWeight: 700, marginBottom: 32,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              🚀 Coming Soon
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900,
              color: '#fff', margin: '0 0 20px', lineHeight: 1.15,
              textShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}>
              {cfg.title} Booking
              <br />
              <span style={{ background: cfg.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Launching Soon!
              </span>
            </h1>

            {/* Description */}
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.80)', marginBottom: 40, lineHeight: 1.8, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {cfg.desc}.<br />
              We're working hard to bring you the best {cfg.title.toLowerCase()} booking experience. Stay tuned!
            </p>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, height: 8, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '65%', borderRadius: 99, background: cfg.gradient, animation: 'cs-progress 2s ease-in-out infinite alternate' }} />
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 40 }}>
              Development in progress — 65% complete
            </p>

            {/* Feature tags */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
              {['Best Prices', 'Instant Booking', 'Easy Cancellation', '24/7 Support'].map(f => (
                <span key={f} style={{
                  padding: '8px 18px',
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 99, border: '1px solid rgba(255,255,255,0.22)',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                }}>
                  ✓ {f}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              {type !== 'flights' ? (
                <button
                  onClick={() => navigate('/flights')}
                  style={{
                    padding: '14px 32px', borderRadius: 99, border: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(37,99,235,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.4)' }}
                >
                  ✈️ Book Flights Instead
                </button>
              ) : (
                <button
                  onClick={() => navigate('/hotels')}
                  style={{
                    padding: '14px 32px', borderRadius: 99, border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(124,58,237,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.4)' }}
                >
                  🏨 Book Hotels Instead
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '14px 32px', borderRadius: 99,
                  border: '2px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              >
                ← Back to Home
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes cs-progress {
          from { width: 58%; }
          to   { width: 72%; }
        }
      `}</style>

      <Footer />
    </div>
  )
}