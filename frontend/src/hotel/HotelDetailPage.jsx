import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Users, Shield, Coffee, Wifi, ArrowLeft, RefreshCw, CheckCircle2, Grid, X, Heart, ShieldCheck, Zap, PhoneCall, Bus, Train, Plane, Info, Check, Play, Lock, Camera, Clock, FileText } from 'lucide-react';
import { getHotelRoomDetails } from '../services/hotelApi';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

export default function HotelDetailPage() {
    const { hotelId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [activeRoomPhotos, setActiveRoomPhotos] = useState(null);
    const [readMore, setReadMore] = useState(false);

    // Parse query parameters
    const queryParams = new URLSearchParams(location.search);
    const checkIn = queryParams.get('checkIn') || getTodayDateString();
    const checkOut = queryParams.get('checkOut') || getFutureDateString(1);
    const rooms = parseInt(queryParams.get('rooms')) || 1;
    const guests = parseInt(queryParams.get('guests')) || 2;
    const cityName = queryParams.get('city') || '';

    // Calculate nights count
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Format date helper: "21 Jul 2026"
    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await getHotelRoomDetails(hotelId, {
                    cityName,
                    checkIn,
                    checkOut,
                    rooms,
                    guests
                });
                if (data && data.success) {
                    setHotel({ ...data.hotel, searchId: data.searchId || data.hotel?.searchId });
                } else {
                    toast.error(data?.error || 'Failed to load rooms and rates.');
                }
            } catch (err) {
                console.error("Error loading hotel details:", err);
                toast.error(err.response?.data?.error || 'Error loading rooms and rates.');
            } finally {
                setLoading(false);
            }
        };

        if (hotelId) {
            fetchDetails();
        }
    }, [hotelId, location.search]);

    const scrollToRooms = () => {
        const element = document.getElementById('select-room-plan');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
                <Navbar />
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-500">Checking room availability & live rates...</span>
                </div>
                <Footer />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
                <Navbar />
                <div className="max-w-xl mx-auto text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm my-12">
                    <h2 className="text-xl font-bold text-slate-800">Rooms Not Found</h2>
                    <p className="text-sm text-slate-400 mt-2">
                        We couldn't retrieve any live rooms or rates for this hotel for the selected dates.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    // Get cheapest price for top bar display
    let cheapestPrice = 0;
    hotel.rooms?.forEach(r => {
        r.rates?.forEach(rate => {
            const price = (rate.pricing?.totals?.baseFare || 0) + (rate.pricing?.totals?.tax || 0) + (rate.pricing?.totals?.discount || 0);
            if (cheapestPrice === 0 || price < cheapestPrice) {
                cheapestPrice = price;
            }
        });
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-700 antialiased flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {/* ── Top Bar Header (Screenshot Style Match) ── */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Search Results
                    </button>

                    <div className="flex items-center gap-5">
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#f0f4ff] border border-blue-100 rounded-full text-[#3b2a82] text-[10px] font-extrabold uppercase tracking-wider">
                            <Shield className="h-3.5 w-3.5" />
                            <span>Best Price Guarantee</span>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-black text-slate-800">
                                ₹{cheapestPrice ? Math.round(cheapestPrice).toLocaleString('en-IN') : 'N/A'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold block leading-none">
                                Inclusive of taxes
                            </span>
                        </div>
                        <button
                            onClick={scrollToRooms}
                            className="bg-[#3b2a82] hover:bg-[#2c1e65] text-white font-extrabold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-none shadow-sm transition-all active:scale-95"
                        >
                            View Rooms
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Screen Gallery Modal */}
            {showAllPhotos && (
                <div className="fixed inset-0 bg-white z-50 overflow-y-auto flex flex-col">
                    <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                        <h3 className="font-extrabold text-slate-800 text-lg">
                            Photos of {hotel.name}
                        </h3>
                        <button
                            onClick={() => setShowAllPhotos(false)}
                            className="p-2 hover:bg-slate-100 rounded-none transition-all text-slate-500 hover:text-slate-800"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 py-10 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hotel.images?.map((imgUrl, index) => (
                            <div key={index} className="rounded-none overflow-hidden border border-slate-200 shadow-sm relative group">
                                <img
                                    src={imgUrl}
                                    alt={`Gallery detail ${index + 1}`}
                                    className="w-full h-64 object-cover"
                                />
                                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-none">
                                    Photo {index + 1} of {hotel.images.length}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-4 pt-4 pb-6 w-full flex-grow">
                {/* Top Hotel Header Meta Info (Normal Text without Box) */}
                <div className="flex flex-col gap-1.5 mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1
                            className="text-2xl text-[rgb(0,0,0)] tracking-tight font-medium"
                            style={{ fontFamily: 'InterMedium, Inter, sans-serif', fontWeight: 500 }}
                        >
                            {hotel.name}
                        </h1>
                        <div className="flex items-center gap-1 text-amber-400">
                            {Array.from({ length: hotel.ratings?.starRating || hotel.stars || 5 }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-slate-500 text-xs font-semibold ml-1">
                                ({hotel.ratings?.starRating || hotel.stars || 5} Star Rating)
                            </span>
                        </div>
                        {hotel.property && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-none text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {typeof hotel.property === 'object' ? (hotel.property.type || hotel.property.name || JSON.stringify(hotel.property)) : String(hotel.property)}
                            </span>
                        )}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-[#f97316]/40 text-[#ea580c] text-[11px] font-semibold bg-[#fff7ed]">
                            <span className="text-[11px] font-bold">%</span>
                            <span>Monsoon Mega Deals</span>
                        </div>
                    </div>

                    <div
                        className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap"
                        style={{ fontFamily: 'InterMedium, Inter, sans-serif' }}
                    >
                        <span>{hotel.address || 'GATE NO 1, behind METRO, Cash and Pay Colony, Charbagh, Lucknow, Uttar Pradesh 226004'}</span>
                        <span className="text-slate-300">|</span>
                        <span>{hotel.locality && typeof hotel.locality === 'string' ? `${hotel.locality}, ` : ''}{hotel.city || 'Lucknow'}, {hotel.country || 'India'}</span>
                        <span className="text-slate-300">|</span>
                        <span>{formatDate(checkIn)} - {formatDate(checkOut)}</span>
                        <span className="text-slate-300">|</span>
                        <span>{rooms} Room(s), {guests} Guest(s)</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* ── Left Panel (Hotel info, Address, Amenities) ── */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Image collage - Modern Bento Grid with Hover Zoom & Floating Pill */}
                        {hotel.images && hotel.images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-[340px] md:h-[400px] rounded-none overflow-hidden relative shadow-sm group/gallery">
                                {/* Featured large main photo */}
                                <div
                                    className="md:col-span-7 h-full relative cursor-pointer overflow-hidden group bg-slate-900"
                                    onClick={() => setShowAllPhotos(true)}
                                >
                                    <img
                                        src={hotel.images[0]}
                                        alt="Main property view"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                    <span className="absolute top-3 left-3 backdrop-blur-md bg-black/40 text-white border border-white/20 text-[11px] font-medium px-3 py-1 flex items-center gap-1.5 shadow-sm">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Featured Property
                                    </span>
                                </div>

                                {/* Right 4-image grid panel */}
                                <div className="md:col-span-5 grid grid-cols-2 gap-2 h-full">
                                    <div className="relative cursor-pointer overflow-hidden group bg-slate-900" onClick={() => setShowAllPhotos(true)}>
                                        <img src={hotel.images[1] || hotel.images[0]} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="relative cursor-pointer overflow-hidden group bg-slate-900" onClick={() => setShowAllPhotos(true)}>
                                        <img src={hotel.images[2] || hotel.images[0]} alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="relative cursor-pointer overflow-hidden group bg-slate-900" onClick={() => setShowAllPhotos(true)}>
                                        <img src={hotel.images[3] || hotel.images[0]} alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="relative cursor-pointer overflow-hidden group bg-slate-900" onClick={() => setShowAllPhotos(true)}>
                                        <img src={hotel.images[4] || hotel.images[0]} alt="Gallery 4" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-90" />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                                    </div>
                                </div>

                                {/* Floating View All Photos Button */}
                                <button
                                    onClick={() => setShowAllPhotos(true)}
                                    className="absolute bottom-3 right-3 backdrop-blur-md bg-black/75 hover:bg-black text-white text-xs font-medium px-4 py-2 flex items-center gap-2 border border-white/30 shadow-lg transition-all active:scale-95 z-10"
                                    style={{ fontFamily: 'InterMedium, Inter, sans-serif' }}
                                >
                                    <Camera className="h-4 w-4 text-white" />
                                    <span>View All Photos ({hotel.images.length || 5})</span>
                                </button>
                            </div>
                        )}
                        {/* About / Description section */}
                        <div className="bg-white rounded-none border border-slate-200 p-5 shadow-sm space-y-3">
                            <h3
                                className="font-bold text-slate-800 text-sm"
                                style={{ fontFamily: 'InterMedium, Inter, sans-serif', fontWeight: 500 }}
                            >
                                About Property
                            </h3>
                            <div
                                className="text-xs text-slate-600 leading-relaxed font-medium space-y-3 whitespace-pre-line"
                                style={{ fontFamily: 'InterMedium, Inter, sans-serif', fontWeight: 500 }}
                            >
                                <p>
                                    {hotel.description || `Hotel Europe Plaza is situated in the City of Nawabs, Lucknow. It is located at a distance of 12 km from Chaudhary Charan Singh International Airport, 800 m from Lucknow Charbagh Railway Station and 350 m from Charbagh Bus Stand making it convenient for the guest to commute.\n\nThe property has well equipped and maintained rooms with all the required amenities and services to avoid any kind of discomfort to the guest. Each room has attached bathroom with regular supply of hot and cold water.\n\nPopular places to visit in Lucknow are Dilkusha Kothi (4 km), Ambedkar Memorial (7 km), Chota Imambara (7 km), Dr. Ram Manohar Lohia Park (8 km), Lucknow Zoological Garden (8 km), Janeshwar Mishra Park (9 km) and many more which the guest can explore.\n\nHave a nice stay at Hotel Europe Plaza!`}
                                </p>
                            </div>
                        </div>

                        {/* Location address mapping with Live OpenStreetMap */}
                        {(() => {
                            const lat = hotel?.latitude || 26.8324;
                            const lon = hotel?.longitude || 80.9221;
                            const bbox = `${lon - 0.008}%2C${lat - 0.008}%2C${lon + 0.008}%2C${lat + 0.008}`;
                            const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

                            return (
                                <div className="bg-white rounded-none border border-slate-200 p-5 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-extrabold text-slate-800 text-sm">Location</h3>
                                        <a
                                            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                                        >
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>View Larger Map</span>
                                        </a>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                        <div className="md:col-span-7 space-y-4">
                                            <div className="flex gap-2">
                                                <MapPin className="h-5 w-5 text-[#3b2a82] shrink-0 mt-0.5" />
                                                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                                    {hotel.address || 'GATE NO 1, behind METRO, Cash and Pay Colony, Charbagh, Lucknow, Uttar Pradesh 226004'}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-none border border-slate-100">
                                                <div>
                                                    <span className="text-slate-400 font-bold text-[9px] uppercase block font-sans">Pincode</span>
                                                    <span className="font-bold text-slate-700">{hotel.pincode || '226004'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 font-bold text-[9px] uppercase block font-sans">City</span>
                                                    <span className="font-bold text-slate-700">{hotel.city || 'Lucknow'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 font-bold text-[9px] uppercase block font-sans">State</span>
                                                    <span className="font-bold text-slate-700">{hotel.state || 'Uttar Pradesh'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 font-bold text-[9px] uppercase block font-sans">Country</span>
                                                    <span className="font-bold text-slate-700">{hotel.country || 'India'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-5 h-[200px] rounded-none overflow-hidden border border-slate-300 relative shadow-xs bg-slate-100">
                                            <iframe
                                                title="OpenStreetMap Property Location"
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="no"
                                                marginHeight="0"
                                                marginWidth="0"
                                                src={mapUrl}
                                                className="w-full h-full border-0"
                                            ></iframe>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Amenities & Facilities */}
                        <div className="bg-white rounded-none border border-slate-200 p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-extrabold text-slate-800 text-sm">Amenities & Facilities</h3>
                                {hotel.amenities && hotel.amenities.length > 8 && (
                                    <button
                                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                                        className="text-xs text-blue-600 font-bold hover:underline"
                                    >
                                        {showAllAmenities ? 'Show less' : `View all (${hotel.amenities.length})`}
                                    </button>
                                )}
                            </div>

                            {/* Grouped by Category */}
                            {(() => {
                                if (showAllAmenities) {
                                    // Group by category
                                    const categories = {};
                                    (hotel.amenities || []).forEach(item => {
                                        const cat = item.category || 'General Amenities';
                                        if (!categories[cat]) categories[cat] = [];
                                        categories[cat].push(item);
                                    });

                                    return (
                                        <div className="space-y-4">
                                            {Object.entries(categories).map(([catName, items]) => (
                                                <div key={catName} className="space-y-2 border-t border-slate-100 pt-2.5 first:border-0 first:pt-0">
                                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{catName}</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-slate-700 text-[11px] font-medium">
                                                        {items.map((amenity, index) => (
                                                            <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-100">
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                                                <span className="truncate" title={amenity.name}>{amenity.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }

                                const amenitiesToDisplay = hotel.amenities?.slice(0, 8) || [];

                                return (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700 text-[11px] font-medium">
                                        {amenitiesToDisplay.length > 0 ? (
                                            amenitiesToDisplay.map((amenity, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-100">
                                                    {amenity.name.toLowerCase().includes('wifi') || amenity.name.toLowerCase().includes('internet') ? (
                                                        <Wifi className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    ) : amenity.name.toLowerCase().includes('parking') ? (
                                                        <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    ) : amenity.name.toLowerCase().includes('service') || amenity.name.toLowerCase().includes('food') ? (
                                                        <Coffee className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    )}
                                                    <span className="truncate" title={amenity.name}>{amenity.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-100">
                                                    <Wifi className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    <span>Free Wi-Fi</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-100">
                                                    <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    <span>Free Parking</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-100">
                                                    <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    <span>24x7 Front Desk</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-none border border-slate-100">
                                                    <Coffee className="h-4 w-4 text-indigo-600 shrink-0" />
                                                    <span>Room Service</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Property Policies & House Rules */}
                        <div className="bg-white rounded-none border border-slate-200 p-5 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4 text-[#3b2a82]" />
                                <span>Property Policies & House Rules</span>
                            </h3>

                            {/* Check-in / Check-out timing badges */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-none border border-slate-200 text-xs">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-in Time</span>
                                        <span className="font-bold text-slate-800 text-xs">
                                            {hotel.policyInfo?.checkinTime ? `${parseInt(hotel.policyInfo.checkinTime.slice(0, 2)) % 12 || 12}:${hotel.policyInfo.checkinTime.slice(2)} ${parseInt(hotel.policyInfo.checkinTime.slice(0, 2)) >= 12 ? 'PM' : 'AM'}` : '2:00 PM'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                                    <Clock className="h-5 w-5 text-rose-600 shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Check-out Time</span>
                                        <span className="font-bold text-slate-800 text-xs">
                                            {hotel.policyInfo?.checkoutTime ? `${parseInt(hotel.policyInfo.checkoutTime.slice(0, 2)) % 12 || 12}:${hotel.policyInfo.checkoutTime.slice(2)} ${parseInt(hotel.policyInfo.checkoutTime.slice(0, 2)) >= 12 ? 'PM' : 'AM'}` : '12:00 PM'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Policy Guidelines */}
                            {hotel.policyInfo?.guidelinesAndPolicies && hotel.policyInfo.guidelinesAndPolicies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    {hotel.policyInfo.guidelinesAndPolicies.map((policy, idx) => (
                                        <div key={idx} className="border border-slate-200 bg-slate-50/50 p-3 space-y-1 rounded-none">
                                            {policy.title && (
                                                <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wide flex items-center gap-1.5 mb-1">
                                                    <Info className="h-3.5 w-3.5 text-indigo-600" />
                                                    {policy.title}
                                                </h4>
                                            )}
                                            <ul className="space-y-1 text-slate-600 text-[11px]">
                                                {policy.description?.map((desc, dIdx) => (
                                                    <li key={dIdx} className="flex items-start gap-1.5">
                                                        <span className="w-1 h-1 bg-slate-400 rounded-full shrink-0 mt-1.5"></span>
                                                        <span>{desc}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-500 space-y-1">
                                    <p>• Government ID (Aadhaar, Passport, Driving License) is required at check-in.</p>
                                    <p>• Couples are welcome. Pets are not allowed on property premises.</p>
                                </div>
                            )}
                        </div>

                        {/* Contact & Additional Info */}
                        <div className="bg-white rounded-none border border-slate-200 p-5 shadow-sm space-y-4">
                            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                                <PhoneCall className="h-4 w-4 text-[#3b2a82]" />
                                <span>Contact & Additional Info</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-2 border border-slate-100 p-3 bg-slate-50/50">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Information</span>
                                    {hotel.contacts ? (
                                        <div className="space-y-1.5 text-slate-700 font-medium">
                                            {Array.isArray(hotel.contacts) ? (
                                                hotel.contacts.map((item, idx) => {
                                                    if (typeof item === 'object' && item !== null) {
                                                        return (
                                                            <div key={idx} className="space-y-1.5">
                                                                {Object.entries(item).map(([k, v]) => (
                                                                    <p key={k} className="flex gap-1.5">
                                                                        <span className="font-bold text-slate-500">{k}:</span>
                                                                        <span className="text-slate-800">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return <p key={idx}>{String(item)}</p>;
                                                })
                                            ) : typeof hotel.contacts === 'object' && hotel.contacts !== null ? (
                                                Object.entries(hotel.contacts).map(([key, val]) => {
                                                    const displayVal = Array.isArray(val) ? val.join(', ') : (val !== null && val !== undefined ? String(val) : 'N/A');
                                                    return (
                                                        <p key={key} className="flex gap-1.5">
                                                            <span className="font-bold text-slate-500">{key}:</span>
                                                            <span className="text-slate-800">{displayVal}</span>
                                                        </p>
                                                    );
                                                })
                                            ) : typeof hotel.contacts === 'string' ? (
                                                <p>{hotel.contacts}</p>
                                            ) : (
                                                <p className="text-slate-400">Not Available</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400">Not Available</p>
                                    )}
                                </div>
                                <div className="space-y-2 border border-slate-100 p-3 bg-slate-50/50">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Additional Information</span>
                                    <div className="text-slate-600 leading-relaxed font-medium">
                                        {typeof hotel.otherInfo === 'object' && hotel.otherInfo !== null ? (
                                            <div className="space-y-1.5">
                                                {Object.entries(hotel.otherInfo).map(([key, val]) => {
                                                    const displayVal = val !== null && val !== undefined ? String(val) : 'N/A';
                                                    return (
                                                        <div key={key} className="flex gap-1.5">
                                                            <span className="font-bold text-slate-500">{key}:</span>
                                                            <span className="text-slate-800">{displayVal}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            hotel.otherInfo || "No additional information provided."
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Panel (Select Room & Plan - Exact Replica) ── */}
                    <div id="select-room-plan" className="lg:col-span-5 space-y-5 lg:sticky lg:top-[70px]">

                        <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
                            {/* Panel Header */}
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex justify-between items-center">
                                <h2
                                    className="text-slate-900 text-[14px] font-medium tracking-tight"
                                    style={{ fontFamily: 'InterMedium, Inter, sans-serif', fontWeight: 600 }}
                                >
                                    Select Room & Plan
                                </h2>
                                <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                                    {rooms} Room, {guests} Adults | {formatDate(checkIn)}
                                </span>
                            </div>

                            {/* Rooms Listing Grid */}
                            <div className="p-4 space-y-4 max-h-[660px] overflow-y-auto">
                                {hotel.rooms?.map((room) => (
                                    <div key={room.roomId} className="border border-slate-200 rounded-none overflow-hidden bg-white shadow-sm space-y-3">

                                        {/* Room Header Row */}
                                        <div className="p-3 bg-slate-50/50 border-b border-slate-150 flex gap-3.5">
                                            {room.images && room.images.length > 0 && (
                                                <div
                                                    onClick={() => setActiveRoomPhotos({ name: room.roomName, photos: room.images })}
                                                    className="h-16 w-24 rounded-none overflow-hidden shrink-0 border border-slate-200 bg-slate-100 relative group cursor-pointer"
                                                    title={`Click to view all ${room.images.length} photos of ${room.roomName}`}
                                                >
                                                    <img
                                                        src={room.images[0]}
                                                        alt={room.roomName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                                                        <Camera className="h-3.5 w-3.5 mr-0.5" /> View
                                                    </div>
                                                    {room.images.length > 1 && (
                                                        <span className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded-none">
                                                            +{room.images.length}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <h4
                                                    className="text-slate-900 text-[14px] leading-tight truncate font-medium"
                                                    style={{ fontFamily: 'InterMedium, Inter, sans-serif', fontWeight: 500 }}
                                                >
                                                    {room.roomName}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-slate-500 font-semibold tracking-wider font-sans">
                                                    {room.area && (
                                                        <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 border border-slate-200">
                                                            {room.area}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3 text-slate-400" />
                                                        {room.maxOccupancy?.totalMaxOccupancy ? `Max ${room.maxOccupancy.totalMaxOccupancy} Guests` : `${guests} Guests`}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {room.roomAmenities && room.roomAmenities.length > 0 ? (
                                                        room.roomAmenities.slice(0, 4).map((a, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 text-[8.5px] font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-none border border-slate-200">
                                                                <CheckCircle2 className="h-2.5 w-2.5 text-indigo-600" />
                                                                {a.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        room.rates?.[0]?.inclusions?.map((inc, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-none border border-green-200">
                                                                {inc.toLowerCase().includes('wifi') || inc.toLowerCase().includes('internet') ? (
                                                                    <Wifi className="h-2.5 w-2.5" />
                                                                ) : inc.toLowerCase().includes('parking') ? (
                                                                    <Shield className="h-2.5 w-2.5" />
                                                                ) : (
                                                                    <Coffee className="h-2.5 w-2.5" />
                                                                )}
                                                                {inc}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Room Rate Plans */}
                                        <div className="px-3 pb-3 space-y-2.5">
                                            {room.rates?.map((rate) => {
                                                const basePrice = rate.pricing?.totals?.baseFare || 0;
                                                const discountPrice = rate.pricing?.totals?.discount || 0;
                                                const taxPrice = rate.pricing?.totals?.tax || 0;
                                                const finalPrice = basePrice + taxPrice + discountPrice;

                                                const discountPercent = Math.abs(discountPrice) > 0 ? Math.round((Math.abs(discountPrice) / basePrice) * 100) : 0;
                                                const isBreakfast = rate.rateName.toLowerCase().includes('breakfast');

                                                return (
                                                    <div key={rate.rateId} className="border border-slate-200/70 rounded-none p-3 bg-slate-50/40 hover:bg-slate-50/90 transition-all flex flex-col md:flex-row justify-between items-center gap-3">

                                                        {/* Details left side */}
                                                        <div className="flex-1 space-y-1.5 w-full">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-[12px] text-slate-900 uppercase tracking-wide font-['InterMedium','Inter',sans-serif]">
                                                                    {rate.rateName}
                                                                </span>
                                                            </div>

                                                            {/* Clean features list */}
                                                            <ul className="text-[11px] text-slate-500 font-medium space-y-1 font-['InterRegular','Inter',sans-serif]">
                                                                <li className="flex items-center gap-1.5">
                                                                    <span className={`w-1 h-1 ${rate.freeCancellation ? 'bg-emerald-500' : 'bg-slate-400'} rounded-full shrink-0`}></span>
                                                                    <span className={rate.freeCancellation ? 'text-emerald-700 font-bold' : ''}>
                                                                        {rate.freeCancellation ? 'Free Cancellation' : 'Non-refundable'}
                                                                    </span>
                                                                </li>
                                                                <li className="flex items-center gap-1.5">
                                                                    <span className="w-1 h-1 bg-slate-400 rounded-full shrink-0"></span>
                                                                    <span>{isBreakfast ? 'Breakfast included' : 'No meals included'}</span>
                                                                </li>
                                                                {rate.cancellationPolicy?.text && (
                                                                    <li className={`flex items-start gap-1.5 font-medium text-[10.5px] ${rate.freeCancellation ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                                        <span className={`w-1 h-1 ${rate.freeCancellation ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full shrink-0 mt-1.5`}></span>
                                                                        <span>
                                                                            {rate.cancellationPolicy.text}
                                                                        </span>
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>

                                                        {/* Price & Select action on right side */}
                                                        <div className="md:w-36 flex flex-col justify-end items-end shrink-0 text-right w-full pt-1 md:pt-0">
                                                            <div>
                                                                {discountPercent > 0 && (
                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                        <span className="text-[11px] text-slate-400 line-through font-medium">
                                                                            ₹{Math.round(basePrice + taxPrice).toLocaleString('en-IN')}
                                                                        </span>
                                                                        <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-none">
                                                                            {discountPercent}% OFF
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="text-[18px] font-extrabold text-slate-900 leading-none mt-1">
                                                                    ₹{Math.round(finalPrice).toLocaleString('en-IN')}
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 font-medium block leading-none mt-1">
                                                                    /night · Incl. taxes
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    navigate('/hotel/checkout', {
                                                                        state: {
                                                                            hotelId,
                                                                            hotelName: hotel.name,
                                                                            hotelAddress: hotel.address,
                                                                            hotelImage: hotel.image || (hotel.images && hotel.images[0]) || '',
                                                                            roomName: room.roomName,
                                                                            roomImage: (room.images && room.images[0]) || '',
                                                                            rateName: rate.rateName,
                                                                            bookingCode: rate.bookingCode,
                                                                            searchId: hotel.searchId || '',
                                                                            checkIn,
                                                                            checkOut,
                                                                            rooms,
                                                                            guests,
                                                                            baseFare: basePrice,
                                                                            discount: discountPrice,
                                                                            tax: taxPrice,
                                                                            finalPrice,
                                                                            freeBreakfast: isBreakfast,
                                                                            freeCancellation: rate.freeCancellation
                                                                        }
                                                                    });
                                                                }}
                                                                className="mt-2.5 w-full bg-[#ff5a3d] hover:bg-[#e0452a] text-white font-bold text-xs uppercase px-4 py-2 rounded-none transition-all tracking-wider shadow-xs text-center active:scale-95 cursor-pointer"
                                                            >
                                                                Select
                                                            </button>
                                                        </div>

                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trust Badges - Screenshot Matching lavender background */}
                        <div className="bg-[#f5f8ff] p-4 rounded-none border border-slate-200 grid grid-cols-2 gap-3 text-center text-slate-500 shadow-sm">
                            <div className="flex flex-col items-center p-2.5 bg-white rounded-none border border-slate-200">
                                <ShieldCheck className="h-5 w-5 text-indigo-600 mb-1" />
                                <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wide">Best Price</span>
                                <span className="text-[8px] font-semibold text-slate-400 mt-0.5">Guaranteed</span>
                            </div>
                            <div className="flex flex-col items-center p-2.5 bg-white rounded-none border border-slate-200">
                                <Lock className="h-5 w-5 text-indigo-600 mb-1" />
                                <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wide">Secure</span>
                                <span className="text-[8px] font-semibold text-slate-400 mt-0.5">Booking</span>
                            </div>
                            <div className="flex flex-col items-center p-2.5 bg-white rounded-none border border-slate-200">
                                <Zap className="h-5 w-5 text-indigo-600 mb-1" />
                                <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wide">Instant</span>
                                <span className="text-[8px] font-semibold text-slate-400 mt-0.5">Confirmation</span>
                            </div>
                            <div className="flex flex-col items-center p-2.5 bg-white rounded-none border border-slate-200">
                                <PhoneCall className="h-5 w-5 text-indigo-600 mb-1" />
                                <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wide">24x7 Customer</span>
                                <span className="text-[8px] font-semibold text-slate-400 mt-0.5">Support</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Room Photo Gallery Lightbox Modal */}
            {activeRoomPhotos && (
                <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white max-w-4xl w-full rounded-none overflow-hidden shadow-2xl space-y-0 relative border border-slate-700">
                        {/* Modal Header */}
                        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-[#ff5a3d]" />
                                <h3 className="font-bold text-sm" style={{ fontFamily: 'InterMedium, Inter, sans-serif' }}>
                                    {activeRoomPhotos.name} Photos ({activeRoomPhotos.photos.length})
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveRoomPhotos(null)}
                                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Photos Grid */}
                        <div className="p-4 max-h-[75vh] overflow-y-auto bg-slate-950 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {activeRoomPhotos.photos.map((photoUrl, pIdx) => (
                                <div key={pIdx} className="h-48 rounded-none overflow-hidden border border-slate-800 bg-slate-900 group relative">
                                    <img
                                        src={photoUrl}
                                        alt={`${activeRoomPhotos.name} photo ${pIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5">
                                        Photo {pIdx + 1} / {activeRoomPhotos.photos.length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
