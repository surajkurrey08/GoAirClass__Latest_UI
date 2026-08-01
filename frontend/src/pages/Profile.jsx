import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, LogOut, Loader2,
  Ticket, Calendar, Clock, Download, Camera,
  X, ShieldCheck, Bus, Plane, AlertCircle, ArrowRight, Building, Settings,
  MapPin, Star, Shield, Check, Wallet
} from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { submitAdminRequest, uploadProfileImage } from '../services/auth';
import { getUserBookings, cancelTicket } from '../services/busService';
import { getUserHotelBookings, getTripDetails, getHotelRefundInfo, cancelHotelBooking } from '../services/hotelApi';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Ticket Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [fetchingRefund, setFetchingRefund] = useState(false);
  const [hotelRefundData, setHotelRefundData] = useState(null);

  // Live Status Modal State
  const [showLiveStatusModal, setShowLiveStatusModal] = useState(false);
  const [liveTripDetails, setLiveTripDetails] = useState(null);
  const [loadingLiveStatus, setLoadingLiveStatus] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');

  const [imageUploading, setImageUploading] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
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
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const [busBookings, hotelRes] = await Promise.all([
        getUserBookings(),
        getUserHotelBookings()
      ]);

      const normalizedBus = busBookings.map(b => ({ ...b, type: 'bus' }));
      const normalizedFlights = [];
      const normalizedHotels = (hotelRes.bookings || []).map(b => ({ ...b, type: 'hotel' }));

      // Fetch live Cleartrip details for each hotel booking
      const hotelBookingsWithDetails = await Promise.all(
        normalizedHotels.map(async (hb) => {
          if (hb.tripId) {
            try {
              const tripRes = await getTripDetails(hb.tripId);
              if (tripRes.success && tripRes.data) {
                return {
                  ...hb,
                  liveDetails: tripRes.data,
                  status: (hb.status === 'cancelled' || hb.status === 'Cancelled') ? hb.status : (tripRes.data.bookingInfo?.bookingStatus || hb.status)
                };
              }
            } catch (err) {
              console.error(`Failed to fetch live trip details for ${hb.tripId}:`, err);
            }
          }
          return hb;
        })
      );

      const allBookings = [...normalizedBus, ...normalizedFlights, ...hotelBookingsWithDetails].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.travelDate || a.checkIn || a.liveDetails?.hotelDetail?.checkInDate);
        const dateB = new Date(b.createdAt || b.travelDate || b.checkIn || b.liveDetails?.hotelDetail?.checkInDate);
        return dateB - dateA;
      });

      setBookings(allBookings);
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

  const openCancelModal = async (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setHotelRefundData(null);
    if (booking.type === 'hotel') {
      setFetchingRefund(true);
      try {
        const res = await getHotelRefundInfo(booking.tripId);
        if (res.success) {
          if (res.alreadyCancelled) {
            toast.info('This booking was already cancelled on Cleartrip. Syncing status...');
            setShowCancelModal(false);
            fetchBookings();
          } else if (res.data) {
            setHotelRefundData(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch hotel refund info:', err);
        toast.error('Could not fetch real-time refund info from Cleartrip');
      } finally {
        setFetchingRefund(false);
      }
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    try {
      if (selectedBooking.type === 'hotel') {
        await cancelHotelBooking(selectedBooking._id);
        toast.success('Hotel booking cancelled successfully. Refund initiated.');
      } else {
        await cancelTicket(selectedBooking._id);
        toast.success('Ticket cancelled successfully. Refund initiated.');
      }
      setShowCancelModal(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleCheckLiveStatus = async (tripId) => {
    setLoadingLiveStatus(true);
    setSelectedTripId(tripId);
    try {
      const response = await getTripDetails(tripId);
      if (response.success) {
        setLiveTripDetails(response.data);
        setShowLiveStatusModal(true);
      } else {
        toast.error(response.error || 'Failed to fetch live status');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || 'Failed to fetch live booking details');
    } finally {
      setLoadingLiveStatus(false);
    }
  };

  const calculateRefundPreview = (booking) => {
    if (!booking) return null;
    const now = new Date();

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

  const filteredBookings = bookings.filter(b => {
    if (activeBookingTab === 'all') return true;
    if (activeBookingTab === 'upcoming') {
      return b.status === 'Confirmed' || b.bookingStatus === 'Confirmed' || b.status === 'confirmed' || !b.status;
    }
    if (activeBookingTab === 'cancelled') {
      return b.status === 'Cancelled' || b.bookingStatus === 'Cancelled' || b.status === 'cancelled';
    }
    return b.status?.toLowerCase() === activeBookingTab.toLowerCase();
  });

  const pageSize = 3;
  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const displayedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-['Inter',sans-serif]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-650" />
          <p className="text-slate-500 font-semibold tracking-wide">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Inter',-apple-system,BlinkMacSystemFont,sans-serif] text-slate-800 antialiased">
      <Navbar />

      {/* Top Banner - Hero Section */}
      <div className="w-full bg-gradient-to-r from-[#2B1D56] via-[#3D2C76] to-[#713E8D] pt-[110px] pb-16 px-6 relative overflow-hidden">
        {/* Silhouette Plane Graphic */}
        <div className="absolute right-[30%] top-1/2 -translate-y-1/2 opacity-15 hidden md:block">
          <Plane size={150} className="text-white transform -rotate-12" />
        </div>
        <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-left">
            <span className="text-white/60 text-xs font-semibold block uppercase tracking-wider">Welcome back,</span>
            <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight flex items-center gap-2">
              {user?.fullName || 'Shivam'} <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-white/70 text-xs mt-2 font-medium">Manage your personal information and track your travel bookings.</p>
            <span className="mt-4 px-3 py-1 bg-white/10 text-white/90 text-[9px] font-bold uppercase tracking-widest rounded border border-white/20 inline-block">
              VERIFIED MEMBER
            </span>
          </div>

          <div className="flex gap-4 shrink-0">
            <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm w-48 text-slate-800 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Ticket size={20} />
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Trips</div>
                <div className="text-lg font-black text-slate-900 leading-tight mt-0.5">{bookings.length}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm w-48 text-slate-800 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <User size={20} />
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Account Status</div>
                <div className="text-lg font-black text-emerald-600 leading-tight mt-0.5">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-[120px] space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden text-center relative pb-8">

              {/* Curve Header */}
              <div className="h-24 bg-gradient-to-r from-violet-500 to-indigo-600 relative">
                <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
                  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[25px] fill-white">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,53.8,17.5,80.7,26.25A600.21,600.21,0,0,1,321.39,56.44Z"></path>
                  </svg>
                </div>
              </div>

              {/* Avatar Uploader Overlay */}
              <div className="relative w-20 h-20 mx-auto -mt-10 mb-4 z-10">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 border-4 border-white flex items-center justify-center shadow-md">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-slate-400 w-10 h-10" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center border-2 border-white transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
                  title="Upload picture"
                >
                  {imageUploading ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <h2 className="text-base font-extrabold text-slate-800 leading-tight px-4">{user?.fullName || 'User'}</h2>
              <span className="mt-1 px-2.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-100 text-[10px] font-bold rounded-full inline-block">
                {user?.role || 'Guest'}
              </span>

              {/* Clean Individual Input Fields */}
              <div className="mt-6 px-6 text-left space-y-3.5">
                <div className="p-3 bg-[#f8fafc] border border-slate-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</div>
                    <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">{user?.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-3 bg-[#f8fafc] border border-slate-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Number</div>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{user?.mobileNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 px-6 space-y-3">
                {user?.role === 'user' && (
                  <button
                    onClick={handleAdminRequest}
                    disabled={submitting}
                    className="w-full py-3 bg-[#6c5dd3] hover:bg-[#5b4ec2] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer shadow-indigo-100/50"
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    Become an Operator
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-650 hover:text-red-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Journeys List & Empty State Illustration */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 flex flex-col min-h-[450px]">

              {/* Header section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-500" />
                  My Journeys
                </h3>

                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'cancelled', label: 'Cancelled' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveBookingTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBookingTab === tab.id
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content area */}
              {bookingLoading ? (
                <div className="text-center py-20 flex-1 flex flex-col justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#6c5dd3] mx-auto mb-3" />
                  <span className="text-xs text-slate-400 font-semibold tracking-wide">Retrieving bookings list...</span>
                </div>
              ) : filteredBookings.length === 0 ? (
                /* Premium Empty State Illustration */
                <div className="border-2 border-dashed border-indigo-100 rounded-3xl p-8 py-14 flex-1 flex flex-col items-center justify-center text-center mt-6">
                  {/* Suitcase & plane inline SVG */}
                  <svg width="160" height="130" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-5">
                    <circle cx="100" cy="85" r="50" fill="#F3F0FC" />
                    {/* Suitcase Body */}
                    <rect x="75" y="60" width="50" height="55" rx="8" fill="#6C5DD3" />
                    <rect x="80" y="65" width="40" height="45" rx="4" fill="#8174EB" />
                    {/* Handle */}
                    <path d="M85 60V48C85 44.6863 87.6863 42 91 42H109C112.314 42 115 44.6863 115 48V60" stroke="#6C5DD3" strokeWidth="4" />
                    {/* Wheels */}
                    <circle cx="85" cy="120" r="5" fill="#4B3F9F" />
                    <circle cx="115" cy="120" r="5" fill="#4B3F9F" />
                    {/* Paper Plane */}
                    <path d="M142 45L122 70L134 72L142 85L150 72L162 70L142 45Z" fill="#CBB6F8" />
                    <path d="M122 70L142 85V72L122 70Z" fill="#B397F6" />
                    <path d="M100 85C115 80 120 60 142 45" stroke="#CBB6F8" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
                  </svg>

                  <h4 className="text-sm font-extrabold text-slate-800">No journeys to show</h4>
                  <p className="text-slate-400 text-xs mt-1 max-w-[280px] leading-relaxed">
                    Looks like you haven't booked any trips yet. Start exploring and book your next adventure!
                  </p>

                  <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-5 py-2.5 bg-[#6c5dd3] hover:bg-[#5b4ec2] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plane size={14} />
                    Book a Journey
                  </button>
                </div>
              ) : (
                <div className="space-y-5 mt-6">
                  {displayedBookings.map((booking, idx) => {
                    if (booking.type === 'hotel') {
                      const checkIn = booking.liveDetails?.hotelDetail?.checkInDate || booking.createdAt;
                      const checkOut = booking.liveDetails?.hotelDetail?.checkOutDate;
                      const checkInDay = checkIn ? dayjs(checkIn).format('dddd') : '';
                      const checkOutDay = checkOut ? dayjs(checkOut).format('dddd') : '';
                      const guestNameFormatted = booking.liveDetails?.contactDetail?.firstName
                        ? `${booking.liveDetails.contactDetail.title || 'Mr.'} ${booking.liveDetails.contactDetail.firstName} ${booking.liveDetails.contactDetail.lastName}`
                        : booking.guestName;

                      return (
                        <div key={idx} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm relative p-5 hover:shadow-md transition-all duration-300 group">

                          {/* Header section */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#3bbb78] flex items-center justify-center text-white shadow-sm">
                                  <Building size={18} />
                                </div>
                                <div className="flex justify-center gap-0.5 mt-1 text-[#3bbb78]">
                                  <Star size={7} fill="currentColor" />
                                  <Star size={7} fill="currentColor" />
                                  <Star size={7} fill="currentColor" />
                                </div>
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-slate-800 leading-tight">{booking.hotelName}</h4>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                                  HOTEL ID: <span className="text-emerald-700 font-extrabold">{booking.tripId}</span>
                                </span>
                              </div>
                            </div>

                            {booking.status === 'Cancelled' || booking.status === 'cancelled' ? (
                              <span className="shrink-0 px-3 py-1 border border-red-100 bg-red-50 text-red-655 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-xs">
                                <X size={10} className="stroke-[3]" />
                                CANCELLED
                              </span>
                            ) : (
                              <span className="shrink-0 px-3 py-1 border border-emerald-100 bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-xs">
                                <Check size={10} className="stroke-[3]" />
                                CONFIRMED
                              </span>
                            )}
                          </div>

                          {/* Columns & Image Section */}
                          <div className="flex flex-col lg:flex-row gap-5 mt-4 justify-between items-stretch">
                            {/* Left Side: Columns, Address, and Contacts */}
                            <div className="flex-1 flex flex-col justify-between space-y-3">
                              {/* Check-In Check-Out Column Block */}
                              <div className="flex items-center gap-4">
                                {/* Check-In Box */}
                                <div className="flex items-start gap-2.5 min-w-[120px]">
                                  <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0">
                                    <Calendar size={14} />
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-extrabold text-[#10b981] uppercase tracking-wider block">CHECK-IN</span>
                                    <div className="text-sm font-black text-slate-800 mt-0.5 leading-none">
                                      {checkIn ? dayjs(checkIn).format('DD MMM YYYY') : 'N/A'}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{checkInDay}</span>
                                  </div>
                                </div>

                                {/* Dotted line with arrow in center */}
                                <div className="flex-1 flex items-center justify-center relative">
                                  <div className="w-full border-t border-dashed border-slate-200" />
                                  <div className="absolute w-5 h-5 rounded-full bg-[#ecfdf5] text-[#10b981] border border-emerald-100 flex items-center justify-center shadow-xs">
                                    <ArrowRight size={8} className="stroke-[3]" />
                                  </div>
                                </div>

                                {/* Check-Out Box */}
                                <div className="flex items-start gap-2.5 min-w-[120px]">
                                  <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0">
                                    <Calendar size={14} />
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-extrabold text-[#10b981] uppercase tracking-wider block">CHECK-OUT</span>
                                    <div className="text-sm font-black text-slate-800 mt-0.5 leading-none">
                                      {checkOut ? dayjs(checkOut).format('DD MMM YYYY') : 'N/A'}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{checkOutDay}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Hotel Address Box */}
                              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3">
                                <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0">
                                  <MapPin size={14} />
                                </div>
                                <div>
                                  <span className="text-[8px] font-extrabold text-[#10b981] uppercase tracking-wider block">Hotel Address</span>
                                  <span className="text-[11px] font-semibold text-slate-700 block mt-0.5 leading-relaxed">
                                    {booking.liveDetails?.hotelDetail?.address || 'N/A'}
                                  </span>
                                </div>
                              </div>

                              {/* Contact Emails & Phone side by side */}
                              <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0">
                                    <Mail size={12} />
                                  </div>
                                  <div>
                                    <span className="text-[7px] font-extrabold text-[#10b981] uppercase tracking-wider block">CONTACT EMAIL</span>
                                    <span className="text-[11px] font-bold text-slate-700 block mt-0.5">
                                      {booking.liveDetails?.contactDetail?.email || 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                <div className="hidden sm:block h-5 border-r border-slate-200" />

                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-[#10b981] shrink-0">
                                    <Phone size={12} />
                                  </div>
                                  <div>
                                    <span className="text-[7px] font-extrabold text-[#10b981] uppercase tracking-wider block">CONTACT MOBILE</span>
                                    <span className="text-[11px] font-bold text-slate-700 block mt-0.5">
                                      {booking.liveDetails?.contactDetail?.mobile || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Image and Guest Details Card */}
                            <div className="w-full lg:w-72 flex flex-col justify-between gap-2.5 shrink-0">
                              {/* Hotel Facade Image */}
                              <div className="relative h-24 rounded-xl overflow-hidden shadow-xs border border-slate-150">
                                <img
                                  src={booking.hotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
                                  alt={booking.hotelName}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-center w-full px-2">
                                  <span className="text-[8px] font-black text-amber-400 drop-shadow-md tracking-wider uppercase">
                                    {booking.hotelName}
                                  </span>
                                </div>
                                <div className="absolute bottom-1.5 right-1.5 bg-[#0d2f2d] text-white p-1 rounded-lg flex flex-col items-center justify-center shadow-md border border-emerald-950/20 text-center w-14">
                                  <Star size={10} className="text-emerald-400 fill-emerald-400" />
                                  <span className="text-[6px] font-black tracking-widest mt-0.5 block uppercase leading-none text-emerald-250">GREAT</span>
                                  <span className="text-[6px] font-black tracking-widest block uppercase leading-none mt-0.5 text-emerald-250">STAY</span>
                                  <div className="flex gap-0.5 mt-0.5 text-amber-400 scale-[0.7] origin-center">
                                    <Star size={5} fill="currentColor" />
                                    <Star size={5} fill="currentColor" />
                                    <Star size={5} fill="currentColor" />
                                    <Star size={5} fill="currentColor" />
                                    <Star size={5} fill="currentColor" />
                                  </div>
                                </div>
                              </div>

                              {/* Guest & Room Combined Box */}
                              <div className="bg-[#f4fbf7] border border-[#e6f7ee] rounded-xl p-2 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 truncate flex-1">
                                  <div className="w-7 h-7 rounded-lg bg-white border border-[#d2f3e0] flex items-center justify-center text-[#10b981] shrink-0">
                                    <User size={12} />
                                  </div>
                                  <div className="truncate">
                                    <span className="text-[7px] font-extrabold text-[#10b981] uppercase tracking-wider block">PRIMARY GUEST</span>
                                    <span className="text-[10px] font-bold text-slate-700 block truncate capitalize" title={guestNameFormatted}>
                                      {guestNameFormatted}
                                    </span>
                                  </div>
                                </div>

                                <div className="h-5 border-r border-[#d2f3e0]" />

                                <div className="flex items-center gap-2.5 truncate flex-1">
                                  <div className="w-7 h-7 rounded-lg bg-white border border-[#d2f3e0] flex items-center justify-center text-[#10b981] shrink-0">
                                    <Building size={12} />
                                  </div>
                                  <div className="truncate">
                                    <span className="text-[7px] font-extrabold text-[#10b981] uppercase tracking-wider block">ROOM TYPE</span>
                                    <span className="text-[10px] font-bold text-slate-700 block truncate" title={booking.liveDetails?.rooms?.[0]?.roomTypeName || booking.roomName}>
                                      {booking.liveDetails?.rooms?.[0]?.roomTypeName || booking.roomName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dark Green panel (Total Paid & Live Status) */}
                          <div className="bg-[#0a2f2c] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 border border-[#041a18]/25 shadow-xs text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                <Wallet size={16} />
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase block leading-none">TOTAL PAID</span>
                                <span className="text-base font-black text-white block mt-0.5">
                                  ₹{booking.liveDetails?.pricing?.totalFare || booking.totalAmount}
                                </span>
                              </div>
                            </div>

                            {/* Center separator line */}
                            <div className="hidden sm:block h-6 border-r border-dashed border-emerald-800/40 mx-3" />

                            <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-between sm:justify-start w-full sm:w-auto">
                              <div className="flex flex-col sm:items-end">
                                <span className="text-[8px] font-black text-emerald-400 tracking-widest uppercase block leading-none">BOOKING STATUS</span>
                                <span className={`text-[10px] font-extrabold uppercase mt-1 block ${
                                  (booking.status === 'Cancelled' || booking.status === 'cancelled') ? 'text-red-400' : 'text-emerald-400'
                                }`}>
                                  {booking.status || 'Confirmed'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleCheckLiveStatus(booking.tripId)}
                                disabled={loadingLiveStatus && selectedTripId === booking.tripId}
                                className="px-3.5 py-1.5 bg-[#041a18] border border-[#10b981] text-emerald-300 rounded-lg text-[9px] font-extrabold uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {loadingLiveStatus && selectedTripId === booking.tripId ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    LIVE STATUS
                                  </>
                                )}
                              </button>

                              {booking.status !== 'Cancelled' && booking.status !== 'cancelled' && (
                                <button
                                  onClick={() => openCancelModal(booking)}
                                  className="px-3 py-1.5 bg-[#521313] border border-red-500 text-red-200 rounded-lg text-[9px] font-extrabold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  CANCEL
                                </button>
                              )}
                            </div>

                            <div className="hidden md:flex flex-col items-center ml-auto shrink-0 pr-1">
                              <div className="text-emerald-400/80">
                                <Building size={16} />
                              </div>
                              <div className="flex gap-0.5 mt-0.5 text-amber-500">
                                <Star size={6} fill="currentColor" />
                                <Star size={6} fill="currentColor" />
                                <Star size={6} fill="currentColor" />
                                <Star size={6} fill="currentColor" />
                                <Star size={6} fill="currentColor" />
                              </div>
                            </div>
                          </div>

                          {/* Cancellation Policy Block */}
                          {booking.liveDetails?.cancellationPolicy?.text && (
                            <div className="bg-[#fffbeb] border border-amber-100/50 rounded-xl p-3 flex items-start justify-between gap-3 mt-3 text-amber-900 shadow-3xs">
                              <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                                  <Shield size={12} className="fill-amber-600/10" />
                                </div>
                                <div className="text-[10px] leading-relaxed text-amber-800">
                                  <span className="font-bold text-amber-900 block mb-0.5">Cancellation Policy</span>
                                  {booking.liveDetails.cancellationPolicy.text}
                                </div>
                              </div>
                              <div className="text-amber-500 shrink-0 self-center hidden sm:block pr-1">
                                <Calendar size={16} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-350 hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
                        {/* Left accent color strip */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${booking.type === 'flight' ? 'bg-blue-600' : 'bg-red-500'}`} />

                        {/* Header bar */}
                        <div className="pl-6 pr-5 py-3.5 bg-slate-50/60 flex flex-wrap justify-between items-center gap-3 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${booking.type === 'flight' ? 'bg-blue-600' : 'bg-red-500'}`}>
                              {booking.type === 'flight' ? <Plane size={15} /> : <Bus size={15} />}
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                                {booking.type === 'flight' ? booking.flightDetails?.airline : (booking.bus?.name || 'Bus Service')}
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none mt-0.5">
                                {booking.type.toUpperCase()} • ID: {booking.bookingId || booking.pnrNumber || 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${booking.status === 'Cancelled' || booking.bookingStatus === 'Cancelled' || booking.status === 'cancelled'
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              }`}>
                              {booking.status || booking.bookingStatus || 'Confirmed'}
                            </span>
                          </div>
                        </div>

                        {/* Boarding Pass details container */}
                        <div className="pl-6 pr-5 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1 flex items-center justify-between gap-4 max-w-sm relative">
                            <div className="flex-1">
                              <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Origin</div>
                              <div className="text-base font-extrabold text-slate-900 mt-0.5 capitalize truncate">
                                {booking.type === 'flight' ? booking.flightDetails?.departureCity : (booking.from || booking.boardingPoint)}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                                <Calendar size={12} className="text-indigo-655" />
                                {booking.type === 'flight' ? dayjs(booking.flightDetails?.departureTime).format('DD MMM YYYY') : booking.travelDate}
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center shrink-0 px-2">
                              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                <ArrowRight size={13} />
                              </div>
                            </div>

                            <div className="flex-1 text-right">
                              <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Destination</div>
                              <div className="text-base font-extrabold text-slate-900 mt-0.5 capitalize truncate">
                                {booking.type === 'flight' ? booking.flightDetails?.arrivalCity : (booking.to || booking.droppingPoint)}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1 justify-end">
                                <Clock size={12} className="text-indigo-655" />
                                {booking.type === 'flight' ? dayjs(booking.flightDetails?.departureTime).format('hh:mm A') : (booking.departureTime || 'N/A')}
                              </div>
                            </div>
                          </div>

                          {/* Divider Line */}
                          <div className="hidden md:block w-px h-12 bg-slate-200" />

                          {/* Passenger Details & Payment card */}
                          <div className="w-full md:w-52 bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col justify-between gap-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] font-extrabold text-slate-455 uppercase tracking-widest block leading-none">Traveler</span>
                                <span className="text-xs font-bold text-slate-700 mt-1 block truncate max-w-[120px]">
                                  {booking.type === 'flight'
                                    ? `${booking.passengers?.[0]?.firstName} ${booking.passengers?.[0]?.lastName}`
                                    : (booking.passengerName || 'Passenger')}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-extrabold text-slate-455 uppercase tracking-widest block leading-none">Seat</span>
                                <span className="text-xs font-bold text-slate-700 mt-1 block truncate max-w-[70px]">
                                  {booking.type === 'flight'
                                    ? booking.passengers?.[0]?.seatNumber || 'N/A'
                                    : booking.seatNumber || 'N/A'}
                                </span>
                              </div>
                            </div>

                            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">Total Paid</span>
                                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                                  ₹{booking.type === 'flight' ? booking.fareDetails?.totalAmount : (booking.totalFare || 0)}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                {booking.type === 'flight' && booking.pnr && (
                                  <button
                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/tickets/generate/${booking.pnr}`, '_blank')}
                                    className="w-7 h-7 bg-white border border-slate-250 text-slate-650 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                                    title="Download Ticket"
                                  >
                                    <Download size={13} />
                                  </button>
                                )}
                                {booking.status !== 'Cancelled' && booking.bookingStatus !== 'Cancelled' && (
                                  <button
                                    onClick={() => openCancelModal(booking)}
                                    className="px-2.5 h-7 bg-red-50 border border-red-200 text-red-655 rounded-lg text-[9px] font-extrabold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-slate-250 bg-white text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-slate-500 font-semibold">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-slate-250 bg-white text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {/* Ticket Cancellation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => !cancelling && setShowCancelModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Cancel Ticket</h3>
              <button onClick={() => setShowCancelModal(false)} disabled={cancelling} className="text-slate-400 hover:text-slate-655">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-505 leading-relaxed">Are you sure you want to cancel this ticket? The cancellation policy refund preview is below:</p>
              {selectedBooking.type === 'hotel' ? (
                fetchingRefund ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" />
                    <span>Fetching live refund details from Cleartrip...</span>
                  </div>
                ) : hotelRefundData ? (
                  <div className="bg-[#f4fbf7] rounded-xl p-4 border border-[#e6f7ee] space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Total Paid Amount</span>
                      <span>₹{selectedBooking.totalAmount || selectedBooking.totalFare || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-red-500">
                      <span>Cancellation Charges</span>
                      <span>- ₹{(parseFloat(selectedBooking.totalAmount || selectedBooking.totalFare || 0) - parseFloat(hotelRefundData.refundAmount || 0)).toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-[#d2f3e0] flex justify-between items-center text-sm font-bold text-slate-900">
                      <span>Estimated Refund</span>
                      <span className="text-[#10b981] text-base">₹{hotelRefundData.refundAmount || "0.00"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-red-500 text-center py-2">
                    Unable to fetch cancellation charges from Cleartrip B2B. Proceeding to request full cancellation.
                  </div>
                )
              ) : (() => {
                const refund = calculateRefundPreview(selectedBooking);
                if (!refund) return null;
                return (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>Total Fare</span>
                      <span>₹{selectedBooking.totalFare || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-red-500">
                      <span>Cancellation Charges ({100 - refund.refundPercent}%)</span>
                      <span>- ₹{refund.charges}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                      <span>Estimated Refund</span>
                      <span className="text-emerald-600 text-base">₹{refund.refundAmount}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="p-6 border-t border-slate-150 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 border border-slate-250 bg-white text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {cancelling && <Loader2 size={12} className="animate-spin" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cleartrip Live Status Modal */}
      {showLiveStatusModal && liveTripDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setShowLiveStatusModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Cleartrip Live Booking Status</h3>
              <button onClick={() => setShowLiveStatusModal(false)} className="text-slate-400 hover:text-slate-655">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-['Inter',sans-serif]">
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-150">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Cleartrip Trip ID</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">{liveTripDetails.tripId}</div>

                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${liveTripDetails.bookingStatus === 'CANCELLED' || liveTripDetails.status === 'cancelled'
                  ? 'bg-red-50 border-red-200 text-red-600 shadow-xs shadow-red-100/50'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xs shadow-emerald-100/50'
                  }`}>
                  {liveTripDetails.bookingStatus || liveTripDetails.status || 'CONFIRMED'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Confirmation Number</span>
                  <span className="text-xs font-extrabold text-slate-800">{liveTripDetails.confirmationNumber || 'N/A'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Affiliate Reference</span>
                  <span className="text-xs font-extrabold text-slate-800 truncate max-w-[200px]" title={liveTripDetails.affiliateTripReference}>
                    {liveTripDetails.affiliateTripReference || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Guest Name</span>
                  <span className="text-xs font-extrabold text-slate-800">{liveTripDetails.guestDetails?.map(g => `${g.firstName} ${g.lastName}`).join(', ') || liveTripDetails.guestName || 'N/A'}</span>
                </div>

                {liveTripDetails.roomBookingDetails && (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-semibold text-slate-500">Room</span>
                      <span className="text-xs font-extrabold text-slate-800">{liveTripDetails.roomBookingDetails.roomName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-semibold text-slate-500">Dates</span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {liveTripDetails.roomBookingDetails.checkInDate} to {liveTripDetails.roomBookingDetails.checkOutDate}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between pb-2">
                  <span className="text-xs font-semibold text-slate-500">Total Price (Live)</span>
                  <span className="text-xs font-black text-slate-900">₹{liveTripDetails.pricing?.totals?.netPayableAmount || liveTripDetails.totalAmount || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-150 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowLiveStatusModal(false)}
                className="px-5 py-2.5 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Close Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
