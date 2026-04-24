import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download, Share2, Home, Calendar, MapPin, User, Ticket } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Success.css'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  
  const { booking = {} } = location.state || {}
  const bookingRef = booking.pnrNumber || 'GO' + Math.random().toString(36).substr(2, 8).toUpperCase()

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
                <div className="ticket-label">PNR Number</div>
                <div className="ticket-ref">{bookingRef}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="ticket-status">
                  <CheckCircle size={14} color="var(--accent-green)" />
                  Confirmed
                </div>
                {booking.couponCode && (
                  <div className="ticket-coupon">
                    <Ticket size={12} />
                    {booking.couponCode}
                  </div>
                )}
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
                  <div className="td-label">Route / Points</div>
                  <div className="td-value text-xs">
                    {booking.boardingPoint || 'N/A'} → {booking.droppingPoint || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="ticket-detail">
                <Calendar size={15} color="var(--primary)" />
                <div>
                  <div className="td-label">Travel Date</div>
                  <div className="td-value">
                    {booking.travelDate || 'Selected Date'}
                  </div>
                </div>
              </div>
              <div className="ticket-detail">
                <User size={15} color="var(--primary)" />
                <div>
                  <div className="td-label">Passengers / Seats</div>
                  <div className="td-value">
                    {booking.passengers?.length || 1} Traveler(s) ({booking.seatNumbers?.join(', ') || 'N/A'})
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="success-info">
            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <strong>Confirmation Sent</strong>
                <p>Check {booking.passengerEmail || 'your email'} for details</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🎟️</span>
              <div>
                <strong>E-Ticket Ready</strong>
                <p>You can download your ticket now or from your profile</p>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Download size={16} /> Print Ticket
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
