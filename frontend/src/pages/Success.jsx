import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Download, Share2, Home, Calendar, MapPin, User, Ticket, Bus, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Success.css'

export default function Success() {
  const navigate = useNavigate()
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  const { booking = {} } = location.state || {}
  const bookingRef = booking.pnrNumber || 'GO' + Math.random().toString(36).substr(2, 8).toUpperCase()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const formatDate = (date) => {
    if (!date) return '26-Apr-26';
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
          <p className="text-slate-500 font-medium mt-2 text-lg">Your trip is all set. Have a wonderful journey!</p>
        </div>

        {/* Premium E-Ticket Container */}
        <div className={`w-full max-w-4xl transition-all duration-1000 delay-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden relative border border-slate-100">

            {/* Ticket Top Banner */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-8 py-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Bus size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight leading-none">E-Ticket</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">100% Confirmed Booking</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <Star size={12} fill="white" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Verified Ticket</span>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-0.5 rounded-2xl shadow-lg">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[14px] px-6 py-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">PNR Number</p>
                    <p className="text-xl font-black tracking-widest leading-none">{bookingRef}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="flex flex-col md:flex-row">
              {/* Main Info Area */}
              <div className="flex-1 p-8 md:border-r border-slate-100">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-red-500 border border-slate-100">
                      <Bus size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{booking.busName || "Travel Express"}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID: {booking._id?.slice(-10).toUpperCase() || "1234567890"}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Order ID</p>
                    <p className="text-xs font-black text-slate-700 mt-1 uppercase tracking-wider">{booking.orderId?.slice(-10).toUpperCase() || "ABCD123456"}</p>
                  </div>
                </div>

                {/* Journey Path */}
                <div className="flex items-center justify-between gap-4 mb-10 px-4">
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{booking.fromCity || "Bhosari"}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Departure</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full border-2 border-red-500 bg-white"></div>
                      <div className="flex-1 border-t-2 border-dashed border-slate-200"></div>
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                    <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {formatDate(booking.travelDate)} • {booking.departureTime || "10:30 PM"}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{booking.toCity || "Shivaji Chowk"}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Arrival</p>
                  </div>
                </div>

                {/* Two Column Info */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Passengers</h5>
                    {booking.passengers?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name || 'User'}`} alt="p" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none">{p.name || "Ajay"}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Age: {p.age || 28} • {p.gender || "Male"}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter leading-none mb-1">Seat</p>
                          <p className="text-sm font-black text-slate-800 leading-none">{booking.seatNumbers?.[idx] || "S5"}</p>
                        </div>
                      </div>
                    ))}
                    {!booking.passengers && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none">Guest User</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Age: 28 • Male</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter leading-none mb-1">Seat</p>
                          <p className="text-sm font-black text-slate-800 leading-none">{booking.seatNumbers?.[0] || "S5"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dropping Details</h5>
                      <p className="text-sm font-black text-slate-800 leading-tight">{booking.busName || "Travel Express"}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-1">{booking.droppingPoint || "Near Bhosari Bus Stand"}</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bus Type</h5>
                      <p className="text-sm font-black text-slate-800 leading-tight">{booking.busNumber || "MH12 AB 1234"}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-1">{booking.busType || "Express A/C"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bus Operator</h5>
                  <p className="text-sm font-black text-slate-800 leading-tight">{booking.operatorName || booking.busName || "Travel Express Office"}, <span className="text-[10px] font-normal text-slate-500">Near Bhosari Bus Stand</span></p>
                  <p className="text-xs font-bold text-slate-600 mt-2 italic">Boarding Time: <span className="text-red-500">{booking.boardingTime || "05:50 PM"}</span></p>
                </div>
              </div>

              {/* Sidebar Area: Fare & QR */}
              <div className="w-full md:w-64 bg-slate-50/50 p-8 flex flex-col items-center">
                <div className="w-full bg-white rounded-2xl border border-slate-100 p-5 mb-8 shadow-sm">
                  <h5 className="text-sm font-black text-slate-800 mb-4 text-center">Fare Breakdown</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>Base Fare</span>
                      <span className="text-slate-800">₹{booking.totalAmount ? (booking.totalAmount * 0.95).toFixed(0) : "1500"}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>Taxes</span>
                      <span className="text-slate-800">₹{booking.totalAmount ? (booking.totalAmount * 0.05).toFixed(0) : "50"}</span>
                    </div>
                    {booking.discountAmount > 0 && (
                      <div className="flex justify-between text-xs font-bold text-green-600 uppercase tracking-wider">
                        <span>Discount</span>
                        <span>-₹{booking.discountAmount}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2 border-dashed border-slate-100 flex justify-between items-center mt-2">
                      <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total Fare</span>
                      <span className="text-xl font-black text-green-600 tracking-tighter">₹{booking.totalAmount || "1575"}</span>
                    </div>
                  </div>
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
            <div className="bg-slate-900 px-8 py-6 flex flex-wrap justify-between items-center gap-4">
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
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-red-500 transition-colors">Cancel Ticket</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Support Info */}
        <div className="w-full max-w-4xl mt-6 px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest gap-4 opacity-80">
          <div className="flex gap-6">
            <span>Support : <span className="text-slate-600">+91 98765 43210</span></span>
            <span>EmergencyContact: <span className="text-slate-600">+91 98765 43211</span></span>
            <span>support@travelexpress.com</span>
          </div>
          <div>
            By using this ticket, you agree to our <span className="text-slate-600 hover:underline cursor-pointer">Terms & Conditions</span>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 border border-slate-100 hover:border-red-200 transition-all active:scale-95"
          >
            Plan Another Trip →
          </button>
        </div>
      </div>
    </div>
  );
}
