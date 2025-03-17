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

  const handleNavigation = async () => {
    console.log('Handling navigation after login');
    
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
      console.log('Current user ID for profile lookup:', user?.id);
      
      // Fetch user profile to determine their role and department
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          departments:department_id (
            name, 
            department_code
          )
        `)
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        notify.error('Error loading your profile');
        navigate('/profile');
        return;
      }

      // Log the full profile data to see what's being returned
      console.log('Full profile data retrieved:', profileData);

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
      console.error('Error during navigation:', error);
      navigate('/profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      notify.warning('Please enter your email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting sign in with email:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        notify.authError(error.message || 'Invalid login credentials');
        setIsLoading(false);
        return;
      }

      setLoginSuccess(true);
      notify.authSuccess('Signed in successfully');
      // Don't call refreshProfile or navigate here - let useEffect handle it
      
    } catch (error: any) {
      console.error('Unexpected error during login:', error);
      notify.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loginSuccess || !user) return;

    const handleSuccessfulLogin = async () => {
      try {
        console.log("User authenticated, refreshing profile...");
        // Add a longer delay to ensure auth state is properly updated
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await refreshProfile();
        
        // Get profile directly from the database to ensure we have the latest data
        const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
          .select(`
            *,
            departments:department_id (
              name, 
              department_code
            )
          `)
          .eq('id', user.id)
        .single();
      
      if (profileError) {
          console.error("Error fetching latest profile:", profileError);
          
          // Check if this might be an email mismatch issue
          if (profileError.code === 'PGRST116') {
            console.log("Profile not found, attempting to force-match profile...");
            const fixSuccess = await forceCorrectProfile();
            
            if (fixSuccess) {
              console.log("Profile successfully matched and fixed");
              // Redirecting based on fixed profile
              handleNavigation();
              return;
            } else {
              console.error("Failed to match profile");
              notify.error('Profile matching failed', {
                description: 'There was a problem with your profile. Please contact support.'
              });
            }
          }
          
          notify.error('Problem loading your profile data');
          navigate('/dashboard/profile'); // Redirect to profile page instead of debug
        return;
      }

        console.log("Latest profile from database:", currentProfile);
        
        // Get approval status from user profile which has proper defaults set
        const approvalStatus = userProfile?.approvalStatus || APPROVAL_STATUS.PENDING;
        const isCEO = currentProfile?.departments?.department_code === 'CEO' || currentProfile?.role === 'ceo';
        
        if (approvalStatus === APPROVAL_STATUS.PENDING && !isCEO) {
          console.log('User account requires approval - redirecting to pending page');
          navigate('/auth/pending-approval', { replace: true });
          setIsLoading(false);
          setLoginSuccess(false);
          return;
        }
        
        if (approvalStatus === APPROVAL_STATUS.REJECTED) {
          console.log('User account was rejected - redirecting to rejected page');
          navigate('/auth/rejected-approval', { replace: true });
          setIsLoading(false);
          setLoginSuccess(false);
          return;
        }
        
        // Check for CEO role in multiple ways
        const isCEOFromProfile = 
          (currentProfile?.role?.toLowerCase() === 'ceo') || 
          (currentProfile?.departments?.department_code === 'CEO');
        
        console.log("Is CEO check result:", isCEOFromProfile, "Role:", currentProfile?.role, "Department code:", currentProfile?.departments?.department_code);
        
        // Check if email matches
        if (user.email !== currentProfile.email) {
          console.warn(`Email mismatch detected: Auth email (${user.email}) doesn't match profile email (${currentProfile.email})`);
          console.log("Attempting to force-match profile...");
          
          const fixSuccess = await forceCorrectProfile();
          if (fixSuccess) {
            console.log("Profile successfully matched and fixed");
            // Continue with navigation
          } else {
            console.error("Failed to match profile");
            notify.warning('Profile data inconsistency detected', {
              description: 'We\'ve detected an issue with your profile. Your data will be automatically corrected.'
            });
          }
        }
        
        // For CEO users, always go to the CEO dashboard
        if (isCEOFromProfile) {
          console.log("CEO role confirmed - navigating to CEO dashboard");
          navigate(APP_CONFIG.DASHBOARDS.CEO, { replace: true });
          notify.success('Welcome back, CEO!');
          return;
        }
        
        // Use the handleNavigation function for all other roles
        handleNavigation();
    } catch (error) {
        console.error("Error during post-login process:", error);
        notify.error('There was a problem loading your profile. Please try again.');
        // Fallback to profile page if there was an error
        navigate('/dashboard/profile');
    } finally {
      setIsLoading(false);
        setLoginSuccess(false);
    }
  };

    handleSuccessfulLogin();
  }, [loginSuccess, user, refreshProfile, navigate, handleNavigation, supabase, forceCorrectProfile, userProfile]);

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
