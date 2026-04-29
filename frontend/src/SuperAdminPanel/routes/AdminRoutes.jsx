import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import AdminRequests from '../pages/AdminRequests';
import UserDirectory from '../pages/UserDirectory';

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

// Flights
import FlightDashboard from '../pages/flights/FlightDashboard';
import ApiConfig from '../pages/flights/ApiConfig';
import AirlineManagement from '../pages/flights/AirlineManagement';
import PricingEngine from '../pages/flights/PricingEngine';
import AddPricingRule from '../pages/flights/AddPricingRule';
import CommissionManagement from '../pages/flights/CommissionManagement';
import BookingManagement from '../pages/flights/BookingManagement';
import CancellationRefunds from '../pages/flights/CancellationRefunds';
import SupportTickets from '../pages/flights/SupportTickets';
import FlightReports from '../pages/flights/FlightReports';
import FlightOffers from '../pages/flights/FlightOffers';
import FlightInventory from '../pages/flights/FlightInventory';
import AddFlight from '../pages/flights/AddFlight';
import RoutesList from '../pages/flights/RoutesList';
import FlightAddRoute from '../pages/flights/AddRoute';
import AirportsList from '../pages/flights/AirportsList';
import AddAirport from '../pages/flights/AddAirport';
import AddAirline from '../pages/flights/AddAirline';
import MealMasterList from '../pages/flights/ancillaries/MealMasterList';
import AddMealForm from '../pages/flights/ancillaries/AddMealForm';

export default function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route path="" element={<Dashboard />} />
                <Route path="users" element={<UserDirectory />} />
                <Route path="requests" element={<AdminRequests />} />

                {/* Flights Management */}
                <Route path="flights" element={<FlightDashboard />} />
                <Route path="flights/api-config" element={<ApiConfig />} />
                <Route path="flights/airlines" element={<AirlineManagement />} />
                <Route path="flights/add-airline" element={<AddAirline />} />
                <Route path="flights/pricing" element={<PricingEngine />} />
                <Route path="flights/add-pricing" element={<AddPricingRule />} />
                <Route path="flights/commissions" element={<CommissionManagement />} />
                <Route path="flights/bookings" element={<BookingManagement />} />
                <Route path="flights/cancellations" element={<CancellationRefunds />} />
                <Route path="flights/tickets" element={<SupportTickets />} />
                <Route path="flights/reports" element={<FlightReports />} />
                <Route path="flights/offers" element={<FlightOffers />} />
                <Route path="flights/inventory" element={<FlightInventory />} />
                <Route path="flights/add-flight" element={<AddFlight />} />
                <Route path="flights/routes" element={<RoutesList />} />
                <Route path="flights/add-route" element={<FlightAddRoute />} />
                <Route path="flights/airports" element={<AirportsList />} />
                <Route path="flights/add-airport" element={<AddAirport />} />
                <Route path="flights/ancillaries/meals" element={<MealMasterList />} />
                <Route path="flights/ancillaries/add-meals" element={<AddMealForm />} />
                <Route path="flights/ancillaries/edit-meal/:id" element={<AddMealForm />} />

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
