import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { debounce } from 'lodash';
import { notify } from '@/components/ui/sonner';

// Map roles to their dashboard routes for better navigation
export const roleToDashboardMap: Record<string, string> = {
  ceo: '/dashboard/ceo',
  secretary: '/dashboard/sec',
  finance: '/dashboard/fin',
  business_management: '/dashboard/bm',
  auditor: '/dashboard/aud',
  welfare: '/dashboard/wel',
  board_member: '/dashboard/bmem',
  user: '/dashboard/profile',
  admin: '/dashboard/ceo', // Admins get CEO view
};

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, userProfile, userRole, loading, refreshProfile } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const componentMounted = useRef(true);
  
  // Refresh user profile if authenticated but missing role or profile data
  useEffect(() => {
    if (user && !loading && (!userRole || !userProfile) && componentMounted.current) {
      // Debounce to prevent multiple refreshes
      const debouncedRefresh = debounce(async () => {
        if (componentMounted.current) {
          try {
            await refreshProfile();
            console.log('RoleBasedRoute: Profile refreshed');
          } catch (e) {
            console.error('RoleBasedRoute: Failed to refresh profile:', e);
          }
        }
      }, 500);
      
      debouncedRefresh();
      return () => debouncedRefresh.cancel();
    }
  }, [user, userRole, userProfile, loading, refreshProfile]);
  
  // Memoize the role check to avoid unnecessary calculations
  const { hasPermission, redirectPath } = useMemo(() => {
    // Get role with fallback to 'user'
    const currentRole = userRole || 'user';

    // Check if user's role is allowed
    const hasAccess = allowedRoles.includes(currentRole) || 
                      allowedRoles.includes('*') || 
                      currentRole === 'admin';
    
    // Determine redirect path based on role and department
    let redirectTo;
    
    if (roleToDashboardMap[currentRole]) {
      // Role-based path for special roles
      redirectTo = roleToDashboardMap[currentRole];
    } else if (userProfile?.departmentId) {
      // Department-based path for regular users
      redirectTo = `/dashboard/department/${userProfile.departmentId}`;
    } else {
      // Fallback to profile page
      redirectTo = '/dashboard/profile';
    }
    
    console.log('RoleBasedRoute: Access check:', { 
      currentRole, 
      departmentId: userProfile?.departmentId,
      hasAccess, 
      allowedRoles: JSON.stringify(allowedRoles),
      redirectTo 
    });
    
    return { 
      hasPermission: hasAccess,
      redirectPath: redirectTo
    };
  }, [userRole, userProfile, allowedRoles]);
  
  // Track component mount state
  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // After authentication loading completes, update our local state once
  useEffect(() => {
    if (!loading && componentMounted.current) {
      setAuthChecked(true);
      setCheckComplete(true);
    }
  }, [loading]);

  // Show loading spinner while auth state is being determined
  if (loading || !authChecked || !checkComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Verifying permissions...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('RoleBasedRoute: User not authenticated, redirecting to login');
    // Avoid showing toast if this is an initial page load without auth
    if (authChecked) {
      notify.warning('Please sign in to access this page', {
        description: "You'll need to authenticate to view this content"
      });
    }
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // If user doesn't have permission, redirect to their dashboard
  if (!hasPermission) {
    console.log(`RoleBasedRoute: User with role '${userRole}' and department '${userProfile?.departmentId}' doesn't have permission, redirecting to ${redirectPath}`);
    
    // Show unauthorized message if this isn't just a general dashboard redirect
    // Only show toast if we're actually changing paths, not in a redirect loop
    if (location.pathname !== redirectPath) {
      notify.error(`You don't have permission to access this page`, {
        description: "Your current role doesn't have the necessary permissions"
      });
      return <Navigate to={redirectPath} replace />;
    }
    
    // If redirect path is the same as current path, it's a configuration error
    // Just render the children but log error (better UX than redirect loop)
    console.error('RoleBasedRoute: Caught potential redirect loop:', { 
      currentPath: location.pathname, 
      redirectPath, 
      role: userRole,
      departmentId: userProfile?.departmentId
    });
  }

  // User has permission, render the children
  return <>{children}</>;
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(RoleBasedRoute); 