import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchBusCount } from '../services/adminBus';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('adminDarkMode');
        return saved === 'true' || false;
    });
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [pendingCount, setPendingCount] = useState(0);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const refreshPendingCount = async () => {
        try {
            // Using different params based on the role is handled in the service/backend usually,
            // but here we just fetch all pending for the badge.
            const res = await fetchBusCount({ status: 'pending' });
            if (res.success) {
                setPendingCount(res.count);
            }
        } catch (error) {
            console.error('Failed to sync pending count:', error);
        }
    };

    // Dark Mode Effect
    useEffect(() => {
        localStorage.setItem('adminDarkMode', isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Polling effect
    useEffect(() => {
        refreshPendingCount();
        const interval = setInterval(refreshPendingCount, 60000); // 1 min polling
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminContext.Provider value={{ 
            sidebarOpen, 
            setSidebarOpen,
            toggleSidebar, 
            user, 
            setUser,
            isDarkMode,
            toggleDarkMode,
            activeTab,
            setActiveTab,
            pendingCount, 
            pendingBusCount: pendingCount, // Alias for backward compatibility with SuperAdmin components
            refreshPendingCount 
        }}>
            {children}
        </AdminContext.Provider>
    );
};
