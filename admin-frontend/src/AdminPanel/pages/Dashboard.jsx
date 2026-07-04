import React from 'react';
import { 
    Users, DollarSign, Plane, Hotel, 
    Bus, TrainFront, ArrowUpRight, ArrowDownRight,
    Search, Calendar, Filter
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const data = [
  { name: 'Mon', flights: 400, hotels: 240, buses: 150, trains: 300 },
  { name: 'Tue', flights: 300, hotels: 139, buses: 200, trains: 280 },
  { name: 'Wed', flights: 200, hotels: 980, buses: 180, trains: 400 },
  { name: 'Thu', flights: 278, hotels: 390, buses: 250, trains: 350 },
  { name: 'Fri', flights: 189, hotels: 480, buses: 300, trains: 450 },
  { name: 'Sat', flights: 239, hotels: 380, buses: 400, trains: 500 },
  { name: 'Sun', flights: 349, hotels: 430, buses: 350, trains: 480 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-50 dark:bg-${color}-500/10 flex items-center justify-center text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-300`}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trendValue}
            </div>
        </div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h3>
    </div>
);

export default function Dashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Operations Dashboard</h1>
                    <p className="text-slate-500 font-medium">Monitoring GoAirClass service performance and bookings.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                        <Calendar size={16} />
                        Last 7 Days
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
                        Download Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Flight Bookings" 
                    value="1,284" 
                    icon={Plane} 
                    trend="up" 
                    trendValue="+14%" 
                    color="blue" 
                />
                <StatCard 
                    title="Hotel Stays" 
                    value="842" 
                    icon={Hotel} 
                    trend="up" 
                    trendValue="+8%" 
                    color="indigo" 
                />
                <StatCard 
                    title="Bus Tickets" 
                    value="2,450" 
                    icon={Bus} 
                    trend="down" 
                    trendValue="-3%" 
                    color="amber" 
                />
                <StatCard 
                    title="Train Travels" 
                    value="3,120" 
                    icon={TrainFront} 
                    trend="up" 
                    trendValue="+22%" 
                    color="green" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Popularity</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-blue-600" /> Flights
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-indigo-600" /> Hotels
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                                />
                                <Area type="monotone" dataKey="flights" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorF)" />
                                <Area type="monotone" dataKey="hotels" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorH)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 text-center uppercase tracking-widest">Revenue Goals</h3>
                    <div className="flex flex-col items-center justify-center py-10 relative">
                        <div className="w-48 h-48 rounded-full border-[12px] border-slate-50 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">82%</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Achieved</p>
                        </div>
                        <svg className="absolute w-48 h-48 -rotate-90 pointer-events-none">
                            <circle 
                                cx="96" cy="96" r="84" 
                                fill="transparent" stroke="#2563eb" strokeWidth="12" 
                                strokeDasharray="527" strokeDashoffset={527 * (1 - 0.82)}
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <div className="space-y-4 mt-8">
                        {[
                            { label: 'Weekly Target', val: '₹12.5L / ₹15L' },
                            { label: 'Monthly Growth', val: '+12.4%' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
