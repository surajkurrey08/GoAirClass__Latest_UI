import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Bookings from '../pages/Bookings';
import Users from '../pages/Users';

// Booking Control Pages (Shared from SuperAdmin for consistency)
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

// Route Network Pages
import AllRoutes from '../pages/buses/routes/AllRoutes';
import AddRoute from '../pages/buses/routes/AddRoute';
import PopularRoutes from '../pages/buses/routes/PopularRoutes';

// Marketing Pages
import Coupons from '../pages/marketing/Coupons';
import CreateCoupon from '../pages/marketing/CreateCoupon';
import EditCoupon from '../pages/marketing/EditCoupon';
import AllDestinations from '../pages/marketing/destinations/AllDestinations';
import AddDestination from '../pages/marketing/destinations/AddDestination';
import EditDestination from '../pages/marketing/destinations/EditDestination';
import VideoContent from '../pages/marketing/VideoContent';
import AllReviews from '../pages/marketing/reviews/AllReviews';
import AddReview from '../pages/marketing/reviews/AddReview';

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

                {/* Route Network Dropdown Routes */}
                <Route path="buses/routes/all" element={<AllRoutes />} />
                <Route path="buses/routes/add" element={<AddRoute />} />
                <Route path="buses/routes/edit/:id" element={<AddRoute />} />
                <Route path="buses/routes/popular" element={<PopularRoutes />} />

                {/* Booking Control */}
                <Route path="bookings/all" element={<AllBookings />} />
                <Route path="bookings/cancel-requests" element={<CancelRequests />} />
                <Route path="bookings/refund-initiate" element={<RefundInitiate />} />
                <Route path="bookings/operator-wise" element={<OperatorBookings />} />

                {/* Marketing & Coupons */}
                <Route path="marketing/coupons" element={<Coupons />} />
                <Route path="marketing/coupons/create" element={<CreateCoupon />} />
                <Route path="marketing/coupons/edit/:id" element={<EditCoupon />} />

                {/* Top Destinations */}
                <Route path="marketing/destinations" element={<AllDestinations />} />
                <Route path="marketing/destinations/create" element={<AddDestination />} />
                <Route path="marketing/destinations/edit/:id" element={<EditDestination />} />
                <Route path="marketing/video" element={<VideoContent />} />
                <Route path="marketing/reviews" element={<AllReviews />} />
                <Route path="marketing/reviews/add" element={<AddReview />} />
                <Route path="marketing/reviews/edit/:id" element={<AddReview />} />

                {/* Catch all for admin subroutes */}
                <Route path="*" element={<Navigate to="" replace />} />
            </Route>
        </Routes>
    );
}
