import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BedDouble,
  CalendarDays,
  ChevronRight,
  Clock3,
  Hotel,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plane,
  RefreshCw,
  Search,
  ShieldCheck,
  TicketCheck,
  UserRound,
  WalletCards,
} from 'lucide-react';
import Footer from '../components/Footer';
import { getBookingHistory } from '../utils/BookingHistory';
import { getUserFlightBookings } from '../services/flightApi';
import { getUserHotelBookings } from '../services/hotelApi';

const readJSON = (key) => {
  try {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split('.')?.[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(
      atob(normalized)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    ));
  } catch {
    return null;
  }
};

const getCurrentUser = () => {
  const direct =
    readJSON('user') ||
    readJSON('authUser') ||
    readJSON('profile') ||
    readJSON('currentUser') ||
    readJSON('userData');

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken');

  const jwt = decodeJwtPayload(token) || {};
  const src = direct || jwt || {};

  const name =
    src.name ||
    src.fullName ||
    src.username ||
    [src.firstName, src.lastName].filter(Boolean).join(' ') ||
    jwt.name ||
    jwt.username ||
    'GoAirClass Traveller';

  return {
    name,
    email: src.email || jwt.email || '',
    phone: src.phone || src.mobile || src.mobileNumber || '',
    city: src.city || src.location || '',
  };
};

const normalizeType = (item) => {
  const raw = String(item.type || item.bookingType || item.category || '').toLowerCase();
  if (raw.includes('hotel')) return 'hotel';
  if (raw.includes('flight')) return 'flight';

  if (item.hotelName || item.roomName) return 'hotel';
  return 'flight';
};

const getStatus = (item) =>
  String(item.status || item.bookingStatus || item.ticketStatus || item.state || 'Confirmed');

const formatMoney = (value) => {
  const amount = Number(value || 0);
  return amount ? `₹${Math.round(amount).toLocaleString('en-IN')}` : '—';
};

const formatDate = (value) => {
  if (!value) return 'Date not available';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getBookingTitle = (item, type) => {
  if (type === 'hotel') {
    return item.hotelName || item.propertyName || 'Hotel Booking';
  }

  const from =
    item.from ||
    item.origin ||
    item.originCity ||
    item.flightDetails?.departureCity ||
    item.flightDetails?.departureAirport ||
    item.segments?.[0]?.origin ||
    item.segments?.[0]?.originCity;

  const lastSegment = item.segments?.[item.segments.length - 1];
  const to =
    item.to ||
    item.destination ||
    item.destinationCity ||
    item.flightDetails?.arrivalCity ||
    item.flightDetails?.arrivalAirport ||
    lastSegment?.destination ||
    lastSegment?.destinationCity;

  return from && to ? `${from} → ${to}` : item.airlineName || item.flightDetails?.airline || 'Flight Booking';
};

const getSubtitle = (item, type) => {
  if (type === 'hotel') {
    return item.roomName || item.hotelAddress || item.city || 'Hotel reservation';
  }

  const flightNum = item.flightNumber || item.flightDetails?.flightNumber;
  const airline = item.airlineName || item.flightDetails?.airline;

  return (
    (airline && flightNum ? `${airline} (${flightNum})` : (flightNum || airline)) ||
    item.pnr ||
    item.tripId ||
    'Flight reservation'
  );
};

function BookingCard({ booking, onClick }) {
  const type = normalizeType(booking);
  const TypeIcon = type === 'hotel' ? BedDouble : Plane;

  const status = getStatus(booking);
  const statusLower = status.toLowerCase();
  const success = statusLower.includes('confirm') || statusLower.includes('success') || statusLower.includes('book') || statusLower.includes('paid');
  const cancelled = statusLower.includes('cancel');

  const amount =
    booking.totalAmount ||
    booking.fareDetails?.totalAmount ||
    booking.finalPrice ||
    booking.price ||
    booking.amount ||
    booking.ticketTotal;

  const date =
    booking.departureDate ||
    booking.flightDetails?.departureTime ||
    booking.checkIn ||
    booking.travelDate ||
    booking.date ||
    booking.createdAt ||
    booking.bookedAt;

  const bookingRef =
    booking.tripId ||
    booking.pnr ||
    booking.bookingId ||
    booking.confirmationNumber ||
    booking.id;

  return (
    <article
      onClick={() => onClick && onClick(booking)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(booking);
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-[10px] border border-[#dfe6ef] bg-white shadow-[0_5px_18px_rgba(19,35,63,0.04)] transition hover:-translate-y-0.5 hover:border-[#2f6fed]/40 hover:shadow-[0_10px_28px_rgba(19,35,63,0.08)] focus:outline-none focus:ring-2 focus:ring-[#2f6fed]"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] transition-transform group-hover:scale-105 ${
            type === 'hotel' ? 'bg-orange-50 text-[#ef6b1d]' : 'bg-blue-50 text-[#174f9c]'
          }`}>
            <TypeIcon size={21} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7b8799]">
                {type === 'hotel' ? 'Hotel' : 'Flight'}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                cancelled
                  ? 'bg-red-50 text-red-600'
                  : success
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
              }`}>
                {status}
              </span>
              {booking.source === 'SERVER' && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-[#174f9c]">
                  Verified
                </span>
              )}
            </div>

            <h3 className="mt-1 break-words text-[16px] font-extrabold leading-5 text-[#17243b] group-hover:text-[#123f86]">
              {getBookingTitle(booking, type)}
            </h3>
            <p className="mt-1 break-words text-[11px] leading-5 text-[#6d7a90]">
              {getSubtitle(booking, type)}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-[#718096]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                {formatDate(date)}
              </span>
              {bookingRef && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <TicketCheck size={13} />
                  <span className="max-w-[240px] truncate">Ref: {bookingRef}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#edf1f5] pt-3 lg:min-w-[175px] lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="text-left lg:text-right">
            <div className="text-[9px] font-bold uppercase tracking-wide text-[#8b97a8]">
              Total paid
            </div>
            <div className="mt-0.5 whitespace-nowrap text-[18px] font-black text-[#17243b]">
              {formatMoney(amount)}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#2f6fed] opacity-80 group-hover:opacity-100">
            <span>View Ticket</span>
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </article>
  );
}
export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const user = useMemo(() => getCurrentUser(), []);

  const isLoggedIn = Boolean(
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch authenticated user flight & hotel bookings from server
      const [flightRes, hotelRes] = await Promise.allSettled([
        getUserFlightBookings(),
        getUserHotelBookings()
      ]);

      const localHistory = getBookingHistory() || [];

      const serverFlights = (flightRes.status === 'fulfilled' && Array.isArray(flightRes.value?.bookings) ? flightRes.value.bookings : []).map((b) => ({
        id: b.tripId || b.bookingId || b._id,
        tripId: b.tripId,
        bookingId: b.bookingId,
        pnr: b.pnr,
        type: 'flight',
        status: b.bookingStatus || b.ticketStatus || 'Confirmed',
        airlineName: b.flightDetails?.airline || 'Airline',
        flightNumber: b.flightDetails?.flightNumber || '',
        from: b.flightDetails?.departureCity || b.flightDetails?.departureAirport || '',
        to: b.flightDetails?.arrivalCity || b.flightDetails?.arrivalAirport || '',
        origin: b.flightDetails?.departureAirport || '',
        destination: b.flightDetails?.arrivalAirport || '',
        departureDate: b.flightDetails?.departureTime,
        arrivalDate: b.flightDetails?.arrivalTime,
        totalAmount: b.fareDetails?.totalAmount,
        passengers: b.passengers || [],
        contactDetails: b.contactDetails || {},
        createdAt: b.createdAt,
        source: 'SERVER',
        raw: b
      }));

      const serverHotels = (hotelRes.status === 'fulfilled' && Array.isArray(hotelRes.value?.bookings) ? hotelRes.value.bookings : []).map((h) => ({
        id: h.tripId || h.bookingId || h._id,
        tripId: h.tripId,
        bookingId: h.bookingId || h.tripId,
        type: 'hotel',
        status: h.status || 'Confirmed',
        hotelName: h.hotelName || h.hotelTitle || 'Hotel Reservation',
        roomName: h.roomName || h.roomType || '',
        city: h.city || '',
        checkIn: h.checkIn,
        checkOut: h.checkOut,
        totalAmount: h.totalPrice || h.amount || h.totalAmount,
        createdAt: h.createdAt,
        source: 'SERVER',
        raw: h
      }));

      // Combine server and local bookings, removing duplicates
      const combined = [...serverFlights, ...serverHotels, ...localHistory];
      const seen = new Set();
      const unique = [];

      combined.forEach((item) => {
        if (!item || typeof item !== 'object') return;
        const key = String(item.tripId || item.bookingId || item.pnr || item.id || '');
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        unique.push(item);
      });

      unique.sort((a, b) => {
        const da = new Date(a.createdAt || a.departureDate || a.checkIn || a.travelDate || a.date || 0).getTime();
        const db = new Date(b.createdAt || b.departureDate || b.checkIn || b.travelDate || b.date || 0).getTime();
        return db - da;
      });

      setHistory(unique);

      if (flightRes.status === 'rejected' && hotelRes.status === 'rejected') {
        setError('Could not reach booking server. Showing available cached history.');
      }
    } catch (err) {
      console.error('[ProfilePage] Error fetching bookings:', err);
      setError('Unable to load bookings from server.');
      setHistory(getBookingHistory() || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/profile' } });
      return;
    }

    fetchBookings();

    const sync = () => fetchBookings();
    window.addEventListener('storage', sync);
    window.addEventListener('goairclass-booking-history-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('goairclass-booking-history-updated', sync);
    };
  }, [isLoggedIn, navigate, fetchBookings]);

  const counts = useMemo(() => {
    const flights = history.filter((item) => normalizeType(item) === 'flight').length;
    const hotels = history.filter((item) => normalizeType(item) === 'hotel').length;
    return { all: history.length, flights, hotels };
  }, [history]);

  const filtered = useMemo(() => {
    return history.filter((item) => {
      const type = normalizeType(item);
      if (activeTab === 'flights' && type !== 'flight') return false;
      if (activeTab === 'hotels' && type !== 'hotel') return false;

      if (!search.trim()) return true;
      const haystack = JSON.stringify(item).toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [history, activeTab, search]);

  const handleBookingClick = (booking) => {
    const type = normalizeType(booking);
    if (type === 'flight') {
      const tripRef = booking.tripId || booking.bookingId || booking.id;
      navigate(`/flight/booking-success?tripId=${encodeURIComponent(tripRef)}`, {
        state: {
          isFromHistory: true,
          bookingId: tripRef,
          tripId: booking.tripId || tripRef,
          pnr: booking.pnr || '',
          bookingData: booking.raw || booking,
          total: booking.totalAmount || booking.amount || booking.price || 0
        }
      });
    } else {
      navigate('/hotels');
    }
  };

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'GA';

  const logout = () => {
    ['token', 'accessToken', 'authToken', 'jwt', 'userToken', 'isLoggedIn'].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] font-sans text-[#17243b]">
      {/* top profile header */}
      <header className="border-b border-white/10 bg-gradient-to-r from-[#001b49] via-[#073675] to-[#165ba3] text-white">
        <div className="mx-auto max-w-[1380px] px-3 py-4 sm:px-5 lg:px-7">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 items-center gap-2 rounded-[7px] border border-white/20 bg-white/10 px-3 text-[11px] font-bold backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <div className="mt-5 flex flex-col gap-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white text-[20px] font-black text-[#174f9c] shadow-xl">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">
                  My GoAirClass
                </p>
                <h1 className="mt-1 break-words text-[24px] font-black leading-tight sm:text-[30px]">
                  {user.name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-blue-100">
                  {user.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} /> {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={13} /> {user.phone}
                    </span>
                  )}
                  {user.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} /> {user.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-red-300/30 bg-red-500 px-4 text-[11px] font-extrabold text-white shadow-lg transition hover:bg-red-600 sm:w-auto"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1380px] px-3 py-5 sm:px-5 lg:px-7 lg:py-7">
        {/* stats */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Total Bookings', value: counts.all, icon: WalletCards, tone: 'blue' },
            { label: 'Flight Bookings', value: counts.flights, icon: Plane, tone: 'blue' },
            { label: 'Hotel Bookings', value: counts.hotels, icon: Hotel, tone: 'orange' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-[10px] border border-[#dfe6ef] bg-white p-4 shadow-[0_5px_18px_rgba(19,35,63,0.04)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8290a3]">
                    {label}
                  </p>
                  <p className="mt-1 text-[28px] font-black text-[#17243b]">{value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-[9px] ${
                  tone === 'orange'
                    ? 'bg-orange-50 text-[#ef6b1d]'
                    : 'bg-blue-50 text-[#174f9c]'
                }`}>
                  <Icon size={21} />
                </div>
              </div>
            </div>
          ))}
        </section>

        {error && (
          <div className="mt-4 flex items-center justify-between rounded-[8px] border border-amber-200 bg-amber-50 p-3.5 text-[11px] text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchBookings}
              className="font-bold underline hover:text-amber-950"
            >
              Retry
            </button>
          </div>
        )}

        <section className="mt-4 overflow-hidden rounded-[10px] border border-[#dfe6ef] bg-white shadow-[0_5px_18px_rgba(19,35,63,0.04)]">
          <div className="flex flex-col gap-3 border-b border-[#edf1f5] bg-[#fbfcfe] p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[18px] font-black text-[#17243b]">Booking History</h2>
              <p className="mt-1 text-[11px] text-[#738096]">
                Flights and hotels booked from this account.
              </p>
            </div>

            <div className="relative w-full lg:max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8290a3]" size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search booking, PNR, hotel..."
                className="h-10 w-full rounded-[7px] border border-[#d8e1ec] bg-white pl-9 pr-3 text-[11px] font-medium outline-none transition focus:border-[#2f6fed] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="border-b border-[#edf1f5] px-3 pt-3 sm:px-4">
            <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                ['all', `All (${counts.all})`],
                ['flights', `Flights (${counts.flights})`],
                ['hotels', `Hotels (${counts.hotels})`],
              ].map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`h-9 shrink-0 rounded-[6px] px-4 text-[11px] font-extrabold transition ${
                    activeTab === key
                      ? 'bg-[#123f86] text-white shadow-sm'
                      : 'border border-[#dce4ef] bg-white text-[#52617a] hover:bg-[#f6f9fd]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {loading ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center py-12 text-center">
                <Loader2 size={32} className="animate-spin text-[#174f9c]" />
                <p className="mt-3 text-[12px] font-bold text-[#6d7a90]">
                  Loading your confirmed bookings...
                </p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((booking) => (
                  <BookingCard
                    key={booking.id || booking.tripId}
                    booking={booking}
                    onClick={handleBookingClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[330px] flex-col items-center justify-center px-4 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#174f9c]">
                  <Clock3 size={28} />
                </div>
                <h3 className="mt-4 text-[17px] font-black text-[#17243b]">
                  {history.length ? 'No matching bookings' : 'No booking history yet'}
                </h3>
                <p className="mt-2 max-w-md text-[11px] leading-5 text-[#738096]">
                  {history.length
                    ? 'Try another search or change the booking type filter.'
                    : 'Your confirmed flight and hotel bookings will appear here.'}
                </p>

                {!history.length && (
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/flights')}
                      className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-[#123f86] px-4 text-[11px] font-extrabold text-white transition hover:bg-[#0e336d]"
                    >
                      <Plane size={14} /> Book Flight
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/hotels')}
                      className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-[#ff650d] px-4 text-[11px] font-extrabold text-white transition hover:bg-[#e05607]"
                    >
                      <BedDouble size={14} /> Find Hotel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-4 flex flex-col gap-3 rounded-[10px] border border-[#cfe3f8] bg-gradient-to-r from-[#f3f8ff] to-[#fbfdff] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#174f9c] shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-[12px] font-extrabold text-[#17243b]">Secure account</h3>
              <p className="mt-1 text-[10px] leading-5 text-[#738096]">
                Your booking history is securely synced with your GoAirClass account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchBookings}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[6px] border border-[#d7e2ef] bg-white px-3 text-[10px] font-bold text-[#36547b] transition hover:bg-[#f7faff] disabled:opacity-60"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh history
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}