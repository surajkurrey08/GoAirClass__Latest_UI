import React, { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp, Users, Plane, 
    DollarSign, ArrowUpRight, ArrowDownRight,
    Calendar, RefreshCcw, LayoutDashboard
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { getFlightDashboardStats } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-4 rounded-2xl ${
                color === 'blue' ? 'bg-blue-50 text-blue-600' :
                color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                color === 'rose' ? 'bg-rose-50 text-rose-600' :
                'bg-amber-50 text-amber-600'
            }`}>
                <Icon size={24} />
            </div>
            {change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-black ${parseFloat(change) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {parseFloat(change) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(change)}%
                </div>
            )}
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
);

export default function FlightDashboard() {
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getFlightDashboardStats();
            setStats(data.stats);
            setTrend(data.trend);
        } catch (error) {
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl"></div>)}
                </div>
                <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-slate-50/50 dark:bg-transparent min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <LayoutDashboard className="text-blue-600" size={32} />
                        Flight Operations
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time performance metrics and booking analytics.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchStats}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2">
                        <Calendar size={18} />
                        Last 7 Days
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Bookings" 
                    value={stats?.totalBookings?.toLocaleString() || '0'} 
                    change={8.4} 
                    icon={Plane} 
                    color="blue" 
                />
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
                    change={12.1} 
                    icon={DollarSign} 
                    color="emerald" 
                />
                <StatCard 
                    title="Active Flights" 
                    value={stats?.activeFlights || '0'} 
                    icon={RefreshCcw} 
                    color="amber" 
                />
                <StatCard 
                    title="Cancellation Rate" 
                    value={`${stats?.cancellationRate}%`} 
                    change={-2.5} 
                    icon={TrendingUp} 
                    color="rose" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Booking & Revenue Trend</h3>
                            <p className="text-slate-500 text-sm font-medium">Daily performance tracking for the current week.</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-slate-500">Bookings</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-slate-500">Revenue</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="bookings" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorBookings)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Revenue Share</h3>
                    <p className="text-slate-500 text-sm font-medium mb-8">Revenue distribution by category.</p>
                    
                    <div className="flex-1 flex flex-col justify-center gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-slate-600 dark:text-slate-300">Base Fare</span>
                                <span className="text-slate-900 dark:text-white">72%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-slate-600 dark:text-slate-300">Taxes & Fees</span>
                                <span className="text-slate-900 dark:text-white">18%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[18%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-slate-600 dark:text-slate-300">Ancillaries</span>
                                <span className="text-slate-900 dark:text-white">10%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[10%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-5 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                        <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                            <BarChart3 size={20} />
                            <span className="text-sm font-black">Performance is up 12% vs last week</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
