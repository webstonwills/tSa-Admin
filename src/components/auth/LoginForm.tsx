
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page that the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !departmentId) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, check if the department code is valid
      const departmentCode = departmentId.split('-')[0]?.toUpperCase();
      
      if (!departmentCode) {
        toast.error('Invalid department ID format. Expected format: XXX-1234');
        setIsLoading(false);
        return;
      }
      
      const { data: departmentData, error: departmentError } = await supabase
        .from('departments')
        .select('id')
        .eq('department_code', departmentCode)
        .maybeSingle();
      
      if (departmentError || !departmentData) {
        toast.error('Invalid department ID');
        setIsLoading(false);
        return;
      }

      // Try to sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Check if user has the correct department in their profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('department_id, role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        toast.error('Failed to fetch user profile');
        setIsLoading(false);
        return;
      }

      // Update the user's department if not set or if different
      if (!profileData.department_id || profileData.department_id !== departmentData.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ department_id: departmentData.id })
          .eq('id', data.user.id);
        
        if (updateError) {
          toast.error('Failed to update user department');
          setIsLoading(false);
          return;
        }
      }

      // Log the successful login action
      await supabase.rpc('log_audit_event', {
        action: 'LOGIN',
        entity_type: 'USER',
        entity_id: data.user.id,
        details: JSON.stringify({
          email: email,
          department_code: departmentCode
        })
      });

      toast.success('Login successful');
      
      // Navigate to the appropriate dashboard based on department code
      // Convert departmentCode to lowercase for the URL
      navigate(`/dashboard/${departmentCode.toLowerCase()}`);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Department ID
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="departmentId"
            name="departmentId"
            type="text"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter your department ID (e.g., CEO-1234, TRE-5678)"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link to="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`flex w-full justify-center rounded-md border border-transparent py-2.5 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : null}
          {isLoading ? 'Signing in...' : 'Sign in'}
        </motion.button>
      </div>

      <div className="text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Don't have an account?</span>{' '}
        <Link to="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Sign up
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
