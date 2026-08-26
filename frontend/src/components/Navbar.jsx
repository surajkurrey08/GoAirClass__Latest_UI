import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Briefcase } from 'lucide-react'
import logo from "../assets/logo_new4.png"
import OperatorLoginModal from './OperatorLoginModal'
import ProfileNavButton from './ProfileNavButton'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const isTransparentRoute =
    location.pathname === '/' ||
    location.pathname === '/flights' ||
    location.pathname === '/hotels'

  // Pages that use their own standalone layout.
  // Even if Navbar is mounted globally from App/Layout, it will not render here.
  const hideNavbar =
    location.pathname === '/profile' ||
    location.pathname.startsWith('/profile/')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)

    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'))
    }

    handleScroll()
    checkAuth()

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('storage', checkAuth)
    window.addEventListener('focus', checkAuth)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('focus', checkAuth)
    }
  }, [location.pathname])

  const closeMobileMenu = () => setMenuOpen(false)

  const handleManageBooking = () => {
    closeMobileMenu()

    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token) {
      navigate('/login', {
        state: { from: '/profile' }
      })
      return
    }

    if (role === 'bus_operator') {
      navigate('/bus-operator/dashboard')
      return
    }

    if (role === 'admin' || role === 'superadmin') {
      window.location.href = 'https://admin.goairclass.com'
      return
    }

    // Normal customer profile contains booking history
    navigate('/profile')
  }

  if (hideNavbar) {
    return null
  }

  return (
    <>
      <nav
        className={`gac-navbar ${
          scrolled ? 'gac-navbar--scrolled' : ''
        } ${
          isTransparentRoute && !scrolled ? 'gac-navbar--transparent' : ''
        }`}
      >
        <div className="gac-navbar__inner">

          {/* LOGO */}
          <Link
            to="/"
            className="gac-navbar__logo"
            onClick={closeMobileMenu}
          >
            <img
              src={logo}
              alt="GoAirClass"
              className="gac-navbar__logo-img gac-navbar__logo-img--base"
            />
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="gac-navbar__logo-img gac-navbar__logo-img--gold"
            />
          </Link>

          {/* LINKS */}
          <div className={`gac-navbar__links ${menuOpen ? 'open' : ''}`}>
            <Link
              to="/"
              className={`gac-navbar__link ${
                location.pathname === '/' ? 'active' : ''
              }`}
              onClick={() => {
                closeMobileMenu()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Home
            </Link>

            <Link
              to="/flights"
              className={`gac-navbar__link ${
                location.pathname === '/flights' ? 'active' : ''
              }`}
              onClick={closeMobileMenu}
            >
              Flights
            </Link>

            <Link
              to="/hotels"
              className={`gac-navbar__link ${
                location.pathname === '/hotels' ? 'active' : ''
              }`}
              onClick={closeMobileMenu}
            >
              Hotels
            </Link>

            <a
              href="#offers"
              className="gac-navbar__link"
              onClick={(e) => {
                e.preventDefault()
                closeMobileMenu()

                if (location.pathname !== '/') {
                  navigate('/#offers')
                  return
                }

                document
                  .getElementById('offers')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Holidays
            </a>

            <a
              href="#offers"
              className="gac-navbar__link"
              onClick={(e) => {
                e.preventDefault()
                closeMobileMenu()

                if (location.pathname !== '/') {
                  navigate('/#offers')
                  return
                }

                document
                  .getElementById('offers')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Offers
            </a>

            {isLoggedIn && (
              <button
                type="button"
                className="gac-navbar__link"
                onClick={handleManageBooking}
              >
                Manage Booking
              </button>
            )}

            <Link
              to="/inquiry"
              className={`gac-navbar__link ${
                location.pathname === '/inquiry' ? 'active' : ''
              }`}
              onClick={closeMobileMenu}
            >
              Travel Info
            </Link>

            <Link
              to="/inquiry"
              className={`gac-navbar__link ${
                location.pathname === '/inquiry' ? 'active' : ''
              }`}
              onClick={closeMobileMenu}
            >
              About Us
            </Link>
          </div>

          {/* ACTIONS */}
          <div className="gac-navbar__actions">
            {location.pathname === '/buses' &&
              localStorage.getItem('role') !== 'bus_operator' && (
                <button
                  type="button"
                  onClick={() => setIsOperatorModalOpen(true)}
                  className="gac-operator-btn"
                >
                  <Briefcase size={14} />
                  <span className="hide-sm">Bus Operator</span>
                </button>
              )}

            {!isLoggedIn ? (
              <>
                <button
                  type="button"
                  className="gac-getstarted-btn"
                  onClick={() => {
                    closeMobileMenu()
                    navigate('/register')
                  }}
                >
                  Get Started
                </button>

                <button
                  type="button"
                  className="gac-login-btn"
                  onClick={() => {
                    closeMobileMenu()
                    navigate('/login')
                  }}
                >
                  Login
                </button>
              </>
            ) : (
              /*
               * Logged-in state:
               * Instead of a separate red Logout button, show one
               * Profile control with My Profile / My Bookings / Logout.
               */
              <ProfileNavButton />
            )}

            <button
              type="button"
              className="gac-mobile-toggle"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
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