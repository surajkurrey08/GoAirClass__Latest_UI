import React, { useState, useEffect } from 'react';
import { 
    BarChart3, Download, Calendar, Filter, 
    ArrowUpRight, Plane, Navigation, DollarSign,
    PieChart, RefreshCcw, FileText, CheckCircle
} from 'lucide-react';
import { getFlightReports } from '../../../services/flightApi';
import { toast } from 'react-toastify';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export default function FlightReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('airline');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'];

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await getFlightReports({ 
                type: filterType,
                startDate: dateRange.start,
                endDate: dateRange.end
            });
            setReports(data.reports);
        } catch (error) {
            toast.error('Failed to generate reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filterType, dateRange]);

    const handleExport = () => {
        toast.info('Preparing report for download...');
        // Logic for CSV export would go here
    };

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Operational Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Analyze revenue, booking trends and profit margins.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                    <Download size={18} /> Export Data
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl">
                        <button 
                            onClick={() => setFilterType('airline')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${filterType === 'airline' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            By Airline
                        </button>
                        <button 
                            onClick={() => setFilterType('route')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${filterType === 'route' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            By Route
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                            <Calendar size={16} className="text-slate-400" />
                            <input 
                                type="date" 
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none" 
                            />
                            <span className="text-slate-300">→</span>
                            <input 
                                type="date" 
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none" 
                            />
                        </div>
                        <button 
                            onClick={fetchReports}
                            className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                        >
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="h-[400px]">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Revenue Distribution</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reports}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                />
                                <Bar dataKey="totalRevenue" radius={[8, 8, 0, 0]}>
                                    {reports.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-6 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Detailed Breakdown</h4>
                        {reports.map((item, index) => (
                            <div key={index} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{item._id || 'Unknown'}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{item.totalBookings} Total Bookings</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">₹{item.totalRevenue.toLocaleString()}</p>
                                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{item.cancelledBookings} Cancellations</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between overflow-hidden relative group">
                    <div className="z-10">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Total Market Share</p>
                        <h3 className="text-3xl font-black">42.8%</h3>
                        <div className="mt-4 flex items-center gap-2 text-indigo-200 text-xs font-bold">
                            <ArrowUpRight size={16} /> +5.2% vs last month
                        </div>
                    </div>
                    <PieChart size={120} className="text-indigo-500 opacity-20 absolute -right-4 -bottom-4 group-hover:scale-110 transition-all" />
                    <FileText size={160} className="text-white opacity-10 absolute right-10 top-0 translate-x-1/2 -translate-y-1/2" />
                </div>
                
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between overflow-hidden relative group">
                    <div className="z-10">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Operational Efficiency</p>
                        <h3 className="text-3xl font-black">94.2%</h3>
                        <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                            <CheckCircle size={16} /> Optimized performance
                        </div>
                    </div>
                    <RefreshCcw size={140} className="text-slate-800 absolute right-0 top-0 translate-x-1/4 -translate-y-1/4" />
                </div>
            </div>
        </div>
    );
}
