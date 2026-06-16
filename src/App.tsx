import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, lazy, Suspense, ReactNode } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import LoadingPage from '@/pages/LoadingPage'

// Lazy-loaded pages — each becomes its own chunk to keep the initial bundle small.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const CustomersPage = lazy(() => import('@/pages/crm/CustomersPage'))
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'))
const InvoicesPage = lazy(() => import('@/pages/invoices/InvoicesPage'))
const FiscalPage = lazy(() => import('@/pages/fiscal/FiscalPage'))
const MarketplacePage = lazy(() => import('@/pages/marketplace/MarketplacePage'))

function dashboard(page: ReactNode) {
  return <DashboardLayout>{page}</DashboardLayout>
}

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
      <Suspense fallback={<LoadingPage />}>
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
              <Route path="/dashboard" element={dashboard(<DashboardPage />)} />
              <Route path="/crm/customers" element={dashboard(<CustomersPage />)} />
              <Route path="/products" element={dashboard(<ProductsPage />)} />
              <Route path="/invoices" element={dashboard(<InvoicesPage />)} />
              <Route path="/fiscal" element={dashboard(<FiscalPage />)} />
              <Route path="/marketplace" element={dashboard(<MarketplacePage />)} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
