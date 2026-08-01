import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Star, Building2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

export default function HotelDirectory() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchHotels();
    }, [page, search, city]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/hotels/admin/directory', {
                params: {
                    page,
                    limit: 10,
                    search,
                    city
                }
            });
            if (response.data?.success) {
                setHotels(response.data.hotels || []);
                setTotalPages(response.data.totalPages || 1);
                setTotal(response.data.total || 0);
            }
        } catch (err) {
            toast.error('Failed to fetch hotels from directory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Header section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-orange-500" />
                        Hotel Directory
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Browse and search all static hotels stored in our local database.
                    </p>
                </div>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300 text-xs">
                    Total Records: {total}
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by hotel name..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>
                <div className="w-full md:w-64 relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Filter by city..."
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>
            </div>

            {/* Table/List View */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading && hotels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 space-y-3">
                        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
                        <span className="text-sm font-semibold text-slate-500">Loading directory...</span>
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 font-semibold text-sm">
                        No hotels found in the directory. Sync locations first.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-900 dark:text-white text-sm font-semibold">
                                    <th className="py-4 px-6">Hotel Info</th>
                                    <th className="py-4 px-6">Location</th>
                                    <th className="py-4 px-6">Rating & Stars</th>
                                    <th className="py-4 px-6">Cleartrip ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {hotels.map((hotel) => (
                                    <tr key={hotel.hotelId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 px-6 flex items-center gap-4">
                                            <img
                                                src={hotel.image}
                                                alt={hotel.name}
                                                className="h-12 w-16 object-cover rounded-md bg-slate-100 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate">
                                                    {hotel.name}
                                                </span>
                                                <span className="text-xs text-slate-400 block truncate mt-0.5 max-w-md">
                                                    {hotel.address}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-600 dark:text-slate-300">
                                            {hotel.city}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center text-amber-400">
                                                    {Array.from({ length: hotel.stars || 4 }).map((_, i) => (
                                                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">
                                                    ({hotel.rating || '4.0'})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-400">
                                            {hotel.hotelId}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination footer */}
                {totalPages > 1 && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
