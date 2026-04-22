import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, Smartphone, Building2, Wallet, Lock, CheckCircle, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Payment.css'

const paymentMethods = [
  { id: 'card', icon: CreditCard, label: 'Credit / Debit Card' },
  { id: 'upi', icon: Smartphone, label: 'UPI' },
  { id: 'netbanking', icon: Building2, label: 'Net Banking' },
  { id: 'wallet', icon: Wallet, label: 'Wallets' },
]

const banks = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB']
const wallets = [
  { name: 'PayTM', icon: '💙' },
  { name: 'PhonePe', icon: '💜' },
  { name: 'Google Pay', icon: '🟢' },
  { name: 'Amazon Pay', icon: '🟡' },
]

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const total = location.state?.total || 2499
  const type = location.state?.type || 'flight'
  const [method, setMethod] = useState('card')
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [upi, setUpi] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [processing, setProcessing] = useState(false)

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => navigate('/success'), 2500)
  }

  const formatCard = (val) => val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)
  const formatExpiry = (val) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)

  return (
    <div className="payment-page">
      <Navbar />
      <div style={{ paddingTop: 68, background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="payment-header">
          <div className="container">
            <div className="payment-header__inner">
              <div>
                <h1>Secure Payment</h1>
                <p>Your payment is protected by 256-bit SSL encryption</p>
              </div>
              <div className="ssl-badge">
                <Lock size={18} />
                <span>SSL Secured</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container payment-body">
          <div className="payment-main">
            <div className="payment-methods">
              {paymentMethods.map(({ id, icon: Icon, label }) => (
                <button key={id} className={`method-btn ${method === id ? 'active' : ''}`} onClick={() => setMethod(id)}>
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="payment-form">
              {method === 'card' && (
                <div className="animate-fadeInUp">
                  <div className="card-preview">
                    <div className="card-preview__top">
                      <span className="card-chip">💳</span>
                      <span className="card-network">VISA</span>
                    </div>
                    <div className="card-preview__number">
                      {cardForm.number || '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-preview__bottom">
                      <div>
                        <div className="card-label">Card Holder</div>
                        <div>{cardForm.name || 'YOUR NAME'}</div>
                      </div>
                      <div>
                        <div className="card-label">Expires</div>
                        <div>{cardForm.expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="form-grid" style={{ marginTop: 24 }}>
                    <div className="form-group form-group--full">
                      <label>Card Number</label>
                      <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                        value={cardForm.number}
                        onChange={e => setCardForm({ ...cardForm, number: formatCard(e.target.value) })} />
                    </div>
                    <div className="form-group form-group--full">
                      <label>Cardholder Name</label>
                      <input className="form-input" placeholder="Name as on card"
                        value={cardForm.name}
                        onChange={e => setCardForm({ ...cardForm, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input className="form-input" placeholder="MM/YY" maxLength={5}
                        value={cardForm.expiry}
                        onChange={e => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input className="form-input" placeholder="•••" maxLength={4} type="password"
                        value={cardForm.cvv}
                        onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })} />
                    </div>
                  </div>
                  <label className="save-card">
                    <input type="checkbox" defaultChecked />
                    Save this card for future bookings (secured with encryption)
                  </label>
                </div>
              )}

              {method === 'upi' && (
                <div className="animate-fadeInUp">
                  <div className="upi-logos">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(u => (
                      <div key={u} className="upi-logo">{u}</div>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label>Enter UPI ID</label>
                    <div className="upi-input-wrap">
                      <input className="form-input" placeholder="yourname@upi"
                        value={upi} onChange={e => setUpi(e.target.value)} />
                      <button className="verify-btn">Verify</button>
                    </div>
                  </div>
                  <p className="upi-hint">Enter your UPI ID and click Verify. You will receive a payment request on your UPI app.</p>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="animate-fadeInUp">
                  <div className="banks-grid">
                    {banks.map(bank => (
                      <label key={bank} className={`bank-card ${selectedBank === bank ? 'selected' : ''}`}>
                        <input type="radio" name="bank" value={bank} style={{ display: 'none' }}
                          onChange={() => setSelectedBank(bank)} />
                        <div className="bank-icon">🏦</div>
                        <span>{bank}</span>
                      </label>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label>Or select other bank</label>
                    <select className="form-input" value={selectedBank} onChange={e => setSelectedBank(e.target.value)}>
                      <option value="">-- Select Bank --</option>
                      <option>Yes Bank</option>
                      <option>IndusInd Bank</option>
                      <option>Bank of Baroda</option>
                    </select>
                  </div>
                </div>
              )}

              {method === 'wallet' && (
                <div className="animate-fadeInUp">
                  <div className="wallets-grid">
                    {wallets.map(w => (
                      <label key={w.name} className={`wallet-card ${selectedWallet === w.name ? 'selected' : ''}`}>
                        <input type="radio" name="wallet" style={{ display: 'none' }}
                          onChange={() => setSelectedWallet(w.name)} />
                        <span className="wallet-icon">{w.icon}</span>
                        <span>{w.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="payment-aside">
            <div className="payment-summary">
              <h3>Booking Summary</h3>
              <div className="summary-item">
                <span>Service</span>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)} Booking</span>
              </div>
              <div className="summary-item">
                <span>Base Fare</span>
                <span>₹{(total * 0.82 / 1).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              </div>
              <div className="summary-item">
                <span>Taxes & Fees</span>
                <span>₹{(total * 0.18).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              </div>
              <div className="summary-total">
                <span>Total Payable</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button className="pay-btn" onClick={handlePay} disabled={processing}>
              {processing ? (
                <div className="pay-btn__processing">
                  <div className="spinner" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Lock size={18} />
                  Pay ₹{total.toLocaleString()} Securely
                </>
              )}
            </button>

            <div className="accepted-cards">
              <p>Accepted Payments</p>
              <div className="card-icons">
                {['VISA', 'MC', 'RuPay', 'Amex', 'UPI'].map(c => (
                  <span key={c} className="card-icon-tag">{c}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
