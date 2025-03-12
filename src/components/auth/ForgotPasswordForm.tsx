
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the COMPLETE domain for proper redirect (including protocol)
      const currentDomain = window.location.origin;
      console.log('Reset password redirect domain:', currentDomain);
      
      // Send password reset email using Supabase with the correct redirect URL
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${currentDomain}/auth/login`,
      });
      
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      
      // Log the password reset request in the audit logs
      const { error: auditError } = await supabase.rpc('log_audit_event', {
        action: 'PASSWORD_RESET_REQUESTED',
        entity_type: 'USER',
        entity_id: '00000000-0000-0000-0000-000000000000', // We don't know the user ID yet
        details: JSON.stringify({ email })
      });

      if (auditError) {
        console.error('Failed to log audit event:', auditError);
        // Don't fail the reset process if audit logging fails
      }
      
      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
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
              {isLoading ? 'Sending...' : 'Send reset link'}
            </motion.button>
          </div>

          <div className="text-center text-sm">
            <Link to="/auth/login" className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-100">Check your email</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            We've sent a password reset link to {email}
          </p>
          <div className="mt-6">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/auth/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to sign in
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
