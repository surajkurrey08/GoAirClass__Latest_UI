import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchBusCount } from '../../services/adminBus';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [pendingCount, setPendingCount] = useState(0);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const refreshPendingCount = async () => {
        try {
            const data = await fetchBusCount({ status: 'pending' });
            if (data.success) {
                setPendingCount(data.count);
            }
        } catch (error) {
            console.error('Failed to sync pending count:', error);
        }
    };

    useEffect(() => {
        if (user) {
            refreshPendingCount();
            // Polling for updates every 2 minutes
            const interval = setInterval(refreshPendingCount, 120000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <AdminContext.Provider value={{ 
            sidebarOpen, 
            toggleSidebar, 
            user, 
            setUser, 
            pendingCount, 
            refreshPendingCount 
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
