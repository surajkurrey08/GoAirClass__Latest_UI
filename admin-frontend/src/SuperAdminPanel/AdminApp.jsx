import React from 'react';
import { AdminProvider } from '../context/AdminContext.jsx';
import AdminRoutes from './routes/AdminRoutes';

export default function AdminApp() {
    return (
        <AdminProvider>
            <AdminRoutes />
        </AdminProvider>
    );
}
