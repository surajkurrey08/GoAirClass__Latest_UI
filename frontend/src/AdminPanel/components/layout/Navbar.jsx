import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext.jsx';

export default function Navbar() {
    const { toggleSidebar } = useAdmin();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
                >
                    <Menu size={20} className="text-slate-500" />
                </button>

                <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 w-64 lg:w-96 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Search size={18} className="text-slate-400 group-focus-within:text-blue-500" />
                    <input
                        type="text"
                        placeholder="Search bookings, users..."
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full placeholder:text-slate-400 text-slate-900 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{user.fullName || 'Admin User'}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider leading-none">Operations Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}
