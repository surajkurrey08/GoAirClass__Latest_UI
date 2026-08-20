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
          <Link to="/search?type=flights">Flights</Link>
          <Link to="/search?type=hotels">Hotels</Link>
          <a href="#offers">Holidays</a>
          <a href="#">Manage Booking</a>
          <a href="#">Travel Insurance</a>
        </div>

        {/* COMPANY */}
        <div className="footer__col">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Blog</a>
          <Link to="/inquiry">Contact Us</Link>
        </div>

        {/* SUPPORT */}
        <div className="footer__col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">FAQs</a>
          <a href="#">Cancellation Policy</a>
          <a href="#">Refund Policy</a>
          <a href="#">Terms & Conditions</a>
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
