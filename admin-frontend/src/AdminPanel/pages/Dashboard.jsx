import React from 'react';
import { 
    Users, Dumbbell, IndianRupee, Calendar,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const userGrowthData = [
  { name: '1', users: 1.00 },
  { name: '5', users: 1.00 },
  { name: '10', users: 1.00 },
  { name: '15', users: 1.00 },
  { name: '20', users: 1.00 },
  { name: '25', users: 1.00 },
  { name: '30', users: 1.01 },
];

const revenueGrowthData = [
  { name: '5', revenue: 6000 },
  { name: '10', revenue: 6400 },
  { name: '15', revenue: 7000 },
  { name: '20', revenue: 8200 },
  { name: '25', revenue: 8300 },
  { name: '30', revenue: 8100 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[130px]">
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Icon size={20} />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{value}</h3>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
            {trendValue} <span className="text-slate-400 font-medium normal-case">from last month</span>
        </div>
    </div>
);

export default function Dashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm font-medium">Monitor key metrics and recent activities</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value="1" 
                    icon={Users} 
                    trend="up" 
                    trendValue="+12%" 
                />
                <StatCard 
                    title="Total Gyms" 
                    value="3" 
                    icon={Dumbbell} 
                    trend="up" 
                    trendValue="+5%" 
                />
                <StatCard 
                    title="Total Revenue" 
                    value="₹28,660" 
                    icon={IndianRupee} 
                    trend="up" 
                    trendValue="+18%" 
                />
                <StatCard 
                    title="Active Bookings" 
                    value="0" 
                    icon={Calendar} 
                    trend="down" 
                    trendValue="-2%" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">User Growth (Last 30 Days)</h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                                <YAxis domain={[0.98, 1.06]} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)'}}
                                />
                                <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={2} dot={{ stroke: '#f97316', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Growth Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Revenue Growth (Last 30 Days)</h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueGrowthData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                                <YAxis domain={[6000, 8500]} axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)'}}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={{ stroke: '#10b981', strokeWidth: 2, r: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
