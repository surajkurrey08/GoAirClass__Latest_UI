import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, LogOut, Loader2,
  Ticket, Calendar, Clock, Download, Camera, Briefcase,
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
import { getUserFlightBookings, fetchTripDetailsApi as fetchFlightTripDetails, getFlightCancelReasonsApi, cancelFlightBookingApi, getFlightCancelRefundInfoApi, getFlightRefundInfoApi } from '../services/flightApi';

const getFlightStatusLabel = (status) => {
  if (!status) return 'CONFIRMED';
  const s = status.toUpperCase();
  if (s === 'Z' || s === 'SUCCESS' || s === 'CONFIRMED' || s === 'ISSUED') return 'CONFIRMED';
  if (s === 'PI' || s === 'PENDING' || s === 'HOLD') return 'HOLD';
  if (s === 'C' || s === 'CA' || s === 'CANCELLED') return 'CANCELLED';
  return s;
};

const getRealPnr = (booking) => {
  const livePnr = booking.liveDetails?.booking_details?.journey_details?.flight_details?.[0]?.segment_details?.[0]?.booking_infos?.[0]?.pnr 
               || booking.liveDetails?.booking_details?.journey_details?.flight_details?.[0]?.segment_details?.[0]?.booking_infos?.[0]?.gds_pnr
               || booking.liveDetails?.pnr;
  if (livePnr) return livePnr;
  if (booking.pnr && booking.pnr !== 'Not Available') return booking.pnr;
  if (booking.tripId) return booking.tripId;
  return 'Confirmed';
};

const SeatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
    <path d="M3 11v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M5 11h14" />
    <path d="M6 18h12" />
  </svg>
);

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

function FlightHeader({ booking, realPnr, statusMapped, statusColorClass }) {
  const airlineName = booking.flightDetails?.airline || 'Airline';

  const segments = booking.liveDetails?.booking_details?.journey_details?.flight_details?.[0]?.segment_details || [];
  const flightNum = segments.length > 0 && segments[0].al && segments[0].fn
    ? `${segments[0].al} ${segments[0].fn}`
    : (booking.flightDetails?.flightNumber || '6E 312');

  const tripId = booking.tripId || booking.bookingId || 'N/A';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100/80">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0B3FB5] flex items-center justify-center text-white shrink-0 shadow-xs">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-45 -translate-x-[1px] translate-y-[1px]">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{airlineName}</h4>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
            {flightNum} &bull; ID: {tripId}{realPnr !== 'Not Available' ? ` &bull; PNR: ${realPnr}` : ''}
          </span>
        </div>
      </div>

      <span className={`px-4 py-1.5 rounded-none text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-3xs ${statusColorClass}`}>
        {statusMapped === 'CONFIRMED' && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {statusMapped}
      </span>
    </div>
  );
}

function RouteSection({ booking }) {
  const depTimeRaw = booking.flightDetails?.departureTime;
  const arrTimeRaw = booking.flightDetails?.arrivalTime;

  const airports = booking.liveDetails?.booking_details?.journey_details?.meta_data?.airports
    || booking.liveDetails?.booking_details?.journey_details?.metaData?.airports
    || {};

  const depCode = booking.flightDetails?.departureAirport || 'CCU';
  const depCity = airports[depCode]?.city || booking.flightDetails?.departureCity || 'Kolkata';
  const depAirport = airports[depCode]?.name || '';

  const arrCode = booking.flightDetails?.arrivalAirport || 'GOX';
  const arrCity = airports[arrCode]?.city || booking.flightDetails?.arrivalCity || 'Goa';
  const arrAirport = airports[arrCode]?.name || '';

  const depDate = depTimeRaw ? dayjs(depTimeRaw).format('DD MMM YYYY') : '';
  const depDay = depTimeRaw ? dayjs(depTimeRaw).format('dddd') : '';
  const depTimeFormatted = depTimeRaw ? dayjs(depTimeRaw).format('hh:mm A') : '';
  const arrTimeFormatted = arrTimeRaw ? dayjs(arrTimeRaw).format('hh:mm A') : '';

  const segments = booking.liveDetails?.booking_details?.journey_details?.flight_details?.[0]?.segment_details || [];
  const stopsText = segments.length > 1
    ? `${segments.length - 1} Stop${segments.length > 2 ? 's' : ''}`
    : 'Direct';

  const getDurationText = (dep, arr) => {
    if (!dep || !arr) return '2h 00m';
    const diffMs = dayjs(arr).diff(dayjs(dep));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs > 0 ? `${diffHrs}h ` : ''}${diffMins}m`;
  };
  const duration = getDurationText(depTimeRaw, arrTimeRaw);

  return (
    <div className="flex-1 flex flex-col justify-center py-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">ORIGIN</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 leading-none">{depCode}</h2>
          {depAirport && <span className="text-xs font-bold text-slate-500 block mt-1 leading-tight" title={depAirport}>{depAirport}</span>}
          <span className="text-[9px] font-medium text-slate-400 block mt-0.5">{depCity}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative min-w-[80px]">
          <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-none tracking-wider leading-none mb-1 block uppercase">
            {stopsText}
          </span>
          <div className="w-full flex items-center justify-center relative">
            <div className="w-full border-t border-dashed border-blue-300 absolute" />
            <div className="w-8 h-8 rounded-full bg-white border border-blue-150 flex items-center justify-center text-blue-600 relative z-10 shadow-3xs">
              <Plane size={14} className="transform rotate-95" />
            </div>
          </div>
          <span className="text-[9px] text-slate-400 font-bold mt-1 leading-none">{duration}</span>
        </div>

        <div className="flex-1 text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">DESTINATION</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 leading-none">{arrCode}</h2>
          {arrAirport && <span className="text-xs font-bold text-slate-500 block mt-1 leading-tight ml-auto" title={arrAirport}>{arrAirport}</span>}
          <span className="text-[9px] font-medium text-slate-400 block mt-0.5">{arrCity}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-slate-100/60">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-none bg-blue-50/50 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar size={15} />
          </div>
          <div>
            <h5 className="text-xs font-black text-slate-900 leading-none mt-0.5">{depDate}</h5>
            <span className="text-[10px] text-slate-400 font-bold block mt-1 leading-none">{depDay}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 justify-end text-right">
          <div className="text-right">
            <h5 className="text-xs font-black text-slate-900 leading-none mt-0.5">{depTimeFormatted}</h5>
            <span className="text-[10px] text-slate-400 font-bold block mt-1 leading-none">Local Time</span>
          </div>
          <div className="w-8 h-8 rounded-none bg-blue-50/50 flex items-center justify-center text-blue-600 shrink-0">
            <Clock size={15} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TravellerCard({ booking, isExpanded, onToggleExpand }) {
  const pax = booking.passengers?.[0] || {};
  const paxName = `${pax.firstName || 'Ajay'} ${pax.lastName || 'Dhayatidak'}`;
  const seatNum = pax.seatNumber || 'Assigned at Check-in';

  const rawAmount = booking.fareDetails?.totalAmount || booking.totalAmount || 0;
  const formattedAmount = Number(rawAmount).toLocaleString('en-IN');

  return (
    <div className="w-full md:w-72 bg-blue-50/30 border border-blue-100 rounded-none p-2.5 flex flex-col justify-between gap-2 shadow-3xs">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-white border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
            <User size={14} />
          </div>
          <div>
            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block leading-none">TRAVELER</span>
            <span className="text-xs font-bold text-slate-800 block mt-1 truncate max-w-[170px]" title={paxName}>
              {paxName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-white border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
            <SeatIcon />
          </div>
          <div>
            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block leading-none">SEAT</span>
            <span className="text-xs font-bold text-slate-800 block mt-1 truncate max-w-[170px]">
              {seatNum}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-1.5 border-t border-blue-100/70 flex items-center justify-between gap-2">
        <div>
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block leading-none">TOTAL PAID</span>
          <span className="text-base font-black text-slate-900 block mt-1">₹{formattedAmount}</span>
        </div>

        {booking.liveDetails && (
          <button
            onClick={onToggleExpand}
            className="px-3 py-1 bg-white border border-blue-150 text-blue-600 rounded-none text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
          >
            <span>Details</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function BookingInfoStrip({ booking, realPnr }) {
  const tripId = booking.tripId || booking.bookingId || 'N/A';

  const segments = booking.liveDetails?.booking_details?.journey_details?.flight_details?.[0]?.segment_details || [];
  const bookingClass = segments.length > 0 && segments[0].booking_infos?.[0]?.cabin_type
    ? segments[0].booking_infos[0].cabin_type
    : (booking.flightDetails?.bookingClass || 'T');

  const fareType = booking.liveDetails?.booking_details?.journey_details?.meta_data?.special_fares?.[0] || 'Regular';

  return (
    <div className="bg-slate-50/60 rounded-none p-2 border border-slate-100 shadow-3xs grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold text-slate-600 mt-1">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-none bg-white border border-slate-150 flex items-center justify-center text-slate-500 shrink-0">
          <Ticket size={14} />
        </div>
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Booking ID</span>
          <span className="text-slate-800 font-extrabold block mt-1 truncate max-w-[120px]" title={tripId}>{tripId}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-none bg-white border border-slate-150 flex items-center justify-center text-slate-500 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="16" y1="2" x2="16" y2="4" />
            <line x1="8" y1="2" x2="8" y2="4" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">PNR</span>
          <span className="text-slate-800 font-extrabold block mt-1 truncate max-w-[120px]" title={realPnr}>{realPnr}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-none bg-white border border-slate-150 flex items-center justify-center text-slate-500 shrink-0">
          <Briefcase size={14} />
        </div>
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Booking Class</span>
          <span className="text-slate-800 font-extrabold block mt-1 uppercase">{bookingClass}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-none bg-white border border-slate-150 flex items-center justify-center text-slate-500 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </div>
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Fare Type</span>
          <span className="text-slate-800 font-extrabold block mt-1 capitalize">{fareType}</span>
        </div>
      </div>
    </div>
  );
}

function TicketActions({ booking, onDownload, onCancel, onViewRefund }) {
  const isCancelled = booking.status === 'Cancelled' || booking.bookingStatus === 'Cancelled' || booking.status === 'cancelled';

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-none py-2 px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Flight Ticket Details',
              text: `Flight booking ticket details for trip: ${booking.tripId || booking.bookingId}`,
              url: window.location.href,
            }).catch(err => console.log('Share failed:', err));
          } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Link copied to clipboard!');
          }
        }}
        className="w-full sm:w-auto px-5 py-2.5 border border-white text-white rounded-none text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <ShareIcon />
        <span>Share</span>
      </button>

      {booking.pnr && (
        <button
          onClick={onDownload}
          className="w-full sm:w-auto px-5 py-2.5 border border-white text-white rounded-none text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download size={14} />
          <span>Download E-Ticket</span>
        </button>
      )}

      {isCancelled ? (
        <button
          onClick={onViewRefund}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 border border-emerald-500 text-white rounded-none text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Ticket size={14} />
          <span>View Refund Details</span>
        </button>
      ) : (
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 bg-white border border-red-200 text-red-655 rounded-none text-xs font-black uppercase tracking-wider hover:bg-red-50 hover:text-red-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <X size={14} />
          <span>Cancel Booking</span>
        </button>
      )}
    </div>
  );
}

function FlightDetailsModal({ show, booking, onClose }) {
  if (!show || !booking || !booking.liveDetails) return null;

  const details = booking.liveDetails.booking_details || booking.liveDetails || {};
  const journey = details.journey_details || {};
  const flightDetails = journey.flight_details?.[0] || {};
  const segmentsList = flightDetails.segment_details || [];
  const airlines = journey.meta_data?.airlines || journey.metaData?.airlines || {};
  const airports = journey.meta_data?.airports || journey.metaData?.airports || {};
  const travelersList = journey.traveller_details || [];
  const userDetails = details.user_details || {};
  const paymentBreakup = details.payment_details?.booking_payment_breakup || {};
  const price = paymentBreakup.pricing_breakup?.[0] || {};
  const fwdTxns = booking.liveDetails.fwd_txns || [];
  const revTxns = booking.liveDetails.rev_txns || [];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-none shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200">

        {/* Header */}
        <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Flight Booking Details</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
              Trip ID: {booking.tripId || booking.bookingId || 'N/A'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto font-['Inter',sans-serif]">

          {/* 1. General Booking Info */}
          <div className="bg-slate-50 p-4 border border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600 rounded-none">
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Booked Date</span>
              <span className="text-slate-800 font-bold block mt-1">
                {details.booked_date ? dayjs(details.booked_date).format('DD MMM YYYY, hh:mm A') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Booking Type</span>
              <span className="text-slate-800 font-bold block mt-1 uppercase">
                {details.booking_type || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Journey Scope</span>
              <span className="text-slate-800 font-bold block mt-1">
                {journey.is_international ? 'International' : 'Domestic'} ({journey.journey_type === 'OW' ? 'One Way' : journey.journey_type})
              </span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Special Fares</span>
              <span className="text-slate-800 font-bold block mt-1">
                {journey.meta_data?.special_fares?.join(', ') || 'N/A'}
              </span>
            </div>
          </div>

          {/* 2. Route Segments */}
          <div>
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <Plane size={14} className="text-blue-600" />
              Flight Route Segments
            </h5>
            <div className="space-y-4 relative pl-4 border-l-2 border-blue-200">
              {segmentsList.map((segment, sIdx) => {
                const airlineName = airlines[segment.al]?.name || segment.al;
                const depCity = airports[segment.dep]?.city || segment.dep;
                const depAirport = airports[segment.dep]?.name || segment.dep;
                const arrCity = airports[segment.arr]?.city || segment.arr;
                const arrAirport = airports[segment.arr]?.name || segment.arr;
                const depTime = dayjs(segment.dd).format('hh:mm A, DD MMM YYYY');
                const arrTime = dayjs(segment.ad).format('hh:mm A, DD MMM YYYY');
                const cabin = segment.booking_infos?.[0]?.cabin_type === 'E' ? 'Economy' : segment.booking_infos?.[0]?.cabin_type || 'Economy';

                // Layover calculation
                let layoverText = null;
                if (sIdx < segmentsList.length - 1) {
                  const nextSegment = segmentsList[sIdx + 1];
                  const diffMs = nextSegment.dd - segment.ad;
                  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  layoverText = `${diffHrs > 0 ? `${diffHrs}h ` : ''}${diffMins}m layover in ${arrCity}`;
                }

                return (
                  <div key={sIdx} className="space-y-2 relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-none bg-blue-600 border-2 border-white shadow-xs" />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white rounded-none p-3 border border-slate-150 shadow-3xs">
                      <div>
                        <div className="text-[10px] font-bold text-blue-600 flex items-center gap-1.5">
                          <span>{airlineName} ({segment.al}-{segment.fn})</span>
                          <span className="px-1.5 py-0.5 rounded-none bg-slate-100 text-slate-600 text-[8px] uppercase tracking-wider font-extrabold">
                            {cabin}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] uppercase tracking-wider font-extrabold">
                            Status: {segment.booking_status}
                          </span>
                        </div>
                        <div className="text-xs font-black text-slate-800 mt-1">
                          {depCity} ({segment.dep}) &rarr; {arrCity} ({segment.arr})
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {depAirport} &rarr; {arrAirport}
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-xs font-extrabold text-slate-700">Dep: {depTime}</div>
                        <div className="text-xs font-extrabold text-slate-700 mt-0.5">Arr: {arrTime}</div>
                        {segment.web_checkin && (
                          <button
                            onClick={() => window.open(segment.web_checkin, '_blank')}
                            className="mt-2 px-2.5 py-1 bg-blue-50 border border-blue-150 text-blue-600 rounded-none text-[8px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all cursor-pointer animate-pulse"
                          >
                            Web Check-in
                          </button>
                        )}
                      </div>
                    </div>

                    {layoverText && (
                      <div className="my-2 py-1 px-3 bg-amber-50/70 border border-amber-100/50 rounded-none text-[9px] font-extrabold text-amber-700 tracking-wider inline-block">
                        {layoverText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Baggage & Travelers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-none p-3.5 border border-slate-150 shadow-3xs">
              <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Briefcase size={12} className="text-slate-500" />
                Baggage Details
              </h6>
              <div className="space-y-1.5 text-[10px] font-semibold text-slate-655">
                {segmentsList.map((seg, sIdx) => (
                  <div key={sIdx} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                    <span>Flight {seg.al}-{seg.fn} ({seg.dep} &rarr; {seg.arr})</span>
                    <span>Cabin: {seg.baggage?.ADT?.cab || '7kg'} | Check-in: {seg.baggage?.ADT?.cib || '15kg'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-none p-3.5 border border-slate-150 shadow-3xs">
              <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                <User size={12} className="text-slate-500" />
                Travelers Details
              </h6>
              <div className="space-y-2 text-[10px] font-bold text-slate-700">
                {travelersList.map((t, tIdx) => (
                  <div key={tIdx} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0 last:mb-0 capitalize">
                    <div className="flex justify-between">
                      <span>{t.title}. {t.fn} {t.ln}</span>
                      <span className="text-blue-600 text-[9px] uppercase tracking-wider font-extrabold">{t.type}</span>
                    </div>
                    <div className="flex gap-4 text-[9px] text-slate-400 font-semibold mt-0.5">
                      <span>Nationality: {t.nationality || 'IN'}</span>
                      <span>DOB: {t.dob ? dayjs(t.dob).format('DD MMM YYYY') : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Contact & Pricing Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-none p-3.5 border border-slate-150 shadow-3xs">
              <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Mail size={12} className="text-slate-500" />
                Contact & Communication
              </h6>
              <div className="space-y-1 text-[10px] font-semibold text-slate-655">
                <div className="flex justify-between">
                  <span>Email Address:</span>
                  <span className="font-bold text-slate-800">{userDetails.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Phone Number:</span>
                  <span className="font-bold text-slate-800">{userDetails.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#fcfdfd] border border-slate-200 rounded-none p-3.5 space-y-2">
              <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Wallet size={12} className="text-slate-500" />
                Payment Breakdown ({details.payment_details?.currency || 'INR'})
              </h6>
              <div className="flex justify-between text-[10px] font-bold text-slate-550">
                <span>Base Fare {price.fare_group?.brand_name ? `(${price.fare_group.brand_name})` : ''}</span>
                <span>₹{price.base_fare || 0}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-550">
                <span>Taxes & Fees</span>
                <span>₹{price.total_taxes || 0}</span>
              </div>
              {price.convenience_fees > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-slate-550">
                  <span>Convenience Fees</span>
                  <span>₹{price.convenience_fees}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-blue-600 text-sm">₹{paymentBreakup.total || 0}</span>
              </div>
            </div>
          </div>

          {/* 5. Transaction Records (Forward & Reverse) */}
          {(fwdTxns.length > 0 || revTxns.length > 0) && (
            <div className="bg-white rounded-none p-3.5 border border-slate-150 shadow-3xs">
              <h6 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-3">
                Financial Transactions
              </h6>
              <div className="space-y-2 text-[10px] font-semibold">
                {fwdTxns.map((txn, tIdx) => (
                  <div key={`fwd-${tIdx}`} className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-extrabold uppercase">
                        Payment: {txn.status === 'S' ? 'SUCCESS' : txn.status}
                      </span>
                      <span className="text-slate-400">
                        {dayjs(txn.transaction_time).format('DD MMM YYYY, hh:mm A')}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-800">
                      Amount: ₹{txn.amount || 0}
                    </span>
                  </div>
                ))}
                {revTxns.map((txn, rIdx) => (
                  <div key={`rev-${rIdx}`} className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-none bg-red-50 text-red-600 border border-red-100 text-[8px] font-extrabold uppercase">
                        Refund: {txn.status}
                      </span>
                      <span className="text-slate-400">
                        {dayjs(txn.transaction_time).format('DD MMM YYYY, hh:mm A')}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-800">
                      Amount: ₹{txn.amount || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-150 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-none cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [busBookings, setBusBookings] = useState([]);
  const [flightBookings, setFlightBookings] = useState([]);
  const [flightPage, setFlightPage] = useState(1);
  const [flightTotalPages, setFlightTotalPages] = useState(1);
  const [totalFlightBookingsCount, setTotalFlightBookingsCount] = useState(0);
  const isInitialMount = useRef(true);

  // Ticket Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [fetchingRefund, setFetchingRefund] = useState(false);
  const [hotelRefundData, setHotelRefundData] = useState(null);

  // Flight cancellation reasons state
  const [cancelReasons, setCancelReasons] = useState([]);
  const [selectedReasonCode, setSelectedReasonCode] = useState('');
  const [fetchingReasons, setFetchingReasons] = useState(false);
  const [flightRefundData, setFlightRefundData] = useState(null);
  const [fetchingFlightRefund, setFetchingFlightRefund] = useState(false);
  const [flightRefundError, setFlightRefundError] = useState(null);

  // Live Status Modal State
  const [showLiveStatusModal, setShowLiveStatusModal] = useState(false);
  const [liveTripDetails, setLiveTripDetails] = useState(null);
  const [loadingLiveStatus, setLoadingLiveStatus] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');

  // Flight Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsBooking, setSelectedDetailsBooking] = useState(null);

  // Flight Refund Details Modal State
  const [showRefundInfoModal, setShowRefundInfoModal] = useState(false);
  const [flightRefundInfoData, setFlightRefundInfoData] = useState(null);
  const [fetchingRefundInfo, setFetchingRefundInfo] = useState(false);
  const [refundInfoError, setRefundInfoError] = useState(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState('flight');
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

  const fetchFlightPage = async (page) => {
    try {
      const flightRes = await getUserFlightBookings(page, 3).catch(err => {
        console.error("Failed to fetch flight bookings page:", err);
        return { bookings: [], totalPages: 1, total: 0 };
      });
      const normalizedFlights = (flightRes?.bookings || []).map(b => ({ ...b, type: 'flight' }));

      const flightBookingsWithDetails = await Promise.all(
        normalizedFlights.map(async (fb) => {
          if (fb.tripId) {
            try {
              const tripRes = await fetchFlightTripDetails(fb.tripId);
              if (tripRes.success && tripRes.data) {
                const liveData = tripRes.data.data || tripRes.data;
                const liveStatus = liveData.booking_details?.booking_status || fb.bookingStatus || fb.status;
                return {
                  ...fb,
                  liveDetails: liveData,
                  bookingStatus: (fb.bookingStatus === 'cancelled' || fb.bookingStatus === 'Cancelled' || fb.status === 'cancelled' || fb.status === 'Cancelled') ? 'Cancelled' : liveStatus,
                  status: (fb.bookingStatus === 'cancelled' || fb.bookingStatus === 'Cancelled' || fb.status === 'cancelled' || fb.status === 'Cancelled') ? 'Cancelled' : liveStatus
                };
              }
            } catch (err) {
              console.error(`Failed to fetch live flight details for ${fb.tripId}:`, err);
            }
          }
          return fb;
        })
      );

      setFlightBookings(flightBookingsWithDetails);
      setFlightTotalPages(flightRes?.totalPages || 1);
      setTotalFlightBookingsCount(flightRes?.total || flightRes?.bookings?.length || 0);
    } catch (err) {
      console.error("Failed to load flight page:", err);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (user) {
      fetchFlightPage(flightPage);
    }
  }, [flightPage]);

  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const [busRes, hotelRes, flightRes] = await Promise.all([
        getUserBookings().catch(() => []),
        getUserHotelBookings().catch(() => ({ bookings: [] })),
        getUserFlightBookings(1, 3).catch(err => {
          console.error("Failed to fetch flight bookings:", err);
          return { bookings: [], totalPages: 1, total: 0 };
        })
      ]);

      const normalizedBus = busRes.map(b => ({ ...b, type: 'bus' }));
      const normalizedHotels = (hotelRes?.bookings || []).map(b => ({ ...b, type: 'hotel' }));
      const normalizedFlights = (flightRes?.bookings || []).map(b => ({ ...b, type: 'flight' }));

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

      // Fetch live Cleartrip details for each flight booking
      const flightBookingsWithDetails = await Promise.all(
        normalizedFlights.map(async (fb) => {
          if (fb.tripId) {
            try {
              const tripRes = await fetchFlightTripDetails(fb.tripId);
              if (tripRes.success && tripRes.data) {
                const liveData = tripRes.data.data || tripRes.data;
                const liveStatus = liveData.booking_details?.booking_status || fb.bookingStatus || fb.status;
                return {
                  ...fb,
                  liveDetails: liveData,
                  bookingStatus: (fb.bookingStatus === 'cancelled' || fb.bookingStatus === 'Cancelled' || fb.status === 'cancelled' || fb.status === 'Cancelled') ? 'Cancelled' : liveStatus,
                  status: (fb.bookingStatus === 'cancelled' || fb.bookingStatus === 'Cancelled' || fb.status === 'cancelled' || fb.status === 'Cancelled') ? 'Cancelled' : liveStatus
                };
              }
            } catch (err) {
              console.error(`Failed to fetch live flight details for ${fb.tripId}:`, err);
            }
          }
          return fb;
        })
      );

      setBusBookings(normalizedBus);
      setHotelBookings(hotelBookingsWithDetails);
      setFlightBookings(flightBookingsWithDetails);
      setFlightTotalPages(flightRes?.totalPages || 1);
      setTotalFlightBookingsCount(flightRes?.total || flightRes?.bookings?.length || 0);
      setFlightPage(1);

      const allBookings = [...normalizedBus, ...flightBookingsWithDetails, ...hotelBookingsWithDetails];
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

  const fetchFlightRefundInfo = async (tripId, reasonCode) => {
    if (!tripId || !reasonCode) return;
    setFetchingFlightRefund(true);
    setFlightRefundData(null);
    setFlightRefundError(null);
    try {
      const res = await getFlightCancelRefundInfoApi(tripId, reasonCode);
      if (res.success && res.data) {
        setFlightRefundData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch flight refund preview details:', err);
      const errMsg = err.response?.data?.details?.errorMessage || err.response?.data?.message || 'Failed to retrieve flight refund preview details';
      setFlightRefundError(errMsg);
    } finally {
      setFetchingFlightRefund(false);
    }
  };

  const openCancelModal = async (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setHotelRefundData(null);
    setFlightRefundData(null);
    setFlightRefundError(null);
    setCancelReasons([]);
    setSelectedReasonCode('');

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
    } else if (booking.type === 'flight') {
      setFetchingReasons(true);
      try {
        const res = await getFlightCancelReasonsApi(booking.tripId);
        if (res.success && Array.isArray(res.reasons)) {
          setCancelReasons(res.reasons);
          if (res.reasons.length > 0) {
            const firstCode = res.reasons[0].reason_code;
            setSelectedReasonCode(firstCode);
            // Fetch live flight cancellation refund preview from Cleartrip B2B
            fetchFlightRefundInfo(booking.tripId, firstCode);
          }
        }
      } catch (err) {
        console.error('Failed to fetch flight cancel reasons:', err);
        toast.error('Could not fetch cancellation reasons from Cleartrip');
      } finally {
        setFetchingReasons(false);
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
        fetchBookings();
      } else if (selectedBooking.type === 'flight') {
        if (!selectedReasonCode) {
          toast.error('Please select a cancellation reason');
          setCancelling(false);
          return;
        }
        await cancelFlightBookingApi(selectedBooking._id, selectedReasonCode);
        toast.success('Flight ticket cancelled successfully. Refund initiated.');
        fetchFlightPage(flightPage);
      } else {
        await cancelTicket(selectedBooking._id);
        toast.success('Ticket cancelled successfully. Refund initiated.');
        fetchBookings();
      }
      setShowCancelModal(false);
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

  const handleCheckRefundInfo = async (tripId) => {
    setFetchingRefundInfo(true);
    setSelectedTripId(tripId);
    setRefundInfoError(null);
    setFlightRefundInfoData(null);
    try {
      const response = await getFlightRefundInfoApi(tripId);
      if (response.success && response.data) {
        setFlightRefundInfoData(response.data);
        setShowRefundInfoModal(true);
      } else {
        toast.error(response.message || 'Failed to fetch refund details');
        setRefundInfoError(response.message || 'Failed to fetch refund details');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch refund details';
      toast.error(errMsg);
      setRefundInfoError(errMsg);
    } finally {
      setFetchingRefundInfo(false);
    }
  };

  const calculateRefundPreview = (booking) => {
    if (!booking) return null;
    const now = new Date();

    let departureDate = null;

    if (booking.type === 'flight') {
      const depTime = booking.flightDetails?.departureTime;
      departureDate = depTime ? new Date(depTime) : null;
    } else {
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

      if (booking.travelDate) {
        const dateParts = booking.travelDate.split('-');
        departureDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2]),
          hour, minute, 0
        );
      }
    }

    if (!departureDate || isNaN(departureDate.getTime())) return null;

    const hoursLeft = (departureDate - now) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursLeft > 24) refundPercent = 80;
    else if (hoursLeft > 12) refundPercent = 50;
    else if (hoursLeft > 6) refundPercent = 25;
    else refundPercent = 0;

    const totalFare = booking.totalFare || booking.fareDetails?.totalAmount || 0;
    const refundAmount = Math.round((totalFare * refundPercent) / 100);
    const charges = totalFare - refundAmount;

    return { refundPercent, refundAmount, charges, hoursLeft };
  };

  const displayedBookings = activeBookingTab === 'flight'
    ? flightBookings
    : hotelBookings.slice((currentPage - 1) * 3, currentPage * 3);

  const totalPages = activeBookingTab === 'flight'
    ? flightTotalPages
    : Math.max(1, Math.ceil(hotelBookings.length / 3));

  const activePage = activeBookingTab === 'flight' ? flightPage : currentPage;

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
                <div className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                  {busBookings.length + hotelBookings.length + totalFlightBookingsCount}
                </div>
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
                    { id: 'flight', label: 'Flight' },
                    { id: 'hotel', label: 'Hotel' }
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
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <span className="text-xs text-slate-400 font-semibold tracking-wide">Retrieving bookings list...</span>
                </div>
              ) : displayedBookings.length === 0 ? (
                /* Premium Empty State Illustration */
                <div className="border-2 border-dashed border-blue-100 rounded-3xl p-8 py-14 flex-1 flex flex-col items-center justify-center text-center mt-6">
                  {/* Suitcase & plane inline SVG */}
                  <svg width="160" height="130" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-5">
                    <circle cx="100" cy="85" r="50" fill="#EFF6FF" />
                    {/* Suitcase Body */}
                    <rect x="75" y="60" width="50" height="55" rx="8" fill="#2563EB" />
                    <rect x="80" y="65" width="40" height="45" rx="4" fill="#3B82F6" />
                    {/* Handle */}
                    <path d="M85 60V48C85 44.6863 87.6863 42 91 42H109C112.314 42 115 44.6863 115 48V60" stroke="#2563EB" strokeWidth="4" />
                    {/* Wheels */}
                    <circle cx="85" cy="120" r="5" fill="#1D4ED8" />
                    <circle cx="115" cy="120" r="5" fill="#1D4ED8" />
                    {/* Paper Plane */}
                    <path d="M142 45L122 70L134 72L142 85L150 72L162 70L142 45Z" fill="#93C5FD" />
                    <path d="M122 70L142 85V72L122 70Z" fill="#60A5FA" />
                    <path d="M100 85C115 80 120 60 142 45" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
                  </svg>

                  <h4 className="text-sm font-extrabold text-slate-800">No journeys to show</h4>
                  <p className="text-slate-400 text-xs mt-1 max-w-[280px] leading-relaxed">
                    Looks like you haven't booked any trips yet. Start exploring and book your next adventure!
                  </p>

                  <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 cursor-pointer"
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
                                <span className={`text-[10px] font-extrabold uppercase mt-1 block ${(booking.status === 'Cancelled' || booking.status === 'cancelled') ? 'text-red-400' : 'text-emerald-400'
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

                    if (booking.type === 'bus') {
                      return (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-350 hover:shadow-sm transition-all duration-300 relative overflow-hidden group">
                          {/* Left accent color strip */}
                          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-500" />

                          {/* Header bar */}
                          <div className="pl-6 pr-5 py-3.5 bg-slate-50/60 flex flex-wrap justify-between items-center gap-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-red-500">
                                <Bus size={15} />
                              </div>
                              <div>
                                <div className="text-xs font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-md">
                                  {booking.bus?.name || 'Bus Service'}
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none mt-0.5">
                                  BUS &bull; ID: {booking.bookingId || booking.pnrNumber || 'N/A'}
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
                                  {booking.from || booking.boardingPoint}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                                  <Calendar size={12} className="text-indigo-655" />
                                  {booking.travelDate}
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
                                  {booking.to || booking.droppingPoint}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1 justify-end">
                                  <Clock size={12} className="text-indigo-655" />
                                  {booking.departureTime || 'N/A'}
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
                                    {booking.passengerName || 'Passenger'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] font-extrabold text-slate-455 uppercase tracking-widest block leading-none">Seat</span>
                                  <span className="text-xs font-bold text-slate-700 mt-1 block truncate max-w-[70px]">
                                    {booking.seatNumber || 'N/A'}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                                <div>
                                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none font-semibold">Total Paid</span>
                                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                                    ₹{booking.totalFare || 0}
                                  </span>
                                </div>

                                <div className="flex gap-2">
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
                    }

                    // Flight Booking type
                    const realPnr = getRealPnr(booking);
                    const statusMapped = getFlightStatusLabel(booking.status || booking.bookingStatus);
                    const statusColorClass = statusMapped === 'CONFIRMED'
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-750'
                      : statusMapped === 'HOLD'
                        ? 'bg-amber-50 border-amber-250 text-amber-750'
                        : 'bg-red-50 border-red-250 text-red-750';

                    return (
                      <div key={idx} className="bg-white rounded-none border border-slate-200 shadow-sm relative hover:shadow-md transition-all duration-300 overflow-hidden group max-w-4xl mx-auto">

                        {/* Top-left Blue Corner Ribbon Accent */}
                        <div className="absolute top-0 left-0 w-2 h-10 bg-blue-600 rounded-none" />
                        <div className="absolute top-0 left-0 h-2 w-8 bg-blue-600 rounded-none" />

                        <div className="pl-5 pr-5 pt-3 pb-2.5 flex flex-col gap-3">

                          {/* 1. Header */}
                          <FlightHeader
                            booking={booking}
                            realPnr={realPnr}
                            statusMapped={statusMapped}
                            statusColorClass={statusColorClass}
                          />

                          {/* 2. Route & Traveler Row (Desktop: Side-by-side, Mobile: Stacked) */}
                          <div className="flex flex-col md:flex-row justify-between gap-6">

                            {/* Route details */}
                            <RouteSection booking={booking} />

                            {/* Divider Line in Desktop */}
                            <div className="hidden md:block w-px border-l border-dashed border-slate-200 self-stretch my-2" />

                            <TravellerCard
                              booking={booking}
                              isExpanded={false}
                              onToggleExpand={() => { setSelectedDetailsBooking(booking); setShowDetailsModal(true); }}
                            />

                          </div>

                          {/* 3. Bottom Information Strip */}
                          <BookingInfoStrip booking={booking} realPnr={realPnr} />

                        </div>

                        {/* 4. Ticket Actions Bar */}
                        <TicketActions
                          booking={booking}
                          onDownload={() => window.open(`${import.meta.env.VITE_API_URL}/api/tickets/generate/${booking.pnr}`, '_blank')}
                          onCancel={() => openCancelModal(booking)}
                          onViewRefund={() => handleCheckRefundInfo(booking.tripId)}
                        />

                      </div>
                    );
                  })}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                      <button
                        onClick={() => {
                          if (activeBookingTab === 'flight') {
                            setFlightPage(prev => Math.max(prev - 1, 1));
                          } else {
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                          }
                        }}
                        disabled={activePage === 1}
                        className="px-4 py-2 border border-slate-250 bg-white text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-slate-550 font-semibold">
                        Page {activePage} of {totalPages}
                      </span>
                      <button
                        onClick={() => {
                          if (activeBookingTab === 'flight') {
                            setFlightPage(prev => Math.min(prev + 1, totalPages));
                          } else {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                          }
                        }}
                        disabled={activePage === totalPages}
                        className="px-4 py-2 border border-slate-250 bg-white text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
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
              <p className="text-sm text-slate-505 leading-relaxed">
                {selectedBooking.type === 'flight'
                  ? 'Are you sure you want to cancel this ticket? Please select a cancellation reason:'
                  : 'Are you sure you want to cancel this ticket? The cancellation policy refund preview is below:'}
              </p>
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
              ) : (
                <div className="space-y-4">
                  {selectedBooking.type === 'flight' && (
                    <div className="space-y-4">
                      {/* Reason Dropdown Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          Reason for Cancellation
                        </label>
                        {fetchingReasons ? (
                          <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Fetching cancellation reasons...</span>
                          </div>
                        ) : cancelReasons.length > 0 ? (
                          <select
                            value={selectedReasonCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedReasonCode(val);
                              fetchFlightRefundInfo(selectedBooking.tripId, val);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            {cancelReasons.map((r) => (
                              <option key={r.reason_code} value={r.reason_code}>
                                {r.reason}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold block">
                            No cancellation reasons returned from Cleartrip.
                          </span>
                        )}
                      </div>

                      {/* Live Flight Refund Details */}
                      {fetchingFlightRefund ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500 text-xs">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span>Fetching live refund details from Cleartrip...</span>
                        </div>
                      ) : flightRefundData ? (() => {
                        const breakup = flightRefundData.refund_breakup || flightRefundData;
                        const grossAmount = breakup.gross_amount || breakup.paid_amount || 0;
                        const airlineCharge = breakup.airline_charge || 0;
                        const partnerFee = breakup.partner_fee || 0;
                        const refundAmount = breakup.total_refund_amount !== undefined ? breakup.total_refund_amount : (breakup.refund_amount || 0);

                        return (
                          <div className="bg-[#f4fbf7] rounded-xl p-4 border border-[#e6f7ee] space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-slate-550">
                              <span>Total Paid Amount</span>
                              <span>₹{grossAmount}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-red-500">
                              <span>Airline Cancellation Charges</span>
                              <span>- ₹{airlineCharge}</span>
                            </div>
                            {partnerFee > 0 && (
                              <div className="flex justify-between text-xs font-semibold text-red-500">
                                <span>Partner Fee</span>
                                <span>- ₹{partnerFee}</span>
                              </div>
                            )}
                            <div className="pt-2 border-t border-[#d2f3e0] flex justify-between items-center text-sm font-bold text-slate-900">
                              <span>Estimated Refund</span>
                              <span className="text-[#10b981] text-base">₹{refundAmount}</span>
                            </div>
                          </div>
                        );
                      })()
                      : flightRefundError ? (
                        <div className="text-xs text-amber-600 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/50 leading-relaxed font-semibold">
                          <strong className="block font-black text-amber-800 mb-0.5">Refund Info Unavailable</strong>
                          {selectedBooking.status === 'HOLD' || selectedBooking.bookingStatus === 'H' || selectedBooking.status === 'Hold' ? (
                            "This booking is currently on HOLD. Refund details are only available for fully ticketed/confirmed bookings."
                          ) : (
                            `Cleartrip B2B: ${flightRefundError}`
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-red-500 text-center py-2 bg-red-50/55 rounded-xl border border-red-100">
                          Unable to retrieve flight refund preview details.
                        </div>
                      )}
                    </div>
                  )}

                  {selectedBooking.type !== 'flight' && (() => {
                    const refund = calculateRefundPreview(selectedBooking);
                    if (!refund) return null;
                    return (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                          <span>Total Fare</span>
                          <span>₹{selectedBooking.totalFare || selectedBooking.fareDetails?.totalAmount || 0}</span>
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
              )}
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

      {/* Flight Refund Info Modal */}
      {showRefundInfoModal && flightRefundInfoData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setShowRefundInfoModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-150 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Refund Details</h3>
              <button onClick={() => setShowRefundInfoModal(false)} className="text-slate-400 hover:text-slate-655">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-['Inter',sans-serif]">
              {(() => {
                const refundInfo = flightRefundInfoData.refund_info || {};
                const txnIds = Object.keys(refundInfo);
                if (txnIds.length === 0) {
                  return <div className="text-xs text-center text-slate-500 py-4">No refund details available.</div>;
                }
                const firstTxnId = txnIds[0];
                const refundList = refundInfo[firstTxnId] || [];
                const firstRefund = refundList[0] || {};

                return (
                  <>
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-150">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Transaction ID</span>
                      <div className="text-lg font-black text-slate-900 mt-0.5">{firstTxnId}</div>
                      
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                        Cancelled on: {firstRefund.cancelled_time || 'N/A'}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Passenger and Ticket Info */}
                      <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Refund Details</span>
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>Passenger Name</span>
                          <span className="text-slate-800 font-bold">{firstRefund.pax_info || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>Sector</span>
                          <span className="text-slate-800 font-bold uppercase">{firstRefund.sector || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>Booking Status</span>
                          <span className="text-red-650 font-bold uppercase">{firstRefund.booking_status || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="bg-[#f4fbf7] rounded-xl p-4 border border-[#e6f7ee] space-y-2.5">
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest block">Refund Breakdown</span>
                        
                        <div className="flex justify-between text-xs font-semibold text-slate-550">
                          <span>Airline Cancellation Charge</span>
                          <span className="text-red-500">- ₹{Math.abs(parseFloat(firstRefund.supplier_charge || 0))}</span>
                        </div>

                        {parseFloat(firstRefund.partner_charges || 0) !== 0 && (
                          <div className="flex justify-between text-xs font-semibold text-slate-550">
                            <span>Partner Charges / Fees</span>
                            <span className="text-red-500">- ₹{Math.abs(parseFloat(firstRefund.partner_charges || 0))}</span>
                          </div>
                        )}

                        {parseFloat(firstRefund.convenience_fee_charged || 0) > 0 && (
                          <div className="flex justify-between text-xs font-semibold text-slate-550">
                            <span>Convenience Fee</span>
                            <span className="text-red-500">- ₹{firstRefund.convenience_fee_charged}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#d2f3e0] flex justify-between items-center text-sm font-bold text-slate-900">
                          <span>Total Refund Amount</span>
                          <span className="text-[#10b981] text-base font-black">
                            ₹{parseFloat(firstRefund.total_refund_amount || firstRefund.refund_amount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-6 border-t border-slate-150 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowRefundInfoModal(false)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Details Modal */}
      <FlightDetailsModal
        show={showDetailsModal}
        booking={selectedDetailsBooking}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDetailsBooking(null);
        }}
      />
    </div>
  );
}
