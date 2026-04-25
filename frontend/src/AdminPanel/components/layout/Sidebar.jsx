import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Ticket, Plane, Hotel,
    Bus, TrainFront, Users, BarChart3,
    LogOut, ChevronLeft, ChevronRight, Settings,
    Tag
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext.jsx';
import { toast } from 'react-toastify';
import SidebarDropdown from './SidebarDropdown';

const SidebarItem = ({ to, icon: Icon, label, badge }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) => `
            flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
            ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-blue-600'}
        `}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} className="shrink-0" />
            <span className="font-semibold text-sm tracking-wide whitespace-nowrap">{label}</span>
        </div>
        {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                {badge}
            </span>
        )}
    </NavLink>
);

const SidebarSection = ({ title, children, isOpen }) => (
    <div className="mb-6">
        {isOpen && (
            <h5 className="px-4 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                {title}
            </h5>
        )}
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

export default function Sidebar() {
    const { sidebarOpen, toggleSidebar, pendingCount } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <aside
            className={`
                fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                transition-all duration-300 z-50
                ${sidebarOpen ? 'w-72' : 'w-20'}
            `}
        >
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                {sidebarOpen ? (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">A</div>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                            AdminPanel
                        </span>
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mx-auto">A</div>
                )}
            </div>

            <div className="p-4 h-[calc(100%-80px)] overflow-y-auto no-scrollbar">
                <SidebarSection title="Operations" isOpen={sidebarOpen}>
                    <SidebarItem to="" icon={LayoutDashboard} label="Overview" />
                    <SidebarItem to="users" icon={Users} label="Users" />
                </SidebarSection>

                <SidebarSection title="Services" isOpen={sidebarOpen}>
                    <SidebarItem to="bookings?type=flights" icon={Plane} label="Flights" />
                    <SidebarItem to="bookings?type=hotels" icon={Hotel} label="Hotels" />

                    <SidebarDropdown
                        icon={Bus}
                        label="Buses"
                        sidebarOpen={sidebarOpen}
                        items={[
                            { to: '/admin/buses/all', label: 'All Buses' },
                            { to: '/admin/buses/add', label: 'Add Bus' },
                            { to: '/admin/buses/requests', label: 'Bus Requests', badge: pendingCount },
                            { to: '/admin/buses/active', label: 'Active Buses' },
                            { to: '/admin/buses/suspended', label: 'Suspended Buses' },
                            { to: '/admin/buses/operators', label: 'Operators' },
                            { to: '/admin/buses/types', label: 'Bus Types' },
                            { isHeader: true, label: 'Route Network' },
                            { to: '/admin/buses/routes/all', label: 'All Routes' },
                            { to: '/admin/buses/routes/add', label: 'Add Route' },
                            { to: '/admin/buses/routes/popular', label: 'Popular Routes' },
                            { isHeader: true, label: 'Booking Control' },
                            { to: '/admin/bookings/all', label: 'All Bookings' },
                            { to: '/admin/bookings/cancel-requests', label: 'Cancel Requests' },
                            { to: '/admin/bookings/refund-initiate', label: 'Refund Initiate' },
                            { to: '/admin/bookings/operator-wise', label: 'Operator Wise Bookings' }
                        ]}
                    />

                    <SidebarItem to="bookings?type=trains" icon={TrainFront} label="Trains" />
                </SidebarSection>

                <SidebarSection title="Management" isOpen={sidebarOpen}>
                    <SidebarItem to="bookings" icon={Ticket} label="All Bookings" />
                </SidebarSection>

                <SidebarSection title="Growth" isOpen={sidebarOpen}>
                    <SidebarDropdown
                        icon={Tag}
                        label="Marketing"
                        sidebarOpen={sidebarOpen}
                        items={[
                            { to: '/admin/marketing/coupons', label: 'Coupons' },
                            { to: '/admin/marketing/destinations', label: 'Top Destinations' },
                            { to: '/admin/marketing/video', label: 'Video Content' },
                            { to: '/admin/marketing/reviews', label: 'Reviews' }
                        ]}
                    />
                </SidebarSection>

                <SidebarSection title="Reports" isOpen={sidebarOpen}>
                    <SidebarItem to="reports" icon={BarChart3} label="Analytics" />
                    <SidebarItem to="settings" icon={Settings} label="Settings" />
                </SidebarSection>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full
                            text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold
                            ${!sidebarOpen && 'justify-center'}
                        `}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {sidebarOpen && <span className="text-sm tracking-wide">Log Out</span>}
                    </button>
                </div>
            </div>

            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-blue-600"
            >
                {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
        </aside>
    );
}
