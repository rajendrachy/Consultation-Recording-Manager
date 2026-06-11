import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Routes Protector
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Consultations from './pages/Consultations';
import Recordings from './pages/Recordings';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Home from './pages/Home';

// Stores
import useThemeStore from './store/themeStore';

// Instantiate react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // Sync dark/light theme classes on body element
    initTheme();
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            }
          />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'consultant', 'staff']} />}>
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/clients"
              element={
                <DashboardLayout>
                  <Clients />
                </DashboardLayout>
              }
            />
            <Route
              path="/consultations"
              element={
                <DashboardLayout>
                  <Consultations />
                </DashboardLayout>
              }
            />
            <Route
              path="/recordings"
              element={
                <DashboardLayout>
                  <Recordings />
                </DashboardLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              }
            />
            <Route
              path="/notifications"
              element={
                <DashboardLayout>
                  <Notifications />
                </DashboardLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              }
            />
          </Route>

          {/* Admin Restricted Management Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route
              path="/admin"
              element={
                <DashboardLayout>
                  <Admin />
                </DashboardLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              }
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
