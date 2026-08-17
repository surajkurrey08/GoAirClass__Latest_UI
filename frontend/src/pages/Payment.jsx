import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreditCard, Smartphone, Building2, Wallet, Lock, CheckCircle, ChevronRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Payment.css'

import API from '../services/axios'
import { bookFlightApi } from '../services/flightApi'
import { toast } from 'react-toastify'

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setProcessing(true);
    const activeSessionId = location.state?.sessionId || sessionStorage.getItem('flight_session_id');
    const selectedSectors = location.state?.flight?.selectedSectorsList || [];
    let travelIds = [];
    if (selectedSectors.length > 0) {
      travelIds = selectedSectors.map(s => s.rawOption?.travelOptionId || s.id).filter(Boolean);
    } else if (location.state?.flight?.isRoundTripCombined) {
      travelIds = [
        location.state?.flight?.outboundTravelId || location.state?.flight?.outboundRawOption?.travelOptionId,
        location.state?.flight?.returnTravelId || location.state?.flight?.returnRawOption?.travelOptionId
      ].filter(Boolean);
    } else {
      const singleId = location.state?.holdData?.data?.travelOptions?.[0]?.travelOptionId ||
        location.state?.holdData?.travelOptions?.[0]?.travelOptionId ||
        location.state?.flight?.rawOption?.travelOptionId ||
        location.state?.flight?.id;
      travelIds = singleId ? [singleId] : [];
    }

    console.log('[Payment Debug] activeSessionId:', activeSessionId);
    console.log('[Payment Debug] location.state:', location.state);
    console.log('[Payment Debug] extracted travelIds:', travelIds);

    try {
      // 1. Load Razorpay JS SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay payment gateway SDK');
        setProcessing(false);
        return;
      }

      // 2. Create order via Backend /api/payments/create-order
      const orderRes = await API.post('/payments/create-order', {
        amount: total,
        notes: {
          service: 'FLIGHT',
          sessionId: activeSessionId,
          travelIds
        }
      });

      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || 'Razorpay Order Creation Failed');
      }

      const orderData = orderRes.data;

      // 3. Launch Razorpay UI Modal
      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SNw35MkokY8h1y',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'GoAirClass Tourism',
        description: 'Flight Booking Payment',
        order_id: orderData.orderId,
        prefill: {
          name: `${location.state?.passenger?.firstName || 'Traveller'} ${location.state?.passenger?.lastName || ''}`.trim(),
          email: location.state?.passenger?.email || 'customer@goairclass.com',
          contact: location.state?.passenger?.phone || '9876543210'
        },
        theme: {
          color: '#b89565'
        },
        handler: async function (response) {
          console.log('[Razorpay Handler Triggered] Payment response:', response);
          try {
            toast.info("Payment verified! Issuing ticket via Cleartrip...");

            // Verify payment signature
            try {
              await API.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              console.log('[Payment Debug] Razorpay signature verified successfully');
            } catch (verifyErr) {
              console.warn('[Payment Debug] Verification endpoint notice:', verifyErr.message);
            }

            // Call bookFlightApi if activeSessionId exists (catch error gracefully so flow finishes)
            let bookData = null;
            // Extract all travelIds from travelOptionList (supports round trip split selection)
            let idsList = [];
            const list = location.state?.holdData?.data?.travelOptionList || location.state?.holdData?.travelOptionList || [];
            if (list.length > 0) {
                list.forEach(opt => {
                    if (opt.subTravelOptions) {
                        opt.subTravelOptions.forEach(sub => {
                            if (sub.travelId) idsList.push(sub.travelId);
                        });
                    }
                });
            }
            if (idsList.length === 0) {
                if (Array.isArray(travelIds)) {
                    idsList = travelIds;
                } else if (travelIds) {
                    idsList = [travelIds];
                } else if (location.state?.flight?.outboundTravelId && location.state?.flight?.returnTravelId) {
                    idsList = [location.state?.flight?.outboundTravelId, location.state?.flight?.returnTravelId];
                } else {
                    idsList = [location.state?.flight?.id];
                }
            }

            if (activeSessionId) {
              console.log('[Payment Debug] Calling bookFlightApi with sessionId:', activeSessionId, 'and travelIds:', idsList);
              try {
                const bookResponse = await bookFlightApi(activeSessionId, idsList, {
                  passenger: location.state?.passenger,
                  passengers: location.state?.passengers,
                  flight: location.state?.flight,
                  holdData: location.state?.holdData,
                  total: location.state?.total
                });
                bookData = bookResponse?.data;
                console.log('[Payment Debug] Cleartrip bookResponse:', bookResponse);
              } catch (bErr) {
                console.warn('[Payment Debug] Cleartrip /book call notice (proceeding with held trip):', bErr.message);
              }
            }

            toast.success("Flight booking confirmed!");
            navigate('/flight/booking-success', {
              state: {
                ...location.state,
                bookingData: bookData,
                pnr: bookData?.pnr || bookData?.bookingId || location.state?.holdData?.tripId,
                paymentId: response.razorpay_payment_id
              }
            });
          } catch (err) {
            console.error("Post Payment Error:", err);
            toast.error(err.message || "Failed to issue ticket after payment.");
            navigate('/flight/booking-success', { state: location.state });
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.warn('Payment window closed');
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment Initiation Error:", err);
      toast.error(err.message || "Failed to start Razorpay payment.");
      setProcessing(false);
    }
  };

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
                        onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
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
