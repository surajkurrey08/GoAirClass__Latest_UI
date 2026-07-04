import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import Detail from './pages/Detail'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import Success from './pages/Success'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import SetPassword from './pages/SetPassword'
import Inquiry from './pages/Inquiry'
import BusOperatorApp from './BusOperatorPanel/BusOperatorApp'
import SeatSelection from './pages/SeatSelection'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


// ── Service Pages ──
import FlightsPage from './pages/services/FlightsPage'
import HotelsPage  from './pages/services/HotelsPage'
import TrainsPage  from './pages/services/TrainsPage'
import BusesPage   from './pages/services/BusesPage'
import FlightReviewPage from './pages/flights/FlightReviewPage'
import FlightPaymentPage from './pages/flights/FlightPaymentPage'

// Admin panels moved to admin.goairclass.com — redirect old links there
function ExternalRedirect({ to }) {
  React.useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />

        {/* ── Service Pages ── */}
        <Route path="/flights" element={<FlightsPage />} />
        <Route path="/flight/review" element={<FlightReviewPage />} />
        <Route path="/flight/payment" element={<FlightPaymentPage />} />
        <Route path="/hotels"  element={<HotelsPage />} />
        <Route path="/trains"  element={<TrainsPage />} />
        <Route path="/buses"   element={<BusesPage />} />

        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/bus-selection/:scheduleId" element={<SeatSelection />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/inquiry" element={<Inquiry />} />

        {/* Admin & Super Admin panels now live on the dedicated admin app */}
        <Route path="/admin/*" element={<ExternalRedirect to="https://admin.goairclass.com" />} />
        <Route path="/super-admin/*" element={<ExternalRedirect to="https://admin.goairclass.com" />} />

        {/* Bus Operator Panel */}
        <Route path="/bus-operator/*" element={
          <ProtectedRoute allowedRoles={['bus_operator']}>
            <BusOperatorApp />
          </ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  )
}