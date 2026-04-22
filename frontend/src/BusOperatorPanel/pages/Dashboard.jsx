import React, { useState, useEffect } from 'react';
import {
    Bus,
    Ticket,
    IndianRupee,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    ChevronDown
} from 'lucide-react';
import { 
    fetchOperatorStats
} from '../../services/auth';
import { toast } from 'react-toastify';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import API from '../../services/axios';

const StatCard = ({ title, value, subValue, icon: Icon, trend, colorClass }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 transition-transform group-hover:scale-110`}>
                <Icon className={`${colorClass.replace('bg-', 'text-')}`} size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 text-sm font-semibold">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{value}</span>
                <span className="text-xs text-slate-400 font-medium">{subValue}</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await API.get('/dashboard/operator');
                if (response.data.success) {
                    setStats(response.data.stats);
                    setChartData(response.data.chartData);
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Track your fleet performance and earnings in real-time.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-slate-100">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20">Today</button>
                    <button className="px-4 py-2 text-slate-500 hover:text-blue-600 rounded-xl text-sm font-bold">Week</button>
                    <button className="px-4 py-2 text-slate-500 hover:text-blue-600 rounded-xl text-sm font-bold">Month</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Fleet"
                    value={stats?.activeBuses || 0}
                    subValue={`out of ${stats?.totalBuses || 0}`}
                    icon={Bus}
                    trend={12}
                    colorClass="bg-blue-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.totalBookings || 0}
                    subValue="Overall Tickets"
                    icon={Ticket}
                    trend={8}
                    colorClass="bg-purple-600"
                />
                <StatCard
                    title="Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    subValue="Gross Earnings"
                    icon={IndianRupee}
                    trend={15}
                    colorClass="bg-green-600"
                />
                <StatCard
                    title="Occupancy"
                    value={`${stats?.seatOccupancy || 0}%`}
                    subValue="Average Seating"
                    icon={Users}
                    trend={-2}
                    colorClass="bg-orange-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Revenue Analytics</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Earnings across last 7 days</p>
                        </div>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 transition-all">
                            Export Data <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="_id"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563eb"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Info / Bookings Summary */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight mb-6">Live Activity</h2>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-black text-slate-800">New Booking</h4>
                                        <span className="text-[10px] text-slate-400 font-bold">2m ago</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">Bus #4521 matched 4 seats</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-4 bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl text-sm font-black transition-all border border-dashed border-slate-200">
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
