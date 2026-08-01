import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, MapPin, Database, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function HotelSync() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncingId, setSyncingId] = useState(null);
    const [stats, setStats] = useState({ totalHotels: 0 });

    // Incremental Sync states
    const [incrementalLoading, setIncrementalLoading] = useState(false);
    const [incrementalResult, setIncrementalResult] = useState(null);
    const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState('1753164000');

    useEffect(() => {
        fetchLocations();
        fetchStats();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/hotels/locations');
            if (response.data?.success) {
                setLocations(response.data.locations || []);
            }
        } catch (err) {
            toast.error('Failed to fetch locations');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/hotels/admin/directory?limit=1');
            if (response.data?.success) {
                setStats({ totalHotels: response.data.total || 0 });
            }
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    const handleSync = async (locationId, cityName) => {
        try {
            setSyncingId(locationId);
            const response = await axios.post('http://localhost:5000/api/hotels/admin/sync', {
                locationId,
                cityName
            });
            if (response.data?.success) {
                toast.success(response.data.message || `Successfully synced ${cityName}`);
                fetchStats();
            } else {
                toast.error(response.data?.error || 'Sync failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to trigger sync');
        } finally {
            setSyncingId(null);
        }
    };

    const handleIncrementalSync = async () => {
        try {
            setIncrementalLoading(true);
            setIncrementalResult(null);
            const response = await axios.get(`http://localhost:5000/api/hotels/admin/incremental-updates?lastUpdatedAt=${lastUpdateTimestamp}`);
            if (response.data?.success) {
                toast.success('Incremental updates synced successfully');
                setIncrementalResult(response.data.message);
                fetchStats();
            } else {
                toast.error(response.data?.error || 'Sync failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to trigger incremental sync');
        } finally {
            setIncrementalLoading(false);
        }
    };

    const handleClearDb = async () => {
        if (!window.confirm('Are you sure you want to clear all synced hotels? This cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.delete('http://localhost:5000/api/hotels/admin/clear');
            if (response.data?.success) {
                toast.success('Successfully cleared synced hotels database.');
                fetchStats();
            }
        } catch (err) {
            toast.error('Failed to clear database.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <Database className="h-6 w-6 text-orange-500 animate-pulse" />
                        Hotel Content Manager
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Download, sync, and manage static hotel listings from Cleartrip's Content APIs.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-100 dark:border-orange-900/50">
                        <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider block">Total Synced Hotels</span>
                        <span className="text-xl font-extrabold text-orange-700 dark:text-orange-400">{stats.totalHotels}</span>
                    </div>

                    <button
                        onClick={handleClearDb}
                        disabled={loading}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl border border-red-100 font-bold text-xs flex items-center gap-2 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear Database
                    </button>
                </div>
            </div>

            {/* Incremental Update Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cleartrip Incremental Updates Sync</h2>
                        <p className="text-slate-400 text-xs mt-0.5">Sync changes made to hotel content after a specific timestamp.</p>
                    </div>
                    <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        Cron Active (Daily 12AM)
                    </span>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4 max-w-2xl">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            lastUpdatedAt Timestamp (Unix Epoch)
                        </label>
                        <input
                            type="text"
                            value={lastUpdateTimestamp}
                            onChange={(e) => setLastUpdateTimestamp(e.target.value)}
                            placeholder="e.g. 1753164000"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    
                    <button
                        onClick={handleIncrementalSync}
                        disabled={incrementalLoading}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-md w-full md:w-auto justify-center"
                    >
                        <RefreshCw className={`h-4 w-4 ${incrementalLoading ? 'animate-spin' : ''}`} />
                        {incrementalLoading ? 'Processing Sync...' : 'Trigger Incremental Sync'}
                    </button>
                </div>

                {incrementalResult && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-xl text-green-700 dark:text-green-400 text-xs font-bold flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{incrementalResult}</span>
                    </div>
                )}
            </div>

            {/* Main listing panel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Hotel Destinations</h2>
                    <span className="text-xs font-semibold text-slate-400">Periodic Cron Job runs automatic weekly syncs</span>
                </div>

                {loading && locations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-3">
                        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
                        <span className="text-sm font-semibold text-slate-500">Loading locations...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {locations.map((loc) => {
                            const isSyncing = syncingId === loc.locationId;
                            return (
                                <div
                                    key={loc.locationId}
                                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4 hover:border-orange-200 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-orange-50 dark:bg-orange-950/50 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 block truncate">
                                                {loc.cityName}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                                                ID: {loc.locationId}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSync(loc.locationId, loc.cityName)}
                                        disabled={isSyncing}
                                        className={`px-3 py-2 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm ${
                                            isSyncing
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                        }`}
                                    >
                                        <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                                        {isSyncing ? 'Syncing...' : 'Sync'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}
