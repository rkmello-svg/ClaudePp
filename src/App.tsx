import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import CustomersPage from '@/pages/crm/CustomersPage'
import ProductsPage from '@/pages/products/ProductsPage'
import InvoicesPage from '@/pages/invoices/InvoicesPage'
import LoadingPage from '@/pages/LoadingPage'

function App() {
  const { user, loading } = useAuth()
  const { setUser, company } = useAuthStore()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  if (loading) {
    return <LoadingPage />
  }

  const isOnboarding = !company

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </>
        ) : isOnboarding ? (
          <>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/crm/customers"
              element={
                <DashboardLayout>
                  <CustomersPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/products"
              element={
                <DashboardLayout>
                  <ProductsPage />
                </DashboardLayout>
              }
            />
            <Route
              path="/invoices"
              element={
                <DashboardLayout>
                  <InvoicesPage />
                </DashboardLayout>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App
