import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const SidebarDropdown = ({ icon: Icon, label, items, isOpen, sidebarOpen }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    // Keep dropdown expanded if a child route is active
    useEffect(() => {
        const currentPath = location.pathname + location.search;
        const isChildActive = items.some(item => {
            if (!item.to) return false;
            if (item.to.includes('?')) {
                return currentPath === item.to || currentPath.startsWith(item.to + '&');
            }
            return location.pathname === item.to;
        });
        if (isChildActive) setIsExpanded(true);
    }, [location.pathname, location.search, items]);

    if (!sidebarOpen) {
        return (
            <div className="relative group px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-blue-600 cursor-pointer flex justify-center">
                <Icon size={20} />
                <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap shadow-xl">
                    {label}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-blue-600'}
                `}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className="shrink-0" />
                    <span className="font-semibold text-sm tracking-wide">{label}</span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-12 pr-4 space-y-1 py-1 relative">
                    {/* Vertical line indicator */}
                    <div className="absolute left-[26px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                    
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.isHeader ? (
                                <div className="py-2 mt-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-2 block">
                                        {item.label}
                                    </span>
                                </div>
                            ) : (
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) => `
                                        flex items-center justify-between py-2 rounded-lg text-xs font-bold transition-all duration-200
                                        ${isActive 
                                            ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 px-3' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:translate-x-1'}
                                    `}
                                >
                                    <span className="relative">
                                        {item.label}
                                        {item.badge > 0 && (
                                            <span className="absolute -top-1 -right-6 px-1.5 py-0.5 text-[8px] bg-amber-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </span>
                                </NavLink>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SidebarDropdown;
