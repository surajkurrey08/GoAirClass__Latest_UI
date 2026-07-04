import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, Bell, ChevronDown, Briefcase } from 'lucide-react'
import logo from "../assets/logo3.png"
import OperatorLoginModal from './OperatorLoginModal'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('scroll', handleScroll)
    checkAuth()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    navigate('/login')
  }

  const handleProfileClick = () => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (token) {
      if (role === 'bus_operator') navigate('/bus-operator/dashboard')
      else if (role === 'admin' || role === 'superadmin') window.location.href = 'https://admin.goairclass.com'
      else navigate('/profile')
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      <nav className={`gac-navbar ${scrolled ? 'gac-navbar--scrolled' : ''}`}>
        <div className="gac-navbar__inner">

          {/* LOGO */}
          <Link to="/" className="gac-navbar__logo">
            <img src={logo} alt="GoAirClass" className="gac-navbar__logo-img" />
          </Link>

          {/* LINKS */}
          <div className={`gac-navbar__links ${menuOpen ? 'open' : ''}`}>
            <Link
              to="/"
              className={`gac-navbar__link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Home
            </Link>

            <div className="gac-navbar__dropdown">
              <span className="gac-navbar__link">
                Services <ChevronDown size={13} />
              </span>
              <div className="gac-navbar__dropdown-menu">
                <div className="navbar__dropdown-menu">
                  <Link to="/flights" className="gac-dropdown-item">✈ Flights</Link>
                  <Link to="/hotels" className="gac-dropdown-item">🏨 Hotels</Link>
                  <Link to="/trains" className="gac-dropdown-item">🚆 Trains</Link>
                  <Link to="/buses" className="gac-dropdown-item">🚌 Buses</Link>
                </div>
              </div>
            </div>

            <a href="#destinations" className="gac-navbar__link">Destinations</a>
            <a href="#" className="gac-navbar__link premium-link">Premium Class</a>
            <a href="#offers" className="gac-navbar__link">Offers</a>
            <Link to="/inquiry" className="gac-navbar__link">Contact</Link>
          </div>

          {/* ACTIONS */}
          <div className="gac-navbar__actions">
            {location.pathname === '/buses' && localStorage.getItem('role') !== 'bus_operator' && (
              <button
                onClick={() => setIsOperatorModalOpen(true)}
                className="gac-operator-btn"
              >
                <Briefcase size={14} />
                <span className="hide-sm">Bus Operator</span>
              </button>
            )}

            <button className="gac-icon-btn" title="Notifications">
              <Bell size={17} />
            </button>

            <button className="gac-icon-btn" onClick={handleProfileClick} title="Profile">
              <User size={17} />
            </button>

            {!isLoggedIn ? (
              <button className="gac-login-btn" onClick={() => navigate('/login')}>
                Login
              </button>
            ) : (
              <button className="gac-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}

            <button className="gac-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      <OperatorLoginModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
      />
    </>
  )
}