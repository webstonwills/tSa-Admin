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

  // Remove the handleNavigation function and its useEffect
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        notify.authError(error.message || 'Invalid login credentials');
        setIsLoading(false);
        return;
      }
      
      // Get user profile with department info in a single query
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (
            name, 
            department_code
          )
        `)
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setIsLoading(false);
        return;
      }
      
      const role = profileData?.role?.toLowerCase();
      const departmentCode = profileData?.departments?.department_code;
      const departmentId = profileData?.department_id;
      const approvalStatus = profileData?.approval_status;
      
      // Handle redirection based on approval status first
      if (approvalStatus === 'pending') {
        navigate('/auth/pending-approval', { replace: true });
        return;
      }
      
      if (approvalStatus === 'rejected') {
        navigate('/auth/rejected-approval', { replace: true });
        return;
      }
      
      if (approvalStatus !== 'approved') {
        notify.error('Account not approved', {
          description: 'Your account is not approved. Please contact support.'
        });
        return;
      }
      
      // Handle redirection based on role and department
      notify.authSuccess('Signed in successfully');
      
      // Special handling for CEO users
      if (role === 'ceo' || departmentCode === 'CEO') {
        navigate(APP_CONFIG.DASHBOARDS.CEO, { replace: true });
        notify.success('Welcome back, CEO!', { 
          description: 'You have been logged in to your executive dashboard.' 
        });
      } else if (role === 'secretary') {
        navigate(APP_CONFIG.DASHBOARDS.SECRETARY, { replace: true });
      } else if (role === 'finance') {
        navigate(APP_CONFIG.DASHBOARDS.FINANCE, { replace: true });
      } else if (role === 'business_management') {
        navigate(APP_CONFIG.DASHBOARDS.BUSINESS_MANAGEMENT, { replace: true });
      } else if (role === 'auditor') {
        navigate(APP_CONFIG.DASHBOARDS.AUDITOR, { replace: true });
      } else if (role === 'welfare') {
        navigate(APP_CONFIG.DASHBOARDS.WELFARE, { replace: true });
      } else if (role === 'board_member') {
        navigate(APP_CONFIG.DASHBOARDS.BOARD_MEMBER, { replace: true });
      } else if (departmentId) {
        navigate(`/dashboard/department/${departmentId}`, { replace: true });
      } else {
        navigate(APP_CONFIG.DASHBOARDS.DEFAULT, { replace: true });
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
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
