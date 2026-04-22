import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/Bookings';
import Users from '../pages/Users';

// Bus Management Pages
import AllBuses from '../pages/buses/AllBuses';
import AddBus from '../pages/buses/AddBus';
import BusRequests from '../pages/buses/BusRequests';
import ActiveBuses from '../pages/buses/ActiveBuses';
import SuspendedBuses from '../pages/buses/SuspendedBuses';
import Operators from '../pages/buses/Operators';
import BusTypes from '../pages/buses/BusTypes';

export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="" element={<Dashboard />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="users" element={<Users />} />
                
                {/* Bus Management Dropdown Routes */}
                <Route path="buses/all" element={<AllBuses />} />
                <Route path="buses/add" element={<AddBus />} />
                <Route path="buses/requests" element={<BusRequests />} />
                <Route path="buses/active" element={<ActiveBuses />} />
                <Route path="buses/suspended" element={<SuspendedBuses />} />
                <Route path="buses/operators" element={<Operators />} />
                <Route path="buses/types" element={<BusTypes />} />

                {/* Catch all for admin subroutes */}
                <Route path="*" element={<Navigate to="" replace />} />
            </Route>
        </Routes>
    );
}
