import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, Users, Plane, Train, Bus, Hotel, Loader2 } from 'lucide-react'
import { searchCities } from '../services/busService'; // V2_FORCED_REFRESH
import './SearchForm.css'

const tabs = [
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'trains', label: 'Trains', icon: Train },
  { id: 'buses', label: 'Buses', icon: Bus },
]

export default function SearchForm({ variant = 'hero' }) {
  const [activeTab, setActiveTab] = useState('flights')
  const [form, setForm] = useState({ from: '', to: '', date: '', returnDate: '', guests: '1 Adult' })
  const [forWomen, setForWomen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [activeInput, setActiveInput] = useState(null) // 'from' or 'to'
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveInput(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const query = activeInput === 'from' ? form.from : form.to
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggest(true)
      try {
        const data = await searchCities(query)
        setSuggestions(data)
      } catch (error) {
        console.error("Autocomplete Error:", error)
      } finally {
        setLoadingSuggest(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [form.from, form.to, activeInput])

  const handleSearch = () => {
    const womenParam = activeTab === 'buses' ? `&women=${forWomen}` : ''
    navigate(`/search?type=${activeTab}&from=${form.from}&to=${form.to}&date=${form.date}${womenParam}`)
  }

  const selectCity = (cityName) => {
    setForm({ ...form, [activeInput]: cityName })
    setSuggestions([])
    setActiveInput(null)
  }

  return (
    <div className={`search-form search-form--${variant}`}>
      <div className="search-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`search-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="search-fields">
        {activeTab !== 'hotels' ? (
          <>
            <div className="search-field">
              <MapPin size={16} className="field-icon" />
              <div className="field-content">
                <label>From</label>
                <input
                  placeholder="City or Airport"
                  value={form.from}
                  onFocus={() => setActiveInput('from')}
                  onChange={e => setForm({ ...form, from: e.target.value })}
                />
              </div>
              {activeInput === 'from' && (suggestions.length > 0 || loadingSuggest) && (
                <div className="suggestions-dropdown" ref={dropdownRef}>
                  {loadingSuggest ? (
                    <div className="suggestion-loading">Searching...</div>
                  ) : (
                    suggestions.map(city => (
                      <div key={city._id} className="suggestion-item" onClick={() => selectCity(city.name)}>
                        <MapPin size={14} className="suggestion-icon" />
                        <div className="suggestion-info">
                          <span className="suggestion-name">{city.name}</span>
                          <span className="suggestion-meta">{city.state || 'India'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="search-swap" onClick={() => setForm({ ...form, from: form.to, to: form.from })}>⇄</div>
            <div className="search-field">
              <MapPin size={16} className="field-icon" />
              <div className="field-content">
                <label>To</label>
                <input
                  placeholder="City or Airport"
                  value={form.to}
                  onFocus={() => setActiveInput('to')}
                  onChange={e => setForm({ ...form, to: e.target.value })}
                />
              </div>
              {activeInput === 'to' && (suggestions.length > 0 || loadingSuggest) && (
                <div className="suggestions-dropdown" ref={dropdownRef}>
                  {loadingSuggest ? (
                    <div className="suggestion-loading">Searching...</div>
                  ) : (
                    suggestions.map(city => (
                      <div key={city._id} className="suggestion-item" onClick={() => selectCity(city.name)}>
                        <MapPin size={14} className="suggestion-icon" />
                        <div className="suggestion-info">
                          <span className="suggestion-name">{city.name}</span>
                          <span className="suggestion-meta">{city.state || 'India'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="search-field search-field--wide">
            <MapPin size={16} className="field-icon" />
            <div className="field-content">
              <label>Destination</label>
              <input
                placeholder="City, Hotel or Area"
                value={form.to}
                onFocus={() => setActiveInput('to')}
                onChange={e => setForm({ ...form, to: e.target.value })}
              />
            </div>
            {activeInput === 'to' && (suggestions.length > 0 || loadingSuggest) && (
              <div className="suggestions-dropdown" ref={dropdownRef}>
                {loadingSuggest ? (
                  <div className="suggestion-loading">Searching...</div>
                ) : (
                  suggestions.map(city => (
                    <div key={city._id} className="suggestion-item" onClick={() => selectCity(city.name)}>
                      <MapPin size={14} className="suggestion-icon" />
                      <div className="suggestion-info">
                        <span className="suggestion-name">{city.name}</span>
                        <span className="suggestion-meta">{city.state || 'India'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="search-field">
          <Calendar size={16} className="field-icon" />
          <div className="field-content">
            <label>{activeTab === 'hotels' ? 'Check In' : 'Departure'}</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>

        {(activeTab === 'hotels' || activeTab === 'flights') && (
          <div className="search-field">
            <Calendar size={16} className="field-icon" />
            <div className="field-content">
              <label>{activeTab === 'hotels' ? 'Check Out' : 'Return'}</label>
              <input type="date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} />
            </div>
          </div>
        )}

        <div className="search-field">
          {activeTab === 'buses' ? (
            <>
              <Users size={16} className="field-icon" style={{ color: forWomen ? '#e91e63' : 'inherit' }} />
              <div className="field-content">
                <label>Preference</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setForWomen(!forWomen)}>
                  <input
                    type="checkbox"
                    checked={forWomen}
                    onChange={e => setForWomen(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: forWomen ? '#e91e63' : 'var(--text-dark)' }}>
                    Women
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <Users size={16} className="field-icon" />
              <div className="field-content">
                <label>{activeTab === 'hotels' ? 'Rooms / Guests' : 'Travellers'}</label>
                <select value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })}>
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option>2 Adults, 1 Child</option>
                  <option>2 Adults, 2 Children</option>
                  <option>Group (5+)</option>
                </select>
              </div>
            </>
          )}
        </div>

        <button className="search-btn" onClick={handleSearch}>
          <Search size={20} />
          <span>Search</span>
        </button>
      </div>
    </div>
  )
}
