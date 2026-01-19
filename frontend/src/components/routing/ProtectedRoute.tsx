import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that redirects unauthenticated users to login
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <PageLoader message="Authenticating..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for public pages (login/signup) that redirects authenticated users to dashboard
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <PageLoader message="Loading..." />
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    // Check if there's a redirect location from a previous navigation
    const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
