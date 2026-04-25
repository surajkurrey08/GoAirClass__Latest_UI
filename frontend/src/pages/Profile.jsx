import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, Shield, LogOut, Loader2,
  ArrowLeft, CreditCard, Ticket, Settings,
  ChevronRight, Star, Wallet, MapPin, ShieldCheck, Bus, Calendar,
  CheckCircle2, Clock, Search, Filter, Gift, ArrowRight, Download,
  Info as InfoIcon, Camera, LayoutDashboard, X, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { submitAdminRequest, uploadProfileImage } from '../services/auth';
import { getUserBookings, cancelTicket } from '../services/busService';
import { useRef } from 'react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState('all');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      toast.warn('Please login to view your profile');
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Error parsing user data', err);
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setTimeout(() => setLoading(false), 500); // Smooth transition
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load bookings');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleAdminRequest = async () => {
    if (!user?.mobileNumber) return;

    setSubmitting(true);
    try {
      await submitAdminRequest(
        user.mobileNumber,
        user.fullName || 'N/A',
        user.email || 'no-email@provided.com'
      );
      toast.success('Admin request submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setImageUploading(true);
    try {
      const response = await uploadProfileImage(formData);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    try {
      await cancelTicket(selectedBooking._id);
      toast.success('Ticket cancelled successfully. Refund initiated.');
      setShowCancelModal(false);
      fetchBookings(); // Refresh list
    } catch (err) {
      toast.error(err.message || 'Failed to cancel ticket');
    } finally {
      setCancelling(false);
    }
  };

  const calculateRefundPreview = (booking) => {
    if (!booking) return null;
    const now = new Date();

    // Extract time
    let hour = 10, minute = 0;
    const timeStr = booking.boarding?.time || booking.schedule?.departureTime || "10:00 AM";
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      minute = parseInt(timeMatch[2]);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
    }

    const dateParts = booking.travelDate.split('-');
    const departureDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      hour, minute, 0
    );

    const hoursLeft = (departureDate - now) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursLeft > 24) refundPercent = 80;
    else if (hoursLeft > 12) refundPercent = 50;
    else if (hoursLeft > 6) refundPercent = 25;
    else refundPercent = 0;

    const totalFare = booking.totalFare || 0;
    const refundAmount = Math.round((totalFare * refundPercent) / 100);
    const charges = totalFare - refundAmount;

    return { refundPercent, refundAmount, charges, hoursLeft };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-400 font-medium animate-pulse">Loading your premium experience...</p>
        </div>
      </div>
    );
  }

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${activeTab === id
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1'
        : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{label}</span>
      </div>
      <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === id ? 'rotate-90' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B] overflow-x-hidden">
      {/* Top Welcome Banner - Hero Section */}
      <div className="w-full bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#1E293B] pt-12 pb-24 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl border-4 border-white/10 overflow-hidden bg-white/5 backdrop-blur-md shadow-2xl">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <User size={48} />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl border-4 border-[#1E293B] flex items-center justify-center shadow-xl hover:bg-blue-500 transition-all hover:scale-110"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight">Hi, {user?.fullName || 'shivam'}!</h1>
                <div className="px-3 py-1 bg-yellow-400 text-yellow-950 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 shadow-lg shadow-yellow-400/20">
                  <Star size={12} fill="currentColor" />
                  Gold Master
                </div>
              </div>
              <p className="text-slate-400 font-medium mt-1">Manage your trips, wallet and profile settings in one place.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[140px] text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Trips</div>
              <div className="text-2xl font-black text-white">12</div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[140px] text-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Savings</div>
              <div className="text-2xl font-black text-blue-400">₹2,450</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar Menu */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'bookings', label: 'My Bookings', icon: Ticket },
                  { id: 'wallet', label: 'GoAir Wallet', icon: Wallet },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all group ${activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all group"
                >
                  <LogOut size={20} className="text-red-400 group-hover:text-red-600" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Become an Operator Button */}
            {user?.role === 'user' && (
              <button
                onClick={handleAdminRequest}
                disabled={submitting}
                className="w-full py-5 bg-[#1E293B] text-white rounded-[2rem] font-bold text-sm shadow-xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98]"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                Become an Operator
              </button>
            )}

            {/* Promo Card in Sidebar */}
            <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <Gift className="w-10 h-10 mb-4 text-blue-200" />
              <h4 className="text-lg font-bold leading-tight">Refer & Earn ₹500</h4>
              <p className="text-blue-100 text-xs mt-2 font-medium">Invite your friends to GoAirClass and earn credits.</p>
              <button className="mt-6 w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all">Invite Now</button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9 space-y-8">

            {activeTab === 'bookings' && (
              <div className="space-y-8">
                {/* PREMIUM FILTER TABS */}
                <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-900/5 rounded-[2rem] border border-slate-200/50 backdrop-blur-sm">
                  {[
                    { id: 'all', label: 'All Journeys', count: 12, icon: Bus },
                    { id: 'upcoming', label: 'Upcoming', count: 2, icon: Calendar },
                    { id: 'completed', label: 'Completed', count: 8, icon: ShieldCheck },
                    { id: 'cancelled', label: 'Cancelled', count: 2, icon: Phone }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBookingTab(tab.id)}
                      className={`
                        px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-all duration-300 relative group
                        ${activeBookingTab === tab.id 
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105' 
                          : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      <tab.icon size={14} className={activeBookingTab === tab.id ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-600'} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                      <span className={`
                        min-w-[18px] h-4.5 rounded-lg flex items-center justify-center text-[9px] font-black px-1.5
                        ${activeBookingTab === tab.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400'}
                      `}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* REDBUS INSPIRED PREMIUM TICKET VIEW - REFINED COMPACT */}
                <div className="space-y-4">
                  {bookings.filter(b => {
                    if (activeBookingTab === 'all') return true;
                    return b.status?.toLowerCase() === activeBookingTab.toLowerCase();
                  }).length === 0 && !bookingLoading ? (
                    <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-200">
                      <Ticket size={40} className="mx-auto text-slate-200 mb-3" />
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No {activeBookingTab !== 'all' ? activeBookingTab : ''} journeys</h3>
                      <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] hover:scale-105 transition-all">Book New Trip</button>
                    </div>
                  ) : (
                    bookings.filter(b => {
                      if (activeBookingTab === 'all') return true;
                      return b.status?.toLowerCase() === activeBookingTab.toLowerCase();
                    }).map((booking, idx) => (
                      <div key={idx} className="bg-white rounded-[1.8rem] shadow-2xl shadow-indigo-100/40 border border-indigo-50 overflow-hidden group hover:border-indigo-100 transition-colors">
                        {/* 1. HEADER - SLEEK DARK */}
                        <div className="px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex justify-between items-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-[-20deg] translate-x-16" />
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                              <Bus size={20} />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-white tracking-tight leading-none">{booking.bus?.name || 'Travel Express'}</h3>
                              <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-1">PNR: <span className="text-white font-black">{booking.pnrNumber || 'N/A'}</span></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 relative z-10">
                            <div className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${
                              booking.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}>
                              {booking.status || 'Confirmed'}
                            </div>
                            <div className="px-3 py-1.5 bg-white/5 rounded-lg flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                              <ShieldCheck size={12} className="text-emerald-400" />
                              <span className="hidden sm:inline">Verified</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                          {/* Main Content Area */}
                          <div className="flex-1 p-6 sm:p-8 space-y-8">
                            {/* 2. JOURNEY TIMELINE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 border border-slate-200 rounded-full z-10 items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                <ArrowRight size={18} className="text-red-600" />
                              </div>
                              <div className="space-y-1">
                                <div className="text-[9px] font-black text-red-500 uppercase tracking-widest">DEPARTURE</div>
                                <h4 className="text-2xl font-black text-slate-900 capitalize">{booking.from || booking.boardingPoint || 'N/A'}</h4>
                                <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-500">
                                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500" /> {booking.travelDate}</span>
                                  <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-500" /> {booking.departureTime || '10:30 PM'}</span>
                                </div>
                              </div>
                              <div className="text-right md:text-left md:pl-16 space-y-1">
                                <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">ARRIVAL</div>
                                <h4 className="text-2xl font-black text-slate-900 capitalize">{booking.to || booking.droppingPoint || 'N/A'}</h4>
                                <div className="text-[10px] font-black text-slate-400 italic uppercase tracking-wider mt-1.5">
                                  EXPECTED {booking.arrivalTime || '04:45 AM'}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                              {/* 3. PASSENGER CARD */}
                              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-slate-100"><User size={20} /></div>
                                <div>
                                  <div className="text-[13px] font-black text-slate-900 capitalize leading-none mb-1.5">{booking.passengerName || 'Rutuja'}</div>
                                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase">Seat {booking.seatNumber || 'S1'}</span>
                                    <span>24, Female</span>
                                  </div>
                                </div>
                              </div>

                              {/* 4. BUS CARD */}
                              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100"><Bus size={20} /></div>
                                <div>
                                  <div className="text-[13px] font-black text-slate-900 uppercase leading-none mb-1.5">{booking.busNumber || 'MH12 AB1234'}</div>
                                  <div className="text-[10px] font-bold text-slate-500">{booking.busType || 'AC Sleeper'} • Premium</div>
                                </div>
                              </div>
                            </div>

                            {/* 5. BOARDING/DROPPING POINTS */}
                            <div className="grid grid-cols-2 gap-8 pt-2">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  <MapPin size={10} className="text-red-500" /> BOARDING POINT
                                </div>
                                <div className="text-xs font-bold text-slate-800 leading-tight uppercase pl-4">{booking.boardingPoint || 'Pune Station'}</div>
                              </div>
                              <div className="space-y-1.5 text-right">
                                <div className="flex items-center justify-end gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  DROPPING POINT <MapPin size={10} className="text-indigo-500" />
                                </div>
                                <div className="text-xs font-bold text-slate-800 leading-tight uppercase pr-4">{booking.droppingPoint || 'Solapur'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Sidebar Section */}
                          <div className="w-full lg:w-[280px] bg-slate-50/40 p-8 flex flex-col justify-between gap-8">
                            <div className="space-y-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL PAID</div>
                                  <div className="text-4xl font-black text-red-600 tracking-tighter">₹{booking.totalFare || 1260}</div>
                                </div>
                                <div className="text-right">
                                  <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest mb-1 inline-block">PAID VIA UPI</div>
                                  <div className="text-[9px] font-bold text-slate-400 block uppercase">Razorpay Verified</div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group/qr">
                                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 opacity-[0.03] group-hover/qr:opacity-[0.08] transition-opacity">
                                  <div className="grid grid-cols-2 gap-1"><div className="w-1.5 h-1.5 bg-white" /><div className="w-1.5 h-1.5 bg-white" /><div className="w-1.5 h-1.5 bg-white" /><div className="w-1.5 h-1.5 bg-white" /></div>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 leading-tight">Verification<br/>QR Code</div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <button title="WhatsApp" className="h-11 bg-[#25D366] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-emerald-100/50">
                                  <Phone size={20} className="fill-current" />
                                </button>
                                <button title="Email Ticket" className="h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-blue-100/50">
                                  <Mail size={20} />
                                </button>
                                <button title="Download PDF" className="h-11 bg-red-600 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-red-100/50">
                                  <Download size={20} />
                                </button>
                              </div>
                              <button 
                                onClick={() => openCancelModal(booking)}
                                className="w-full py-4 bg-white border border-red-200 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                              >
                                Cancel Ticket
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Full Name', value: user?.fullName || 'shivam', icon: User },
                    { label: 'Mobile Number', value: user?.mobileNumber || '+91 99999 88888', icon: Phone },
                    { label: 'Email Address', value: user?.email || 'shivam@example.com', icon: Mail },
                    { label: 'Account Status', value: 'Active', icon: ShieldCheck }
                  ].map((field, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <field.icon size={16} className="text-blue-500" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                      </div>
                      <div className="text-base font-bold text-slate-900 ml-7">{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Right Activity Panel (Optional or can be inside grid) */}
        <div className="mt-12">
          <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Clock size={24} className="text-blue-600" />
                Recent Activity
              </h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Clear History</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { label: 'Booking Completed', amount: '₹1076.40', date: '26 Apr 2025, 10:00 PM', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
                { label: 'Travel Due', amount: '₹0', date: 'Upcoming Trip', icon: Clock, color: 'text-blue-500 bg-blue-50' },
                { label: 'Booked AC', amount: '₹0', date: 'Luxury Sleeper', icon: Bus, color: 'text-purple-500 bg-purple-50' },
                { label: 'Tick No.', amount: '₹0', date: 'GAC-882736', icon: Ticket, color: 'text-orange-500 bg-orange-50' },
                { label: 'Booking In/Out', amount: '₹0', date: 'Delhi Terminal', icon: MapPin, color: 'text-red-500 bg-red-50' },
                { label: 'Pass Checkin', amount: '₹0', date: 'Verified', icon: User, color: 'text-indigo-500 bg-indigo-50' },
                { label: 'Inquiry/Reset', amount: '₹0', date: 'Support', icon: Settings, color: 'text-slate-500 bg-slate-50' },
                { label: 'Inquiry/Send', amount: '₹0', date: 'Email Sent', icon: Mail, color: 'text-pink-500 bg-pink-50' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                  <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                    <div className="text-xs font-black text-blue-600 mt-0.5">PMR {item.amount}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal - Kept functionality */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => !cancelling && setShowCancelModal(false)} />
          <div className="relative bg-white w-full max-w-lg sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Confirm Cancellation</h3>
              <button onClick={() => setShowCancelModal(false)} disabled={cancelling} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {(() => {
                const refund = calculateRefundPreview(selectedBooking);
                if (!refund) return null;
                return (
                  <div className="space-y-6">
                    <p className="text-slate-500 font-medium leading-relaxed">Are you sure you want to cancel your trip?</p>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-semibold text-slate-500"><span>Original Fare</span><span>₹{selectedBooking.totalFare}</span></div>
                        <div className="flex justify-between text-sm font-semibold text-red-500"><span>Cancellation Fee ({100 - refund.refundPercent}%)</span><span>- ₹{refund.charges}</span></div>
                        <div className="pt-3 border-t border-slate-200 flex justify-between items-center"><span className="font-bold text-slate-900">Refund Amount</span><span className="text-2xl font-black text-green-600">₹{refund.refundAmount}</span></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="p-8 border-t border-slate-50 bg-white shrink-0 grid grid-cols-2 gap-4">
              <button onClick={() => setShowCancelModal(false)} disabled={cancelling} className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Keep Ticket</button>
              <button onClick={handleCancelBooking} disabled={cancelling} className="py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100">{cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
