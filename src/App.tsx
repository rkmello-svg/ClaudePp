import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'

// Pages
import LoginPage from '@/pages/auth/LoginPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import LoadingPage from '@/pages/LoadingPage'

function App() {
  const { user, loading } = useAuth()
  const { setUser } = useAuthStore()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  if (loading) {
    return <LoadingPage />
  }

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App
