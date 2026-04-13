import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './index.css'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientPortal from './pages/PatientPortal'
import BookAppointment from './pages/BookAppointment'
import AdminDashboard from './pages/AdminDashboard'
import AdminAppointments from './pages/AdminAppointments'
import AdminPatients from './pages/AdminPatients'
import AdminPrescriptions from './pages/AdminPrescriptions'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/portal" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/portal" element={<ProtectedRoute><PatientPortal /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute adminOnly><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute adminOnly><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/prescriptions" element={<ProtectedRoute adminOnly><AdminPrescriptions /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
