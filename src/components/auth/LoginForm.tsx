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

  // Add comment above useEffect that handles loginSuccess
  // This useEffect handles navigation after successful login as a fallback mechanism
  // It should rarely be triggered with the direct navigation approach implemented in handleSubmit
  useEffect(() => {
    if (loginSuccess) {
      console.log('LOGIN DEBUG: useEffect navigation triggered');
      // Clear the login in progress flag
      localStorage.removeItem('tsa_login_in_progress');
      
      // Get cached role info
      const cachedRole = localStorage.getItem('tsa_user_role');
      
      if (cachedRole === 'ceo') {
        console.log('LOGIN DEBUG: useEffect - CEO role detected');
        navigate(APP_CONFIG.DASHBOARDS.CEO, { replace: true });
      } else {
        // For all other roles, we use the profile page logic
        console.log('LOGIN DEBUG: useEffect - Default navigation to profile');
        navigate('/profile', { replace: true });
      }
    }
  }, [loginSuccess, navigate]);

  // Enhanced version of handleSubmit that handles login more efficiently
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      notify.warning('Please enter your email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('LOGIN DEBUG: Attempting sign in with email:', email);
      
      // Clear previous errors
      localStorage.removeItem('tsa_login_error');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('LOGIN DEBUG: Login error:', error);
        localStorage.setItem('tsa_login_error', error.message);
        notify.authError(error.message || 'Invalid login credentials');
        setIsLoading(false);
        return;
      }

      // Get metadata from the auth response
      const userMetadata = data.user?.user_metadata || {};
      const role = userMetadata.role || '';
      const approvalStatus = userMetadata.approval_status || APPROVAL_STATUS.PENDING;
      const departmentCode = userMetadata.department_code;
      const isCEO = (role === 'ceo') || (departmentCode === 'CEO');
      
      console.log('LOGIN DEBUG: User metadata:', userMetadata);
      console.log('LOGIN DEBUG: Role:', role, 'Department:', departmentCode, 'isCEO:', isCEO);
      
      // Cache auth data for faster loading
      localStorage.setItem('tsa_user_role', isCEO ? 'ceo' : role);
      localStorage.setItem('tsa_user_status', approvalStatus);
      
      // Authentication successful
      console.log('LOGIN DEBUG: Auth successful, redirecting based on role:', role);
      notify.authSuccess('Signed in successfully');
      
      // Set flag to indicate login is in progress
      localStorage.setItem('tsa_login_in_progress', 'true');
      
      // For CEO users, directly navigate to dashboard without waiting for profile
      if (isCEO) {
        console.log('LOGIN DEBUG: CEO user detected, redirecting directly to CEO dashboard');
        
        // Set a short timeout to ensure notification is visible before navigation
        setTimeout(() => {
          setIsLoading(false);
          navigate(APP_CONFIG.DASHBOARDS.CEO, { replace: true });
        }, 800);
        
        return;
      }
      
      // For non-CEO users, we need to check if they have a department and role in the database
      // before setting the login success
      try {
        // Get user profile from database to check approval status directly
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
          .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
          console.error('LOGIN DEBUG: Error fetching profile:', profileError);
          setTimeout(() => {
            setLoginSuccess(true); // Fall back to useEffect navigation
        setIsLoading(false);
          }, 800);
        return;
      }

        console.log('LOGIN DEBUG: Profile data from DB:', profileData);
        
        const dbRole = profileData.role;
        const dbApprovalStatus = profileData.approval_status;
        const dbDepartmentId = profileData.department_id;
        
        console.log('LOGIN DEBUG: DB role:', dbRole, 'DB approval:', dbApprovalStatus);
        
        // Handle redirection based on actual database values
        if (dbApprovalStatus === 'approved' && dbRole) {
          console.log('LOGIN DEBUG: User is approved with role:', dbRole);
          
          // Direct navigation based on role
          const roleLower = dbRole.toLowerCase();
          
          setTimeout(() => {
            setIsLoading(false);
            
            if (roleLower === 'secretary') {
              console.log('LOGIN DEBUG: Secretary role detected, redirecting');
              navigate(APP_CONFIG.DASHBOARDS.SECRETARY, { replace: true });
            } else if (roleLower === 'finance') {
              console.log('LOGIN DEBUG: Finance role detected, redirecting');
              navigate(APP_CONFIG.DASHBOARDS.FINANCE, { replace: true });
            } else if (roleLower === 'business_management') {
              console.log('LOGIN DEBUG: Business Management role detected, redirecting');
              navigate(APP_CONFIG.DASHBOARDS.BUSINESS_MANAGEMENT, { replace: true });
            } else if (roleLower === 'auditor') {
              console.log('LOGIN DEBUG: Auditor role detected, redirecting');
              navigate(APP_CONFIG.DASHBOARDS.AUDITOR, { replace: true });
            } else if (roleLower === 'welfare') {
              console.log('LOGIN DEBUG: Welfare role detected, redirecting');
              navigate(APP_CONFIG.DASHBOARDS.WELFARE, { replace: true });
            } else if (roleLower === 'board_member') {
              console.log('LOGIN DEBUG: Board Member role detected, redirecting');
              navigate(APP_CONFIG.DASHBOARDS.BOARD_MEMBER, { replace: true });
            } else if (dbDepartmentId) {
              console.log(`LOGIN DEBUG: User has department ID ${dbDepartmentId}, redirecting`);
              navigate(`/dashboard/department/${dbDepartmentId}`, { replace: true });
            } else {
              navigate(APP_CONFIG.DASHBOARDS.DEFAULT, { replace: true });
            }
          }, 800);
          
          return;
        } else if (dbApprovalStatus === 'pending') {
          setTimeout(() => {
            setIsLoading(false);
            navigate('/auth/pending-approval', { replace: true });
          }, 800);
          return;
        } else if (dbApprovalStatus === 'rejected') {
          setTimeout(() => {
          setIsLoading(false);
            navigate('/auth/rejected-approval', { replace: true });
          }, 800);
          return;
        }
        
        // If we get here, use the standard login flow
        setTimeout(() => {
          setLoginSuccess(true);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('LOGIN DEBUG: Error in direct navigation check:', error);
        // Fall back to useEffect navigation
        setTimeout(() => {
          setLoginSuccess(true);
          setIsLoading(false);
        }, 800);
      }
    } catch (error: any) {
      console.error('LOGIN DEBUG: Unexpected error during login:', error);
      notify.error('An unexpected error occurred');
      localStorage.setItem('tsa_login_error', 'Unexpected error during login');
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
