import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
        green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-100 dark:border-green-500/20',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/20'
    };

    const selectedColor = colors[color] || colors.blue;

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 group hover:border-blue-200 dark:hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl border ${selectedColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'}`}>
                        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {trendValue}
                    </div>
                )}
            </div>
            
            <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {value}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Updated 2 mins ago
                </div>
            </div>
        </div>
    );
}
