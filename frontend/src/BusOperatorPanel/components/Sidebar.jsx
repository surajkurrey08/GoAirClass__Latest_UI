import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Bus, 
    MapPin, 
    CalendarCheck, 
    Ticket, 
    Tag, 
    TrendingUp, 
    MessageSquare, 
    Settings, 
    LogOut,
    ChevronRight,
    Users
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        end={to === "/bus-operator"}
        className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
            ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}
        `}
    >
        <Icon size={20} className="transition-transform group-hover:scale-110" />
        <span className="font-medium text-sm">{label}</span>
        <ChevronRight size={14} className={`ml-auto opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1`} />
    </NavLink>
);

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <aside className="w-72 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col p-6 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                    <Bus size={24} weight="fill" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Operator</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">GoAirClass Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-grow">
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
                <SidebarItem to="/bus-operator" icon={LayoutDashboard} label="Dashboard" />
                <SidebarItem to="/bus-operator/buses" icon={Bus} label="Fleet Management" />
                <SidebarItem to="/bus-operator/trips" icon={CalendarCheck} label="Trip Schedules" />
                
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2">Operations</p>
                <SidebarItem to="/bus-operator/bookings" icon={Ticket} label="Live Bookings" />
                <SidebarItem to="/bus-operator/pricing" icon={TrendingUp} label="Pricing & Surplus" />
                <SidebarItem to="/bus-operator/coupons" icon={Tag} label="Coupons & Offers" />
                
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2">Customer Relations</p>
                <SidebarItem to="/bus-operator/reviews" icon={MessageSquare} label="Reviews & Support" />
            </nav>

            {/* Footer Actions */}
            <div className="pt-6 mt-6 border-t border-slate-50 flex flex-col gap-2">
                <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all group">
                    <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                    <span className="font-medium text-sm">Account Settings</span>
                </button>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
