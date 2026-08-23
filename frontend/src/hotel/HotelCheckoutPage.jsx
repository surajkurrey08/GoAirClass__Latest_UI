import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, ShieldCheck, Lock, CheckCircle2, ArrowLeft, Building2, User, Mail, Phone, AlertCircle, Clock, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';
import { provisionalBookHotel, confirmBookHotel } from '../services/hotelApi';
import { createPaymentOrder } from '../services/paymentService';

const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const getFutureDateString = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export default function HotelCheckoutPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect to login if user is not authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { 
                state: { 
                    from: location.pathname, 
                    bookingData: location.state 
                } 
            });
        }
    }, [navigate, location.pathname, location.state]);

    // Data passed from HotelDetailPage
    const bookingState = location.state || {};
    const {
        hotelId = '1352788',
        hotelName = 'Hotel Europe Plaza',
        hotelAddress = 'GATE NO 1, behind METRO, Charbagh, Lucknow',
        hotelImage = 'https://rukmini-ct.flixcart.com/w_2048,f_auto,q_auto/ct-hotel-images/places/hotels/cms/1352/1352788/images/8f492c64_z_proc.jpg',
        roomName = 'Standard Room with Window',
        roomImage = '',
        rateName = 'Room Only',
        bookingCode = '',
        searchId = '',
        checkIn = getTodayDateString(),
        checkOut = getFutureDateString(1),
        rooms = 1,
        guests = 2,
        baseFare = 2070,
        discount = -207,
        tax = 93.15,
        finalPrice = 1956.15,
        freeBreakfast = false,
        freeCancellation = false
    } = bookingState;

    // Guest details form state
    const [title, setTitle] = useState('Mr');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(true);

    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [bookingConfirmed, setBookingConfirmed] = useState(null);

    const getErrorMessage = (errVal) => {
        if (!errVal) return '';
        if (typeof errVal === 'object') {
            return errVal.message || errVal.error || JSON.stringify(errVal);
        }
        return String(errVal);
    };

    const handleSubmitProvisionalBook = async (e) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim() || !email.trim() || !mobile.trim()) {
            setError('Please fill in all required traveler details (First Name, Last Name, Email, Mobile).');
            return;
        }

        if (!agreeTerms) {
            setError('Please accept the booking terms and cancellation policy.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                hotelId,
                searchId: searchId || `sid-${Date.now()}`,
                bookingCode: bookingCode || 'kqqQAa9K/KIS/hOdpAepBhMj1DfMGQYg0zUwgsMilZlYFFwD+vvEJUkC9pKleTBJ',
                bookingAmount: finalPrice,
                checkIn,
                checkOut,
                rooms,
                guests,
                title,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                specialRequests
            };

            const result = await provisionalBookHotel(payload);

            if (result.success) {
                setBookingSuccess({
                    provisionalBookId: result.provisionalBookId || 'pb-8947291',
                    hotelName,
                    roomName,
                    guestName: `${title} ${firstName} ${lastName}`,
                    totalAmount: finalPrice
                });
            } else {
                setError(getErrorMessage(result.error) || 'Provisional room booking failed. Please try again.');
            }
        } catch (err) {
            console.error('Provisional booking error:', err);
            setError(getErrorMessage(err.response?.data?.error || err.response?.data) || err.message || 'Server error while blocking room.');
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirmBooking = async () => {
        if (!bookingSuccess?.provisionalBookId) return;
        setConfirming(true);
        setError('');
        try {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                throw new Error('Failed to load Razorpay payment gateway script. Please check your internet connection.');
            }

            // 1. Create order on backend
            const orderRes = await createPaymentOrder({
                amount: bookingSuccess.totalAmount,
                notes: {
                    hotelId,
                    hotelName,
                    roomName,
                    guestName: bookingSuccess.guestName,
                    provisionalBookId: bookingSuccess.provisionalBookId
                }
            });

            if (!orderRes.success) throw new Error(orderRes.message || 'Failed to create payment order');

            // 2. Open Razorpay checkout
            const options = {
                key: orderRes.key,
                amount: orderRes.amount,
                currency: orderRes.currency || 'INR',
                name: 'GoAirClass',
                description: `Hotel Reservation - ${hotelName}`,
                image: '/logo_new.jpg',
                order_id: orderRes.orderId,
                handler: async function (response) {
                    try {
                        const payload = {
                            provisionalBookId: bookingSuccess.provisionalBookId,
                            hotelId,
                            hotelName,
                            roomName,
                            guestName: bookingSuccess.guestName,
                            totalAmount: bookingSuccess.totalAmount,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };
                        const result = await confirmBookHotel(payload);
                        if (result.success) {
                            setBookingConfirmed({
                                tripId: result.tripId,
                                confirmationNumber: result.confirmationNumber,
                                hotelName,
                                roomName,
                                guestName: bookingSuccess.guestName,
                                totalAmount: bookingSuccess.totalAmount
                            });
                            setBookingSuccess(null);
                        } else {
                            setError(getErrorMessage(result.error) || 'Booking confirmation failed. Please contact support.');
                            setBookingSuccess(null);
                        }
                    } catch (err) {
                        console.error('Confirm booking error:', err);
                        setError(getErrorMessage(err.response?.data?.error || err.response?.data) || err.message || 'Server error while confirming booking.');
                        setBookingSuccess(null);
                    } finally {
                        setConfirming(false);
                    }
                },
                prefill: {
                    name: bookingSuccess.guestName,
                    email: email,
                    contact: mobile
                },
                theme: {
                    color: '#ff5a3d'
                },
                modal: {
                    ondismiss: function () {
                        setConfirming(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Payment error:', err);
            setError(getErrorMessage(err.response?.data?.error || err.response?.data) || err.message || 'Server error while opening payment gateway.');
            setConfirming(false);
        }
    };


    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] flex flex-col font-['InterRegular',Arial,sans-serif] text-[#13233f] antialiased">
            <main className="mx-auto w-full max-w-[1460px] flex-1 px-3 pb-10 pt-3 sm:px-4 sm:pt-4 lg:px-6">
                {/* Navigation Back */}
                <div className="mb-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[6px] border border-[#d8e1ec] bg-white px-3 text-[12px] font-extrabold text-[#244a82] shadow-sm transition hover:border-[#b8c8db] hover:bg-[#f6f9fd]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                </div>

                {/* Header Title */}
                <div className="mb-4 flex flex-col gap-3 rounded-[8px] border border-[#dfe6ef] bg-white p-4 shadow-[0_4px_14px_rgba(19,35,63,0.035)] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-[20px] font-extrabold leading-tight text-[#17243b] sm:text-[24px] font-['InterMedium',sans-serif]">
                            <Building2 className="h-5 w-5 text-[#ff650d] sm:h-6 sm:w-6" />
                            Guest Details & Room Lock
                        </h1>
                        <p className="mt-1 text-[11px] leading-5 text-[#6f7d91] sm:text-xs">
                            Complete your guest details to temporarily lock your room rate with Cleartrip.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 rounded-[6px] border border-[#cdeee1] bg-[#f2fbf7] px-3 py-1.5 text-[11px] font-bold text-[#177b55] sm:text-xs">
                        <Clock className="h-4 w-4" /> Room Hold: 15 Mins Guaranteed
                    </div>
                </div>

                {error && (
                    <div className="mb-4 flex items-start gap-2 rounded-[7px] border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12 xl:gap-5">
                    {/* Left Column: Traveler Details Form */}
                    <div className="space-y-4 xl:col-span-8">
                        <form onSubmit={handleSubmitProvisionalBook} className="overflow-hidden rounded-[8px] border border-[#dfe6ef] bg-white shadow-[0_5px_18px_rgba(19,35,63,0.05)]">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8edf4] bg-[#f8fbff] px-4 py-3.5 sm:px-5">
                                <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#17243b] font-['InterMedium',sans-serif]">
                                    <User className="h-4 w-4 text-[#1d4f91]" /> Primary Guest Information
                                </h2>
                                <span className="text-[10px] font-semibold text-[#8290a3]">* Required for Booking</span>
                            </div>

                            <div className="space-y-5 p-4 sm:p-5">
                                {/* Title, First Name, Last Name */}
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                                        <select
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full rounded-[6px] border border-[#d8e1ec] bg-white p-2.5 text-xs font-semibold text-[#22324e] outline-none transition focus:border-[#2f6fed] focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="Mr">Mr.</option>
                                            <option value="Mrs">Mrs.</option>
                                            <option value="Ms">Ms.</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter first name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full rounded-[6px] border border-[#d8e1ec] bg-white p-2.5 text-xs font-semibold text-[#22324e] outline-none transition focus:border-[#2f6fed] focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="sm:col-span-5">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter last name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full rounded-[6px] border border-[#d8e1ec] bg-white p-2.5 text-xs font-semibold text-[#22324e] outline-none transition focus:border-[#2f6fed] focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="e.g. john.doe@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-[6px] border border-[#d8e1ec] bg-white p-2.5 text-xs font-semibold text-[#22324e] outline-none transition focus:border-[#2f6fed] focus:ring-2 focus:ring-blue-100"
                                        />
                                        <span className="text-[10px] text-slate-400 mt-1 block">Your booking voucher & invoice will be sent here.</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5 text-slate-400" /> Mobile Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="10-digit mobile number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            className="w-full rounded-[6px] border border-[#d8e1ec] bg-white p-2.5 text-xs font-semibold text-[#22324e] outline-none transition focus:border-[#2f6fed] focus:ring-2 focus:ring-blue-100"
                                        />
                                        <span className="text-[10px] text-slate-400 mt-1 block">For SMS check-in updates and hotel alerts.</span>
                                    </div>
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Special Requests (Optional)</label>
                                    <textarea
                                        rows="2"
                                        placeholder="e.g., High floor room, Late check-in, Quiet room"
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                        className="w-full resize-none rounded-[6px] border border-[#d8e1ec] bg-white p-2.5 text-xs font-semibold text-[#22324e] outline-none transition focus:border-[#2f6fed] focus:ring-2 focus:ring-blue-100"
                                    ></textarea>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="pt-2 border-t border-slate-200 flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="agree"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded-[3px] border-slate-300 text-[#ff650d] focus:ring-[#ff650d]"
                                    />
                                    <label htmlFor="agree" className="text-xs text-slate-600 leading-tight">
                                        I accept GoAirClass and hotel property policies, check-in ID guidelines, and cancellation terms.
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-[#ff650d] px-6 py-3.5 text-sm font-extrabold uppercase text-white shadow-[0_6px_16px_rgba(255,101,13,0.20)] transition hover:bg-[#ef5700] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Holding Room with Cleartrip...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-4 w-4" /> Lock Room & Proceed to Pay (₹{Math.round(finalPrice).toLocaleString('en-IN')})
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Security Guarantees */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-2.5 rounded-[7px] border border-[#dfe6ef] bg-white p-3 shadow-[0_3px_10px_rgba(19,35,63,0.025)]">
                                <ShieldCheck className="h-6 w-6 text-[#1d4f91] shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-slate-800">100% Safe & Secure</div>
                                    <div className="text-[10px] text-slate-500">256-Bit SSL Encrypted</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-[7px] border border-[#dfe6ef] bg-white p-3 shadow-[0_3px_10px_rgba(19,35,63,0.025)]">
                                <Sparkles className="h-6 w-6 text-[#ff5a3d] shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-slate-800">Instant Confirmation</div>
                                    <div className="text-[10px] text-slate-500">Cleartrip B2B Hold</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 rounded-[7px] border border-[#dfe6ef] bg-white p-3 shadow-[0_3px_10px_rgba(19,35,63,0.025)]">
                                <Clock className="h-6 w-6 text-emerald-600 shrink-0" />
                                <div>
                                    <div className="text-xs font-bold text-slate-800">Price Guarantee</div>
                                    <div className="text-[10px] text-slate-500">No hidden charges</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking & Price Summary */}
                    <div className="space-y-4 xl:col-span-4 xl:sticky xl:top-4">
                        <div className="overflow-hidden rounded-[8px] border border-[#dfe6ef] bg-white shadow-[0_5px_18px_rgba(19,35,63,0.05)]">
                            {/* Summary Header */}
                            <div className="flex items-center justify-between border-b border-[#e8edf4] bg-[#f8fbff] px-4 py-3 text-xs font-bold text-[#17243b] font-['InterMedium',sans-serif]">
                                <span>Booking Summary</span>
                                <span className="rounded-[4px] bg-[#fff3e9] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#ef6b1d]">Cleartrip B2B</span>
                            </div>

                            {/* Hotel Details Card */}
                            <div className="p-4 space-y-3.5">
                                <div className="flex gap-3">
                                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-[6px] border border-[#dfe6ef] bg-slate-100">
                                        <img src={roomImage || hotelImage} alt={hotelName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="break-words text-sm font-extrabold leading-5 text-[#17243b] font-['InterMedium',sans-serif]">{hotelName}</h3>
                                        <p className="flex items-start gap-1 text-[11px] leading-4 text-[#6f7d91]">
                                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" /> {hotelAddress}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 rounded-[6px] border border-[#e8edf4] bg-[#f8fbff] p-2.5">
                                    <div className="text-xs font-extrabold text-slate-900">{roomName}</div>
                                    <div className="inline-block rounded-[4px] border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-[#1d4f91]">
                                        Plan: {rateName}
                                    </div>
                                </div>

                                {/* Dates & Guests */}
                                <div className="grid grid-cols-1 gap-3 border-y border-[#edf1f5] py-2 text-xs sm:grid-cols-2">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Check-In</span>
                                        <span className="font-bold text-slate-800 flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-slate-400" /> {checkIn}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Check-Out</span>
                                        <span className="font-bold text-slate-800 flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-slate-400" /> {checkOut}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-600">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5 text-slate-400" /> Guests & Rooms:
                                    </span>
                                    <span className="font-bold text-slate-900">{rooms} Room(s), {guests} Guest(s)</span>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="pt-3 border-t border-slate-200 space-y-2">
                                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">Price Breakdown</div>
                                    
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Room Base Fare</span>
                                        <span className="font-medium">₹{Math.round(baseFare).toLocaleString('en-IN')}</span>
                                    </div>

                                    {Math.abs(discount) > 0 && (
                                        <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                                            <span>Monsoon Discount (10% OFF)</span>
                                            <span>-₹{Math.abs(Math.round(discount)).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Taxes & Service Fees</span>
                                        <span className="font-medium">₹{Math.round(tax).toLocaleString('en-IN')}</span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                                        <span>Total Amount</span>
                                        <span className="whitespace-nowrap text-lg font-black text-[#ff650d]">₹{Math.round(finalPrice).toLocaleString('en-IN')}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 text-right block leading-none">Inclusive of all taxes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Step 1: Provisional Booking Success Modal */}
            {bookingSuccess && (
                <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md space-y-0 overflow-hidden rounded-[10px] border border-[#dfe6ef] bg-white p-5 text-center shadow-2xl sm:p-6">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="h-8 w-8 text-emerald-600" />
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-900 font-['InterMedium',sans-serif]">
                            Room Temporarily Held!
                        </h3>
                        <p className="mt-1 text-[11px] leading-5 text-[#6f7d91] sm:text-xs">
                            Cleartrip has held your room for 15 minutes. Complete payment to finalize booking.
                        </p>

                        <div className="my-4 space-y-1.5 rounded-[7px] border border-[#e3e8f0] bg-[#f8fbff] p-3.5 text-left text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Provisional ID:</span>
                                <span className="font-bold text-slate-900">{bookingSuccess.provisionalBookId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Hotel:</span>
                                <span className="font-bold text-slate-900 truncate max-w-[180px]">{bookingSuccess.hotelName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Guest:</span>
                                <span className="font-bold text-slate-900">{bookingSuccess.guestName}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                                <span className="text-slate-700">Total Amount:</span>
                                <span className="text-[#ff5a3d] text-sm">₹{Math.round(bookingSuccess.totalAmount).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleConfirmBooking}
                                disabled={confirming}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#ff650d] py-3 text-xs font-bold uppercase text-white transition hover:bg-[#ef5700] disabled:opacity-50"
                            >
                                {confirming ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing Payment...
                                    </>
                                ) : (
                                    <>Pay & Confirm Booking</>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setBookingSuccess(null);
                                    navigate('/');
                                }}
                                disabled={confirming}
                                className="w-full cursor-pointer rounded-[6px] border border-[#d8e1ec] bg-white py-2.5 text-xs font-bold uppercase text-[#44536b] transition hover:bg-[#f6f9fd]"
                            >
                                Cancel & Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Final Booking Confirmed Modal */}
            {bookingConfirmed && (
                <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md space-y-0 overflow-hidden rounded-[10px] border border-[#dfe6ef] bg-white p-5 text-center shadow-2xl sm:p-6">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-900 font-['InterMedium',sans-serif]">
                            Booking Confirmed!
                        </h3>
                        <p className="mt-1 text-[11px] leading-5 text-[#6f7d91] sm:text-xs">
                            Your reservation is guaranteed. A voucher has been sent to your email.
                        </p>

                        <div className="my-4 space-y-1.5 rounded-[7px] border border-[#e3e8f0] bg-[#f8fbff] p-3.5 text-left text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Trip ID:</span>
                                <span className="font-bold text-emerald-600">{bookingConfirmed.tripId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Confirmation No:</span>
                                <span className="font-bold text-slate-900">{bookingConfirmed.confirmationNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Hotel:</span>
                                <span className="font-bold text-slate-900 truncate max-w-[180px]">{bookingConfirmed.hotelName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Guest:</span>
                                <span className="font-bold text-slate-900">{bookingConfirmed.guestName}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                                <span className="text-slate-700">Paid Amount:</span>
                                <span className="text-[#ff5a3d] text-sm">₹{Math.round(bookingConfirmed.totalAmount).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setBookingConfirmed(null);
                                navigate('/');
                            }}
                            className="w-full cursor-pointer rounded-[6px] bg-[#1d4f91] py-3 text-xs font-bold uppercase text-white transition hover:bg-[#173f74]"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}