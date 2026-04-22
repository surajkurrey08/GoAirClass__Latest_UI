import React, { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, CreditCard, CheckCircle, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Booking.css'

const steps = ['Traveller Details', 'Add-ons', 'Review']

export default function Booking() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || 'flight'
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', gender: 'Male', nationality: 'Indian',
    addons: { meal: false, insurance: false, extraBaggage: false, priorityBoarding: false }
  })

  const price = type === 'hotels' ? 8500 : type === 'trains' ? 1450 : type === 'buses' ? 899 : 2499
  const addonPrices = { meal: 350, insurance: 299, extraBaggage: 750, priorityBoarding: 199 }
  const addonTotal = Object.entries(form.addons).filter(([k, v]) => v).reduce((sum, [k]) => sum + addonPrices[k], 0)
  const taxes = Math.round((price + addonTotal) * 0.18)
  const total = price + addonTotal + taxes

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
    else navigate('/payment', { state: { total, type } })
  }

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 68, background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="booking-header">
          <div className="container">
            <h1>Complete Your Booking</h1>
            <div className="booking-steps">
              {steps.map((s, i) => (
                <React.Fragment key={i}>
                  <div className={`booking-step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                    <div className="booking-step__num">
                      {i < step ? <CheckCircle size={18} /> : i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`booking-step__line ${i < step ? 'done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="container booking-body">
          <div className="booking-main">
            {step === 0 && (
              <div className="booking-card animate-fadeInUp">
                <h2>Traveller Details</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label><User size={14}/> First Name</label>
                    <input className="form-input" placeholder="Enter first name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label><User size={14}/> Last Name</label>
                    <input className="form-input" placeholder="Enter last name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label><Mail size={14}/> Email Address</label>
                    <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label><Phone size={14}/> Phone Number</label>
                    <input className="form-input" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label><Calendar size={14}/> Date of Birth</label>
                    <input className="form-input" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select className="form-input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group form-group--full">
                    <label>Nationality</label>
                    <select className="form-input" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})}>
                      <option>Indian</option>
                      <option>American</option>
                      <option>British</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="booking-card animate-fadeInUp">
                <h2>Add-ons & Extras</h2>
                <p style={{ color: 'var(--text-gray)', marginBottom: 24 }}>Enhance your travel experience with these optional add-ons</p>
                <div className="addons-grid">
                  {[
                    { key: 'meal', icon: '🍽️', title: 'In-flight Meal', desc: 'Choice of veg/non-veg meal', price: 350 },
                    { key: 'insurance', icon: '🛡️', title: 'Travel Insurance', desc: 'Comprehensive coverage', price: 299 },
                    { key: 'extraBaggage', icon: '🧳', title: 'Extra Baggage (15kg)', desc: 'Additional check-in baggage', price: 750 },
                    { key: 'priorityBoarding', icon: '⚡', title: 'Priority Boarding', desc: 'Board first, choose seats', price: 199 },
                  ].map(addon => (
                    <label key={addon.key} className={`addon-card ${form.addons[addon.key] ? 'selected' : ''}`}>
                      <input type="checkbox" style={{ display: 'none' }}
                        checked={form.addons[addon.key]}
                        onChange={e => setForm({ ...form, addons: { ...form.addons, [addon.key]: e.target.checked } })}
                      />
                      <div className="addon-card__icon">{addon.icon}</div>
                      <div className="addon-card__info">
                        <div className="addon-card__title">{addon.title}</div>
                        <div className="addon-card__desc">{addon.desc}</div>
                      </div>
                      <div className="addon-card__price">+₹{addon.price}</div>
                      <div className={`addon-card__check ${form.addons[addon.key] ? 'checked' : ''}`}>
                        {form.addons[addon.key] ? <CheckCircle size={20} color="var(--primary)" /> : <div className="addon-circle" />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="booking-card animate-fadeInUp">
                <h2>Review Your Booking</h2>
                <div className="review-booking">
                  <div className="review-section">
                    <h3>Traveller Information</h3>
                    <div className="review-grid">
                      <div><span>Name</span><strong>{form.firstName || 'John'} {form.lastName || 'Doe'}</strong></div>
                      <div><span>Email</span><strong>{form.email || 'john@example.com'}</strong></div>
                      <div><span>Phone</span><strong>{form.phone || '+91 98765 43210'}</strong></div>
                      <div><span>Gender</span><strong>{form.gender}</strong></div>
                    </div>
                  </div>
                  <div className="review-section">
                    <h3>Selected Add-ons</h3>
                    {Object.entries(form.addons).filter(([, v]) => v).length === 0
                      ? <p style={{ color: 'var(--text-gray)' }}>No add-ons selected</p>
                      : Object.entries(form.addons).filter(([, v]) => v).map(([k]) => (
                        <div key={k} className="review-addon">✓ {k.replace(/([A-Z])/g, ' $1').trim()}</div>
                      ))
                    }
                  </div>
                  <div className="review-policy">
                    <label className="policy-check">
                      <input type="checkbox" defaultChecked />
                      I agree to the Terms & Conditions and Privacy Policy of Goairclass
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="booking-nav">
              {step > 0 && (
                <button className="btn btn-outline" onClick={() => setStep(step - 1)}>← Back</button>
              )}
              <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={handleNext}>
                {step === 2 ? 'Proceed to Payment' : 'Continue'} <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <aside className="price-summary">
            <div className="price-summary__card">
              <h3>Price Summary</h3>
              <div className="price-line">
                <span>Base Fare</span>
                <span>₹{price.toLocaleString()}</span>
              </div>
              {Object.entries(form.addons).filter(([, v]) => v).map(([k]) => (
                <div key={k} className="price-line price-line--addon">
                  <span>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>+₹{addonPrices[k]}</span>
                </div>
              ))}
              <div className="price-line">
                <span>Taxes & Fees (18%)</span>
                <span>₹{taxes.toLocaleString()}</span>
              </div>
              <div className="price-line price-line--total">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="price-saving">
                <span>🎉 You save ₹{Math.round(total * 0.12).toLocaleString()} on this booking!</span>
              </div>
            </div>

            <div className="trust-badges">
              {['🔒 Secure Payment', '✅ Instant Confirmation', '📞 24/7 Support'].map((b, i) => (
                <div key={i} className="trust-badge">{b}</div>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  )
}
