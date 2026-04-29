
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ShieldCheck, Lock, CreditCard,
    Smartphone, Landmark, Wallet, Banknote,
    QrCode, CheckCircle2, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getSessionDetails } from '../../services/flightApi';
import { createPaymentOrder, verifyPayment, getBookingDetails } from '../../services/paymentService';
import dayjs from 'dayjs';
import './FlightPaymentPage.css';

const FlightPaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('sessionId');
    const bookingId = queryParams.get('bookingId');

    const [session, setSession] = useState(null);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('UPI');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!sessionId || !bookingId) {
            navigate('/flights');
            return;
        }
        fetchData();
        loadRazorpayScript();
    }, [sessionId, bookingId]);

    const loadRazorpayScript = () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    };

    const fetchData = async () => {
        try {
            const [sessionRes, bookingRes] = await Promise.all([
                getSessionDetails(sessionId),
                getBookingDetails(bookingId)
            ]);

            if (sessionRes.success) setSession(sessionRes.session);
            if (bookingRes.success) setBooking(bookingRes.booking);
        } catch (err) {
            toast.error("Failed to load payment details");
            navigate('/flights');
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!session || !booking) return;
        setIsProcessing(true);

        try {
            const totalAmount = booking.fareDetails.totalAmount;
            const orderRes = await createPaymentOrder({
                amount: totalAmount,
                currency: 'INR',
                receipt: `rcpt_${bookingId}`
            });

            if (!orderRes.success) throw new Error("Order creation failed");

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_5Wf3Xf3Xf3Xf3X',
                amount: orderRes.order.amount,
                currency: orderRes.order.currency,
                name: 'GoAirClass',
                description: `Flight Booking - ${booking.flightDetails.departureCity} to ${booking.flightDetails.arrivalCity}`,
                order_id: orderRes.order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: bookingId
                        });

                        if (verifyRes.success) {
                            toast.success("Payment Successful!");
                            navigate(`/success?type=flight&pnr=${verifyRes.pnr}`);
                        } else {
                            toast.error("Payment verification failed");
                        }
                    } catch (err) {
                        toast.error(err.message);
                    }
                },
                prefill: {
                    name: `${booking.passengers[0]?.firstName} ${booking.passengers[0]?.lastName}`,
                    email: booking.contactDetails?.email || '',
                    contact: booking.contactDetails?.phone || ''
                },
                theme: { color: '#f97316' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>;
    if (!session || !booking) return null;

    const flight = booking.flightDetails;
    const fare = booking.fareDetails;
    const passengers = booking.passengers;

    return (
        <div className="payment-page-v2">
            <Navbar />

            <div className="payment-container">
                {/* Left Side: Tabs and Content */}
                <div className="payment-main-area">
                    <div className="payment-tabs-sidebar">
                        <div className={`pay-tab ${activeTab === 'Recommended' ? 'active' : ''}`} onClick={() => setActiveTab('Recommended')}>
                            <CheckCircle2 className="icon" size={18} />
                            <span>Recommended</span>
                        </div>
                        <div className={`pay-tab ${activeTab === 'UPI' ? 'active' : ''}`} onClick={() => setActiveTab('UPI')}>
                            <Smartphone className="icon" size={18} />
                            <span>Pay via any UPI app</span>
                        </div>
                        <div className={`pay-tab ${activeTab === 'Card' ? 'active' : ''}`} onClick={() => setActiveTab('Card')}>
                            <CreditCard className="icon" size={18} />
                            <span>Credit/Debit Card</span>
                        </div>
                        <div className={`pay-tab ${activeTab === 'NetBanking' ? 'active' : ''}`} onClick={() => setActiveTab('NetBanking')}>
                            <Landmark className="icon" size={18} />
                            <span>Net Banking</span>
                        </div>
                        <div className={`pay-tab ${activeTab === 'Wallets' ? 'active' : ''}`} onClick={() => setActiveTab('Wallets')}>
                            <Wallet className="icon" size={18} />
                            <span>Wallets</span>
                        </div>
                    </div>

                    <div className="payment-tab-content">
                        {activeTab === 'UPI' && (
                            <div className="upi-pay-box">
                                <h2 className="text-xl font-bold mb-6">Scan & Pay with UPI</h2>
                                <div className="qr-placeholder">
                                    <QrCode size={80} color="#cbd5e1" />
                                    <span>Click below to generate QR</span>
                                </div>
                                <button className="generate-qr-btn">Generate QR</button>

                                <div className="upi-apps-row">
                                    <img src="https://img.icons8.com/color/48/000000/google-pay-india.png" className="upi-app-icon" alt="GPay" />
                                    <img src="https://img.icons8.com/color/48/000000/phonepe.png" className="upi-app-icon" alt="PhonePe" />
                                    <img src="https://img.icons8.com/color/48/000000/paytm.png" className="upi-app-icon" alt="Paytm" />
                                </div>
                            </div>
                        )}

                        {activeTab !== 'UPI' && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Info size={48} className="mb-4" />
                                <p className="text-lg">This method is available via Razorpay checkout.</p>
                            </div>
                        )}

                        <button
                            className="final-pay-btn"
                            disabled={isProcessing}
                            onClick={handleRazorpayPayment}
                        >
                            {isProcessing ? 'Processing...' : `Pay ₹${fare?.totalAmount?.toLocaleString() || 0}`}
                        </button>
                    </div>
                </div>

                {/* Right Side: Sidebar */}
                <div className="payment-sidebar">
                    <div className="sidebar-card">
                        <h3>Fare Summary</h3>
                        <div className="amount-box">
                            <span className="amount-label">
                                <ShieldCheck size={16} color="#16a34a" /> Amount To Be Paid
                            </span>
                            <span className="total-price">₹{fare?.totalAmount?.toLocaleString() || 0}</span>
                            <span className="text-[10px] text-slate-400 font-medium">(₹519 Conv. fee included)</span>
                        </div>
                        <div className="savings-tag">
                            🤩 Yay! You saved ₹1,426 on this booking
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <h3>Your Flight <span className="text-[10px] text-slate-400 uppercase font-normal">One Way</span></h3>
                        <div className="mini-flight-card">
                            <div className="font-bold text-xs mb-2">
                                {dayjs(flight.departureTime).format('ddd, DD MMM')} • {flight.airline?.name || 'Airline'}
                            </div>
                            <div className="flight-route-mini">
                                <span>{dayjs(flight.departureTime).format('HH:mm')}</span>
                                <span className="text-slate-300">→</span>
                                <span>{dayjs(flight.arrivalTime).format('HH:mm')}</span>
                                <span className="ml-auto text-slate-400 font-medium">{flight.from} - {flight.to}</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-[11px] uppercase text-slate-400 font-bold mb-3">Travellers</h4>
                            <div className="flex flex-col gap-2">
                                {passengers.map((p, i) => (
                                    <div key={i} className="text-xs font-bold text-slate-700">
                                        {i + 1}. {p.title} {p.firstName} {p.lastName}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="trust-badges">
                        <span className="safe-text">100% Safe Payment Process</span>
                        <div className="badge-icons">
                            <img src="https://img.icons8.com/color/48/000000/visa.png" width="30" alt="Visa" />
                            <img src="https://img.icons8.com/color/48/000000/mastercard.png" width="30" alt="MC" />
                            <img src="https://img.icons8.com/color/48/000000/amex.png" width="30" alt="Amex" />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default FlightPaymentPage;
