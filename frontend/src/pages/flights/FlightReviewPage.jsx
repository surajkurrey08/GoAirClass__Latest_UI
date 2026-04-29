import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Luggage, ShieldCheck, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getSessionDetails, lockPrice } from '../../services/flightApi';
import { createFinalBooking } from '../../services/paymentService';
import FlightLoader from '../../components/flights/FlightLoader';
import SeatSelectionModal from '../../components/flights/SeatSelectionModal';
import './FlightReviewPage.css';

const FlightReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('sessionId');
  const fareKey = queryParams.get('fareKey');

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travellers, setTravellers] = useState([{ id: 1, title: 'Mr', firstName: '', lastName: '', nationality: 'Indian', dob: '' }]);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', countryCode: '+91' });
  const [billingAddress, setBillingAddress] = useState({ pincode: '', address: '', city: '', state: '' });
  const [useGst, setUseGst] = useState(false);
  const [gstInfo, setGstInfo] = useState({ registrationNumber: '', companyName: '', companyAddress: '' });
  const [cancellationPlan, setCancellationPlan] = useState('none'); // 'none', 'basic', 'flex'
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Loading...");
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [seatTotalPrice, setSeatTotalPrice] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      toast.error("Invalid Session");
      navigate('/flights');
      return;
    }
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await getSessionDetails(sessionId);
      if (res.success) {
        setSession(res.session);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load booking session");
      navigate('/flights');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTraveller = () => {
    setTravellers([...travellers, { id: Date.now(), title: 'Mr', firstName: '', lastName: '', nationality: 'Indian', dob: '' }]);
  };

  const handleRemoveTraveller = (id) => {
    if (travellers.length > 1) {
      setTravellers(travellers.filter(t => t.id !== id));
    }
  };

  const handlePriceLock = async () => {
    try {
      const res = await lockPrice(sessionId);
      if (res.success) {
        toast.success("Price locked for 24 hours!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to lock price");
    }
  };

  const handleContinue = () => {
    if (!contactInfo.email || !contactInfo.phone) {
      toast.error("Please fill contact details");
      return;
    }
    for (let t of travellers) {
      if (!t.firstName || !t.lastName || !t.dob || !t.nationality) {
        toast.error("Please fill traveller details");
        return;
      }
    }
    if (cancellationPlan === 'none') {
      toast.error("Please select a Cancellation Plan");
      return;
    }
    setShowReviewDrawer(true);
  };

  const handleDetailsConfirmed = () => {
    setShowReviewDrawer(false);
    setLoaderMessage("Loading seat map...");
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setIsSeatModalOpen(true);
    }, 1500);
  };

  const handleSeatSelectionComplete = (selection) => {
    const { selectedSeats: seats, selectedMeals: meals } = selection;
    setSelectedSeats(seats);
    setSelectedMeals(meals);
    setSeatTotalPrice(seats.reduce((acc, s) => acc + s.price, 0));
    setIsSeatModalOpen(false);
    handleFinalConfirm(seats, meals);
  };

  const handleFinalConfirm = async (seats = selectedSeats, meals = selectedMeals) => {
    setLoaderMessage("Processing your booking...");
    setProcessing(true);
    try {
      const seatTotal = seats.reduce((acc, s) => acc + (s.price || 0), 0);
      const mealTotal = meals.reduce((acc, m) => acc + (m.price || 0), 0);
      const addonTotal = (cancellationPlan === 'basic' ? 899 : cancellationPlan === 'flex' ? 1219 : 0) * travellers.length;
      const discount = 600; // Instant Off

      const res = await createFinalBooking({
        sessionId, travellers, contactInfo,
        selectedSeats: seats, selectedMeals: meals,
        fareDetails: {
          baseFare: fare.baseFare * travellers.length,
          taxes: fare.taxes * travellers.length,
          seatFee: seatTotal,
          addons: mealTotal + addonTotal,
          discount: discount,
          totalAmount: (fare.total * travellers.length) + seatTotal + mealTotal + addonTotal - discount
        }
      });
      if (res.success) {
        navigate(`/flight/payment?sessionId=${sessionId}&bookingId=${res.bookingId}`);
      }
    } catch (err) {
      toast.error(err.message || "Booking failed");
      setProcessing(false);
    }
  };

  if (loading) return <FlightLoader message="Fetching flight details..." />;
  if (loading) return <FlightLoader message="Fetching flight details..." />;
  if (processing) return <FlightLoader message={loaderMessage} />;
  if (!session) return null;

  const flight = session.flightId;
  const fare = session.priceSnapshot;

  return (
    <div className="review-page">
      <Navbar />

      <div className="review-container container">
        {/* Header */}
        <div className="review-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} /> Back
          </button>
          <h1>Review your booking</h1>
        </div>

        <div className="review-layout">
          {/* Main Section */}
          <div className="review-main">

            {/* Flight Summary Card */}
            <div className="flight-summary-card">
              <div className="card-header">
                <div className="airline-meta">
                  <div className="logo-box">
                    <img src={flight.airlineLogo || '/airline-placeholder.png'} alt={flight.airlineName} />
                  </div>
                  <div>
                    <h3 className="route-text">{flight.departureCity || flight.from} → {flight.arrivalCity || flight.to}</h3>
                    <div className="sub-meta">
                      <span>{dayjs(flight.departureDate).format('ddd, DD MMM')}</span>
                      <span className="dot"></span>
                      <span>{flight.stops || 'Non-stop'}</span>
                      <span className="dot"></span>
                      <span>{flight.duration}</span>
                      <span className="dot"></span>
                      <span>Economy</span>
                    </div>
                  </div>
                </div>
                <div className="refund-tag">{flight.refundable ? 'FULLY REFUNDABLE' : 'PARTIALLY REFUNDABLE'}</div>
              </div>

              <div className="itinerary-main">
                <div className="airline-info-strip">
                  <div className="airline-brand">
                    <img src={flight.airlineLogo || '/airline-placeholder.png'} alt={flight.airlineName} className="small-logo" />
                    <strong>{flight.airlineName} | {flight.flightNumber}</strong>
                  </div>
                  <span className="on-time-badge">
                    <Clock size={12} /> {flight.onTime || '96% On-time'}
                  </span>
                </div>

                <div className="journey-details-v2">
                  <div className="checkpoint">
                    <span className="time">{flight.departureTime}</span>
                    <div className="city-info">
                      <strong>{flight.from} - {flight.departureCity || flight.from}</strong>
                      <p>{flight.departureAirport}</p>
                      <span className="terminal">{flight.departureTerminal}</span>
                    </div>
                  </div>

                  <div className="duration-visual-v2">
                    <span className="duration">{flight.duration}</span>
                    <div className="path-line"></div>
                  </div>

                  <div className="checkpoint">
                    <span className="time">{flight.arrivalTime}</span>
                    <div className="city-info">
                      <strong>{flight.to} - {flight.arrivalCity || flight.to}</strong>
                      <p>{flight.arrivalAirport}</p>
                      <span className="terminal">{flight.arrivalTerminal}</span>
                    </div>
                  </div>

                  <div className="baggage-column">
                    <span className="label">Baggage</span>
                    <div className="bag-item">
                      <Luggage size={14} /> <span>Cabin: <strong>{flight.baggage?.cabin || '7 kg'}</strong></span>
                    </div>
                    <div className="bag-item">
                      <Luggage size={14} /> <span>Check-in: <strong>{flight.baggage?.checkin || '15 kg'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="aircraft-footer">
                  <div className="footer-item">
                    <span className="icon">✈️</span>
                    <span>{flight.aircraftType || 'Airbus A320-251N neo'}</span>
                  </div>
                  <div className="footer-item">
                    <span className="icon">💺</span>
                    <span>Narrow</span>
                  </div>
                  <div className="footer-item">
                    <span className="icon">🛋️</span>
                    <span>{flight.seatConfig || 'Standard 3-3 (Limited seat tilt)'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Free Cancellation Section */}
            <div className="cancellation-section">
              <div className="section-title">
                <ShieldCheck color="#059669" />
                <h3>Add Free Cancellation to your trip</h3>
              </div>
              <div className="plans-grid">
                <div className={`plan-card ${cancellationPlan === 'basic' ? 'active' : ''}`} onClick={() => setCancellationPlan('basic')}>
                  <div className="plan-header">
                    <span className="badge">MOST POPULAR</span>
                    <h4>Free Cancellation</h4>
                    <span className="price">₹919 / traveller</span>
                  </div>
                  <ul>
                    <li>✓ Instant refund of approx. ₹6,999</li>
                    <li>✓ Cancel up to 24hrs before departure</li>
                    <li>✓ 24x7 priority customer service</li>
                  </ul>
                  <div className="radio"></div>
                </div>

                <div className={`plan-card ${cancellationPlan === 'flex' ? 'active' : ''}`} onClick={() => setCancellationPlan('flex')}>
                  <div className="plan-header">
                    <span className="badge flex">ASSURED FLEX</span>
                    <h4>Free Cancellation + Rescheduling</h4>
                    <span className="price">₹1,219 / traveller</span>
                  </div>
                  <ul>
                    <li>✓ Instant refund of approx. ₹6,999</li>
                    <li>✓ Change date, airline even sector for free</li>
                    <li>✓ No-questions-asked refund</li>
                  </ul>
                  <div className="radio"></div>
                </div>
              </div>
            </div>

            {/* Traveller Details Form */}
            <div className="traveller-section">
              <div className="section-title">
                <h3>Traveller Details</h3>
                <span>{travellers.length} Adult(s)</span>
              </div>

              {travellers.map((t, idx) => (
                <div key={t.id} className="traveller-form">
                  <div className="form-header">
                    <h4>Adult {idx + 1}</h4>
                    {idx > 0 && <button className="remove-btn" onClick={() => handleRemoveTraveller(t.id)}><Trash2 size={16} /></button>}
                  </div>
                  <div className="input-grid">
                    <select className="title-select" value={t.title} onChange={(e) => {
                      const newT = [...travellers];
                      newT[idx].title = e.target.value;
                      setTravellers(newT);
                    }}>
                      <option>Mr</option>
                      <option>Ms</option>
                      <option>Mrs</option>
                    </select>
                    <input type="text" placeholder="First & Middle Name" value={t.firstName} onChange={(e) => {
                      const newT = [...travellers];
                      newT[idx].firstName = e.target.value;
                      setTravellers(newT);
                    }} />
                    <input type="text" placeholder="Last Name" value={t.lastName} onChange={(e) => {
                      const newT = [...travellers];
                      newT[idx].lastName = e.target.value;
                      setTravellers(newT);
                    }} />
                  </div>
                  <div className="input-grid-v2 mt-16">
                    <div className="input-field">
                      <label>Date of Birth</label>
                      <input type="date" value={t.dob} onChange={(e) => {
                        const newT = [...travellers];
                        newT[idx].dob = e.target.value;
                        setTravellers(newT);
                      }} />
                    </div>
                    <div className="input-field">
                      <label>Nationality</label>
                      <select value={t.nationality} onChange={(e) => {
                        const newT = [...travellers];
                        newT[idx].nationality = e.target.value;
                        setTravellers(newT);
                      }}>
                        <option value="Indian">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button className="add-traveller-btn" onClick={handleAddTraveller}>
                <Plus size={18} /> ADD NEW ADULT
              </button>
            </div>

            {/* Contact Details */}
            <div className="contact-section">
              <h3>Contact Details</h3>
              <p>Your ticket & booking details will be sent here</p>
              <div className="input-grid">
                <div className="phone-input">
                  <select value={contactInfo.countryCode} onChange={(e) => setContactInfo({ ...contactInfo, countryCode: e.target.value })}>
                    <option>+91</option>
                    <option>+1</option>
                    <option>+44</option>
                  </select>
                  <input type="text" placeholder="Mobile Number" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                </div>
                <input type="email" placeholder="Email Address" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
              </div>
            </div>

            {/* Billing Address */}
            <div className="billing-section">
              <h3>Billing Address</h3>
              <p>As per the latest govt. regulations, it’s mandatory to provide your address.</p>
              <div className="billing-grid">
                <div className="input-field">
                  <label>Pincode</label>
                  <input type="text" placeholder="e.g. 411033" value={billingAddress.pincode} onChange={(e) => setBillingAddress({ ...billingAddress, pincode: e.target.value })} />
                </div>
                <div className="input-field">
                  <label>Address</label>
                  <input type="text" placeholder="e.g. Pune" value={billingAddress.address} onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })} />
                </div>
                <div className="input-field">
                  <label>City</label>
                  <input type="text" placeholder="e.g. Pune" value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} />
                </div>
                <div className="input-field">
                  <label>State</label>
                  <input type="text" placeholder="e.g. Maharashtra" value={billingAddress.state} onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })} />
                </div>
              </div>
            </div>

            {/* GST Section */}
            <div className="gst-section">
              <label className="gst-toggle">
                <input type="checkbox" checked={useGst} onChange={() => setUseGst(!useGst)} />
                <span>Use GST for this booking (Optional)</span>
              </label>
              {useGst && (
                <div className="gst-inputs input-grid">
                  <input type="text" placeholder="Registration Number" />
                  <input type="text" placeholder="Company Name" />
                  <input type="text" placeholder="Company Address" />
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="review-sidebar">
            {/* Fare Summary */}
            <div className="fare-summary-card">
              <h3>Fare Summary</h3>
              <div className="fare-row">
                <span>Base Fare ({travellers.length} Traveller)</span>
                <span>₹{(fare.baseFare * travellers.length).toLocaleString()}</span>
              </div>
              <div className="fare-row">
                <span>Taxes & Fees</span>
                <span>₹{(fare.taxes * travellers.length).toLocaleString()}</span>
              </div>
              {seatTotalPrice > 0 && (
                <div className="fare-row perk">
                  <span>Seat Selection</span>
                  <span>₹{seatTotalPrice.toLocaleString()}</span>
                </div>
              )}
              {cancellationPlan !== 'none' && (
                <div className="fare-row perk">
                  <span>Free Cancellation</span>
                  <span>₹{((cancellationPlan === 'basic' ? 919 : 1219) * travellers.length).toLocaleString()}</span>
                </div>
              )}
              <div className="fare-total">
                <span>Total Amount</span>
                <strong>₹{(fare.total * travellers.length + seatTotalPrice + (cancellationPlan === 'basic' ? 919 : cancellationPlan === 'flex' ? 1219 : 0) * travellers.length).toLocaleString()}</strong>
              </div>
            </div>

            {/* Offers */}
            <div className="offers-card">
              <h3>Offers & Promo Codes</h3>
              <div className="promo-input">
                <input type="text" placeholder="Enter promo code" />
                <button>APPLY</button>
              </div>
              <div className="offers-list">
                <div className="offer-item">
                  <input type="radio" name="offer" id="off1" />
                  <label htmlFor="off1">
                    <strong>GOAIRNEW</strong>
                    <span>Flat ₹500 OFF on your first flight</span>
                  </label>
                </div>
                <div className="offer-item">
                  <input type="radio" name="offer" id="off2" />
                  <label htmlFor="off2">
                    <strong>UPIPROMO</strong>
                    <span>Get up to ₹1000 cashback on UPI payments</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Bar */}
      <div className="bottom-sticky-bar">
        <div className="container bar-content">
          <div className="price-info">
            <span className="label">Total Price</span>
            <span className="price">
              ₹{(
                fare.total * travellers.length +
                (cancellationPlan === 'basic' ? 899 : cancellationPlan === 'flex' ? 1219 : 0) * travellers.length +
                selectedSeats.reduce((acc, s) => acc + (s.price || 0), 0) +
                selectedMeals.reduce((acc, m) => acc + (m.price || 0), 0) -
                600
              ).toLocaleString()}
            </span>
          </div>
          <div className="bar-actions">
            <button className="lock-price-btn" onClick={handlePriceLock}>
              <Clock size={16} /> Lock Price @ ₹249
            </button>
            <button className="continue-btn" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Review Details Drawer */}
      <div className={`review-details-drawer-overlay ${showReviewDrawer ? 'open' : ''}`} onClick={() => setShowReviewDrawer(false)}>
        <div className="review-details-drawer" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h2>Review Details</h2>
            <p>Please ensure that your name matches your govt. ID such as Aadhaar, Passport or Driver's License</p>
          </div>

          <div className="drawer-content">
            {travellers.map((t, idx) => (
              <div key={t.id} className="traveller-summary-box">
                <span className="traveller-label">Adult {idx + 1}</span>
                <div className="summary-row">
                  <span className="label">Title</span>
                  <span className="value">{t.title}</span>
                </div>
                <div className="summary-row">
                  <span className="label">First & Middle Name</span>
                  <span className="value">{t.firstName}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Last Name</span>
                  <span className="value">{t.lastName}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Nationality</span>
                  <span className="value">{t.nationality}</span>
                </div>
              </div>
            ))}

            <div className="contact-summary-box">
              <span className="traveller-label">Contact Details</span>
              <div className="summary-row">
                <span className="label">Mobile</span>
                <span className="value">{contactInfo.countryCode} {contactInfo.phone}</span>
              </div>
              <div className="summary-row">
                <span className="label">Email</span>
                <span className="value">{contactInfo.email}</span>
              </div>
            </div>
          </div>

          <div className="drawer-footer">
            <button className="edit-btn" onClick={() => setShowReviewDrawer(false)}>Edit</button>
            <button className="confirm-btn" onClick={handleDetailsConfirmed}>Confirm</button>
          </div>
        </div>
      </div>

      <SeatSelectionModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        flightId={session?.flightId?._id}
        passengers={travellers}
        onSelectionComplete={handleSeatSelectionComplete}
        session={session}
      />
    </div>
  );
};

export default FlightReviewPage;
