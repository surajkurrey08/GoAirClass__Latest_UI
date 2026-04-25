import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const BusList = React.lazy(() => import('./pages/BusList'));
const RouteList = React.lazy(() => import('./pages/RouteList'));
const TripList = React.lazy(() => import('./pages/TripList'));
const LiveBookings = React.lazy(() => import('./pages/LiveBookings'));
const CouponList = React.lazy(() => import('./pages/CouponList'));
const ReviewList = React.lazy(() => import('./pages/ReviewList'));

const BusForm = React.lazy(() => import('./pages/BusForm'));
const RouteForm = React.lazy(() => import('./pages/RouteForm'));
const TripForm = React.lazy(() => import('./pages/TripForm'));
const CouponForm = React.lazy(() => import('./pages/CouponForm'));

const BoardingReminder = React.lazy(() => import('./pages/BoardingReminder'));

const BusOperatorApp = () => {
    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-grow overflow-x-hidden">
                <React.Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                }>
                    <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="buses" element={<BusList />} />
                        <Route path="buses/add" element={<BusForm />} />
                        <Route path="buses/edit/:id" element={<BusForm />} />
                        
                        <Route path="routes" element={<RouteList />} />
                        <Route path="routes/add" element={<RouteForm />} />
                        <Route path="routes/edit/:id" element={<RouteForm />} />
                        
                        <Route path="trips" element={<TripList />} />
                        <Route path="trips/add" element={<TripForm />} />
                        <Route path="trips/edit/:id" element={<TripForm />} />
                        
                        <Route path="bookings" element={<LiveBookings />} />
                        <Route path="boarding-reminder" element={<BoardingReminder />} />
                        <Route path="coupons">
                            <Route index element={<CouponList />} />
                            <Route path="create" element={<CouponForm />} />
                        </Route>
                        <Route path="reviews" element={<ReviewList />} />
                        <Route path="*" element={<Navigate to="/bus-operator" replace />} />
                    </Routes>
                </React.Suspense>
            </main>
        </div>
    );
};

export default BusOperatorApp;
