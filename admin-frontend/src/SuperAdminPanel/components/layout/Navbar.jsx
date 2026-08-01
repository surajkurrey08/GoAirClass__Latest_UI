import React, { useState } from 'react';
import {
    Search, Bell, Moon, Sun, SearchIcon,
    Settings, User, LogOut, ChevronDown
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


export default function Navbar() {
    const { isDarkMode, toggleDarkMode, sidebarOpen } = useAdmin();
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Admin Session Ended');
        navigate('/login');
    };

    return (
        <header
            className={`
                sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md 
                border-b border-slate-200 dark:border-slate-800 transition-all duration-300
            `}
        >
            <div className={`px-4 sm:px-6 h-20 flex items-center justify-between`}>

                {/* Search Bar */}
                <div className="flex-1 max-w-md hidden sm:block">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 ml-auto">

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all active:scale-95">
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                    </button>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2 invisible sm:visible" />

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Super Admin</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Main System</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                <User size={20} />
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 dark:border-slate-700 py-2 animate-in fade-in slide-in-from-top-4 duration-200">
                                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <User size={16} /> Profile Settings
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <Settings size={16} /> System Logs
                                </a>
                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
