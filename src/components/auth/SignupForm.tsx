import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Lock, Building2, Check, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { notify } from '@/components/ui/sonner';
import { COMPANY_VERIFICATION } from '@/lib/config';
import { APPROVAL_STATUS } from './AuthContext';

// Define department interface
interface Department {
  id: string;
  name: string;
  department_code: string;
}

// Password requirement interface
interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}

const SignupForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [companyKey, setCompanyKey] = useState('');
  const [showCompanyKeyField, setShowCompanyKeyField] = useState(false);
  const [isCEODepartment, setIsCEODepartment] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  // Define password requirements
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    {
      id: 'length',
      label: 'At least 8 characters',
      validator: (password) => password.length >= 8,
      met: false
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      validator: (password) => /[A-Z]/.test(password),
      met: false
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      validator: (password) => /[a-z]/.test(password),
      met: false
    },
    {
      id: 'number',
      label: 'Contains a number',
      validator: (password) => /[0-9]/.test(password),
      met: false
    },
    {
      id: 'special',
      label: 'Contains special character',
      validator: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      met: false
    }
  ]);

  // Check if all password requirements are met
  const allPasswordRequirementsMet = passwordRequirements.every(req => req.met);
  
  // Calculate password strength percentage
  const passwordStrength = password 
    ? Math.min(100, Math.round((passwordRequirements.filter(req => req.met).length / passwordRequirements.length) * 100))
    : 0;

  // Get strength label based on percentage
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 80) return 'Moderate';
    if (passwordStrength < 100) return 'Strong';
    return 'Very Strong';
  };

  // Get strength color based on percentage
  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 60) return 'bg-orange-500';
    if (passwordStrength < 80) return 'bg-yellow-500';
    if (passwordStrength < 100) return 'bg-lime-500';
    return 'bg-green-500';
  };

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Check password requirements whenever password changes
  useEffect(() => {
    const updatedRequirements = passwordRequirements.map(req => ({
      ...req,
      met: req.validator(password)
    }));
    setPasswordRequirements(updatedRequirements);
  }, [password]);

  // Add a useEffect to check if the selected department is CEO
  useEffect(() => {
    if (!departmentId || departments.length === 0) return;
    
    const selectedDepartment = departments.find(dept => dept.id === departmentId);
    const isCEO = selectedDepartment?.department_code === 'CEO';
    
    setIsCEODepartment(isCEO);
    setShowCompanyKeyField(isCEO);
    
    // Reset company key if not CEO department
    if (!isCEO) {
      setCompanyKey('');
    }
  }, [departmentId, departments]);

  // Fetch departments function
  const fetchDepartments = async () => {
    setIsDepartmentsLoading(true);
    
    try {
      console.log('Fetching departments from Supabase...');
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, department_code')
        .order('name');
      
      if (error) {
        console.error('Error fetching departments:', error);
        notify.error('Failed to load departments. Please try again.');
        return; // Return early without setting departments or changing loading state
      }
      
      if (!data || data.length === 0) {
        console.warn('No departments found in the database');
        // Create fallback departments for testing if none exist
        const fallbackDepartments = [
          { id: '1', name: 'CEO Office', department_code: 'CEO' },
          { id: '2', name: 'Finance', department_code: 'FIN' },
          { id: '3', name: 'Secretary', department_code: 'SEC' },
          { id: '4', name: 'Business Management', department_code: 'BM' },
          { id: '5', name: 'Audit', department_code: 'AUD' },
          { id: '6', name: 'Welfare', department_code: 'WEL' },
          { id: '7', name: 'Board Member', department_code: 'BMEM' }
        ];
        setDepartments(fallbackDepartments);
        console.log('Using fallback departments:', fallbackDepartments);
      } else {
        console.log('Successfully fetched departments:', data);
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error in fetchDepartments:', error);
      notify.error('An unexpected error occurred while loading departments');
    } finally {
      setIsDepartmentsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      notify.warning('Please fill in all required fields');
      return;
    }
    
    if (!departmentId) {
      notify.warning('Please select your department');
      return;
    }

    // Check if all password requirements are met
    if (!allPasswordRequirementsMet) {
      notify.warning('Password does not meet all security requirements');
      return;
    }
    
    // Check for CEO company key
    if (isCEODepartment) {
      if (!companyKey) {
        notify.warning('Company verification key is required for CEO registration');
        return;
      }
      
      // Validate the CEO company key using the config
      if (companyKey !== COMPANY_VERIFICATION.CEO_KEY) {
        notify.error('Invalid company verification key', {
          description: 'The verification key you entered is not valid for CEO registration'
        });
        return;
      }
      
      console.log('CEO verification key validated successfully');
    }
    
    if (password !== confirmPassword) {
      notify.error('Passwords do not match', {
        description: 'Please make sure your passwords match'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get department code for the selected department
      let departmentCode = '';
      const selectedDepartment = departments.find(dept => dept.id === departmentId);
      if (selectedDepartment) {
        departmentCode = selectedDepartment.department_code;
        console.log(`Selected department: ${selectedDepartment.name} with code ${departmentCode}`);
      }

      // Determine role and approval status based on department code right away
      let userRole = 'user';
      let approvalStatus = APPROVAL_STATUS.PENDING;
      
      if (departmentCode === 'CEO') {
        userRole = 'ceo';
        approvalStatus = APPROVAL_STATUS.APPROVED; // CEO users are auto-approved
        console.log('Setting user role as CEO with automatic approval');
      } else if (departmentCode === 'SEC') userRole = 'secretary';
      else if (departmentCode === 'FIN') userRole = 'finance';
      else if (departmentCode === 'BM') userRole = 'business_management';
      else if (departmentCode === 'AUD') userRole = 'auditor';
      else if (departmentCode === 'WEL') userRole = 'welfare';
      else if (departmentCode === 'BMEM') userRole = 'board_member';
      
      console.log(`Signup: User will be created with role: ${userRole}, department: ${departmentId}, departmentCode: ${departmentCode}, approval status: ${approvalStatus}`);
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            department_id: departmentId,
            department_code: departmentCode,
            role: userRole, // Add role to auth metadata
            approval_status: approvalStatus
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        notify.authError(error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      if (!data.user?.id) {
        console.error('No user ID returned from signup');
        notify.error('Failed to create account - no user ID returned');
        setIsLoading(false);
        return;
      }
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        notify.info('This email is already registered', {
          description: 'Please sign in with your existing account'
        });
        navigate('/auth/login');
        return;
      }

      // Success message
      notify.success('Account created successfully!', {
        description: 'Please check your email for verification instructions'
      });
      
      // Set a timeout for profile creation to prevent indefinite loading
      const profileCreationTimeout = setTimeout(() => {
        console.warn('Profile creation timed out');
        notify.info('Your account was created, but profile setup may still be in progress', {
          description: 'You can proceed to login now'
        });
        setIsLoading(false);
        navigate('/auth/login');
      }, 5000); // 5 seconds timeout
      
      // Auto-create profile (backup in case DB trigger fails)
      try {
        // Before insert operation, log the profile data
        console.log('Creating profile with data:', {
          id: data.user?.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          department_id: departmentId,
          role: userRole,
          approval_status: approvalStatus
        });
        
        // Create profile with the role we determined above
        const { data: profileData, error: profileError } = await supabase.from('profiles').insert({
          id: data.user?.id,
              email: email,
          first_name: firstName,
          last_name: lastName,
          department_id: departmentId,
          role: userRole,
          approval_status: approvalStatus
        }).select();
        
        // Clear the timeout since we got a response (success or error)
        clearTimeout(profileCreationTimeout);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Still consider the signup successful even if profile creation fails
          // The DB trigger might have handled it or we can fix it later
          notify.info('Account created, but there was an issue setting up your profile', {
            description: 'You can still proceed to login. Our team will ensure your profile is set up correctly.'
          });
        } else {
          console.log('Profile created successfully:', profileData);
          
          // For CEO users, double-check the role was set correctly
          if (departmentCode === 'CEO') {
            // Verify the role is set to 'ceo'
            const { data: verifyProfile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user?.id)
              .single();
              
            if (verifyProfile?.role !== 'ceo') {
              console.warn('CEO role not set correctly, updating...');
              // Update the role to ensure it's 'ceo'
              await supabase
                .from('profiles')
                .update({ role: 'ceo' })
                .eq('id', data.user?.id);
                
              console.log('CEO role corrected');
            } else {
              console.log('CEO role verified as correctly set');
            }
          }
        }
      } catch (profileError) {
        // Clear the timeout since we caught an error
        clearTimeout(profileCreationTimeout);
        console.warn('Profile creation error (may be handled by DB trigger):', profileError);
        // Still consider the signup successful
        notify.info('Account created, but there was an issue setting up your profile', {
          description: 'You can still proceed to login. Our team will ensure your profile is set up correctly.'
        });
      } finally {
        // Always navigate to login after signup attempt
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      notify.error('An unexpected error occurred during account creation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="firstName" className="block text-xs font-medium text-gray-700">
            First Name
          </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
                className="block w-full pl-8 py-1.5 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="John"
                required
            />
          </div>
        </div>

          <div className="space-y-1">
            <label htmlFor="lastName" className="block text-xs font-medium text-gray-700">
            Last Name
          </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
                className="block w-full pl-8 py-1.5 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Doe"
                required
            />
          </div>
        </div>
      </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-xs font-medium text-gray-700">
            Email Address
        </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-8 py-1.5 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              required
          />
        </div>
      </div>

        <div className="space-y-1">
          <Label htmlFor="department" className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <Building2 className="h-4 w-4 text-gray-400" />
          Department
          </Label>
          {isDepartmentsLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs text-gray-500">Loading departments...</span>
          </div>
          ) : departments.length > 0 ? (
            <Select value={departmentId} onValueChange={setDepartmentId} required>
              <SelectTrigger id="department" className="w-full h-9 text-sm">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent>
            {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id} className="text-sm">
                    {dept.name} ({dept.department_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-500">No departments available. Please try again.</span>
              <button 
                type="button" 
                onClick={fetchDepartments} 
                className="text-blue-500 hover:text-blue-700 text-xs"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {showCompanyKeyField && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            <label htmlFor="companyKey" className="block text-xs font-medium text-gray-700">
              Company Verification Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="companyKey"
                type="password"
                value={companyKey}
                onChange={(e) => setCompanyKey(e.target.value)}
                className="block w-full pl-8 py-1.5 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter verification key"
                required={isCEODepartment}
              />
      </div>
            <p className="text-xs text-amber-600">
              Verification key required for CEO registration.
            </p>
          </motion.div>
        )}

        <div className="space-y-1">
          <label htmlFor="password" className="block text-xs font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className={`block w-full pl-8 pr-10 py-1.5 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                password && !allPasswordRequirementsMet 
                  ? 'border-amber-300 bg-amber-50' 
                  : password && allPasswordRequirementsMet 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
              }`}
              placeholder="•••••••••••"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
                className="text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-700 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
            </button>
            </div>
          </div>
          
          {/* Password requirements checklist */}
          {(passwordFocused || password) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2 shadow-sm"
            >
              {/* Password strength meter - more compact */}
              {password && (
                <div className="mb-2">
                  <div className="flex justify-between items-center">
                    <div className="w-full mr-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${getStrengthColor()} transition-all duration-300 ease-in-out`} 
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${
                      passwordStrength < 40 ? 'text-red-600' : 
                      passwordStrength < 60 ? 'text-orange-600' : 
                      passwordStrength < 80 ? 'text-yellow-600' : 
                      passwordStrength < 100 ? 'text-lime-600' : 
                      'text-green-600'
                    }`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
        </div>
      )}

              {/* More compact requirements grid */}
              <div className="grid grid-cols-2 gap-1">
                {passwordRequirements.map((requirement) => (
                  <div 
                    key={requirement.id} 
                    className={`flex items-center p-1 rounded ${
                      requirement.met ? 'text-green-700' : 'text-gray-500'
                    }`}
                  >
                    {requirement.met ? (
                      <Check className="h-3 w-3 text-green-600 shrink-0 mr-1" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400 shrink-0 mr-1" />
                    )}
                    <span className="text-xs truncate">
                      {requirement.label}
                    </span>
                  </div>
                ))}
          </div>
            </motion.div>
          )}
      </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
          Confirm Password
        </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full pl-8 pr-10 py-1.5 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 bg-red-50'
                  : confirmPassword && password === confirmPassword
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
              }`}
              placeholder="•••••••••••"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                className="text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-700 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
        </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
          )}
      </div>

        <div className="pt-1">
          <button
          type="submit"
            disabled={isLoading || !allPasswordRequirementsMet || password !== confirmPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-gray-400"
        >
          {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
      </div>

        <div className="text-center mt-2">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
          </p>
      </div>
    </form>
    </div>
  );
};

export default SignupForm;
