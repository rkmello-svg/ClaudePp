import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APP_VERSION } from '@claudepp/shared';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PDVPage } from './pages/PDVPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/pdv"
          element={
            <ProtectedRoute>
              <PDVPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/pdv" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
