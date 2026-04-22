import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Download, Share2, Home, Calendar, MapPin, User } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Success.css'

export default function Success() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const bookingRef = 'TE' + Math.random().toString(36).substr(2, 8).toUpperCase()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="success-page">
      <Navbar />
      <div style={{ paddingTop: 68, minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={`success-container ${visible ? 'visible' : ''}`}>

          {/* Confetti effect */}
          <div className="confetti-wrap" aria-hidden>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="confetti-dot" style={{
                left: `${Math.random() * 100}%`,
                background: ['#2563EB','#3B82F6','#F59E0B','#10B981','#EC4899','#8B5CF6'][i % 6],
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1.5 + Math.random()}s`
              }} />
            ))}
          </div>

          <div className="success-icon">
            <CheckCircle size={56} color="#10B981" strokeWidth={2} />
          </div>

          <h1>Booking Confirmed! 🎉</h1>
          <p className="success-sub">Your trip is all set. Have a wonderful journey!</p>

          <div className="booking-ticket">
            <div className="ticket-header">
              <div>
                <div className="ticket-label">Booking Reference</div>
                <div className="ticket-ref">{bookingRef}</div>
              </div>
              <div className="ticket-status">
                <CheckCircle size={16} color="var(--accent-green)" />
                Confirmed
              </div>
            </div>

            <div className="ticket-divider">
              <div className="ticket-notch left" />
              <div className="ticket-dashes" />
              <div className="ticket-notch right" />
            </div>

            <div className="ticket-details">
              <div className="ticket-detail">
                <MapPin size={15} color="var(--primary)" />
                <div>
                  <div className="td-label">Route</div>
                  <div className="td-value">Mumbai → Delhi</div>
                </div>
              </div>
              <div className="ticket-detail">
                <Calendar size={15} color="var(--primary)" />
                <div>
                  <div className="td-label">Date</div>
                  <div className="td-value">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="ticket-detail">
                <User size={15} color="var(--primary)" />
                <div>
                  <div className="td-label">Passengers</div>
                  <div className="td-value">1 Adult</div>
                </div>
              </div>
            </div>
          </div>

          <div className="success-info">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <strong>Confirmation Email Sent</strong>
                <p>Check your inbox for e-ticket and booking details</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <strong>SMS Confirmation</strong>
                <p>Booking details sent to your registered mobile number</p>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-outline" onClick={() => {}}>
              <Download size={16} /> Download Ticket
            </button>
            <button className="btn btn-outline" onClick={() => {}}>
              <Share2 size={16} /> Share
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <Home size={16} /> Back to Home
            </button>
          </div>

          <div className="success-explore">
            <p>Planning more trips?</p>
            <button className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => navigate('/search')}>
              Explore More Destinations →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
