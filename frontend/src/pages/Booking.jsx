import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { User, Mail, Phone, Calendar, CreditCard, CheckCircle, ChevronRight, MapPin, Bus, ShieldCheck, Info, Smartphone, Ticket, Tag, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { createPaymentOrder, createFinalBooking } from '../services/paymentService'
import { getAvailableCoupons, applyCoupon } from '../services/couponService'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import './Booking.css'

const steps = ['Traveller Details', 'Review & Pay']

export default function Booking() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()

    // Data from SeatSelection.jsx
    const {
        selectedSeats = [],
        selectedSeatDetails = [],
        totalPrice = 0,
        busId: stateBusId,
        operatorId: stateOperatorId,
        routeId: stateRouteId,
        busData: stateBusData,
        busName,
        busType,
        departureTime,
        arrivalTime,
        boardingPoint = '',
        droppingPoint = '',
        boardingTime,
        droppingTime,
        travelDate: stateTravelDate
    } = location.state || {}

    // Normalize bus data
    const busData = stateBusData || { 
        busName, 
        busType, 
        departureTime, 
        arrivalTime, 
        travelDate: stateTravelDate 
    }

    const type = searchParams.get('type') || 'bus'
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('upi')
    const [upiId, setUpiId] = useState('')

    // Coupon states
    const [couponCode, setCouponCode] = useState('')
    const [availableCoupons, setAvailableCoupons] = useState([])
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [applyingCoupon, setApplyingCoupon] = useState(false)

    // Passenger details
    const [passengers, setPassengers] = useState(
        selectedSeats.map(seatNo => {
            const seatDef = selectedSeatDetails.find(s => s.seatNo === seatNo);
            const isLadies = seatDef?.type === 'ladies' || 
                             seatDef?.type === 'ladies-sleeper' || 
                             seatDef?.isLadies === true ||
                             seatDef?.isNextToLady === true;
            const isWomenPreference = new URLSearchParams(window.location.search).get('women') === 'true';
            return {
                name: '',
                age: '',
                gender: (isLadies || isWomenPreference) ? 'Female' : 'Male',
                seatNumber: seatNo,
                isLadies
            };
        })
    )

    // Contact details
    const [contact, setContact] = useState({
        email: '',
        phone: '',
        state: ''
    })

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                // Use operatorId and routeId from state if available
                const data = await getAvailableCoupons(stateRouteId, stateOperatorId, totalPrice);
                if (data.success) {
                    setAvailableCoupons(data.coupons);
                }
            } catch (error) {
                console.error("Failed to fetch coupons:", error);
            }
        };
        if (totalPrice > 0) fetchCoupons();
    }, [stateRouteId, stateOperatorId, totalPrice]);

    const handleApplyCoupon = async (codeToApply = couponCode) => {
        if (!codeToApply) {
            toast.error("Please enter a coupon code");
            return;
        }
        setApplyingCoupon(true);
        try {
            const data = await applyCoupon(codeToApply, totalPrice, stateRouteId, stateOperatorId);
            if (data.success) {
                setAppliedCoupon(data.coupon);
                setDiscountAmount(data.discount);
                toast.success(`Coupon applied! You saved ₹${data.discount}`);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        toast.info("Coupon removed");
    };

    const taxes = Math.round((totalPrice - discountAmount) * 0.05) // 5% GST on discounted price
    const finalTotal = totalPrice - discountAmount + taxes

    const updatePassenger = (index, field, value) => {
        const newPassengers = [...passengers]
        newPassengers[index][field] = value
        setPassengers(newPassengers)
    }

    const validateForms = () => {
        for (const p of passengers) {
            if (!p.name || !p.age) {
                toast.error(`Please fill details for seat ${p.seatNumber}`)
                return false
            }
            if (p.isLadies && p.gender?.toLowerCase() !== 'female') {
                toast.error(`Seat ${p.seatNumber} is only for ladies. Please select Female gender.`);
                return false
            }
        }
        if (!contact.email || !contact.phone) {
            toast.error("Please fill contact details")
            return false
        }
        if (step === 1 && paymentMethod === 'upi' && !upiId) {
            toast.error("Please enter a valid UPI ID")
            return false
        }
        return true
    }

    const handleRazorpayPayment = async () => {
        if (!validateForms()) return

        setLoading(true)
        try {
            // 1. Create order on backend
            const orderRes = await createPaymentOrder({
                amount: finalTotal,
                notes: {
                    busId: stateBusId || busData?._id,
                    seats: selectedSeats.join(','),
                    scheduleId: id,
                    couponCode: appliedCoupon?.code
                }
            })

            if (!orderRes.success) throw new Error(orderRes.message)

            // 2. Open Razorpay Checkout
            const options = {
                key: orderRes.key,
                amount: orderRes.amount,
                currency: "INR",
                name: "GoAirClass",
                description: `Bus Booking - ${busData.busName || 'Premium Fleet'}`,
                image: "/logo_new.jpg",
                order_id: orderRes.orderId,
                handler: async function (response) {
                    // 3. Handle Success - Create Booking
                    try {
                        const bookingPayload = {
                            busId: stateBusId || busData?._id,
                            scheduleId: id,
                            passengerName: passengers[0].name,
                            passengerEmail: contact.email,
                            passengerMobile: contact.phone,
                            passengers,
                            contactDetails: contact,
                            travelDate: stateTravelDate || busData.travelDate || new Date().toLocaleDateString("en-CA"),
                            boardingPoint,
                            droppingPoint,
                            boarding: { point: boardingPoint, time: boardingTime || busData.departureTime },
                            dropping: { point: droppingPoint, time: droppingTime || busData.arrivalTime },
                            selectedSeats,
                            seatNumbers: selectedSeats,
                            baseFare: totalPrice,
                            commission: 0,
                            gst: taxes,
                            discount: discountAmount,
                            couponCode: appliedCoupon?.code,
                            totalFare: finalTotal,
                            totalAmount: finalTotal,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        }

                        const finalRes = await createFinalBooking(bookingPayload)
                        if (finalRes.success) {
                            toast.success("Booking Confirmed!")
                            navigate('/success', { state: { booking: finalRes.booking } })
                        }
                    } catch (err) {
                        toast.error(err.message || "Payment verified but booking failed.")
                    }
                },
                prefill: {
                    name: passengers[0].name,
                    email: contact.email,
                    contact: contact.phone,
                    method: paymentMethod === 'upi' ? 'upi' : undefined,
                    vpa: paymentMethod === 'upi' ? upiId : undefined
                },
                theme: {
                    color: "#ef4444"
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="booking-page">
            <Navbar />
            <div style={{ paddingTop: 68, background: '#f8fafc', minHeight: '100vh' }}>
                <div className="booking-header">
                    <div className="container">
                        <h1>Confirm Your Journey</h1>
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
                        <div className="booking-card animate-fadeInUp !bg-slate-900 !border-slate-800 !p-6 mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                                        🚌
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-xl leading-tight">{busData.busName || busData.operator?.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">{busData.busType}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">{new Date(stateTravelDate || busData.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full md:w-auto grid grid-cols-2 gap-4 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                                    <div className="relative">
                                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Boarding Point</p>
                                        <p className="text-white font-bold text-sm truncate">{boardingPoint}</p>
                                        <p className="text-red-400 font-black text-xs mt-1">{boardingTime || busData.departureTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Dropping Point</p>
                                        <p className="text-white font-bold text-sm truncate">{droppingPoint}</p>
                                        <p className="text-red-400 font-black text-xs mt-1">{droppingTime || busData.arrivalTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {step === 0 && (
                            <div className="space-y-6">
                                {passengers.map((p, idx) => (
                                    <div key={idx} className="booking-card animate-fadeInUp">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center font-black text-sm">
                                                {p.seatNumber}
                                            </div>
                                            <h2 className="!mb-0 text-lg">Passenger {idx + 1} Details</h2>
                                        </div>
                                        <div className="form-grid">
                                            <div className="form-group form-group--full">
                                                <label><User size={14} /> Full Name</label>
                                                <input className="form-input" placeholder="Enter full name" value={p.name} onChange={e => updatePassenger(idx, 'name', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label><Calendar size={14} /> Age</label>
                                                <input className="form-input" type="number" placeholder="Age" value={p.age} onChange={e => updatePassenger(idx, 'age', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Gender</label>
                                                <select className="form-input" value={p.gender} onChange={e => updatePassenger(idx, 'gender', e.target.value)}>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="booking-card animate-fadeInUp">
                                    <h2>Contact Information</h2>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label><Mail size={14} /> Email Address</label>
                                            <input className="form-input" type="email" placeholder="your@email.com" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label><Phone size={14} /> Phone Number</label>
                                            <input className="form-input" placeholder="+91 XXXXX XXXXX" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="booking-card animate-fadeInUp">
                                    <h2>Review Your Booking</h2>
                                    <div className="review-booking">
                                        <div className="review-section">
                                            <h3 className="flex items-center gap-2"><Bus size={18} className="text-red-500" /> Bus Details</h3>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="font-bold text-slate-800">{busData.busName || busData.operator?.name}</p>
                                                <p className="text-sm text-slate-500">{busData.busType}</p>
                                                <div className="mt-4 flex items-center gap-8">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Boarding</p>
                                                        <p className="text-sm font-bold">{boardingPoint}</p>
                                                        <p className="text-xs font-black text-red-500 mt-1">{boardingTime || busData.departureTime}</p>
                                                    </div>
                                                    <div className="w-px h-8 bg-slate-200"></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dropping</p>
                                                        <p className="text-sm font-bold">{droppingPoint}</p>
                                                        <p className="text-xs font-black text-red-500 mt-1">{droppingTime || busData.arrivalTime}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="review-section">
                                            <h3>Passenger Summary</h3>
                                            <div className="divide-y divide-slate-50">
                                                {passengers.map((p, i) => (
                                                    <div key={i} className="py-3 flex justify-between items-center">
                                                        <div>
                                                            <span className="text-sm font-bold text-slate-800">{p.name}</span>
                                                            <span className="ml-2 text-xs text-slate-500">{p.gender}, {p.age} yrs</span>
                                                        </div>
                                                        <span className="px-2 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded border border-red-100">SEAT {p.seatNumber}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="booking-card animate-fadeInUp">
                                    <h2 className="flex items-center gap-2"><CreditCard size={20} className="text-red-500" /> Payment Method</h2>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <button className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'upi' ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-white hover:border-slate-200'}`} onClick={() => setPaymentMethod('upi')}>
                                            <span className="text-2xl">📱</span>
                                            <span className="text-sm font-black uppercase tracking-widest">UPI ID</span>
                                        </button>
                                        <button className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'other' ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-white hover:border-slate-200'}`} onClick={() => setPaymentMethod('other')}>
                                            <span className="text-2xl">💳</span>
                                            <span className="text-sm font-black uppercase tracking-widest">Other Options</span>
                                        </button>
                                    </div>

                                    {paymentMethod === 'upi' && (
                                        <div className="mt-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 animate-fadeInUp flex flex-col items-center">
                                            <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6 relative group overflow-hidden">
                                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GoAirClassPayment" alt="QR Hint" className="w-full h-full opacity-50 grayscale" />
                                            </div>
                                            <div className="w-full max-w-sm">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block text-center">OR ENTER UPI ID (VPA)</label>
                                                <div className="relative">
                                                    <input className="form-input !pl-12 !py-4 !rounded-2xl !bg-white !border-2 focus:!border-red-500 transition-all text-center font-bold tracking-wide" placeholder="username@bank" value={upiId} onChange={e => setUpiId(e.target.value)} />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                                        <Smartphone size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="review-policy pt-6">
                                        <label className="policy-check">
                                            <input type="checkbox" defaultChecked />
                                            I agree to the Terms & Conditions and Cancellation Policy.
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="booking-nav">
                            {step > 0 && <button className="btn btn-outline" onClick={() => setStep(step - 1)} disabled={loading}>← Back</button>}
                            <button 
                                className={`px-10 py-4 bg-red-500 text-white rounded-2xl font-black transition-all flex items-center gap-3 ${loading ? 'opacity-50' : 'hover:bg-red-600 shadow-xl shadow-red-500/20'}`} 
                                style={{ marginLeft: 'auto' }} 
                                onClick={() => {
                                    if (step === 0) {
                                        // Check if user is logged in
                                        const token = localStorage.getItem('token');
                                        if (!token) {
                                            Swal.fire({
                                                title: 'Login Required',
                                                text: 'Please login or register to continue booking.',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText: 'Login',
                                                cancelButtonText: 'Register',
                                                confirmButtonColor: '#ef4444', // Red-500
                                                cancelButtonColor: '#3b82f6', // Blue-500
                                                reverseButtons: true
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    navigate('/login', { state: { from: location.pathname, bookingData: location.state } });
                                                } else if (result.dismiss === Swal.DismissReason.cancel) {
                                                    navigate('/register', { state: { from: location.pathname, bookingData: location.state } });
                                                }
                                            });
                                            return;
                                        }
                                        if (validateForms()) setStep(1);
                                    } else {
                                        handleRazorpayPayment();
                                    }
                                }} 
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : step === 1 ? `Pay ₹${finalTotal.toLocaleString()}` : 'Continue'} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Price Summary & Coupons */}
                    <aside className="price-summary">
                        {/* Coupon Section */}
                        <div className="coupon-section animate-fadeInUp">
                            <h3><Tag size={16} className="text-red-500" /> Offers & Coupons</h3>

                            {!appliedCoupon ? (
                                <>
                                    <div className="coupon-input-group">
                                        <input
                                            type="text"
                                            className="coupon-input"
                                            placeholder="Enter Code"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                        <button
                                            className="btn-apply"
                                            onClick={() => handleApplyCoupon()}
                                            disabled={applyingCoupon || !couponCode}
                                        >
                                            {applyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>

                                    {availableCoupons.length > 0 && (
                                        <div className="available-coupons">
                                            {availableCoupons.map(coupon => (
                                                <div
                                                    key={coupon._id}
                                                    className="coupon-card"
                                                    onClick={() => handleApplyCoupon(coupon.code)}
                                                >
                                                    <div>
                                                        <div className="coupon-card__code">{coupon.code}</div>
                                                        <div className="coupon-card__desc">
                                                            Save {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' FLAT'}
                                                        </div>
                                                    </div>
                                                    <div className="coupon-card__action">Apply</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="applied-coupon-badge">
                                    <div className="applied-coupon-info">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <CheckCircle size={16} />
                                        </div>
                                        <div>
                                            <div className="applied-coupon-text">{appliedCoupon.code} Applied</div>
                                            <div className="text-[10px] text-green-600 font-bold uppercase">₹{discountAmount} SAVED!</div>
                                        </div>
                                    </div>
                                    <button className="btn-remove-coupon" onClick={removeCoupon}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="price-summary__card !border-none !shadow-xl">
                            <h3 className="flex items-center gap-2"><ShieldCheck size={20} className="text-green-500" /> Price Details</h3>
                            <div className="price-line">
                                <span>Base Fare ({selectedSeats.length} Seats)</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="price-line">
                                    <span className="text-green-600 font-bold">Coupon Discount</span>
                                    <span className="text-green-600 font-bold">-₹{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="price-line">
                                <span>Taxes & Fees (GST 5%)</span>
                                <span>+₹{taxes.toLocaleString()}</span>
                            </div>

                            <div className="price-line price-line--total">
                                <span>Total Payable</span>
                                <span>₹{finalTotal.toLocaleString()}</span>
                            </div>

                            {discountAmount > 0 ? (
                                <div className="price-saving mt-6 flex items-center gap-3">
                                    <span className="text-lg">🎉</span>
                                    <span>Awesome! You saved ₹{discountAmount} on this booking.</span>
                                </div>
                            ) : (
                                <div className="price-saving mt-6 flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}>
                                    <span className="text-lg">🎁</span>
                                    <span>Apply a coupon to save more!</span>
                                </div>
                            )}
                        </div>

                        <div className="trust-badges">
                            <div className="trust-badge flex items-center gap-3 bg-blue-50/50 border-blue-100">
                                <Info size={16} className="text-blue-500" />
                                <span className="text-xs font-bold text-slate-600">Ticket will be sent to {contact.email || 'your email'}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </div>
    )
}
