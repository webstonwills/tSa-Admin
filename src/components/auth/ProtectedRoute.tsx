import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { notify } from '@/components/ui/sonner';

/**
 * ProtectedRoute component that requires authentication to access
 * Will redirect to login if not authenticated
 */
export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const componentMounted = useRef(true);

  // Track component mount state
  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // After loading completes, determine authentication state once
  useEffect(() => {
    if (!loading && componentMounted.current) {
      console.log('Protected route checking auth, user:', user?.id);
      
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    }
  }, [loading, user]);

  if (loading) {
    // Still initializing auth
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Auth check complete - handle redirection
  if (authChecked && !isAuthenticated) {
    // Store current location to redirect back after login
    // Only show toast for interactive navigation, not initial page load
    if (componentMounted.current) {
      notify.warning('Please sign in to access this page', {
        description: "Authentication is required to view this content",
        icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V8C8.00003 8.27614 7.77617 8.5 7.50003 8.5C7.22389 8.5 7.00003 8.27614 7.00003 8V4.5C7.00003 4.22386 7.22389 4 7.50003 4ZM7.5 11C7.77614 11 8 10.7761 8 10.5C8 10.2239 7.77614 10 7.5 10C7.22386 10 7 10.2239 7 10.5C7 10.7761 7.22386 11 7.5 11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>,
      });
    }
    
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Handle authenticated but not yet fully checked scenario
  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Verifying authentication...</p>
      </div>
    );
  }

  // User is authenticated and auth check is complete
  return <Outlet />;
};

// Use memo to prevent unnecessary renders
export default React.memo(ProtectedRoute);
