import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, APPROVAL_STATUS } from './AuthContext';
import { notify } from '@/components/ui/sonner';
import { APP_CONFIG } from '@/lib/config';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile, user, forceCorrectProfile, isApproved, isPending, isRejected, userProfile } = useAuth();

  // Add department caching to avoid repeated fetches
  const [cachedDepartment, setCachedDepartment] = useState<any>(null);

  // Optimized fetch profile function to avoid redundant calls
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("PERF DEBUG: Starting profile fetch at", new Date().toISOString());
      
      // First check if we already have the data cached
      if (cachedDepartment) {
        console.log("PERF DEBUG: Using cached department data");
        return cachedDepartment;
      }
      
      // Fetch user profile with department in a single query with timeout
      console.log("PERF DEBUG: Fetching profile data from database");
      const fetchPromise = supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (
            name, 
            department_code
          )
        `)
        .eq('id', userId)
        .single();
        
      // Set up a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Department fetch timed out')), 5000);
      });
      
      // Race between the fetch and the timeout
      const { data: profileData, error: profileError } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          throw new Error('Department fetch timed out');
        })
      ]);
      
      if (profileError) {
        console.error('PERF DEBUG: Error fetching user profile:', profileError);
        throw profileError;
      }
      
      console.log("PERF DEBUG: Profile fetch completed at", new Date().toISOString());
      
      // Cache the result for future use
      setCachedDepartment(profileData);
      
      return profileData;
    } catch (error) {
      console.error('PERF DEBUG: Error in fetchUserProfile:', error);
      throw error;
    }
  };

  const handleNavigation = async () => {
    console.log('PERF DEBUG: Handling navigation after login at', new Date().toISOString());
    
    // Check for a redirect path in location state
    const redirectPath = location.state?.from?.pathname;
    
    // First check if user's account requires approval
    if (isPending()) {
      console.log('User account requires approval - redirecting to pending page');
      navigate('/auth/pending-approval', { replace: true });
      return;
    }
    
    if (isRejected()) {
      console.log('User account was rejected - redirecting to rejected page');
      navigate('/auth/rejected-approval', { replace: true });
      return;
    }
    
    // Only proceed with normal navigation if the user is approved
    if (!isApproved()) {
      console.log('User account is not approved - not allowing dashboard access');
      navigate('/auth/login', { replace: true });
      notify.error('Account status issue', {
        description: 'There appears to be a problem with your account status. Please contact support.'
      });
      return;
    }
    
    if (redirectPath) {
      console.log(`Redirecting to saved path: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
      return;
    }

    try {
      // Log the current user ID to verify
      console.log('PERF DEBUG: Current user ID for profile lookup:', user?.id);
      
      if (!user?.id) {
        console.error('PERF DEBUG: No user ID available for profile lookup');
        navigate('/profile');
        return;
      }
      
      // Use the optimized fetch function
      const profileData = await fetchUserProfile(user.id);

      // Log the full profile data to see what's being returned
      console.log('PERF DEBUG: Profile data retrieved at', new Date().toISOString());

      const role = profileData?.role?.toLowerCase();
      const departmentCode = profileData?.departments?.department_code;
      const departmentId = profileData?.department_id;

      console.log(`User role: ${role}, Department Code: ${departmentCode}, Department ID: ${departmentId}`);

      // Special handling for CEO users - HIGHEST PRIORITY
      if (role === 'ceo' || departmentCode === 'CEO') {
        console.log('CEO user detected - redirecting to CEO dashboard');
        navigate(APP_CONFIG.DASHBOARDS.CEO, { replace: true });
        notify.success('Welcome back, CEO!', { 
          description: 'You have been logged in to your executive dashboard.' 
        });
        return; // Return early to ensure other conditions aren't evaluated
      } else if (role === 'secretary') {
        console.log('Secretary role detected - navigating to secretary dashboard');
        navigate(APP_CONFIG.DASHBOARDS.SECRETARY);
      } else if (role === 'finance') {
        console.log('Finance role detected - navigating to finance dashboard');
        navigate(APP_CONFIG.DASHBOARDS.FINANCE);
      } else if (role === 'business_management') {
        console.log('Business management role detected - navigating to BM dashboard');
        navigate(APP_CONFIG.DASHBOARDS.BUSINESS_MANAGEMENT);
      } else if (role === 'auditor') {
        console.log('Auditor role detected - navigating to auditor dashboard');
        navigate(APP_CONFIG.DASHBOARDS.AUDITOR);
      } else if (role === 'welfare') {
        console.log('Welfare role detected - navigating to welfare dashboard');
        navigate(APP_CONFIG.DASHBOARDS.WELFARE);
      } else if (role === 'board_member') {
        console.log('Board member role detected - navigating to board member dashboard');
        navigate(APP_CONFIG.DASHBOARDS.BOARD_MEMBER);
      } else if (departmentId) {
        console.log(`Regular user with department ${departmentId} - navigating to department dashboard`);
        navigate(`/dashboard/department/${departmentId}`);
      } else {
        console.log('No role or department found - defaulting to profile page');
        navigate(APP_CONFIG.DASHBOARDS.DEFAULT);
      }
    } catch (error) {
      console.error('PERF DEBUG: Error during navigation:', error);
      notify.error('Could not load your department information', {
        description: 'Please try again or contact support if the problem persists'
      });
      navigate('/profile');
    }
  };

  useEffect(() => {
    if (!loginSuccess || !user) return;

    const handleSuccessfulLogin = async () => {
      try {
        console.log("LOGIN DEBUG: User authenticated, user ID:", user.id, "email:", user.email);
        console.log("PERF DEBUG: Login success at", new Date().toISOString());
        
        // Clear login state immediately to prevent repeated processing
        setLoginSuccess(false);
        
        // Add a timeout to the entire login process
        const loginTimeout = setTimeout(() => {
          console.log('LOGIN DEBUG: Login sequence taking too long, forcing navigation to pending approval');
          setIsLoading(false);
          // Force navigate to pending approval as a fallback
          navigate('/auth/pending-approval', { replace: true });
          notify.info('Login process is taking longer than expected', { 
            description: 'We have directed you to the pending approval page as a precaution.'
          });
        }, 5000);
        
        try {
          // Since we have profile fetch issues, use a direct check for user role
          console.log("LOGIN DEBUG: Checking directly for user role from auth metadata");
          
          // Get user role directly from auth
          const { data: authUser } = await supabase.auth.getUser();
          const userMetadata = authUser?.user?.user_metadata || {};
          
          console.log("LOGIN DEBUG: Auth metadata:", userMetadata);
          
          const role = userMetadata.role || '';
          const approvalStatus = userMetadata.approval_status || APPROVAL_STATUS.PENDING;
          const isCEO = (userMetadata.role === 'ceo') || 
                        (userMetadata.department_code === 'CEO');
          
          console.log("LOGIN DEBUG: User details from metadata - Role:", role, "Approval:", approvalStatus, "Is CEO:", isCEO);
          
          // For new users or pending approval users, send to pending page
          // ONLY exception is the CEO who can bypass approval
          if (approvalStatus === APPROVAL_STATUS.PENDING && !isCEO) {
            console.log('LOGIN DEBUG: User account requires approval - redirecting to pending page');
            clearTimeout(loginTimeout);
            navigate('/auth/pending-approval', { replace: true });
            notify.info('Your account is pending approval by an administrator');
            return;
          }
          
          if (approvalStatus === APPROVAL_STATUS.REJECTED) {
            console.log('LOGIN DEBUG: User account was rejected - redirecting to rejected page');
            clearTimeout(loginTimeout);
            navigate('/auth/rejected-approval', { replace: true });
            return;
          }
          
          // User is approved - determine dashboard based on role
          console.log("LOGIN DEBUG: User approved, determining dashboard");
          
          // For CEO users, always go to the CEO dashboard
          if (isCEO) {
            console.log("LOGIN DEBUG: CEO role confirmed - navigating to CEO dashboard");
            clearTimeout(loginTimeout);
            navigate(APP_CONFIG.DASHBOARDS.CEO, { replace: true });
            notify.success('Welcome back, CEO!');
            return;
          }
          
          // Try to refresh profile but don't wait indefinitely
          try {
            console.log("LOGIN DEBUG: Attempting to refresh profile");
            
            // Skip to navigation if profile refresh takes too long
            const refreshTimeout = setTimeout(() => {
              console.log("LOGIN DEBUG: Profile refresh timeout, proceeding with navigation");
              clearTimeout(loginTimeout);
              handleNavigation();
            }, 3000);
            
            await refreshProfile();
            
            clearTimeout(refreshTimeout);
            console.log("LOGIN DEBUG: Profile refreshed successfully");
          } catch (refreshError) {
            console.error("LOGIN DEBUG: Error refreshing profile:", refreshError);
          }
          
          // For all other approved users, use handleNavigation to go to appropriate dashboard
          console.log("LOGIN DEBUG: Calling handleNavigation for approved user");
          clearTimeout(loginTimeout);
          handleNavigation();
        } catch (error) {
          console.error("LOGIN DEBUG: Error in login sequence:", error);
          clearTimeout(loginTimeout);
          notify.error('Login problem detected', {
            description: 'Redirecting you to the pending approval page'
          });
          navigate('/auth/pending-approval', { replace: true });
        }
      } catch (error) {
        console.error("LOGIN DEBUG: Critical error during post-login process:", error);
        notify.error('There was a problem loading your profile. Please try again.');
        navigate('/auth/pending-approval', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    handleSuccessfulLogin();
  }, [loginSuccess, user, refreshProfile, navigate, forceCorrectProfile, userProfile, handleNavigation]);

  // Simplified handleSubmit to mark login as successful and let useEffect handle the rest
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      notify.warning('Please enter your email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('LOGIN DEBUG: Attempting sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('LOGIN DEBUG: Login error:', error);
        notify.authError(error.message || 'Invalid login credentials');
        setIsLoading(false);
        return;
      }
      
      console.log('LOGIN DEBUG: Auth successful, redirecting to pending approval page');
      notify.authSuccess('Signed in successfully');
      
      // Immediately redirect to pending approval - profile loading will happen in background
      setIsLoading(false);
      
      // Force redirect with window.location to ensure it works across environments
      window.location.href = '/auth/pending-approval';
      
      // The line below might not execute due to the redirect above
      setLoginSuccess(true);
      
    } catch (error: any) {
      console.error('LOGIN DEBUG: Unexpected error during login:', error);
      notify.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
        </label>
          <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-all duration-300 ease-in-out placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:ring-offset-0"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
            <Link to="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-all duration-300 ease-in-out placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:ring-offset-0"
            placeholder="•••••••••••"
            required
          />
        </div>
      </div>

        <div className="pt-2">
          <button
          type="submit"
          disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
        >
          {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
      </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
          Sign up
        </Link>
          </p>
      </div>
    </form>
    </div>
  );
};

export default LoginForm;
