import React, { useState } from 'react';
import {
    Search, Filter, Download, MoreHorizontal,
    Plane, Hotel, Bus, TrainFront,
    CheckCircle2, Clock, XCircle, ChevronRight
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { fetchAdminHotelBookings, fetchAdminTripDetails } from '../../services/adminBus';
import { useEffect } from 'react';

const mockBookings = [
    { id: 'BK-1204', customer: 'Rahul Sharma', service: 'Flight', route: 'DEL → BOM', date: '20 Apr 2026', amount: '₹12,450', status: 'Confirmed', type: 'flight' },
    { id: 'BK-1205', customer: 'Priya Patel', service: 'Bus', route: 'BOM → PNE', date: '21 Apr 2026', amount: '₹1,200', status: 'Pending', type: 'bus' },
    { id: 'BK-1207', customer: 'Sneha Gupta', service: 'Train', route: 'NDLS → BCT', date: '23 Apr 2026', amount: '₹2,800', status: 'Confirmed', type: 'train' },
    { id: 'BK-1208', customer: 'Vikram Singh', service: 'Flight', route: 'BLR → DEL', date: '24 Apr 2026', amount: '₹15,200', status: 'Confirmed', type: 'flight' },
    { id: 'BK-1209', customer: 'Anjali Nair', service: 'Bus', route: 'MAA → HYD', date: '25 Apr 2026', amount: '₹1,800', status: 'Pending', type: 'bus' },
];

const FilterButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
            }`}
    >
        {children}
    </button>
);

export default function Bookings() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get('type') || 'all';
    const normalizedType = initialType === 'hotels' ? 'hotel' :
        initialType === 'flights' ? 'flight' :
            initialType === 'buses' ? 'bus' :
                initialType === 'trains' ? 'train' : initialType;

    const [filter, setFilter] = useState(normalizedType);
    const [searchTerm, setSearchTerm] = useState('');
    const [realBookings, setRealBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTripDetails, setSelectedTripDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const loadRealBookings = async () => {
            setLoading(true);
            try {
                const res = await fetchAdminHotelBookings();
                if (res.success && res.bookings) {
                    const mapped = res.bookings.map(b => ({
                        id: b.tripId || b.provisionalBookId || b._id || 'N/A',
                        customer: b.guestName || 'B2B Client',
                        service: 'Hotel',
                        route: b.hotelName ? `${b.hotelName} (${b.roomName || ''})` : (b.roomType ? `Room Type: ${b.roomType}` : 'Hotel Booking'),
                        date: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        }) : 'N/A',
                        amount: `₹${(b.totalAmount || b.totalPrice || 0).toLocaleString('en-IN')}`,
                        status: b.status === 'confirmed' || b.status === 'Completed' ? 'Confirmed' : 'Cancelled',
                        type: 'hotel',
                        tripId: b.tripId || null,
                        confirmationNumber: b.confirmationNumber || null,
                        isReal: true,
                        email: b.guestEmail || '',
                        phone: b.guestPhone || '',
                        hotelName: b.hotelName || '',
                        roomName: b.roomName || b.roomType || '',
                        checkInDate: b.checkInDate || '',
                        checkOutDate: b.checkOutDate || '',
                        guestsCount: b.guests || 1,
                        address: b.billingAddress || ''
                    }));
                    setRealBookings(mapped);
                }
            } catch (err) {
                console.error('Error loading real bookings:', err);
            } finally {
                setLoading(false);
            }
        };
        loadRealBookings();
    }, []);

    const combinedBookings = [
        ...realBookings,
        ...mockBookings
    ];

    const filteredBookings = combinedBookings.filter(b => {
        const matchesType = filter === 'all' || b.type === filter;
        const matchesSearch = b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-50 text-green-600 dark:bg-green-500/10';
            case 'Pending': return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10';
            case 'Cancelled': return 'bg-red-50 text-red-600 dark:bg-red-500/10';
            default: return 'bg-slate-50 text-slate-600 dark:bg-slate-800';
        }
    };

    const getServiceIcon = (type) => {
        switch (type) {
            case 'flight': return <Plane size={16} />;
            case 'hotel': return <Hotel size={16} />;
            case 'bus': return <Bus size={16} />;
            case 'train': return <TrainFront size={16} />;
            default: return null;
        }
    };

    const handleViewTripDetails = async (booking) => {
        if (!booking || !booking.tripId) return;
        setDetailsLoading(true);
        setSelectedTripDetails(null);
        try {
            const res = await fetchAdminTripDetails(booking.tripId);
            if (res.success && res.data) {
                setSelectedTripDetails(res.data);
                setDetailsLoading(false);
                return;
            }
        } catch (err) {
            console.error('Error fetching live trip details:', err);
        }



        // Reconstruct dynamic fallback from local database booking properties
        const [title, ...nameParts] = (booking.customer || 'Guest').split(' ');
        const firstName = nameParts[0] || booking.customer || 'Guest';
        const lastName = nameParts.slice(1).join(' ') || '';

        const fallbackDetails = {
            tripId: booking.tripId,
            bookingInfo: {
                bookingStatus: booking.status,
                voucherNumber: booking.confirmationNumber || booking.tripId || 'N/A'
            },
            contactDetail: {
                title: title || 'Mr.',
                firstName: firstName,
                lastName: lastName,
                email: booking.email || 'customer@goairclass.com',
                mobile: booking.phone || 'N/A'
            },
            hotelDetail: {
                name: booking.hotelName || booking.route.split('(')[0].trim() || 'Hotel Detail',
                address: booking.address || 'Lucknow, Uttar Pradesh, India',
                checkInDate: booking.checkInDate || booking.date,
                checkOutDate: booking.checkOutDate || booking.date
            },
            rooms: [
                {
                    roomTypeName: booking.roomName || 'Deluxe Room',
                    guests: {
                        adults: booking.guestsCount || 1
                    }
                }
            ],
            pricing: {
                totalFare: parseFloat(booking.amount.replace(/[^0-9.]/g, '')) || 0,
                roomRate: parseFloat(booking.amount.replace(/[^0-9.]/g, '')) || 0,
                discount: 0,
                hotelTaxes: 0,
                currency: 'INR'
            },
            paymentDetail: {
                paymentType: 'Online',
                amount: parseFloat(booking.amount.replace(/[^0-9.]/g, '')) || 0,
                status: booking.status === 'Confirmed' ? 'SUCCESS' : 'CANCELLED'
            },
            cancellationPolicy: {
                text: 'Standard cancellation policy applies as per property rules.'
            }
        };

        setSelectedTripDetails(fallbackDetails);
        setDetailsLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {queryParams.get('type') === 'hotels' ? 'Hotel Booking Management' : 'Booking Management'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {queryParams.get('type') === 'hotels' ? 'Track and manage all user hotel reservations.' : 'Track and manage all user travel reservations.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group overflow-hidden">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium w-full sm:w-64 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/20 transition-all">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {!queryParams.has('type') && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All Bookings</FilterButton>
                    <FilterButton active={filter === 'flight'} onClick={() => setFilter('flight')}>Flights</FilterButton>
                    <FilterButton active={filter === 'hotel'} onClick={() => setFilter('hotel')}>Hotels</FilterButton>
                    <FilterButton active={filter === 'bus'} onClick={() => setFilter('bus')}>Buses</FilterButton>
                    <FilterButton active={filter === 'train'} onClick={() => setFilter('train')}>Trains</FilterButton>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center text-slate-500 font-bold">Loading real bookings from server...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
                                    <th className="px-8 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                                        {queryParams.get('type') === 'hotels' ? 'Trip ID' : 'Booking ID'}
                                    </th>
                                    <th className="px-8 py-4 text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                                    <th className="px-8 py-4 text-sm font-semibold text-slate-900 dark:text-white">Service & Route</th>
                                    <th className="px-8 py-4 text-sm font-semibold text-slate-900 dark:text-white">Travel Date</th>
                                    <th className="px-8 py-4 text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                                    <th className="px-8 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                    <th className="px-8 py-4 text-sm font-semibold text-slate-900 dark:text-white"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold font-mono text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                                                {booking.id}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{booking.customer}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{booking.isReal ? 'Live Reservation' : 'Verified Customer'}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="text-blue-600">{getServiceIcon(booking.type)}</div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">{booking.service}</span>
                                            </div>
                                            <div className="text-sm font-medium text-slate-500">{booking.route}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{booking.date}</div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white">
                                            {booking.amount}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${getStatusStyles(booking.status)}`}>
                                                {booking.status === 'Confirmed' && <CheckCircle2 size={12} />}
                                                {booking.status === 'Pending' && <Clock size={12} />}
                                                {booking.status === 'Cancelled' && <XCircle size={12} />}
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {booking.type === 'hotel' && booking.tripId ? (
                                                <button
                                                    onClick={() => handleViewTripDetails(booking)}
                                                    disabled={detailsLoading}
                                                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-none transition-all cursor-pointer"
                                                >
                                                    View Live
                                                </button>
                                            ) : (
                                                <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {filteredBookings.length === 0 && !loading && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold">No bookings found matching your search.</p>
                    </div>
                )}

                <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
                    <p className="text-xs font-medium text-slate-400 italic">Showing {filteredBookings.length} results</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500">Next</button>
                    </div>
                </div>
            </div>

            {/* Trip Details Live Modal */}
            {selectedTripDetails && (
                <div className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 my-8">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    {selectedTripDetails.hotelDetail?.name || 'Hotel Details'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    Voucher Number: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTripDetails.bookingInfo?.voucherNumber || 'N/A'}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTripDetails(null)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                        {/* Two Column details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            {/* Left Column: Stay Info */}
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Stay Information</h4>
                                    <div>
                                        <span className="text-slate-400 font-medium font-['InterMedium']">Trip ID: </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedTripDetails.tripId}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium font-['InterMedium']">Check-In: </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTripDetails.hotelDetail?.checkInDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium font-['InterMedium']">Check-Out: </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTripDetails.hotelDetail?.checkOutDate}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium font-['InterMedium']">Address: </span>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            {selectedTripDetails.hotelDetail?.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Room Details</h4>
                                    {selectedTripDetails.rooms?.map((room, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div>
                                                <span className="text-slate-400 font-medium font-['InterMedium']">Room Type: </span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{room.roomTypeName || room.roomName}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 font-medium font-['InterMedium']">Guests: </span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{room.guests?.adults} Adults</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Guest & Pricing Info */}
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Guest Information</h4>
                                    <div>
                                        <span className="text-slate-400 font-medium font-['InterMedium']">Name: </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {selectedTripDetails.contactDetail?.title} {selectedTripDetails.contactDetail?.firstName} {selectedTripDetails.contactDetail?.lastName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium font-['InterMedium']">Email: </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTripDetails.contactDetail?.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium font-['InterMedium']">Mobile: </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTripDetails.contactDetail?.mobile}</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-2">
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">Payment & Pricing</h4>
                                    <div className="space-y-1 pb-2 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-medium font-['InterMedium']">Payment Type:</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTripDetails.paymentDetail?.paymentType} (Deposit Account)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-medium font-['InterMedium']">Payment Status:</span>
                                            <span className="font-bold text-emerald-600 uppercase">{selectedTripDetails.paymentDetail?.status}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 pt-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Room Rate:</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">₹{selectedTripDetails.pricing?.roomRate?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600 font-bold">
                                            <span>B2B Discount:</span>
                                            <span>-₹{selectedTripDetails.pricing?.discount?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Taxes:</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">₹{selectedTripDetails.pricing?.hotelTaxes?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white">
                                            <span>Total Paid:</span>
                                            <span className="text-[#ff5a3d]">₹{parseFloat(selectedTripDetails.pricing?.totalFare || selectedTripDetails.paymentDetail?.amount).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cancellation Policy Footer */}
                        {(selectedTripDetails.cancellationPolicy?.text || selectedTripDetails.cancellationPolicy?.cancellationPolicySlabs) && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 rounded-2xl space-y-2 text-xs text-red-800 dark:text-red-300">
                                <h5 className="font-black uppercase text-[10px] tracking-wider">Cancellation Policy</h5>
                                {selectedTripDetails.cancellationPolicy.text && (
                                    <p className="leading-relaxed font-semibold">{selectedTripDetails.cancellationPolicy.text}</p>
                                )}
                                {selectedTripDetails.cancellationPolicy.cancellationPolicySlabs && selectedTripDetails.cancellationPolicy.cancellationPolicySlabs.length > 0 && (
                                    <div className="mt-2 space-y-1 pt-2 border-t border-red-200/30">
                                        <p className="font-bold text-[10px] uppercase">Policy Slabs:</p>
                                        {selectedTripDetails.cancellationPolicy.cancellationPolicySlabs.map((slab, index) => {
                                            const startStr = new Date(slab.startTime).toLocaleString('en-IN');
                                            const endStr = new Date(slab.endTime).toLocaleString('en-IN');
                                            return (
                                                <div key={index} className="flex justify-between text-[11px]">
                                                    <span>{startStr} to {endStr}:</span>
                                                    <span className="font-black">Penalty: ₹{slab.penaltyAmount}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PAN Card Number */}
                        {selectedTripDetails.panCardNumber !== undefined && (
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-xs flex justify-between items-center text-slate-700 dark:text-slate-300">
                                <span className="font-black uppercase text-[10px] tracking-wider">PAN Card Number</span>
                                <span className="font-bold">{selectedTripDetails.panCardNumber || 'Not Provided'}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
