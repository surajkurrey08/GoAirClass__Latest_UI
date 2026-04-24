import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, Shield, LogOut, Loader2,
  ArrowLeft, CreditCard, Ticket, Settings,
  ChevronRight, Star, Wallet, MapPin, ShieldCheck, Bus, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import { submitAdminRequest } from '../services/auth';
import { getUserBookings } from '../services/busService';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
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
    <div className="min-h-screen bg-[#f8fafc] pb-12 pt-16 md:pt-24 px-4 font-inter">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all font-medium group"
          >
            <div className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Back to explore
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Profile</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-white">
              <div className="flex flex-col items-center text-center p-4">
                <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-2xl shadow-blue-600/20">
                    <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center text-blue-600">
                      <User className="w-12 h-12" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white p-1 shadow-lg border border-gray-50 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
                <p className="text-gray-400 text-sm font-medium mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> India • Explorer Tier
                </p>
              </div>

              <div className="mt-8 space-y-2">
                <SidebarItem icon={User} label="Personal Details" id="overview" />
                <SidebarItem icon={Ticket} label="My Bookings" id="bookings" />
                <SidebarItem icon={Wallet} label="GoAir Wallet" id="wallet" />
                <SidebarItem icon={Settings} label="Settings" id="settings" />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-3">
                {user?.role !== 'superadmin' && user?.role !== 'admin' && (
                  <button
                    onClick={handleAdminRequest}
                    disabled={submitting}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all font-semibold disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                    Request to Admin
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Trips', value: '12', icon: MapPin, color: 'blue' },
                { label: 'Miles Earned', value: '2.4k', icon: Star, color: 'amber' },
                { label: 'Saved', value: '₹4k', icon: CreditCard, color: 'green' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-50 flex items-center gap-5 group hover:border-blue-100 transition-all">
                  <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                    <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Information card */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100px] pointer-events-none" />

              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'overview' && 'Account Overview'}
                  {activeTab === 'bookings' && 'Booking History'}
                  {activeTab === 'wallet' && 'GoAir Wallet'}
                  {activeTab === 'settings' && 'Account Settings'}
                </h3>
                <button className="text-blue-600 text-sm font-bold hover:underline">Edit Profile</button>
              </div>

              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[
                    { label: 'Full Name', value: user?.fullName, icon: User },
                    { label: 'Contact Number', value: `+91 ${user?.mobileNumber}`, icon: Phone },
                    { label: 'Email Address', value: user?.email || 'not.connected@goair.com', icon: Mail },
                    { label: 'Security Role', value: user?.role, icon: Shield }
                  ].map((field, idx) => (
                    <div key={idx} className="space-y-3 group">
                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <field.icon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{field.label}</span>
                      </div>
                      <div className="p-5 bg-gray-50 border border-gray-100 rounded-3xl text-gray-800 font-semibold text-lg transition-all group-hover:bg-white group-hover:shadow-lg group-hover:border-blue-50">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  {bookingLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                      <p className="text-gray-400">Fetching your journey history...</p>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {bookings.map((booking) => (
                        <div key={booking._id} className="group relative bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-blue-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden">
                          {/* Status Badge */}
                          <div className="absolute top-0 right-0 p-1">
                            <div className={`px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider ${booking.paymentStatus === 'Completed' ? 'bg-green-100 text-green-600' :
                                booking.paymentStatus === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                              {booking.paymentStatus}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                  <Bus className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    {booking.bus?.busName || 'Premium Bus'}
                                    {booking.couponCode && (
                                      <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[8px] font-black rounded border border-green-100 uppercase tracking-tighter flex items-center gap-0.5">
                                        <Ticket size={8} />
                                        {booking.couponCode}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">PNR: {booking.pnrNumber}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-gray-500">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-500" />
                                  <span className="font-semibold text-sm capitalize">{booking.boarding?.point || booking.boardingPoint}</span>
                                </div>
                                <ArrowLeft className="w-4 h-4 rotate-180 text-gray-300" />
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-red-500" />
                                  <span className="font-semibold text-sm capitalize">{booking.dropping?.point || booking.droppingPoint}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-8 md:border-l border-gray-100 md:pl-8">
                              <div className="text-center">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Travel Date</div>
                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  {booking.travelDate}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Seats</div>
                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                  <Ticket className="w-4 h-4 text-blue-500" />
                                  {booking.seatNumbers?.join(', ') || booking.seatNumber}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</div>
                                <div className="text-xl font-extrabold text-blue-600">
                                  ₹{booking.totalFare}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs text-gray-400">Booked on {new Date(booking.createdAt).toLocaleDateString()}</div>
                            <div className="flex gap-3">
                              <button className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all">Download Ticket</button>
                              {booking.status !== 'Cancelled' && (
                                <button className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">Cancel Ticket</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                        <Ticket className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">No bookings yet</h4>
                        <p className="text-gray-400 mt-1 max-w-xs">You haven't made any travel plans yet. Ready to start your journey?</p>
                        <button onClick={() => navigate('/')} className="mt-6 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                          Book Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <Wallet className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 capitalize">{activeTab} coming soon</h4>
                    <p className="text-gray-400 mt-1 max-w-xs">We are currently building this section for a better travel experience.</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <Settings className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 capitalize">{activeTab} coming soon</h4>
                    <p className="text-gray-400 mt-1 max-w-xs">We are currently building this section for a better travel experience.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
