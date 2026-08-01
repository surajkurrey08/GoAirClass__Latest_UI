import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download, Share2, Home, Calendar, MapPin, User, Ticket, Bus, Plane, Star, Utensils, Hotel } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Success.css'
import { getTripDetails } from '../services/hotelApi'
import dayjs from 'dayjs'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'bus';
  const pnrFromUrl = queryParams.get('pnr');

  const [visible, setVisible] = useState(false)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    if (pnrFromUrl) {
      if (type === 'hotel') {
        fetchHotelBooking();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    return () => clearTimeout(t)
  }, [pnrFromUrl, type])

  const fetchHotelBooking = async () => {
    try {
      let realTripId = pnrFromUrl;
      try {
        if (pnrFromUrl && !pnrFromUrl.startsWith('Q')) {
          realTripId = atob(pnrFromUrl);
        }
      } catch (e) {
        realTripId = pnrFromUrl;
      }
      const res = await getTripDetails(realTripId);
      if (res.success && res.data) {
        const apiData = res.data;
        setBooking({
          isHotel: true,
          hotelName: apiData.hotelDetail?.name || 'Hotel Booking',
          voucherNumber: apiData.bookingInfo?.voucherNumber || 'N/A',
          bookingStatus: apiData.bookingInfo?.bookingStatus || 'Confirmed',
          checkInDate: apiData.hotelDetail?.checkInDate,
          checkOutDate: apiData.hotelDetail?.checkOutDate,
          hotelAddress: apiData.hotelDetail?.address || apiData.hotelDetail?.city || 'India',
          roomType: apiData.rooms?.[0]?.roomTypeName || 'Deluxe Room',
          guestsCount: apiData.rooms?.[0]?.guests?.adults || 2,
          guestName: `${apiData.contactDetail?.title || 'Mr.'} ${apiData.contactDetail?.firstName || ''} ${apiData.contactDetail?.lastName || ''}`,
          guestEmail: apiData.contactDetail?.email || '',
          guestPhone: apiData.contactDetail?.mobile || '',
          paymentType: apiData.paymentDetail?.paymentType || 'Online',
          paymentStatus: apiData.paymentDetail?.status || 'SUCCESS',
          totalAmount: parseFloat(apiData.pricing?.totalFare || apiData.paymentDetail?.amount || 0),
          baseFare: parseFloat(apiData.pricing?.roomRate || apiData.paymentDetail?.amount || 0),
          taxes: parseFloat(apiData.pricing?.hotelTaxes || 0),
          discount: parseFloat(apiData.pricing?.discount || 0)
        });
      }
    } catch (err) {
      console.error("Failed to fetch hotel booking details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '26-Apr-26';
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isFlight = type === 'flight';
  const bookingRef = pnrFromUrl || 'GOAIR' + Math.random().toString(36).substr(2, 6).toUpperCase();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-outfit">
      <Navbar />
      <div className="pt-24 pb-12 px-4 flex flex-col items-center">

        {/* Success Animation Header */}
        <div className={`text-center mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Confirmed! 🎉</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Your {isFlight ? 'flight' : 'trip'} is all set. Have a wonderful journey!</p>
        </div>

        {/* Premium E-Ticket Container */}
        <div className={`w-full max-w-4xl transition-all duration-1000 delay-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden relative border border-slate-100">

            {/* Ticket Top Banner */}
            <div className={`bg-gradient-to-r ${booking?.isHotel ? 'from-orange-600 via-orange-500 to-amber-500' : (isFlight ? 'from-blue-600 via-indigo-500 to-purple-500' : 'from-red-600 via-red-500 to-orange-500')} px-8 py-6 flex justify-between items-center text-white`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  {booking?.isHotel ? <Hotel size={28} /> : (isFlight ? <Plane size={28} /> : <Bus size={28} />)}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight leading-none">{booking?.isHotel ? 'Hotel Booking' : 'E-Ticket'}</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">100% Confirmed Booking</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <Star size={12} fill="white" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Verified Booking</span>
                </div>
                <div className={`bg-gradient-to-br ${booking?.isHotel ? 'from-orange-400 to-orange-600' : (isFlight ? 'from-blue-400 to-indigo-600' : 'from-orange-400 to-orange-600')} p-0.5 rounded-2xl shadow-lg`}>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[14px] px-6 py-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">{booking?.isHotel ? 'Voucher Number' : 'PNR Number'}</p>
                    <p className="text-xl font-black tracking-widest leading-none">{booking?.isHotel ? booking.voucherNumber : bookingRef}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="flex flex-col md:flex-row">
              {/* Main Info Area */}
              <div className="flex-1 p-8 md:border-r border-slate-100">
                {booking?.isHotel ? (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-orange-500 border border-slate-100">
                          <Hotel size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">{booking.hotelName}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID: {pnrFromUrl?.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</p>
                        <p className="text-xs font-black text-emerald-600 mt-1 uppercase tracking-wider">{booking.bookingStatus}</p>
                      </div>
                    </div>

                    {/* Stay Duration */}
                    <div className="flex items-center justify-between gap-4 mb-10 px-4">
                      <div className="text-center md:text-left">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{formatDate(booking.checkInDate)}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Check-in Date</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full border-2 border-orange-500 bg-white"></div>
                          <div className="flex-1 border-t-2 border-dashed border-slate-200"></div>
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{formatDate(booking.checkOutDate)}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Check-out Date</p>
                      </div>
                    </div>

                    {/* Two Column Info */}
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Guests Details</h5>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none">{booking.guestName}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{booking.guestPhone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room details</h5>
                          <p className="text-sm font-black text-slate-800 leading-tight">{booking.roomType}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{booking.guestsCount} Adults</p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hotel Address</h5>
                          <p className="text-xs font-semibold text-slate-500 leading-normal">{booking.hotelAddress}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center ${isFlight ? 'text-blue-500' : 'text-red-500'} border border-slate-100`}>
                          {isFlight ? <Plane size={20} /> : <Bus size={20} />}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">{isFlight ? (booking?.flightDetails?.airline || booking?.airlineName || "SkyJet Airways") : (booking?.busName || "Travel Express")}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID: {booking?._id?.slice(-10).toUpperCase() || "1234567890"}</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Order ID</p>
                        <p className="text-xs font-black text-slate-700 mt-1 uppercase tracking-wider">{booking?.bookingId?.slice(-10).toUpperCase() || "ABCD123456"}</p>
                      </div>
                    </div>

                    {/* Journey Path */}
                    <div className="flex items-center justify-between gap-4 mb-10 px-4">
                      <div className="text-center md:text-left">
                        <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{isFlight ? (booking?.flightDetails?.departureCity || "DEL") : (booking?.fromCity || "Bhosari")}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Departure</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="w-full flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full border-2 ${isFlight ? 'border-blue-500' : 'border-red-500'} bg-white`}></div>
                          <div className="flex-1 border-t-2 border-dashed border-slate-200"></div>
                          <div className={`w-2 h-2 rounded-full ${isFlight ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {formatDate(isFlight ? booking?.flightDetails?.departureTime : booking?.travelDate)} • {isFlight ? dayjs(booking?.flightDetails?.departureTime).format('HH:mm') : booking?.departureTime || "10:30 PM"}
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{isFlight ? (booking?.flightDetails?.arrivalCity || "BOM") : (booking?.toCity || "Shivaji Chowk")}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Arrival</p>
                      </div>
                    </div>

                    {/* Two Column Info */}
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Passengers</h5>
                        {booking?.passengers?.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.firstName || 'User'}`} alt="p" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 leading-none">{p.firstName} {p.lastName}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                {isFlight ? `Seat: ${p.seatNumber || '6A'}` : `Age: ${p.age || 28} • ${p.gender || "Male"}`}
                              </p>
                            </div>
                            {isFlight && (
                              <div className="ml-auto text-right">
                                <Utensils size={14} className="text-slate-300 ml-auto" />
                                <p className="text-[10px] font-black text-slate-800 mt-1 uppercase">Meal: {p.meal || 'Standard'}</p>
                              </div>
                            )}
                          </div>
                        ))}
                        {!booking.passengers && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 leading-none">Guest User</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{isFlight ? 'Seat: 6A' : 'Age: 28 • Male'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isFlight ? 'Terminal' : 'Dropping Details'}</h5>
                          <p className="text-sm font-black text-slate-800 leading-tight">{isFlight ? (booking?.flightDetails?.terminal || 'Terminal 3') : (booking?.droppingPoint || "Near Bhosari Bus Stand")}</p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isFlight ? 'Flight Type' : 'Bus Type'}</h5>
                          <p className="text-sm font-black text-slate-800 leading-tight">{isFlight ? (booking?.flightDetails?.aircraft || 'Airbus A320neo') : (booking?.busType || "Express A/C")}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar Area: Fare & QR */}
              <div className="w-full md:w-64 bg-slate-50/50 p-8 flex flex-col items-center">
                <div className="w-full bg-white rounded-2xl border border-slate-100 p-5 mb-8 shadow-sm">
                  {booking?.isHotel ? (
                    <>
                      <h5 className="text-sm font-black text-slate-800 mb-4 text-center">Price Details</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <span>Room Rate</span>
                          <span className="text-slate-800">₹{booking.baseFare?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <span>Taxes & Fees</span>
                          <span className="text-slate-800">₹{booking.taxes?.toLocaleString()}</span>
                        </div>
                        {booking.discount > 0 && (
                          <div className="flex justify-between text-xs font-bold text-green-600 uppercase tracking-wider">
                            <span>Discount</span>
                            <span>-₹{booking.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t-2 border-dashed border-slate-100 flex justify-between items-center mt-2">
                          <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total Paid</span>
                          <span className="text-xl font-black text-orange-600 tracking-tighter">₹{booking.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h5 className="text-sm font-black text-slate-800 mb-4 text-center">Fare Breakdown</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <span>Base Fare</span>
                          <span className="text-slate-800">₹{booking?.fareDetails?.baseFare?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <span>Taxes</span>
                          <span className="text-slate-800">₹{(booking?.fareDetails?.taxes || 0).toLocaleString()}</span>
                        </div>
                        {booking?.fareDetails?.seatFee > 0 && (
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span>Seat Fee</span>
                            <span className="text-slate-800">₹{booking.fareDetails.seatFee.toLocaleString()}</span>
                          </div>
                        )}
                        {booking?.fareDetails?.addons > 0 && (
                          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span>Addons</span>
                            <span className="text-slate-800">₹{booking.fareDetails.addons.toLocaleString()}</span>
                          </div>
                        )}
                        {booking?.fareDetails?.discount > 0 && (
                          <div className="flex justify-between text-xs font-bold text-green-600 uppercase tracking-wider">
                            <span>Discount</span>
                            <span>-₹{booking.fareDetails.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t-2 border-dashed border-slate-100 flex justify-between items-center mt-2">
                          <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total Fare</span>
                          <span className={`text-xl font-black ${isFlight ? 'text-blue-600' : 'text-green-600'} tracking-tighter`}>₹{booking?.fareDetails?.totalAmount?.toLocaleString() || "1575"}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* QR Code Visualization */}
                <div className="w-32 h-32 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GOAIRCLASS-${bookingRef}`}
                    alt="qr"
                    className="w-full h-full object-contain grayscale"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center px-4">Scan to Download Ticket / Verify</p>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className={`bg-slate-900 px-8 py-6 flex flex-wrap justify-between items-center gap-4`}>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-green-500/20 active:scale-95">
                  <Share2 size={14} /> Share via WhatsApp
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95">
                  <Ticket size={14} /> Email Ticket
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
              <div className="flex gap-4 items-center">
                <button onClick={() => navigate('/')} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white hover:bg-slate-700 transition-all border border-slate-700">
                  <Home size={18} />
                </button>
                <div className="h-8 w-px bg-slate-700 mx-2"></div>
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-red-500 transition-colors">Cancel Booking</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Support Info */}
        <div className="w-full max-w-4xl mt-6 px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest gap-4 opacity-80">
          <div className="flex gap-6">
            <span>Support : <span className="text-slate-600">+91 98765 43210</span></span>
            <span>Emergency: <span className="text-slate-600">+91 98765 43211</span></span>
            <span>support@goairclass.com</span>
          </div>
          <div>
            By using this ticket, you agree to our <span className="text-slate-600 hover:underline cursor-pointer">Terms & Conditions</span>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 border border-slate-100 hover:border-blue-200 transition-all active:scale-95"
          >
            Plan Another Trip →
          </button>
        </div>
      </div>
    </div>
  );
}
