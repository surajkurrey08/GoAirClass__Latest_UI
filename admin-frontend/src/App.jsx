import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminApp from './AdminPanel/AdminApp'
import SuperAdminApp from './SuperAdminPanel/AdminApp'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Root "/" — send the logged-in user to their panel, otherwise to login
function RoleRedirect() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) return <Navigate to="/login" replace />
  if (user.role === 'superadmin') return <Navigate to="/super-admin" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Panel */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminApp />
          </ProtectedRoute>
        }/>

        {/* Super Admin Panel */}
        <Route path="/super-admin/*" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminApp />
          </ProtectedRoute>
        }/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
