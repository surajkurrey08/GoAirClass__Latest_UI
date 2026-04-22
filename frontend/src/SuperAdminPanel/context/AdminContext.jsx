import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('adminDarkMode');
        return saved === 'true' || false;
    });
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [pendingBusCount, setPendingBusCount] = useState(0);

    const refreshPendingCount = async () => {
        try {
            const { fetchBusCount } = await import('../../services/adminBus');
            const res = await fetchBusCount({ status: 'pending' });
            if (res.success) {
                setPendingBusCount(res.count);
            }
        } catch (error) {
            console.error('Failed to fetch pending count:', error);
        }
    };

    useEffect(() => {
        refreshPendingCount();
        const interval = setInterval(refreshPendingCount, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        localStorage.setItem('adminDarkMode', isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    return (
        <AdminContext.Provider value={{
            sidebarOpen,
            setSidebarOpen,
            toggleSidebar,
            isDarkMode,
            toggleDarkMode,
            activeTab,
            setActiveTab,
            pendingBusCount,
            refreshPendingCount
        }}>
            {children}
        </AdminContext.Provider>
    );
};
