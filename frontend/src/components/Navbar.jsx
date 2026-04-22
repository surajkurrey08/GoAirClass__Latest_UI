import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, Bell, ChevronDown, Briefcase } from 'lucide-react'
import logo from "../assets/logo1.png"
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }

    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'))
    }

    window.addEventListener('scroll', handleScroll)
    // Check auth on mount and whenever location changes (route transition)
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
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'bus_operator') navigate('/bus-operator/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'superadmin') navigate('/super-admin/dashboard');
      else navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const navClass = `navbar ${
    scrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'
  }`

  return (
    <>
      <nav className={navClass}>
        <div className="navbar__inner container">

          {/* LOGO */}
          <Link to="/" className="navbar__logo">
            <img src={logo} alt="GoAirClass Logo" className="navbar__logo-img" />
            <span className="navbar__logo-text">GoAirClass</span>
          </Link>

          {/* LINKS */}
          <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
            <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>

            <div className="navbar__dropdown">
              <span className="navbar__link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Services <ChevronDown size={14} />
              </span>

              <div className="navbar__dropdown-menu">
                <Link to="/search?type=flights" className="dropdown-item">✈ Flights</Link>
                <Link to="/search?type=hotels" className="dropdown-item">🏨 Hotels</Link>
                <Link to="/search?type=trains" className="dropdown-item">🚆 Trains</Link>
                <Link to="/search?type=buses" className="dropdown-item">🚌 Buses</Link>
              </div>
            </div>

            <a href="#offers" className="navbar__link">Offers</a>
            <a href="#destinations" className="navbar__link">Destinations</a>
            <a href="#about" className="navbar__link">About</a>
          </div>

          {/* ACTIONS */}
          <div className="navbar__actions">

            {/* Operator Login Button */}
            {localStorage.getItem('role') !== 'bus_operator' && (
              <button 
                onClick={() => setIsOperatorModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold text-blue-600 transition-colors border border-blue-600 rounded-full hover:bg-blue-50 whitespace-nowrap"
                style={{ 
                  color: scrolled || !isHome ? 'var(--primary)' : '#fff',
                  borderColor: scrolled || !isHome ? 'var(--primary)' : 'rgba(255,255,255,0.5)'
                }}
              >
                <Briefcase size={14} className="lg:w-[16px] lg:h-[16px]" />
                <span className="hidden sm:inline">Bus Operator Login</span>
                <span className="sm:hidden">Operator</span>
              </button>
            )}

            <button className="navbar__icon-btn">
              <Bell size={18}/>
            </button>

            <button 
              className="navbar__icon-btn" 
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
              title="User Profile"
            >
              <User size={18}/>
            </button>

            {!isLoggedIn ? (
              <>
                <button 
                  className="px-6 py-2 text-sm font-medium transition-colors duration-200 rounded-full hover:bg-gray-100/10"
                  style={{ color: scrolled || !isHome ? 'inherit' : '#fff' }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>

                <button
                  className="px-6 py-2 text-sm font-bold text-white transition-all bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:-translate-y-px"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </>
            ) : (
              <button
                className="px-6 py-2 text-sm font-bold text-white transition-all bg-red-500 rounded-full shadow-lg hover:bg-red-600 hover:-translate-y-px"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}

            <button
              className="navbar__mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>

          </div>

        </div>
      </nav>

      {/* Login Modal */}
      <OperatorLoginModal 
        isOpen={isOperatorModalOpen} 
        onClose={() => setIsOperatorModalOpen(false)} 
      />
    </>
  )
}