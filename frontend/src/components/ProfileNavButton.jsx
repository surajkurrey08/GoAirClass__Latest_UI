import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, LogOut, UserRound, TicketCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const isLoggedInNow = () =>
  Boolean(
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('userToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('isLoggedIn') === 'true'
  )

const getUserName = () => {
  // Your project already stores userName, so prefer that first.
  const storedName =
    localStorage.getItem('userName') ||
    sessionStorage.getItem('userName')

  if (storedName) return storedName

  const keys = ['user', 'authUser', 'profile', 'currentUser', 'userData']

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (!raw) continue

      const user = JSON.parse(raw)

      const name =
        user?.name ||
        user?.fullName ||
        user?.username ||
        user?.firstName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(' ')

      if (name) return name
    } catch {
      // ignore malformed data
    }
  }

  return 'My Profile'
}

export default function ProfileNavButton() {
  const navigate = useNavigate()
  const wrapRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(() => isLoggedInNow())

  const userName = useMemo(() => getUserName(), [loggedIn])

  const initials = String(userName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'GA'

  useEffect(() => {
    const closeDropdown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const syncAuth = () => {
      setLoggedIn(isLoggedInNow())
    }

    document.addEventListener('mousedown', closeDropdown)
    window.addEventListener('storage', syncAuth)
    window.addEventListener('focus', syncAuth)

    return () => {
      document.removeEventListener('mousedown', closeDropdown)
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('focus', syncAuth)
    }
  }, [])

  const handleLogout = () => {
    [
      'token',
      'role',
      'userName',
      'accessToken',
      'authToken',
      'jwt',
      'userToken',
      'isLoggedIn',
    ].forEach((key) => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })

    setOpen(false)
    setLoggedIn(false)
    navigate('/login', { replace: true })
  }

  if (!loggedIn) {
    return (
      <button
        type="button"
        className="gac-login-btn"
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    )
  }

  return (
    <div className="nav-profile-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`nav-profile-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="nav-profile-avatar">
          {initials}
        </span>

        <span className="nav-profile-copy">
          <span className="nav-profile-name">{userName}</span>
          <span className="nav-profile-subtitle">My Account</span>
        </span>

        <ChevronDown
          size={15}
          className={`nav-profile-chevron ${open ? 'open' : ''}`}
        />
      </button>

      {open && (
        <div className="nav-profile-menu" role="menu">
          <div className="nav-profile-menu-head">
            <span className="nav-profile-menu-avatar">{initials}</span>
            <div className="nav-profile-menu-user">
              <strong>{userName}</strong>
              <small>GoAirClass account</small>
            </div>
          </div>

          <div className="nav-profile-divider" />

          <button
            type="button"
            className="nav-profile-menu-item"
            onClick={() => {
              setOpen(false)
              navigate('/profile')
            }}
          >
            <span className="nav-profile-menu-icon">
              <UserRound size={16} />
            </span>

            <span className="nav-profile-menu-text">
              <strong>My Profile</strong>
              <small>Account details</small>
            </span>
          </button>

          <button
            type="button"
            className="nav-profile-menu-item"
            onClick={() => {
              setOpen(false)
              navigate('/profile')
            }}
          >
            <span className="nav-profile-menu-icon nav-profile-menu-icon--orange">
              <TicketCheck size={16} />
            </span>

            <span className="nav-profile-menu-text">
              <strong>My Bookings</strong>
              <small>Flights & hotels history</small>
            </span>
          </button>

          <div className="nav-profile-divider" />

          <button
            type="button"
            className="nav-profile-menu-item nav-profile-menu-item--logout"
            onClick={handleLogout}
          >
            <span className="nav-profile-menu-icon nav-profile-menu-icon--red">
              <LogOut size={16} />
            </span>
            <span className="nav-profile-menu-text">
              <strong>Logout</strong>
              <small>Sign out from account</small>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}