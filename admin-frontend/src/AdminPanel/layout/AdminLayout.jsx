import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { useAdmin } from '../../context/AdminContext.jsx';

export default function AdminLayout() {
    const { sidebarOpen } = useAdmin();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div 
                className={`
                    transition-all duration-300 min-h-screen flex flex-col
                    ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}
                `}
            >
                {/* Navbar */}
                <Navbar />

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>

                <footer className="p-6 text-center text-xs text-slate-400 font-medium tracking-wider">
                    © 2026 Admin Panel • GoAirClass Operations
                </footer>
            </div>
        </div>
    );
}
