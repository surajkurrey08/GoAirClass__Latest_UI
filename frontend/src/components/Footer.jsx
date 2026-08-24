import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">

      {/* TOP */}
      <div className="footer__top container">

        {/* BRAND */}
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo_new2.png" alt="GoAirClass Logo" className="footer__logo-img" />
          </div>

          <p>
            Your trusted travel partner for flights, hotels and holiday
            packages worldwide.
          </p>

          <div className="footer__social">
            <a href="#" className="social-btn"><Facebook size={18}/></a>
            <a href="#" className="social-btn"><Twitter size={18}/></a>
            <a href="#" className="social-btn"><Instagram size={18}/></a>
            <a href="#" className="social-btn"><Youtube size={18}/></a>
          </div>
        </div>

        {/* SERVICES */}
        <div className="footer__col">
          <h4>Services</h4>
          <Link to="/flights">Flights</Link>
          <Link to="/hotels">Hotels</Link>
          <Link to="/">Holidays</Link>
          <Link to="/profile">Manage Booking</Link>
          <Link to="/inquiry">Travel Insurance</Link>
        </div>

        {/* COMPANY */}
        <div className="footer__col">
          <h4>Company</h4>
          <Link to="/inquiry">About Us</Link>
          <Link to="/inquiry">Careers</Link>
          <Link to="/inquiry">Press</Link>
          <Link to="/inquiry">Blog</Link>
          <Link to="/inquiry">Contact Us</Link>
        </div>

        {/* SUPPORT */}
        <div className="footer__col">
          <h4>Support</h4>
          <Link to="/inquiry">Help Center</Link>
          <Link to="/inquiry">FAQs</Link>
          <Link to="/inquiry">Cancellation Policy</Link>
          <Link to="/inquiry">Refund Policy</Link>
          <Link to="/inquiry">Terms & Conditions</Link>
        </div>

        {/* CONTACT */}
        <div className="footer__col">
          <h4>Contact Us</h4>

          <div className="footer__contact">
            <Phone size={15}/> +91 98765 43210
          </div>

          <div className="footer__contact">
            <Mail size={15}/> support@goairclass.com
          </div>

          <div className="footer__contact">
            <MapPin size={15}/> Raipur, Chattisgarh, India
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer__bottom container">
        <p>&copy; 2024 GoAirClass. All Rights Reserved.</p>

        <div className="footer__payments">
          <span>We accept:</span>
          {['VISA', 'Mastercard', 'RuPay', 'UPI'].map(p => (
            <span key={p} className="payment-tag">{p}</span>
          ))}
        </div>
      </div>

    </footer>
  )
}
