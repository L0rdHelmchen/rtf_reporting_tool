// RTF Reporting Tool - Main App Component
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from './store';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  getCurrentUser
} from './store/slices/authSlice';
import { setScreenSize } from './store/slices/uiSlice';
import { useTranslation } from 'react-i18next';

// Layout Components
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Page Components
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FormsPage from './pages/forms/FormsPage';
import FormDetailPage from './pages/forms/FormDetailPage';
import FormEditorPage from './pages/forms/FormEditorPage';
import XBRLPage from './pages/xbrl/XBRLPage';
import InstitutionPage from './pages/institution/InstitutionPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';

// Error Components
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFoundPage from './pages/error/NotFoundPage';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(state => state.auth.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Loading Component
const LoadingScreen: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={60} />
    <Box sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
      RTF Meldungs-Tool wird geladen...
    </Box>
  </Box>
);

// Main App Component
const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  // Initialize app
  useEffect(() => {
    // Set initial language
    i18n.changeLanguage('de');

    // Handle screen size changes
    const handleResize = () => {
      const width = window.innerWidth;
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
      let isMobile = false;
      let isTablet = false;

      if (width < 600) {
        screenSize = 'xs';
        isMobile = true;
      } else if (width < 960) {
        screenSize = 'sm';
        isTablet = true;
      } else if (width < 1280) {
        screenSize = 'md';
      } else if (width < 1920) {
        screenSize = 'lg';
      } else {
        screenSize = 'xl';
      }

      dispatch(setScreenSize({ size: screenSize, isMobile, isTablet }));
    };

    // Initial screen size detection
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, i18n]);

  // Verify session on mount when authenticated (only when isAuthenticated changes)
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('rtf_access_token');
      if (token) {
        dispatch(getCurrentUser());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Show loading screen during initial authentication check
  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Box sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default'
        }}>
          {/* Global Error Display */}
          {authError && (
            <Alert
              severity="error"
              sx={{ margin: 0, borderRadius: 0 }}
              onClose={() => dispatch({ type: 'auth/clearError' })}
            >
              {authError}
            </Alert>
          )}

          <Routes>
            {/* Public Routes (Authentication) */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AuthLayout>
                    <LoginPage />
                  </AuthLayout>
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      {/* Dashboard */}
                      <Route path="/dashboard" element={<DashboardPage />} />

                      {/* Forms */}
                      <Route path="/forms" element={<FormsPage />} />
                      <Route path="/forms/:formId" element={<FormDetailPage />} />
                      <Route
                        path="/forms/:formId/edit/:reportingPeriod"
                        element={<FormEditorPage />}
                      />

                      {/* XBRL */}
                      <Route path="/xbrl" element={<XBRLPage />} />

                      {/* Institution Management */}
                      <Route path="/institution" element={<InstitutionPage />} />

                      {/* User Management (Admin only) */}
                      <Route
                        path="/users"
                        element={
                          <ProtectedRoute requiredRole={['admin', 'compliance_officer']}>
                            <UsersPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Settings */}
                      <Route path="/settings" element={<SettingsPage />} />

                      {/* Default redirect */}
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />

                      {/* 404 Page */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to login if not authenticated */}
            <Route
              path="*"
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              }
            />
          </Routes>
        </Box>
      </Router>
    </ErrorBoundary>
  );
};

export default App;