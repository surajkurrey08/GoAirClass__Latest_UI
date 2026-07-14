import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import logo from "../assets/logo_new.jpg"
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">

      {/* TOP */}
      <div className="footer__top container">

        {/* BRAND */}
        <div className="footer__brand">
          <div className="footer__logo">
            <img src={logo} alt="GoAirClass Logo" className="footer__logo-img" />
          </div>

          <p>
            Your trusted travel partner for flights, hotels, trains and buses.
            Making every journey memorable.
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
          <Link to="/search?type=flights">Flight Booking</Link>
          <Link to="/search?type=hotels">Hotel Booking</Link>
          <Link to="/search?type=trains">Train Tickets</Link>
          <Link to="/search?type=buses">Bus Tickets</Link>
          <a href="#">Holiday Packages</a>
          <a href="#">Visa Assistance</a>
        </div>

        {/* COMPANY */}
        <div className="footer__col">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Press & Media</a>
          <a href="#">Partner Program</a>
          <a href="#">Investor Relations</a>
          <a href="#">Blog</a>
        </div>

        {/* SUPPORT */}
        <div className="footer__col">
          <h4>Support</h4>
          <Link to="/inquiry">Contact / Inquiry</Link>
          <a href="#">Help Center</a>
          <a href="#">Cancellation Policy</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Refund Policy</a>
        </div>

        {/* CONTACT */}
        <div className="footer__col">
          <h4>Contact Us</h4>

          <div className="footer__contact">
            <Mail size={15}/> worknai009@gmail.com
          </div>

          <div className="footer__contact">
            <Phone size={15}/> +91 12345 67890
          </div>

          <div className="footer__contact">
            <MapPin size={15}/> Pune, India
          </div>

          <div className="footer__app">
            <p>Download App</p>
            <div className="app__buttons">
              <a href="#" className="app-btn">🍎 App Store</a>
              <a href="#" className="app-btn">▶ Play Store</a>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer__bottom container">
        <p>© 2026 GoAirClass. All rights reserved. Made with ❤️ in India</p>

        <div className="footer__payments">
          <span>We accept:</span>
          {['VISA', 'MC', 'UPI', 'PayTm', 'GPay'].map(p => (
            <span key={p} className="payment-tag">{p}</span>
          ))}
        </div>
      </div>

    </footer>
  )
}