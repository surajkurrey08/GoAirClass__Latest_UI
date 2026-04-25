import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/Bookings';
import Users from '../pages/Users';

// Booking Control Pages (Shared from SuperAdmin for consistency)
import AdminHeroImages from '../pages/AdminHeroImages';
import AllBookings from '../../SuperAdminPanel/pages/bookings/AllBookings';
import CancelRequests from '../../SuperAdminPanel/pages/bookings/CancelRequests';
import RefundInitiate from '../../SuperAdminPanel/pages/bookings/RefundInitiate';
import OperatorBookings from '../../SuperAdminPanel/pages/bookings/OperatorBookings';

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
                <Route path="hero-images" element={<AdminHeroImages />} />
                
                {/* Bus Management Dropdown Routes */}
                <Route path="buses/all" element={<AllBuses />} />
                <Route path="buses/add" element={<AddBus />} />
                <Route path="buses/requests" element={<BusRequests />} />
                <Route path="buses/active" element={<ActiveBuses />} />
                <Route path="buses/suspended" element={<SuspendedBuses />} />
                <Route path="buses/operators" element={<Operators />} />
                <Route path="buses/types" element={<BusTypes />} />

                {/* Booking Control */}
                <Route path="bookings/all" element={<AllBookings />} />
                <Route path="bookings/cancel-requests" element={<CancelRequests />} />
                <Route path="bookings/refund-initiate" element={<RefundInitiate />} />
                <Route path="bookings/operator-wise" element={<OperatorBookings />} />

                {/* Catch all for admin subroutes */}
                <Route path="*" element={<Navigate to="" replace />} />
            </Route>
        </Routes>
    );
}
