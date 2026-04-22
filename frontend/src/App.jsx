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
import AdminApp from './AdminPanel/AdminApp'
import SuperAdminApp from './SuperAdminPanel/AdminApp'
import BusOperatorApp from './BusOperatorPanel/BusOperatorApp'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/set-password" element={<SetPassword />} />
        
        {/* Admin Panel */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminApp />
            </ProtectedRoute>
          } 
        />

        {/* Super Admin Panel */}
        <Route 
          path="/super-admin/*" 
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminApp />
            </ProtectedRoute>
          } 
        />

        {/* Bus Operator Panel */}
        <Route 
          path="/bus-operator/*" 
          element={
            <ProtectedRoute allowedRoles={['bus_operator']}>
              <BusOperatorApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}
