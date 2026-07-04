import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCheck, ShieldAlert,
    BarChart3, Settings, LogOut, ChevronLeft,
    ChevronRight, Plane, Hotel, Bus, TrainFront,
    MessageSquare, FileText, Gift, ChevronDown, Plus,
    List, CheckCircle, Ban, XCircle, UserPlus, Settings2,
    Route as RouteIcon, MapPin, Navigation, Star, Tag, Percent, Layers
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext.jsx';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const SidebarItem = ({ to, icon: Icon, label, badge, isSubItem = false }) => {
    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) => `
                flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-blue-600'}
                ${isSubItem ? 'ml-4 py-2 opacity-90' : ''}
            `}
        >
            <div className="flex items-center gap-3">
                <Icon size={isSubItem ? 16 : 20} className="shrink-0" />
                <span className={`${isSubItem ? 'text-xs' : 'text-sm'} font-semibold tracking-wide`}>{label}</span>
            </div>
            {badge !== undefined && badge !== null && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                    {badge}
                </span>
            )}
        </NavLink>
    );
};

const SidebarDropdown = ({ label, icon: Icon, children, sidebarOpen, active }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Auto-expand if a child is active
    React.useEffect(() => {
        if (active) setIsExpanded(true);
    }, [active]);

    if (!sidebarOpen) {
        return (
            <div className={`
                flex items-center justify-center p-3 rounded-xl mb-1 cursor-pointer
                ${active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}
            `}>
                <Icon size={20} />
            </div>
        );
    }

    return (
        <div className="mb-1">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200
                    ${active && !isExpanded ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}
                    ${isExpanded ? 'text-blue-600' : ''}
                `}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className="shrink-0" />
                    <span className="font-semibold text-sm tracking-wide">{label}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>
            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isExpanded ? 'max-h-[1200px] opacity-100 mt-1' : 'max-h-0 opacity-0'}
            `}>
                <div className="space-y-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

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
    const { sidebarOpen, toggleSidebar, pendingBusCount } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out from Admin Panel');
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
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                {sidebarOpen ? (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">G</div>
                        <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            GoAir Admin
                        </span>
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold mx-auto">G</div>
                )}
            </div>

            {/* Navigation Section */}
            <div className="p-4 h-[calc(100%-80px)] overflow-y-auto">
                <SidebarSection title="General" isOpen={sidebarOpen}>
                    <SidebarItem to="" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="requests" icon={ShieldAlert} label="Admin Requests" badge="3" />
                </SidebarSection>

                <SidebarSection title="Management" isOpen={sidebarOpen}>
                    <SidebarItem to="users" icon={Users} label="User Directory" />
                    <SidebarItem to="admins" icon={UserCheck} label="System Admins" />
                    <SidebarItem to="inquiries" icon={MessageSquare} label="Inquiries" />
                </SidebarSection>

                <SidebarSection title="Services" isOpen={sidebarOpen}>
                    <SidebarDropdown 
                        label="Flights" 
                        icon={Plane} 
                        sidebarOpen={sidebarOpen} 
                        active={location.pathname.includes('/flights')}
                    >
                        {/* Operations */}
                        <SidebarItem to="flights" icon={LayoutDashboard} label="Flight Dashboard" isSubItem />
                        <SidebarItem to="flights/bookings" icon={List} label="Bookings" isSubItem />
                        <SidebarItem to="flights/cancellations" icon={XCircle} label="Refund Panel" isSubItem />
                        <SidebarItem to="flights/tickets" icon={MessageSquare} label="Support Tickets" isSubItem />
                        <SidebarItem to="flights/reports" icon={BarChart3} label="Reports" isSubItem />

                        {/* Management & Config */}
                        <div className="pt-2 pb-1 px-4 ml-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800/50 pt-3">
                                <Settings2 size={12} />
                                <span>Configuration</span>
                            </div>
                        </div>
                        <SidebarItem to="flights/api-config" icon={Settings2} label="API Config" isSubItem />
                        <SidebarItem to="flights/airlines" icon={Plane} label="Airlines" isSubItem />
                        <SidebarItem to="flights/inventory" icon={Layers} label="Flight Inventory" isSubItem />
                        <SidebarItem to="flights/routes" icon={Navigation} label="Routes" isSubItem />
                        <SidebarItem to="flights/airports" icon={MapPin} label="Airports" isSubItem />
                        <SidebarItem to="flights/pricing" icon={Tag} label="Pricing Engine" isSubItem />
                        <SidebarItem to="flights/commissions" icon={Percent} label="Commissions" isSubItem />
                        <SidebarItem to="flights/offers" icon={Gift} label="Offers" isSubItem />
                        
                        {/* Ancillaries Section */}
                        <SidebarDropdown 
                            label="Ancillaries" 
                            icon={Layers} 
                            sidebarOpen={sidebarOpen} 
                            active={location.pathname.includes('/ancillaries')}
                        >
                            <SidebarItem to="flights/ancillaries/meals" icon={CheckCircle} label="Meal Master" isSubItem />
                            <SidebarItem to="flights/ancillaries/add-meals" icon={Plus} label="Add New Meal" isSubItem />
                            <SidebarItem to="flights/ancillaries/seats" icon={Settings2} label="Seat Configuration" isSubItem />
                            <SidebarItem to="flights/ancillaries/baggage" icon={FileText} label="Baggage Master" isSubItem />
                        </SidebarDropdown>
                    </SidebarDropdown>
                    <SidebarItem to="hotels" icon={Hotel} label="Hotels" />

                    <SidebarDropdown
                        label="Buses"
                        icon={Bus}
                        sidebarOpen={sidebarOpen}
                        active={location.pathname.includes('/buses')}
                    >
                        <SidebarItem to="buses/all" icon={List} label="All Buses" isSubItem />
                        <SidebarItem to="buses/add" icon={Plus} label="Add Bus" isSubItem />
                        <SidebarItem to="buses/requests" icon={ShieldAlert} label="Bus Requests" badge={pendingBusCount > 0 ? pendingBusCount : null} isSubItem />
                        <SidebarItem to="buses/active" icon={CheckCircle} label="Active Buses" isSubItem />
                        <SidebarItem to="buses/suspended" icon={Ban} label="Suspended" isSubItem />
                        <SidebarItem to="buses/rejected" icon={XCircle} label="Rejected" isSubItem />
                        <SidebarItem to="buses/operators" icon={UserPlus} label="Operators" isSubItem />
                        <SidebarItem to="buses/types" icon={Settings2} label="Bus Types" isSubItem />

                        {/* Route Network Section */}
                        <div className="pt-2 pb-1 px-4 ml-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800/50 pt-3">
                                <RouteIcon size={12} />
                                <span>Route Network</span>
                            </div>
                        </div>
                        <SidebarItem to="buses/routes/all" icon={List} label="All Routes" isSubItem />
                        <SidebarItem to="buses/routes/add" icon={Plus} label="Add Route" isSubItem />
                        <SidebarItem to="buses/routes/popular" icon={Star} label="Popular Routes" isSubItem />

                        {/* Booking Control Sub-Section */}
                        <div className="pt-2 pb-1 px-4 ml-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800/50 pt-3">
                                <FileText size={12} />
                                <span>Booking Control</span>
                            </div>
                        </div>
                        <SidebarItem to="bookings/all" icon={List} label="All Bookings" isSubItem />
                        <SidebarItem to="bookings/cancel-requests" icon={XCircle} label="Cancel Requests" isSubItem />
                        <SidebarItem to="bookings/refund-initiate" icon={Tag} label="Refund Initiate" isSubItem />
                        <SidebarItem to="bookings/operator-wise" icon={Users} label="Operator Wise Bookings" isSubItem />
                        <SidebarItem to="bookings/fraud" icon={ShieldAlert} label="Fraud Alerts" isSubItem />
                    </SidebarDropdown>

                    <SidebarItem to="trains" icon={TrainFront} label="Trains" />
                </SidebarSection>


                <SidebarSection title="Reports & Tools" isOpen={sidebarOpen}>
                    <SidebarItem to="reports" icon={BarChart3} label="Analytics" />
                    <SidebarItem to="marketing" icon={Gift} label="Marketing" />
                    <SidebarItem to="support" icon={MessageSquare} label="Support" />
                </SidebarSection>

                {/* Logout Button at bottom of scrollable area */}
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

            {/* Collapse Toggle */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-blue-600"
            >
                {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
        </aside>
    );
}
