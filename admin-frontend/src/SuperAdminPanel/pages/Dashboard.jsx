import React, { useState, useEffect } from 'react';
import { 
    Users, DollarSign, Ticket, UserCheck, 
    ArrowUpRight, ArrowDownRight, MoreVertical, Bus
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import StatCard from '../components/dashboard/StatCard';
import { fetchDashboardStats } from '../../services/auth';

const data = [
  { name: 'Jan', revenue: 4000, users: 2400 },
  { name: 'Feb', revenue: 3000, users: 1398 },
  { name: 'Mar', revenue: 2000, users: 9800 },
  { name: 'Apr', revenue: 2780, users: 3908 },
  { name: 'May', revenue: 1890, users: 4800 },
  { name: 'Jun', revenue: 2390, users: 3800 },
  { name: 'Jul', revenue: 3490, users: 4300 },
];

const RecentBookings = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <button className="text-blue-600 font-bold text-xs hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Name</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {[
                        { name: 'Rahul Sharma', service: 'Flight (GO123)', amount: '₹12,450', status: 'Success', color: 'green' },
                        { name: 'Priya Patel', service: 'Bus (Royal Exp)', amount: '₹1,200', status: 'Pending', color: 'amber' },
                        { name: 'Amit Kumar', service: 'Hotel (Blue Moon)', amount: '₹4,500', status: 'Failed', color: 'red' },
                        { name: 'Sneha Gupta', service: 'Train (Rajdhani)', amount: '₹2,800', status: 'Success', color: 'green' },
                    ].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-xs font-semibold text-slate-500">{item.service}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-sm text-slate-900 dark:text-white">{item.amount}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold bg-${item.color}-50 dark:bg-${item.color}-500/10 text-${item.color}-600`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default function Dashboard() {
    const [stats, setStats] = useState({ 
        revenue: 0, 
        bookings: 0, 
        users: 0, 
        agents: 0,
        activeBuses: 0,
        totalBuses: 0 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            try {
                const data = await fetchDashboardStats();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        getStats();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">
                    Syncing Real-time Analytics...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admin Overview</h1>
                <p className="text-slate-500 font-medium">Welcome back, Super Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${stats.revenue}`} 
                    icon={DollarSign} 
                    trend="up" 
                    trendValue="12.5%" 
                    color="blue" 
                />
                <StatCard 
                    title="Total Bookings" 
                    value={stats.bookings} 
                    icon={Ticket} 
                    trend="up" 
                    trendValue="8.2%" 
                    color="purple" 
                />
                <StatCard 
                    title="Active Users" 
                    value={stats.users} 
                    icon={Users} 
                    trend="down" 
                    trendValue="2.4%" 
                    color="green" 
                />
                <StatCard 
                    title="Active Fleet" 
                    value={stats.activeBuses} 
                    subValue={`out of ${stats.totalBuses}`}
                    icon={Bus} 
                    trend="up" 
                    trendValue="1.2%" 
                    color="blue" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Performance</h3>
                            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-blue-500/20">
                                <option>Last 7 Months</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                                        cursor={{stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '4 4'}}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <RecentBookings />
                </div>

                {/* Right Performance Stats */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-xl font-bold mb-2">System Health</h4>
                        <div className="text-4xl font-black mb-6">99.9%</div>
                        <div className="space-y-4">
                            {[
                                { label: 'API Latency', val: '24ms', perc: 85 },
                                { label: 'CPU Load', val: '12%', perc: 30 },
                                { label: 'Active Sessions', val: '1,240', perc: 60 },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 opacity-80 uppercase tracking-wider">
                                        <span>{item.label}</span>
                                        <span>{item.val}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{width: `${item.perc}%`}} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Service Distribution</h4>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'F', val: 45 },
                                    { name: 'H', val: 32 },
                                    { name: 'B', val: 18 },
                                    { name: 'T', val: 56 },
                                ]}>
                                    <Bar dataKey="val" fill="#2563eb" radius={[10, 10, 10, 10]} barSize={20} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                                    <Tooltip cursor={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {[
                                { l: 'Flights', c: 'blue' }, { l: 'Hotels', c: 'indigo' },
                                { l: 'Buses', c: 'slate' }, { l: 'Trains', c: 'sky' }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-blue-600`} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{s.l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
