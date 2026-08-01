import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import AdminRequests from '../pages/AdminRequests';
import UserDirectory from '../pages/UserDirectory';
import Inquiries from '../../AdminPanel/pages/Inquiries';

// Buses
import AllBuses from '../pages/buses/AllBuses';
import AddBus from '../pages/buses/AddBus';
import BusRequests from '../pages/buses/BusRequests';
import ActiveBuses from '../pages/buses/ActiveBuses';
import SuspendedBuses from '../pages/buses/SuspendedBuses';
import RejectedBuses from '../pages/buses/RejectedBuses';
import Operators from '../pages/buses/Operators';
import OperatorFleet from '../pages/buses/OperatorFleet';
import AllRoutes from '../pages/routes/AllRoutes';
import BusAddRoute from '../pages/routes/AddRoute';
import PopularRoutes from '../pages/routes/PopularRoutes';
import AllBookings from '../pages/bookings/AllBookings';
import CancelRequests from '../pages/bookings/CancelRequests';
import RefundInitiate from '../pages/bookings/RefundInitiate';
import OperatorBookings from '../pages/bookings/OperatorBookings';
import FraudAlerts from '../pages/bookings/FraudAlerts';
import BusTypes from '../pages/buses/BusTypes';
export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="" element={<Dashboard />} />
                <Route path="users" element={<UserDirectory />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="inquiries" element={<Inquiries />} />

                {/* Buses Management */}
                <Route path="buses/all" element={<AllBuses />} />
                <Route path="buses/add" element={<AddBus />} />
                <Route path="buses/requests" element={<BusRequests />} />
                <Route path="buses/active" element={<ActiveBuses />} />
                <Route path="buses/suspended" element={<SuspendedBuses />} />
                <Route path="buses/rejected" element={<RejectedBuses />} />
                <Route path="buses/operators" element={<Operators />} />
                <Route path="buses/operators/:id/fleet" element={<OperatorFleet />} />

                {/* Route Network */}
                <Route path="buses/routes/all" element={<AllRoutes />} />
                <Route path="buses/routes/add" element={<BusAddRoute />} />
                <Route path="buses/routes/edit/:id" element={<BusAddRoute />} />
                <Route path="buses/routes/popular" element={<PopularRoutes />} />

                {/* Booking Control */}
                <Route path="bookings/all" element={<AllBookings />} />
                <Route path="bookings/cancel-requests" element={<CancelRequests />} />
                <Route path="bookings/refund-initiate" element={<RefundInitiate />} />
                <Route path="bookings/operator-wise" element={<OperatorBookings />} />
                <Route path="bookings/fraud" element={<FraudAlerts />} />

                <Route path="buses/types" element={<BusTypes />} />

                {/* Catch all for admin subroutes */}
                <Route path="*" element={<Navigate to="" replace />} />
            </Route>
        </Routes>
    );
}
