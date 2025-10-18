import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AssignmentProvider } from './contexts/AssignmentContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RosterPage from './pages/RosterPage'
import SitesPage from './pages/SitesPage'
import GuardsPage from './pages/GuardsPage'
import SwapsPage from './pages/SwapsPage'
import AlertsPage from './pages/AlertsPage'
import GuardPortal from './pages/GuardPortal'
import LeaveManagementPage from './pages/LeaveManagementPage'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration)
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError)
          })
      })
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading GuardRoster...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <AssignmentProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="roster" element={<RosterPage />} />
            <Route path="sites" element={<SitesPage />} />
            <Route path="guards" element={<GuardsPage />} />
            <Route path="swaps" element={<SwapsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="leave-management" element={<LeaveManagementPage />} />
          </Route>
          <Route path="/guard" element={<GuardPortal />} />
        </Routes>
      </AssignmentProvider>
    </AuthProvider>
  )
}

export default App
